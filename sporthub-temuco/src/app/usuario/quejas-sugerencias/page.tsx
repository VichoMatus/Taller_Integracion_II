'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../components/layout/Sidebar';
import SearchBar from '../../../components/SearchBar';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { denunciasService } from '@/services/denunciasServices';
import { Denuncia, TipoObjeto } from '@/types/denuncias';
import styles from './page.module.css';

// 💬 TIPOS DE MENSAJE
const tiposMensaje = [
  { id: 'queja', label: 'Queja', icon: '😠', color: '#ef4444' },
  { id: 'sugerencia', label: 'Sugerencia', icon: '💡', color: '#3b82f6' },
  { id: 'consulta', label: 'Consulta', icon: '❓', color: '#f59e0b' },
  { id: 'problema_tecnico', label: 'Problema Técnico', icon: '🔧', color: '#8b5cf6' },
  { id: 'otro', label: 'Otro', icon: '📝', color: '#6b7280' }
];

// 💬 CATEGORÍAS DE DESTINO
const categorias = [
  { id: 'general', label: 'Administración General', description: 'Para temas generales de la plataforma' },
  { id: 'reservas', label: 'Sistema de Reservas', description: 'Problemas con reservas, cancelaciones, etc.' },
  { id: 'pagos', label: 'Pagos y Facturación', description: 'Consultas sobre pagos, reembolsos, facturas' },
  { id: 'canchas', label: 'Canchas y Complejos', description: 'Problemas específicos con instalaciones' },
  { id: 'app', label: 'Aplicación/Sitio Web', description: 'Errores técnicos, bugs, mejoras de UX' }
];

