import LocalQrCode from "./local-qr-code";
import "./visit-documents.css";
export default function VisitDocuments({id,aftercareToken,receiptToken,entry="admin"}:{id:number;aftercareToken?:string;receiptToken?:string;entry?:"admin"|"owner"}){
 return <section className="visit-documents"><h3>Client receipt & after-care</h3>{receiptToken?<LocalQrCode path={`/booking/receipt/${receiptToken}`} label="Receipt & after-care"/>:<div className="missing-receipt"><p>No receipt has been issued for this completed visit.</p><a href={`/${entry}/receipts/${id}`}>Review recorded payments & create receipt →</a><small>This will not deduct card balance or package sessions again.</small></div>}{aftercareToken?<LocalQrCode path={`/booking/aftercare/${aftercareToken}`} label="After-care only"/>:null}</section>;
}
