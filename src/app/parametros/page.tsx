'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Save,
  RotateCcw,
  Sparkles,
  Calculator,
  ShieldAlert,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useApp } from '@/context/AppContext';
import { InventoryPolicyType, Product, ProductInventoryParams } from '@/types';
import { computeProductCalculations } from '@/lib/calculations';
import { LipstickIcon, BlushIcon, MascaraIcon } from '@/components/CosmeticIcons';

export default function ParametrosPage() {
  const { products, refreshData, showToast } = useApp();
  const [selectedProductId, setSelectedProductId] = useState<string>('gloss');
  const [isSaving, setIsSaving] = useState(false);

  // Estado local para edición interactiva inmediata
  const [formData, setFormData] = useState<ProductInventoryParams>({
    annualDemand: 3600,
    leadTimeWeeks: 2,
    orderCostS: 45000,
    holdingCostH: 1200,
    serviceLevel: 0.95,
    demandStdDevWeekly: 14,
    policy: 'Q_R',
    manualQOverride: null,
  });

  const [useManualQ, setUseManualQ] = useState(false);
  const [manualQValue, setManualQValue] = useState<number>(300);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  useEffect(() => {
    if (selectedProduct) {
      setFormData(selectedProduct.params);
      if (selectedProduct.params.manualQOverride && selectedProduct.params.manualQOverride > 0) {
        setUseManualQ(true);
        setManualQValue(selectedProduct.params.manualQOverride);
      } else {
        setUseManualQ(false);
        setManualQValue(selectedProduct.calculations.eoq);
      }
    }
  }, [selectedProductId, selectedProduct]);

  // Recálculo dinámico INMEDIATO mientras el usuario escribe en pantalla
  const activeParams: ProductInventoryParams = {
    ...formData,
    manualQOverride: useManualQ ? manualQValue : null,
  };

  const previewCalculations = selectedProduct
    ? computeProductCalculations(activeParams, selectedProduct.currentStock, selectedProduct.reservedStock)
    : null;

  const handleFieldChange = (field: keyof ProductInventoryParams, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          params: activeParams,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          `Parámetros de ${selectedProduct.name} actualizados y recalculados con éxito`,
          'success'
        );
        await refreshData();
      } else {
        showToast(data.error || 'Error al guardar parámetros', 'error');
      }
    } catch {
      showToast('Error de comunicación con el servidor', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-darkbg-900 transition-colors">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 pb-16">
        <Header
          title="Parámetros & Políticas de Inventario"
          subtitle="Configuración matemática de EOQ, Punto de Reorden (ROP), Stock de Seguridad y Lead Time"
        />

        <div className="px-4 sm:px-8 py-6 space-y-8 max-w-7xl mx-auto w-full">
          {/* PRODUCT SELECTOR TABS */}
          <div className="flex flex-wrap items-center gap-3 p-1.5 rounded-3xl glass-card border border-pink-200/50 dark:border-pink-900/30">
            {products.map(p => {
              const isSelected = selectedProductId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  className={`flex-1 min-w-[200px] flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/25 scale-[1.01]'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-pink-950/40'
                  }`}
                >
                  {p.id === 'gloss' && <LipstickIcon className="w-4 h-4" />}
                  {p.id === 'blush' && <BlushIcon className="w-4 h-4" />}
                  {p.id === 'pestanina' && <MascaraIcon className="w-4 h-4" />}
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* COLUMNA IZQUIERDA: INPUTS DE PARÁMETROS (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-3xl glass-card border border-pink-200/50 dark:border-pink-900/30 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-pink-100 dark:border-pink-900/40">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-pink-500" />
                    <span>Variables de Control del Inventario</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Edita los parámetros; los cálculos de la derecha se actualizan en vivo
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300">
                  Ref: {selectedProduct?.trendyInfo.referenceCode}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* D = Demanda Anual */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    D = Demanda Anual (unidades)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.annualDemand}
                    onChange={e => handleFieldChange('annualDemand', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 dark:border-pink-900 bg-white/80 dark:bg-slate-900/80 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                  <p className="text-[10px] text-slate-500">
                    Equivalente semanal: ~{Math.round(formData.annualDemand / 52)} uds | diario: ~{(formData.annualDemand / 365).toFixed(1)} uds
                  </p>
                </div>

                {/* W = Lead Time (Semanas) */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    W = Lead Time Proveedor (semanas)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.leadTimeWeeks}
                    onChange={e => handleFieldChange('leadTimeWeeks', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 dark:border-pink-900 bg-white/80 dark:bg-slate-900/80 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                  <p className="text-[10px] text-slate-500">
                    Tiempo que tarda Trendy en entregar (~{Math.round(formData.leadTimeWeeks * 7)} días)
                  </p>
                </div>

                {/* S = Costo por Pedido COP */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    S = Costo por Pedir (COP/orden)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={formData.orderCostS}
                    onChange={e => handleFieldChange('orderCostS', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 dark:border-pink-900 bg-white/80 dark:bg-slate-900/80 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                  <p className="text-[10px] text-slate-500">
                    Flete, logística, trámite administrativo de compra
                  </p>
                </div>

                {/* H = Costo de Mantener COP */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    H = Costo Mantener (COP/ud/año)
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="50"
                    value={formData.holdingCostH}
                    onChange={e => handleFieldChange('holdingCostH', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 dark:border-pink-900 bg-white/80 dark:bg-slate-900/80 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                  <p className="text-[10px] text-slate-500">
                    Almacenamiento, merma, capital inmovilizado
                  </p>
                </div>

                {/* σ = Desviación Estándar Semanal */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    σ = Desviación Demanda (uds/sem)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.demandStdDevWeekly}
                    onChange={e => handleFieldChange('demandStdDevWeekly', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 dark:border-pink-900 bg-white/80 dark:bg-slate-900/80 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                  <p className="text-[10px] text-slate-500">
                    Volatilidad de ventas semanales del producto
                  </p>
                </div>

                {/* Nivel de Servicio (Z) */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    Nivel de Servicio Deseado
                  </label>
                  <select
                    value={formData.serviceLevel}
                    onChange={e => handleFieldChange('serviceLevel', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 dark:border-pink-900 bg-white/80 dark:bg-slate-900/80 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="0.90">90% de disponibilidad (Z = 1.282)</option>
                    <option value="0.95">95% de disponibilidad (Z = 1.645 - Defecto)</option>
                    <option value="0.98">98% de disponibilidad (Z = 2.054)</option>
                    <option value="0.99">99% de disponibilidad (Z = 2.326 - Premium)</option>
                  </select>
                  <p className="text-[10px] text-slate-500">
                    Probabilidad de no sufrir quiebre durante el lead time
                  </p>
                </div>
              </div>

              {/* POLÍTICA DE INVENTARIO: (Q, R) vs (s, S) */}
              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 space-y-3">
                <label className="block text-xs font-bold uppercase text-purple-900 dark:text-purple-300">
                  Política de Inventario Seleccionada
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                      formData.policy === 'Q_R'
                        ? 'border-pink-500 bg-white dark:bg-slate-900 ring-1 ring-pink-500'
                        : 'border-purple-200/60 hover:bg-white/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="policy"
                      value="Q_R"
                      checked={formData.policy === 'Q_R'}
                      onChange={() => handleFieldChange('policy', 'Q_R')}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-white">
                        Política (Q, R) [Por Defecto]
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        Se pide una cantidad fija <strong>Q</strong> cada vez que el inventario cae al punto de reorden <strong>R</strong>.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                      formData.policy === 's_S'
                        ? 'border-pink-500 bg-white dark:bg-slate-900 ring-1 ring-pink-500'
                        : 'border-purple-200/60 hover:bg-white/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="policy"
                      value="s_S"
                      checked={formData.policy === 's_S'}
                      onChange={() => handleFieldChange('policy', 's_S')}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-white">
                        Política (s, S) [Alternativa]
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        Cuando el stock baja de <strong>s</strong>, se ordena hasta completar el nivel objetivo <strong>S</strong>.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* SOBREESCRITURA MANUAL DE Q */}
              <div className="p-4 rounded-2xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-200/60 dark:border-pink-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={useManualQ}
                      onChange={e => setUseManualQ(e.target.checked)}
                      className="w-4 h-4 text-pink-600 rounded"
                    />
                    <span>Sobrescribir manualmente la cantidad de pedido (Q)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    EOQ Calculado: {previewCalculations?.eoq} uds
                  </span>
                </div>

                {useManualQ && (
                  <div className="pt-2 flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      value={manualQValue}
                      onChange={e => setManualQValue(Number(e.target.value))}
                      className="w-36 px-3 py-2 rounded-xl border border-pink-300 dark:border-pink-800 bg-white dark:bg-slate-900 text-sm font-bold text-pink-600 focus:outline-none"
                    />
                    <span className="text-xs text-slate-500">
                      Unidades fijas por lote de compra (reemplaza EOQ)
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 hover:opacity-95 shadow-lg shadow-pink-500/25 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Guardando...' : 'Guardar y Aplicar a Inventario'}</span>
                </button>
              </div>
            </div>

            {/* COLUMNA DERECHA: PREVIEW DE CÁLCULOS EN VIVO (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-3xl glass-card border border-pink-200/50 dark:border-pink-900/30 shadow-xl space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-pink-900/40">
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-purple-500" />
                    <span>Recálculo Inmediato (En Vivo)</span>
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200">
                    Tiempo Real
                  </span>
                </div>

                {previewCalculations && (
                  <div className="space-y-4 pt-4">
                    {/* EOQ Card */}
                    <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-pink-100 dark:border-pink-900/30 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-500">
                          EOQ = √(2·D·S / H)
                        </span>
                        <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                          {previewCalculations.eoq} uds
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Lote económico óptimo sin manual override
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400">Q Efectivo:</span>
                        <p className="text-lg font-black text-purple-600 dark:text-purple-400">
                          {previewCalculations.recommendedQ} uds
                        </p>
                      </div>
                    </div>

                    {/* ROP Card */}
                    <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-pink-100 dark:border-pink-900/30 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                          Punto de Reorden (ROP)
                        </span>
                        <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                          {previewCalculations.reorderPoint} uds
                        </p>
                        <p className="text-[10px] text-slate-400">
                          ROP = (d_w × W) + SS = {Math.round(previewCalculations.weeklyDemand * formData.leadTimeWeeks)} + {previewCalculations.safetyStock}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400">Stock Actual:</span>
                        <p className="text-base font-bold text-slate-800 dark:text-white">
                          {selectedProduct?.currentStock} uds
                        </p>
                      </div>
                    </div>

                    {/* Stock de Seguridad (SS) Card */}
                    <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-pink-100 dark:border-pink-900/30 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                          Stock de Seguridad (SS)
                        </span>
                        <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
                          {previewCalculations.safetyStock} uds
                        </p>
                        <p className="text-[10px] text-slate-400">
                          SS = Z ({previewCalculations.zScore}) × σ ({formData.demandStdDevWeekly}) × √W ({Math.sqrt(formData.leadTimeWeeks).toFixed(2)})
                        </p>
                      </div>
                    </div>

                    {/* Cobertura en Días */}
                    <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-pink-100 dark:border-pink-900/30 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          Cobertura Estimada
                        </span>
                        <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                          {previewCalculations.coverageDays} días
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Stock Actual / Demanda Diaria ({previewCalculations.dailyDemand} uds/día)
                        </p>
                      </div>
                    </div>

                    {/* Estado de Alarma Resultante */}
                    <div className="p-4 rounded-2xl bg-pink-50/70 dark:bg-pink-950/40 border border-pink-200/60 dark:border-pink-900/40">
                      <span className="text-xs font-bold text-slate-500">
                        Estado y Semáforo Resultante:
                      </span>
                      <p className="font-extrabold text-sm text-pink-600 dark:text-pink-400 mt-1">
                        {previewCalculations.statusLabel}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Formula Documentation Footer */}
              <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  Fórmulas oficiales aplicadas:
                </p>
                <p>• ROP = (D/52 · W) + Z · σ · √W</p>
                <p>• EOQ = √(2 · D · S / H)</p>
                <p>• Cobertura = Stock / (D/365)</p>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
