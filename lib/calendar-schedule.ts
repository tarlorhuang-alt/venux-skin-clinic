export function calendarTimeMinutes(value:string){
 const match=value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
 if(!match)return 9999;
 return (Number(match[1])%12+(match[3].toUpperCase()==='PM'?12:0))*60+Number(match[2]);
}
export function calendarTimeLabel(minutes:number){
 const hour=Math.floor(minutes/60);
 return `${hour%12||12}:${String(minutes%60).padStart(2,'0')} ${hour<12?'AM':'PM'}`;
}
export function beauticianColour(id:number){return `hsl(${(id*137.508)%360} 45% 88%)`;}
export function quarterHourSlots(start=540,end=1260){
 return Array.from({length:Math.floor((end-start)/15)+1},(_,index)=>start+index*15);
}
