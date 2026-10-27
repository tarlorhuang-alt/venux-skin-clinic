"use client";
import {useEffect,useRef,useState} from "react";
import QRCode from "qrcode";
export default function LocalQrCode({path,label}:{path:string;label:string}){
 const [image,setImage]=useState(""),[failed,setFailed]=useState(false);
 const zoom=useRef<HTMLDialogElement>(null);
 useEffect(()=>{
  let active=true;setImage("");setFailed(false);
  QRCode.toDataURL(new URL(path,window.location.origin).href,{width:320,margin:4,errorCorrectionLevel:'M',color:{dark:'#000000',light:'#ffffff'}})
   .then(value=>{if(active)setImage(value);}).catch(()=>{if(active)setFailed(true);});
  return()=>{active=false;};
 },[path]);
 return <div className="local-qr"><strong>{label}</strong>{image?<><img src={image} width={320} height={320} alt={`${label} QR code`}/><button type="button" onClick={()=>zoom.current?.showModal()}>Show large QR</button><dialog ref={zoom} className="qr-zoom" aria-label={`${label} enlarged QR`}><strong>{label}</strong><img src={image} width={320} height={320} alt={`${label} enlarged QR code`}/><button type="button" onClick={()=>zoom.current?.close()}>Close QR</button></dialog></>:<p role="status">{failed?'QR image unavailable. Use the direct link below.':'Preparing QR code…'}</p>}<a href={path} target="_blank" rel="noreferrer">Open {label} ↗</a>{image?<a href={image} download="isa-client-qr.png">Save QR image</a>:null}<small>Open the link directly if you are using the same phone. To scan, show the full square with its white border.</small></div>;
}
