/** Map appointment descriptions to approved care-guide slugs. */
export function careSlug(treatment: string): string | null {
  const value = treatment.toLowerCase();
  if (/\b(prp|platelet.rich.plasma)\b/.test(value)) return "prp";
  if (/\b(hifu|ultherapy|ulthera|ultrasound.lift)\b/.test(value)) return "hifu";
  if (/\b(dmk|enzyme)\b/.test(value)) return "dmk";
  if (/\b(ipl|photofacial|photo.rejuvenation)\b/.test(value)) return "ipl";
  if (/\b(rf[ -]?microneedling|radiofrequency[ -]?microneedling|venus[ -]?viva|microneedling|micro[ -]?needling)\b/.test(value)) return "rf-microneedling";
  if (/\b(facial|deep.clean|hydra|infusion|payot)\b/.test(value)) return "facial";
  return "general";
}
export function carePath(treatment: string, stage: "pre" | "after"): string | null {
  const slug = careSlug(treatment);
  return slug ? `/care/${slug}/${stage}` : null;
}

/** Include every recognised component of a combination visit. */
export function careSlugs(treatment:string):string[]{
  const parts=treatment.split(/\s*(?:\+|&|,|;|\band\b)\s*/i);
  return [...new Set(parts.map(part=>careSlug(part)||"general"))];
}
