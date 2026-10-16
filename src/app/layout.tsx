import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { NotificationCenterModal } from '@/components/NotificationCenterModal';
import { QuickOrderModal } from '@/components/QuickOrderModal';
import { ToastContainer } from '@/components/ToastContainer';

export const metadata: Metadata = {
  title: 'BEAUTY ERP | Gestión de Inventarios Cosméticos Beauty',
  description: 'ERP de inventarios con políticas (Q, R) y (s, S), EOQ, stock de seguridad y punto de reorden para marca de cosméticos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased selection:bg-pink-500 selection:text-white">
        <AppProvider>
          {children}
          <NotificationCenterModal />
          <QuickOrderModal />
          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  );
}
