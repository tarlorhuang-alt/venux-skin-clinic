import "server-only";
import { neon } from "@neondatabase/serverless";
import { addOnPrices, facialPriceGroups } from "../app/site-data";

export type PriceDefinition = {
  key: string;
  group: string;
  name: string;
  regular: number;
  member: number;
  memberRate: 80 | 85;
};

export type StoredPrice = PriceDefinition & { updatedAt?: string };

export const priceKey = (group: string, name: string) => `${group}:${name}`;

const advanced: Array<[string, string, number, number, (80 | 85)?]> = [
  ["Ultherapy", "Brow + eye · approx. 200 lines", 1250, 1000],
  ["Ultherapy", "Lower face + jawline · approx. 450 lines", 2200, 1760],
  ["Ultherapy", "Full face + upper neck · approx. 700 lines", 2700, 2160],
  ["Ultherapy", "Full face + neck · approx. 900 lines", 3000, 2400],
  ["Ultherapy", "Chest · Décolletage", 1200, 960],
  ["Rejuran", "2 ml · Single session", 650, 553, 85],
  ["Rejuran", "4 ml total · Two-session course", 1200, 1020, 85],
  ["Rejuran", "6 ml total · Three-session course", 1800, 1530, 85],
  ["IPL", "Full face", 229, 183], ["IPL", "Face + neck", 299, 239],
  ["IPL", "Face + neck + décolletage", 369, 299], ["IPL", "Décolletage", 189, 149],
  ["IPL", "Hands", 129, 99], ["IPL", "Spot treatment", 59, 49],
  ["CO2 Laser", "Eye area", 499, 399], ["CO2 Laser", "Mouth or chin", 499, 399],
  ["CO2 Laser", "Forehead", 499, 399], ["CO2 Laser", "Cheeks", 699, 559],
  ["CO2 Laser", "Neck", 699, 559], ["CO2 Laser", "Décolletage", 799, 639],
  ["CO2 Laser", "Full face", 1299, 1039], ["CO2 Laser", "Full face + neck", 1699, 1359],
  ["CO2 Laser", "Face + neck + décolletage", 2199, 1759], ["CO2 Laser", "Scar or small area", 299, 239],
  ["Lutronic Picosecond", "Single pigment spot", 149, 119], ["Lutronic Picosecond", "Small area", 249, 199],
  ["Lutronic Picosecond", "Half face", 299, 239], ["Lutronic Picosecond", "Full face", 449, 359],
  ["Lutronic Picosecond", "Neck", 349, 279], ["Lutronic Picosecond", "Face + neck", 649, 519],
  ["Lutronic Picosecond", "Hands", 249, 199], ["Lutronic Picosecond", "Tattoo removal · small area", 149, 119],
  ["AYKO HIFU", "Brow area", 399, 319], ["AYKO HIFU", "Eye area", 499, 399],
  ["AYKO HIFU", "Under chin", 695, 556], ["AYKO HIFU", "Jawline + lower face", 899, 719],
  ["AYKO HIFU", "Lower face + neck", 1200, 960], ["AYKO HIFU", "Full face + under chin", 1600, 1280],
  ["AYKO HIFU", "Full face + neck", 2200, 1760], ["AYKO HIFU", "Body area", 899, 719],
  ["LED", "Face", 49, 39], ["LED", "Face + neck", 69, 55], ["LED", "Course of 6 · face", 249, 199],
  ["AYKO RF Microneedling", "Eye area", 299, 239], ["AYKO RF Microneedling", "Cheeks", 399, 319],
  ["AYKO RF Microneedling", "Lower face", 449, 359], ["AYKO RF Microneedling", "Full face", 599, 479],
  ["AYKO RF Microneedling", "Neck", 449, 359], ["AYKO RF Microneedling", "Face + neck", 799, 639],
  ["AYKO RF Microneedling", "Body · small area", 599, 479], ["AYKO RF Microneedling", "Body · large area", 899, 719],
];

const hairAreas: Array<[string, number, number | null]> = [
  ["Upper lip", 20, 20], ["Chin", 20, 20], ["Eyebrow shaping", 25, null], ["Full face", 65, 65],
  ["Underarms", 25, 25], ["Standard bikini", 30, 30], ["Brazilian", 65, 65], ["Half arms", 45, 45],
  ["Full arms", 65, 65], ["Half legs", 55, 55], ["Full legs", 85, 85], ["Chest or back", 75, 75],
  ["Full legs + Brazilian + underarms", 155, 155],
];

