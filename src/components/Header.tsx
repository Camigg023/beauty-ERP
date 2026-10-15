'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Sun,
  Moon,
  Sparkles,
  Menu,
  X,
  LayoutDashboard,
  Package,
  ShoppingCart,
  BadgeDollarSign,
  Sliders,
  LineChart,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function Header({ title, subtitle }: { title?: string; subtitle?: string }) {
  const { theme, toggleTheme, unreadAlertsCount, criticalAlertsCount, setNotificationModalOpen } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Inventario', href: '/inventario', icon: Package },
    { name: 'Compras', href: '/compras', icon: ShoppingCart },
    { name: 'Ventas', href: '/ventas', icon: BadgeDollarSign },
    { name: 'Parámetros', href: '/parametros', icon: Sliders },
    { name: 'Simulador', href: '/simulador', icon: LineChart },
  ];

  return (
    <header className="sticky top-0 z-30 w-full glass-header py-3.5 px-4 sm:px-8 flex items-center justify-between">
      {/* Page Title or Mobile Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-pink-100/50 dark:hover:bg-pink-900/40"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="hidden md:block">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            {title || 'Sistema de Gestión de Inventarios'}
          </h2>
          {subtitle && (
            <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">{subtitle}</p>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            TRENDY ERP
          </span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Cambiar modo claro / oscuro"
          className="p-2.5 rounded-xl border border-pink-200/60 dark:border-pink-900/40 bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-300 hover:border-pink-300 transition-all shadow-sm"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-purple-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Notifications Button */}
        <button
          onClick={() => setNotificationModalOpen(true)}
          className="relative p-2.5 rounded-xl border border-pink-200/60 dark:border-pink-900/40 bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-300 hover:border-pink-300 transition-all shadow-sm group"
        >
          <Bell className="w-4 h-4 text-pink-500 group-hover:scale-110 transition-transform" />
          {unreadAlertsCount > 0 && (
            <span
              className={`absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center text-[10px] font-black rounded-full text-white shadow-md ${
                criticalAlertsCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
              }`}
            >
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* Quick Help / Colombia Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-100/70 dark:bg-pink-950/50 border border-pink-200/60 dark:border-pink-900/40 text-xs font-semibold text-pink-700 dark:text-pink-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>COP (Colombia)</span>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full glass-modal p-4 border-b border-pink-200/60 shadow-2xl md:hidden space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-pink-50 dark:hover:bg-pink-950/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
