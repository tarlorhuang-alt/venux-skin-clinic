import "server-only";
import { neon } from "@neondatabase/serverless";
import { randomBytes } from "node:crypto";

export type AppointmentStatus = "requested" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";

export type BookingInput = {
  clientId?: number;
  staffId?: number;
  serviceId?: number;
  durationMinutes?: number;
  totalAmount?: number;
  name: string;
  mobile: string;
  email: string;
  treatment: string;
  clinic: string;
  date: string;
  time: string;
  notes?: string;
  source?: "website"|"admin";
  serviceSmsConsent?: boolean;
  marketingSmsConsent?: boolean;
};

export class BookingConflictError extends Error {}

function normaliseMobile(input:string){
  const digits=input.replace(/\D/g,"");
  if(/^04\d{8}$/.test(digits))return `61${digits.slice(1)}`;
  if(/^614\d{8}$/.test(digits))return digits;
  return digits;
}

function timeToMinutes(input:string){
  const match=input.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);if(!match)return null;
  let hour=Number(match[1])%12;if(match[3].toUpperCase()==="PM")hour+=12;return hour*60+Number(match[2]);
}

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
      await sql`ALTER TABLE venux_clients ADD COLUMN IF NOT EXISTS gender TEXT NOT NULL DEFAULT ''`;
      await sql`ALTER TABLE venux_clients ADD COLUMN IF NOT EXISTS occupation TEXT NOT NULL DEFAULT ''`;
      await sql`ALTER TABLE venux_clients ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT NOT NULL DEFAULT ''`;
      await sql`ALTER TABLE venux_clients ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT NOT NULL DEFAULT ''`;
      await sql`ALTER TABLE venux_clients ADD COLUMN IF NOT EXISTS lead_source TEXT NOT NULL DEFAULT ''`;
      await sql`ALTER TABLE venux_clients ADD COLUMN IF NOT EXISTS service_sms_consent BOOLEAN NOT NULL DEFAULT FALSE`;
      await sql`ALTER TABLE venux_clients ADD COLUMN IF NOT EXISTS marketing_sms_consent BOOLEAN NOT NULL DEFAULT FALSE`;
      await sql`ALTER TABLE venux_clients ADD COLUMN IF NOT EXISTS marketing_consent_at TIMESTAMPTZ`;
      await sql`ALTER TABLE venux_clients ADD COLUMN IF NOT EXISTS sms_unsubscribed_at TIMESTAMPTZ`;
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
      await sql`ALTER TABLE venux_appointments ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'website'`;
      await sql`ALTER TABLE venux_appointments ADD COLUMN IF NOT EXISTS confirmation_token TEXT`;
      await sql`ALTER TABLE venux_appointments ADD COLUMN IF NOT EXISTS customer_confirmation_status TEXT NOT NULL DEFAULT 'pending'`;
      await sql`ALTER TABLE venux_appointments ADD COLUMN IF NOT EXISTS confirmed_by_client_at TIMESTAMPTZ`;
      await sql`ALTER TABLE venux_appointments ADD COLUMN IF NOT EXISTS confirmation_message_queued_at TIMESTAMPTZ`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS venux_appointments_confirmation_token_idx ON venux_appointments (confirmation_token) WHERE confirmation_token IS NOT NULL`;
      await sql`CREATE TABLE IF NOT EXISTS venux_booking_slots (
        slot_key TEXT PRIMARY KEY, appointment_id BIGINT UNIQUE REFERENCES venux_appointments(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`INSERT INTO venux_booking_slots (slot_key,appointment_id) SELECT clinic||'|'||requested_date::text||'|'||requested_time,id FROM venux_appointments WHERE status IN ('requested','confirmed','in_progress') ORDER BY id ON CONFLICT DO NOTHING`;
      await sql`CREATE INDEX IF NOT EXISTS venux_clients_email_idx ON venux_clients (LOWER(email))`;
      await sql`CREATE INDEX IF NOT EXISTS venux_clients_mobile_idx ON venux_clients (mobile)`;
      await sql`CREATE INDEX IF NOT EXISTS venux_appointments_date_idx ON venux_appointments (requested_date)`;
      await sql`CREATE TABLE IF NOT EXISTS venux_health_profiles (
        client_id BIGINT PRIMARY KEY REFERENCES venux_clients(id) ON DELETE CASCADE,
        skin_type TEXT NOT NULL DEFAULT '', primary_concerns TEXT NOT NULL DEFAULT '',
        allergies TEXT NOT NULL DEFAULT '', medical_conditions TEXT NOT NULL DEFAULT '',
        medications TEXT NOT NULL DEFAULT '', pregnancy_status TEXT NOT NULL DEFAULT '',
        breastfeeding BOOLEAN NOT NULL DEFAULT FALSE, implants TEXT NOT NULL DEFAULT '',
        aesthetic_history TEXT NOT NULL DEFAULT '', current_skincare TEXT NOT NULL DEFAULT '',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS venux_skin_assessments (
        id BIGSERIAL PRIMARY KEY, client_id BIGINT NOT NULL REFERENCES venux_clients(id) ON DELETE CASCADE,
        concern_categories TEXT NOT NULL DEFAULT '', main_concern TEXT NOT NULL DEFAULT '',
        anxiety_level INTEGER CHECK (anxiety_level BETWEEN 1 AND 5), expected_outcome TEXT NOT NULL DEFAULT '',
        fitzpatrick INTEGER CHECK (fitzpatrick BETWEEN 1 AND 6), treatment_recommendation TEXT NOT NULL DEFAULT '',
        course_plan TEXT NOT NULL DEFAULT '', budget INTEGER CHECK (budget >= 0),
        practitioner_notes TEXT NOT NULL DEFAULT '', assessed_by TEXT NOT NULL DEFAULT 'Admin',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS venux_treatment_records (
        id BIGSERIAL PRIMARY KEY, client_id BIGINT NOT NULL REFERENCES venux_clients(id) ON DELETE RESTRICT,
        service TEXT NOT NULL, treated_at TIMESTAMPTZ NOT NULL, operator_name TEXT NOT NULL,
        treatment_area TEXT NOT NULL DEFAULT '', products TEXT NOT NULL DEFAULT '', brand TEXT NOT NULL DEFAULT '',
        batch_number TEXT NOT NULL DEFAULT '', dosage TEXT NOT NULL DEFAULT '', parameters TEXT NOT NULL DEFAULT '',
        shot_count INTEGER CHECK (shot_count >= 0), unit_count NUMERIC(10,2) CHECK (unit_count >= 0),
        treatment_map TEXT NOT NULL DEFAULT '', immediate_response TEXT NOT NULL DEFAULT '',
        adverse_reaction TEXT NOT NULL DEFAULT '', adverse_management TEXT NOT NULL DEFAULT '',
        operator_signature TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS venux_followups (
        id BIGSERIAL PRIMARY KEY, client_id BIGINT NOT NULL REFERENCES venux_clients(id) ON DELETE CASCADE,
        treatment_record_id BIGINT REFERENCES venux_treatment_records(id) ON DELETE SET NULL,
        due_date DATE NOT NULL, followup_type TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
        recovery_notes TEXT NOT NULL DEFAULT '', satisfaction INTEGER CHECK (satisfaction BETWEEN 1 AND 5),
        abnormal_reaction BOOLEAN NOT NULL DEFAULT FALSE, review_required BOOLEAN NOT NULL DEFAULT FALSE,
        completed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS venux_client_courses (
        id BIGSERIAL PRIMARY KEY, client_id BIGINT NOT NULL REFERENCES venux_clients(id) ON DELETE CASCADE,
        course_name TEXT NOT NULL, purchased_sessions INTEGER NOT NULL CHECK (purchased_sessions > 0),
        used_sessions INTEGER NOT NULL DEFAULT 0 CHECK (used_sessions >= 0), expires_on DATE,
        amount_paid INTEGER NOT NULL DEFAULT 0 CHECK (amount_paid >= 0), status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS venux_audit_log (
        id BIGSERIAL PRIMARY KEY, actor_name TEXT NOT NULL DEFAULT 'Admin', actor_role TEXT NOT NULL DEFAULT 'administrator',
        action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id BIGINT, detail TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE INDEX IF NOT EXISTS venux_followups_due_idx ON venux_followups (status,due_date)`;
      await sql`CREATE INDEX IF NOT EXISTS venux_treatment_client_idx ON venux_treatment_records (client_id,treated_at DESC)`;
      await sql`CREATE TABLE IF NOT EXISTS venux_sms_outbox (
        id BIGSERIAL PRIMARY KEY, client_id BIGINT REFERENCES venux_clients(id) ON DELETE SET NULL,
        appointment_id BIGINT REFERENCES venux_appointments(id) ON DELETE SET NULL,
        event_key TEXT NOT NULL UNIQUE, message_type TEXT NOT NULL, recipient TEXT NOT NULL,
        message_body TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'queued',
        queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), sent_at TIMESTAMPTZ
      )`;
      await sql`CREATE INDEX IF NOT EXISTS venux_sms_outbox_status_idx ON venux_sms_outbox (status,queued_at)`;
      await sql`CREATE TABLE IF NOT EXISTS venux_staff (
        id BIGSERIAL PRIMARY KEY, full_name TEXT NOT NULL, role TEXT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`ALTER TABLE venux_appointments ADD COLUMN IF NOT EXISTS staff_id BIGINT REFERENCES venux_staff(id) ON DELETE SET NULL`;
      await sql`CREATE TABLE IF NOT EXISTS venux_time_clock (
        id BIGSERIAL PRIMARY KEY, staff_id BIGINT NOT NULL REFERENCES venux_staff(id) ON DELETE CASCADE,
        clock_in TIMESTAMPTZ NOT NULL DEFAULT NOW(), clock_out TIMESTAMPTZ,
        note TEXT NOT NULL DEFAULT ''
      )`;
      await sql`CREATE INDEX IF NOT EXISTS venux_time_clock_staff_idx ON venux_time_clock (staff_id,clock_in DESC)`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS venux_time_clock_one_open_idx ON venux_time_clock (staff_id) WHERE clock_out IS NULL`;
      await sql`CREATE TABLE IF NOT EXISTS venux_suppliers (
        id BIGSERIAL PRIMARY KEY, supplier_name TEXT NOT NULL, contact_name TEXT NOT NULL DEFAULT '',
        phone TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', website TEXT NOT NULL DEFAULT '',
        brands TEXT NOT NULL DEFAULT '', account_reference TEXT NOT NULL DEFAULT '',
        notes TEXT NOT NULL DEFAULT '', active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS venux_expenses (
        id BIGSERIAL PRIMARY KEY, expense_date DATE NOT NULL, category TEXT NOT NULL,
        payee TEXT NOT NULL DEFAULT '', description TEXT NOT NULL,
        amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
        payment_method TEXT NOT NULL DEFAULT 'Card', notes TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE INDEX IF NOT EXISTS venux_expenses_date_idx ON venux_expenses (expense_date DESC)`;
      await sql`CREATE TABLE IF NOT EXISTS venux_services (
        id BIGSERIAL PRIMARY KEY, service_name TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'Skin',
        duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
        regular_price INTEGER NOT NULL DEFAULT 0 CHECK (regular_price >= 0),
        active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`ALTER TABLE venux_services ALTER COLUMN regular_price TYPE NUMERIC(10,2) USING regular_price::numeric`;
      await sql`ALTER TABLE venux_services ADD COLUMN IF NOT EXISTS member_price NUMERIC(10,2) CHECK (member_price >= 0)`;
      await sql`ALTER TABLE venux_services ADD COLUMN IF NOT EXISTS commission_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (commission_percent BETWEEN 0 AND 100)`;
      await sql`ALTER TABLE venux_services ADD COLUMN IF NOT EXISTS pricing_type TEXT NOT NULL DEFAULT 'fixed'`;
      await sql`ALTER TABLE venux_services ADD COLUMN IF NOT EXISTS unit_label TEXT NOT NULL DEFAULT ''`;
      await sql`ALTER TABLE venux_services ADD COLUMN IF NOT EXISTS price_notes TEXT NOT NULL DEFAULT ''`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS venux_services_name_idx ON venux_services (LOWER(service_name))`;
      await sql`ALTER TABLE venux_staff ADD COLUMN IF NOT EXISTS city_enabled BOOLEAN NOT NULL DEFAULT FALSE`;
      await sql`ALTER TABLE venux_appointments ADD COLUMN IF NOT EXISTS service_id BIGINT REFERENCES venux_services(id) ON DELETE SET NULL`;
      await sql`ALTER TABLE venux_appointments ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes > 0)`;
      await sql`ALTER TABLE venux_appointments ADD COLUMN IF NOT EXISTS start_minute INTEGER CHECK (start_minute BETWEEN 0 AND 1439)`;
      await sql`ALTER TABLE venux_appointments ALTER COLUMN total_amount TYPE NUMERIC(10,2) USING total_amount::numeric`;
      await sql`ALTER TABLE venux_appointments ALTER COLUMN deposit_amount TYPE NUMERIC(10,2) USING deposit_amount::numeric`;
      await sql`ALTER TABLE venux_appointments ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ`;
      await sql`ALTER TABLE venux_appointments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ`;
      await sql`ALTER TABLE venux_appointments ADD COLUMN IF NOT EXISTS recognised_revenue NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (recognised_revenue >= 0)`;
      await sql`ALTER TABLE venux_appointments ADD COLUMN IF NOT EXISTS commission_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (commission_percent BETWEEN 0 AND 100)`;
      await sql`ALTER TABLE venux_appointments ADD COLUMN IF NOT EXISTS staff_wage_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (staff_wage_amount >= 0)`;
      await sql`UPDATE venux_appointments SET recognised_revenue=total_amount WHERE status='completed' AND recognised_revenue=0 AND total_amount>0`;
    })();
  }
  return clinicTablesReady;
}

