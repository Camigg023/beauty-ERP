export type InventoryPolicyType = 'Q_R' | 's_S';

export type AlarmSeverity = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'STOCKOUT';

export interface TrendyReference {
  name: string;
  referenceCode: string;
  scrapedPriceCOP: number;
  estimatedUnitCostCOP: number;
  storeUrl: string;
  lastCheckedDate: string;
  isEstimated: boolean;
}

export interface ProductInventoryParams {
  annualDemand: number;          // D (unidades/año)
  leadTimeWeeks: number;         // W (semanas)
  orderCostS: number;            // S ($ por orden en COP)
  holdingCostH: number;          // H ($ mantener/unidad/año en COP)
  serviceLevel: number;          // e.g. 0.95 (95%)
  demandStdDevWeekly: number;    // σ_w (desviación estándar semanal)
  policy: InventoryPolicyType;   // (Q,R) o (s,S)
  targetMaxStockS?: number;      // S para política (s,S)
  reorderPointS_min?: number;    // s para política (s,S)
  manualQOverride?: number | null; // Sobrescribir Q si no es null
}

export interface ProductCalculations {
  dailyDemand: number;           // d_d = D / 365
  weeklyDemand: number;          // d_w = D / 52
  zScore: number;                // Z según nivel de servicio
  safetyStock: number;           // SS = Z * σ * √W
  reorderPoint: number;          // ROP = (d_w * W) + SS
  eoq: number;                   // EOQ = √(2*D*S / H)
  recommendedQ: number;          // Q (EOQ o manualQOverride)
  coverageDays: number;          // Stock actual / d_d
  status: AlarmSeverity;         // NORMAL, WARNING, CRITICAL, STOCKOUT
  statusLabel: string;
}

export interface Product {
  id: string;                    // 'gloss', 'blush', 'pestanina'
  slug: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  unitPriceCOP: number;
  unitCostCOP: number;
  trendyInfo: TrendyReference;
  params: ProductInventoryParams;
  calculations: ProductCalculations;
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 'ENTRADA' | 'SALIDA' | 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO';

export interface KardexEntry {
  id: string;
  productId: string;
  productName: string;
  date: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reference: string;             // e.g. 'OC-1002', 'VTA-5041', 'INV-ADJ'
  notes: string;
  userId: string;
}

export type PurchaseOrderStatus = 'PENDIENTE' | 'APROBADA' | 'RECIBIDA' | 'CANCELADA';

export interface PurchaseOrder {
  id: string;
  orderNumber: string;           // e.g. 'OC-2026-001'
  productId: string;
  productName: string;
  quantity: number;
  unitCostCOP: number;
  totalCostCOP: number;
  supplier: string;
  status: PurchaseOrderStatus;
  createdAt: string;
  receivedAt?: string;
  notes?: string;
}

export interface Sale {
  id: string;
  saleNumber: string;            // e.g. 'VTA-2026-101'
  productId: string;
  productName: string;
  quantity: number;
  unitPriceCOP: number;
  totalCOP: number;
  channel: 'TIENDA_ONLINE' | 'INSTAGRAM' | 'PUNTO_FISICO';
  customerName: string;
  createdAt: string;
}

export interface NotificationAlert {
  id: string;
  productId: string;
  productName: string;
  severity: AlarmSeverity;
  title: string;
  message: string;
  currentStock: number;
  reorderPoint: number;
  safetyStock: number;
  suggestedQ: number;
  createdAt: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface SimulationWeek {
  week: number;
  beginningStock: number;
  projectedDemand: number;
  receipts: number;
  endingStock: number;
  orderPlaced: boolean;
  orderQuantity: number;
  isStockout: boolean;
}

export interface SimulationResult {
  productId: string;
  policy: InventoryPolicyType;
  totalWeeks: number;
  weeks: SimulationWeek[];
  totalDemand: number;
  totalOrders: number;
  totalUnitsOrdered: number;
  stockoutWeeksCount: number;
  averageStock: number;
}
