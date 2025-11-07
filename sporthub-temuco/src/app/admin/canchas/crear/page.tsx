'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { canchaService } from '@/services/canchaService';
import { complejosService } from '@/services/complejosService';
import '@/app/admin/dashboard.css';

// Tipos de cancha disponibles (mantenemos en minúscula como el backend)
const TIPOS_CANCHA = [
  'futbol',
  'basquet', 
  'tenis',
  'padel',
  'volley',
  'futbol_sala'
];

// 🎯 MEJORA #10: Plantillas de descripción
const PLANTILLAS_DESCRIPCION = {
  futbol: [
    "Cancha de fútbol profesional con césped sintético de última generación. Ideal para partidos y entrenamientos.",
    "Cancha de fútbol con iluminación LED y vestuarios equipados. Perfecta para ligas amateur.",
    "Cancha de fútbol techada, disponible para jugar con cualquier clima. Incluye áreas de descanso."
  ],
  basquet: [
    "Cancha de básquetbol con piso de madera profesional y tableros reglamentarios.",
    "Cancha de básquetbol techada con marcación oficial y graderías para espectadores.",
    "Cancha multiuso de básquetbol ideal para entrenamientos y partidos recreativos."
  ],
  tenis: [
    "Cancha de tenis con superficie de arcilla profesional. Perfecta para jugadores de todos los niveles.",
    "Cancha de tenis dura con iluminación nocturna y red reglamentaria.",
    "Cancha de tenis cubierta, disponible todo el año sin importar el clima."
  ],
  padel: [
    "Cancha de pádel panorámica con cristales de alta calidad y césped sintético premium.",
    "Cancha de pádel indoor con iluminación LED y sistema de ventilación.",
    "Cancha de pádel outdoor con techo desmontable y excelente mantenimiento."
  ],
  volley: [
    "Cancha de vóleibol con arena de playa y red profesional. Ideal para torneos.",
    "Cancha de vóleibol indoor con piso sintético y altura reglamentaria.",
    "Cancha de vóleibol playa con zona de descanso y duchas disponibles."
  ],
  futbol_sala: [
    "Cancha de fútbol sala techada con piso sintético antideslizante y arcos profesionales.",
    "Cancha de futsal con marcación FIFA y graderías. Perfecta para torneos.",
    "Cancha de fútbol sala indoor con climatización y vestuarios equipados."
  ]
};

// 🎯 MEJORA #11: Servicios/Equipamiento disponibles
const SERVICIOS_DISPONIBLES = [
  { id: 'iluminacion', label: '💡 Iluminación nocturna', emoji: '💡' },
  { id: 'vestuarios', label: '🚿 Vestuarios y duchas', emoji: '🚿' },
  { id: 'estacionamiento', label: '🅿️ Estacionamiento', emoji: '🅿️' },
  { id: 'cafeteria', label: '🍔 Cafetería/Kiosko', emoji: '🍔' },
  { id: 'wifi', label: '📶 WiFi gratuito', emoji: '📶' },
  { id: 'implementos', label: '⚽ Implementos deportivos', emoji: '⚽' },
  { id: 'arbitros', label: '👨‍⚖️ Servicio de árbitros', emoji: '👨‍⚖️' },
  { id: 'graderias', label: '🪑 Graderías', emoji: '🪑' }
];

interface Complejo {
  id: number;
  nombre: string;
  direccion?: string;
  comuna?: string;
}

