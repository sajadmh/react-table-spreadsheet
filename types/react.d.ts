declare module "react" {
  export type ReactNode = unknown;
  export type DependencyList = readonly unknown[];

  export interface RefObject<T> {
    current: T;
  }

  export interface MutableRefObject<T> {
    current: T;
  }

  export type RefCallback<T> = (instance: T | null) => void;
  export type Ref<T> = RefCallback<T> | MutableRefObject<T | null> | null;

  export interface TableHTMLAttributes<T> extends Record<string, unknown> {
    children?: ReactNode;
    ref?: Ref<T>;
  }

  export function createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNode[]): any;
  export function forwardRef<T, P = {}>(render: (props: P, ref: Ref<T>) => any): (props: P & { ref?: Ref<T> }) => any;
  export function useEffect(effect: () => void | (() => void), deps?: DependencyList): void;
  export function useRef<T>(initialValue: T): MutableRefObject<T>;
}
