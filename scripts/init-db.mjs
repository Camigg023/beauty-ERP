import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;
import { neon } from '@neondatabase/serverless';

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('ERROR: DATABASE_URL o DATABASE_URL_UNPOOLED no están definidas en .env.local');
  process.exit(1);
}

console.log('Conectando a Neon Postgres...');
const sql = neon(databaseUrl);

// Función auxiliar de cálculos
function getZScore(serviceLevel) {
  if (serviceLevel >= 0.99) return 2.326;
  if (serviceLevel >= 0.98) return 2.054;
  if (serviceLevel >= 0.95) return 1.645;
  if (serviceLevel >= 0.90) return 1.282;
  return 1.645;
}

function computeCalculations(params, currentStock, reservedStock = 0) {
  const annualDemand = Math.max(1, params.annualDemand);
  const leadTimeWeeks = Math.max(0.1, params.leadTimeWeeks);
  const orderCostS = Math.max(1, params.orderCostS);
  const holdingCostH = Math.max(0.1, params.holdingCostH);
  const serviceLevel = params.serviceLevel || 0.95;
  const demandStdDevWeekly = params.demandStdDevWeekly || (annualDemand / 52) * 0.2;

  const dailyDemand = Math.round((annualDemand / 365) * 100) / 100;
  const weeklyDemand = Math.round((annualDemand / 52) * 100) / 100;
  const zScore = getZScore(serviceLevel);
  const safetyStock = Math.ceil(zScore * demandStdDevWeekly * Math.sqrt(leadTimeWeeks));
  const demandDuringLeadTime = weeklyDemand * leadTimeWeeks;
  const reorderPoint = Math.ceil(demandDuringLeadTime + safetyStock);
  const rawEOQ = Math.sqrt((2 * annualDemand * orderCostS) / holdingCostH);
  const eoq = Math.max(1, Math.ceil(rawEOQ));
  const recommendedQ = params.manualQOverride && params.manualQOverride > 0
    ? Math.round(params.manualQOverride)
    : eoq;
  const coverageDays = dailyDemand > 0
    ? Math.max(0, Math.round((currentStock / dailyDemand) * 10) / 10)
    : 999;

  let status = 'NORMAL';
  let statusLabel = 'Nivel Óptimo';
  if (currentStock <= 0) {
    status = 'STOCKOUT';
    statusLabel = 'Quiebre de Stock (Agotado)';
  } else if (currentStock <= safetyStock) {
    status = 'CRITICAL';
    statusLabel = 'Stock Crítico (Bajo Seguridad)';
  } else if (currentStock <= reorderPoint) {
    status = 'WARNING';
    statusLabel = 'Alerta de Reorden (Stock ≤ ROP)';
  }

  return {
    dailyDemand,
    weeklyDemand,
    zScore,
    safetyStock,
    reorderPoint,
    eoq,
    recommendedQ,
    coverageDays,
    status,
    statusLabel,
  };
}

