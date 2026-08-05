import type { Metadata } from "next";
import { Footer, Header } from "../site-chrome";
import "./products.css";

export const metadata: Metadata = { title:"Professional Skincare Products | VenuX Skin Clinic", description:"Explore VenuX professional Sothys Paris and DMK home-care categories. Product selection and availability are confirmed by the clinic." };

const brands = [
  {name:"Sothys Paris",origin:"French professional skincare",tone:"sothys",intro:"A professional range considered for cleansing, hydration, barrier support and personalised home-care routines.",categories:["Cleansers & preparation","Serums & targeted care","Moisturisers & barrier support","Masks & weekly care"]},
  {name:"DMK",origin:"Skin revision home care",tone:"dmk",intro:"Professional home-care categories selected to support an individually planned DMK skin revision pathway.",categories:["Cleansing & preparation","DMK serums and oils","Crèmes & barrier support","Protocol support products"]},
] as const;

export default function ProductsPage(){return <main><Header />
  <section className="products-hero"><div><p className="kicker">VenuX professional home care</p><h1>Products selected<br/><i>for your skin.</i></h1><p>Shop-ready Sothys and DMK product categories are being prepared around confirmed clinic inventory. We will not list or charge for a product until its exact name, size, availability and price are confirmed.</p><div className="hero-actions"><a className="button dark" href="#catalogue">Explore brands</a><a className="text-link" href="/book">Ask for a recommendation ↗</a></div></div><div className="product-hero-art" aria-hidden="true"><div className="bottle bottle-one"><span>V</span></div><div className="bottle bottle-two"><span>VenuX</span></div><i/></div></section>

  <section className="product-standard"><article><span>01</span><h3>Confirmed inventory</h3><p>Only products currently available through the clinic will be activated for purchase.</p></article><article><span>02</span><h3>Exact product detail</h3><p>Name, size, directions and price will be displayed before checkout.</p></article><article><span>03</span><h3>Professional selection</h3><p>Where appropriate, the team can recommend products around your skin and current routine.</p></article></section>

  <section className="brand-catalogue" id="catalogue">{brands.map((brand,index)=><article className={`catalogue-brand ${brand.tone}`} key={brand.name}><div className="brand-monogram"><span>0{index+1}</span><strong>{brand.name}</strong><small>{brand.origin}</small></div><div className="catalogue-copy"><p>{brand.intro}</p><div className="category-pills">{brand.categories.map(category=><span key={category}>{category}</span>)}</div><div className="catalogue-status"><b>Product catalogue awaiting confirmed inventory & pricing</b><a className="button dark" href="/book">Request product advice</a></div></div></article>)}</section>

  <section className="product-next"><div><p className="kicker">Next step</p><h2>Ready for your<br/><i>real catalogue.</i></h2></div><div><p>Send the exact product name, size, retail price, stock quantity and a product photo for each Sothys or DMK item. Those confirmed items can then receive an individual product card and secure checkout.</p><a className="text-link" href="/book">Contact the clinic team ↗</a></div></section><Footer /></main>}
