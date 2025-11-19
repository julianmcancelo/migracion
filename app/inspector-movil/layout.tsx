import { Metadata } from 'next';
import ServiceWorkerRegistration from '@/components/pwa/ServiceWorkerRegistration';
import SyncStatus from '@/components/pwa/SyncStatus';
import InstallPWA from '@/components/pwa/InstallPWA';
import PWARegistration from '@/components/pwa/PWARegistration';

export const metadata: Metadata = {
  title: 'Inspecciones - Sistema de Habilitaciones',
  description: 'Módulo de inspecciones móvil para inspectores',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  manifest: '/manifest-inspector.json',
  themeColor: '#0093D2',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Inspecciones Lanús',
  },
};

export default function InspectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      <ServiceWorkerRegistration />
      <SyncStatus />
      <PWARegistration swPath="/sw-inspector.js" appName="Inspector Móvil" />
      <InstallPWA appName="Inspecciones Lanús" variant="inspector" />
    </div>
  );
}
