import { Metadata } from 'next';
import ServiceWorkerRegistration from '@/components/pwa/ServiceWorkerRegistration';

export const metadata: Metadata = {
  title: 'Inspecciones - Sistema de Habilitaciones',
  description: 'Módulo de inspecciones móvil para inspectores',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
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
    </div>
  );
}