const facialDefinitions: PriceDefinition[] = facialPriceGroups.flatMap((group) =>
  group.items.map(([name, , regular, member]) => ({
    key: priceKey(group.category === "DMK Skin Revision" ? "DMK" : "Facial", name),
    group: group.category === "DMK Skin Revision" ? "DMK" : `Facial · ${group.category}`,
    name,
    regular,
    member,
    memberRate: group.category === "DMK Skin Revision" ? 85 : 80,
  })),
);

export const priceCatalogue: PriceDefinition[] = [
  ...facialDefinitions,
  ...addOnPrices.map(([name, regular, member]) => ({ key: priceKey("Add-on", name), group: "Facial · Add-ons", name, regular, member, memberRate: 80 as const })),
  ...advanced.map(([group, name, regular, member, memberRate = 80]) => ({ key: priceKey(group, name), group, name, regular, member, memberRate })),
  ...hairAreas.flatMap(([name, waxing, laser]) => [
    { key: priceKey("Waxing", name), group: "Waxing", name, regular: waxing, member: Math.round(waxing * 0.8), memberRate: 80 as const },
    ...(laser === null ? [] : [{ key: priceKey("Laser Hair Removal", name), group: "Laser Hair Removal", name, regular: laser, member: Math.round(laser * 0.8), memberRate: 80 as const }]),
  ]),
];

let tableReady: Promise<void> | undefined;

function sqlClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

function ensureTable() {
  if (!tableReady) {
    const sql = sqlClient();
    tableReady = sql`
      CREATE TABLE IF NOT EXISTS venux_prices (
        price_key TEXT PRIMARY KEY,
        regular_price INTEGER NOT NULL CHECK (regular_price >= 0),
        member_price INTEGER NOT NULL CHECK (member_price >= 0),
        member_rate INTEGER NOT NULL CHECK (member_rate IN (80, 85)),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `.then(() => undefined);
  }
  return tableReady;
}

export async function getPriceMap(): Promise<Map<string, StoredPrice>> {
  const fallback = new Map<string, StoredPrice>(priceCatalogue.map((item) => [item.key, item]));
  try {
    await ensureTable();
    const rows = await sqlClient()`SELECT price_key, regular_price, member_price, member_rate, updated_at FROM venux_prices`;
    for (const row of rows) {
      const base = fallback.get(String(row.price_key));
      if (!base) continue;
      fallback.set(base.key, {
        ...base,
        regular: Number(row.regular_price),
        member: Number(row.member_price),
        memberRate: Number(row.member_rate) === 85 ? 85 : 80,
        updatedAt: String(row.updated_at),
      });
    }
  } catch (error) {
    console.error("VenuX price database unavailable; using verified fallback prices.", error instanceof Error ? error.message : "Unknown error");
  }
  return fallback;
}

export function resolvePrice(map: Map<string, StoredPrice>, group: string, name: string, regular: number, member: number) {
  return map.get(priceKey(group, name)) ?? { key: priceKey(group, name), group, name, regular, member, memberRate: 80 as const };
}

export async function savePriceRows(rows: Array<{ key: string; regular: number; member?: number; memberRate: 80 | 85 }>) {
  await ensureTable();
  const allowed = new Set(priceCatalogue.map((item) => item.key));
  const clean = rows.filter((row) => allowed.has(row.key) && Number.isInteger(row.regular) && row.regular >= 0);
  const payload = clean.map((row) => ({
    price_key: row.key,
    regular_price: row.regular,
    member_price: row.member ?? Math.round(row.regular * (row.memberRate / 100)),
    member_rate: row.memberRate,
  }));
  if (!payload.length) return;
  const json = JSON.stringify(payload);
  await sqlClient()`
    INSERT INTO venux_prices (price_key, regular_price, member_price, member_rate)
    SELECT price_key, regular_price, member_price, member_rate
    FROM jsonb_to_recordset(${json}::jsonb)
      AS x(price_key TEXT, regular_price INTEGER, member_price INTEGER, member_rate INTEGER)
    ON CONFLICT (price_key) DO UPDATE SET
      regular_price = EXCLUDED.regular_price,
      member_price = EXCLUDED.member_price,
      member_rate = EXCLUDED.member_rate,
      updated_at = NOW()
  `;
}
