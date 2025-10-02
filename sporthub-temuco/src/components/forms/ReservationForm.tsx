'use client';

import React, { useState } from 'react';

interface Reservation {
  id?: string;
  user: string;
  court: string;
  date: string;
  time: string;
  status: 'Activo' | 'Inactivo';
}

interface ReservationFormProps {
  reservation?: Reservation;
  onSubmit: (reservation: Reservation) => void;
  onCancel: () => void;
  loading?: boolean;                          // Deshabilita mientras se guarda
  onValidate?: (errors: Record<string,string>) => void; // Hook para inspeccionar errores
}

const ReservationForm: React.FC<ReservationFormProps> = ({ reservation, onSubmit, onCancel, loading = false, onValidate }) => {
  const [formData, setFormData] = useState({
    user: reservation?.user || '',
    court: reservation?.court || '',
    date: reservation?.date || '',
    time: reservation?.time || '',
    status: reservation?.status || 'Activo'
  });
  const [errors, setErrors] = useState({} as Record<string,string>);

  const validate = (data = formData) => {
    const newErrors: Record<string,string> = {};
    if (!data.user.trim()) newErrors.user = 'Usuario obligatorio';
    if (!data.court.trim()) newErrors.court = 'Seleccione una cancha';
    if (!data.date) newErrors.date = 'Fecha obligatoria';
    if (!data.time) newErrors.time = 'Hora obligatoria';
    // Coherencia fecha/hora: no permitir reservar en pasado (simple check local)
    if (data.date && data.time) {
      const dt = new Date(`${data.date}T${data.time}:00`);
      if (!isNaN(dt.getTime()) && dt.getTime() < Date.now()) {
        newErrors.time = 'No puede ser en el pasado';
      }
    }
    if (!['Activo','Inactivo'].includes(data.status)) newErrors.status = 'Estado inválido';
    setErrors(newErrors);
    onValidate && onValidate(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ok = validate();
    if (!ok) {
      // Foco en el primer error (orden: user, court, date, time, status)
      const order = ['user','court','date','time','status'] as const;
      for (const field of order) {
        if (errors[field]) {
          const el = document.getElementById(field) as HTMLInputElement | HTMLSelectElement;
          el && typeof el.focus === 'function' && el.focus();
          break;
        }
      }
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      validate(updated);
      return updated;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {reservation ? 'Editar Reserva' : 'Nueva Reserva'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
            Usuario
          </label>
          <input
            type="text"
            id="user"
            name="user"
            value={formData.user}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${errors.user ? 'border-red-400' : 'border-gray-300'}`}
            placeholder="Nombre del usuario"
            aria-required="true"
            aria-invalid={!!errors.user}
            aria-describedby={errors.user ? 'user-error' : undefined}
            disabled={loading}
          />
          {errors.user && <p id="user-error" className="mt-1 text-xs text-red-600" role="alert">{errors.user}</p>}
        </div>

        <div>
          <label htmlFor="court" className="block text-sm font-medium text-gray-700 mb-1">
            Cancha
          </label>
          <select
            id="court"
            name="court"
            value={formData.court}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${errors.court ? 'border-red-400' : 'border-gray-300'}`}
            aria-required="true"
            aria-invalid={!!errors.court}
            aria-describedby={errors.court ? 'court-error' : undefined}
            disabled={loading}
          >
            <option value="">Seleccionar cancha</option>
            <option value="Cancha Central">Cancha Central</option>
            <option value="Cancha Norte">Cancha Norte</option>
          </select>
          {errors.court && <p id="court-error" className="mt-1 text-xs text-red-600" role="alert">{errors.court}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${errors.date ? 'border-red-400' : 'border-gray-300'}`}
              aria-invalid={!!errors.date}
              aria-describedby={errors.date ? 'date-error' : undefined}
              disabled={loading}
            />
            {errors.date && <p id="date-error" className="mt-1 text-xs text-red-600" role="alert">{errors.date}</p>}
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
              Hora
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${errors.time ? 'border-red-400' : 'border-gray-300'}`}
              aria-invalid={!!errors.time}
              aria-describedby={errors.time ? 'time-error' : undefined}
              disabled={loading}
            />
            {errors.time && <p id="time-error" className="mt-1 text-xs text-red-600" role="alert">{errors.time}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${errors.status ? 'border-red-400' : 'border-gray-300'}`}
            aria-invalid={!!errors.status}
            aria-describedby={errors.status ? 'status-error' : undefined}
            disabled={loading}
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
          {errors.status && <p id="status-error" className="mt-1 text-xs text-red-600" role="alert">{errors.status}</p>}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={
              loading ||
              Object.keys(errors).length > 0 ||
              !formData.user.trim() ||
              !formData.court.trim() ||
              !formData.date ||
              !formData.time ||
              (new Date(`${formData.date}T${formData.time}:00`).getTime() < Date.now())
            }
          >
            {loading ? 'Guardando...' : (reservation ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservationForm;