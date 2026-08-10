import type { Metadata } from "next";
import { Footer, Header, PageHero } from "../../site-chrome";

export const metadata: Metadata = {
  title: "Rejuran® Skin Rejuvenation | VenuX Skin Clinic",
  description: "Explore consultation-led Rejuran skin rejuvenation at VenuX, including 2 ml single sessions and three-session courses.",
};

const options = [
  { amount: "2 ml", name: "Single session", price: "$650", detail: "A single consultation-led session for a selected treatment area." },
  { amount: "4 ml total", name: "Two-session course", price: "$1,200", detail: "Two 2 ml sessions planned around your assessment and treatment goals." },
  { amount: "6 ml total", name: "Three-session course", price: "$1,800", detail: "Three 2 ml sessions delivered as a personalised treatment course." },
] as const;

const questions = [
  ["What is Rejuran?", "Rejuran is a polynucleotide-based skin rejuvenation treatment. Suitability, treatment area and expected outcomes are discussed during consultation."],
  ["How many sessions are recommended?", "A course may be recommended for progressive treatment, but the appropriate number and spacing of sessions varies between clients."],
  ["What should I expect after treatment?", "Temporary redness, swelling, small raised injection points, tenderness or bruising may occur. Your practitioner will explain expected recovery and aftercare before you proceed."],
  ["Is everyone suitable?", "No. Medical history, pregnancy or breastfeeding, infection, medication and other individual factors may affect suitability. An appropriate clinical assessment is required."],
] as const;

export default function RejuranPage() {
  return <main><Header />
    <PageHero kicker="Polynucleotide skin rejuvenation" title="Rejuran®." italic="A considered skin course." intro="A consultation-led treatment pathway for clients seeking support for skin quality, texture and hydration. Individual results and treatment plans vary." />

    <section className="treatment-product-hero rejuran-visual">
      <div><p className="kicker light">Clinical consultation required</p><h2>Precision-led<br />skin rejuvenation.</h2><p>Your practitioner will review your medical history, concerns and treatment goals before confirming the appropriate amount and course.</p><a className="button light-button" href="/book?treatment=Rejuran">Book an assessment</a></div>
    </section>

    <section className="outcome-illustration">
      <div className="section-heading"><div><p className="kicker">Illustrative treatment focus</p><h2>Texture, balance<br />and hydration.</h2></div><p>This original educational image demonstrates the type of skin-quality progression a treatment plan may focus on. It is not a patient before-and-after image and does not promise a result.</p></div>
      <div className="skin-outcome-image" role="img" aria-label="Educational illustration of gradual skin texture and hydration change" />
      <div className="outcome-labels"><span>01 · Texture assessment</span><span>02 · Progressive course</span><span>03 · Individual response</span></div>
    </section>

    <section className="course-pricing" id="prices">
      <div className="section-heading"><div><p className="kicker">Session pricing</p><h2>Choose a single session<br />or planned course.</h2></div><p>All prices are in AUD. The 4 ml and 6 ml options are total course volumes delivered across two and three sessions respectively.</p></div>
      <div className="course-grid">{options.map((option,index)=><article key={option.amount}><span>0{index+1}</span><small>{option.amount}</small><h3>{option.name}</h3><strong>{option.price}</strong><p>{option.detail}</p><a href={`/book?treatment=${encodeURIComponent(`Rejuran ${option.name}`)}`}>Request appointment ↗</a></article>)}</div>
      <div className="clinical-notice"><div><span>French hydration treatment</span><h3>Private consultation</h3></div><p>VenuX also offers a consultation for French skin hydration and remodelling options. Brand, suitability and a personalised quotation are discussed privately with an appropriately qualified practitioner in line with Australian advertising requirements.</p><a href="/book?treatment=French%20Skin%20Hydration%20Consultation" className="text-link">Book consultation ↘</a></div>
    </section>

    <section className="faq-section" id="questions">
      <div className="faq-intro"><p className="kicker">Question &amp; Answer</p><h2>Important treatment<br />information.</h2><p>This page is general information only and does not replace an individual clinical consultation.</p></div>
      <div className="faq-list">{questions.map(([question,answer],index)=><details key={question}><summary><span>0{index+1}</span><strong>{question}</strong><span>＋</span></summary><p>{answer}</p></details>)}</div>
    </section>
    <Footer />
  </main>;
}