export default function QuejasSugerenciasPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, buttonProps } = useAuthStatus();
  
  // 💬 ESTADOS DEL FORMULARIO
  const [formData, setFormData] = useState({
    tipo: '',
    categoria: '',
    asunto: '',
    mensaje: '',
    telefono: '',
    urgencia: 'media'
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [misDenuncias, setMisDenuncias] = useState<Denuncia[]>([]);
  const [loadingDenuncias, setLoadingDenuncias] = useState(false);

  // 💬 CARGAR DENUNCIAS DEL USUARIO
  useEffect(() => {
    if (isAuthenticated) {
      loadMisDenuncias();
    }
  }, [isAuthenticated]);

  const loadMisDenuncias = async () => {
    try {
      setLoadingDenuncias(true);
      const data = await denunciasService.listarMias();
      setMisDenuncias(data);
    } catch (error) {
      console.error('Error cargando denuncias:', error);
    } finally {
      setLoadingDenuncias(false);
    }
  };

  // 💬 HANDLERS
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTipoSelect = (tipoId: string) => {
    setFormData(prev => ({
      ...prev,
      tipo: tipoId
    }));
  };

  const handleCategoriaSelect = (categoriaId: string) => {
    setFormData(prev => ({
      ...prev,
      categoria: categoriaId
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.tipo || !formData.categoria || !formData.asunto || !formData.mensaje) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Mapear datos del usuario al schema del backend
      // Para quejas/sugerencias generales, usamos tipo_objeto="usuario" y el id del usuario actual
      const userId = user?.id_usuario || 1; // Fallback temporal
      
      await denunciasService.crear({
        tipo_objeto: 'usuario' as TipoObjeto, // Las quejas generales se asocian al usuario
        id_objeto: userId,
        titulo: `[${formData.tipo}] ${formData.asunto}`,
        descripcion: `Categoría: ${formData.categoria}\n\n${formData.mensaje}`
      });

      setShowSuccess(true);
      
      // Reset form
      setFormData({
        tipo: '',
        categoria: '',
        asunto: '',
        mensaje: '',
        telefono: '',
        urgencia: 'media'
      });
      
      // Recargar lista de denuncias
      await loadMisDenuncias();
      
      // Ocultar mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } catch (error: any) {
      console.error('Error al enviar denuncia:', error);
      alert(error.message || 'Hubo un error al enviar tu mensaje. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserButtonClick = () => {
    if (!buttonProps.disabled) {
      router.push(buttonProps.href);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    console.log('Buscando:', searchTerm);
  };

  const selectedTipo = tiposMensaje.find(t => t.id === formData.tipo);
  const selectedCategoria = categorias.find(c => c.id === formData.categoria);

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>💬</div>
            <div>
              <h1 className={styles.headerTitle}>Quejas y Sugerencias</h1>
              <p className={styles.headerSubtitle}>
                {isAuthenticated && user ? `¡Hola ${user.nombre || user.email}!` : 'Usuario'} 
                {' '}Nos importa tu opinión
              </p>
            </div>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Buscar en el formulario..."
              sport="padel"
            />
            <button 
              className={styles.userButton}
              onClick={handleUserButtonClick}
              disabled={buttonProps.disabled}
            >
              <span>👤</span>
              <span>{buttonProps.text}</span>
            </button>
          </div>
        </div>

        {/* 💬 MENSAJE DE ÉXITO */}
        {showSuccess && (
          <div className={styles.successMessage}>
            <div className={styles.successContent}>
              <span className={styles.successIcon}>✅</span>
              <div>
                <h3>¡Mensaje enviado con éxito!</h3>
                <p>Hemos recibido tu {selectedTipo?.label.toLowerCase()} y te responderemos pronto.</p>
              </div>
              <button 
                className={styles.successClose}
                onClick={() => setShowSuccess(false)}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <button 
            className={styles.breadcrumbButton}
            onClick={() => router.push('/sports')}
          >
            <span>←</span>
            <span>Volver al inicio</span>
          </button>
        </div>

        {/* 💬 INFORMACIÓN INTRODUCTORIA */}
        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h2 className={styles.infoTitle}>¿Cómo podemos ayudarte?</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>😠</span>
                <div>
                  <h4>Quejas</h4>
                  <p>Reporta problemas o situaciones que requieren atención</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>💡</span>
                <div>
                  <h4>Sugerencias</h4>
                  <p>Comparte ideas para mejorar nuestros servicios</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📝</span>
                <div>
                  <h4>Otros</h4>
                  <p>Reconoce el buen servicio o experiencias positivas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 💬 FORMULARIO PRINCIPAL */}
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Enviar Mensaje</h2>
            <p className={styles.formSubtitle}>Completa el formulario y nos pondremos en contacto contigo</p>
          </div>

          {/* Paso 1: Tipo de Mensaje */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.stepNumber}>1</span>
              ¿Qué tipo de mensaje deseas enviar?
            </h3>
            <div className={styles.tipoGrid}>
              {tiposMensaje.map((tipo) => (
                <button
                  key={tipo.id}
                  type="button"
                  className={`${styles.tipoCard} ${formData.tipo === tipo.id ? styles.tipoCardSelected : ''}`}
                  onClick={() => handleTipoSelect(tipo.id)}
                  style={{ '--tipo-color': tipo.color } as React.CSSProperties}
                >
                  <span className={styles.tipoIcon}>{tipo.icon}</span>
                  <span className={styles.tipoLabel}>{tipo.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Paso 2: Categoría */}
          {formData.tipo && (
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.stepNumber}>2</span>
                Selecciona la categoría
              </h3>
              <div className={styles.categoriaGrid}>
                {categorias.map((categoria) => (
                  <button
                    key={categoria.id}
                    type="button"
                    className={`${styles.categoriaCard} ${formData.categoria === categoria.id ? styles.categoriaCardSelected : ''}`}
                    onClick={() => handleCategoriaSelect(categoria.id)}
                  >
                    <h4 className={styles.categoriaTitle}>{categoria.label}</h4>
                    <p className={styles.categoriaDescription}>{categoria.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Paso 3: Detalles del Mensaje */}
          {formData.categoria && (
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.stepNumber}>3</span>
                Completa los detalles
              </h3>
              
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>
                    <span className={styles.fieldRequired}>*</span>
                    Asunto
                  </label>
                  <input
                    type="text"
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleInputChange}
                    className={styles.fieldInput}
                    placeholder="Describe brevemente el tema..."
                    required
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>
                    Teléfono de contacto
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className={styles.fieldInput}
                    placeholder="+56 9 1234 5678"
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>
                    Nivel de urgencia
                  </label>
                  <select
                    name="urgencia"
                    value={formData.urgencia}
                    onChange={handleInputChange}
                    className={styles.fieldSelect}
                  >
                    <option value="baja">🟢 Baja - No es urgente</option>
                    <option value="media">🟡 Media - Requiere atención</option>
                    <option value="alta">🟠 Alta - Urgente</option>
                    <option value="critica">🔴 Crítica - Muy urgente</option>
                  </select>
                </div>
              </div>

              <div className={styles.formField}>
                <label className={styles.fieldLabel}>
                  <span className={styles.fieldRequired}>*</span>
                  Mensaje detallado
                </label>
                <textarea
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleInputChange}
                  className={styles.fieldTextarea}
                  placeholder="Describe detalladamente tu mensaje. Incluye toda la información relevante..."
                  rows={6}
                  required
                />
                <div className={styles.charCount}>
                  {formData.mensaje.length}/1000 caracteres
                </div>
              </div>
            </div>
          )}

          {/* Botón de Envío */}
          {formData.categoria && (
            <div className={styles.submitSection}>
              <div className={styles.submitInfo}>
                <h4 className={styles.submitTitle}>Resumen de tu mensaje</h4>
                <div className={styles.submitSummary}>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Tipo:</span>
                    <span className={styles.summaryValue}>
                      {selectedTipo?.icon} {selectedTipo?.label}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Categoría:</span>
                    <span className={styles.summaryValue}>{selectedCategoria?.label}</span>
                  </div>
                  {formData.asunto && (
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Asunto:</span>
                      <span className={styles.summaryValue}>{formData.asunto}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting || !formData.tipo || !formData.categoria || !formData.asunto || !formData.mensaje}
              >
                {isSubmitting ? (
                  <>
                    <span className={styles.submitSpinner}>⏳</span>
                    Enviando...
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    Enviar Mensaje
                  </>
                )}
              </button>
            </div>
          )}
        </form>

        {/* 💬 INFORMACIÓN DE CONTACTO ADICIONAL */}
        <div className={styles.contactSection}>
          <h3 className={styles.contactTitle}>Otras formas de contacto</h3>
          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <span className={styles.contactIcon}>📧</span>
              <h4>Email directo</h4>
              <p>soporte@sporthub.cl</p>
            </div>
            <div className={styles.contactCard}>
              <span className={styles.contactIcon}>📞</span>
              <h4>Teléfono</h4>
              <p>(45) 555-0123</p>
            </div>
            <div className={styles.contactCard}>
              <span className={styles.contactIcon}>💬</span>
              <h4>WhatsApp</h4>
              <p>+56 9 8765 4321</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}