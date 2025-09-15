# Footer Component

Componente reutilizable que entrega un pie de página consistente para todo el sitio. Permite dos variantes (`full` y `minimal`) y es totalmente configurable vía props.

## Importación
```tsx
import Footer from '@/components/layout/Footer';
```

## API de Props
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'full' | 'minimal'` | `full` | Controla la presentación completa o compacta. |
| `version` | `string` | `'1.0.0'` | Versión mostrada en la banda inferior. |
| `supportHref` | `string` | `'#'` | URL de enlace a soporte. |
| `className` | `string` | `''` | Clases Tailwind adicionales al `<footer>`. |
| `sections` | `FooterSection[]` | `defaultSections` | Bloques de columnas (título + links). |
| `social` | `SocialLink[]` | `defaultSocial` | Íconos/redes sociales. |
| `showLegal` | `boolean` | `true` | Controla visibilidad de enlaces legales. |
| `year` | `number` | `new Date().getFullYear()` | Permite fijar año (útil en tests). |
| `legalLinks` | `FooterLink[]` | `defaultLegal` | Enlaces legales en la banda inferior. |

### Tipos auxiliares
```ts
interface FooterLink { label: string; href: string }
interface FooterSection { title: string; links: FooterLink[] }
interface SocialLink { label: string; href: string; icon: React.ReactNode }
```

## Ejemplos
### 1. Variante completa (por defecto)
```tsx
<Footer />
```

### 2. Variante minimal (páginas internas muy simples)
```tsx
<Footer variant="minimal" version="1.2.0" supportHref="/soporte" />
```

### 3. Personalizando secciones y redes
```tsx
<Footer
  version="2.0.0"
  supportHref="/contacto"
  sections=[
    { title: 'Recursos', links: [ { label: 'Blog', href: '/blog' }, { label: 'Guías', href: '/guias' } ] },
    { title: 'Comunidad', links: [ { label: 'Foro', href: '/foro' }, { label: 'Eventos', href: '/eventos' } ] }
  ]
  social=[
    { label: 'GitHub', href: 'https://github.com/org', icon: <GitHubIcon /> },
    { label: 'LinkedIn', href: 'https://linkedin.com/company/org', icon: <LinkedInIcon /> }
  ]
  legalLinks=[
    { label: 'Términos', href: '/terminos' },
    { label: 'Privacidad', href: '/privacidad' },
    { label: 'Cookies', href: '/cookies' }
  ]
/>
```

### 4. Deshabilitar legales
```tsx
<Footer showLegal={false} />
```

### 5. Override de año para pruebas
```tsx
<Footer year={2030} />
```

## Accesibilidad
- El elemento raíz utiliza `role="contentinfo"`.
- Íconos sociales llevan `aria-label`.
- Separadores visuales usan `aria-hidden="true"`.
- Estructura semántica simple y adaptable a i18n.

## Buenas prácticas recomendadas
1. Centralizar contenido dinámico (secciones, social, legal) en un módulo de configuración o en i18n.
2. Evitar hardcodear URLs internas repetidas en varios lugares; reutilizar un archivo `links.ts`.
3. Añadir test de snapshot para cada variante (`full` y `minimal`).
4. Si se internacionaliza, envolver el componente en un provider que inyecte traducciones.
5. Mantener consistencia de iconografía (usar un set unificado o lucide/heroicons).

## Roadmap opcional
- Soporte para dark mode (clases `dark:`).
- Hook para registrar automáticamente la versión desde `package.json`.
- Split de `Footer` en sub-componentes (`Footer.Section`, `Footer.Social`) si el número de props crece.

## Troubleshooting
| Problema | Causa Probable | Solución |
|----------|----------------|----------|
| No se muestran secciones | `sections` vacío o sobrescrito | Verificar prop y estructura `[{ title, links: [] }]` |
| Íconos sin color correcto | Falta clase tailwind | Asegurar `text-gray-400 hover:text-*` en el enlace |
| Año incorrecto | `year` sobreescrito manualmente | Remover prop `year` para usar año actual |

## Ejemplo rápido con import dinámico (Next.js)
```tsx
const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: true });

export default function Page() {
  return (
    <>
      <main>...</main>
      <Footer />
    </>
  );
}
```

---
Si necesitas ampliarlo con theming, tests o i18n indícalo y se agrega una iteración adicional.
