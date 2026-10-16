'use client';

import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Truck, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function QuickOrderModal() {
  const { quickOrderModal, closeQuickOrder, refreshData, showToast } = useApp();
  const { isOpen, product, quantity: initialQuantity } = quickOrderModal;

  const [quantity, setQuantity] = useState<number>(initialQuantity || 100);
  const [supplier, setSupplier] = useState<string>('Beauty Cosméticos Colombia SAS');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialQuantity) {
      setQuantity(initialQuantity);
    }
  }, [initialQuantity]);

  if (!isOpen || !product) return null;

  const unitCost = product.unitCostCOP;
  const totalCost = quantity * unitCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      showToast('La cantidad debe ser mayor a 0', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          supplier,
          notes: notes || `Reabastecimiento automático política ${product.params.policy}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Orden ${data.data.orderNumber} creada con éxito (${quantity} uds)`, 'success');
        await refreshData();
        closeQuickOrder();
      } else {
        showToast(data.error || 'Error al emitir orden de compra', 'error');
      }
    } catch {
      showToast('Error de conexión al emitir la orden', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl glass-modal shadow-2xl overflow-hidden border border-pink-200/50 dark:border-pink-900/40">
        {/* Header */}
        <div className="p-6 border-b border-pink-100/60 dark:border-pink-900/40 flex items-center justify-between bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">
                Generar Orden de Compra
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sugerencia automática de reabastecimiento (Q = {product.calculations.recommendedQ})
              </p>
            </div>
          </div>
          <button
            onClick={closeQuickOrder}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-pink-100/50 dark:hover:bg-pink-950/40 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product Info Card */}
          <div className="p-3.5 rounded-2xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/30 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-pink-100 shrink-0">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                {product.name}
              </h4>
              <p className="text-xs text-pink-600 dark:text-pink-400 font-semibold">
                Ref: {product.trendyInfo.referenceCode} • Stock actual: {product.currentStock} uds
              </p>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Cantidad de Pedido (Unidades Q)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-pink-200 dark:border-pink-900 bg-white/80 dark:bg-slate-900/80 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
              <button
                type="button"
                onClick={() => setQuantity(product.calculations.recommendedQ)}
                className="absolute right-2 top-2 px-2.5 py-1 text-xs font-bold bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 rounded-lg hover:bg-pink-200 transition-all"
              >
                Recom. EOQ ({product.calculations.recommendedQ})
              </button>
            </div>
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Proveedor Autorizado
            </label>
            <div className="relative">
              <Truck className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 dark:border-pink-900 bg-white/80 dark:bg-slate-900/80 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Notas u Observaciones
            </label>
            <input
              type="text"
              placeholder="Ej. Prioridad alta por campaña Beauty de fin de mes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-pink-200 dark:border-pink-900 bg-white/80 dark:bg-slate-900/80 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Valuation summary */}
          <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 flex justify-between items-center text-xs">
            <div>
              <p className="text-slate-500 dark:text-slate-400">Costo unitario estimado:</p>
              <p className="font-bold text-slate-800 dark:text-slate-100">
                ${unitCost.toLocaleString('es-CO')} COP
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 dark:text-slate-400">Total de la Orden:</p>
              <p className="font-extrabold text-base text-purple-700 dark:text-purple-300">
                ${totalCost.toLocaleString('es-CO')} COP
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={closeQuickOrder}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 hover:opacity-95 shadow-lg shadow-pink-500/25 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Generando...' : 'Emitir Orden de Compra'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
