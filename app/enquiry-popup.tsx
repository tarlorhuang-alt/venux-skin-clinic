"use client";
import {useEffect,useRef} from "react";
import HomeEnquiry from "./home-enquiry";
import "./enquiry-popup.css";
export default function EnquiryPopup(){
 const dialog=useRef<HTMLDialogElement>(null),hasDismissed=useRef(false);
 const dismiss=()=>{hasDismissed.current=true;try{sessionStorage.setItem('isa-enquiry-dismissed','1');}catch{}};
 useEffect(()=>{let dismissed=false;try{dismissed=sessionStorage.getItem('isa-enquiry-dismissed')==='1';}catch{}if(dismissed)return;const timer=setTimeout(()=>{if(dialog.current&&!dialog.current.open&&!hasDismissed.current)dialog.current.showModal();},1800);return ()=>clearTimeout(timer);},[]);
 useEffect(()=>{const node=dialog.current;if(!node)return;const sync=()=>{document.body.classList.toggle('isa-enquiry-open',node.open);};const observer=new MutationObserver(sync);observer.observe(node,{attributes:true,attributeFilter:['open']});return()=>{observer.disconnect();document.body.classList.remove('isa-enquiry-open');};},[]);
 return <><button className="button dark enquiry-open-button" onClick={()=>dialog.current?.showModal()}>Enquire now</button><dialog ref={dialog} className="enquiry-dialog" aria-label="Contact ISA Skin Clinic" onCancel={dismiss} onClose={dismiss} onClick={event=>{if(event.target===dialog.current){const bounds=dialog.current.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.current.close();}}}><button className="enquiry-dialog-close" aria-label="Close enquiry" onClick={()=>dialog.current?.close()}>×</button><HomeEnquiry/></dialog></>;
}
