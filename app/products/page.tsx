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
      { name: "Hydra-plumping Mask", size: "50 ml", type: "Hydration mask", price: "Clinic-confirmed AU price", priceNote: "The Sothys Australia product page does not publish an AUD retail price.", image: "https://www.sothys.com.au/images/HYDRA22-mask-hydra-1_5035_800.jpg", description: "A weekly mask option for skin that feels dehydrated or in need of added comfort.", source: "https://www.sothys.com.au/en/products/face/masks/hydra-plumping-mask" },
      { name: "Hydra Protective Serum", size: "50 ml", type: "Hydrating serum", price: "Clinic-confirmed AU price", priceNote: "The Sothys Australia product page does not publish an AUD retail price.", image: "https://www.sothys.com.au/images/serum-hydra-protecteur-peaux-normales-mixtes-sothys-paris-2026-1_6548_800.jpg", description: "A lightweight serum option designed to support hydration and daily protection.", source: "https://www.sothys.com.au/en/products/face/serums/hydra-protective-serum" },
    ],
  },
  {
    brand: "DMK",
    origin: "Professional skin revision home care",
    tone: "dmk",
    intro: "DMK products are selected as part of a professionally planned skin revision pathway.",
    products: [
      { name: "Herb & Mineral Mist", size: "120 ml", type: "Hydrating mist", price: "$89 current stockist price", priceNote: "Current Australian authorised-stockist price; VenuX confirms its own current selling price before purchase.", image: "https://thebeautyshop.com.au/cdn/shop/files/dmk-herb-mineral-mist-120ml-793573633002-341743.jpg?width=800", description: "A home-care mist used within selected DMK routines and prescribed protocols.", source: "https://thebeautyshop.com.au/products/herb-mineral-mist-120ml" },
      { name: "Beta Gel", size: "30 ml", type: "Professional serum", price: "$169 current stockist price", priceNote: "Current Australian authorised-stockist price; professional prescription is required.", image: "https://thebeautyshop.com.au/cdn/shop/files/dmk-beta-gel-30ml-793573632869-910066.jpg?width=800", description: "A professional home-care serum supplied following a DMK skin consultation.", source: "https://thebeautyshop.com.au/products/beta-gel-30ml" },
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
            <div className="product-pack official-product-image"><img src={product.image} alt={`${group.brand} ${product.name}`} /><b>{String(index + 1).padStart(2, "0")}</b></div>
            <div className="retail-card-copy">
              <p className="product-type">{product.type}</p>
              <h3>{product.name}</h3>
              <span className="product-size">{product.size}</span>
              <strong className="product-price">{product.price}</strong>
              <p>{product.description}</p>
              <small>{product.priceNote}</small>
              <div className="product-actions"><a className="button dark" href={`/book?product=${encodeURIComponent(product.name)}`}>Enquire to purchase</a><a href={product.source} target="_blank" rel="noreferrer">{group.brand === "DMK" ? "Authorised stockist source ↗" : "Official details ↗"}</a></div>
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
