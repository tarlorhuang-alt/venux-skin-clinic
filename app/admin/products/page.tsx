import type {Metadata} from "next";
import {isAdminAuthenticated} from "../../../lib/admin-auth";
import {AdminLogin,AdminShell} from "../admin-ui";
import "../admin.css";
import "../operations.css";
import "./products.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Products | ISA Clinic OS",robots:{index:false,follow:false}};

const brands=[
  {
    name:"DMK",
    label:"Professional skin revision",
    description:"Use the official Australian stockist enquiry for clinic account, training and professional product access.",
    contact:"DMK Australia stockist enquiry",
    contactUrl:"https://www.dmkskin.com.au/contact",
    partnerUrl:"https://www.dmkskin.com.au/dmk-journal/advanced-cosmeceuticals/",
  },
  {
    name:"SOTHYS PARIS",
    label:"Professional French skincare",
    description:"Apply through Sothys Australia’s clinic and spa partnership program for account opening, training, merchandising and ordering support.",
    contact:"Sothys Australia partnership enquiry",
    contactUrl:"https://www.sothys.com.au/en/become-partner",
    partnerUrl:"https://www.sothys.com.au/en/contact",
  },
] as const;

export default async function AdminProductsPage({searchParams}:{searchParams:Promise<{error?:string}>}){
  const query=await searchParams;if(!(await isAdminAuthenticated()))return <AdminLogin error={query.error}/>;
  return <AdminShell active="Products">
    <header className="clinic-admin-head"><div><p>Retail & professional stock</p><h1>Products</h1></div><a className="products-public-link" href="/products" target="_blank">Open customer catalogue ↗</a></header>
    <section className="product-brand-grid">{brands.map(brand=><article className="ops-card" key={brand.name}>
      <small>{brand.label}</small><h2>{brand.name}</h2><p>{brand.description}</p>
      <div><a href={brand.contactUrl} target="_blank" rel="noreferrer">Contact supplier ↗</a><a href={brand.partnerUrl} target="_blank" rel="noreferrer">Official information ↗</a></div>
    </article>)}</section>
    <section className="ops-card product-workflow"><header><small>Recommended ordering workflow</small><h2>Keep products genuine and traceable</h2></header><ol><li>Open a clinic account through the official Australian brand channel.</li><li>Confirm practitioner training and professional-use requirements.</li><li>Record supplier, batch number, expiry date, purchase cost and retail price when stock arrives.</li><li>Only publish products and prices that ISA currently has in stock.</li></ol><a href="/products" target="_blank">Review the DMK &amp; Sothys customer product page ↗</a></section>
  </AdminShell>;
}
