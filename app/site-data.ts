export const services = [
  {
    id: "skin",
    category: "Skin Treatments",
    eyebrow: "Skin expertise",
    description: "Personalised facials and skin therapies designed around your concerns, comfort and long-term goals.",
    items: ["Facial Treatments", "Rejuran® Skin Rejuvenation", "CO₂ Laser", "Lutronic Picosecond", "IPL Photorejuvenation", "Ultherapy®", "HIFU Focused Ultrasound", "RF Microneedling", "DMK Skin Revision", "LED Light Therapy"],
  },
  {
    id: "body",
    category: "Body Treatments",
    eyebrow: "Body care",
    description: "Begin with an individual assessment so recommendations can be matched to your body concerns and suitability.",
    items: ["Professional Waxing", "Laser Hair Removal", "Body Consultation", "Body Contouring", "Skin Tightening", "Stretch Marks & Scarring", "Personalised Body Plan"],
  },
  {
    id: "aesthetics",
    category: "Aesthetics",
    eyebrow: "Cosmetic aesthetics",
    description: "Higher-risk aesthetic procedures require an individual assessment with an appropriately qualified practitioner.",
    items: ["Rejuran® Skin Rejuvenation · New", "Lines & Wrinkles", "Facial Volume, Definition & Structure", "Hydration & Restoration", "Bio Remodelling", "Hyperhidrosis", "Lip Volume & Definition", "PDO Mono Threads", "Skin Rejuvenation"],
  },
  {
    id: "methods",
    category: "Treatment Methods",
    eyebrow: "Treatment technology",
    description: "Explore the considered methods used across VenuX skin care and consultation-led treatment planning.",
    items: ["Laser & Light", "Lutronic Picosecond", "Ultherapy®", "HIFU Focused Ultrasound", "Radiofrequency", "Enzyme Therapy"],
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
