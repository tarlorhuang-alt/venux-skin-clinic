import "server-only";
import { neon } from "@neondatabase/serverless";

export type AppointmentStatus = "requested" | "confirmed" | "completed" | "cancelled" | "no_show";

export type BookingInput = {
  name: string;
  mobile: string;
  email: string;
  treatment: string;
  clinic: string;
  date: string;
  time: string;
  notes?: string;
};

export type ClientImportRow = {
  group: string;
  name: string;
  dob: string | null;
  mobile: string;
  email: string;
  address: string;
};

function client() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

let clinicTablesReady: Promise<void> | undefined;

export function ensureClinicTables() {
  if (!clinicTablesReady) {
    const sql = client();
    clinicTablesReady = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS venux_clients (
        id BIGSERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        mobile TEXT NOT NULL,
        email TEXT NOT NULL,
        notes TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`ALTER TABLE venux_clients ADD COLUMN IF NOT EXISTS customer_group TEXT NOT NULL DEFAULT 'General'`;
      await sql`ALTER TABLE venux_clients ADD COLUMN IF NOT EXISTS dob DATE`;
      await sql`ALTER TABLE venux_clients ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT ''`;
      await sql`CREATE TABLE IF NOT EXISTS venux_memberships (
        client_id BIGINT PRIMARY KEY REFERENCES venux_clients(id) ON DELETE CASCADE,
        balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
        status TEXT NOT NULL DEFAULT 'inactive',
        joined_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS venux_appointments (
        id BIGSERIAL PRIMARY KEY,
        client_id BIGINT NOT NULL REFERENCES venux_clients(id) ON DELETE RESTRICT,
        clinic TEXT NOT NULL,
        treatment TEXT NOT NULL,
        requested_date DATE NOT NULL,
        requested_time TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'requested',
        deposit_status TEXT NOT NULL DEFAULT 'unpaid',
        deposit_amount INTEGER NOT NULL DEFAULT 45,
        total_amount INTEGER NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
        notes TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE INDEX IF NOT EXISTS venux_clients_email_idx ON venux_clients (LOWER(email))`;
      await sql`CREATE INDEX IF NOT EXISTS venux_clients_mobile_idx ON venux_clients (mobile)`;
      await sql`CREATE INDEX IF NOT EXISTS venux_appointments_date_idx ON venux_appointments (requested_date)`;
    })();
  }
  return clinicTablesReady;
}

export async function createBookingRequest(input: BookingInput) {
  await ensureClinicTables();
  const sql = client();
  const existing = await sql`SELECT id FROM venux_clients WHERE LOWER(email) = LOWER(${input.email}) OR (mobile = ${input.mobile} AND LOWER(full_name)=LOWER(${input.name})) ORDER BY updated_at DESC LIMIT 1`;
  let clientId: number;
  if (existing[0]) {
    clientId = Number(existing[0].id);
    await sql`UPDATE venux_clients SET full_name=${input.name}, mobile=${input.mobile}, email=${input.email}, updated_at=NOW() WHERE id=${clientId}`;
  } else {
    const rows = await sql`INSERT INTO venux_clients (full_name,mobile,email) VALUES (${input.name},${input.mobile},${input.email}) RETURNING id`;
    clientId = Number(rows[0].id);
  }
  const created = await sql`INSERT INTO venux_appointments (client_id,clinic,treatment,requested_date,requested_time,notes)
    VALUES (${clientId},${input.clinic},${input.treatment},${input.date},${input.time},${input.notes ?? ""}) RETURNING id`;
  return Number(created[0].id);
}

export async function getClinicDashboard() {
  await ensureClinicTables();
  const sql = client();
  const [stats, upcoming, recent] = await Promise.all([
    sql`WITH bounds AS (
      SELECT date_trunc('month', CURRENT_DATE)::date AS this_month,
             (date_trunc('month', CURRENT_DATE) - interval '1 month')::date AS last_month
    ) SELECT
      (SELECT COUNT(*) FROM venux_appointments a WHERE a.requested_date >= b.this_month) AS appointments_now,
      (SELECT COUNT(*) FROM venux_appointments a WHERE a.requested_date >= b.last_month AND a.requested_date < b.this_month) AS appointments_last,
      (SELECT COUNT(*) FROM venux_clients c WHERE c.created_at >= b.this_month) AS clients_now,
      (SELECT COUNT(*) FROM venux_clients c WHERE c.created_at >= b.last_month AND c.created_at < b.this_month) AS clients_last,
      (SELECT COALESCE(SUM(a.total_amount),0) FROM venux_appointments a WHERE a.status='completed' AND a.requested_date >= b.this_month) AS revenue_now,
      (SELECT COALESCE(SUM(a.total_amount),0) FROM venux_appointments a WHERE a.status='completed' AND a.requested_date >= b.last_month AND a.requested_date < b.this_month) AS revenue_last,
      (SELECT COUNT(*) FROM venux_appointments a WHERE a.status='no_show' AND a.requested_date >= b.this_month) AS no_shows_now
    FROM bounds b`,
    sql`SELECT a.id,a.requested_date,a.requested_time,a.treatment,a.clinic,a.status,c.full_name,c.mobile
        FROM venux_appointments a JOIN venux_clients c ON c.id=a.client_id
        WHERE a.requested_date >= CURRENT_DATE AND a.status NOT IN ('cancelled','completed')
        ORDER BY a.requested_date,a.requested_time LIMIT 8`,
    sql`SELECT a.id,a.requested_date,a.requested_time,a.treatment,a.status,c.full_name
        FROM venux_appointments a JOIN venux_clients c ON c.id=a.client_id
        ORDER BY a.created_at DESC LIMIT 8`,
  ]);
  const row = stats[0] ?? {};
  return {
    stats: {
      appointmentsNow: Number(row.appointments_now ?? 0), appointmentsLast: Number(row.appointments_last ?? 0),
      clientsNow: Number(row.clients_now ?? 0), clientsLast: Number(row.clients_last ?? 0),
      revenueNow: Number(row.revenue_now ?? 0), revenueLast: Number(row.revenue_last ?? 0),
      noShowsNow: Number(row.no_shows_now ?? 0),
    }, upcoming, recent,
  };
}

