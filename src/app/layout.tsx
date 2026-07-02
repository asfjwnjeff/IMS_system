import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AppLayout } from '@/components/layout/AppLayout';
import { AppProvider } from '@/lib/store';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'IMS 保险管理系统',
  description: '保险业务管理系统 — 基础信息配置、保单管理、报案理赔',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AppProvider>
            <AppLayout>
              {children}
            </AppLayout>
            <Toaster />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
