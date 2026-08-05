export const services = [
  {
    category: "Facial Treatments",
    eyebrow: "肌肤管理",
    description: "Personalised facials designed around your skin, comfort and long-term goals.",
    items: ["Hydration & Barrier Repair", "Glass Skin Facial", "Acne Clarifying Facial", "Professional Facial"],
  },
  {
    category: "Advanced Skin",
    eyebrow: "进阶护理",
    description: "Considered options for texture, hydration and visible skin renewal.",
    items: ["LED Light Therapy", "DMK Enzyme Therapy", "Carbon Laser Facial", "Skin Consultation"],
  },
  {
    category: "Clinical Consultation",
    eyebrow: "专业评估",
    description: "Higher-risk cosmetic procedures require an individual assessment with an appropriately qualified practitioner.",
    items: ["Suitability Assessment", "Individual Treatment Plan", "Risks & Recovery Discussion", "Personalised Quotation"],
  },
];

export const facialPrices = [
  ["Sothys Hydra Revitalizing Facial", "70 min", 155, 125],
  ["LED Light Therapy", "20 min", 49, 39],
  ["Glass Skin Facial", "90 min", 299, 259],
  ["Acne Clarifying Facial", "90 min", 229, 180],
  ["Salicylic Peel Facial", "70 min", 170, 129],
  ["Mini Express + Hydra Peel Deep Clean", "70 min", 155, 129],
  ["Collagen Boost Facial", "75 min", 229, 183],
  ["Sothys Barrier Repair Facial + LED", "75 min", 165, 129],
  ["Sensitive Skin Soothing Facial", "90 min", 299, 180],
  ["DMK Enzyme Therapy", "90 min", 259, 220],
  ["Sothys Professional Facial", "90 min", 229, 180],
  ["SkinCeuticals Corrective Facial", "90 min", 229, 180],
  ["Hydrating Eye Treatment", "30 min", 109, 89],
  ["Carbon Laser Facial (collagen boosting)", "60 min", 249, 199],
] as const;

export const addOnPrices = [
  ["Chemical Peel", 59, 49],
  ["Polar", 139, 99],
  ["LED Light Therapy", 49, 39],
  ["Ampule Infusion", 49, 39],
] as const;
