'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { NotificationAlert, Product } from '@/types';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  products: Product[];
  notifications: NotificationAlert[];
  unreadAlertsCount: number;
  criticalAlertsCount: number;
  isLoading: boolean;
  dataError: string | null;
  refreshData: () => Promise<void>;
  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  quickOrderModal: {
    isOpen: boolean;
    product?: Product;
    quantity?: number;
  };
  openQuickOrder: (product: Product, quantity?: number) => void;
  closeQuickOrder: () => void;
  isNotificationModalOpen: boolean;
  setNotificationModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [products, setProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [quickOrderModal, setQuickOrderModal] = useState<{
    isOpen: boolean;
    product?: Product;
    quantity?: number;
  }>({ isOpen: false });
  const [isNotificationModalOpen, setNotificationModalOpen] = useState(false);

  // Cargar tema guardado
  useEffect(() => {
    const savedTheme = localStorage.getItem('beauty_erp_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('beauty_erp_theme', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setDataError(null);
    try {
      const [prodRes, notifRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/notifications'),
      ]);
      const prodJson = await prodRes.json();
      const notifJson = await notifRes.json();

      if (!prodRes.ok || !prodJson.success) {
        throw new Error(prodJson.error || 'No se pudieron cargar los productos');
      }
      if (!notifRes.ok || !notifJson.success) {
        throw new Error(notifJson.error || 'No se pudieron cargar las notificaciones');
      }
      setProducts(prodJson.data);
      setNotifications(notifJson.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar los datos';
      console.error('Error refreshing app data:', error);
      setDataError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pathname === '/login') return;
    refreshData();
  }, [pathname, refreshData]);

  const openQuickOrder = useCallback((product: Product, quantity?: number) => {
    setQuickOrderModal({
      isOpen: true,
      product,
      quantity: quantity || product.calculations.recommendedQ,
    });
  }, []);

  const closeQuickOrder = useCallback(() => {
    setQuickOrderModal({ isOpen: false });
  }, []);

  const unreadAlertsCount = notifications.filter(n => !n.resolved).length;
  const criticalAlertsCount = notifications.filter(n => !n.resolved && (n.severity === 'CRITICAL' || n.severity === 'STOCKOUT')).length;

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        products,
        notifications,
        unreadAlertsCount,
        criticalAlertsCount,
        isLoading,
        dataError,
        refreshData,
        toasts,
        showToast,
        removeToast,
        quickOrderModal,
        openQuickOrder,
        closeQuickOrder,
        isNotificationModalOpen,
        setNotificationModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
