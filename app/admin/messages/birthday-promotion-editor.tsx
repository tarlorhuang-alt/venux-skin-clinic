"use client";
import {useState} from "react";
import {birthdayPromotion} from "../../../lib/birthday-promotion";
export function BirthdayPromotionEditor({id,name,body,editable}:{id:string;name:string;body:string;editable:boolean}){
 const [offer,setOffer]=useState(""),[message,setMessage]=useState(body),[error,setError]=useState("");
 return <div className="birthday-promotion-editor">
  {editable?<><label htmlFor={`birthday-offer-${id}`}>生日优惠及有效期 / Birthday offer & validity</label>
   <input id={`birthday-offer-${id}`} value={offer} onChange={event=>setOffer(event.target.value)} maxLength={700} placeholder="填写折扣、适用项目和有效期"/>
   <button type="button" onClick={()=>{try{setMessage(birthdayPromotion(name,offer));setError("");}catch(e){setError(e instanceof Error?e.message:"Unable to generate promotion");}}}>生成生日 Promotion</button>
   <small>生成后可继续编辑；点击下方 Send now 才会发送。</small>
   {error?<p role="alert" className="message-error">{error}</p>:null}</>:null}
  <label htmlFor={`birthday-body-${id}`}>短信预览 / SMS preview</label>
  <textarea id={`birthday-body-${id}`} name={editable?"messageBody":undefined} form={`send-sms-${id}`} readOnly={!editable} value={message} onChange={event=>setMessage(event.target.value)} maxLength={1000} required aria-label={`Message for ${name}`}/>
 </div>;
}
