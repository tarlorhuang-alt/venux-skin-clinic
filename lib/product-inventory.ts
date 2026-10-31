import "server-only";
import {neon} from "@neondatabase/serverless";
import {delivery, deliveryKey, freightCents} from "./product-delivery";
import {INVENTORY_SCHEMA, RECEIVE_DELIVERY_SQL, SELL_PRODUCT_SQL} from "./product-inventory-sql";
function db(){if(!process.env.DATABASE_URL)throw new Error("DATABASE_URL is not configured");return neon(process.env.DATABASE_URL);}
export async function inventory(){const sql=db();for(const statement of INVENTORY_SCHEMA.split(";").filter(s=>s.trim()))await sql.query(statement);const [products,sales,received]=await Promise.all([sql`SELECT * FROM venux_stock_products ORDER BY name`,sql`SELECT s.*,p.name,p.code FROM venux_product_sales s JOIN venux_stock_products p ON p.code=s.product_code ORDER BY s.created_at DESC LIMIT 50`,sql`SELECT * FROM venux_stock_deliveries WHERE delivery_key=${deliveryKey}`]);return {products,sales,received:received.length>0};}
export async function receiveDelivery(){const sql=db();for(const statement of INVENTORY_SCHEMA.split(";").filter(s=>s.trim()))await sql.query(statement);return sql.query(RECEIVE_DELIVERY_SQL,[deliveryKey,JSON.stringify(delivery),freightCents]);}
export async function sellProduct(code:string,quantity:number,priceCents:number,customer:string,method:string,key:string){const sql=db();for(const statement of INVENTORY_SCHEMA.split(";").filter(s=>s.trim()))await sql.query(statement);const rows=await sql.query(SELL_PRODUCT_SQL,[code,quantity,priceCents,customer,method,key]);return rows.length>0;}
