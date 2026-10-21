"use client";
import {createContext,useContext,useState,type ReactNode} from "react";
type Preferences={service:boolean;marketing:boolean};
const Context=createContext<{preferences:Preferences;setPreferences:(value:Preferences)=>void}|null>(null);
export function BookingPreferencesProvider({initial,children}:{initial:Preferences;children:ReactNode}){
 const [preferences,setPreferences]=useState(initial);
 return <Context.Provider value={{preferences,setPreferences}}>{children}</Context.Provider>;
}
export function useBookingPreferences(){const value=useContext(Context);if(!value)throw new Error('Booking preferences provider missing');return value;}
export function BookingSmsOptions(){
 const {preferences,setPreferences}=useBookingPreferences();
 return <><label className="booking-check"><input type="checkbox" name="serviceSmsConsent" value="yes" checked={preferences.service} onChange={e=>setPreferences({...preferences,service:e.target.checked})}/> Send appointment confirmation and reminder SMS</label><label className="booking-check"><input type="checkbox" name="marketingSmsEnabled" value="yes" checked={preferences.marketing} onChange={e=>setPreferences({...preferences,marketing:e.target.checked})}/> Enable birthday / promotion SMS (recorded client consent required)</label></>;
}
