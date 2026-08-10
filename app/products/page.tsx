import type { Metadata } from "next";
import { Footer, Header } from "../site-chrome";
import "./products.css";

export const metadata: Metadata = {
  title: "Sothys & DMK Skincare Products | VenuX Skin Clinic",
  description: "Browse professional Sothys Paris and DMK home-care products available to enquire about through VenuX Skin Clinic.",
};

const productGroups = [
  {
    brand: "Sothys Paris",
    origin: "French professional skincare",
    tone: "sothys",
    intro: "A curated home-care edit for hydration, comfort and daily skin support.",
    products: [
      { name: "Hydra-plumping Mask", size: "50 ml", type: "Hydration mask", description: "A weekly mask option for skin that feels dehydrated or in need of added comfort.", source: "https://www.sothys.com.au/en/products/face/masks/hydra-plumping-mask" },
      { name: "Hydra Protective Serum", size: "50 ml", type: "Hydrating serum", description: "A lightweight serum option designed to support hydration and daily protection.", source: "https://www.sothys.com.au/en/products/face/serums/hydra-protective-serum" },
      { name: "Hydra Protective Cream", size: "50 ml", type: "Moisturising cream", description: "Daily moisturising care for a comfortable, hydrated skin routine.", source: "https://www.sothys.com.au/en/products/face/creams/hydra-protective-cream" },
      { name: "Hydrating Intensive Serum", size: "50 ml", type: "Intensive serum", description: "Targeted intensive hydration for a personalised professional home-care plan.", source: "https://www.sothys.com.au/en/products/face/serums/hydrating-intensive-serum" },
      { name: "Regenerative Solution", size: "Clinic confirmed", type: "Targeted serum", description: "A targeted product selected according to individual skin needs and professional advice.", source: "https://www.sothys.com.au/en/products/face/serums/regenerative-solution" },
    ],
  },
  {
    brand: "DMK",
    origin: "Professional skin revision home care",
    tone: "dmk",
    intro: "DMK products are selected as part of a professionally planned skin revision pathway.",
    products: [
      { name: "Herb & Mineral Mist", size: "60 ml / 120 ml", type: "Hydrating mist", description: "A home-care mist used within selected DMK routines and prescribed protocols.", source: "https://www.dmkskin.com.au/product-Herb-and-mineral-mist" },
      { name: "Beta Gel", size: "30 ml", type: "Professional serum", description: "A professional home-care serum supplied following a DMK skin consultation.", source: "https://www.dmkskin.com.au/product-beta-gel" },
      { name: "Fine Line Crème", size: "30 ml", type: "Targeted crème", description: "Targeted home care considered for selected areas within an individual DMK plan.", source: "https://www.dmkskin.com.au/product-fine-line-creme" },
      { name: "Eye Tone", size: "15 ml", type: "Eye care", description: "Professional eye-area home care selected according to assessment and routine.", source: "https://www.dmkskin.com.au/product-eye-tone" },
      { name: "Acu Crème", size: "15 ml / 50 ml", type: "Professional crème", description: "A DMK crème supplied only when appropriate for the client’s prescribed home-care plan.", source: "https://www.dmkskin.com.au/product-acu-creme" },
    ],
  },
] as const;

export default function ProductsPage() {
  return <main><Header />
    <section className="products-hero">
      <div>
        <p className="kicker">Professional home care</p>
        <h1>Sothys &amp; DMK<br /><span className="title-accent">selected for your skin.</span></h1>
        <p>Explore professional products available to enquire about through VenuX. Our clinic confirms the correct product, current stock and retail price before purchase.</p>
        <div className="hero-actions"><a className="button dark" href="#catalogue">View products</a><a className="text-link" href="/book">Ask for product advice ↗</a></div>
      </div>
      <div className="product-hero-art" aria-hidden="true"><div className="bottle bottle-one"><span>DMK</span></div><div className="bottle bottle-two"><span>Sothys</span></div><span className="product-orbit" /></div>
    </section>

    <section className="product-standard">
      <article><span>01</span><h3>Professional selection</h3><p>Products are matched to your skin, treatment history and current routine.</p></article>
      <article><span>02</span><h3>Clinic-confirmed stock</h3><p>Availability, size and retail price are confirmed before payment.</p></article>
      <article><span>03</span><h3>Continued support</h3><p>Our team can help you understand how each product fits into your home care.</p></article>
    </section>

    <section className="retail-catalogue" id="catalogue">
      {productGroups.map((group, groupIndex) => <section className={`retail-brand ${group.tone}`} key={group.brand}>
        <div className="retail-brand-heading">
          <span>0{groupIndex + 1}</span>
          <div><p className="kicker">{group.origin}</p><h2>{group.brand}</h2><p>{group.intro}</p></div>
        </div>
        <div className="retail-grid">
          {group.products.map((product, index) => <article className="retail-card" key={product.name}>
            <div className="product-pack" aria-hidden="true"><span>{group.brand}</span><b>{String(index + 1).padStart(2, "0")}</b></div>
            <div className="retail-card-copy">
              <p className="product-type">{product.type}</p>
              <h3>{product.name}</h3>
              <span className="product-size">{product.size}</span>
              <p>{product.description}</p>
              {group.brand === "DMK" ? <small>Professional consultation required</small> : <small>Price and availability confirmed by clinic</small>}
              <div className="product-actions"><a className="button dark" href={`/book?product=${encodeURIComponent(product.name)}`}>Enquire to purchase</a><a href={product.source} target="_blank" rel="noreferrer">Official details ↗</a></div>
            </div>
          </article>)}
        </div>
      </section>)}
    </section>

    <section className="product-next">
      <div><p className="kicker">Product consultation</p><h2>Build a routine<br /><span className="title-accent">with purpose.</span></h2></div>
      <div><p>Tell us what you currently use and what you would like to improve. The VenuX team will confirm the recommended Sothys or DMK products, current stock and exact price before purchase.</p><a className="text-link" href="/book">Request product advice ↗</a></div>
    </section>
    <Footer />
  </main>;
}
