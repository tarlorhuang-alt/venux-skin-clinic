export const INVENTORY_SCHEMA = `CREATE TABLE IF NOT EXISTS venux_stock_products (
 code TEXT PRIMARY KEY,name TEXT NOT NULL,stock INTEGER NOT NULL DEFAULT 0 CHECK(stock>=0),
 unit_cost_cents INTEGER NOT NULL CHECK(unit_cost_cents>=0),unit_gst_cents INTEGER NOT NULL CHECK(unit_gst_cents>=0));
CREATE TABLE IF NOT EXISTS venux_stock_deliveries (
 delivery_key TEXT PRIMARY KEY,items JSONB NOT NULL,freight_cents INTEGER NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS venux_product_sales (
 id BIGSERIAL PRIMARY KEY,request_key TEXT NOT NULL UNIQUE,product_code TEXT NOT NULL REFERENCES venux_stock_products(code),
 quantity INTEGER NOT NULL CHECK(quantity>0),unit_price_cents INTEGER NOT NULL CHECK(unit_price_cents>=0),
 customer TEXT NOT NULL,payment_method TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`;
export const RECEIVE_DELIVERY_SQL = `WITH received AS (
 INSERT INTO venux_stock_deliveries(delivery_key,items,freight_cents) VALUES($1,$2::jsonb,$3)
 ON CONFLICT DO NOTHING RETURNING items
), items AS (
 SELECT item FROM received,jsonb_array_elements(items) AS item
) INSERT INTO venux_stock_products(code,name,stock,unit_cost_cents,unit_gst_cents)
 SELECT item->>'code',item->>'name',(item->>'quantity')::int,(item->>'unitCents')::int,(item->>'gstCents')::int FROM items
 ON CONFLICT(code) DO UPDATE SET stock=venux_stock_products.stock+EXCLUDED.stock,
 unit_cost_cents=EXCLUDED.unit_cost_cents,unit_gst_cents=EXCLUDED.unit_gst_cents RETURNING code`;
// A transaction rolls back stock if the unique request key collides. The row lock
// and guarded UPDATE also prevent concurrent purchases from overselling.
export const SELL_PRODUCT_SQL = `WITH changed AS (
 UPDATE venux_stock_products SET stock=stock-$2 WHERE code=$1 AND stock >= $2 AND $2>0
 AND NOT EXISTS(SELECT 1 FROM venux_product_sales WHERE request_key=$6)
 RETURNING code
) INSERT INTO venux_product_sales(product_code,quantity,unit_price_cents,customer,payment_method,request_key)
 SELECT code,$2,$3,$4,$5,$6 FROM changed RETURNING id`;