export default function NuevaCanchaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingComplejos, setIsLoadingComplejos] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [complejos, setComplejos] = useState<Complejo[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);

  // 🎯 MEJORA #1: Validación de nombre duplicado
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nombreDisponible, setNombreDisponible] = useState<boolean | null>(null);
  const checkNameTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🎯 MEJORA #7: Validación visual de campos
  const [camposValidos, setCamposValidos] = useState({
    nombre: false,
    tipo: true,
    establecimientoId: false,
    precioPorHora: false,
    capacidad: true,
  });

  // 🎯 MEJORA #8: Confirmación con resumen
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  // 🎯 MEJORA #11: Servicios seleccionados
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<string[]>([]);

  // 🎯 MEJORA #12: Estado de la cancha
  const [estadoCancha, setEstadoCancha] = useState<'disponible' | 'mantenimiento' | 'inactiva'>('disponible');

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'futbol' as const,
    techada: false,
    establecimientoId: 0,
    precioPorHora: 0,
    capacidad: 10,
    descripcion: '',
    activa: true
  });

  // Cargar complejos del administrador al montar el componente
  useEffect(() => {
    loadUserComplejos();
  }, []);

  const loadUserComplejos = async () => {
    try {
      setIsLoadingComplejos(true);
      
      // Obtener datos del usuario desde localStorage
      const userDataString = localStorage.getItem('userData');
      if (!userDataString) {
        setError('No se encontró información del usuario. Por favor, inicia sesión nuevamente.');
        return;
      }

      const userData = JSON.parse(userDataString);
      const adminId = userData.id_usuario || userData.id;
      
      if (!adminId) {
        setError('No se pudo obtener el ID del usuario.');
        return;
      }

      setUserId(adminId);
      console.log('👤 [CrearCancha] Cargando complejos del admin ID:', adminId);

      // ✅ Obtener complejos del admin usando el endpoint correcto
      const complejosData = await complejosService.getComplejosByAdmin(adminId);
      
      console.log('📋 [CrearCancha] Complejos cargados (raw):', complejosData);
      console.log('📋 [CrearCancha] Tipo de complejosData:', typeof complejosData);
      console.log('📋 [CrearCancha] Es array?:', Array.isArray(complejosData));
      
      // Adaptar formato si es necesario
      let complejosArray = [];
      if (Array.isArray(complejosData)) {
        complejosArray = complejosData;
        console.log('📋 [CrearCancha] Usando array directo, length:', complejosArray.length);
      } else if (complejosData?.items) {
        complejosArray = complejosData.items;
        console.log('📋 [CrearCancha] Extrayendo de .items, length:', complejosArray.length);
      } else if (complejosData?.data) {
        complejosArray = Array.isArray(complejosData.data) ? complejosData.data : complejosData.data.items || [];
        console.log('📋 [CrearCancha] Extrayendo de .data, length:', complejosArray.length);
      }

      console.log('📋 [CrearCancha] Array a mapear:', complejosArray);
      if (complejosArray.length > 0) {
        console.log('📋 [CrearCancha] Primer elemento del array:', complejosArray[0]);
      }

      // Mapear a formato esperado con validación
      const complejosFormateados = complejosArray
        .filter((c: any) => c && (c.id || c.id_complejo)) // Filtrar elementos sin ID
        .map((c: any) => {
          const complejo = {
            id: c.id || c.id_complejo || 0,
            nombre: c.nombre || 'Sin nombre',
            direccion: c.direccion || '',
            comuna: c.comuna || ''
          };
          console.log('📋 [CrearCancha] Complejo mapeado:', complejo);
          return complejo;
        });

      console.log('📋 [CrearCancha] Complejos formateados final:', complejosFormateados);
      setComplejos(complejosFormateados);

      // Auto-seleccionar si solo hay uno
      if (complejosFormateados.length === 1) {
        const unicoComplejo = complejosFormateados[0];
        setFormData(prev => ({ ...prev, establecimientoId: unicoComplejo.id }));
        console.log(`✅ [CrearCancha] Auto-seleccionado complejo único: ${unicoComplejo.nombre} (ID: ${unicoComplejo.id})`);
        setSuccess(`Complejo "${unicoComplejo.nombre}" seleccionado automáticamente.`);
        setTimeout(() => setSuccess(''), 3000);
      } else if (complejosFormateados.length > 1) {
        console.log(`ℹ️ [CrearCancha] ${complejosFormateados.length} complejos disponibles. Selecciona uno.`);
        setSuccess(`Se encontraron ${complejosFormateados.length} complejos. Selecciona uno para continuar.`);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        console.warn('⚠️ [CrearCancha] No tienes complejos asociados.');
        setError('No tienes complejos deportivos asociados. Debes crear un complejo primero.');
        setTimeout(() => setError(''), 5000);
      }

    } catch (err: any) {
      console.error('❌ [CrearCancha] Error cargando complejos:', err);
      console.error('   Error completo:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      setComplejos([]);
      setError('Error al cargar tus complejos. Por favor, intenta recargar la página.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsLoadingComplejos(false);
    }
  };

  // 🎯 MEJORA #6: Cargar datos desde otra cancha (modo duplicar)
  useEffect(() => {
    const duplicarDesde = searchParams?.get('duplicarDesde');
    if (duplicarDesde) {
      cargarCanchaParaDuplicar(Number(duplicarDesde));
    }
  }, [searchParams]);

  const cargarCanchaParaDuplicar = async (canchaId: number) => {
    try {
      setIsLoading(true);
      const cancha = await canchaService.getCanchaById(canchaId);
      
      setFormData({
        nombre: `${cancha.nombre} (Copia)`,
        tipo: cancha.tipo as any,
        techada: cancha.techada,
        establecimientoId: cancha.establecimientoId,
        precioPorHora: cancha.precioPorHora || 0,
        capacidad: cancha.capacidad || 10,
        descripcion: cancha.descripcion || '',
        activa: true
      });

      setSuccess('Datos cargados desde cancha existente. Modifica lo necesario y guarda.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      console.error('Error al cargar cancha para duplicar:', err);
      setError('No se pudo cargar la cancha de referencia.');
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 MEJORA #2: Auto-guardado en localStorage cada 30 segundos
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (formData.nombre || formData.descripcion || formData.precioPorHora > 0) {
        localStorage.setItem('draft_cancha', JSON.stringify({
          ...formData,
          servicios: serviciosSeleccionados,
          timestamp: new Date().toISOString()
        }));
        console.log('💾 [Auto-guardado] Borrador guardado');
      }
    }, 30000); // Cada 30 segundos

    return () => clearInterval(intervalId);
  }, [formData, serviciosSeleccionados]);

  // Recuperar borrador al cargar
  useEffect(() => {
    const draft = localStorage.getItem('draft_cancha');
    if (draft && !searchParams?.get('duplicarDesde')) {
      try {
        const draftData = JSON.parse(draft);
        const timestamp = new Date(draftData.timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

        // Solo recuperar si es menor a 24 horas
        if (hoursDiff < 24) {
          const confirmar = confirm(
            `Se encontró un borrador guardado hace ${Math.round(hoursDiff)} horas. ¿Deseas recuperarlo?`
          );
          
          if (confirmar) {
            const { servicios, timestamp: _, ...formDataToRecover } = draftData;
            setFormData(formDataToRecover);
            if (servicios) setServiciosSeleccionados(servicios);
            setSuccess('Borrador recuperado exitosamente.');
            setTimeout(() => setSuccess(''), 3000);
          } else {
            localStorage.removeItem('draft_cancha');
          }
        } else {
          // Borrador muy antiguo, eliminarlo
          localStorage.removeItem('draft_cancha');
        }
      } catch (err) {
        console.error('Error al recuperar borrador:', err);
        localStorage.removeItem('draft_cancha');
      }
    }
  }, [searchParams]);

  // 🎯 MEJORA #1: Validación de nombre duplicado con debounce
  const checkNombreDisponibilidad = useCallback(async (nombre: string, complejoId: number) => {
    if (!nombre || nombre.length < 3 || complejoId === 0) {
      console.log('🔍 [Validación] Ignorando validación:', { nombre, complejoId });
      setNombreDisponible(null);
      return;
    }

    console.log('🔍 [Validación] Iniciando validación:', { nombre, complejoId });
    setIsCheckingName(true);
    
    try {
      const canchas = await canchaService.getCanchasAdmin({
        id_complejo: complejoId,
        q: nombre,
        incluir_inactivas: true
      });

      console.log('🔍 [Validación] Canchas encontradas:', canchas);
      console.log('🔍 [Validación] Items:', canchas.items);

      // Verificar si existe una cancha con el mismo nombre exacto
      const existe = canchas.items?.some(
        (c: any) => {
          const match = c.nombre.toLowerCase().trim() === nombre.toLowerCase().trim();
          console.log(`🔍 [Validación] Comparando "${c.nombre}" con "${nombre}": ${match}`);
          return match;
        }
      );
      
      console.log('🔍 [Validación] ¿Existe duplicado?:', existe);
      setNombreDisponible(!existe);
    } catch (err) {
      console.error('❌ [Validación] Error al verificar nombre:', err);
      setNombreDisponible(null);
    } finally {
      setIsCheckingName(false);
    }
  }, []);

  // Validar nombre con debounce
  useEffect(() => {
    if (checkNameTimeoutRef.current) {
      clearTimeout(checkNameTimeoutRef.current);
    }

    if (formData.nombre && formData.establecimientoId > 0) {
      checkNameTimeoutRef.current = setTimeout(() => {
        checkNombreDisponibilidad(formData.nombre, formData.establecimientoId);
      }, 800); // Esperar 800ms después de que el usuario deja de escribir
    }

    return () => {
      if (checkNameTimeoutRef.current) {
        clearTimeout(checkNameTimeoutRef.current);
      }
    };
  }, [formData.nombre, formData.establecimientoId, checkNombreDisponibilidad]);

  // 🎯 MEJORA #7: Actualizar validación visual de campos
  useEffect(() => {
    setCamposValidos({
      nombre: formData.nombre.length >= 3 && nombreDisponible !== false,
      tipo: true, // Siempre válido (viene del select)
      establecimientoId: formData.establecimientoId > 0,
      precioPorHora: formData.precioPorHora > 0,
      capacidad: formData.capacidad >= 2,
    });
  }, [formData, nombreDisponible]);

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? Number(value) : value
    }));
  };

  // 🎯 MEJORA #10: Aplicar plantilla de descripción
  const aplicarPlantilla = (plantilla: string) => {
    setFormData(prev => ({ ...prev, descripcion: plantilla }));
    setSuccess('Plantilla aplicada. Puedes modificarla si lo deseas.');
    setTimeout(() => setSuccess(''), 3000);
  };

  // 🎯 MEJORA #11: Toggle servicios
  const toggleServicio = (servicioId: string) => {
    setServiciosSeleccionados(prev => {
      if (prev.includes(servicioId)) {
        return prev.filter(s => s !== servicioId);
      } else {
        return [...prev, servicioId];
      }
    });
  };

  // 🎯 MEJORA #12: Actualizar estado según valor del toggle activa
  useEffect(() => {
    setEstadoCancha(formData.activa ? 'disponible' : 'inactiva');
  }, [formData.activa]);

  // 🎯 MEJORA #8: Mostrar modal de confirmación con VALIDACIONES COMPLETAS
  const prepararConfirmacion = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Limpiar errores previos
    
    // ✅ VALIDACIÓN 1: Nombre (mínimo 3 caracteres)
    if (!formData.nombre.trim()) {
      setError('❌ El nombre de la cancha es requerido');
      return;
    }
    
    if (formData.nombre.trim().length < 3) {
      setError('❌ El nombre debe tener al menos 3 caracteres');
      return;
    }

    // ✅ VALIDACIÓN 2: Complejo seleccionado
    if (formData.establecimientoId === 0) {
      setError('❌ Debes seleccionar un complejo deportivo');
      return;
    }

    // ✅ VALIDACIÓN 3: Nombre único
    if (nombreDisponible === false) {
      setError('❌ Ya existe una cancha con este nombre en el complejo seleccionado');
      return;
    }

    // ⚠️ VALIDACIONES REMOVIDAS para campos no soportados
    // (precioPorHora, capacidad no se envían al backend por limitación actual)

    // ✅ Todas las validaciones pasaron
    setMostrarConfirmacion(true);
  };

  // Manejar envío del formulario (ejecutar después de confirmación)
  const handleSubmit = async () => {
    setMostrarConfirmacion(false); // Cerrar modal
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('📤 Enviando datos para crear cancha:', formData);
      
      // ✅ VALIDACIONES DE SEGURIDAD (por si pasan el modal)
      if (!formData.nombre.trim() || formData.nombre.trim().length < 3) {
        throw new Error('El nombre de la cancha es requerido (mínimo 3 caracteres)');
      }

      if (!formData.establecimientoId || formData.establecimientoId === 0) {
        throw new Error('Debes seleccionar un complejo deportivo válido');
      }

      // ⚠️ VALIDACIONES REMOVIDAS para campos no soportados
      // (precioPorHora, capacidad, descripcion no se envían al backend por limitación actual)
      // El adaptCanchaToBackend solo envía: id_complejo, nombre, deporte, cubierta

      // ✅ ACTUALIZADO: Usar método del servicio que usa el endpoint correcto POST /api/canchas
      console.log('📤 Creando cancha con datos:', formData);

      // 🎯 MEJORA #11: Agregar servicios seleccionados a la descripción
      let descripcionFinal = formData.descripcion.trim();
      if (serviciosSeleccionados.length > 0) {
        const serviciosTexto = serviciosSeleccionados
          .map(id => SERVICIOS_DISPONIBLES.find(s => s.id === id)?.label || '')
          .filter(Boolean)
          .join(', ');
        
        if (descripcionFinal) {
          descripcionFinal += `\n\n✨ Servicios incluidos: ${serviciosTexto}`;
        } else {
          descripcionFinal = `✨ Servicios incluidos: ${serviciosTexto}`;
        }
      }

      const nuevaCancha = await canchaService.createCancha({
        nombre: formData.nombre.trim(),
        tipo: formData.tipo as any, // El tipo se valida en el servicio
        techada: formData.techada,
        establecimientoId: formData.establecimientoId,
        precioPorHora: formData.precioPorHora,
        capacidad: formData.capacidad,
        descripcion: descripcionFinal || undefined,
        activa: estadoCancha === 'disponible' // 🎯 MEJORA #12: Usar estado calculado
      });

      // 🎯 MEJORA #2: Limpiar borrador después de creación exitosa
      localStorage.removeItem('draft_cancha');

      console.log('✅ Cancha creada exitosamente:', nuevaCancha);
      
      setSuccess('Cancha creada exitosamente');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/admin/canchas');
      }, 2000);

    } catch (err: any) {
      console.error('❌ Error al crear cancha:', err);
      
      // 🔥 Mensajes de error mejorados según el código de estado
      if (err.response?.status === 403) {
        const errorMsg = err.response?.data?.message || err.response?.data?.error || '';
        if (errorMsg.toLowerCase().includes('complejo') || errorMsg.toLowerCase().includes('propiedad') || errorMsg.toLowerCase().includes('dueño')) {
          setError('❌ Este complejo no te pertenece. Solo puedes crear canchas en complejos que sean de tu propiedad.');
        } else {
          setError('❌ No tienes permisos para crear una cancha en este complejo. Verifica que sea uno de tus complejos.');
        }
      } else if (err.response?.status === 404) {
        setError('❌ El complejo seleccionado no existe. Por favor, selecciona un complejo válido.');
      } else if (err.response?.status === 400) {
        const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
        setError(`❌ Datos inválidos: ${errorMsg}`);
      } else {
        setError(err.message || 'Error al crear la cancha. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/canchas');
  };

  return (
    <div className="admin-page-layout">
      {/* Header */}
      <div className="admin-main-header">
        <div className="admin-header-nav">
          <button onClick={handleCancel} className="btn-volver">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="admin-page-title">Crear Nueva Cancha</h1>
        </div>
        
        <div className="admin-header-buttons">
          <button 
            type="submit" 
            form="create-cancha-form"
            className="btn-guardar" 
            disabled={isLoading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {isLoading ? 'Creando...' : 'Crear Cancha'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-container">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="success-container">
          <p><strong>Éxito:</strong> {success}</p>
        </div>
      )}

      {/* Formulario Principal */}
      <div className="edit-court-container">
        <form id="create-cancha-form" onSubmit={prepararConfirmacion} className="edit-court-card">
          {/* Información Básica */}
          <div className="edit-section">
            <h3 className="edit-section-title">Información Básica</h3>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label htmlFor="nombre" className="edit-form-label">
                  Nombre: <span style={{ color: '#ef4444' }}>*</span>
                  {isCheckingName && <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>⏳ Verificando...</span>}
                  {!isCheckingName && nombreDisponible === true && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#10b981' }}>✓ Disponible</span>
                  )}
                  {!isCheckingName && nombreDisponible === false && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#ef4444' }}>✗ Ya existe</span>
                  )}
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="edit-form-input"
                  placeholder="Mínimo 3 caracteres"
                  required
                  minLength={3}
                  disabled={isLoading}
                  style={{
                    borderColor: nombreDisponible === false ? '#ef4444' : nombreDisponible === true ? '#10b981' : undefined
                  }}
                />
                <small style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '0.25rem' }}>
                  Campo obligatorio - Mínimo 3 caracteres
                </small>
              </div>
              
              <div className="edit-form-group">
                <label htmlFor="tipo" className="edit-form-label">Tipo de Cancha: *</label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="edit-form-select"
                  required
                  disabled={isLoading}
                >
                  {TIPOS_CANCHA.map(tipo => (
                    <option key={tipo} value={tipo}>
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="edit-form-group">
                <label htmlFor="establecimientoId" className="edit-form-label">
                  Complejo Deportivo: <span style={{ color: '#ef4444' }}>*</span>
                  {complejos.length === 1 && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#10b981', fontWeight: 'normal' }}>
                      ✓ Seleccionado automáticamente
                    </span>
                  )}
                </label>
                {isLoadingComplejos ? (
                  <div className="edit-form-input" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span>Cargando tus complejos...</span>
                  </div>
                ) : complejos.length === 0 ? (
                  <div>
                    <input
                      type="number"
                      id="establecimientoId"
                      name="establecimientoId"
                      value={formData.establecimientoId || ''}
                      onChange={handleChange}
                      className="edit-form-input"
                      min="1"
                      placeholder="Ingresa el ID de tu complejo (ej: 4)"
                      required
                      disabled={isLoading}
                    />
                    <small style={{ color: '#ef4444', fontSize: '0.85rem', display: 'block', marginTop: '0.5rem', lineHeight: '1.4' }}>
                      ⚠️ No se encontraron complejos asociados a tu cuenta. Por favor ingresa el ID manualmente.
                    </small>
                  </div>
                ) : (
                  <div>
                    <select
                      id="establecimientoId"
                      name="establecimientoId"
                      value={formData.establecimientoId}
                      onChange={handleChange}
                      className="edit-form-select"
                      required
                      disabled={isLoading || complejos.length === 1}
                    >
                      <option value={0} disabled>⬇️ Selecciona tu complejo deportivo</option>
                      {complejos.map((complejo, index) => (
                        <option key={complejo.id || `complejo-${index}`} value={complejo.id || 0}>
                          {complejo.nombre || 'Sin nombre'} {complejo.comuna ? `- ${complejo.comuna}` : ''} (ID: {complejo.id})
                        </option>
                      ))}
                    </select>
                    {complejos.length > 1 && (
                      <small style={{ color: '#6b7280', fontSize: '0.85rem', display: 'block', marginTop: '0.5rem' }}>
                        Mostrando tus {complejos.length} complejos
                      </small>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Configuración de Precios y Capacidad */}
          <div className="edit-section">
            <h3 className="edit-section-title">Configuración de Precios y Capacidad</h3>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label htmlFor="precioPorHora" className="edit-form-label">
                  Precio por Hora (CLP): <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  id="precioPorHora"
                  name="precioPorHora"
                  value={formData.precioPorHora || ''}
                  onChange={handleChange}
                  onFocus={(e) => {
                    if (e.target.value === '0') {
                      setFormData(prev => ({ ...prev, precioPorHora: 0 }));
                      e.target.select();
                    }
                  }}
                  className="edit-form-input"
                  min="1000"
                  step="1000"
                  placeholder="Mínimo $1.000 (Ej: 15000)"
                  required
                  disabled={isLoading}
                />
                <small style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '0.25rem' }}>
                  Campo obligatorio - Mínimo $1.000 CLP
                </small>
              </div>

              <div className="edit-form-group">
                <label htmlFor="capacidad" className="edit-form-label">
                  Capacidad de Jugadores: <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  id="capacidad"
                  name="capacidad"
                  value={formData.capacidad}
                  onChange={handleChange}
                  className="edit-form-input"
                  min="2"
                  max="50"
                  placeholder="Entre 2 y 50 personas"
                  required
                  disabled={isLoading}
                />
                <small style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '0.25rem' }}>
                  Campo obligatorio - Entre 2 y 50 personas
                </small>
              </div>
            </div>
          </div>

          {/* Características */}
          <div className="edit-section">
            <h3 className="edit-section-title">Características</h3>
            <div className="edit-form-grid">
              {/* Cancha Techada/Cubierta como select */}
              <div className="edit-form-group">
                <label htmlFor="techada" className="edit-form-label">Cancha Techada/Cubierta:</label>
                <select
                  id="techada"
                  name="techada"
                  value={formData.techada ? 'si' : 'no'}
                  onChange={(e) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      techada: e.target.value === 'si' 
                    }));
                  }}
                  className="edit-form-input"
                  disabled={isLoading}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="no">🌤️ No (al aire libre)</option>
                  <option value="si">🏠 Sí (techada/cubierta)</option>
                </select>
                <small style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '0.25rem' }}>
                  Indica si la cancha tiene techo o está cubierta
                </small>
              </div>

              {/* 🎯 MEJORA #12: Estado de la cancha */}
              <div className="edit-form-group">
                <label htmlFor="estadoCancha" className="edit-form-label">Estado Inicial:</label>
                <select
                  id="estadoCancha"
                  value={estadoCancha}
                  onChange={(e) => {
                    const nuevoEstado = e.target.value as 'disponible' | 'mantenimiento' | 'inactiva';
                    setEstadoCancha(nuevoEstado);
                    setFormData(prev => ({ 
                      ...prev, 
                      activa: nuevoEstado === 'disponible' 
                    }));
                  }}
                  className="edit-form-input"
                  disabled={isLoading}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="disponible">🟢 Disponible (activa)</option>
                  <option value="inactiva">🔴 Inactiva (no visible)</option>
                </select>
                <small style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '0.25rem' }}>
                  Solo canchas disponibles aparecerán en búsquedas públicas
                </small>
              </div>
            </div>
          </div>

          {/* Descripción - NO DISPONIBLE ACTUALMENTE */}
          <div className="edit-section" style={{ opacity: 0.6, position: 'relative' }}>
            <div style={{ 
              position: 'absolute', 
              top: '10px', 
              right: '10px', 
              backgroundColor: '#fbbf24', 
              color: '#78350f', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '6px', 
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              ⚠️ No disponible actualmente
            </div>
            <h3 className="edit-section-title">Descripción</h3>
            
            {/* 🎯 MEJORA #10: Plantillas de descripción */}
            {false && PLANTILLAS_DESCRIPCION[formData.tipo] && PLANTILLAS_DESCRIPCION[formData.tipo].length > 0 && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                  💡 Plantillas sugeridas para {formData.tipo.charAt(0).toUpperCase() + formData.tipo.slice(1).replace('_', ' ')}:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {PLANTILLAS_DESCRIPCION[formData.tipo].map((plantilla, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => aplicarPlantilla(plantilla)}
                      disabled={isLoading}
                      style={{
                        textAlign: 'left',
                        padding: '0.75rem',
                        fontSize: '0.875rem',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        backgroundColor: 'white',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        opacity: isLoading ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                          e.currentTarget.style.borderColor = '#9ca3af';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#d1d5db';
                      }}
                    >
                      <strong style={{ color: '#1f2937', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>
                        Plantilla {idx + 1}
                      </strong>
                      <span style={{ color: '#6b7280', fontSize: '0.8125rem' }}>
                        {plantilla.length > 100 ? plantilla.substring(0, 100) + '...' : plantilla}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="edit-form-group">
              <label htmlFor="descripcion" className="edit-form-label">Descripción (Opcional):</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                disabled={true}
                rows={4}
                className="edit-form-input"
                placeholder="⚠️ El backend aún no soporta este campo. Próximamente disponible."
                style={{ minHeight: '100px', resize: 'vertical', cursor: 'not-allowed', backgroundColor: '#f3f4f6' }}
              />
              <small style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'block', marginTop: '0.25rem', fontWeight: '600' }}>
                ⚠️ Campo no disponible - El endpoint actual no acepta descripciones
              </small>
            </div>
          </div>

          {/* 🎯 MEJORA #11: Servicios y Equipamiento - NO DISPONIBLE */}
          <div className="edit-section" style={{ opacity: 0.6, position: 'relative' }}>
            <div style={{ 
              position: 'absolute', 
              top: '10px', 
              right: '10px', 
              backgroundColor: '#fbbf24', 
              color: '#78350f', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '6px', 
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              ⚠️ Próximamente
            </div>
            <h3 className="edit-section-title">✨ Servicios y Equipamiento</h3>
            <p style={{ fontSize: '0.875rem', color: '#f59e0b', marginBottom: '1rem', fontWeight: '600' }}>
              ⚠️ Esta funcionalidad estará disponible cuando el backend implemente el campo de descripciones extendidas
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
              gap: '0.75rem' 
            }}>
              {SERVICIOS_DISPONIBLES.map(servicio => (
                <label 
                  key={servicio.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '2px solid',
                    borderColor: serviciosSeleccionados.includes(servicio.id) ? '#3b82f6' : '#e5e7eb',
                    backgroundColor: serviciosSeleccionados.includes(servicio.id) ? '#eff6ff' : 'white',
                    transition: 'all 0.2s',
                    opacity: isLoading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && !serviciosSeleccionados.includes(servicio.id)) {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!serviciosSeleccionados.includes(servicio.id)) {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={serviciosSeleccionados.includes(servicio.id)}
                    onChange={() => toggleServicio(servicio.id)}
                    disabled={true}
                    style={{ 
                      marginRight: '0.75rem',
                      width: '18px',
                      height: '18px',
                      cursor: 'not-allowed'
                    }}
                  />
                  <span style={{ 
                    fontSize: '0.9375rem',
                    fontWeight: '400',
                    color: '#9ca3af'
                  }}>
                    {servicio.label}
                  </span>
                </label>
              ))}
            </div>
            {false && serviciosSeleccionados.length > 0 && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.75rem', 
                backgroundColor: '#f0f9ff', 
                borderRadius: '6px',
                border: '1px solid #bfdbfe'
              }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e40af' }}>
                  ✓ {serviciosSeleccionados.length} servicio{serviciosSeleccionados.length !== 1 ? 's' : ''} seleccionado{serviciosSeleccionados.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* 🎯 MEJORA #8: Modal de Confirmación */}
      {mostrarConfirmacion && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
              ✅ Confirmar Creación de Cancha
            </h2>
            
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong>Nombre:</strong> {formData.nombre}
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong>Tipo:</strong> {formData.tipo.charAt(0).toUpperCase() + formData.tipo.slice(1).replace('_', ' ')}
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong>Complejo:</strong> {complejos.find(c => c.id === formData.establecimientoId)?.nombre || 'ID: ' + formData.establecimientoId}
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong>Precio por hora:</strong> ${formData.precioPorHora.toLocaleString('es-CL')}
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong>Capacidad:</strong> {formData.capacidad} personas
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong>Techada:</strong> {formData.techada ? 'Sí ✓' : 'No ✗'}
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong>Estado:</strong> {estadoCancha === 'disponible' ? '🟢 Disponible' : '🔴 Inactiva'}
              </div>
              {serviciosSeleccionados.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Servicios:</strong>
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {serviciosSeleccionados.map(id => {
                      const servicio = SERVICIOS_DISPONIBLES.find(s => s.id === id);
                      return servicio ? (
                        <span key={id} style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: '#e0e7ff',
                          borderRadius: '9999px',
                          fontSize: '0.875rem'
                        }}>
                          {servicio.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              {formData.descripcion && (
                <div>
                  <strong>Descripción:</strong>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    {formData.descripcion.length > 200 
                      ? formData.descripcion.substring(0, 200) + '...' 
                      : formData.descripcion}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setMostrarConfirmacion(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                ← Volver a editar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? '⏳ Creando...' : '✅ Confirmar y Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}