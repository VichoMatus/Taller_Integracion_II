'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStatus } from '@/hooks/useAuthStatus'
import { deserializeReservationData } from '@/utils/reservationDataHandler'
import type { ReservationData } from '@/utils/reservationDataHandler'
import styles from './page.module.css'
import Sidebar from '../../../components/layout/Sidebar'
import Alert from '../../../components/Alert'
import atletismoCommon from '../atletismo/atletismo.module.css'

export default function ReservaCancha() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading, user } = useAuthStatus()
  
  // 🔥 ESTADO PARA DATOS DE LA CANCHA/COMPLEJO
  const [reservationInfo, setReservationInfo] = useState<ReservationData | null>(null)
  
  // 🔥 ESTADO PARA LA ALERTA
  const [showAlert, setShowAlert] = useState(false)
  
  // 🔥 ESTADOS DEL CALENDARIO DINÁMICO
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  
  const [selectedTime, setSelectedTime] = useState('10:00')
  const [selectedPayment, setSelectedPayment] = useState('tarjeta')
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    jugadores: 10,
    notas: ''
  })

  // 🔥 VERIFICAR AUTENTICACIÓN Y CARGAR DATOS DE RESERVA
  useEffect(() => {
    // Si está cargando, esperar
    if (isLoading) {
      return
    }

    // Si no está autenticado, mostrar alerta y redirigir
    if (!isAuthenticated) {
      setShowAlert(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000) // Redirigir después de 3 segundos
      return
    }

    // 🔥 CARGAR DATOS DE LA RESERVA DESDE URL
    const reservationData = searchParams.get('data')
    if (reservationData) {
      try {
        const decoded = deserializeReservationData(reservationData)
        if (decoded) {
          console.log('✅ Datos de reserva recibidos:', decoded)
          setReservationInfo(decoded)
        }
      } catch (error) {
        console.error('❌ Error deserializando datos de reserva:', error)
      }
    }

    // 🔥 PRELLENAR FORMULARIO CON DATOS DEL USUARIO
    if (user) {
      setFormData(prev => ({
        ...prev,
        nombre: user.nombre ? `${user.nombre} ${user.apellido || ''}`.trim() : prev.nombre,
        email: user.email || prev.email,
        telefono: user.telefono || prev.telefono
      }))
    }
  }, [isAuthenticated, isLoading, user, router, searchParams])

  // 🔥 MOSTRAR LOADING MIENTRAS VERIFICA AUTENTICACIÓN
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          gap: '20px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #4CAF50',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{
            fontSize: '18px',
            fontWeight: '500',
            color: '#333',
            margin: 0
          }}>
            Verificando sesión...
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // 🔥 MOSTRAR ALERTA SI NO ESTÁ AUTENTICADO (antes de redirigir)
  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        {showAlert && (
          <Alert 
            type="warning" 
            message="⚠️ Debes iniciar sesión para hacer una reserva. Serás redirigido..." 
            onClose={() => setShowAlert(false)}
          />
        )}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          gap: '20px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #ff6b35',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{
            fontSize: '18px',
            fontWeight: '500',
            color: '#333',
            margin: 0
          }}>
            Redirigiendo a inicio de sesión...
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  const handleGoBack = () => {
    router.back()
  }

  const handleUserProfile = () => {
    router.push('/usuario/perfil/')
  }

  // 🔥 FUNCIONES PARA EL CALENDARIO DINÁMICO
  const getMonthName = (date: Date) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    // Convertir domingo (0) a 7 para que la semana empiece en lunes
    return firstDay === 0 ? 6 : firstDay - 1
  }

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days: (number | null)[] = []
    
    // Agregar días vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    
    // Agregar días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const isDatePast = (day: number | null) => {
    if (day === null) return true
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return checkDate < today
  }

  const isDateSelected = (day: number | null) => {
    if (day === null || !selectedDate) return false
    return selectedDate.getDate() === day &&
           selectedDate.getMonth() === currentDate.getMonth() &&
           selectedDate.getFullYear() === currentDate.getFullYear()
  }

  const handleDateSelect = (day: number | null) => {
    if (day === null || isDatePast(day)) return
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(newDate)
  }

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const formatSelectedDate = () => {
    if (!selectedDate) return 'No seleccionada'
    const day = String(selectedDate.getDate()).padStart(2, '0')
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return `${day} ${months[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
  }

  const timeSlots = [
    { time: '08:00', status: 'Libre' },
    { time: '09:00', status: 'Libre' },
    { time: '10:00', status: 'Ocupado' },
    { time: '11:00', status: 'Libre' },
    { time: '12:00', status: 'Libre' },
    { time: '13:00', status: 'Ocupado' },
    { time: '14:00', status: 'Libre' },
    { time: '15:00', status: 'Libre' }
  ]

  return (
    <div className={styles.container}>
      {/* Sidebar Component */}
      <Sidebar userRole="usuario" />
      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>📆</div>
            <h1 className={styles.headerTitle}>
              {reservationInfo 
                ? `${reservationInfo.canchaNombre} • ${reservationInfo.complejoNombre}, ${reservationInfo.complejoDireccion}`
                : 'Reserva de Cancha'}
            </h1>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.userButton}
            onClick={handleUserProfile}>
              <span>👤</span>
              <span>{user?.nombre || 'Usuario'}</span>
            </button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.grid}>
            {/* Calendar Section */}
            <div className={styles.calendarSection}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Selecciona fecha y horario</h2>
                
                {/* Calendar */}
                <div>
                  <div className={styles.calendarHeader}>
                    <button 
                      className={styles.calendarNav}
                      onClick={handlePreviousMonth}
                    >
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h3 className={styles.monthTitle}>{getMonthName(currentDate)}</h3>
                    <button 
                      className={styles.calendarNav}
                      onClick={handleNextMonth}
                    >
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className={styles.calendarWeekdays}>
                    {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(day => (
                      <div key={day} className={styles.weekday}>{day}</div>
                    ))}
                  </div>
                  
                  <div className={styles.calendarDays}>
                    {generateCalendarDays().map((day, index) => (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(day)}
                        disabled={day === null || isDatePast(day)}
                        className={`${styles.dayButton} ${
                          isDateSelected(day) ? styles.selected : 
                          day === null || isDatePast(day) ? styles.inactive : ''
                        }`}
                      >
                        {day || ''}
                      </button>
                    ))}
                  </div>
                </div>

                

                {/* Time Slots */}
                <div className={styles.timeSlots}>
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.status === 'Libre' && setSelectedTime(slot.time)}
                      className={`${styles.timeSlot} ${
                        slot.status === 'Libre' 
                          ? `${styles.available} ${selectedTime === slot.time ? styles.selected : ''}`
                          : styles.occupied
                      }`}
                      disabled={slot.status === 'Ocupado'}
                    >
                      <span className={styles.timeValue}>{slot.time}</span>
                      <span className={styles.timeStatus}>{slot.status}</span>
                    </button>
                  ))}
                </div>
                
                <p className={styles.timeNote}>
                  Los horarios en rojo están ocupados, haz click en los libres para seleccionarlos.
                </p>
              </div>

              {/* Form Section */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Datos de reserva</h2>
                <p style={{fontSize: '14px', color: '#6b7280', marginBottom: '24px'}}>
                  Confirmaremos por email y SMS. Los datos se usarán solo para la reserva.
                </p>

                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>👤 Nombre y apellido</label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className={styles.input}
                    />
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>📞 Teléfono</label>
                    <input
                      type="text"
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>📧 Correo Electrónico</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>👥 Cantidad de jugadores</label>
                    <div className={styles.playerCounter}>
                      <button 
                        onClick={() => setFormData({...formData, jugadores: Math.max(1, formData.jugadores - 1)})}
                        className={styles.counterButton}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={formData.jugadores}
                        className={styles.counterInput}
                        readOnly
                      />
                      <button 
                        onClick={() => setFormData({...formData, jugadores: formData.jugadores + 1})}
                        className={styles.counterButton}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div style={{marginTop: '32px'}}>
                  <label className={styles.inputLabel}>💳 Método de pago</label>
                  <div className={styles.paymentMethods}>
                    <button 
                      onClick={() => setSelectedPayment('tarjeta')}
                      className={`${styles.paymentButton} ${selectedPayment === 'tarjeta' ? styles.active : ''}`}
                    >
                      💳 Tarjeta
                    </button>
                    <button 
                      onClick={() => setSelectedPayment('transferencia')}
                      className={`${styles.paymentButton} ${selectedPayment === 'transferencia' ? styles.active : ''}`}
                    >
                      🏦 Transferencia
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div style={{marginTop: '24px'}}>
                  <label className={styles.inputLabel}>📝 Notas para el establecimiento (opcional)</label>
                  <textarea
                    value={formData.notas}
                    onChange={(e) => setFormData({...formData, notas: e.target.value})}
                    className={styles.textarea}
                    placeholder="Ej: Necesitamos balones, preferimos cancha techada, etc."
                  />
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className={styles.card}>
                <h3 className={styles.policyTitle}>Política de cancelación</h3>
                <p className={styles.policyText}>
                  Cancelación gratuita hasta 24 horas antes. Después de ese plazo se aplica cargo del 50%.
                </p>
              </div>
            </div>

            {/* Right Sidebar - Court Info */}
            <div className={styles.courtInfo}>
              <div className={styles.courtImage}>
                <div>
                  <div className={styles.courtImageContent}>⚽</div>
                  <div className={styles.courtName}>
                    {reservationInfo?.canchaNombre || 'Cancha'} - {reservationInfo?.complejoNombre || 'Complejo'}
                  </div>
                  <div className={styles.courtAddress}>
                    {reservationInfo?.complejoDireccion || 'Dirección no disponible'}
                  </div>
                </div>
              </div>
              
              <div className={styles.reservationDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Cancha</span>
                  <span className={styles.detailValue}>
                    {reservationInfo?.canchaNombre || 'Cancha'} • {reservationInfo?.complejoNombre || 'Complejo'}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Fecha:</span>
                  <span className={styles.detailValue}>
                    {formatSelectedDate()}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Horario:</span>
                  <span className={styles.detailValue}>
                    {selectedTime} - {(() => {
                      const [hours, minutes] = selectedTime.split(':').map(Number);
                      const endHour = (hours + 1).toString().padStart(2, '0');
                      return `${endHour}:${minutes.toString().padStart(2, '0')}`;
                    })()}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Duración:</span>
                  <span className={styles.detailValue}>1 hora</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Jugadores:</span>
                  <span className={styles.detailValue}>{formData.jugadores}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Precio | h:</span>
                  <span className={styles.detailValue}>
                    ${reservationInfo?.precioPorHora?.toLocaleString('es-CL') || '25.000'}
                  </span>
                </div>
                <hr className={styles.divider} />
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Subtotal:</span>
                  <span className={styles.detailValue}>
                    ${reservationInfo?.precioPorHora?.toLocaleString('es-CL') || '25.000'}
                  </span>
                </div>
                <div className={`${styles.detailRow} ${styles.totalRow}`}>
                  <span className={styles.detailLabel}>Total estimado:</span>
                  <span className={styles.detailValue}>
                    ${reservationInfo?.precioPorHora?.toLocaleString('es-CL') || '25.000'}
                  </span>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <button className={styles.cancelButton}>
                  ✕ Cancelar
                </button>
                <button className={styles.confirmButton}>
                  ✓ Confirmar reserva
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}