'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { LipstickIcon, BlushIcon, MascaraIcon } from '@/components/CosmeticIcons';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@trendybeauty.co');
  const [password, setPassword] = useState('TrendyAdmin2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/');
      } else {
        setError(data.error || 'Credenciales no válidas');
      }
    } catch {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail('admin@trendybeauty.co');
    setPassword('TrendyAdmin2026!');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-pink-100 via-purple-100 to-fuchsia-200 dark:from-darkbg-900 dark:via-darkbg-800 dark:to-darkbg-700">
      {/* Background Glow Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 dark:bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative w-full max-w-md p-8 sm:p-10 rounded-3xl glass-card border border-pink-200/70 dark:border-pink-900/40 shadow-2xl space-y-8 z-10">
        {/* Brand Icon Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-purple-600 text-white shadow-xl shadow-pink-500/30">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
              TRENDY BEAUTY ERP
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
              Control de Inventarios • Políticas (Q, R) • Modelo EOQ
            </p>
          </div>

          {/* 3 Icons bar */}
          <div className="flex items-center justify-center gap-4 pt-1 text-pink-500 dark:text-pink-400">
            <div className="flex items-center gap-1 text-[11px] font-semibold bg-pink-100/70 dark:bg-pink-950/40 px-2 py-0.5 rounded-full">
              <LipstickIcon className="w-3.5 h-3.5" /> Gloss
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold bg-fuchsia-100/70 dark:bg-fuchsia-950/40 px-2 py-0.5 rounded-full">
              <BlushIcon className="w-3.5 h-3.5" /> Blush
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold bg-purple-100/70 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
              <MascaraIcon className="w-3.5 h-3.5" /> Pestañina
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-pink-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-white/80 dark:bg-slate-900/80 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-medium"
                placeholder="admin@trendybeauty.co"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-pink-500" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-white/80 dark:bg-slate-900/80 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-medium"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 hover:opacity-95 shadow-lg shadow-pink-500/30 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            <span>{loading ? 'Accediendo al ERP...' : 'Iniciar Sesión'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Fill Badge */}
        <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-pink-200/50 dark:border-pink-900/30 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Acceso Demo Autorizado</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            admin@trendybeauty.co / TrendyAdmin2026!
          </p>
          <button
            type="button"
            onClick={handleQuickDemo}
            className="text-xs font-bold text-pink-600 dark:text-pink-400 hover:underline"
          >
            Autorrellenar credenciales
          </button>
        </div>
      </div>
    </div>
  );
}
