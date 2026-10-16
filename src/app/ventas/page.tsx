'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BadgeDollarSign,
  ShoppingCart,
  Send,
  AlertTriangle,
  Sparkles,
  Store,
  Instagram,
  Globe,
  Receipt,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useApp } from '@/context/AppContext';
import { Sale } from '@/types';
import { LipstickIcon, BlushIcon, MascaraIcon } from '@/components/CosmeticIcons';

export default function VentasPage() {
  const { products, refreshData, showToast, openQuickOrder } = useApp();
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('gloss');
  const [quantity, setQuantity] = useState<number>(5);
  const [channel, setChannel] = useState<'TIENDA_ONLINE' | 'INSTAGRAM' | 'PUNTO_FISICO'>('TIENDA_ONLINE');
  const [customerName, setCustomerName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  const fetchSales = useCallback(async () => {
    try {
      const res = await fetch('/api/sales');
      const data = await res.json();
      if (data.success) {
        setSales(data.data);
      }
    } catch {
      showToast('Error al cargar ventas', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleRegisterSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (quantity <= 0) {
      showToast('La cantidad vendida debe ser mayor a 0', 'error');
      return;
    }

    if (quantity > selectedProduct.currentStock) {
      showToast(
        `Stock insuficiente. Solo hay ${selectedProduct.currentStock} unidades de ${selectedProduct.name}`,
        'error'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity,
          channel,
          customerName: customerName || 'Cliente Mostrador Beauty',
        }),
      });
      const data = await res.json();
      if (data.success) {
        const sale: Sale = data.data.sale;
        const updatedProduct = data.data.product;
        const newAlert = data.data.newAlert;

        showToast(`Venta ${sale.saleNumber} registrada exitosamente`, 'success');
        setCustomerName('');
        setQuantity(1);

        await Promise.all([refreshData(), fetchSales()]);

        // Si la venta disparó una alarma, sugerimos orden de compra inmediata
        if (newAlert) {
          setTimeout(() => {
            if (
              confirm(
                `⚠️ ¡ALERTA DISPARADA POR ESTA VENTA!\n\nEl stock de ${updatedProduct.name} bajó a ${updatedProduct.currentStock} uds (≤ ROP ${updatedProduct.calculations.reorderPoint} uds).\n\n¿Deseas generar la orden de compra sugerida de ${updatedProduct.calculations.recommendedQ} unidades ahora?`
              )
            ) {
              openQuickOrder(updatedProduct, updatedProduct.calculations.recommendedQ);
            }
          }, 300);
        }
      } else {
        showToast(data.error || 'Error al registrar la venta', 'error');
      }
    } catch {
      showToast('Error de conexión', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getChannelBadge = (ch: string) => {
    switch (ch) {
      case 'TIENDA_ONLINE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
            <Globe className="w-3 h-3" />
            Tienda Online
          </span>
        );
      case 'INSTAGRAM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-500/15 text-pink-700 dark:text-pink-400 border border-pink-500/30">
            <Instagram className="w-3 h-3" />
            Instagram DM
          </span>
        );
      case 'PUNTO_FISICO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30">
            <Store className="w-3 h-3" />
            Punto Físico
          </span>
        );
    }
  };

  const totalSaleAmount = selectedProduct ? quantity * selectedProduct.unitPriceCOP : 0;
  const totalSalesCOP = sales.reduce((sum, s) => sum + s.totalCOP, 0);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-darkbg-900 transition-colors">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 pb-16">
        <Header
          title="Registro de Ventas & Facturación Rápida"
          subtitle="Descargue automático de inventario físico y verificación en tiempo real de alarmas"
        />

        <div className="px-4 sm:px-8 py-6 space-y-8 max-w-7xl mx-auto w-full">
          {/* TOP METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl glass-card border border-pink-200/50 dark:border-pink-900/30">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Transacciones Registradas
              </span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {sales.length} ventas
              </p>
              <p className="text-xs text-pink-600 dark:text-pink-400 font-semibold mt-0.5">
                Canales Online, Instagram y Físico
              </p>
            </div>

            <div className="p-5 rounded-3xl glass-card border border-pink-200/50 dark:border-pink-900/30">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Facturado en Ventas
              </span>
              <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                ${totalSalesCOP.toLocaleString('es-CO')} COP
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Ingresos brutos acumulados
              </p>
            </div>

            <div className="p-5 rounded-3xl glass-card border border-pink-200/50 dark:border-pink-900/30">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ticket Promedio
              </span>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                ${sales.length > 0 ? Math.round(totalSalesCOP / sales.length).toLocaleString('es-CO') : 0} COP
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Por comprobante de despacho
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* FORMULARIO DE REGISTRO DE VENTA (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-3xl glass-card border border-pink-200/50 dark:border-pink-900/30 shadow-xl space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-pink-500" />
                  <span>Nueva Venta / Despacho</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Al vender, el stock baja en tiempo real y el sistema verifica si toca reordenar
                </p>
              </div>

              <form onSubmit={handleRegisterSale} className="space-y-4">
                {/* Product Selection Radio Cards */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Seleccionar Producto (Catálogo 3 SKU)
                  </label>
                  <div className="space-y-2">
                    {products.map(p => {
                      const isSelected = selectedProductId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedProductId(p.id)}
                          className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                            isSelected
                              ? 'border-pink-500 bg-pink-50/70 dark:bg-pink-950/40 ring-1 ring-pink-500'
                              : 'border-pink-200/60 dark:border-pink-900/30 hover:bg-white/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-pink-100 shrink-0">
                              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800 dark:text-white">
                                {p.name}
                              </p>
                              <p className="text-[11px] text-pink-600 dark:text-pink-400 font-semibold">
                                ${p.unitPriceCOP.toLocaleString('es-CO')} COP • Stock: {p.currentStock} uds
                              </p>
                            </div>
                          </div>
                          <span
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-pink-500 bg-pink-500' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Cantidad a Vender (Unidades)
                    </label>
                    {selectedProduct && (
                      <span className="text-xs text-slate-500">
                        Disponible: <strong>{selectedProduct.currentStock} uds</strong>
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct?.currentStock || 1}
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 rounded-xl border border-pink-200 dark:border-pink-900 bg-white/80 dark:bg-slate-900/80 text-sm font-extrabold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                {/* Sales Channel */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Canal de Venta
                  </label>
                  <select
                    value={channel}
                    onChange={e => setChannel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 dark:border-pink-900 bg-white/80 dark:bg-slate-900/80 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="TIENDA_ONLINE">Tienda Online Oficial (Web)</option>
                    <option value="INSTAGRAM">Instagram / WhatsApp Ventas</option>
                    <option value="PUNTO_FISICO">Punto Físico / Showroom</option>
                  </select>
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Nombre del Cliente / Destinatario
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Sofía Morales"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 dark:border-pink-900 bg-white/80 dark:bg-slate-900/80 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                {/* Total Preview */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-transparent border border-pink-200/60 dark:border-pink-900/40 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-500">Total a Cobrar:</span>
                    <p className="text-xl font-extrabold text-pink-600 dark:text-pink-400">
                      ${totalSaleAmount.toLocaleString('es-CO')} COP
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-slate-500">
                    {quantity} x ${(selectedProduct?.unitPriceCOP || 0).toLocaleString('es-CO')}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedProduct || selectedProduct.currentStock <= 0}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 hover:opacity-95 shadow-lg shadow-pink-500/30 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Procesando Venta...' : 'Completar y Descargar Stock'}</span>
                </button>
              </form>
            </div>

            {/* TABLA DE VENTAS RECIENTES (7 cols) */}
            <div className="lg:col-span-7 rounded-3xl glass-card border border-pink-200/50 dark:border-pink-900/30 shadow-xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-pink-100/60 dark:border-pink-900/40 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-base text-slate-800 dark:text-white">
                    Historial de Ventas Despachadas
                  </h4>
                  <p className="text-xs text-slate-500">
                    Registro de comprobantes con impacto directo en inventario
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-pink-50/60 dark:bg-pink-950/30 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-pink-100 dark:border-pink-900/30">
                    <tr>
                      <th className="py-3 px-4">Nº Venta</th>
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Producto</th>
                      <th className="py-3 px-4 text-center">Cant.</th>
                      <th className="py-3 px-4">Canal</th>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4 text-right">Total COP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-100/50 dark:divide-pink-900/20">
                    {sales.map(sale => (
                      <tr
                        key={sale.id}
                        className="hover:bg-pink-50/40 dark:hover:bg-pink-950/20 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-100">
                          {sale.saleNumber}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {new Date(sale.createdAt).toLocaleDateString('es-CO')}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-white">
                          {sale.productName}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-white">
                          {sale.quantity} uds
                        </td>
                        <td className="py-3.5 px-4">{getChannelBadge(sale.channel)}</td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
                          {sale.customerName}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-pink-600 dark:text-pink-400">
                          ${sale.totalCOP.toLocaleString('es-CO')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
