// Ligero hook de formulario sin dependencias externas.
// Objetivo: Proveer una API consistente que permita migrar luego a react-hook-form reemplazando
// solo la implementación interna.

import { useState, ChangeEvent, FocusEvent } from 'react';

// Tipos para el hook
interface FormOptions<T = Record<string, unknown>> {
  initialValues?: T;
  validate?: (values: T) => Record<string, string>;
  onValidate?: (errors: Record<string, string>) => void;
}

interface FormErrors {
  [key: string]: string;
}

interface FormTouched {
  [key: string]: boolean;
}

export function useSimpleForm<T = Record<string, unknown>>(options: FormOptions<T>) {
  const { initialValues, validate, onValidate } = options;
  const [values, setValues] = useState<T>(initialValues || {} as T);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});

  const runValidation = (nextValues: T = values) => {
    if (typeof validate !== 'function') return true;
    const result = validate(nextValues) || {};
    setErrors(result);
    if (onValidate) onValidate(result);
    return Object.keys(result).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues((prev: T) => {
      const updated = { ...prev, [name]: value };
      runValidation(updated);
      return updated;
    });
    setTouched((prev: FormTouched) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched((prev: FormTouched) => ({ ...prev, [name]: true }));
    runValidation();
  };

  const setValue = (field: string, value: unknown) => {
    setValues((prev: T) => {
      const updated = { ...prev, [field]: value };
      runValidation(updated);
      return updated;
    });
    setTouched((prev: FormTouched) => ({ ...prev, [field]: true }));
  };

  const reset = (next: T = initialValues || {} as T) => {
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
