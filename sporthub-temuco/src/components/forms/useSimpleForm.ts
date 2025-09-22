// Ligero hook de formulario sin dependencias externas.
// Objetivo: Proveer una API consistente que permita migrar luego a react-hook-form reemplazando
// solo la implementación interna.

import { useState } from 'react';

// Versión simplificada compatible con configuración TS laxa actual.
// Evita generics avanzados para prevenir errores de tipo en el entorno.

export function useSimpleForm(options: any) {
  const { initialValues, validate, onValidate } = options;
  const [values, setValues] = useState(initialValues || {});
  const [errors, setErrors] = useState({} as any);
  const [touched, setTouched] = useState({} as any);

  const runValidation = (nextValues: any = values) => {
    if (typeof validate !== 'function') return true;
    const result = validate(nextValues) || {};
    setErrors(result);
    if (onValidate) onValidate(result);
    return Object.keys(result).length === 0;
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setValues((prev: any) => {
      const updated = { ...prev, [name]: value };
      runValidation(updated);
      return updated;
    });
    setTouched((prev: any) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (e: any) => {
    const { name } = e.target;
    setTouched((prev: any) => ({ ...prev, [name]: true }));
    runValidation();
  };

  const setValue = (field: string, value: any) => {
    setValues((prev: any) => {
      const updated = { ...prev, [field]: value };
      runValidation(updated);
      return updated;
    });
    setTouched((prev: any) => ({ ...prev, [field]: true }));
  };

  const reset = (next: any = initialValues || {}) => {
    setValues(next);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setValues,
    reset,
    handleChange,
    handleBlur,
    validate: () => runValidation(values),
    isValid: Object.keys(errors).length === 0,
  } as const;
}
