'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  PlusCircle,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  Clock,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useApp } from '@/context/AppContext';
import { KardexEntry, MovementType } from '@/types';
import { LipstickIcon, BlushIcon, MascaraIcon } from '@/components/CosmeticIcons';

export default function InventarioPage() {
  const { products, refreshData, showToast } = useApp();
  const [kardex, setKardex] = useState<KardexEntry[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isAdjustmentModalOpen, setAdjustmentModalOpen] = useState(false);

  // Formulario de ajuste
  const [adjustProductId, setAdjustProductId] = useState<string>('gloss');
  const [adjustNewStock, setAdjustNewStock] = useState<number>(200);
  const [adjustReason, setAdjustReason] = useState<string>('Auditoría física semanal de bodega');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchKardex = useCallback(async () => {
    try {
      const url = selectedProduct === 'all' ? '/api/inventory' : `/api/inventory?productId=${selectedProduct}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setKardex(data.data);
      }
    } catch {
      showToast('Error al cargar movimientos de Kardex', 'error');
    }
  }, [selectedProduct, showToast]);

  useEffect(() => {
    fetchKardex();
  }, [fetchKardex]);

  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: adjustProductId,
          newStock: adjustNewStock,
          reason: adjustReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Ajuste de inventario aplicado al Kardex', 'success');
        setAdjustmentModalOpen(false);
        await Promise.all([refreshData(), fetchKardex()]);
      } else {
        showToast(data.error || 'Error al guardar el ajuste', 'error');
      }
    } catch {
      showToast('Error de conexión', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredKardex = kardex.filter(entry => {
    if (selectedType !== 'all' && entry.type !== selectedType) return false;
    return true;
  });

  const getMovementBadge = (type: MovementType) => {
    switch (type) {
      case 'ENTRADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            Entrada / Compra
          </span>
        );
      case 'SALIDA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Salida / Venta
          </span>
        );
      case 'AJUSTE_POSITIVO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30">
            <PlusCircle className="w-3.5 h-3.5" />
            Ajuste (+)
          </span>
        );
      case 'AJUSTE_NEGATIVO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Ajuste (-)
          </span>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-darkbg-900 transition-colors">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 pb-16">
        <Header
          title="Inventario & Kardex Valorizado"
          subtitle="Trazabilidad cronológica de entradas, salidas y ajustes por producto"
        />

        <div className="px-4 sm:px-8 py-6 space-y-8 max-w-7xl mx-auto w-full">
          {/* HEADER SUMMARY CARDS (LOS 3 PRODUCTOS) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map(p => (
              <div
                key={p.id}
                onClick={() => setSelectedProduct(p.id)}
                className={`p-5 rounded-3xl glass-card cursor-pointer border transition-all ${
                  selectedProduct === p.id
                    ? 'border-pink-500 ring-2 ring-pink-500/20 shadow-glow-pink scale-[1.01]'
                    : 'border-pink-200/50 dark:border-pink-900/30 hover:border-pink-400'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {p.id === 'gloss' && <LipstickIcon className="w-4 h-4 text-pink-500" />}
                    {p.id === 'blush' && <BlushIcon className="w-4 h-4 text-fuchsia-500" />}
                    {p.id === 'pestanina' && <MascaraIcon className="w-4 h-4 text-purple-500" />}
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {p.name.split(' ')[0]}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-pink-600 dark:text-pink-400">
                    Ref: {p.trendyInfo.referenceCode}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-2xl font-extrabold text-slate-800 dark:text-white">
                      {p.currentStock} uds
                    </p>
                    <p className="text-xs text-slate-500">
                      ROP: {p.calculations.reorderPoint} • SS: {p.calculations.safetyStock}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      ${(p.currentStock * p.unitCostCOP).toLocaleString('es-CO')}
                    </p>
                    <p className="text-[10px] text-slate-400">Valor en bodega</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FILTERS & ACTION BAR */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Product Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedProduct}
                  onChange={e => setSelectedProduct(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-white/80 dark:bg-slate-900/80 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="all">Todos los productos (3 SKU)</option>
                  <option value="gloss">Gloss Retro Glow</option>
                  <option value="blush">Rubor Star</option>
                  <option value="pestanina">Pestañina Super Look</option>
                </select>
              </div>

              {/* Movement Type Filter */}
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="px-3 py-2 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-white/80 dark:bg-slate-900/80 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">Todos los movimientos</option>
                <option value="ENTRADA">Entradas (Recepción)</option>
                <option value="SALIDA">Salidas (Ventas)</option>
                <option value="AJUSTE_POSITIVO">Ajuste Positivo (+)</option>
                <option value="AJUSTE_NEGATIVO">Ajuste Negativo (-)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAdjustmentModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 shadow-md shadow-pink-500/25 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Registrar Ajuste Manual</span>
              </button>
            </div>
          </div>

          {/* KARDEX TABLE */}
          <div className="rounded-3xl glass-card overflow-hidden border border-pink-200/50 dark:border-pink-900/30 shadow-xl">
            <div className="p-5 border-b border-pink-100/60 dark:border-pink-900/40 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-pink-500" />
                  <span>Libro Mayor de Kardex (Movimientos Físicos)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Mostrando {filteredKardex.length} registros ordenados cronológicamente
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-pink-50/60 dark:bg-pink-950/30 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-pink-100 dark:border-pink-900/30">
                  <tr>
                    <th className="py-3 px-4">Fecha y Hora</th>
                    <th className="py-3 px-4">Producto</th>
                    <th className="py-3 px-4">Tipo Movimiento</th>
                    <th className="py-3 px-4">Doc / Referencia</th>
                    <th className="py-3 px-4 text-center">Cant. Movimiento</th>
                    <th className="py-3 px-4 text-center">Saldo Anterior</th>
                    <th className="py-3 px-4 text-center">Nuevo Saldo</th>
                    <th className="py-3 px-4">Observaciones / Responsable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100/50 dark:divide-pink-900/20">
                  {filteredKardex.map(row => (
                    <tr
                      key={row.id}
                      className="hover:bg-pink-50/40 dark:hover:bg-pink-950/20 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {new Date(row.date).toLocaleString('es-CO')}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">
                        {row.productName}
                      </td>
                      <td className="py-3.5 px-4">{getMovementBadge(row.type)}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {row.reference}
                      </td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-sm">
                        <span
                          className={
                            row.type === 'ENTRADA' || row.type === 'AJUSTE_POSITIVO'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }
                        >
                          {row.type === 'ENTRADA' || row.type === 'AJUSTE_POSITIVO' ? '+' : '-'}
                          {row.quantity} uds
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500">
                        {row.previousStock} uds
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-white">
                        {row.newStock} uds
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        <span>{row.notes}</span>
                        <span className="block text-[10px] text-slate-400">Por: {row.userId}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL DE AJUSTE MANUAL */}
      {isAdjustmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl glass-modal shadow-2xl p-6 border border-pink-200/60 dark:border-pink-900/40 space-y-4">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-pink-500" />
              <span>Registrar Ajuste Manual de Inventario</span>
            </h3>
            <p className="text-xs text-slate-500">
              Se registrará un movimiento de corrección en el Kardex y se actualizará el stock disponible.
            </p>

            <form onSubmit={handleCreateAdjustment} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Producto a Corregir
                </label>
                <select
                  value={adjustProductId}
                  onChange={e => {
                    setAdjustProductId(e.target.value);
                    const prod = products.find(p => p.id === e.target.value);
                    if (prod) setAdjustNewStock(prod.currentStock);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-pink-200 dark:border-pink-900 bg-white/80 dark:bg-slate-900/80 text-xs font-bold text-slate-800 dark:text-white"
                >
                  <option value="gloss">Gloss Labial Retro Glow</option>
                  <option value="blush">Rubor En Crema Star</option>
                  <option value="pestanina">Pestañina Super Look</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Nuevo Stock Físico Real (Unidades)
                </label>
                <input
                  type="number"
                  min="0"
                  value={adjustNewStock}
                  onChange={e => setAdjustNewStock(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-pink-200 dark:border-pink-900 bg-white/80 dark:bg-slate-900/80 text-sm font-extrabold text-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Motivo de la corrección
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-pink-200 dark:border-pink-900 bg-white/80 dark:bg-slate-900/80 text-xs text-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustmentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 shadow-md shadow-pink-500/20"
                >
                  {isSubmitting ? 'Guardando...' : 'Aplicar Ajuste'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
