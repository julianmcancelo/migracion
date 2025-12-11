'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function QRResolveContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const resolveQR = async () => {
            const data = searchParams.get('data');
            if (!data) {
                setError('No se proporcionaron datos');
                return;
            }

            try {
                const response = await fetch(`/api/qr/resolve?data=${encodeURIComponent(data)}`);
                const result = await response.json();

                if (response.ok && result.redirectUrl) {
                    router.replace(result.redirectUrl);
                } else {
                    setError(result.error || 'Error al resolver el código QR');
                }
            } catch (err) {
                setError('Error de conexión');
            }
        };

        resolveQR();
    }, [searchParams, router]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center">
                    <div className="text-red-500 text-xl font-bold mb-2">Error</div>
                    <p className="text-gray-600">{error}</p>
                    <button
                        onClick={() => router.push('/inspector-movil')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Procesando código QR...</p>
            </div>
        </div>
    );
}

export default function QRResolvePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        }>
            <QRResolveContent />
        </Suspense>
    );
}