export async function getAppointments() {
  await ensureClinicTables();
  return client()`SELECT a.*,c.full_name,c.mobile,c.email FROM venux_appointments a JOIN venux_clients c ON c.id=a.client_id ORDER BY a.requested_date DESC,a.requested_time DESC LIMIT 250`;
}

export async function getClients() {
  await ensureClinicTables();
  return client()`SELECT c.*,m.balance,m.status AS membership_status,m.joined_at,
    COUNT(a.id)::int AS visit_count,MAX(a.requested_date) AS last_visit
    FROM venux_clients c LEFT JOIN venux_memberships m ON m.client_id=c.id
    LEFT JOIN venux_appointments a ON a.client_id=c.id
    GROUP BY c.id,m.balance,m.status,m.joined_at ORDER BY c.updated_at DESC LIMIT 500`;
}

export async function importClientRows(rows: ClientImportRow[]) {
  await ensureClinicTables();
  const sql = client();
  const unique = new Map<string, ClientImportRow>();
  for (const row of rows) {
    const key = row.email ? `e:${row.email.toLowerCase()}` : `p:${row.mobile}|${row.name.toLowerCase().replace(/\s+/g," ")}`;
    if (!unique.has(key)) unique.set(key,row);
  }
  const payload = [...unique.values()];
  if (!payload.length) return { imported:0, processed:0, duplicates:rows.length };
  const json = JSON.stringify(payload);
  await sql`WITH incoming AS (
      SELECT * FROM jsonb_to_recordset(${json}::jsonb) AS x("group" TEXT,name TEXT,dob DATE,mobile TEXT,email TEXT,address TEXT)
    ) UPDATE venux_clients c SET full_name=i.name,
      email=CASE WHEN i.email<>'' THEN i.email ELSE c.email END,
      customer_group=CASE WHEN i."group"<>'' THEN i."group" ELSE c.customer_group END,
      dob=COALESCE(i.dob,c.dob),
      address=CASE WHEN i.address<>'' AND i.address<>'0' THEN i.address ELSE c.address END,
      updated_at=NOW()
    FROM incoming i WHERE (i.email<>'' AND LOWER(c.email)=LOWER(i.email)) OR (c.mobile=i.mobile AND LOWER(c.full_name)=LOWER(i.name))`;
  const inserted = await sql`WITH incoming AS (
      SELECT * FROM jsonb_to_recordset(${json}::jsonb) AS x("group" TEXT,name TEXT,dob DATE,mobile TEXT,email TEXT,address TEXT)
    ) INSERT INTO venux_clients (full_name,mobile,email,customer_group,dob,address)
      SELECT i.name,i.mobile,i.email,COALESCE(NULLIF(i."group",''),'General'),i.dob,CASE WHEN i.address='0' THEN '' ELSE i.address END FROM incoming i
      WHERE NOT EXISTS (SELECT 1 FROM venux_clients c WHERE (i.email<>'' AND LOWER(c.email)=LOWER(i.email)) OR (c.mobile=i.mobile AND LOWER(c.full_name)=LOWER(i.name)))
      RETURNING id`;
  await sql`WITH incoming AS (
      SELECT * FROM jsonb_to_recordset(${json}::jsonb) AS x("group" TEXT,name TEXT,dob DATE,mobile TEXT,email TEXT,address TEXT)
    ) INSERT INTO venux_memberships (client_id,balance,status,joined_at)
      SELECT c.id,0,'active',NOW() FROM incoming i JOIN venux_clients c ON (i.email<>'' AND LOWER(c.email)=LOWER(i.email)) OR (c.mobile=i.mobile AND LOWER(c.full_name)=LOWER(i.name))
      WHERE LOWER(i."group") NOT IN ('','general') ON CONFLICT (client_id) DO UPDATE SET status='active',updated_at=NOW()`;
  return { imported:inserted.length, processed:payload.length, duplicates:rows.length-payload.length };
}

export async function updateAppointment(id: number, status: AppointmentStatus, totalAmount: number, depositStatus: string) {
  await ensureClinicTables();
  await client()`UPDATE venux_appointments SET status=${status},total_amount=${totalAmount},deposit_status=${depositStatus},updated_at=NOW() WHERE id=${id}`;
}

export async function saveMembership(clientId: number, balance: number, status: string) {
  await ensureClinicTables();
  await client()`INSERT INTO venux_memberships (client_id,balance,status,joined_at) VALUES (${clientId},${balance},${status},CASE WHEN ${status}='active' THEN NOW() ELSE NULL END)
    ON CONFLICT (client_id) DO UPDATE SET balance=EXCLUDED.balance,status=EXCLUDED.status,joined_at=COALESCE(venux_memberships.joined_at,EXCLUDED.joined_at),updated_at=NOW()`;
}
