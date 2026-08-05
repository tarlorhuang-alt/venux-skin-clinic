import { Footer, Header } from "../../site-chrome";
import { addOnPrices, facialPriceGroups } from "../../site-data";
import "./facial-treatments.css";

const concerns = [
  ["01", "Hydration & Glow", "Dullness, dehydration and an event-ready glow.", "hydration-glow"],
  ["02", "Acne & Oily Skin", "Congestion, excess oil and breakout-prone skin.", "acne-oily-skin"],
  ["03", "Sensitive & Barrier", "Comfort-focused support for delicate or compromised skin.", "sensitive-barrier-repair"],
  ["04", "Skin Revision", "Structured DMK pathways for individual revision goals.", "dmk-skin-revision"],
  ["05", "Anti-Ageing", "Texture, firmness and rejuvenation-focused facial care.", "anti-ageing-rejuvenation"],
  ["06", "Maintenance", "Express and ongoing treatments between larger appointments.", "express-maintenance"],
] as const;

const featured = [
  { name:"Glass Skin Facial", group:"Hydration & Glow", time:"90 min", regular:299, member:259, text:"A premium, multi-step facial selected for luminous-looking hydration and refined texture.", from:false },
  { name:"DMK Enzyme Therapy", group:"Skin Revision", time:"90 min", regular:210, member:168, text:"A consultation-led professional enzyme protocol within a structured skin revision plan.", from:true },
  { name:"Sothys Signature Facial", group:"Anti-Ageing", time:"90 min", regular:229, member:180, text:"A considered Sothys Paris experience combining professional technique and selected formulations.", from:false },
] as const;

const steps = [
  ["01", "Assess", "We review your concerns, skin history, current routine and treatment goals."],
  ["02", "Personalise", "The facial protocol, professional products and optional enhancements are selected for you."],
  ["03", "Treat", "Your practitioner delivers the treatment with comfort, skin response and safety in mind."],
  ["04", "Maintain", "You receive practical aftercare and, where appropriate, a home-care recommendation."],
] as const;

const faqs = [
  ["Which facial is right for me?", "Choose by your main concern as a starting point. Your practitioner will confirm the most appropriate facial after reviewing your skin, history and goals."],
  ["Do I need a consultation?", "A skin assessment forms part of professional treatment planning. Some advanced treatments may require a separate consultation before the appointment."],
  ["Can I add LED or a peel?", "Selected add-ons may be appropriate, but this depends on your skin, the main facial and treatment compatibility."],
  ["How often should I book a facial?", "Frequency varies with the treatment, your skin response, goals and home routine. Your practitioner can recommend a realistic schedule."],
  ["What does member price mean?", "Member prices apply to eligible VenuX members. Please review the Membership page or ask the clinic to confirm your eligibility."],
] as const;

const idFor = (category:string) => category.toLowerCase().replaceAll(" & ", "-").replaceAll(" ", "-");

export default function FacialTreatments(){ return <main><Header />
  <section className="facial-hero">
    <div className="facial-hero-copy"><a href="/treatments" className="back-link">← All treatments</a><p className="kicker">Professional facial therapy</p><h1>Facials,<br/><i>personalised.</i></h1><p>Professional skin treatments chosen around your concerns, skin condition and long-term goals—not a one-size-fits-all menu.</p><div><a className="button dark" href="#menu">Explore treatments</a><a className="button facial-outline" href="/book">Book a consultation</a></div></div>
    <div className="facial-hero-art" aria-hidden="true"><img src="/scientific-hero.png" alt=""/><span>Skin science<br/><i>meets care.</i></span></div>
  </section>

  <section className="concern-selector"><div className="facial-section-title"><p className="kicker">Choose by concern</p><h2>Where would you<br/><i>like to begin?</i></h2></div><div className="concern-grid">{concerns.map(([number,title,text,id])=><a href={`#${id}`} key={title}><span>{number}</span><h3>{title}</h3><p>{text}</p><b>Explore ↓</b></a>)}</div></section>

  <section className="featured-facials"><div className="facial-section-title light"><p className="kicker">Featured treatments</p><h2>Clinic<br/><i>favourites.</i></h2></div><div className="featured-grid">{featured.map((item,index)=><article key={item.name}><span>0{index+1} · {item.group}</span><h3>{item.name}</h3><p>{item.text}</p><div className="featured-price"><small>{item.time}</small><strong>{item.from&&"From "}${item.regular}</strong><em>Member {item.from&&"from "}${item.member}</em></div><a href="/book">Book this facial ↗</a></article>)}</div></section>

  <section className="facial-menu" id="menu"><div className="facial-section-title"><p className="kicker">Complete treatment menu</p><h2>Find your<br/><i>facial.</i></h2><p>All prices are in AUD. Treatment suitability is confirmed before your appointment.</p></div><div className="facial-menu-key"><span>Treatment</span><span>Duration</span><span>Regular</span><span>Member</span><span></span></div><div className="facial-groups">{facialPriceGroups.map(group=><section id={idFor(group.category)} key={group.number}><header><span>{group.number}</span><h3>{group.category}</h3></header>{group.items.map(([name,time,regular,member])=><div className="facial-row" key={name}><strong>{name}</strong><small>{time}</small><b>${regular}</b><em>${member}</em><a href="/book" aria-label={`Book ${name}`}>Book ↗</a></div>)}</section>)}<section id="add-ons"><header><span>07</span><h3>Add-ons</h3></header>{addOnPrices.map(([name,regular,member])=><div className="facial-row" key={name}><strong>{name}</strong><small>—</small><b>${regular}</b><em>${member}</em><a href="/book" aria-label={`Book ${name}`}>Add ↗</a></div>)}</section></div></section>

  <section className="facial-journey"><div className="facial-section-title"><p className="kicker">Your appointment</p><h2>Professional care,<br/><i>step by step.</i></h2></div><div>{steps.map(([number,title,text])=><article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

  <section className="facial-faq" id="questions"><div className="facial-section-title"><p className="kicker">Question & answer</p><h2>Before you<br/><i>book.</i></h2></div><div className="faq-list">{faqs.map(([q,a],index)=><details key={q}><summary><span>0{index+1}</span><strong>{q}</strong><i>＋</i></summary><p>{a}</p></details>)}</div></section>
  <section className="split-cta"><h2>Ready for your<br/>skin consultation?</h2><div><p>Start with a professional recommendation based on your concerns and goals.</p><a className="button light-button" href="/book">Book now</a></div></section><Footer />
</main>;}
