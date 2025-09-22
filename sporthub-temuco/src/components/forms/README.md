# Forms Components

Formularios simples con validación local ligera y sin dependencias externas. Diseñados para poder migrar luego a `react-hook-form + zod` con cambios mínimos.

## CourtForm
Formulario CRUD para una cancha.

Props:
- court?: { id?: string; name: string; status: 'Activo' | 'Inactivo' }
- onSubmit: (court) => void
- onCancel: () => void
- loading?: boolean
- onValidate?: (errors: Record<string,string>) => void

Validaciones:
- name: obligatorio, máx 80 caracteres.
- status: debe ser 'Activo' o 'Inactivo'.

Ejemplo:
```tsx
<CourtForm
  onSubmit={(data) => saveCourt(data)}
  onCancel={() => setOpen(false)}
  loading={submitting}
  onValidate={(errs) => console.log(errs)}
/>
```

## ReservationForm
Formulario de reserva con coherencia básica fecha/hora.

Props:
- reservation?: { id?: string; user: string; court: string; date: string; time: string; status: 'Activo' | 'Inactivo' }
- onSubmit: (reservation) => void
- onCancel: () => void
- loading?: boolean
- onValidate?: (errors: Record<string,string>) => void

Validaciones:
- user, court: obligatorios.
- date, time: obligatorios.
- date+time no en pasado (comparación local). 
- status válido.

Ejemplo:
```tsx
<ReservationForm
  onSubmit={(data) => saveReservation(data)}
  onCancel={() => setOpen(false)}
  loading={saving}
/>
```

## Error Handling
Cada campo marca:
- `aria-invalid` cuando existe error.
- Mensaje accesible con `role="alert"`.

## Migración futura (Sugerencia)
1. Sustituir estado local por `useForm` de react-hook-form.
2. Trasladar reglas a un schema zod.
3. Reemplazar validate() manual por `resolver`.

## Hook sugerido (pendiente)
`useSimpleForm<T>(initial, validators)` -> devolvería: values, errors, handleChange, validate, setValue.

## Próximos pasos potenciales
- Auto-focus en primer campo con error al enviar.
- Integrar select dinámico de canchas (fetch backend).
- Normalizar status a enum centralizado.
