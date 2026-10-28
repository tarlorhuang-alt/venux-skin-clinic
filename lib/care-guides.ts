/** Map appointment descriptions to approved care-guide slugs. */
export function careSlug(treatment: string): string | null {
  const value = treatment.toLowerCase();
  if (/\b(prp|platelet.rich.plasma)\b/.test(value)) return "prp";
  if (/\b(hifu|ultherapy|ulthera|ultrasound.lift)\b/.test(value)) return "hifu";
  if (/\b(dmk|enzyme)\b/.test(value)) return "dmk";
  if (/\b(ipl|photofacial|photo.rejuvenation)\b/.test(value)) return "ipl";
  if (/\b(?:venus[ -]?)?viva\b|nano[ -]?fractional|点阵射频/i.test(value)) return "fractional-rf";
  if (/\b(rf[ -]?micro[ -]?needling|radiofrequency[ -]?micro[ -]?needling|morpheus\s*8|gold[ -]?(?:micro)?needling)\b|黄金微针|射频微针/.test(value)) return "rf-microneedling";
  if (/\b(microneedling|micro[ -]?needling|dermapen|skin[ -]?needling)\b|微针/.test(value)) return "microneedling";
  if (/\b(skin[ -]?booster|profhilo|rejuran|mesotherapy)\b|水光/.test(value)) return "skin-booster";
  if (/\b(botox|botulinum|anti[ -]?wrinkle(?: injection)?|dysport|xeomin)\b|肉毒/.test(value)) return "botox";
  if (/\b(?:dermal[ -]?)?fillers?\b|玻尿酸填充|填充注射/.test(value)) return "filler";
  if (/\b(?:co2|erbium|ablative|hair[ -]?(?:removal|remove)|tattoo)\b|脱毛|剥脱/.test(value)&&/laser|激光|co2|ablative|erbium/.test(value)) return "general";
  if (/\b(laser[ -]?toning|pico(?:second|sure|way)?)\b|祛斑激光|色素激光|皮秒/.test(value)||(/\b(pigment(?:ation)?|pigment[ -]?removal|pih|age[ -]?spot)\b/.test(value)&&/\blaser\b/.test(value))) return "laser";
  if (/\blaser\b|激光/.test(value)) return "general";
  if (/\b(facial|deep.clean|hydra|infusion|payot)\b/.test(value)) return "facial";
  return "general";
}
export function carePath(treatment: string, stage: "pre" | "after"): string | null {
  const slug = careSlug(treatment);
  return slug ? `/care/${slug}/${stage}` : null;
}

/** Include every recognised component of a combination visit. */
export function careSlugs(treatment:string):string[]{
  const parts=treatment.split(/\s*(?:\+|&|,|;|\/|\band\b)\s*(?![^()]*\))/i);
  return [...new Set(parts.map(part=>careSlug(part)||"general"))];
}
