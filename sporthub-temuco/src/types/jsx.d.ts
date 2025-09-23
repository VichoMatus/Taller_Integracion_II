// JSX namespace declarations - Solo si necesitamos elementos personalizados
// Next.js ya maneja JSX por defecto

declare global {
  namespace JSX {
    // Elementos personalizados si los necesitamos en el futuro
    // interface IntrinsicElements {
    //   'custom-element': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    // }
  }
}
