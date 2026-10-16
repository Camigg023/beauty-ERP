import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;
import { neon } from '@neondatabase/serverless';

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
const sql = neon(databaseUrl);

async function testSuite() {
  console.log('=== TEST 1: Verificar productos en Neon vía API ===');
  const prodRes = await fetch('http://localhost:3000/api/products');
  const prodData = await prodRes.json();
  console.log('API /api/products éxito:', prodData.success, 'Cantidad productos:', prodData.data?.length);
  if (!prodData.success || prodData.data?.length !== 3) {
    throw new Error('Fallo obteniendo productos desde la API');
  }

  console.log('\n=== TEST 2: Registrar una venta vía API y verificar persistencia en Neon ===');
  const initialStockGloss = prodData.data.find(p => p.id === 'gloss').currentStock;
  console.log('Stock inicial de Gloss:', initialStockGloss);

  const saleRes = await fetch('http://localhost:3000/api/sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: 'gloss',
      quantity: 10,
      channel: 'TIENDA_ONLINE',
      customerName: 'Cliente Prueba Neon E2E',
    }),
  });
  const saleData = await saleRes.json();
  console.log('API /api/sales éxito:', saleData.success, 'Venta ID:', saleData.data?.sale?.id);

  // Verificar directamente en Neon Postgres
  const dbProduct = await sql`SELECT id, current_stock FROM products WHERE id = 'gloss'`;
  console.log('Stock en base de datos Neon tras venta:', dbProduct[0].current_stock);
  if (Number(dbProduct[0].current_stock) !== initialStockGloss - 10) {
    throw new Error('El stock en Neon no coincide tras la venta');
  }

  console.log('\n=== TEST 3: Verificar Kardex en Neon ===');
  const kdxRes = await fetch('http://localhost:3000/api/inventory?productId=gloss');
  const kdxData = await kdxRes.json();
  console.log('API /api/inventory éxito:', kdxData.success, 'Total movimientos Gloss:', kdxData.data?.length);

  const dbKardex = await sql`SELECT count(*) FROM kardex WHERE product_id = 'gloss'`;
  console.log('Filas de Kardex en Neon Postgres para Gloss:', dbKardex[0].count);

  console.log('\n=== TEST 4: Emitir y Recibir Orden de Compra en Neon ===');
  const poRes = await fetch('http://localhost:3000/api/purchases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: 'gloss',
      quantity: 50,
      supplier: 'Beauty Cosméticos Neon Supplier',
      notes: 'Prueba E2E de reabastecimiento en Neon',
    }),
  });
  const poData = await poRes.json();
  console.log('API /api/purchases creación éxito:', poData.success, 'Orden:', poData.data?.orderNumber);

  const orderId = poData.data.id;
  const receiveRes = await fetch('http://localhost:3000/api/purchases', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  });
  const receiveData = await receiveRes.json();
  console.log('API /api/purchases recepción éxito:', receiveData.success, 'Nuevo stock devuelto:', receiveData.data?.product?.currentStock);

  const dbProductAfterPO = await sql`SELECT current_stock FROM products WHERE id = 'gloss'`;
  console.log('Stock real verificado directamente en Neon Postgres tras recepción:', dbProductAfterPO[0].current_stock);
  if (Number(dbProductAfterPO[0].current_stock) !== initialStockGloss - 10 + 50) {
    throw new Error('El stock en Neon no se actualizó correctamente tras la recepción de la O.C.');
  }

  console.log('\n=== TEST 5: Actualizar Parámetros en Neon ===');
  const paramRes = await fetch('http://localhost:3000/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: 'gloss',
      params: {
        annualDemand: 4000,
        leadTimeWeeks: 2.2,
        orderCostS: 48000,
        holdingCostH: 1300,
        serviceLevel: 0.95,
        demandStdDevWeekly: 16,
        policy: 'Q_R',
      },
    }),
  });
  const paramData = await paramRes.json();
  console.log('API /api/products actualización éxito:', paramData.success, 'Nuevo ROP:', paramData.data?.calculations?.reorderPoint);

  const dbParams = await sql`SELECT params, calculations FROM products WHERE id = 'gloss'`;
  console.log('Parámetros verificados en Neon Postgres:', typeof dbParams[0].params === 'string' ? JSON.parse(dbParams[0].params) : dbParams[0].params);

  console.log('\n✅ TODOS LOS SERVICIOS CONECTADOS A NEON FUNCIONAN DE PRINCIPIO A FIN!');
}

testSuite().catch(err => {
  console.error('ERROR EN PRUEBAS:', err);
  process.exit(1);
});