async function main() {
  const version = await sql`SELECT version()`;
  console.log('Conectado a Neon:', version[0].version);

  console.log('Verificando tablas...');
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(50) PRIMARY KEY,
      slug VARCHAR(100) NOT NULL,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      description TEXT,
      image_url TEXT,
      current_stock INT NOT NULL DEFAULT 0,
      reserved_stock INT NOT NULL DEFAULT 0,
      available_stock INT NOT NULL DEFAULT 0,
      unit_price_cop NUMERIC NOT NULL,
      unit_cost_cop NUMERIC NOT NULL,
      trendy_info JSONB NOT NULL,
      params JSONB NOT NULL,
      calculations JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS kardex (
      id VARCHAR(50) PRIMARY KEY,
      product_id VARCHAR(50) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      date TIMESTAMPTZ DEFAULT NOW(),
      type VARCHAR(50) NOT NULL,
      quantity INT NOT NULL,
      previous_stock INT NOT NULL,
      new_stock INT NOT NULL,
      reference VARCHAR(100),
      notes TEXT,
      user_id VARCHAR(100)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id VARCHAR(50) PRIMARY KEY,
      order_number VARCHAR(100) NOT NULL,
      product_id VARCHAR(50) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      quantity INT NOT NULL,
      unit_cost_cop NUMERIC NOT NULL,
      total_cost_cop NUMERIC NOT NULL,
      supplier VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      received_at TIMESTAMPTZ,
      notes TEXT
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sales (
      id VARCHAR(50) PRIMARY KEY,
      sale_number VARCHAR(100) NOT NULL,
      product_id VARCHAR(50) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      quantity INT NOT NULL,
      unit_price_cop NUMERIC NOT NULL,
      total_cop NUMERIC NOT NULL,
      channel VARCHAR(50) NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(50) PRIMARY KEY,
      product_id VARCHAR(50) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      severity VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      current_stock INT NOT NULL,
      reorder_point INT NOT NULL,
      safety_stock INT NOT NULL,
      suggested_q INT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      resolved BOOLEAN NOT NULL DEFAULT FALSE,
      resolved_at TIMESTAMPTZ
    );
  `;

  const existing = await sql`SELECT count(*) FROM products`;
  if (Number(existing[0].count) === 0) {
    console.log('Sembrando catálogo de 3 productos en Neon Postgres...');

    // 1. Gloss
    const glossParams = {
      annualDemand: 3600,
      leadTimeWeeks: 2,
      orderCostS: 45000,
      holdingCostH: 1200,
      serviceLevel: 0.95,
      demandStdDevWeekly: 14,
      policy: 'Q_R',
      manualQOverride: null,
    };
    const glossStock = 240;
    const glossCalc = computeCalculations(glossParams, glossStock, 0);

    // 2. Blush
    const blushParams = {
      annualDemand: 2400,
      leadTimeWeeks: 3,
      orderCostS: 50000,
      holdingCostH: 1800,
      serviceLevel: 0.95,
      demandStdDevWeekly: 12,
      policy: 'Q_R',
      manualQOverride: null,
    };
    const blushStock = 160;
    const blushCalc = computeCalculations(blushParams, blushStock, 0);

    // 3. Pestañina
    const pestaninaParams = {
      annualDemand: 5200,
      leadTimeWeeks: 2.5,
      orderCostS: 55000,
      holdingCostH: 1700,
      serviceLevel: 0.95,
      demandStdDevWeekly: 20,
      policy: 'Q_R',
      manualQOverride: null,
    };
    const pestaninaStock = 45;
    const pestaninaCalc = computeCalculations(pestaninaParams, pestaninaStock, 0);

    await sql`
      INSERT INTO products (id, slug, name, category, description, image_url, current_stock, reserved_stock, available_stock, unit_price_cop, unit_cost_cop, trendy_info, params, calculations)
      VALUES
      (
        'gloss',
        'gloss-retro-glow',
        'Gloss Labial Retro Glow Beauty',
        'Labios',
        'Brillo labial ultra brillante y nutritivo con acabado no pegajoso y aroma frutal.',
        'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80',
        ${glossStock}, 0, ${glossStock}, 10000, 4500,
        ${JSON.stringify({
          name: 'Gloss Retro Glow Beauty',
          referenceCode: 'BLT2222',
          scrapedPriceCOP: 10000,
          estimatedUnitCostCOP: 4500,
          storeUrl: 'https://maquillajetrendyshop.com/producto/gloss-retro-glow/',
          lastCheckedDate: '2026-10-15',
          isEstimated: false,
        })},
        ${JSON.stringify(glossParams)},
        ${JSON.stringify(glossCalc)}
      ),
      (
        'blush',
        'rubor-crema-star',
        'Rubor En Crema Star Beauty',
        'Rostro',
        'Rubor en crema aterciopelado de larga duración, fácil difuminado y acabado glow natural.',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80',
        ${blushStock}, 0, ${blushStock}, 15000, 6750,
        ${JSON.stringify({
          name: 'Rubor En Crema Star Beauty',
          referenceCode: 'RCS2205',
          scrapedPriceCOP: 15000,
          estimatedUnitCostCOP: 6750,
          storeUrl: 'https://maquillajetrendyshop.com/producto/rubor-blush-stamp/',
          lastCheckedDate: '2026-10-15',
          isEstimated: false,
        })},
        ${JSON.stringify(blushParams)},
        ${JSON.stringify(blushCalc)}
      ),
      (
        'pestanina',
        'pestanina-super-look',
        'Pestañina Super Look Beauty',
        'Ojos',
        'Máscara de pestañas efecto volumen extremo y alargamiento a prueba de agua con cepillo de silicona.',
        'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=600&auto=format&fit=crop&q=80',
        ${pestaninaStock}, 0, ${pestaninaStock}, 15000, 6750,
        ${JSON.stringify({
          name: 'Pestañina Super Look Beauty',
          referenceCode: 'PSL1374',
          scrapedPriceCOP: 15000,
          estimatedUnitCostCOP: 6750,
          storeUrl: 'https://maquillajetrendyshop.com/producto/pestanina-super-look/',
          lastCheckedDate: '2026-10-15',
          isEstimated: false,
        })},
        ${JSON.stringify(pestaninaParams)},
        ${JSON.stringify(pestaninaCalc)}
      )
    `;

    // Seed Kardex
    await sql`
      INSERT INTO kardex (id, product_id, product_name, date, type, quantity, previous_stock, new_stock, reference, notes, user_id)
      VALUES
      ('KDX-001', 'gloss', 'Gloss Labial Retro Glow Beauty', NOW() - INTERVAL '14 days', 'ENTRADA', 300, 0, 300, 'INV-INICIAL', 'Inventario inicial de apertura de bodega', 'Admin Beauty'),
      ('KDX-002', 'gloss', 'Gloss Labial Retro Glow Beauty', NOW() - INTERVAL '5 days', 'SALIDA', 60, 300, 240, 'VTA-LOTE-01', 'Despacho pedidos online', 'Admin Beauty'),
      ('KDX-003', 'blush', 'Rubor En Crema Star Beauty', NOW() - INTERVAL '20 days', 'ENTRADA', 250, 0, 250, 'INV-INICIAL', 'Lote importación inicial', 'Admin Beauty'),
      ('KDX-004', 'blush', 'Rubor En Crema Star Beauty', NOW() - INTERVAL '3 days', 'SALIDA', 90, 250, 160, 'VTA-PROMO-PRIMAVERA', 'Venta flash fin de semana', 'Admin Beauty'),
      ('KDX-005', 'pestanina', 'Pestañina Super Look Beauty', NOW() - INTERVAL '18 days', 'ENTRADA', 400, 0, 400, 'INV-INICIAL', 'Cargue inicial inventario', 'Admin Beauty'),
      ('KDX-006', 'pestanina', 'Pestañina Super Look Beauty', NOW() - INTERVAL '4 days', 'SALIDA', 355, 400, 45, 'VTA-MAYORISTA-09', 'Venta mayorista distribuidores', 'Admin Beauty')
    `;

    // Seed Purchase Orders
    await sql`
      INSERT INTO purchase_orders (id, order_number, product_id, product_name, quantity, unit_cost_cop, total_cost_cop, supplier, status, created_at, notes)
      VALUES
      ('ORD-001', 'OC-2026-001', 'pestanina', 'Pestañina Super Look Beauty', 580, 6750, 3915000, 'Beauty Cosméticos Colombia SAS', 'PENDIENTE', NOW() - INTERVAL '1 day', 'Orden de compra urgente stock crítico'),
      ('ORD-002', 'OC-2026-002', 'gloss', 'Gloss Labial Retro Glow Beauty', 520, 4500, 2340000, 'Laboratorios Maquillaje Nacional', 'RECIBIDA', NOW() - INTERVAL '15 days', 'Recepción completa a satisfacción')
    `;

    // Seed Sales
    await sql`
      INSERT INTO sales (id, sale_number, product_id, product_name, quantity, unit_price_cop, total_cop, channel, customer_name, created_at)
      VALUES
      ('SL-001', 'VTA-2026-041', 'gloss', 'Gloss Labial Retro Glow Beauty', 12, 10000, 120000, 'TIENDA_ONLINE', 'Valentina Restrepo', NOW() - INTERVAL '4 hours'),
      ('SL-002', 'VTA-2026-042', 'blush', 'Rubor En Crema Star Beauty', 6, 15000, 90000, 'INSTAGRAM', 'Mariana Caicedo', NOW() - INTERVAL '2 hours'),
      ('SL-003', 'VTA-2026-043', 'pestanina', 'Pestañina Super Look Beauty', 15, 15000, 225000, 'PUNTO_FISICO', 'Carolina Mendoza', NOW() - INTERVAL '1 hour')
    `;

    // Seed Notifications
    await sql`
      INSERT INTO notifications (id, product_id, product_name, severity, title, message, current_stock, reorder_point, safety_stock, suggested_q, created_at, resolved)
      VALUES
      ('ALT-001', 'pestanina', 'Pestañina Super Look Beauty', 'CRITICAL', '🚨 Stock Crítico en Pestañina Super Look', 'El inventario actual (45 uds) ha caído por debajo del Stock de Seguridad (53 uds). Peligro inminente de quiebre.', 45, 303, 53, 581, NOW(), FALSE),
      ('ALT-002', 'blush', 'Rubor En Crema Star Beauty', 'WARNING', '⚠️ Punto de Reorden alcanzado en Rubor En Crema Star', 'El stock (160 uds) es menor o igual al Punto de Reorden ROP (174 uds). Se sugiere emitir orden de compra.', 160, 174, 35, 366, NOW(), FALSE)
    `;

    console.log('Sembrado completado con éxito en Neon Postgres.');
  } else {
    console.log(`Neon Postgres ya contiene ${existing[0].count} productos.`);
  }

  const finalCheck = await sql`
    SELECT id, name, current_stock, calculations->>'status' as status FROM products
  `;
  console.log('Catálogo en Neon:', finalCheck);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
