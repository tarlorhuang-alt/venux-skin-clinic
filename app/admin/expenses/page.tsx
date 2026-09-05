import type {Metadata} from "next";
import {isAdminAuthenticated,isOwnerAuthenticated} from "../../../lib/admin-auth";
import {redirect} from "next/navigation";
import {getExpenses} from "../../../lib/clinic-admin";
import {addExpenseAction} from "../actions";
import {AdminLogin,AdminShell} from "../admin-ui";
import "../admin.css";
import "../operations.css";
import "./expenses.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Expenses | VenuX Clinic OS",robots:{index:false,follow:false}};
const currentMonth=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Australia/Sydney",year:"numeric",month:"2-digit"}).format(new Date());

export default async function ExpensesPage({searchParams}:{searchParams:Promise<{month?:string;created?:string;error?:string}>}){
  const params=await searchParams;if(!(await isAdminAuthenticated()))return <AdminLogin error={params.error}/>;if(!(await isOwnerAuthenticated()))redirect("/admin?error=restricted");
  const month=/^\d{4}-\d{2}$/.test(params.month??"")?String(params.month):currentMonth(),from=`${month}-01`,last=new Date(`${month}-01T00:00:00Z`);last.setUTCMonth(last.getUTCMonth()+1);last.setUTCDate(0);const end=last.toISOString().slice(0,10);
  const {rows,summary,byCategory}=await getExpenses(from,end),total=Number(summary.total??0);
  return <AdminShell active="Expenses"><header className="clinic-admin-head"><div><p>Clinic cost control</p><h1>Expenses</h1></div><span>{Number(summary.expense_count??0)} entries · {month}</span></header>
    {params.created?<div className="clinic-alert">Expense saved and included in this month’s total.</div>:null}{params.error?<div className="clinic-alert error">Please check the date, description and amount.</div>:null}
    <section className="expense-summary"><article><small>Monthly expenses</small><strong>${total.toLocaleString("en-AU",{minimumFractionDigits:2})}</strong><span>{from} to {end}</span></article><article><small>Entries</small><strong>{Number(summary.expense_count??0)}</strong><span>Recorded costs</span></article><article><small>Largest category</small><strong>{byCategory[0]?String(byCategory[0].category):"—"}</strong><span>{byCategory[0]?`$${Number(byCategory[0].total).toLocaleString("en-AU")}`:"No costs yet"}</span></article></section>
    <form method="get" className="report-filter"><label>Expense month<input name="month" type="month" defaultValue={month}/></label><button>Open month</button></form>
    <details className="ops-card expense-create" open><summary>+ Record an expense</summary><form action={addExpenseAction} className="ops-form-grid"><label>Date<input name="date" type="date" required defaultValue={new Date().toLocaleDateString("en-CA",{timeZone:"Australia/Sydney"})}/></label><label>Category<select name="category" required defaultValue="Products & stock"><option>Products & stock</option><option>Consumables</option><option>Rent</option><option>Wages</option><option>Marketing</option><option>Equipment</option><option>Utilities</option><option>Software</option><option>Training</option><option>Other</option></select></label><label>Payee / supplier<input name="payee" placeholder="Optional"/></label><label>Amount (AUD)<input name="amount" type="number" min="0" step="0.01" required/></label><label>Payment method<select name="paymentMethod"><option>Card</option><option>Bank transfer</option><option>Cash</option><option>Direct debit</option><option>Other</option></select></label><label className="expense-description">Description<input name="description" required placeholder="What was purchased or paid?"/></label><label className="expense-notes">Notes<textarea name="notes"/></label><button>Save expense</button></form></details>
    <section className="expense-layout"><article className="ops-card"><h2>Category breakdown</h2><div className="rank-list">{byCategory.length?byCategory.map((row,index)=><div key={String(row.category)}><b>{String(index+1).padStart(2,"0")}</b><span><strong>{String(row.category)}</strong><small>{Number(row.expense_count)} entries</small></span><em>${Number(row.total).toLocaleString("en-AU")}</em></div>):<div className="empty-admin">No expenses recorded for this month.</div>}</div></article><article className="ops-card"><h2>Expense history</h2><div className="expense-list">{rows.length?rows.map(row=><div key={String(row.id)}><time>{new Date(`${row.expense_date}T00:00:00`).toLocaleDateString("en-AU",{day:"numeric",month:"short"})}</time><span><strong>{String(row.description)}</strong><small>{String(row.category)} · {String(row.payee||"No payee")} · {String(row.payment_method)}</small></span><b>${Number(row.amount).toLocaleString("en-AU",{minimumFractionDigits:2})}</b></div>):<div className="empty-admin">No expenses recorded for this month.</div>}</div></article></section>
  </AdminShell>;
}
