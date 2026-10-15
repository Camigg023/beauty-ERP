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

// Estructura de almacenamiento en memoria accesible por toda la aplicación
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

// Semilla inicial realista de los 3 productos obligatorios
function generateInitialProducts(): Product[] {
  // 1. Gloss
  const glossParams: ProductInventoryParams = {
    annualDemand: 3600,         // ~69 unidades/semana, ~10 al día
    leadTimeWeeks: 2,           // 2 semanas
    orderCostS: 45000,          // $45.000 COP por orden de compra
    holdingCostH: 1200,         // $1.200 COP por unidad al año (~26% de costo)
    serviceLevel: 0.95,         // 95%
    demandStdDevWeekly: 14,     // σ = 14
    policy: 'Q_R',
    manualQOverride: null,
  };
  const glossStock = 240; // Nivel verde saludable
  const glossCalculations = computeProductCalculations(glossParams, glossStock, 0);

  // 2. Blush
  const blushParams: ProductInventoryParams = {
    annualDemand: 2400,         // ~46 unidades/semana
    leadTimeWeeks: 3,           // 3 semanas
    orderCostS: 50000,          // $50.000 COP por orden
    holdingCostH: 1800,         // $1.800 COP por unidad al año
    serviceLevel: 0.95,         // 95%
    demandStdDevWeekly: 12,     // σ = 12
    policy: 'Q_R',
    manualQOverride: null,
  };
  // ROP para blush = (46.15 * 3) + (1.645 * 12 * √3) = 138.45 + 34.19 = ~173
  const blushStock = 160; // En punto de advertencia / reorden (160 <= 173) -> Alerta amarilla
  const blushCalculations = computeProductCalculations(blushParams, blushStock, 0);

  // 3. Pestañina
  const pestaninaParams: ProductInventoryParams = {
    annualDemand: 5200,         // 100 unidades/semana
    leadTimeWeeks: 2.5,         // 2.5 semanas
    orderCostS: 55000,          // $55.000 COP
    holdingCostH: 1700,         // $1.700 COP
    serviceLevel: 0.95,         // 95%
    demandStdDevWeekly: 20,     // σ = 20
    policy: 'Q_R',
    manualQOverride: null,
  };
  // ROP pestañina = (100 * 2.5) + (1.645 * 20 * √2.5) = 250 + 52 = ~302
  // SS pestañina = ~52
  const pestaninaStock = 45; // Crítico: 45 <= 52 (Bajo stock de seguridad!) -> Alerta roja
  const pestaninaCalculations = computeProductCalculations(pestaninaParams, pestaninaStock, 0);

  const now = new Date().toISOString();

  return [
    {
      id: 'gloss',
      slug: 'gloss-retro-glow',
      name: 'Gloss Labial Retro Glow Trendy',
      category: 'Labios',
      description: 'Brillo labial ultra brillante y nutritivo con acabado no pegajoso y aroma frutal.',
      imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80',
      currentStock: glossStock,
      reservedStock: 0,
      availableStock: glossStock,
      unitPriceCOP: 10000,
      unitCostCOP: 4500,
      trendyInfo: {
        name: 'Gloss Retro Glow Trendy',
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
      name: 'Rubor En Crema Star Trendy',
      category: 'Rostro',
      description: 'Rubor en crema aterciopelado de larga duración, fácil difuminado y acabado glow natural.',
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80',
      currentStock: blushStock,
      reservedStock: 0,
      availableStock: blushStock,
      unitPriceCOP: 15000,
      unitCostCOP: 6750,
      trendyInfo: {
        name: 'Rubor En Crema Star Trendy',
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
      name: 'Pestañina Super Look Trendy',
      category: 'Ojos',
      description: 'Máscara de pestañas efecto volumen extremo y alargamiento a prueba de agua con cepillo de silicona.',
      imageUrl: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=600&auto=format&fit=crop&q=80',
      currentStock: pestaninaStock,
      reservedStock: 0,
      availableStock: pestaninaStock,
      unitPriceCOP: 15000,
      unitCostCOP: 6750,
      trendyInfo: {
        name: 'Pestañina Super Look Trendy',
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

// Historial inicial de kardex con movimientos realistas
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
      productName: 'Gloss Labial Retro Glow Trendy',
      date: d(14),
      type: 'ENTRADA',
      quantity: 300,
      previousStock: 0,
      newStock: 300,
      reference: 'INV-INICIAL',
      notes: 'Inventario inicial de apertura de bodega',
      userId: 'Admin Trendy',
    },
    {
      id: 'KDX-002',
      productId: 'gloss',
      productName: 'Gloss Labial Retro Glow Trendy',
      date: d(5),
      type: 'SALIDA',
      quantity: 60,
      previousStock: 300,
      newStock: 240,
      reference: 'VTA-LOTE-01',
      notes: 'Despacho de pedidos canal Instagram y Tienda Online',
      userId: 'Admin Trendy',
    },
    {
      id: 'KDX-003',
      productId: 'blush',
      productName: 'Rubor En Crema Star Trendy',
      date: d(20),
      type: 'ENTRADA',
      quantity: 250,
      previousStock: 0,
      newStock: 250,
      reference: 'INV-INICIAL',
      notes: 'Lote de importación inicial',
      userId: 'Admin Trendy',
    },
    {
      id: 'KDX-004',
      productId: 'blush',
      productName: 'Rubor En Crema Star Trendy',
      date: d(3),
      type: 'SALIDA',
      quantity: 90,
      previousStock: 250,
      newStock: 160,
      reference: 'VTA-PROMO-PRIMAVERA',
      notes: 'Venta flash fin de semana campaña Trendy',
      userId: 'Admin Trendy',
    },
    {
      id: 'KDX-005',
      productId: 'pestanina',
      productName: 'Pestañina Super Look Trendy',
      date: d(18),
      type: 'ENTRADA',
      quantity: 400,
      previousStock: 0,
      newStock: 400,
      reference: 'INV-INICIAL',
      notes: 'Cargue inicial de inventario',
      userId: 'Admin Trendy',
    },
    {
      id: 'KDX-006',
      productId: 'pestanina',
      productName: 'Pestañina Super Look Trendy',
      date: d(4),
      type: 'SALIDA',
      quantity: 355,
      previousStock: 400,
      newStock: 45,
      reference: 'VTA-MAYORISTA-09',
      notes: 'Venta mayorista a distribuidores Medellín y Bogotá',
      userId: 'Admin Trendy',
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
      productName: 'Pestañina Super Look Trendy',
      quantity: 580,
      unitCostCOP: 6750,
      totalCostCOP: 580 * 6750,
      supplier: 'Trendy Cosméticos Colombia SAS',
      status: 'PENDIENTE',
      createdAt: d(1),
      notes: 'Orden de compra urgente generada por alerta de stock crítico',
    },
    {
      id: 'ORD-002',
      orderNumber: 'OC-2026-002',
      productId: 'gloss',
      productName: 'Gloss Labial Retro Glow Trendy',
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
      productName: 'Gloss Labial Retro Glow Trendy',
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
      productName: 'Rubor En Crema Star Trendy',
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
      productName: 'Pestañina Super Look Trendy',
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

// Singleton global para mantener persistencia entre llamadas de API en Node
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
// OPERACIONES DEL DOMINIO
// -------------------------------------------------------------

export function getProducts(): Product[] {
  return getState().products;
}

export function getProductById(id: string): Product | undefined {
  return getState().products.find(p => p.id === id);
}

export function updateProductParams(id: string, newParams: Partial<ProductInventoryParams>): Product {
  const state = getState();
  const productIndex = state.products.findIndex(p => p.id === id);
  if (productIndex === -1) {
    throw new Error(`Producto ${id} no encontrado`);
  }

  const current = state.products[productIndex];
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

  state.products[productIndex] = updated;

  // Re-evaluar alarmas para este producto
  reEvaluateProductAlarm(updated);

  return updated;
}

export function recordSale(payload: {
  productId: string;
  quantity: number;
  channel: 'TIENDA_ONLINE' | 'INSTAGRAM' | 'PUNTO_FISICO';
  customerName: string;
}): { sale: Sale; product: Product; newAlert?: NotificationAlert } {
  const state = getState();
  const product = getProductById(payload.productId);
  if (!product) {
    throw new Error(`Producto ${payload.productId} no encontrado`);
  }

  if (product.currentStock < payload.quantity) {
    throw new Error(`Stock insuficiente. Disponible: ${product.currentStock}, Solicitado: ${payload.quantity}`);
  }

  const previousStock = product.currentStock;
  const newStock = previousStock - payload.quantity;

  // Actualizar stock del producto
  product.currentStock = newStock;
  product.availableStock = newStock - product.reservedStock;
  product.calculations = computeProductCalculations(
    product.params,
    newStock,
    product.reservedStock
  );
  product.updatedAt = new Date().toISOString();

  // Registrar venta
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

  // Registrar Kardex
  const kardexId = `KDX-${String(state.counterKardex++).padStart(3, '0')}`;
  const kardexEntry: KardexEntry = {
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
    userId: 'Vendedor Trendy',
  };
  state.kardex.unshift(kardexEntry);

  // Evaluar alarmas
  const newAlert = reEvaluateProductAlarm(product);

  return { sale: newSale, product, newAlert };
}

export function createPurchaseOrder(payload: {
  productId: string;
  quantity: number;
  supplier?: string;
  notes?: string;
}): PurchaseOrder {
  const state = getState();
  const product = getProductById(payload.productId);
  if (!product) {
    throw new Error(`Producto ${payload.productId} no encontrado`);
  }

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
    supplier: payload.supplier || 'Trendy Cosméticos Colombia SAS',
    status: 'PENDIENTE',
    createdAt: new Date().toISOString(),
    notes: payload.notes || `Reabastecimiento según política (${product.params.policy})`,
  };

  state.purchaseOrders.unshift(newOrder);
  return newOrder;
}

export function receivePurchaseOrder(orderId: string): { order: PurchaseOrder; product: Product } {
  const state = getState();
  const order = state.purchaseOrders.find(o => o.id === orderId);
  if (!order) {
    throw new Error(`Orden ${orderId} no encontrada`);
  }

  if (order.status === 'RECIBIDA') {
    throw new Error(`La orden ${order.orderNumber} ya fue recibida`);
  }

  const product = getProductById(order.productId);
  if (!product) {
    throw new Error(`Producto ${order.productId} no encontrado`);
  }

  const previousStock = product.currentStock;
  const newStock = previousStock + order.quantity;

  // Actualizar stock
  product.currentStock = newStock;
  product.availableStock = newStock - product.reservedStock;
  product.calculations = computeProductCalculations(
    product.params,
    newStock,
    product.reservedStock
  );
  product.updatedAt = new Date().toISOString();

  // Actualizar estado de la orden
  order.status = 'RECIBIDA';
  order.receivedAt = new Date().toISOString();

  // Kardex
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
    userId: 'Almacén Trendy',
  });

  // Re-evaluar alarma (si sube por encima de ROP, resolvemos alertas abiertas)
  reEvaluateProductAlarm(product);

  return { order, product };
}

export function recordInventoryAdjustment(payload: {
  productId: string;
  newStock: number;
  reason: string;
}): { product: Product; kardex: KardexEntry } {
  const state = getState();
  const product = getProductById(payload.productId);
  if (!product) {
    throw new Error(`Producto ${payload.productId} no encontrado`);
  }

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
    userId: 'Auditor Trendy',
  };
  state.kardex.unshift(entry);

  reEvaluateProductAlarm(product);

  return { product, kardex: entry };
}

export function reEvaluateProductAlarm(product: Product): NotificationAlert | undefined {
  const state = getState();
  const status = product.calculations.status;

  if (status === 'NORMAL') {
    // Resolver alertas activas de este producto
    state.notifications.forEach(n => {
      if (n.productId === product.id && !n.resolved) {
        n.resolved = true;
        n.resolvedAt = new Date().toISOString();
      }
    });
    return undefined;
  }

  // Verificar si ya existe alerta activa no resuelta del mismo tipo
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

export function getKardex(productId?: string): KardexEntry[] {
  const all = getState().kardex;
  if (!productId || productId === 'all') return all;
  return all.filter(k => k.productId === productId);
}

export function getPurchaseOrders(): PurchaseOrder[] {
  return getState().purchaseOrders;
}

export function getSales(): Sale[] {
  return getState().sales;
}

export function getNotifications(): NotificationAlert[] {
  return getState().notifications;
}

export function resolveNotification(id: string): boolean {
  const alert = getState().notifications.find(n => n.id === id);
  if (alert) {
    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();
    return true;
  }
  return false;
}

export function resetToDemoData(): void {
  globalForApp.beautyAppState = getInitialState();
}
