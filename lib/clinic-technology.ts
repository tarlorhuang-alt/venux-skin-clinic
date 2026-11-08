export const clinicTechnology = [
 {
  slug:"m22",name:"M22",brand:"Lumenis",category:"Light-based skin treatments",mark:"IPL",tagline:"A considered approach to skin clarity.",
  intro:"A modular light and laser platform used for selected skin concerns. Your practitioner confirms the installed handpiece, treatment mode and suitability during consultation.",
  science:"The M22 platform supports different treatment modules. Its IPL module delivers filtered pulses of broad-spectrum light, rather than a laser beam, to target selected pigment and vascular concerns. Other modules have different indications and recovery requirements; the available module is confirmed before treatment.",
  concerns:["Selected sun spots and uneven tone","Visible redness and selected superficial vessels","Skin quality and photodamage assessment"],
  before:"Tell your practitioner about recent tanning, medications, photosensitivity, active skin conditions and previous reactions to light or laser treatments. Pigmented lesions need appropriate assessment before treatment.",
  during:"Protective eyewear is required. The practitioner selects the appropriate module and settings for your assessed skin type and concern; a test patch may be recommended. Sensations and treatment duration vary.",
  after:"With IPL, temporary redness, swelling or darkening of treated pigment may occur. Burns, blistering and pigment changes are possible. Follow the specific instructions for the module used, avoid picking and protect the treated skin from sun exposure.",
  care:"/care/ipl/after",careLabel:"IPL aftercare",note:"IPL aftercare applies only when the IPL module is used. Other M22 treatments require their own individual instructions."
 },
 {
  slug:"morpheus8",name:"Morpheus8",brand:"InMode",category:"Radiofrequency microneedling",mark:"RF",tagline:"Precision for texture and firmness.",
  intro:"A radiofrequency microneedling treatment assessed for selected texture, acne-scar and firmness concerns. Treatment depth, energy and area are planned individually.",
  science:"Morpheus8 combines fine needles with radiofrequency energy delivered at selected depths. The controlled treatment response is intended to support tissue remodelling over time. It is distinct from non-invasive radiofrequency and from other microneedling platforms.",
  concerns:["Uneven texture and selected acne scars","Fine lines and skin firmness","Selected face and body areas"],
  before:"Disclose medications, implanted devices, active infection, healing problems, previous procedures and any history of pigment changes. Your practitioner assesses suitability, anatomy and treatment expectations first.",
  during:"Anaesthetic may be used as clinically appropriate. Needle depth, energy and passes are selected for the area and skin response. Discomfort, pinpoint bleeding and temporary swelling may occur.",
  after:"Redness, swelling, tenderness and small crusts can occur. Risks include infection, burns, scarring, pigment changes and unwanted tissue changes. Follow gentle cleansing, barrier care and sun-protection instructions; contact the clinic for symptoms that worsen or concern you.",
  care:"/care/rf-microneedling/after",careLabel:"RF microneedling aftercare",note:"Recovery and the number of sessions vary with the treatment area, settings and individual response. Your practitioner provides personalised instructions."
 }
] as const;
