import { neon } from '@neondatabase/serverless';
import {
  KardexEntry,
  MovementType,
  NotificationAlert,
  Product,
  ProductInventoryParams,
  PurchaseOrder,
  Sale,
} from '@/types';
import { computeProductCalculations } from './calculations';

function getNeonSql() {
  const conn = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;
  if (!conn) return null;
  return neon(conn);
}

// -------------------------------------------------------------
// IN-MEMORY FALLBACK STORE (si no hay DATABASE_URL)
// -------------------------------------------------------------
interface AppState {
  products: Product[];
  kardex: KardexEntry[];
  purchaseOrders: PurchaseOrder[];
  sales: Sale[];
  notifications: NotificationAlert[];
  counterKardex: number;
  counterOrders: number;
  counterSales: number;
  counterAlerts: number;
}

function generateInitialProducts(): Product[] {
  const glossParams: ProductInventoryParams = {
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
  const glossCalculations = computeProductCalculations(glossParams, glossStock, 0);

  const blushParams: ProductInventoryParams = {
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
  const blushCalculations = computeProductCalculations(blushParams, blushStock, 0);

  const pestaninaParams: ProductInventoryParams = {
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
  const pestaninaCalculations = computeProductCalculations(pestaninaParams, pestaninaStock, 0);

  const now = new Date().toISOString();

  return [
    {
      id: 'gloss',
      slug: 'gloss-retro-glow',
      name: 'Gloss Labial Retro Glow Beauty',
      category: 'Labios',
      description: 'Brillo labial ultra brillante y nutritivo con acabado no pegajoso y aroma frutal.',
      imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80',
      currentStock: glossStock,
      reservedStock: 0,
      availableStock: glossStock,
      unitPriceCOP: 10000,
      unitCostCOP: 4500,
      trendyInfo: {
        name: 'Gloss Retro Glow Beauty',
        referenceCode: 'BLT2222',
        scrapedPriceCOP: 10000,
        estimatedUnitCostCOP: 4500,
        storeUrl: 'https://maquillajetrendyshop.com/producto/gloss-retro-glow/',
        lastCheckedDate: '2026-10-15',
        isEstimated: false,
      },
      params: glossParams,
      calculations: glossCalculations,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'blush',
      slug: 'rubor-crema-star',
      name: 'Rubor En Crema Star Beauty',
      category: 'Rostro',
      description: 'Rubor en crema aterciopelado de larga duración, fácil difuminado y acabado glow natural.',
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80',
      currentStock: blushStock,
      reservedStock: 0,
      availableStock: blushStock,
      unitPriceCOP: 15000,
      unitCostCOP: 6750,
      trendyInfo: {
        name: 'Rubor En Crema Star Beauty',
        referenceCode: 'RCS2205',
        scrapedPriceCOP: 15000,
        estimatedUnitCostCOP: 6750,
        storeUrl: 'https://maquillajetrendyshop.com/producto/rubor-blush-stamp/',
        lastCheckedDate: '2026-10-15',
        isEstimated: false,
      },
      params: blushParams,
      calculations: blushCalculations,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'pestanina',
      slug: 'pestanina-super-look',
      name: 'Pestañina Super Look Beauty',
      category: 'Ojos',
      description: 'Máscara de pestañas efecto volumen extremo y alargamiento a prueba de agua con cepillo de silicona.',
      imageUrl: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=600&auto=format&fit=crop&q=80',
      currentStock: pestaninaStock,
      reservedStock: 0,
      availableStock: pestaninaStock,
      unitPriceCOP: 15000,
      unitCostCOP: 6750,
      trendyInfo: {
        name: 'Pestañina Super Look Beauty',
        referenceCode: 'PSL1374',
        scrapedPriceCOP: 15000,
        estimatedUnitCostCOP: 6750,
        storeUrl: 'https://maquillajetrendyshop.com/producto/pestanina-super-look/',
        lastCheckedDate: '2026-10-15',
        isEstimated: false,
      },
      params: pestaninaParams,
      calculations: pestaninaCalculations,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function generateInitialKardex(): KardexEntry[] {
  const d = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  };

  return [
    {
      id: 'KDX-001',
      productId: 'gloss',
      productName: 'Gloss Labial Retro Glow Beauty',
      date: d(14),
      type: 'ENTRADA',
      quantity: 300,
      previousStock: 0,
      newStock: 300,
      reference: 'INV-INICIAL',
      notes: 'Inventario inicial de apertura de bodega',
      userId: 'Admin Beauty',
    },
    {
      id: 'KDX-002',
      productId: 'gloss',
      productName: 'Gloss Labial Retro Glow Beauty',
      date: d(5),
      type: 'SALIDA',
      quantity: 60,
      previousStock: 300,
      newStock: 240,
      reference: 'VTA-LOTE-01',
      notes: 'Despacho de pedidos canal Instagram y Tienda Online',
      userId: 'Admin Beauty',
    },
    {
      id: 'KDX-003',
      productId: 'blush',
      productName: 'Rubor En Crema Star Beauty',
      date: d(20),
      type: 'ENTRADA',
      quantity: 250,
      previousStock: 0,
      newStock: 250,
      reference: 'INV-INICIAL',
      notes: 'Lote de importación inicial',
      userId: 'Admin Beauty',
    },
    {
      id: 'KDX-004',
      productId: 'blush',
      productName: 'Rubor En Crema Star Beauty',
      date: d(3),
      type: 'SALIDA',
      quantity: 90,
      previousStock: 250,
      newStock: 160,
      reference: 'VTA-PROMO-PRIMAVERA',
      notes: 'Venta flash fin de semana campaña Beauty',
      userId: 'Admin Beauty',
    },
    {
      id: 'KDX-005',
      productId: 'pestanina',
      productName: 'Pestañina Super Look Beauty',
      date: d(18),
      type: 'ENTRADA',
      quantity: 400,
      previousStock: 0,
      newStock: 400,
      reference: 'INV-INICIAL',
      notes: 'Cargue inicial de inventario',
      userId: 'Admin Beauty',
    },
    {
      id: 'KDX-006',
      productId: 'pestanina',
      productName: 'Pestañina Super Look Beauty',
      date: d(4),
      type: 'SALIDA',
      quantity: 355,
      previousStock: 400,
      newStock: 45,
      reference: 'VTA-MAYORISTA-09',
      notes: 'Venta mayorista a distribuidores Medellín y Bogotá',
      userId: 'Admin Beauty',
    },
  ];
}

function generateInitialOrders(): PurchaseOrder[] {
  const d = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  };

  return [
    {
      id: 'ORD-001',
      orderNumber: 'OC-2026-001',
      productId: 'pestanina',
      productName: 'Pestañina Super Look Beauty',
      quantity: 580,
      unitCostCOP: 6750,
      totalCostCOP: 580 * 6750,
      supplier: 'Beauty Cosméticos Colombia SAS',
      status: 'PENDIENTE',
      createdAt: d(1),
      notes: 'Orden de compra urgente generada por alerta de stock crítico',
    },
    {
      id: 'ORD-002',
      orderNumber: 'OC-2026-002',
      productId: 'gloss',
      productName: 'Gloss Labial Retro Glow Beauty',
      quantity: 520,
      unitCostCOP: 4500,
      totalCostCOP: 520 * 4500,
      supplier: 'Laboratorios Maquillaje Nacional',
      status: 'RECIBIDA',
      createdAt: d(15),
      receivedAt: d(14),
      notes: 'Recepción completa a satisfacción en bodega principal',
    },
  ];
}

function generateInitialSales(): Sale[] {
  const d = (hoursAgo: number) => {
    const date = new Date();
    date.setHours(date.getHours() - hoursAgo);
    return date.toISOString();
  };

  return [
    {
      id: 'SL-001',
      saleNumber: 'VTA-2026-041',
      productId: 'gloss',
      productName: 'Gloss Labial Retro Glow Beauty',
      quantity: 12,
      unitPriceCOP: 10000,
      totalCOP: 120000,
      channel: 'TIENDA_ONLINE',
      customerName: 'Valentina Restrepo',
      createdAt: d(4),
    },
    {
      id: 'SL-002',
      saleNumber: 'VTA-2026-042',
      productId: 'blush',
      productName: 'Rubor En Crema Star Beauty',
      quantity: 6,
      unitPriceCOP: 15000,
      totalCOP: 90000,
      channel: 'INSTAGRAM',
      customerName: 'Mariana Caicedo',
      createdAt: d(2),
    },
    {
      id: 'SL-003',
      saleNumber: 'VTA-2026-043',
      productId: 'pestanina',
      productName: 'Pestañina Super Look Beauty',
      quantity: 15,
      unitPriceCOP: 15000,
      totalCOP: 225000,
      channel: 'PUNTO_FISICO',
      customerName: 'Carolina Mendoza',
      createdAt: d(1),
    },
  ];
}

function generateInitialNotifications(products: Product[]): NotificationAlert[] {
  const alerts: NotificationAlert[] = [];
  let alertCount = 1;

  for (const product of products) {
    if (product.calculations.status === 'CRITICAL') {
      alerts.push({
        id: `ALT-${String(alertCount++).padStart(3, '0')}`,
        productId: product.id,
        productName: product.name,
        severity: 'CRITICAL',
        title: `🚨 Stock Crítico en ${product.name}`,
        message: `El inventario actual (${product.currentStock} uds) ha caído por debajo del Stock de Seguridad (${product.calculations.safetyStock} uds). Peligro inminente de quiebre.`,
        currentStock: product.currentStock,
        reorderPoint: product.calculations.reorderPoint,
        safetyStock: product.calculations.safetyStock,
        suggestedQ: product.calculations.recommendedQ,
        createdAt: new Date().toISOString(),
        resolved: false,
      });
    } else if (product.calculations.status === 'WARNING') {
      alerts.push({
        id: `ALT-${String(alertCount++).padStart(3, '0')}`,
        productId: product.id,
        productName: product.name,
        severity: 'WARNING',
        title: `⚠️ Punto de Reorden alcanzado en ${product.name}`,
        message: `El stock (${product.currentStock} uds) es menor o igual al Punto de Reorden ROP (${product.calculations.reorderPoint} uds). Se sugiere emitir orden de compra de ${product.calculations.recommendedQ} unidades.`,
        currentStock: product.currentStock,
        reorderPoint: product.calculations.reorderPoint,
        safetyStock: product.calculations.safetyStock,
        suggestedQ: product.calculations.recommendedQ,
        createdAt: new Date().toISOString(),
        resolved: false,
      });
    }
  }

  return alerts;
}

const globalForApp = global as unknown as { beautyAppState?: AppState };

function getInitialState(): AppState {
  const products = generateInitialProducts();
  const kardex = generateInitialKardex();
  const purchaseOrders = generateInitialOrders();
  const sales = generateInitialSales();
  const notifications = generateInitialNotifications(products);

  return {
    products,
    kardex,
    purchaseOrders,
    sales,
    notifications,
    counterKardex: 7,
    counterOrders: 3,
    counterSales: 44,
    counterAlerts: notifications.length + 1,
  };
}

export function getState(): AppState {
  if (!globalForApp.beautyAppState) {
    globalForApp.beautyAppState = getInitialState();
  }
  return globalForApp.beautyAppState;
}

// -------------------------------------------------------------
// OPERACIONES HÍBRIDAS (NEON POSTGRESQL + IN-MEMORY FALLBACK)
// -------------------------------------------------------------

function mapProductRow(r: any): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category,
    description: r.description,
    imageUrl: r.image_url,
    currentStock: Number(r.current_stock),
    reservedStock: Number(r.reserved_stock || 0),
    availableStock: Number(r.available_stock || r.current_stock),
    unitPriceCOP: Number(r.unit_price_cop),
    unitCostCOP: Number(r.unit_cost_cop),
    trendyInfo: typeof r.trendy_info === 'string' ? JSON.parse(r.trendy_info) : r.trendy_info,
    params: typeof r.params === 'string' ? JSON.parse(r.params) : r.params,
    calculations: typeof r.calculations === 'string' ? JSON.parse(r.calculations) : r.calculations,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapKardexRow(r: any): KardexEntry {
  return {
    id: r.id,
    productId: r.product_id,
    productName: r.product_name,
    date: r.date,
    type: r.type as MovementType,
    quantity: Number(r.quantity),
    previousStock: Number(r.previous_stock),
    newStock: Number(r.new_stock),
    reference: r.reference,
    notes: r.notes,
    userId: r.user_id,
  };
}

function mapOrderRow(r: any): PurchaseOrder {
  return {
    id: r.id,
    orderNumber: r.order_number,
    productId: r.product_id,
    productName: r.product_name,
    quantity: Number(r.quantity),
    unitCostCOP: Number(r.unit_cost_cop),
    totalCostCOP: Number(r.total_cost_cop),
    supplier: r.supplier,
    status: r.status,
    createdAt: r.created_at,
    receivedAt: r.received_at,
    notes: r.notes,
  };
}

function mapSaleRow(r: any): Sale {
  return {
    id: r.id,
    saleNumber: r.sale_number,
    productId: r.product_id,
    productName: r.product_name,
    quantity: Number(r.quantity),
    unitPriceCOP: Number(r.unit_price_cop),
    totalCOP: Number(r.total_cop),
    channel: r.channel,
    customerName: r.customer_name,
    createdAt: r.created_at,
  };
}

function mapNotificationRow(r: any): NotificationAlert {
  return {
    id: r.id,
    productId: r.product_id,
    productName: r.product_name,
    severity: r.severity,
    title: r.title,
    message: r.message,
    currentStock: Number(r.current_stock),
    reorderPoint: Number(r.reorder_point),
    safetyStock: Number(r.safety_stock),
    suggestedQ: Number(r.suggested_q),
    createdAt: r.created_at,
    resolved: Boolean(r.resolved),
    resolvedAt: r.resolved_at,
  };
}

export async function getProducts(): Promise<Product[]> {
  const sql = getNeonSql();
  if (sql) {
    const rows = await sql`SELECT * FROM products ORDER BY id`;
    if (rows.length > 0) {
      return rows.map(mapProductRow);
    }
  }
  return getState().products;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const sql = getNeonSql();
  if (sql) {
    const rows = await sql`SELECT * FROM products WHERE id = ${id}`;
    if (rows.length > 0) {
      return mapProductRow(rows[0]);
    }
  }
  return getState().products.find(p => p.id === id);
}

export async function updateProductParams(id: string, newParams: Partial<ProductInventoryParams>): Promise<Product> {
  const sql = getNeonSql();
  const current = await getProductById(id);
  if (!current) {
    throw new Error(`Producto ${id} no encontrado`);
  }

  const mergedParams: ProductInventoryParams = {
    ...current.params,
    ...newParams,
  };

  const newCalculations = computeProductCalculations(
    mergedParams,
    current.currentStock,
    current.reservedStock
  );

  const updated: Product = {
    ...current,
    params: mergedParams,
    calculations: newCalculations,
    updatedAt: new Date().toISOString(),
  };

  if (sql) {
    await sql`
      UPDATE products
      SET params = ${JSON.stringify(mergedParams)},
          calculations = ${JSON.stringify(newCalculations)},
          updated_at = NOW()
      WHERE id = ${id}
    `;
    await reEvaluateProductAlarmAsync(updated, sql);
    return updated;
  }

  const state = getState();
  const productIndex = state.products.findIndex(p => p.id === id);
  if (productIndex !== -1) {
    state.products[productIndex] = updated;
    reEvaluateProductAlarm(updated);
  }
  return updated;
}

export async function recordSale(payload: {
  productId: string;
  quantity: number;
  channel: 'TIENDA_ONLINE' | 'INSTAGRAM' | 'PUNTO_FISICO';
  customerName: string;
}): Promise<{ sale: Sale; product: Product; newAlert?: NotificationAlert }> {
  const sql = getNeonSql();
  const product = await getProductById(payload.productId);
  if (!product) {
    throw new Error(`Producto ${payload.productId} no encontrado`);
  }

  if (product.currentStock < payload.quantity) {
    throw new Error(`Stock insuficiente. Disponible: ${product.currentStock}, Solicitado: ${payload.quantity}`);
  }

  const previousStock = product.currentStock;
  const newStock = previousStock - payload.quantity;

  product.currentStock = newStock;
  product.availableStock = newStock - product.reservedStock;
  product.calculations = computeProductCalculations(
    product.params,
    newStock,
    product.reservedStock
  );
  product.updatedAt = new Date().toISOString();

  if (sql) {
    const saleCountRes = await sql`SELECT count(*) FROM sales`;
    const count = Number(saleCountRes[0].count) + 1;
    const saleId = `SL-${String(count).padStart(3, '0')}`;
    const saleNumber = `VTA-2026-${String(count).padStart(3, '0')}`;

    const newSale: Sale = {
      id: saleId,
      saleNumber,
      productId: product.id,
      productName: product.name,
      quantity: payload.quantity,
      unitPriceCOP: product.unitPriceCOP,
      totalCOP: payload.quantity * product.unitPriceCOP,
      channel: payload.channel,
      customerName: payload.customerName || 'Cliente Mostrador',
      createdAt: new Date().toISOString(),
    };

    // Actualizar stock en Neon
    await sql`
      UPDATE products
      SET current_stock = ${newStock},
          available_stock = ${product.availableStock},
          calculations = ${JSON.stringify(product.calculations)},
          updated_at = NOW()
      WHERE id = ${product.id}
    `;

    // Insertar venta en Neon
    await sql`
      INSERT INTO sales (id, sale_number, product_id, product_name, quantity, unit_price_cop, total_cop, channel, customer_name, created_at)
      VALUES (${newSale.id}, ${newSale.saleNumber}, ${newSale.productId}, ${newSale.productName}, ${newSale.quantity}, ${newSale.unitPriceCOP}, ${newSale.totalCOP}, ${newSale.channel}, ${newSale.customerName}, NOW())
    `;

    // Insertar Kardex en Neon
    const kardexCountRes = await sql`SELECT count(*) FROM kardex`;
    const kCount = Number(kardexCountRes[0].count) + 1;
    const kardexId = `KDX-${String(kCount).padStart(3, '0')}`;
    await sql`
      INSERT INTO kardex (id, product_id, product_name, date, type, quantity, previous_stock, new_stock, reference, notes, user_id)
      VALUES (${kardexId}, ${product.id}, ${product.name}, NOW(), 'SALIDA', ${payload.quantity}, ${previousStock}, ${newStock}, ${saleNumber}, ${`Venta canal ${payload.channel} a ${payload.customerName}`}, 'Vendedor Beauty')
    `;

    const newAlert = await reEvaluateProductAlarmAsync(product, sql);
    return { sale: newSale, product, newAlert };
  }

  // Fallback en memoria
  const state = getState();
  const saleId = `SL-${String(state.counterSales++).padStart(3, '0')}`;
  const saleNumber = `VTA-2026-${String(state.counterSales).padStart(3, '0')}`;
  const newSale: Sale = {
    id: saleId,
    saleNumber,
    productId: product.id,
    productName: product.name,
    quantity: payload.quantity,
    unitPriceCOP: product.unitPriceCOP,
    totalCOP: payload.quantity * product.unitPriceCOP,
    channel: payload.channel,
    customerName: payload.customerName || 'Cliente Mostrador',
    createdAt: new Date().toISOString(),
  };
  state.sales.unshift(newSale);

  const kardexId = `KDX-${String(state.counterKardex++).padStart(3, '0')}`;
  state.kardex.unshift({
    id: kardexId,
    productId: product.id,
    productName: product.name,
    date: new Date().toISOString(),
    type: 'SALIDA',
    quantity: payload.quantity,
    previousStock,
    newStock,
    reference: saleNumber,
    notes: `Venta canal ${payload.channel} a ${payload.customerName}`,
    userId: 'Vendedor Beauty',
  });

  const newAlert = reEvaluateProductAlarm(product);
  return { sale: newSale, product, newAlert };
}

export async function createPurchaseOrder(payload: {
  productId: string;
  quantity: number;
  supplier?: string;
  notes?: string;
}): Promise<PurchaseOrder> {
  const sql = getNeonSql();
  const product = await getProductById(payload.productId);
  if (!product) {
    throw new Error(`Producto ${payload.productId} no encontrado`);
  }

  if (sql) {
    const orderCountRes = await sql`SELECT count(*) FROM purchase_orders`;
    const count = Number(orderCountRes[0].count) + 1;
    const orderId = `ORD-${String(count).padStart(3, '0')}`;
    const orderNumber = `OC-2026-${String(count).padStart(3, '0')}`;
    const totalCost = payload.quantity * product.unitCostCOP;
    const supplier = payload.supplier || 'Beauty Cosméticos Colombia SAS';
    const notes = payload.notes || `Reabastecimiento según política (${product.params.policy})`;

    await sql`
      INSERT INTO purchase_orders (id, order_number, product_id, product_name, quantity, unit_cost_cop, total_cost_cop, supplier, status, created_at, notes)
      VALUES (${orderId}, ${orderNumber}, ${product.id}, ${product.name}, ${payload.quantity}, ${product.unitCostCOP}, ${totalCost}, ${supplier}, 'PENDIENTE', NOW(), ${notes})
    `;

    return {
      id: orderId,
      orderNumber,
      productId: product.id,
      productName: product.name,
      quantity: payload.quantity,
      unitCostCOP: product.unitCostCOP,
      totalCostCOP: totalCost,
      supplier,
      status: 'PENDIENTE',
      createdAt: new Date().toISOString(),
      notes,
    };
  }

  const state = getState();
  const orderId = `ORD-${String(state.counterOrders++).padStart(3, '0')}`;
  const orderNumber = `OC-2026-${String(state.counterOrders).padStart(3, '0')}`;
  const newOrder: PurchaseOrder = {
    id: orderId,
    orderNumber,
    productId: product.id,
    productName: product.name,
    quantity: payload.quantity,
    unitCostCOP: product.unitCostCOP,
    totalCostCOP: payload.quantity * product.unitCostCOP,
    supplier: payload.supplier || 'Beauty Cosméticos Colombia SAS',
    status: 'PENDIENTE',
    createdAt: new Date().toISOString(),
    notes: payload.notes || `Reabastecimiento según política (${product.params.policy})`,
  };
  state.purchaseOrders.unshift(newOrder);
  return newOrder;
}

export async function receivePurchaseOrder(orderId: string): Promise<{ order: PurchaseOrder; product: Product }> {
  const sql = getNeonSql();

  if (sql) {
    const orderRows = await sql`SELECT * FROM purchase_orders WHERE id = ${orderId}`;
    if (orderRows.length === 0) {
      throw new Error(`Orden ${orderId} no encontrada`);
    }
    const order = mapOrderRow(orderRows[0]);
    if (order.status === 'RECIBIDA') {
      throw new Error(`La orden ${order.orderNumber} ya fue recibida`);
    }

    const product = await getProductById(order.productId);
    if (!product) {
      throw new Error(`Producto ${order.productId} no encontrado`);
    }

    const previousStock = product.currentStock;
    const newStock = previousStock + order.quantity;

    product.currentStock = newStock;
    product.availableStock = newStock - product.reservedStock;
    product.calculations = computeProductCalculations(
      product.params,
      newStock,
      product.reservedStock
    );
    product.updatedAt = new Date().toISOString();

    await sql`
      UPDATE purchase_orders
      SET status = 'RECIBIDA', received_at = NOW()
      WHERE id = ${orderId}
    `;

    await sql`
      UPDATE products
      SET current_stock = ${newStock},
          available_stock = ${product.availableStock},
          calculations = ${JSON.stringify(product.calculations)},
          updated_at = NOW()
      WHERE id = ${product.id}
    `;

    const kardexCountRes = await sql`SELECT count(*) FROM kardex`;
    const kCount = Number(kardexCountRes[0].count) + 1;
    const kardexId = `KDX-${String(kCount).padStart(3, '0')}`;
    await sql`
      INSERT INTO kardex (id, product_id, product_name, date, type, quantity, previous_stock, new_stock, reference, notes, user_id)
      VALUES (${kardexId}, ${product.id}, ${product.name}, NOW(), 'ENTRADA', ${order.quantity}, ${previousStock}, ${newStock}, ${order.orderNumber}, ${`Recepción compra: ${order.supplier}`}, 'Almacén Beauty')
    `;

    await reEvaluateProductAlarmAsync(product, sql);
    order.status = 'RECIBIDA';
    order.receivedAt = new Date().toISOString();
    return { order, product };
  }

  const state = getState();
  const order = state.purchaseOrders.find(o => o.id === orderId);
  if (!order) throw new Error(`Orden ${orderId} no encontrada`);
  if (order.status === 'RECIBIDA') throw new Error(`La orden ${order.orderNumber} ya fue recibida`);

  const product = await getProductById(order.productId);
  if (!product) throw new Error(`Producto ${order.productId} no encontrado`);

  const previousStock = product.currentStock;
  const newStock = previousStock + order.quantity;

  product.currentStock = newStock;
  product.availableStock = newStock - product.reservedStock;
  product.calculations = computeProductCalculations(
    product.params,
    newStock,
    product.reservedStock
  );
  product.updatedAt = new Date().toISOString();

  order.status = 'RECIBIDA';
  order.receivedAt = new Date().toISOString();

  const kardexId = `KDX-${String(state.counterKardex++).padStart(3, '0')}`;
  state.kardex.unshift({
    id: kardexId,
    productId: product.id,
    productName: product.name,
    date: new Date().toISOString(),
    type: 'ENTRADA',
    quantity: order.quantity,
    previousStock,
    newStock,
    reference: order.orderNumber,
    notes: `Recepción de mercancía compra proveedor: ${order.supplier}`,
    userId: 'Almacén Beauty',
  });

  reEvaluateProductAlarm(product);
  return { order, product };
}

export async function recordInventoryAdjustment(payload: {
  productId: string;
  newStock: number;
  reason: string;
}): Promise<{ product: Product; kardex: KardexEntry }> {
  const sql = getNeonSql();
  const product = await getProductById(payload.productId);
  if (!product) throw new Error(`Producto ${payload.productId} no encontrado`);

  const previousStock = product.currentStock;
  const newStock = Math.max(0, payload.newStock);
  const diff = newStock - previousStock;
  const type: MovementType = diff >= 0 ? 'AJUSTE_POSITIVO' : 'AJUSTE_NEGATIVO';

  product.currentStock = newStock;
  product.availableStock = newStock - product.reservedStock;
  product.calculations = computeProductCalculations(
    product.params,
    newStock,
    product.reservedStock
  );
  product.updatedAt = new Date().toISOString();

  if (sql) {
    await sql`
      UPDATE products
      SET current_stock = ${newStock},
          available_stock = ${product.availableStock},
          calculations = ${JSON.stringify(product.calculations)},
          updated_at = NOW()
      WHERE id = ${product.id}
    `;

    const kardexCountRes = await sql`SELECT count(*) FROM kardex`;
    const kCount = Number(kardexCountRes[0].count) + 1;
    const kardexId = `KDX-${String(kCount).padStart(3, '0')}`;
    await sql`
      INSERT INTO kardex (id, product_id, product_name, date, type, quantity, previous_stock, new_stock, reference, notes, user_id)
      VALUES (${kardexId}, ${product.id}, ${product.name}, NOW(), ${type}, ${Math.abs(diff)}, ${previousStock}, ${newStock}, 'AJUSTE-MANUAL', ${payload.reason || 'Conteo físico'}, 'Auditor Beauty')
    `;

    await reEvaluateProductAlarmAsync(product, sql);

    const entry: KardexEntry = {
      id: kardexId,
      productId: product.id,
      productName: product.name,
      date: new Date().toISOString(),
      type,
      quantity: Math.abs(diff),
      previousStock,
      newStock,
      reference: 'AJUSTE-MANUAL',
      notes: payload.reason || 'Conteo físico de inventario',
      userId: 'Auditor Beauty',
    };
    return { product, kardex: entry };
  }

  const state = getState();
  const kardexId = `KDX-${String(state.counterKardex++).padStart(3, '0')}`;
  const entry: KardexEntry = {
    id: kardexId,
    productId: product.id,
    productName: product.name,
    date: new Date().toISOString(),
    type,
    quantity: Math.abs(diff),
    previousStock,
    newStock,
    reference: 'AJUSTE-MANUAL',
    notes: payload.reason || 'Conteo físico de inventario',
    userId: 'Auditor Beauty',
  };
  state.kardex.unshift(entry);
  reEvaluateProductAlarm(product);
  return { product, kardex: entry };
}

async function reEvaluateProductAlarmAsync(product: Product, sql: any): Promise<NotificationAlert | undefined> {
  const status = product.calculations.status;

  if (status === 'NORMAL') {
    await sql`
      UPDATE notifications
      SET resolved = TRUE, resolved_at = NOW()
      WHERE product_id = ${product.id} AND resolved = FALSE
    `;
    return undefined;
  }

  const existing = await sql`
    SELECT * FROM notifications
    WHERE product_id = ${product.id} AND resolved = FALSE AND severity = ${status}
  `;
  if (existing.length > 0) {
    await sql`
      UPDATE notifications
      SET current_stock = ${product.currentStock}
      WHERE id = ${existing[0].id}
    `;
    return mapNotificationRow(existing[0]);
  }

  let title = '';
  let message = '';
  if (status === 'STOCKOUT') {
    title = `🚫 QUIEBRE TOTAL DE STOCK: ${product.name}`;
    message = `¡Inventario en CERO! No hay unidades para despachar ventas. Genere orden de compra de emergencia por ${product.calculations.recommendedQ} uds inmediatamente.`;
  } else if (status === 'CRITICAL') {
    title = `🚨 ALERTA CRÍTICA: ${product.name}`;
    message = `Stock (${product.currentStock} uds) ≤ Stock de Seguridad (${product.calculations.safetyStock} uds). Riesgo inminente de quiebre. Sugerido ordenar: ${product.calculations.recommendedQ} uds.`;
  } else if (status === 'WARNING') {
    title = `⚠️ ALERTA DE REORDEN: ${product.name}`;
    message = `Stock (${product.currentStock} uds) ≤ Punto de Reorden (${product.calculations.reorderPoint} uds). Política (${product.params.policy}) recomienda emitir orden de compra por ${product.calculations.recommendedQ} uds.`;
  }

  const notifCount = await sql`SELECT count(*) FROM notifications`;
  const alertId = `ALT-${String(Number(notifCount[0].count) + 1).padStart(3, '0')}`;

  await sql`
    INSERT INTO notifications (id, product_id, product_name, severity, title, message, current_stock, reorder_point, safety_stock, suggested_q, created_at, resolved)
    VALUES (${alertId}, ${product.id}, ${product.name}, ${status}, ${title}, ${message}, ${product.currentStock}, ${product.calculations.reorderPoint}, ${product.calculations.safetyStock}, ${product.calculations.recommendedQ}, NOW(), FALSE)
  `;

  return {
    id: alertId,
    productId: product.id,
    productName: product.name,
    severity: status,
    title,
    message,
    currentStock: product.currentStock,
    reorderPoint: product.calculations.reorderPoint,
    safetyStock: product.calculations.safetyStock,
    suggestedQ: product.calculations.recommendedQ,
    createdAt: new Date().toISOString(),
    resolved: false,
  };
}

export function reEvaluateProductAlarm(product: Product): NotificationAlert | undefined {
  const state = getState();
  const status = product.calculations.status;

  if (status === 'NORMAL') {
    state.notifications.forEach(n => {
      if (n.productId === product.id && !n.resolved) {
        n.resolved = true;
        n.resolvedAt = new Date().toISOString();
      }
    });
    return undefined;
  }

  const existingActive = state.notifications.find(
    n => n.productId === product.id && !n.resolved && n.severity === status
  );
  if (existingActive) {
    existingActive.currentStock = product.currentStock;
    return existingActive;
  }

  let title = '';
  let message = '';
  if (status === 'STOCKOUT') {
    title = `🚫 QUIEBRE TOTAL DE STOCK: ${product.name}`;
    message = `¡Inventario en CERO! No hay unidades para despachar ventas. Genere orden de compra de emergencia por ${product.calculations.recommendedQ} uds inmediatamente.`;
  } else if (status === 'CRITICAL') {
    title = `🚨 ALERTA CRÍTICA: ${product.name}`;
    message = `Stock (${product.currentStock} uds) ≤ Stock de Seguridad (${product.calculations.safetyStock} uds). Riesgo inminente de quiebre. Sugerido ordenar: ${product.calculations.recommendedQ} uds.`;
  } else if (status === 'WARNING') {
    title = `⚠️ ALERTA DE REORDEN: ${product.name}`;
    message = `Stock (${product.currentStock} uds) ≤ Punto de Reorden (${product.calculations.reorderPoint} uds). Política (${product.params.policy}) recomienda emitir orden de compra por ${product.calculations.recommendedQ} uds.`;
  }

  const alertId = `ALT-${String(state.counterAlerts++).padStart(3, '0')}`;
  const newAlert: NotificationAlert = {
    id: alertId,
    productId: product.id,
    productName: product.name,
    severity: status,
    title,
    message,
    currentStock: product.currentStock,
    reorderPoint: product.calculations.reorderPoint,
    safetyStock: product.calculations.safetyStock,
    suggestedQ: product.calculations.recommendedQ,
    createdAt: new Date().toISOString(),
    resolved: false,
  };

  state.notifications.unshift(newAlert);
  return newAlert;
}

export async function getKardex(productId?: string): Promise<KardexEntry[]> {
  const sql = getNeonSql();
  if (sql) {
    if (productId && productId !== 'all') {
      const rows = await sql`SELECT * FROM kardex WHERE product_id = ${productId} ORDER BY date DESC`;
      return rows.map(mapKardexRow);
    }
    const rows = await sql`SELECT * FROM kardex ORDER BY date DESC`;
    return rows.map(mapKardexRow);
  }
  const all = getState().kardex;
  if (!productId || productId === 'all') return all;
  return all.filter(k => k.productId === productId);
}

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  const sql = getNeonSql();
  if (sql) {
    const rows = await sql`SELECT * FROM purchase_orders ORDER BY created_at DESC`;
    return rows.map(mapOrderRow);
  }
  return getState().purchaseOrders;
}

export async function getSales(): Promise<Sale[]> {
  const sql = getNeonSql();
  if (sql) {
    const rows = await sql`SELECT * FROM sales ORDER BY created_at DESC`;
    return rows.map(mapSaleRow);
  }
  return getState().sales;
}

export async function getNotifications(): Promise<NotificationAlert[]> {
  const sql = getNeonSql();
  if (sql) {
    const rows = await sql`SELECT * FROM notifications ORDER BY created_at DESC`;
    return rows.map(mapNotificationRow);
  }
  return getState().notifications;
}

export async function resolveNotification(id: string): Promise<boolean> {
  const sql = getNeonSql();
  if (sql) {
    await sql`
      UPDATE notifications
      SET resolved = TRUE, resolved_at = NOW()
      WHERE id = ${id}
    `;
    return true;
  }
  const alert = getState().notifications.find(n => n.id === id);
  if (alert) {
    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();
    return true;
  }
  return false;
}

export async function resetToDemoData(): Promise<void> {
  const sql = getNeonSql();
  if (sql) {
    await sql`TRUNCATE TABLE products, kardex, purchase_orders, sales, notifications CASCADE`;
    // Re-seed
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
    const glossCalc = computeProductCalculations(glossParams as any, glossStock, 0);

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
    const blushCalc = computeProductCalculations(blushParams as any, blushStock, 0);

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
    const pestaninaCalc = computeProductCalculations(pestaninaParams as any, pestaninaStock, 0);

    await sql`
      INSERT INTO products (id, slug, name, category, description, image_url, current_stock, reserved_stock, available_stock, unit_price_cop, unit_cost_cop, trendy_info, params, calculations)
      VALUES
      (
        'gloss', 'gloss-retro-glow', 'Gloss Labial Retro Glow Beauty', 'Labios',
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
        ${JSON.stringify(glossParams)}, ${JSON.stringify(glossCalc)}
      ),
      (
        'blush', 'rubor-crema-star', 'Rubor En Crema Star Beauty', 'Rostro',
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
        ${JSON.stringify(blushParams)}, ${JSON.stringify(blushCalc)}
      ),
      (
        'pestanina', 'pestanina-super-look', 'Pestañina Super Look Beauty', 'Ojos',
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
        ${JSON.stringify(pestaninaParams)}, ${JSON.stringify(pestaninaCalc)}
      )
    `;

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

    await sql`
      INSERT INTO purchase_orders (id, order_number, product_id, product_name, quantity, unit_cost_cop, total_cost_cop, supplier, status, created_at, notes)
      VALUES
      ('ORD-001', 'OC-2026-001', 'pestanina', 'Pestañina Super Look Beauty', 580, 6750, 3915000, 'Beauty Cosméticos Colombia SAS', 'PENDIENTE', NOW() - INTERVAL '1 day', 'Orden de compra urgente stock crítico'),
      ('ORD-002', 'OC-2026-002', 'gloss', 'Gloss Labial Retro Glow Beauty', 520, 4500, 2340000, 'Laboratorios Maquillaje Nacional', 'RECIBIDA', NOW() - INTERVAL '15 days', 'Recepción completa a satisfacción')
    `;

    await sql`
      INSERT INTO sales (id, sale_number, product_id, product_name, quantity, unit_price_cop, total_cop, channel, customer_name, created_at)
      VALUES
      ('SL-001', 'VTA-2026-041', 'gloss', 'Gloss Labial Retro Glow Beauty', 12, 10000, 120000, 'TIENDA_ONLINE', 'Valentina Restrepo', NOW() - INTERVAL '4 hours'),
      ('SL-002', 'VTA-2026-042', 'blush', 'Rubor En Crema Star Beauty', 6, 15000, 90000, 'INSTAGRAM', 'Mariana Caicedo', NOW() - INTERVAL '2 hours'),
      ('SL-003', 'VTA-2026-043', 'pestanina', 'Pestañina Super Look Beauty', 15, 15000, 225000, 'PUNTO_FISICO', 'Carolina Mendoza', NOW() - INTERVAL '1 hour')
    `;

    await sql`
      INSERT INTO notifications (id, product_id, product_name, severity, title, message, current_stock, reorder_point, safety_stock, suggested_q, created_at, resolved)
      VALUES
      ('ALT-001', 'pestanina', 'Pestañina Super Look Beauty', 'CRITICAL', '🚨 Stock Crítico en Pestañina Super Look', 'El inventario actual (45 uds) ha caído por debajo del Stock de Seguridad (53 uds). Peligro inminente de quiebre.', 45, 303, 53, 581, NOW(), FALSE),
      ('ALT-002', 'blush', 'Rubor En Crema Star Beauty', 'WARNING', '⚠️ Punto de Reorden alcanzado en Rubor En Crema Star', 'El stock (160 uds) es menor o igual al Punto de Reorden ROP (174 uds). Se sugiere emitir orden de compra.', 160, 174, 35, 366, NOW(), FALSE)
    `;
    return;
  }
  globalForApp.beautyAppState = getInitialState();
}
