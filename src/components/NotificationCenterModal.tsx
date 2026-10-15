'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, AlertOctagon, CheckCircle2, ShoppingCart, Clock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { NotificationAlert } from '@/types';

export function NotificationCenterModal() {
  const {
    isNotificationModalOpen,
    setNotificationModalOpen,
    notifications,
    products,
    openQuickOrder,
    refreshData,
    showToast,
  } = useApp();

  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ACTIVE');

  if (!isNotificationModalOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'ACTIVE') return !n.resolved;
    if (filter === 'RESOLVED') return n.resolved;
    return true;
  });

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Alerta marcada como resuelta', 'info');
        await refreshData();
      }
    } catch {
      showToast('Error al actualizar alerta', 'error');
    }
  };

  const handleCreateOrderForAlert = (alert: NotificationAlert) => {
    const product = products.find(p => p.id === alert.productId);
    if (product) {
      setNotificationModalOpen(false);
      openQuickOrder(product, alert.suggestedQ);
    } else {
      showToast('Producto no encontrado en inventario', 'error');
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'STOCKOUT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-rose-950 text-rose-300 border border-rose-700 animate-pulse">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            QUIEBRE DE STOCK (0 UDS)
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            STOCK CRÍTICO (≤ SEGURIDAD)
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            REORDEN NECESARIO (≤ ROP)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            NORMAL
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl glass-modal shadow-2xl overflow-hidden border border-pink-200/50 dark:border-pink-900/40">
        {/* Header */}
        <div className="p-6 border-b border-pink-100/60 dark:border-pink-900/40 flex items-center justify-between bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">
                Centro de Notificaciones & Alarmas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monitoreo continuo de políticas de inventario (Q, R)
              </p>
            </div>
          </div>
          <button
            onClick={() => setNotificationModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-pink-100/50 dark:hover:bg-pink-950/40 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 py-3 border-b border-pink-100/40 dark:border-pink-900/30 flex items-center gap-2 bg-pink-50/40 dark:bg-pink-950/20">
          {(['ACTIVE', 'ALL', 'RESOLVED'] as const).map(tabKey => (
            <button
              key={tabKey}
              onClick={() => setFilter(tabKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === tabKey
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-pink-100/60 dark:hover:bg-pink-900/40'
              }`}
            >
              {tabKey === 'ACTIVE' && 'Activas'}
              {tabKey === 'ALL' && 'Historial Completo'}
              {tabKey === 'RESOLVED' && 'Resueltas'}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto opacity-70" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                No hay alertas {filter === 'ACTIVE' ? 'activas pendientes' : 'en este filtro'}
              </p>
              <p className="text-xs text-slate-500">
                Los niveles de inventario de Gloss, Blush y Pestañina se encuentran supervisados.
              </p>
            </div>
          ) : (
            filteredNotifications.map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all ${
                  alert.resolved
                    ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-70'
                    : alert.severity === 'STOCKOUT'
                    ? 'bg-rose-950/20 border-rose-600/50 shadow-sm'
                    : alert.severity === 'CRITICAL'
                    ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300/60 dark:border-rose-900/50'
                    : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300/60 dark:border-amber-900/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(alert.severity)}
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(alert.createdAt).toLocaleString('es-CO')}
                    </span>
                  </div>
                  {alert.resolved ? (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                      Resuelta
                    </span>
                  ) : (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline decoration-pink-400"
                    >
                      Marcar resuelta
                    </button>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                  {alert.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                  {alert.message}
                </p>

                {/* Quantitative summary and action */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-pink-100/50 dark:border-pink-900/30 bg-white/40 dark:bg-slate-900/40 p-2.5 rounded-xl">
                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-slate-400">Stock Actual:</span>{' '}
                      <strong className="text-slate-800 dark:text-slate-100">{alert.currentStock} uds</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">ROP:</span>{' '}
                      <strong className="text-amber-600 dark:text-amber-400">{alert.reorderPoint} uds</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Sugerido (Q):</span>{' '}
                      <strong className="text-purple-600 dark:text-purple-400">{alert.suggestedQ} uds</strong>
                    </div>
                  </div>

                  {!alert.resolved && (
                    <button
                      onClick={() => handleCreateOrderForAlert(alert)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-md shadow-pink-500/20 hover:scale-[1.02] transition-all"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Generar orden de compra ({alert.suggestedQ} uds)</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
