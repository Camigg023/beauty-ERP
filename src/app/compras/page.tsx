'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart,
  PlusCircle,
  CheckCircle2,
  Clock,
  Truck,
  Building,
  PackageCheck,
  AlertTriangle,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useApp } from '@/context/AppContext';
import { PurchaseOrder } from '@/types';

export default function ComprasPage() {
  const { products, refreshData, showToast, openQuickOrder } = useApp();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [receivingId, setReceivingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/purchases');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch {
      showToast('Error al cargar órdenes de compra', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleReceiveOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`¿Confirmar recepción física de la orden ${orderNumber}? El inventario aumentará automáticamente.`)) {
      return;
    }

    setReceivingId(orderId);
    try {
      const res = await fetch('/api/purchases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`¡Mercancía recibida! Stock de ${data.data.product.name} actualizado (+${data.data.order.quantity} uds)`, 'success');
        await Promise.all([refreshData(), fetchOrders()]);
      } else {
        showToast(data.error || 'Error al procesar recepción', 'error');
      }
    } catch {
      showToast('Error al conectar con el servidor', 'error');
    } finally {
      setReceivingId(null);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    return true;
  });

  const pendingOrders = orders.filter(o => o.status === 'PENDIENTE');
  const totalPendingUnits = pendingOrders.reduce((sum, o) => sum + o.quantity, 0);
  const totalPendingCost = pendingOrders.reduce((sum, o) => sum + o.totalCostCOP, 0);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-darkbg-900 transition-colors">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 pb-16">
        <Header
          title="Módulo de Compras & Reabastecimiento"
          subtitle="Emisión y recepción física de mercancía para reposición de stock"
        />

        <div className="px-4 sm:px-8 py-6 space-y-8 max-w-7xl mx-auto w-full">
          {/* STATS HEADER */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl glass-card border border-pink-200/50 dark:border-pink-900/30">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Órdenes Pendientes de Recepción
              </span>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {pendingOrders.length} órdenes
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {totalPendingUnits} unidades en tránsito del proveedor
              </p>
            </div>

            <div className="p-5 rounded-3xl glass-card border border-pink-200/50 dark:border-pink-900/30">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Compromiso Financiero en Tránsito
              </span>
              <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                ${totalPendingCost.toLocaleString('es-CO')} COP
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Costo total pactado con proveedores
              </p>
            </div>

            <div className="p-5 rounded-3xl glass-card border border-pink-200/50 dark:border-pink-900/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Emitir Nueva Orden
                </span>
                <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                  Reabastecer según EOQ (Q)
                </p>
              </div>
              <button
                onClick={() => {
                  if (products.length > 0) openQuickOrder(products[0]);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 shadow-md shadow-pink-500/25 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Nueva O.C.</span>
              </button>
            </div>
          </div>

          {/* FILTER & ORDERS LIST */}
          <div className="rounded-3xl glass-card border border-pink-200/50 dark:border-pink-900/30 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-pink-100/60 dark:border-pink-900/40 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-pink-500" />
                  <span>Historial de Órdenes de Compra (O.C.)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Haz clic en &quot;Recibir Mercancía&quot; cuando el pedido llegue a bodega para sumar al inventario
                </p>
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1 bg-pink-50/60 dark:bg-pink-950/40 p-1 rounded-2xl border border-pink-100 dark:border-pink-900/30 text-xs">
                {(['all', 'PENDIENTE', 'RECIBIDA'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilterStatus(tab)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      filterStatus === tab
                        ? 'bg-pink-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-pink-600'
                    }`}
                  >
                    {tab === 'all' && 'Todas'}
                    {tab === 'PENDIENTE' && 'Pendientes'}
                    {tab === 'RECIBIDA' && 'Recibidas'}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-pink-50/60 dark:bg-pink-950/30 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-pink-100 dark:border-pink-900/30">
                  <tr>
                    <th className="py-3 px-4">Nº Orden</th>
                    <th className="py-3 px-4">Fecha Emisión</th>
                    <th className="py-3 px-4">Producto Solicitado</th>
                    <th className="py-3 px-4 text-center">Cantidad (Q)</th>
                    <th className="py-3 px-4">Proveedor</th>
                    <th className="py-3 px-4 text-right">Costo Total COP</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100/50 dark:divide-pink-900/20">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No se encontraron órdenes de compra en esta vista
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => (
                      <tr
                        key={order.id}
                        className="hover:bg-pink-50/40 dark:hover:bg-pink-950/20 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-pink-600 dark:text-pink-400">
                          {order.orderNumber}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString('es-CO')}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">
                          {order.productName}
                        </td>
                        <td className="py-3.5 px-4 text-center font-extrabold text-sm text-slate-800 dark:text-white">
                          {order.quantity} uds
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {order.supplier}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                          ${order.totalCostCOP.toLocaleString('es-CO')} COP
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {order.status === 'RECIBIDA' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              Recibida
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                              <Clock className="w-3 h-3" />
                              En Tránsito
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {order.status === 'PENDIENTE' ? (
                            <button
                              onClick={() => handleReceiveOrder(order.id, order.orderNumber)}
                              disabled={receivingId === order.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-50"
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              <span>{receivingId === order.id ? 'Recibiendo...' : 'Recibir Mercancía'}</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              Recibido el {new Date(order.receivedAt || order.createdAt).toLocaleDateString('es-CO')}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
