'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import Sidebar from '../../../components/layout/Sidebar'

export default function ReservaCancha() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(8)
  const [selectedTime, setSelectedTime] = useState('10:00')
  const [currentMonth, setCurrentMonth] = useState('Junio 2025')
  const [selectedPayment, setSelectedPayment] = useState('tarjeta')
  const [formData, setFormData] = useState({
    nombre: 'Juan Perez',
    telefono: '+56 9 6969 6969',
    email: 'juanperez@gmail.com',
    jugadores: 10,
    notas: ''
  })

  const handleGoBack = () => {
    router.back()
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

  const calendar = [
    [26, 27, 28, 29, 30, 1, 2],
    [3, 4, 5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14, 15, 16],
    [17, 18, 19, 20, 21, 22, 23],
    [24, 25, 26, 27, 28, 29, 30]
  ]

  return (
    <div className={styles.container}>
      {/* Sidebar Component */}
      <Sidebar />
      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <button className={styles.backButton} onClick={handleGoBack}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span style={{marginLeft: '8px'}}>Volver</span>
              </button>
              <div className={styles.headerTitle}>
                <h1>Reservar • cancha basquetbol</h1>
                <p>Selecciona fecha, horario y completa tus datos</p>
              </div>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.clubInfo}>
                <div className={styles.clubName}>Club Centro</div>
                <div className={styles.clubAddress}>Dirección: Av. Principal 123</div>
              </div>
              <div className={styles.userInfo}>
                <div className={styles.avatar}></div>
                <span>Usuario</span>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{marginLeft: '8px'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
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
                    <button className={styles.calendarNav}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h3 className={styles.monthTitle}>{currentMonth}</h3>
                    <button className={styles.calendarNav}>
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
                    {calendar.flat().map((date, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(date)}
                        className={`${styles.dayButton} ${
                          date === selectedDate ? styles.selected : 
                          date < 1 || date > 30 ? styles.inactive : ''
                        }`}
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date and Time Info */}
                <div className={styles.dateInfo}>
                  <div className={styles.dateDetails}>
                    <div>Fecha: <span className={styles.dateLabel}>08 Jun 2025</span></div>
                    <div>Día: <span className={styles.dateLabel}>Domingo</span></div>
                    <div className={styles.timeLabel}>Selecciona un horario</div>
                  </div>
                  <div className={styles.durationInfo}>
                    <div className={styles.durationLabel}>Duración estimada</div>
                    <div className={styles.durationValue}>1 hora</div>
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
                  <div className={styles.courtName}>basquetbol - club centro</div>
                  <div className={styles.courtAddress}>Av. Principal 123</div>
                </div>
              </div>
              
              <div className={styles.reservationDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Cancha</span>
                  <span className={styles.detailValue}>Basquetbol • Club Centro</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Fecha:</span>
                  <span className={styles.detailValue}>08 Junio 2025</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Horario:</span>
                  <span className={styles.detailValue}>10:00 - 11:00</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Duración:</span>
                  <span className={styles.detailValue}>1 hora</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Jugadores:</span>
                  <span className={styles.detailValue}>10</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Precio | h:</span>
                  <span className={styles.detailValue}>$30</span>
                </div>
                <hr className={styles.divider} />
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Subtotal:</span>
                  <span className={styles.detailValue}>$0</span>
                </div>
                <div className={`${styles.detailRow} ${styles.totalRow}`}>
                  <span className={styles.detailLabel}>Total estimado:</span>
                  <span className={styles.detailValue}>$0</span>
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