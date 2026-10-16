'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  TrendingUp,
  Package,
  ShoppingCart,
  BadgeDollarSign,
  Clock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useApp } from '@/context/AppContext';
import { LipstickIcon, BlushIcon, MascaraIcon } from '@/components/CosmeticIcons';
import { Product } from '@/types';

export default function DashboardPage() {
  const { products, notifications, dataError, openQuickOrder, setNotificationModalOpen } = useApp();

  // KPIs globales
  const totalUnits = products.reduce((sum, p) => sum + p.currentStock, 0);
  const totalValuationCost = products.reduce((sum, p) => sum + p.currentStock * p.unitCostCOP, 0);
  const totalValuationSale = products.reduce((sum, p) => sum + p.currentStock * p.unitPriceCOP, 0);
  const avgCoverageDays = products.length > 0
    ? Math.round(products.reduce((sum, p) => sum + p.calculations.coverageDays, 0) / products.length)
    : 0;

  const activeAlerts = notifications.filter(n => !n.resolved);
  const criticalAlerts = activeAlerts.filter(n => n.severity === 'CRITICAL' || n.severity === 'STOCKOUT');
  const warningAlerts = activeAlerts.filter(n => n.severity === 'WARNING');

  // Datos para gráficos de Recharts
  const chartStockComparison = products.map(p => ({
    name: p.name.split(' ')[0], // 'Gloss', 'Rubor', 'Pestañina'
    fullName: p.name,
    'Stock Actual': p.currentStock,
    'Punto Reorden (ROP)': p.calculations.reorderPoint,
    'Stock Seguridad (SS)': p.calculations.safetyStock,
    'Cantidad Pedido (Q)': p.calculations.recommendedQ,
  }));

  const chartDemandComparison = products.map(p => ({
    name: p.name.split(' ')[0],
    'Demanda Semanal (d_w)': Math.round(p.calculations.weeklyDemand),
    'Desviación (σ)': p.params.demandStdDevWeekly,
    'Lead Time (sem)': p.params.leadTimeWeeks,
  }));

  // Semáforo badge helper
  const getTrafficLight = (p: Product) => {
    const status = p.calculations.status;
    if (status === 'STOCKOUT') {
      return {
        label: 'Quiebre de Stock',
        color: 'bg-rose-950 text-rose-300 border-rose-700',
        dot: 'bg-rose-500 animate-ping',
        desc: '0 unidades en almacén',
      };
    }
    if (status === 'CRITICAL') {
      return {
        label: 'Stock Crítico',
        color: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40',
        dot: 'bg-rose-500',
        desc: `Stock ≤ SS (${p.calculations.safetyStock} uds)`,
      };
    }
    if (status === 'WARNING') {
      return {
        label: 'Punto de Reorden',
        color: 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40',
        dot: 'bg-amber-500',
        desc: `Stock ≤ ROP (${p.calculations.reorderPoint} uds)`,
      };
    }
    return {
      label: 'Nivel Óptimo',
      color: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/40',
      dot: 'bg-emerald-500',
      desc: 'Inventario en zona segura',
    };
  };

  const getProductIcon = (id: string) => {
    if (id === 'gloss') return <LipstickIcon className="w-5 h-5 text-pink-500" />;
    if (id === 'blush') return <BlushIcon className="w-5 h-5 text-fuchsia-500" />;
    return <MascaraIcon className="w-5 h-5 text-purple-500" />;
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-darkbg-900 transition-colors">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 pb-16">
        <Header
          title="Panel General de Control (ERP)"
          subtitle="Monitoreo de Inventario en Tiempo Real • Cosméticos Beauty"
        />

        <div className="px-4 sm:px-8 py-6 space-y-8 max-w-7xl mx-auto w-full">
          {dataError && (
            <div
              role="alert"
              className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
            >
              No se pudieron cargar los datos del inventario: {dataError}. Verifica la sesión y la conexión con la base de datos.
            </div>
          )}
          {/* BANNER DE ALARMA SI EXISTEN ALERTAS ACTIVAS */}
          {activeAlerts.length > 0 && (
            <div className={`p-4 sm:p-5 rounded-3xl border shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
              criticalAlerts.length > 0
                ? 'bg-gradient-to-r from-rose-500/15 via-pink-500/15 to-purple-500/10 border-rose-400/50 dark:border-rose-900/60'
                : 'bg-gradient-to-r from-amber-500/15 via-pink-500/10 to-transparent border-amber-400/50 dark:border-amber-900/60'
            }`}>
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md ${
                  criticalAlerts.length > 0 ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
                }`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white">
                    {criticalAlerts.length > 0
                      ? `¡Atención! Hay ${criticalAlerts.length} producto(s) en Stock Crítico`
                      : `Alerta de Reorden: ${warningAlerts.length} producto(s) alcanzaron su ROP`}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Se recomienda emitir órdenes de compra inmediatas según la política (Q, R) para evitar quiebres de stock.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => setNotificationModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-white bg-white/80 dark:bg-slate-900/80 hover:bg-white border border-pink-200 dark:border-pink-900 shadow-sm transition-all"
                >
                  Ver Detalles ({activeAlerts.length})
                </button>
                {criticalAlerts.length > 0 && (
                  <button
                    onClick={() => {
                      const critProd = products.find(p => p.id === criticalAlerts[0].productId);
                      if (critProd) openQuickOrder(critProd);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 shadow-md shadow-pink-500/25 transition-all"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Auto-ordenar {criticalAlerts[0].productName.split(' ')[0]}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 4 KPIS GLOBALES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1 */}
            <div className="p-5 rounded-3xl glass-card relative overflow-hidden group hover:scale-[1.01] transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Unidades
                </span>
                <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-950/50 text-pink-600">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {totalUnits.toLocaleString('es-CO')}
                <span className="text-xs font-medium text-slate-500 ml-1.5">uds físicas</span>
              </p>
              <p className="text-xs text-pink-600 dark:text-pink-400 font-semibold mt-1">
                En los 3 productos del catálogo
              </p>
            </div>

            {/* KPI 2 */}
            <div className="p-5 rounded-3xl glass-card relative overflow-hidden group hover:scale-[1.01] transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Valoración Inventario
                </span>
                <div className="p-2 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-950/50 text-fuchsia-600">
                  <BadgeDollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                ${(totalValuationCost / 1000000).toFixed(2)}M
                <span className="text-xs font-medium text-slate-500 ml-1.5">COP (Costo)</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                PVP Estimado: ${(totalValuationSale / 1000000).toFixed(2)}M COP
              </p>
            </div>

            {/* KPI 3 */}
            <div className="p-5 rounded-3xl glass-card relative overflow-hidden group hover:scale-[1.01] transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Semáforo de Alarmas
                </span>
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {activeAlerts.length}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  {criticalAlerts.length > 0 && (
                    <span className="text-rose-500 font-extrabold">({criticalAlerts.length} críticas)</span>
                  )}
                  {warningAlerts.length > 0 && (
                    <span className="text-amber-500">({warningAlerts.length} reorden)</span>
                  )}
                  {activeAlerts.length === 0 && (
                    <span className="text-emerald-500">Todo Óptimo</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                Evaluadas por política (Q, R)
              </p>
            </div>

            {/* KPI 4 */}
            <div className="p-5 rounded-3xl glass-card relative overflow-hidden group hover:scale-[1.01] transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Cobertura Promedio
                </span>
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {avgCoverageDays}
                <span className="text-xs font-medium text-slate-500 ml-1.5">días de stock</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                Días de venta con demanda actual
              </p>
            </div>
          </div>

          {/* SECCIÓN 1: SEMÁFORO DE LOS 3 PRODUCTOS EXACTOS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  <span>Semáforo de Inventario (Los 3 Productos)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Evaluación instantánea del Punto de Reorden (ROP) y Stock de Seguridad (SS)
                </p>
              </div>
              <Link
                href="/inventario"
                className="text-xs font-bold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
              >
                <span>Ver Kardex</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map(product => {
                const traffic = getTrafficLight(product);
                const current = product.currentStock;
                const rop = product.calculations.reorderPoint;
                const ss = product.calculations.safetyStock;
                const q = product.calculations.recommendedQ;

                // % de barra de progreso relativo al ROP (max 100%)
                const progressPct = Math.min(100, Math.round((current / (rop * 1.3)) * 100));

                return (
                  <div
                    key={product.id}
                    className="p-6 rounded-3xl glass-card flex flex-col justify-between border border-pink-200/50 dark:border-pink-900/40 hover:shadow-glow-pink transition-all group"
                  >
                    {/* Top: Product Name, Ref & Badge */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-pink-100/80 dark:bg-pink-950/60">
                            {getProductIcon(product.id)}
                          </div>
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              SKU #{product.id.toUpperCase()}
                            </span>
                            <h4 className="font-extrabold text-base text-slate-800 dark:text-white leading-tight">
                              {product.name}
                            </h4>
                          </div>
                        </div>
                      </div>

                      {/* Semáforo Pill */}
                      <div className="flex items-center justify-between pt-1">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${traffic.color}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${traffic.dot}`} />
                          <span>{traffic.label}</span>
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {product.calculations.coverageDays} días cob.
                        </span>
                      </div>

                      {/* Mini Image + Reference Badge */}
                      <div className="p-3 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-pink-100/60 dark:border-pink-900/30 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-pink-100 shrink-0">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0 text-xs">
                          <p className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                            Ref Beauty: {product.trendyInfo.referenceCode}
                          </p>
                          <p className="text-slate-500">
                            PVP: ${product.unitPriceCOP.toLocaleString('es-CO')} COP
                          </p>
                          <a
                            href={product.trendyInfo.storeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-0.5 mt-0.5"
                          >
                            <span>Ver en tienda Beauty</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>

                      {/* Stock vs ROP / SS comparison bars */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-600 dark:text-slate-300">
                            Stock Actual: <strong className="text-pink-600 dark:text-pink-400 font-extrabold">{current} uds</strong>
                          </span>
                          <span className="text-slate-400">ROP: {rop} uds</span>
                        </div>

                        {/* Visual Bar */}
                        <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              product.calculations.status === 'STOCKOUT'
                                ? 'bg-slate-900 w-0'
                                : product.calculations.status === 'CRITICAL'
                                ? 'bg-rose-500'
                                : product.calculations.status === 'WARNING'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>

                        {/* Reference indicators */}
                        <div className="flex justify-between text-[10px] text-slate-400 pt-0.5 font-medium">
                          <span>SS: {ss} uds (Z=1.65)</span>
                          <span>Política: {product.params.policy}</span>
                          <span>EOQ (Q): {q} uds</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action: Generar Orden de Compra */}
                    <div className="pt-4 mt-4 border-t border-pink-100/60 dark:border-pink-900/30">
                      <button
                        onClick={() => openQuickOrder(product)}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                          product.calculations.status !== 'NORMAL'
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/25 hover:opacity-95 hover:scale-[1.01]'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-pink-200 dark:border-pink-900 hover:bg-pink-50 dark:hover:bg-pink-950/30'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Generar orden de compra (Q={q})</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECCIÓN 2: GRÁFICOS RECHARTS CON DEGRADADOS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico 1: Stock Actual vs ROP vs Stock de Seguridad */}
            <div className="p-6 rounded-3xl glass-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-base text-slate-800 dark:text-white">
                    Stock Actual vs. ROP vs. Seguridad (SS)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Comparación directa de niveles de inventario por producto
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600">
                  <Layers className="w-4 h-4" />
                </div>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartStockComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#db2777" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="ropGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#d97706" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="ssGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(244, 114, 182, 0.15)" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        borderColor: '#db2777',
                        borderRadius: '16px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Stock Actual" fill="url(#stockGradient)" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Punto Reorden (ROP)" fill="url(#ropGradient)" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Stock Seguridad (SS)" fill="url(#ssGradient)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 2: Demanda Semanal y Variabilidad */}
            <div className="p-6 rounded-3xl glass-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-base text-slate-800 dark:text-white">
                    Demanda Semanal y Rotación Operativa
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ritmo de consumo semanal (d_w) y tiempo de reposición del proveedor (W)
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-950/40 text-pink-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartDemandComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="demandArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(244, 114, 182, 0.15)" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        borderColor: '#a855f7',
                        borderRadius: '16px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area
                      type="monotone"
                      dataKey="Demanda Semanal (d_w)"
                      stroke="#9333ea"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#demandArea)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ACCESOS RÁPIDOS OPERATIVOS */}
          <div className="p-6 rounded-3xl glass-card flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">
                Acciones Rápidas del Día
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registra ventas, compras o ajusta las fórmulas de reposición
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/ventas"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:opacity-95 shadow-md shadow-pink-500/20 transition-all"
              >
                <BadgeDollarSign className="w-4 h-4" />
                <span>Registrar Venta</span>
              </Link>
              <Link
                href="/compras"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 hover:bg-white border border-pink-200 dark:border-pink-900 shadow-sm transition-all"
              >
                <ShoppingCart className="w-4 h-4 text-pink-500" />
                <span>Ver Órdenes de Compra</span>
              </Link>
              <Link
                href="/parametros"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 hover:bg-white border border-pink-200 dark:border-pink-900 shadow-sm transition-all"
              >
                <span>Calibrar Parámetros (D, W, S, H)</span>
              </Link>
              <Link
                href="/simulador"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 hover:bg-purple-200 transition-all"
              >
                <span>Simulador 12 Semanas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
