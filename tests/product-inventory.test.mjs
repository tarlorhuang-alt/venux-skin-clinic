import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
const source=readFileSync(new URL('../lib/product-inventory-sql.ts',import.meta.url),'utf8');
const query=name=>source.match(new RegExp('export const '+name+' = `([\\s\\S]*?)`;'))[1];
const delivery=JSON.parse(readFileSync(new URL('../lib/product-delivery.ts',import.meta.url),'utf8').split('export const delivery = ')[1].split(' as const;')[0]);
test('invoice receipt is exact, idempotent, and sales cannot oversell or repeat',async()=>{
 const db=new PGlite();try{
 await db.exec(query('INVENTORY_SCHEMA'));
 const receive=()=>db.query(query('RECEIVE_DELIVERY_SQL'),['test-delivery',JSON.stringify(delivery),1300]);
 assert.equal((await receive()).rows.length,18);assert.equal((await receive()).rows.length,0);
 assert.equal((await db.query('SELECT SUM(stock)::int AS qty FROM venux_stock_products')).rows[0].qty,30);
 assert.equal(delivery.reduce((s,p)=>s+p.totalCents,1300),263328);
 assert.equal((await db.query('SELECT COUNT(*)::int AS qty FROM venux_stock_products WHERE code=\'Freight\'')).rows[0].qty,0);
 const sell=(qty,key)=>db.query(query('SELL_PRODUCT_SQL'),['117.060',qty,2500,'Test customer','Card',key]);
 assert.equal((await sell(2,'sale-1')).rows.length,1);
 assert.equal((await sell(2,'sale-1')).rows.length,0);
 assert.equal((await sell(3,'sale-2')).rows.length,0);
 assert.equal((await sell(-1,'sale-3')).rows.length,0);
 assert.equal((await db.query("SELECT stock FROM venux_stock_products WHERE code='117.060'")).rows[0].stock,2);
 assert.equal((await db.query('SELECT COUNT(*)::int AS qty FROM venux_product_sales')).rows[0].qty,1);
 }finally{await db.close();}
});
