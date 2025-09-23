// Declaración para los tipos de React
declare module 'react' {
  export = React;
  export as namespace React;
  namespace React {
    type ReactNode = React.ReactElement | string | number | boolean | null | undefined;
    interface FC<P = Record<string, unknown>> {
      (props: P & { children?: ReactNode }): ReactElement | null;
    }
    type ReactElement = React.ReactElement;
  }
}
