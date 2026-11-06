import "server-only";
import {neon} from "@neondatabase/serverless";
async function enquiriesDb(){
 if(!process.env.DATABASE_URL)throw new Error("Database is not configured");
 const sql=neon(process.env.DATABASE_URL);
 await sql`CREATE TABLE IF NOT EXISTS venux_website_enquiries(id BIGSERIAL PRIMARY KEY,submission_key UUID NOT NULL UNIQUE,email TEXT NOT NULL,mobile TEXT NOT NULL,clinic_location TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
 return sql;
}
export async function saveWebsiteEnquiry(input:{key:string;email:string;mobile:string;location:string}){
 const sql=await enquiriesDb();
 await sql`INSERT INTO venux_website_enquiries(submission_key,email,mobile,clinic_location) VALUES(${input.key},${input.email},${input.mobile},${input.location}) ON CONFLICT(submission_key) DO NOTHING`;
}
export async function getWebsiteEnquiries(location:string){
 const sql=await enquiriesDb();
 return sql`SELECT id,email,mobile,clinic_location,created_at FROM venux_website_enquiries WHERE (${location}='' OR clinic_location=${location}) ORDER BY created_at DESC LIMIT 100`;
}
