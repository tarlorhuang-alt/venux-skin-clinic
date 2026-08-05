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
    items: ["LED Light Therapy", "DMK Enzyme Therapy", "Carbon Laser Rejuvenation", "Skin Consultation"],
  },
  {
    category: "Clinical Consultation",
    eyebrow: "专业评估",
    description: "Higher-risk cosmetic procedures require an individual assessment with an appropriately qualified practitioner.",
    items: ["Suitability Assessment", "Individual Treatment Plan", "Risks & Recovery Discussion", "Personalised Quotation"],
  },
];

export const facialPriceGroups = [
  {
    number: "01",
    category: "Express & Maintenance",
    items: [
      ["Express Hydra Peel Facial", "70 min", 155, 129],
      ["LED Light Therapy", "20 min", 49, 39],
    ],
  },
  {
    number: "02",
    category: "Hydration & Glow",
    items: [
      ["Sothys Hydra Revitalizing Facial", "70 min", 155, 125],
      ["Glass Skin Facial", "90 min", 299, 259],
      ["SkinCeuticals Corrective Facial", "90 min", 229, 180],
    ],
  },
  {
    number: "03",
    category: "Acne & Oily Skin",
    items: [
      ["Acne Clarifying Facial", "90 min", 229, 180],
      ["Salicylic Peel Facial", "70 min", 170, 129],
    ],
  },
  {
    number: "04",
    category: "DMK Skin Revision",
    items: [
      ["DMK Enzyme Therapy Level 1", "90 min", 210, 168],
      ["DMK Enzyme Therapy Level 2", "90 min", 235, 188],
      ["DMK Enzyme Therapy Level 3", "90 min", 280, 224],
      ["DMK Enzyme Therapy Level 4", "90 min", 310, 248],
    ],
  },
  {
    number: "05",
    category: "Sensitive & Barrier Repair",
    items: [
      ["Calming Recovery Facial", "90 min", 299, 239],
      ["Sothys Barrier Repair Facial + LED", "75 min", 165, 129],
    ],
  },
  {
    number: "06",
    category: "Anti-Ageing & Rejuvenation",
    items: [
      ["Collagen Boost Facial", "75 min", 229, 183],
      ["Sothys Signature Facial", "90 min", 229, 180],
      ["Carbon Laser Rejuvenation", "60 min", 249, 199],
      ["Hydrating Eye Treatment", "30 min", 109, 89],
    ],
  },
] as const;

export const addOnPrices = [
  ["Chemical Peel", 59, 49],
  ["Ampoule Infusion", 49, 39],
  ["LED Light Therapy", 49, 39],
  ["Polar RF", 139, 99],
] as const;
