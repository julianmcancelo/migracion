'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Camera,
  FileSignature,
} from 'lucide-react';
import {
  createInitialItems,
  groupItemsByCategory,
  type InspectionItem,
} from '@/lib/inspection-config';
import CameraCapture from '@/components/inspector/CameraCapture';
import SignaturePad from '@/components/inspector/SignaturePad';
import InspectionStats from '@/components/inspector/InspectionStats';
import Image from 'next/image';

interface Tramite {
  habilitacion: {
    id: number;
    nro_licencia: string;
    tipo_transporte: string;
  };
  titular: { nombre: string; dni: string; email?: string } | null;
  vehiculo: { dominio: string; marca: string; modelo: string } | null;
}

const STEPS = ['Verificación', 'Evidencia', 'Firmas'];

export default function FormularioInspeccionPage() {
  const router = useRouter();
  const [tramite, setTramite] = useState<Tramite | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [items, setItems] = useState<InspectionItem[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fotos del vehículo
  const [vehiclePhotos, setVehiclePhotos] = useState<{
    frente: string;
    contrafrente: string;
    lateral_izq: string;
    lateral_der: string;
  }>({
    frente: '',
    contrafrente: '',
    lateral_izq: '',
    lateral_der: '',
  });
  const [optionalPhoto, setOptionalPhoto] = useState<string>('');

  // Firmas
  const [inspectorSignature, setInspectorSignature] = useState<string>('');
  const [contributorSignature, setContributorSignature] = useState<string>('');
  const [showSignaturePad, setShowSignaturePad] = useState<{
    visible: boolean;
    type: 'inspector' | 'contributor' | null;
  }>({ visible: false, type: null });
  const [sendEmailCopy, setSendEmailCopy] = useState(true);

  useEffect(() => {
    const tramiteStr = sessionStorage.getItem('tramite_inspeccion');
    if (tramiteStr) {
      const t = JSON.parse(tramiteStr);
      setTramite(t);
      const initialItems = createInitialItems(t.habilitacion.tipo_transporte);
      setItems(initialItems);
      
      // Abrir la primera categoría por defecto
      const grouped = groupItemsByCategory(initialItems);
      const firstCategory = Object.keys(grouped)[0];
      if (firstCategory) {
        setOpenCategory(firstCategory);
      }
    } else {
      router.back();
    }
  }, [router]);

  const handleItemStateChange = (itemId: string, estado: 'bien' | 'regular' | 'mal') => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, estado } : item
      )
    );
  };

  const handleItemObservationChange = (itemId: string, observacion: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, observacion } : item
      )
    );
  };

  const handleItemPhotoChange = (itemId: string, foto: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, foto } : item
      )
    );
  };

  const canGoNext = () => {
    if (currentStep === 0) {
      // Verificar que todos los ítems tengan estado
      const allHaveState = items.every((item) => item.estado !== null);
      
      // Verificar que los ítems Regular o Mal tengan foto obligatoria
      const regularOrMalWithPhoto = items
        .filter((item) => item.estado === 'regular' || item.estado === 'mal')
        .every((item) => item.foto !== null && item.foto !== '');
      
      return allHaveState && regularOrMalWithPhoto;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 0 && !canGoNext()) {
      // Verificar qué falta
      const itemsSinEstado = items.filter((item) => item.estado === null);
      const itemsSinFoto = items.filter(
        (item) =>
          (item.estado === 'regular' || item.estado === 'mal') &&
          (!item.foto || item.foto === '')
      );

      if (itemsSinEstado.length > 0) {
        alert('Por favor, califique todos los ítems antes de continuar');
      } else if (itemsSinFoto.length > 0) {
        alert(
          `Debe tomar fotos de los ${itemsSinFoto.length} ítem(s) calificados como Regular o Mal para justificar el estado`
        );
      }
      return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!inspectorSignature) {
      alert('La firma del inspector es obligatoria');
      return;
    }

    if (!tramite) return;

    setIsSubmitting(true);

    try {
      const payload = {
        habilitacion_id: tramite.habilitacion.id,
        nro_licencia: tramite.habilitacion.nro_licencia,
        tipo_transporte: tramite.habilitacion.tipo_transporte,
        titular: tramite.titular,
        vehiculo: tramite.vehiculo,
        items: items.map((item) => ({
          id: item.id,
          nombre: item.nombre,
          estado: item.estado,
          observacion: item.observacion,
          foto: item.foto,
        })),
        fotos_vehiculo: vehiclePhotos,
        foto_adicional: optionalPhoto,
        firma_inspector: inspectorSignature,
        firma_contribuyente: contributorSignature,
        email_contribuyente: tramite.titular?.email,
        sendEmailCopy,
      };

      const response = await fetch('/api/inspecciones/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        alert('Inspección guardada correctamente');
        sessionStorage.removeItem('tramite_inspeccion');
        router.push('/inspector-movil');
      } else {
        throw new Error(result.message || 'Error al guardar la inspección');
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tramite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  const renderProgressBar = () => (
    <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
      {STEPS.map((step, index) => (
        <div key={step} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                index < currentStep
                  ? 'bg-blue-600 border-blue-600'
                  : index === currentStep
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-white border-gray-300'
              }`}
            >
              {index < currentStep ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <span
                  className={`text-sm font-bold ${
                    index === currentStep ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {index + 1}
                </span>
              )}
            </div>
            <span
              className={`text-xs mt-1 font-medium ${
                index === currentStep ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              {step}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div
              className={`h-0.5 flex-1 mx-2 ${
                index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderItemsStep = () => {
    const grouped = groupItemsByCategory(items);

    return (
      <div className="p-4 space-y-3 pb-24">
        {/* Estadísticas de progreso */}
        <InspectionStats items={items} />
        {Object.entries(grouped).map(([categoria, categoryItems]) => (
          <div
            key={categoria}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <button
              onClick={() =>
                setOpenCategory(openCategory === categoria ? null : categoria)
              }
              className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-base font-bold text-gray-900">{categoria}</h3>
              {openCategory === categoria ? (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {openCategory === categoria && (
              <div className="divide-y divide-gray-100">
                {categoryItems.map((item) => (
                  <div key={item.id} className="p-4">
                    <p className="text-sm font-medium text-gray-900 mb-3">
                      {item.nombre}
                    </p>

                    {/* Botones de estado */}
                    <div className="flex gap-2 mb-3">
                      {(['bien', 'regular', 'mal'] as const).map((estado) => (
                        <button
                          key={estado}
                          onClick={() => handleItemStateChange(item.id, estado)}
                          className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-colors ${
                            item.estado === estado
                              ? estado === 'bien'
                                ? 'bg-green-600 text-white'
                                : estado === 'regular'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-red-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {estado.charAt(0).toUpperCase() + estado.slice(1)}
                        </button>
                      ))}
                    </div>

                    {/* Observación - Solo si es Regular o Mal */}
                    {(item.estado === 'regular' || item.estado === 'mal') && (
                      <>
                        <textarea
                          value={item.observacion}
                          onChange={(e) =>
                            handleItemObservationChange(item.id, e.target.value)
                          }
                          placeholder={
                            item.estado === 'mal'
                              ? 'Observación obligatoria - Describa el problema...'
                              : 'Observación (opcional)...'
                          }
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                        />

                        {/* Foto obligatoria para Regular o Mal */}
                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Camera className="w-4 h-4 text-red-600" />
                            <p className="text-sm font-semibold text-red-600">
                              Evidencia Fotográfica Obligatoria
                            </p>
                          </div>
                          <CameraCapture
                            label={`Foto del problema (${item.estado})`}
                            currentPhoto={item.foto}
                            onCapture={(base64) =>
                              handleItemPhotoChange(item.id, base64)
                            }
                          />
                          {!item.foto && (
                            <p className="text-xs text-red-500 mt-1">
                              * Debe tomar una foto para justificar el estado
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPhotosStep = () => {
    const photoSlots = [
      { key: 'frente' as const, label: 'Frente del Vehículo' },
      { key: 'contrafrente' as const, label: 'Parte Trasera' },
      { key: 'lateral_izq' as const, label: 'Lateral Izquierdo' },
      { key: 'lateral_der' as const, label: 'Lateral Derecho' },
    ];

    return (
      <div className="p-4 space-y-6 pb-24">
        {/* Mensaje informativo */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Evidencia Fotográfica:</strong> Las fotos del vehículo son opcionales. 
            Tome fotos si considera necesario documentar el estado general del vehículo.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-bold text-gray-900 mb-2">
            Fotos del Vehículo (Opcionales)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Puede tomar fotos generales del vehículo si lo considera necesario
          </p>
          <div className="grid grid-cols-2 gap-4">
            {photoSlots.map((slot) => (
              <CameraCapture
                key={slot.key}
                label={slot.label}
                currentPhoto={vehiclePhotos[slot.key]}
                onCapture={(base64) =>
                  setVehiclePhotos((prev) => ({ ...prev, [slot.key]: base64 }))
                }
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-bold text-gray-900 mb-2">
            Foto Adicional (Opcional)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Cualquier otra evidencia que considere relevante
          </p>
          <CameraCapture
            label="Foto Adicional"
            currentPhoto={optionalPhoto}
            onCapture={setOptionalPhoto}
          />
        </div>
      </div>
    );
  };

  const renderSignaturesStep = () => (
    <div className="p-4 space-y-4 pb-24">
      <p className="text-sm text-gray-600 text-center mb-4">
        Realice las firmas de conformidad para finalizar el reporte
      </p>

      {/* Firma del Inspector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-base font-bold text-gray-900 mb-3">
          Firma del Inspector *
        </h3>
        {inspectorSignature ? (
          <div className="relative w-full h-32 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            <Image
              src={inspectorSignature}
              alt="Firma del inspector"
              fill
              className="object-contain"
            />
            <button
              onClick={() => setInspectorSignature('')}
              className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full shadow-lg hover:bg-red-700"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() =>
              setShowSignaturePad({ visible: true, type: 'inspector' })
            }
            className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-gray-100 hover:border-blue-400 transition-colors"
          >
            <FileSignature className="w-8 h-8 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">
              Tocar para firmar
            </span>
          </button>
        )}
        {inspectorSignature && (
          <p className="text-sm text-green-600 font-semibold mt-2 flex items-center gap-1">
            <Check className="w-4 h-4" /> Firma guardada
          </p>
        )}
      </div>

      {/* Firma del Contribuyente */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-base font-bold text-gray-900 mb-3">
          Firma del Contribuyente (Opcional)
        </h3>
        {contributorSignature ? (
          <div className="relative w-full h-32 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            <Image
              src={contributorSignature}
              alt="Firma del contribuyente"
              fill
              className="object-contain"
            />
            <button
              onClick={() => setContributorSignature('')}
              className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full shadow-lg hover:bg-red-700"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() =>
              setShowSignaturePad({ visible: true, type: 'contributor' })
            }
            className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-gray-100 hover:border-blue-400 transition-colors"
          >
            <FileSignature className="w-8 h-8 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">
              Tocar para firmar
            </span>
          </button>
        )}
        {contributorSignature && (
          <p className="text-sm text-green-600 font-semibold mt-2 flex items-center gap-1">
            <Check className="w-4 h-4" /> Firma guardada
          </p>
        )}
      </div>

      {/* Checkbox para enviar email */}
      {tramite.titular?.email && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={sendEmailCopy}
              onChange={(e) => setSendEmailCopy(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Enviar copia por email a {tramite.titular.email}
            </span>
          </label>
        </div>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderItemsStep();
      case 1:
        return renderPhotosStep();
      case 2:
        return renderSignaturesStep();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Formulario de Inspección
            </h1>
            <p className="text-xs text-gray-600">
              {tramite.habilitacion.nro_licencia}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {renderProgressBar()}

      {/* Content */}
      {renderStepContent()}

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg flex gap-3">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Anterior
        </button>
        <button
          onClick={handleNext}
          disabled={isSubmitting || (currentStep === 0 && !canGoNext())}
          className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            'Guardando...'
          ) : currentStep === STEPS.length - 1 ? (
            <>
              <Check className="w-5 h-5" />
              Finalizar
            </>
          ) : (
            <>
              Siguiente
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      {/* Signature Modal */}
      {showSignaturePad.visible && (
        <SignaturePad
          title={
            showSignaturePad.type === 'inspector'
              ? 'Firma del Inspector'
              : 'Firma del Contribuyente'
          }
          onSave={(signature) => {
            if (showSignaturePad.type === 'inspector') {
              setInspectorSignature(signature);
            } else {
              setContributorSignature(signature);
            }
            setShowSignaturePad({ visible: false, type: null });
          }}
          onClose={() => setShowSignaturePad({ visible: false, type: null })}
        />
      )}
    </div>
  );
}
