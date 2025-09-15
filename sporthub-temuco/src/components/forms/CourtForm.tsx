'use client';

import React, { useState } from 'react';

interface Court {
  id?: string;
  name: string;
  status: 'Activo' | 'Inactivo';
}

interface CourtFormProps {
  court?: Court;
  onSubmit: (court: Court) => void;
  onCancel: () => void;
  loading?: boolean;                          // Deshabilita inputs/botón mientras se procesa
  onValidate?: (errors: Record<string,string>) => void; // Hook opcional para inspeccionar errores
}

const CourtForm: React.FC<CourtFormProps> = ({ court, onSubmit, onCancel, loading = false, onValidate }) => {
  const [formData, setFormData] = useState({
    name: court?.name || '',
    status: court?.status || 'Activo'
  });
  const [errors, setErrors] = useState({} as Record<string,string>);

  const validate = (data = formData) => {
    const newErrors: Record<string,string> = {};
    if (!data.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (data.name.trim().length > 80) newErrors.name = 'Máximo 80 caracteres';
    if (!['Activo','Inactivo'].includes(data.status)) newErrors.status = 'Estado inválido';
    setErrors(newErrors);
    onValidate && onValidate(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const ok = validate();
    if (!ok) {
      // Foco en el primer campo inválido sin usar useRef/useEffect
      if (!formData.name.trim()) {
        const el = document.getElementById('name') as any;
        el && typeof el.focus === 'function' && el.focus();
        return;
      }
      if (!['Activo','Inactivo'].includes(formData.status)) {
        const el = document.getElementById('status') as any;
        el && typeof el.focus === 'function' && el.focus();
        return;
      }
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
  setFormData((prev: any) => {
      const updated = { ...prev, [name]: value };
      // Validación en caliente minimal (solo campo modificado)
      validate(updated);
      return updated;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {court ? 'Editar Cancha' : 'Nueva Cancha'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la Cancha
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
            placeholder="Ej: Cancha Central"
            aria-required="true"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            disabled={loading}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-xs text-red-600" role="alert">{errors.name}</p>
          )}
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
          {errors.status && (
            <p id="status-error" className="mt-1 text-xs text-red-600" role="alert">{errors.status}</p>
          )}
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
            disabled={loading || Object.keys(errors).length > 0 || !formData.name.trim() || !['Activo','Inactivo'].includes(formData.status)}
          >
            {loading ? 'Guardando...' : (court ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourtForm;