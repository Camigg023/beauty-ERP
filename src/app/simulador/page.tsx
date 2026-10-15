'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart as LineChartIcon,
  Play,
  RotateCcw,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useApp } from '@/context/AppContext';
import { InventoryPolicyType, SimulationResult } from '@/types';
import { simulate12Weeks } from '@/lib/calculations';
import { LipstickIcon, BlushIcon, MascaraIcon } from '@/components/CosmeticIcons';

export default function SimuladorPage() {
  const { products } = useApp();
  const [selectedProductId, setSelectedProductId] = useState<string>('gloss');
  const [policy, setPolicy] = useState<InventoryPolicyType>('Q_R');
  const [demandNoise, setDemandNoise] = useState<boolean>(true);
  const [initialStock, setInitialStock] = useState<number>(240);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  const runSimulation = useCallback(() => {
    if (!selectedProduct) return;
    const res = simulate12Weeks(
      initialStock,
      { ...selectedProduct.params, policy },
      selectedProduct.calculations,
      demandNoise
    );
    res.productId = selectedProduct.id;
    setSimulation(res);
  }, [selectedProduct, initialStock, policy, demandNoise]);

  useEffect(() => {
    if (selectedProduct) {
      setInitialStock(selectedProduct.currentStock);
      setPolicy(selectedProduct.params.policy);
    }
  }, [selectedProductId, selectedProduct]);

  useEffect(() => {
    runSimulation();
  }, [runSimulation]);

  const chartData = simulation?.weeks.map(w => ({
    week: `Sem ${w.week}`,
    'Stock Final': w.endingStock,
    'Demanda Proyectada': w.projectedDemand,
    'Mercancía Recibida': w.receipts,
    'Orden Emitida (Q)': w.orderPlaced ? w.orderQuantity : 0,
  })) || [];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-darkbg-900 transition-colors">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 pb-16">
        <Header
          title="Simulador de Inventario a 12 Semanas"
          subtitle="Proyección dinámica de inventario, reposición de pedidos y evaluación de riesgo de quiebre"
        />

        <div className="px-4 sm:px-8 py-6 space-y-8 max-w-7xl mx-auto w-full">
          {/* SIMULATOR CONTROLS BAR */}
          <div className="p-6 rounded-3xl glass-card border border-pink-200/50 dark:border-pink-900/30 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-pink-100 dark:border-pink-900/30">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-pink-500" />
                  <span>Configuración del Escenario de Simulación</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Ajusta la política y las condiciones para observar el comportamiento a 3 meses
                </p>
              </div>

              <button
                onClick={runSimulation}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 shadow-md shadow-pink-500/25 transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Recalcular Simulación</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Product */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Producto a Simular
                </label>
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-pink-200 dark:border-pink-900 bg-white/80 dark:bg-slate-900/80 text-xs font-bold text-slate-800 dark:text-white"
                >
                  <option value="gloss">Gloss Retro Glow (Demanda: 69/sem)</option>
                  <option value="blush">Rubor Star (Demanda: 46/sem)</option>
                  <option value="pestanina">Pestañina Super Look (Demanda: 100/sem)</option>
                </select>
              </div>

              {/* Policy Selector */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Política de Reposición
                </label>
                <select
                  value={policy}
                  onChange={e => setPolicy(e.target.value as InventoryPolicyType)}
                  className="w-full px-3 py-2 rounded-xl border border-pink-200 dark:border-pink-900 bg-white/80 dark:bg-slate-900/80 text-xs font-bold text-slate-800 dark:text-white"
                >
                  <option value="Q_R">Política (Q, R) - Pedido fijo Q al ROP</option>
                  <option value="s_S">Política (s, S) - Pedido hasta nivel S</option>
                </select>
              </div>

              {/* Starting Stock */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Stock Inicial (Semana 1)
                </label>
                <input
                  type="number"
                  min="0"
                  value={initialStock}
                  onChange={e => setInitialStock(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-pink-200 dark:border-pink-900 bg-white/80 dark:bg-slate-900/80 text-xs font-extrabold text-slate-800 dark:text-white"
                />
              </div>

              {/* Volatility Toggle */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Variabilidad de Demanda
                </label>
                <label className="flex items-center gap-2 p-2 rounded-xl border border-pink-200 dark:border-pink-900/50 cursor-pointer bg-white/50 dark:bg-slate-900/50">
                  <input
                    type="checkbox"
                    checked={demandNoise}
                    onChange={e => setDemandNoise(e.target.checked)}
                    className="w-4 h-4 text-pink-600 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Fluctuaciones de mercado (±25%)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* SIMULATION SUMMARY KPI CARDS */}
          {simulation && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 rounded-3xl glass-card border border-pink-200/50 dark:border-pink-900/30">
                <span className="text-[11px] font-bold uppercase text-slate-500">Demanda Total 12 Sem.</span>
                <p className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">
                  {simulation.totalDemand} uds
                </p>
                <p className="text-[10px] text-slate-400">Promedio: ~{Math.round(simulation.totalDemand / 12)} uds/sem</p>
              </div>

              <div className="p-4 rounded-3xl glass-card border border-pink-200/50 dark:border-pink-900/30">
                <span className="text-[11px] font-bold uppercase text-slate-500">Órdenes Emitidas</span>
                <p className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                  {simulation.totalOrders} pedidos
                </p>
                <p className="text-[10px] text-slate-400">Total {simulation.totalUnitsOrdered} uds compradas</p>
              </div>

              <div className="p-4 rounded-3xl glass-card border border-pink-200/50 dark:border-pink-900/30">
                <span className="text-[11px] font-bold uppercase text-slate-500">Stock Promedio en Ciclo</span>
                <p className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">
                  {simulation.averageStock} uds
                </p>
                <p className="text-[10px] text-slate-400">Inventario físico promedio</p>
              </div>

              <div className="p-4 rounded-3xl glass-card border border-pink-200/50 dark:border-pink-900/30">
                <span className="text-[11px] font-bold uppercase text-slate-500">Semanas en Quiebre</span>
                <p className={`text-xl font-extrabold mt-1 ${
                  simulation.stockoutWeeksCount > 0 ? 'text-rose-500' : 'text-emerald-500'
                }`}>
                  {simulation.stockoutWeeksCount} semanas
                </p>
                <p className="text-[10px] text-slate-400">
                  {simulation.stockoutWeeksCount === 0 ? 'Protección 100% exitosa' : 'Peligro de pérdida de ventas'}
                </p>
              </div>

              <div className="p-4 rounded-3xl glass-card border border-pink-200/50 dark:border-pink-900/30">
                <span className="text-[11px] font-bold uppercase text-slate-500">Lead Time Proveedor</span>
                <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                  {selectedProduct?.params.leadTimeWeeks} sem
                </p>
                <p className="text-[10px] text-slate-400">Demora de entrega en cada orden</p>
              </div>
            </div>
          )}

          {/* VISUAL CHART */}
          <div className="p-6 rounded-3xl glass-card border border-pink-200/50 dark:border-pink-900/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-base text-slate-800 dark:text-white">
                  Trayectoria de Stock Proyectado a 12 Semanas
                </h4>
                <p className="text-xs text-slate-500">
                  Curva diente de sierra según política ({policy}) con llegadas de pedidos y umbrales de seguridad
                </p>
              </div>
            </div>

            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(244, 114, 182, 0.15)" vertical={false} />
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} tickLine={false} />
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

                  {/* Límite Stock de Seguridad */}
                  {selectedProduct && (
                    <ReferenceLine
                      y={selectedProduct.calculations.safetyStock}
                      label={{ value: `SS (${selectedProduct.calculations.safetyStock})`, fill: '#f43f5e', fontSize: 10 }}
                      stroke="#f43f5e"
                      strokeDasharray="4 4"
                    />
                  )}

                  {/* Límite Punto de Reorden */}
                  {selectedProduct && (
                    <ReferenceLine
                      y={selectedProduct.calculations.reorderPoint}
                      label={{ value: `ROP (${selectedProduct.calculations.reorderPoint})`, fill: '#f59e0b', fontSize: 10 }}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                    />
                  )}

                  <Bar dataKey="Mercancía Recibida" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.7} />
                  <Line
                    type="monotone"
                    dataKey="Stock Final"
                    stroke="#db2777"
                    strokeWidth={3}
                    dot={{ fill: '#db2777', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Demanda Proyectada"
                    stroke="#a855f7"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* WEEK-BY-WEEK SIMULATION TABLE */}
          <div className="rounded-3xl glass-card border border-pink-200/50 dark:border-pink-900/30 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-pink-100/60 dark:border-pink-900/40">
              <h4 className="font-extrabold text-base text-slate-800 dark:text-white">
                Cronograma Detallado Semana a Semana (1 - 12)
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-pink-50/60 dark:bg-pink-950/30 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-pink-100 dark:border-pink-900/30">
                  <tr>
                    <th className="py-3 px-4">Semana</th>
                    <th className="py-3 px-4 text-center">Stock Inicial</th>
                    <th className="py-3 px-4 text-center">Demanda Estimada</th>
                    <th className="py-3 px-4 text-center">Llegadas Proveedor</th>
                    <th className="py-3 px-4 text-center">Stock Final</th>
                    <th className="py-3 px-4 text-center">¿Se Ordenó?</th>
                    <th className="py-3 px-4 text-center">Cantidad Ordenada</th>
                    <th className="py-3 px-4 text-center">Estado de Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100/50 dark:divide-pink-900/20">
                  {simulation?.weeks.map(row => (
                    <tr
                      key={row.week}
                      className="hover:bg-pink-50/40 dark:hover:bg-pink-950/20 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">
                        Semana #{row.week}
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-slate-600 dark:text-slate-300">
                        {row.beginningStock} uds
                      </td>
                      <td className="py-3.5 px-4 text-center text-purple-600 dark:text-purple-400 font-bold">
                        {row.projectedDemand} uds
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        {row.receipts > 0 ? `+${row.receipts} uds` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-sm text-slate-900 dark:text-white">
                        {row.endingStock} uds
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold">
                        {row.orderPlaced ? (
                          <span className="text-pink-600 dark:text-pink-400">Sí (Disparo ROP)</span>
                        ) : (
                          <span className="text-slate-400">No</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                        {row.orderPlaced ? `${row.orderQuantity} uds` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {row.isStockout ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-900 text-rose-200">
                            Quiebre de Stock
                          </span>
                        ) : row.endingStock <= (selectedProduct?.calculations.safetyStock || 0) ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            Crítico
                          </span>
                        ) : row.endingStock <= (selectedProduct?.calculations.reorderPoint || 0) ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            En Reorden
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
