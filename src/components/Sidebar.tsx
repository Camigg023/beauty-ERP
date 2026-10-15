'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BadgeDollarSign,
  Sliders,
  LineChart,
  Bell,
  LogOut,
  Sparkles,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { LipstickIcon, BlushIcon, MascaraIcon } from './CosmeticIcons';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { unreadAlertsCount, criticalAlertsCount, setNotificationModalOpen, showToast, refreshData } = useApp();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  const handleResetData = async () => {
    if (confirm('¿Restablecer datos a la configuración demo inicial?')) {
      try {
        const res = await fetch('/api/reset', { method: 'POST' });
        const json = await res.json();
        if (json.success) {
          showToast('Datos demo restaurados con éxito', 'success');
          await refreshData();
        }
      } catch {
        showToast('Error al restaurar datos demo', 'error');
      }
    }
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Inventario & Kardex',
      href: '/inventario',
      icon: Package,
      badge: null,
    },
    {
      name: 'Compras & O.C.',
      href: '/compras',
      icon: ShoppingCart,
      badge: null,
    },
    {
      name: 'Registro de Ventas',
      href: '/ventas',
      icon: BadgeDollarSign,
      badge: null,
    },
    {
      name: 'Parámetros (Q, R)',
      href: '/parametros',
      icon: Sliders,
      badge: null,
    },
    {
      name: 'Simulador 12 Semanas',
      href: '/simulador',
      icon: LineChart,
      badge: 'Proyección',
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col h-screen sticky top-0 border-r border-pink-200/50 dark:border-pink-900/30 glass-card">
      {/* Brand Header */}
      <div className="p-6 border-b border-pink-100/60 dark:border-pink-900/40">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/25 group-hover:scale-105 transition-all">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
              TRENDY ERP
            </h1>
            <p className="text-[11px] font-medium text-pink-600/70 dark:text-pink-400/80">
              Inventarios Cosméticos
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Módulos Principales
        </p>
        {navItems.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/25 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-pink-50/80 dark:hover:bg-pink-950/40 hover:text-pink-600 dark:hover:text-pink-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-pink-500 dark:text-pink-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/60 text-pink-700 dark:text-pink-300">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Quick Alarm Drawer Button */}
        <div className="pt-4 mt-4 border-t border-pink-100/60 dark:border-pink-900/40">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Monitor de Alarmas
          </p>
          <button
            onClick={() => setNotificationModalOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-pink-950/40 hover:text-pink-600 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-4 h-4 text-pink-500" />
                {criticalAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </div>
              <span>Centro de Alertas</span>
            </div>
            {unreadAlertsCount > 0 && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                criticalAlertsCount > 0
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
              }`}>
                {unreadAlertsCount}
              </span>
            )}
          </button>
        </div>

        {/* 3 Products Quick Status */}
        <div className="pt-4 mt-2">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Catálogo Oficial (3 SKU)
          </p>
          <div className="space-y-1 px-1">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 bg-pink-50/50 dark:bg-pink-950/20">
              <LipstickIcon className="w-4 h-4 text-pink-500" />
              <span className="truncate">1. Gloss Retro Glow</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 bg-pink-50/50 dark:bg-pink-950/20">
              <BlushIcon className="w-4 h-4 text-fuchsia-500" />
              <span className="truncate">2. Rubor Star</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 bg-pink-50/50 dark:bg-pink-950/20">
              <MascaraIcon className="w-4 h-4 text-purple-500" />
              <span className="truncate">3. Pestañina Super Look</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer / User Controls */}
      <div className="p-4 border-t border-pink-100/60 dark:border-pink-900/40 space-y-2">
        <button
          onClick={handleResetData}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-slate-500 hover:text-pink-600 hover:bg-pink-50/80 dark:hover:bg-pink-950/30 transition-all"
          title="Reiniciar a datos demo de fábrica"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Datos Demo</span>
        </button>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
              C
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Camila G.</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Admin Operaciones</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
