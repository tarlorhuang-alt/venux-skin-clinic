import type { Metadata } from "next";
import { Footer, Header } from "../../../site-chrome";
import "../ipl.css";

export const metadata: Metadata = {
  title: "How IPL Works & Illustrative Examples | VenuX Skin Clinic",
  description: "A visual explanation of IPL, the concerns it may address and illustrative treatment examples. Consultation is required.",
};

const examples = [
  ["Sun spots & freckles", "Selected superficial pigment may temporarily darken before gradually lifting from the skin.", "pigment"],
  ["Diffuse facial redness", "Selected light wavelengths can be absorbed by haemoglobin to reduce the appearance of visible redness.", "redness"],
  ["Uneven photo-damaged tone", "A considered treatment plan may help the complexion look clearer and more even over time.", "tone"],
] as const;

export default function IplExamplesPage() {
  return <main><Header />
    <section className="ipl-subhero">
      <div><a className="back-link" href="/treatments/ipl">← IPL overview</a><p className="kicker">IPL visual guide</p><h1>Light, target<br /><i>& response.</i></h1><p className="ipl-lead">A visual explanation of how IPL interacts with selected pigment and redness. These diagrams are educational illustrations—not photographs of guaranteed results.</p></div>
      <div className="spectrum-illustration" aria-label="Illustration showing filtered light reaching a selected target in the skin"><span className="light-source">IPL</span><i className="beam beam-a"/><i className="beam beam-b"/><i className="beam beam-c"/><div className="skin-layers"><b>Skin surface</b><span/><span/><em>Selected target</em></div></div>
    </section>

    <section className="visual-process"><div><p className="kicker">01 · Illustrated principle</p><h2>From pulse<br />to target.</h2></div><div className="process-rail"><article><span>01</span><div className="process-orb light-orb"/><h3>Filtered light</h3><p>The practitioner selects filters and parameters after assessing the skin and concern.</p></article><article><span>02</span><div className="process-orb target-orb"/><h3>Selective absorption</h3><p>Melanin or haemoglobin absorbs selected wavelengths more strongly than surrounding tissue.</p></article><article><span>03</span><div className="process-orb response-orb"/><h3>Gradual response</h3><p>Targeted pigment or redness may change gradually as the skin completes its natural response.</p></article></div></section>

    <section className="example-section"><div className="section-heading"><div><p className="kicker">02 · Example concerns</p><h2>What we assess<br /><i>before treatment.</i></h2></div><p>IPL is not suitable for every pigment type or every skin tone. A consultation helps distinguish an appropriate cosmetic concern from a lesion that requires medical assessment.</p></div><div className="example-grid">{examples.map(([title, description, type], index)=><article key={title}><div className={`example-swatch ${type}`}><span>Illustrative pattern</span></div><small>0{index+1}</small><h3>{title}</h3><p>{description}</p></article>)}</div></section>

    <section className="comparison-note"><div><p className="kicker">Important</p><h2>Examples are<br />not promises.</h2></div><div><p>Responses vary with the concern, skin characteristics, treatment parameters, number of sessions, sun exposure and aftercare. Images and diagrams on this page are illustrative and are not patient before-and-after photographs.</p><a className="button dark" href="/book">Book a skin assessment</a></div></section>

    <section className="ipl-page-links"><a href="/treatments/ipl"><span>01</span><strong>IPL overview</strong><em>Science, suitability and appointment guidance ↗</em></a><a href="/treatments/ipl/pricing"><span>02</span><strong>IPL price list</strong><em>Regular and member pricing by area ↗</em></a></section><Footer />
  </main>;
}
