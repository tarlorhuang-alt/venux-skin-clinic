import TreatmentCareGuide from "../../treatment-guide";
export {generateStaticParams,generateMetadata} from "../../treatment-guide";
export default async function CareGuide({params}:{params:Promise<{treatment:string;stage:string}>}){
 return <TreatmentCareGuide params={params}/>;
}