export async function createBookingRequest(input: BookingInput) {
  await ensureClinicTables();
  const sql = client();
  const normalMobile=normaliseMobile(input.mobile);
  const existing = input.clientId
    ? await sql`SELECT id FROM venux_clients WHERE id=${input.clientId} LIMIT 1`
    : await sql`SELECT id FROM venux_clients WHERE (${input.email}<>'' AND LOWER(email) = LOWER(${input.email})) OR REGEXP_REPLACE(mobile,'[^0-9]','','g') IN (${normalMobile},${normalMobile.replace(/^61/,"0")}) ORDER BY updated_at DESC LIMIT 1`;
  let clientId: number;
  if (existing[0]) {
    clientId = Number(existing[0].id);
    await sql`UPDATE venux_clients SET full_name=${input.name},mobile=${input.mobile},email=CASE WHEN ${input.email}<>'' THEN ${input.email} ELSE email END,service_sms_consent=service_sms_consent OR ${Boolean(input.serviceSmsConsent)},marketing_sms_consent=CASE WHEN sms_unsubscribed_at IS NULL THEN marketing_sms_consent OR ${Boolean(input.marketingSmsConsent)} ELSE FALSE END,marketing_consent_at=CASE WHEN ${Boolean(input.marketingSmsConsent)} AND marketing_consent_at IS NULL THEN NOW() ELSE marketing_consent_at END,updated_at=NOW() WHERE id=${clientId}`;
  } else {
    const rows = await sql`INSERT INTO venux_clients (full_name,mobile,email,service_sms_consent,marketing_sms_consent,marketing_consent_at,lead_source) VALUES (${input.name},${input.mobile},${input.email},${Boolean(input.serviceSmsConsent)},${Boolean(input.marketingSmsConsent)},CASE WHEN ${Boolean(input.marketingSmsConsent)} THEN NOW() ELSE NULL END,${input.source==="admin"?"Clinic":"Website"}) RETURNING id`;
    clientId = Number(rows[0].id);
  }
  const token=randomBytes(24).toString("base64url");
  const startMinute=timeToMinutes(input.time);
  if(input.staffId&&startMinute!==null){
    const overlap=await sql`SELECT id FROM venux_appointments WHERE staff_id=${input.staffId}
      AND requested_date=${input.date} AND status IN ('requested','confirmed','in_progress') AND start_minute IS NOT NULL
      AND start_minute < ${startMinute+(input.durationMinutes??60)}
      AND start_minute+duration_minutes > ${startMinute} LIMIT 1`;
    if(overlap[0])throw new BookingConflictError("This beautician already has an overlapping appointment.");
  }
  const slotKey=input.staffId?`${input.clinic}|${input.date}|${input.time}|staff:${input.staffId}`:`${input.clinic}|${input.date}|${input.time}`;
  const created = await sql`WITH claimed AS (INSERT INTO venux_booking_slots (slot_key) VALUES (${slotKey}) ON CONFLICT DO NOTHING RETURNING slot_key), booked AS (INSERT INTO venux_appointments (client_id,clinic,treatment,requested_date,requested_time,notes,source,confirmation_token,staff_id,service_id,duration_minutes,start_minute,total_amount) SELECT ${clientId},${input.clinic},${input.treatment},${input.date},${input.time},${input.notes ?? ""},${input.source??"website"},${token},${input.staffId??null},${input.serviceId??null},${input.durationMinutes??60},${startMinute},${input.totalAmount??0} FROM claimed RETURNING id) UPDATE venux_booking_slots s SET appointment_id=b.id FROM booked b WHERE s.slot_key=${slotKey} RETURNING b.id`;
  if(!created[0])throw new BookingConflictError("This time is no longer available.");
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
      (SELECT COALESCE(SUM(a.recognised_revenue),0) FROM venux_appointments a WHERE a.status IN ('in_progress','completed') AND a.requested_date >= b.this_month) AS revenue_now,
      (SELECT COALESCE(SUM(a.recognised_revenue),0) FROM venux_appointments a WHERE a.status IN ('in_progress','completed') AND a.requested_date >= b.last_month AND a.requested_date < b.this_month) AS revenue_last,
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

export async function getAppointments(date = "") {
  await ensureClinicTables();
  return client()`SELECT a.*,a.requested_date::text AS requested_date,c.full_name,c.mobile,c.email,s.full_name AS staff_name
    FROM venux_appointments a JOIN venux_clients c ON c.id=a.client_id
    LEFT JOIN venux_staff s ON s.id=a.staff_id
    WHERE (${date}='' OR a.requested_date=${date || null})
    ORDER BY a.requested_date DESC,a.requested_time DESC LIMIT 500`;
}

export async function getAppointmentsRange(from:string,to:string) {
  await ensureClinicTables();
  return client()`SELECT a.*,a.requested_date::text AS requested_date,c.full_name,c.mobile,c.email,s.full_name AS staff_name
    FROM venux_appointments a JOIN venux_clients c ON c.id=a.client_id
    LEFT JOIN venux_staff s ON s.id=a.staff_id
    WHERE a.requested_date BETWEEN ${from} AND ${to}
    ORDER BY a.requested_date,a.start_minute NULLS LAST,a.requested_time,a.id LIMIT 1000`;
}

export async function getClients(search = "") {
  await ensureClinicTables();
  const term=search.trim(),like=`%${term}%`,digits=normaliseMobile(term),localDigits=digits.replace(/^61/,"0");
  return client()`SELECT c.*,m.balance,m.status AS membership_status,m.joined_at,
    COUNT(a.id)::int AS visit_count,MAX(a.requested_date) AS last_visit
    FROM venux_clients c LEFT JOIN venux_memberships m ON m.client_id=c.id
    LEFT JOIN venux_appointments a ON a.client_id=c.id
    WHERE (${term}='' OR c.full_name ILIKE ${like} OR c.email ILIKE ${like}
      OR (${digits}<>'' AND (REGEXP_REPLACE(c.mobile,'[^0-9]','','g') LIKE ${`%${digits}%`}
        OR REGEXP_REPLACE(c.mobile,'[^0-9]','','g') LIKE ${`%${localDigits}%`})))
    GROUP BY c.id,m.balance,m.status,m.joined_at ORDER BY c.updated_at DESC LIMIT 500`;
}

export async function getClientForBooking(clientId: number) {
  await ensureClinicTables();
  return (await client()`SELECT c.*,m.balance,m.status AS membership_status,
    COUNT(a.id)::int AS visit_count,MAX(a.requested_date) AS last_visit
    FROM venux_clients c LEFT JOIN venux_memberships m ON m.client_id=c.id
    LEFT JOIN venux_appointments a ON a.client_id=c.id WHERE c.id=${clientId}
    GROUP BY c.id,m.balance,m.status LIMIT 1`)[0]??null;
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

export async function updateAppointment(id: number, status: AppointmentStatus, totalAmount: number, depositStatus: string, staffId: number|null = null) {
  await ensureClinicTables();
  const sql=client();
  const before=await sql`SELECT a.*,c.full_name,c.mobile,c.service_sms_consent FROM venux_appointments a JOIN venux_clients c ON c.id=a.client_id WHERE a.id=${id}`;
  if(!before[0])return;
  if(["requested","confirmed","in_progress"].includes(status)&&!["requested","confirmed","in_progress"].includes(String(before[0].status))){
    const claimed=await sql`INSERT INTO venux_booking_slots (slot_key,appointment_id)
      SELECT clinic||'|'||requested_date::text||'|'||requested_time,id FROM venux_appointments WHERE id=${id}
      ON CONFLICT DO NOTHING RETURNING slot_key`;
    if(!claimed[0])throw new BookingConflictError("This time is already reserved.");
  }
  if(status==="confirmed"){
    const conflict=await sql`SELECT id FROM venux_appointments WHERE id<>${id} AND clinic=${before[0].clinic} AND requested_date=${before[0].requested_date} AND requested_time=${before[0].requested_time} AND status='confirmed' LIMIT 1`;
    if(conflict[0])throw new BookingConflictError("Another confirmed appointment already uses this time.");
  }
  await sql`UPDATE venux_appointments a SET status=${status},total_amount=${totalAmount},deposit_status=${depositStatus},staff_id=${staffId},
    started_at=CASE WHEN ${status}='in_progress' THEN COALESCE(a.started_at,NOW()) ELSE a.started_at END,
    completed_at=CASE WHEN ${status}='completed' THEN COALESCE(a.completed_at,NOW()) ELSE a.completed_at END,
    commission_percent=CASE WHEN ${status} IN ('in_progress','completed') AND a.started_at IS NULL THEN COALESCE(v.commission_percent,0) ELSE a.commission_percent END,
    recognised_revenue=CASE WHEN ${status} IN ('in_progress','completed') THEN ${totalAmount} ELSE a.recognised_revenue END,
    staff_wage_amount=CASE WHEN ${status} IN ('in_progress','completed') THEN ROUND(${totalAmount}*CASE WHEN a.started_at IS NULL THEN COALESCE(v.commission_percent,0) ELSE a.commission_percent END/100,2) ELSE a.staff_wage_amount END,
    updated_at=NOW()
    FROM venux_services v WHERE a.id=${id} AND (v.id=a.service_id OR (a.service_id IS NULL AND v.id=(SELECT id FROM venux_services WHERE LOWER(service_name)=LOWER(a.treatment) LIMIT 1)))`;
  if(before[0].service_id==null){
    await sql`UPDATE venux_appointments SET status=${status},total_amount=${totalAmount},deposit_status=${depositStatus},staff_id=${staffId},
      started_at=CASE WHEN ${status}='in_progress' THEN COALESCE(started_at,NOW()) ELSE started_at END,
      completed_at=CASE WHEN ${status}='completed' THEN COALESCE(completed_at,NOW()) ELSE completed_at END,
      recognised_revenue=CASE WHEN ${status} IN ('in_progress','completed') THEN ${totalAmount} ELSE recognised_revenue END,
      staff_wage_amount=CASE WHEN ${status} IN ('in_progress','completed') THEN ROUND(${totalAmount}*commission_percent/100,2) ELSE staff_wage_amount END,updated_at=NOW() WHERE id=${id}`;
  }
  if(["cancelled","completed","no_show"].includes(status))await sql`DELETE FROM venux_booking_slots WHERE appointment_id=${id}`;
  if(status==="confirmed"&&before[0].status!=="confirmed"&&before[0].service_sms_consent)await queueAppointmentConfirmation(id);
}

export async function startAppointment(id:number,staffId:number){
  await ensureClinicTables();
  const sql=client();
  const rows=await sql`SELECT total_amount,deposit_status,status FROM venux_appointments WHERE id=${id}`;
  const row=rows[0];
  if(!row||!["requested","confirmed"].includes(String(row.status)))return false;
  await updateAppointment(id,"in_progress",Number(row.total_amount),String(row.deposit_status),staffId);
  return true;
}

export async function queueAppointmentConfirmation(appointmentId:number){
  await ensureClinicTables();const sql=client();
  const rows=await sql`SELECT a.*,c.full_name,c.mobile FROM venux_appointments a JOIN venux_clients c ON c.id=a.client_id WHERE a.id=${appointmentId}`;
  const row=rows[0];if(!row)return false;
  let token=String(row.confirmation_token??"");if(!token){token=randomBytes(24).toString("base64url");await sql`UPDATE venux_appointments SET confirmation_token=${token} WHERE id=${appointmentId}`;}
  const base=(process.env.NEXT_PUBLIC_SITE_URL||"https://venux-three.vercel.app").replace(/\/$/,"");
  const date=new Date(String(row.requested_date)).toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric",timeZone:"Australia/Sydney"});
  const body=`VenuX Skin Clinic: ${row.full_name}, your ${row.treatment} appointment is held for ${date} at ${row.requested_time}, ${row.clinic}. Please confirm: ${base}/booking/confirm/${token}`;
  const eventKey=`appointment-confirmation:${appointmentId}`;
  await sql`INSERT INTO venux_sms_outbox (client_id,appointment_id,event_key,message_type,recipient,message_body) VALUES (${row.client_id},${appointmentId},${eventKey},'appointment_confirmation',${row.mobile},${body}) ON CONFLICT (event_key) DO NOTHING`;
  await sql`UPDATE venux_appointments SET confirmation_message_queued_at=COALESCE(confirmation_message_queued_at,NOW()) WHERE id=${appointmentId}`;
  return true;
}

export async function getBookingByToken(token:string){
  await ensureClinicTables();return (await client()`SELECT a.id,a.treatment,a.clinic,a.requested_date,a.requested_time,a.status,a.customer_confirmation_status,a.confirmed_by_client_at,c.full_name FROM venux_appointments a JOIN venux_clients c ON c.id=a.client_id WHERE a.confirmation_token=${token} LIMIT 1`)[0]??null;
}

export async function respondToBooking(token:string,response:"confirmed"|"change_requested"){
  await ensureClinicTables();const rows=await client()`UPDATE venux_appointments SET customer_confirmation_status=${response},confirmed_by_client_at=CASE WHEN ${response}='confirmed' THEN NOW() ELSE NULL END,status=CASE WHEN ${response}='change_requested' THEN 'requested' ELSE status END,updated_at=NOW() WHERE confirmation_token=${token} AND status NOT IN ('cancelled','completed','in_progress') RETURNING id`;
  return Boolean(rows[0]);
}

export async function queueBirthdayMessages(){
  await ensureClinicTables();const sql=client();
  const now=new Date(),parts=new Intl.DateTimeFormat("en-AU",{timeZone:"Australia/Sydney",month:"2-digit",day:"2-digit",year:"numeric"}).formatToParts(now);
  const part=(type:string)=>parts.find(item=>item.type===type)?.value??"";const today=`${part("month")}-${part("day")}`,year=part("year");
  const rows=await sql`SELECT id,full_name,mobile FROM venux_clients WHERE dob IS NOT NULL AND TO_CHAR(dob,'MM-DD')=${today} AND marketing_sms_consent=TRUE AND sms_unsubscribed_at IS NULL`;
  let queued=0;
  for(const row of rows){const eventKey=`birthday:${year}:${row.id}`,first=String(row.full_name).trim().split(/\s+/)[0];const result=await sql`INSERT INTO venux_sms_outbox (client_id,event_key,message_type,recipient,message_body) VALUES (${row.id},${eventKey},'birthday',${row.mobile},${`Happy birthday ${first}! VenuX Skin Clinic wishes you a beautiful day. Reply STOP to opt out.`}) ON CONFLICT (event_key) DO NOTHING RETURNING id`;if(result[0])queued++;}
  return {eligible:rows.length,queued};
}

export async function getSmsOutbox(){
  await ensureClinicTables();return client()`SELECT o.*,c.full_name,a.requested_date,a.requested_time FROM venux_sms_outbox o LEFT JOIN venux_clients c ON c.id=o.client_id LEFT JOIN venux_appointments a ON a.id=o.appointment_id ORDER BY CASE WHEN o.status='queued' THEN 0 ELSE 1 END,o.queued_at DESC LIMIT 500`;
}

export async function markSmsOutboxSent(id:number){
  await ensureClinicTables();await client()`UPDATE venux_sms_outbox SET status='sent',sent_at=NOW() WHERE id=${id}`;
}

export async function saveMembership(clientId: number, balance: number, status: string) {
  await ensureClinicTables();
  await client()`INSERT INTO venux_memberships (client_id,balance,status,joined_at) VALUES (${clientId},${balance},${status},CASE WHEN ${status}='active' THEN NOW() ELSE NULL END)
    ON CONFLICT (client_id) DO UPDATE SET balance=EXCLUDED.balance,status=EXCLUDED.status,joined_at=COALESCE(venux_memberships.joined_at,EXCLUDED.joined_at),updated_at=NOW()`;
}

async function audit(action: string, entityType: string, entityId: number, detail = "") {
  await client()`INSERT INTO venux_audit_log (action,entity_type,entity_id,detail) VALUES (${action},${entityType},${entityId},${detail})`;
}

export async function getClientClinicalRecord(clientId: number) {
  await ensureClinicTables();
  const sql = client();
  const [clientRows, healthRows, assessments, treatments, followups, courses, appointments, audits] = await Promise.all([
    sql`SELECT c.*,m.balance,m.status AS membership_status,m.joined_at FROM venux_clients c LEFT JOIN venux_memberships m ON m.client_id=c.id WHERE c.id=${clientId}`,
    sql`SELECT * FROM venux_health_profiles WHERE client_id=${clientId}`,
    sql`SELECT * FROM venux_skin_assessments WHERE client_id=${clientId} ORDER BY created_at DESC`,
    sql`SELECT * FROM venux_treatment_records WHERE client_id=${clientId} ORDER BY treated_at DESC`,
    sql`SELECT * FROM venux_followups WHERE client_id=${clientId} ORDER BY status DESC,due_date`,
    sql`SELECT * FROM venux_client_courses WHERE client_id=${clientId} ORDER BY created_at DESC`,
    sql`SELECT * FROM venux_appointments WHERE client_id=${clientId} ORDER BY requested_date DESC,requested_time DESC LIMIT 20`,
    sql`SELECT * FROM venux_audit_log WHERE entity_type='client' AND entity_id=${clientId} ORDER BY created_at DESC LIMIT 20`,
  ]);
  if (clientRows[0]) await audit("view", "client", clientId, "Clinical record opened");
  return { client: clientRows[0] ?? null, health: healthRows[0] ?? null, assessments, treatments, followups, courses, appointments, audits };
}

export async function saveClientProfile(clientId: number, values: Record<string,string>) {
  await ensureClinicTables();
  await client()`UPDATE venux_clients SET full_name=${values.fullName},mobile=${values.mobile},email=${values.email},dob=${values.dob || null},address=${values.address},gender=${values.gender},occupation=${values.occupation},emergency_contact_name=${values.emergencyName},emergency_contact_phone=${values.emergencyPhone},lead_source=${values.leadSource},updated_at=NOW() WHERE id=${clientId}`;
  await audit("update", "client", clientId, "Profile and contact details updated");
}

export async function saveHealthProfile(clientId: number, values: Record<string,string|boolean>) {
  await ensureClinicTables();
  await client()`INSERT INTO venux_health_profiles (client_id,skin_type,primary_concerns,allergies,medical_conditions,medications,pregnancy_status,breastfeeding,implants,aesthetic_history,current_skincare)
    VALUES (${clientId},${values.skinType},${values.primaryConcerns},${values.allergies},${values.medicalConditions},${values.medications},${values.pregnancyStatus},${values.breastfeeding},${values.implants},${values.aestheticHistory},${values.currentSkincare})
    ON CONFLICT (client_id) DO UPDATE SET skin_type=EXCLUDED.skin_type,primary_concerns=EXCLUDED.primary_concerns,allergies=EXCLUDED.allergies,medical_conditions=EXCLUDED.medical_conditions,medications=EXCLUDED.medications,pregnancy_status=EXCLUDED.pregnancy_status,breastfeeding=EXCLUDED.breastfeeding,implants=EXCLUDED.implants,aesthetic_history=EXCLUDED.aesthetic_history,current_skincare=EXCLUDED.current_skincare,updated_at=NOW()`;
  await audit("update", "client", clientId, "Health profile updated");
}

export async function createSkinAssessment(clientId: number, values: Record<string,string|number|null>) {
  await ensureClinicTables();
  await client()`INSERT INTO venux_skin_assessments (client_id,concern_categories,main_concern,anxiety_level,expected_outcome,fitzpatrick,treatment_recommendation,course_plan,budget,practitioner_notes,assessed_by)
    VALUES (${clientId},${values.concerns},${values.mainConcern},${values.anxietyLevel},${values.expectedOutcome},${values.fitzpatrick},${values.recommendation},${values.coursePlan},${values.budget},${values.notes},${values.assessedBy})`;
  await audit("create", "client", clientId, "Skin assessment added");
}

function followupSchedule(service: string) {
  const value=service.toLowerCase();
  if(/botox|anti-wrinkle/.test(value)) return [[14,"2-week review"]] as const;
  if(/skin booster|rejuran|水光/.test(value)) return [[3,"3-day recovery check"],[7,"1-week review"]] as const;
  if(/ipl|pico|lutronic|皮秒/.test(value)) return [[1,"24-hour safety check"],[7,"1-week review"]] as const;
  if(/hifu|ultherapy|ultrasound/.test(value)) return [[30,"1-month review"],[90,"3-month review"]] as const;
  return [] as const;
}

export async function createTreatmentRecord(clientId: number, values: Record<string,string|number|null>) {
  await ensureClinicTables();
  const sql=client();
  const rows=await sql`INSERT INTO venux_treatment_records (client_id,service,treated_at,operator_name,treatment_area,products,brand,batch_number,dosage,parameters,shot_count,unit_count,treatment_map,immediate_response,adverse_reaction,adverse_management,operator_signature)
    VALUES (${clientId},${values.service},${values.treatedAt},${values.operator},${values.area},${values.products},${values.brand},${values.batchNumber},${values.dosage},${values.parameters},${values.shotCount},${values.unitCount},${values.treatmentMap},${values.immediateResponse},${values.adverseReaction},${values.adverseManagement},${values.signature}) RETURNING id,treated_at`;
  const treatmentId=Number(rows[0].id);
  for(const [days,label] of followupSchedule(String(values.service))){
    await sql`INSERT INTO venux_followups (client_id,treatment_record_id,due_date,followup_type) VALUES (${clientId},${treatmentId},(${String(values.treatedAt)}::timestamptz + (${days} || ' days')::interval)::date,${label})`;
  }
  await audit("create", "client", clientId, `Treatment record added: ${values.service}`);
}

export async function createClientCourse(clientId: number, values: Record<string,string|number|null>) {
  await ensureClinicTables();
  await client()`INSERT INTO venux_client_courses (client_id,course_name,purchased_sessions,used_sessions,expires_on,amount_paid,status) VALUES (${clientId},${values.name},${values.purchased},${values.used},${values.expiresOn || null},${values.amountPaid},${values.status})`;
  await audit("create", "client", clientId, `Course added: ${values.name}`);
}

export async function completeFollowup(followupId: number, clientId: number, values: Record<string,string|number|boolean|null>) {
  await ensureClinicTables();
  await client()`UPDATE venux_followups SET status='completed',recovery_notes=${values.notes},satisfaction=${values.satisfaction},abnormal_reaction=${values.abnormal},review_required=${values.reviewRequired},completed_at=NOW() WHERE id=${followupId} AND client_id=${clientId}`;
  await audit("update", "client", clientId, `Follow-up ${followupId} completed`);
}

export async function getFollowups() {
  await ensureClinicTables();
  return client()`SELECT f.*,c.full_name,c.mobile,t.service FROM venux_followups f JOIN venux_clients c ON c.id=f.client_id LEFT JOIN venux_treatment_records t ON t.id=f.treatment_record_id ORDER BY CASE WHEN f.status='pending' THEN 0 ELSE 1 END,f.due_date LIMIT 300`;
}

export async function getStaff() {
  await ensureClinicTables();
  return client()`SELECT s.*,
    EXISTS(SELECT 1 FROM venux_time_clock t WHERE t.staff_id=s.id AND t.clock_out IS NULL) AS clocked_in,
    (SELECT t.clock_in FROM venux_time_clock t WHERE t.staff_id=s.id ORDER BY t.clock_in DESC LIMIT 1) AS last_clock_in,
    (SELECT t.clock_out FROM venux_time_clock t WHERE t.staff_id=s.id ORDER BY t.clock_in DESC LIMIT 1) AS last_clock_out
    FROM venux_staff s ORDER BY s.active DESC,s.full_name`;
}

export async function createStaff(fullName:string,role:string){
  await ensureClinicTables();
  await client()`INSERT INTO venux_staff (full_name,role) VALUES (${fullName},${role})`;
}

export async function toggleStaffClock(staffId:number,note:string){
  await ensureClinicTables();const sql=client();
  const open=await sql`SELECT id FROM venux_time_clock WHERE staff_id=${staffId} AND clock_out IS NULL LIMIT 1`;
  if(open[0])await sql`UPDATE venux_time_clock SET clock_out=NOW(),note=CASE WHEN ${note}<>'' THEN ${note} ELSE note END WHERE id=${open[0].id}`;
  else await sql`INSERT INTO venux_time_clock (staff_id,note) VALUES (${staffId},${note})`;
}

export async function getStaffClockHistory(){
  await ensureClinicTables();
  return client()`SELECT t.*,s.full_name,s.role,
    CASE WHEN t.clock_out IS NULL THEN NULL ELSE ROUND(EXTRACT(EPOCH FROM (t.clock_out-t.clock_in))/3600,2) END AS hours
    FROM venux_time_clock t JOIN venux_staff s ON s.id=t.staff_id ORDER BY t.clock_in DESC LIMIT 200`;
}

export async function getOperationsReport(from:string,to:string){
  await ensureClinicTables();const sql=client();
  const [summary,byStaff,byTreatment,byDay]=await Promise.all([
    sql`SELECT COUNT(*) FILTER (WHERE status='completed')::int AS completed,
      COUNT(*) FILTER (WHERE status IN ('in_progress','completed'))::int AS started,
      COUNT(*) FILTER (WHERE status='no_show')::int AS no_shows,
      COUNT(*)::int AS total_bookings,
      COALESCE(SUM(recognised_revenue) FILTER (WHERE status IN ('in_progress','completed')),0) AS revenue,
      COALESCE(SUM(staff_wage_amount) FILTER (WHERE status IN ('in_progress','completed')),0) AS payroll,
      COALESCE(AVG(recognised_revenue) FILTER (WHERE status IN ('in_progress','completed')),0) AS average_sale
      FROM venux_appointments WHERE requested_date BETWEEN ${from} AND ${to}`,
    sql`SELECT COALESCE(s.full_name,'Unassigned') AS staff_name,COALESCE(s.role,'') AS role,
      COUNT(a.id) FILTER (WHERE a.status IN ('in_progress','completed'))::int AS started,
      COUNT(a.id) FILTER (WHERE a.status='completed')::int AS completed,
      COALESCE(SUM(a.recognised_revenue) FILTER (WHERE a.status IN ('in_progress','completed')),0) AS revenue,
      COALESCE(SUM(a.staff_wage_amount) FILTER (WHERE a.status IN ('in_progress','completed')),0) AS payroll
      FROM venux_appointments a LEFT JOIN venux_staff s ON s.id=a.staff_id
      WHERE a.requested_date BETWEEN ${from} AND ${to}
      GROUP BY s.id,s.full_name,s.role ORDER BY revenue DESC`,
    sql`SELECT treatment,COUNT(*) FILTER (WHERE status IN ('in_progress','completed'))::int AS started,
      COUNT(*) FILTER (WHERE status='completed')::int AS completed,
      COALESCE(SUM(recognised_revenue) FILTER (WHERE status IN ('in_progress','completed')),0) AS revenue,
      COALESCE(SUM(staff_wage_amount) FILTER (WHERE status IN ('in_progress','completed')),0) AS payroll
      FROM venux_appointments WHERE requested_date BETWEEN ${from} AND ${to}
      GROUP BY treatment ORDER BY revenue DESC LIMIT 25`,
    sql`SELECT requested_date,COUNT(*)::int AS bookings,
      COALESCE(SUM(recognised_revenue) FILTER (WHERE status IN ('in_progress','completed')),0) AS revenue,
      COALESCE(SUM(staff_wage_amount) FILTER (WHERE status IN ('in_progress','completed')),0) AS payroll
      FROM venux_appointments WHERE requested_date BETWEEN ${from} AND ${to}
      GROUP BY requested_date ORDER BY requested_date`,
  ]);
  return {summary:summary[0]??{},byStaff,byTreatment,byDay};
}

export async function getDormantClients(days=120,search=""){
  await ensureClinicTables();const term=search.trim(),like=`%${term}%`;
  return client()`SELECT c.*,m.status AS membership_status,MAX(a.requested_date) FILTER (WHERE a.status='completed') AS last_visit,
    COUNT(a.id) FILTER (WHERE a.status='completed')::int AS completed_visits
    FROM venux_clients c LEFT JOIN venux_memberships m ON m.client_id=c.id
    LEFT JOIN venux_appointments a ON a.client_id=c.id
    WHERE (${term}='' OR c.full_name ILIKE ${like} OR c.mobile ILIKE ${like})
    GROUP BY c.id,m.status
    HAVING MAX(a.requested_date) FILTER (WHERE a.status='completed') IS NULL
      OR MAX(a.requested_date) FILTER (WHERE a.status='completed') < CURRENT_DATE-${days}::int
    ORDER BY last_visit NULLS FIRST,c.full_name LIMIT 500`;
}

export async function queueReturnInvite(clientId:number){
  await ensureClinicTables();const sql=client();
  const rows=await sql`SELECT id,full_name,mobile,marketing_sms_consent,sms_unsubscribed_at FROM venux_clients WHERE id=${clientId}`;
  const row=rows[0];if(!row||!row.marketing_sms_consent||row.sms_unsubscribed_at)return false;
  const month=new Intl.DateTimeFormat("en-CA",{timeZone:"Australia/Sydney",year:"numeric",month:"2-digit"}).format(new Date());
  const first=String(row.full_name).trim().split(/\s+/)[0];
  const result=await sql`INSERT INTO venux_sms_outbox (client_id,event_key,message_type,recipient,message_body)
    VALUES (${clientId},${`return-invite:${month}:${clientId}`},'return_invite',${row.mobile},${`Hi ${first}, it has been a while since your last visit to VenuX Skin Clinic. Reply or book online if you would like help planning your next treatment. Reply STOP to opt out.`})
    ON CONFLICT (event_key) DO NOTHING RETURNING id`;
  return Boolean(result[0]);
}

export async function getSuppliers(){
  await ensureClinicTables();return client()`SELECT * FROM venux_suppliers ORDER BY active DESC,supplier_name`;
}

export async function createSupplier(values:Record<string,string>){
  await ensureClinicTables();await client()`INSERT INTO venux_suppliers
    (supplier_name,contact_name,phone,email,website,brands,account_reference,notes)
    VALUES (${values.name},${values.contact},${values.phone},${values.email},${values.website},${values.brands},${values.accountReference},${values.notes})`;
}

export async function getExpenses(from:string,to:string){
  await ensureClinicTables();const sql=client();
  const [rows,summary,byCategory]=await Promise.all([
    sql`SELECT * FROM venux_expenses WHERE expense_date BETWEEN ${from} AND ${to} ORDER BY expense_date DESC,id DESC LIMIT 1000`,
    sql`SELECT COUNT(*)::int AS expense_count,COALESCE(SUM(amount),0) AS total FROM venux_expenses WHERE expense_date BETWEEN ${from} AND ${to}`,
    sql`SELECT category,COUNT(*)::int AS expense_count,COALESCE(SUM(amount),0) AS total FROM venux_expenses WHERE expense_date BETWEEN ${from} AND ${to} GROUP BY category ORDER BY total DESC`,
  ]);
  return {rows,summary:summary[0]??{expense_count:0,total:0},byCategory};
}

export async function createExpense(values:{date:string;category:string;payee:string;description:string;amount:number;paymentMethod:string;notes:string}){
  await ensureClinicTables();
  await client()`INSERT INTO venux_expenses (expense_date,category,payee,description,amount,payment_method,notes)
    VALUES (${values.date},${values.category},${values.payee},${values.description},${values.amount},${values.paymentMethod},${values.notes})`;
}

export type ServiceImportRow={name:string;category:string;duration:number;price:number;memberPrice?:number|null;commissionPercent?:number;pricingType?:"fixed"|"from"|"per_unit";unitLabel?:string;notes?:string};

export async function getOwnerServices(){
  await ensureClinicTables();return client()`SELECT * FROM venux_services ORDER BY active DESC,category,service_name`;
}

export async function getOwnerService(serviceId:number){
  await ensureClinicTables();return (await client()`SELECT * FROM venux_services WHERE id=${serviceId} AND active=TRUE LIMIT 1`)[0]??null;
}

export async function createClinicService(values:ServiceImportRow){
  await ensureClinicTables();await client()`INSERT INTO venux_services (service_name,category,duration_minutes,regular_price,member_price,commission_percent,pricing_type,unit_label,price_notes)
    VALUES (${values.name},${values.category},${values.duration},${values.price},${values.memberPrice??null},${values.commissionPercent??0},${values.pricingType??"fixed"},${values.unitLabel??""},${values.notes??""})
    ON CONFLICT ((LOWER(service_name))) DO UPDATE SET category=EXCLUDED.category,duration_minutes=EXCLUDED.duration_minutes,regular_price=EXCLUDED.regular_price,member_price=EXCLUDED.member_price,commission_percent=EXCLUDED.commission_percent,pricing_type=EXCLUDED.pricing_type,unit_label=EXCLUDED.unit_label,price_notes=EXCLUDED.price_notes,active=TRUE,updated_at=NOW()`;
}

export async function importClinicServices(rows:ServiceImportRow[]){
  await ensureClinicTables();for(const row of rows)await createClinicService(row);return rows.length;
}

export async function getCityStaff(){
  await ensureClinicTables();const sql=client();
  const selected=await sql`SELECT * FROM venux_staff WHERE active=TRUE AND city_enabled=TRUE ORDER BY id LIMIT 3`;
  if(selected.length)return selected;
  return sql`SELECT * FROM venux_staff WHERE active=TRUE ORDER BY id LIMIT 3`;
}

export async function createCityStaff(fullName:string,role:string){
  await ensureClinicTables();await client()`INSERT INTO venux_staff (full_name,role,city_enabled) VALUES (${fullName},${role},TRUE)`;
}

export async function getCityDay(date:string){
  await ensureClinicTables();const sql=client();
  const [appointments,settlement]=await Promise.all([
    sql`SELECT a.*,c.full_name,c.mobile,s.full_name AS staff_name,v.service_name,v.duration_minutes AS catalog_duration,v.regular_price
      FROM venux_appointments a JOIN venux_clients c ON c.id=a.client_id
      LEFT JOIN venux_staff s ON s.id=a.staff_id LEFT JOIN venux_services v ON v.id=a.service_id
      WHERE a.clinic ILIKE '%515 Kent Street%' AND a.requested_date=${date}
      ORDER BY a.requested_time,s.full_name`,
    sql`SELECT COALESCE(s.full_name,'Unassigned') AS staff_name,
      COUNT(a.id) FILTER (WHERE a.status NOT IN ('cancelled','no_show'))::int AS projects,
      COALESCE(SUM(a.duration_minutes) FILTER (WHERE a.status NOT IN ('cancelled','no_show')),0)::int AS minutes,
      COALESCE(SUM(a.recognised_revenue) FILTER (WHERE a.status IN ('in_progress','completed')),0) AS revenue,
      COALESCE(SUM(a.staff_wage_amount) FILTER (WHERE a.status IN ('in_progress','completed')),0) AS payroll
      FROM venux_appointments a LEFT JOIN venux_staff s ON s.id=a.staff_id
      WHERE a.clinic ILIKE '%515 Kent Street%' AND a.requested_date=${date}
      GROUP BY s.id,s.full_name ORDER BY s.full_name`,
  ]);
  return {appointments,settlement};
}
