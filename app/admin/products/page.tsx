import {randomUUID} from "node:crypto";
import {inventory} from "../../../lib/product-inventory";
import {delivery,freightCents} from "../../../lib/product-delivery";
import {receiveDeliveryAction,sellProductAction} from "./actions";
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

export default async function AdminProductsPage({searchParams}:{searchParams:Promise<{error?:string;saved?:string}>}){
  const query=await searchParams;if(!(await isAdminAuthenticated()))return <AdminLogin error={query.error}/>;
  let data:Awaited<ReturnType<typeof inventory>>|null=null;
  try{data=await inventory();}catch{}
  const money=(c:number)=>new Intl.NumberFormat("en-AU",{style:"currency",currency:"AUD"}).format(c/100);
  return <AdminShell active="Products">
    <header className="clinic-admin-head"><div><p>Retail & professional stock</p><h1>Products</h1></div><a className="products-public-link" href="/products" target="_blank">Open customer catalogue ↗</a></header>
    {query.saved&&<p role="status">{query.saved==="received"?"入库完成 / Delivery received":"销售已登记，库存已扣减 / Sale recorded"}</p>}
    {query.error&&<p role="alert">操作未完成。请检查数据库、库存和输入；重复提交不会重复扣库。 / Unable to save; check connection, stock and inputs.</p>}
    {!data&&<p role="alert">数据库未连接，尚未入库。请配置 DATABASE_URL 后重试。 / Database unavailable; no stock has been received.</p>}
    <section className="ops-card product-workflow"><h2>采购入库 · Sothys Christmas 26</h2>
      <p>18 款 · {delivery.reduce((n,p)=>n+p.quantity,0)} 件 · 商品 {money(delivery.reduce((n,p)=>n+p.totalCents,0))} · 运费 {money(freightCents)} · 合计 {money(delivery.reduce((n,p)=>n+p.totalCents,freightCents))}</p>
      <p>以下为采购成本，不是零售价。保留原单行合计（含舍入差额）；运费不计入库存。专业装标有 Prof。</p>
      <div style={{overflowX:"auto"}}><table><thead><tr><th>Code</th><th>Product</th><th>Qty</th><th>Unit ex GST</th><th>GST / unit</th><th>Line total</th></tr></thead><tbody>{delivery.map(p=><tr key={p.code}><td>{p.code}</td><td>{p.name}</td><td>{p.quantity}</td><td>{money(p.unitCents)}</td><td>{money(p.gstCents)}</td><td>{money(p.totalCents)}</td></tr>)}</tbody></table></div>
      {data?.received?<p>此批已入库；重复操作不会再次增加库存。</p>:<form action={receiveDeliveryAction}><button disabled={!data}>确认此批入库（管理员）</button></form>}
    </section>
    <section className="ops-card product-workflow"><h2>客人购买 · 登记销售并扣库存</h2><p>登记已完成的收款；此操作不会向客人扣款或发送消息。</p>
    <form action={sellProductAction} className="ops-form-grid">
      <input type="hidden" name="requestKey" value={randomUUID()}/>
      <label>商品<select name="code" required><option value="">请选择</option>{data?.products.map(p=><option key={String(p.code)} value={String(p.code)} disabled={Number(p.stock)===0}>{String(p.name)} · {String(p.code)} · 库存 {Number(p.stock)}</option>)}</select></label>
      <label>数量<input name="quantity" type="number" min="1" max="10000" step="1" required defaultValue="1"/></label>
      <label>实际销售单价（含 GST / AUD）<input name="price" type="number" min="0" max="9999999.99" step="0.01" required/></label>
      <label>客人姓名 / 编号<input name="customer" required maxLength={200}/></label>
      <label>已收款方式<select name="method"><option>Card</option><option>Cash</option><option>Bank transfer</option><option>Other</option></select></label>
      <button disabled={!data?.products.length}>登记销售并扣库存</button>
    </form></section>
    <section className="ops-card product-workflow"><h2>当前库存</h2><div style={{overflowX:"auto"}}><table><thead><tr><th>Code</th><th>Product</th><th>Stock</th></tr></thead><tbody>{data?.products.map(p=><tr key={String(p.code)}><td>{String(p.code)}</td><td>{String(p.name)}</td><td>{Number(p.stock)}</td></tr>)}</tbody></table></div></section>
    <section className="ops-card product-workflow"><h2>最近销售（50 条）</h2><div style={{overflowX:"auto"}}><table><thead><tr><th>Sydney time</th><th>Customer</th><th>Product</th><th>Qty</th><th>Total</th><th>Payment</th></tr></thead><tbody>{data?.sales.map(p=><tr key={String(p.id)}><td>{new Date(String(p.created_at)).toLocaleString("en-AU",{timeZone:"Australia/Sydney"})}</td><td>{String(p.customer)}</td><td>{String(p.name)}</td><td>{Number(p.quantity)}</td><td>{money(Number(p.unit_price_cents)*Number(p.quantity))}</td><td>{String(p.payment_method)}</td></tr>)}</tbody></table></div></section>
    <section className="product-brand-grid">{brands.map(brand=><article className="ops-card" key={brand.name}>
      <small>{brand.label}</small><h2>{brand.name}</h2><p>{brand.description}</p>
      <div><a href={brand.contactUrl} target="_blank" rel="noreferrer">Contact supplier ↗</a><a href={brand.partnerUrl} target="_blank" rel="noreferrer">Official information ↗</a></div>
    </article>)}</section>
    <section className="ops-card product-workflow"><header><small>Recommended ordering workflow</small><h2>Keep products genuine and traceable</h2></header><ol><li>Open a clinic account through the official Australian brand channel.</li><li>Confirm practitioner training and professional-use requirements.</li><li>Record supplier, batch number, expiry date, purchase cost and retail price when stock arrives.</li><li>Only publish products and prices that ISA currently has in stock.</li></ol><a href="/products" target="_blank">Review the DMK &amp; Sothys customer product page ↗</a></section>
  </AdminShell>;
}
