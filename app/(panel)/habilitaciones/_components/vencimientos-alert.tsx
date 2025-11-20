'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Calendar, ChevronRight, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'

export function VencimientosAlert() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const fetchVencimientos = async () => {
            try {
                const res = await fetch('/api/habilitaciones/vencimientos')
                const json = await res.json()
                if (json.success) {
                    setData(json.data)
                    // Auto-abrir si hay vencimientos urgentes
                    if (json.data.totales.vencidas > 0 || json.data.totales.proximos_7_dias > 0) {
                        setIsOpen(true)
                    }
                }
            } catch (error) {
                console.error('Error al cargar vencimientos:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchVencimientos()
    }, [])

    if (loading || !data) return null

    const totalAlertas = data.totales.vencidas + data.totales.proximos_30_dias

    if (totalAlertas === 0) return null

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
            <Card className="border-l-4 border-l-orange-500 shadow-sm">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-orange-100 p-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">
                                {totalAlertas} Habilitaciones requieren atención
                            </h3>
                            <p className="text-sm text-slate-600">
                                {data.totales.vencidas > 0 && (
                                    <span className="font-medium text-red-600">
                                        {data.totales.vencidas} vencidas
                                    </span>
                                )}
                                {data.totales.vencidas > 0 && data.totales.proximos_30_dias > 0 && ' y '}
                                {data.totales.proximos_30_dias > 0 && (
                                    <span>{data.totales.proximos_30_dias} por vencer este mes</span>
                                )}
                            </p>
                        </div>
                    </div>

                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                            {isOpen ? 'Ocultar' : 'Ver Detalles'}
                            <ChevronRight className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                        </Button>
                    </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                    <div className="border-t bg-orange-50/30 p-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Vencidas */}
                            {data.vencidas.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-red-700">
                                        <AlertCircle className="h-4 w-4" />
                                        Vencidas ({data.totales.vencidas})
                                    </h4>
                                    <div className="space-y-2">
                                        {data.vencidas.map((h: any) => (
                                            <div key={h.id} className="flex items-center justify-between rounded-md border bg-white p-2 text-sm">
                                                <div>
                                                    <span className="font-medium">{h.nro_licencia}</span>
                                                    <span className="mx-2 text-slate-300">|</span>
                                                    <span className="text-slate-600">{h.titular.nombre}</span>
                                                </div>
                                                <Badge variant="destructive">Vencida</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Por Vencer */}
                            {data.por_vencer.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-orange-700">
                                        <Calendar className="h-4 w-4" />
                                        Próximos Vencimientos ({data.totales.proximos_30_dias})
                                    </h4>
                                    <div className="space-y-2">
                                        {data.por_vencer.slice(0, 5).map((h: any) => (
                                            <div key={h.id} className="flex items-center justify-between rounded-md border bg-white p-2 text-sm">
                                                <div>
                                                    <span className="font-medium">{h.nro_licencia}</span>
                                                    <span className="mx-2 text-slate-300">|</span>
                                                    <span className="text-slate-600">{h.titular.nombre}</span>
                                                </div>
                                                <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">
                                                    {h.dias_restantes} días
                                                </Badge>
                                            </div>
                                        ))}
                                        {data.por_vencer.length > 5 && (
                                            <p className="text-xs text-center text-slate-500">
                                                + {data.por_vencer.length - 5} más...
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    )
}
