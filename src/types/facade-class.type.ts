import type { Facade } from "../facades/facade";

/**
 * Facade class type with static methods and proxied service methods
 */
export type FacadeClass<T> = typeof Facade & {
  getFacadeRoot<R = T>(): R;
} & {
  [K in keyof T]: T[K];
};
