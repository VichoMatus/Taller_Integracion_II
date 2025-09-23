// JSX namespace declarations
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}
