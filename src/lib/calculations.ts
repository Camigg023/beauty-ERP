import {
  AlarmSeverity,
  InventoryPolicyType,
  ProductCalculations,
  ProductInventoryParams,
  SimulationResult,
  SimulationWeek,
} from '@/types';

/**
 * Tabla de Z-Score según nivel de servicio común (distribución normal estándar)
 */
export function getZScore(serviceLevel: number): number {
  if (serviceLevel >= 0.99) return 2.326; // 99%
  if (serviceLevel >= 0.98) return 2.054; // 98%
  if (serviceLevel >= 0.95) return 1.645; // 95% (defecto)
  if (serviceLevel >= 0.90) return 1.282; // 90%
  if (serviceLevel >= 0.85) return 1.036; // 85%
  return 1.645;
}

/**
 * Realiza todos los cálculos de política de inventarios obligatorios
 */
export function computeProductCalculations(
  params: ProductInventoryParams,
  currentStock: number,
  reservedStock: number = 0
): ProductCalculations {
  const annualDemand = Math.max(1, params.annualDemand);
  const leadTimeWeeks = Math.max(0.1, params.leadTimeWeeks);
  const orderCostS = Math.max(1, params.orderCostS);
  const holdingCostH = Math.max(0.1, params.holdingCostH);
  const serviceLevel = params.serviceLevel || 0.95;
  const demandStdDevWeekly = params.demandStdDevWeekly || (annualDemand / 52) * 0.2; // 20% variabilidad por defecto

  // Demanda diaria y semanal
  const dailyDemand = Math.round((annualDemand / 365) * 100) / 100;
  const weeklyDemand = Math.round((annualDemand / 52) * 100) / 100;

  // Z Score
  const zScore = getZScore(serviceLevel);

  // Stock de Seguridad: SS = Z * σ * √W
  const safetyStock = Math.ceil(zScore * demandStdDevWeekly * Math.sqrt(leadTimeWeeks));

  // Punto de Reorden (ROP): ROP = Demanda durante lead time + Stock de Seguridad
  const demandDuringLeadTime = weeklyDemand * leadTimeWeeks;
  const reorderPoint = Math.ceil(demandDuringLeadTime + safetyStock);

  // Cantidad Económica de Pedido (EOQ): EOQ = √(2 * D * S / H)
  const rawEOQ = Math.sqrt((2 * annualDemand * orderCostS) / holdingCostH);
  const eoq = Math.max(1, Math.ceil(rawEOQ));

  // Cantidad recomendada: manualQOverride si está definido y > 0, o EOQ
  const recommendedQ = (params.manualQOverride && params.manualQOverride > 0)
    ? Math.round(params.manualQOverride)
    : eoq;

  // Cobertura en días: Stock actual / demanda diaria
  const coverageDays = dailyDemand > 0
    ? Math.max(0, Math.round((currentStock / dailyDemand) * 10) / 10)
    : 999;

  // Evaluación de estado / semáforo de alarmas
  let status: AlarmSeverity = 'NORMAL';
  let statusLabel = 'Stock Óptimo';

  if (currentStock <= 0) {
    status = 'STOCKOUT';
    statusLabel = 'Quiebre de Stock (Agotado)';
  } else if (currentStock <= safetyStock) {
    status = 'CRITICAL';
    statusLabel = 'Stock Crítico (Bajo Seguridad)';
  } else if (currentStock <= reorderPoint) {
    status = 'WARNING';
    statusLabel = 'Alerta de Reorden (Stock ≤ ROP)';
  } else {
    status = 'NORMAL';
    statusLabel = 'Nivel Óptimo';
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

/**
 * Simulación de inventario proyectado a 12 semanas según política seleccionada:
 * - Política (Q, R): Cuando inventario ≤ ROP (R), se ordena Q. Llega en W semanas.
 * - Política (s, S): Cuando inventario ≤ s (ROP), se ordena hasta alcanzar el nivel objetivo S.
 */
export function simulate12Weeks(
  initialStock: number,
  params: ProductInventoryParams,
  calculations: ProductCalculations,
  addDemandNoise: boolean = false
): SimulationResult {
  const weeksCount = 12;
  const leadTimeWeeksRounded = Math.max(1, Math.round(params.leadTimeWeeks));
  const baseWeeklyDemand = calculations.weeklyDemand;
  const policy = params.policy || 'Q_R';

  // Punto s = ROP
  const s = params.reorderPointS_min ?? calculations.reorderPoint;
  // Nivel S objetivo (por defecto ROP + Q o especificado)
  const S_target = params.targetMaxStockS ?? (calculations.reorderPoint + calculations.recommendedQ);
  const fixedQ = calculations.recommendedQ;

  const weeks: SimulationWeek[] = [];
  let currentStock = initialStock;
  let pipelineOrders: { arriveInWeeks: number; quantity: number }[] = [];

  let totalDemand = 0;
  let totalOrders = 0;
  let totalUnitsOrdered = 0;
  let stockoutWeeksCount = 0;
  let stockSum = 0;

  for (let w = 1; w <= weeksCount; w++) {
    const beginningStock = currentStock;

    // Recepciones programadas para esta semana
    let receiptsThisWeek = 0;
    pipelineOrders = pipelineOrders.map(order => {
      const remaining = order.arriveInWeeks - 1;
      if (remaining <= 0) {
        receiptsThisWeek += order.quantity;
      }
      return { ...order, arriveInWeeks: remaining };
    }).filter(order => order.arriveInWeeks > 0);

    // Demanda de la semana (con o sin fluctuación aleatoria)
    let demand = baseWeeklyDemand;
    if (addDemandNoise) {
      // Variación gaussiana simple ±25%
      const variation = (Math.sin(w * 1.5) * 0.15 + (Math.cos(w * 2.3) * 0.1));
      demand = Math.max(1, Math.round(baseWeeklyDemand * (1 + variation)));
    }
    totalDemand += demand;

    // Stock antes de la demanda incluyendo lo que llegó
    const stockAvailable = beginningStock + receiptsThisWeek;
    const endingStock = Math.max(0, stockAvailable - demand);
    const isStockout = (stockAvailable - demand) < 0;
    if (isStockout || endingStock === 0) {
      stockoutWeeksCount++;
    }

    // Calcular posición de inventario (Stock físico + Pedidos en tránsito)
    const onOrder = pipelineOrders.reduce((sum, o) => sum + o.quantity, 0);
    const inventoryPosition = endingStock + onOrder;

    let orderPlaced = false;
    let orderQuantity = 0;

    // Evaluación según política
    if (policy === 'Q_R') {
      if (inventoryPosition <= calculations.reorderPoint) {
        orderPlaced = true;
        orderQuantity = fixedQ;
      }
    } else {
      // Política (s, S)
      if (inventoryPosition <= s) {
        orderPlaced = true;
        orderQuantity = Math.max(fixedQ, S_target - inventoryPosition);
      }
    }

    if (orderPlaced && orderQuantity > 0) {
      pipelineOrders.push({
        arriveInWeeks: leadTimeWeeksRounded,
        quantity: orderQuantity,
      });
      totalOrders++;
      totalUnitsOrdered += orderQuantity;
    }

    weeks.push({
      week: w,
      beginningStock,
      projectedDemand: demand,
      receipts: receiptsThisWeek,
      endingStock,
      orderPlaced,
      orderQuantity,
      isStockout,
    });

    currentStock = endingStock;
    stockSum += endingStock;
  }

  return {
    productId: '',
    policy,
    totalWeeks: weeksCount,
    weeks,
    totalDemand,
    totalOrders,
    totalUnitsOrdered,
    stockoutWeeksCount,
    averageStock: Math.round(stockSum / weeksCount),
  };
}
