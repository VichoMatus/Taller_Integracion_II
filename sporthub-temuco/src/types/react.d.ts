// Declaración para los tipos de React
declare module 'react' {
  export = React;
  export as namespace React;
  namespace React {
    type ReactNode = any;
    interface FC<P = {}> {
      (props: P & { children?: ReactNode }): ReactElement | null;
    }
    type ReactElement = any;
  }
}
