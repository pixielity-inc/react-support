/**
 * @fileoverview Facade factory with Proxy support
 *
 * Creates facades with automatic method forwarding using JavaScript Proxy.
 * This enables the Laravel-style `Facade::method()` pattern in TypeScript.
 *
 * @module @abdokouta/react-support
 * @category Facades
 */

import type { ServiceIdentifier, Newable, ModuleContainer } from "@abdokouta/react-di";
import { getModuleContainer } from "@abdokouta/react-di";

import { Facade } from "./facade";

/**
 * Facade class type with static methods and proxied service methods
 */
export type FacadeClass<T> = typeof Facade & {
  getFacadeRoot<R = T>(): R;
} & {
  [K in keyof T]: T[K];
};

/**
 * Options for creating a facade
 */
export interface CreateFacadeOptions<T> {
  /**
   * Service identifier (string token, symbol, or class)
   */
  accessor: ServiceIdentifier<T>;

  /**
   * Whether to cache the resolved instance
   * @default true
   */
  cached?: boolean;
}

/**
 * Create a facade for a service
 *
 * Creates a Proxy-based facade that forwards all method calls to the
 * resolved service instance. This enables the Laravel-style pattern
 * where you can call methods directly on the facade class.
 *
 * @param options - Facade configuration
 * @returns Proxied facade class
 *
 * @example
 * ```typescript
 * // Define your service interface
 * interface ILogger {
 *   info(message: string): void;
 *   error(message: string): void;
 *   debug(message: string): void;
 * }
 *
 * // Create the facade
 * const Log = createFacade<ILogger>({
 *   accessor: 'logger', // or LoggerService class
 * });
 *
 * // Set module at bootstrap
 * Facade.setFacadeModule(AppModule);
 *
 * // Use it statically
 * Log.info('Hello!');
 * Log.error('Oops!');
 * ```
 */
export function createFacade<T extends object>(
  options: CreateFacadeOptions<T>
): FacadeClass<T> {
  const { accessor, cached = true } = options;

  // Create a concrete facade class
  class ConcreteFacade extends Facade {
    protected static cached = cached;

    protected static getFacadeAccessor(): ServiceIdentifier {
      return accessor;
    }
  }

  // Create a proxy to forward method calls
  const proxy = new Proxy(ConcreteFacade, {
    get(target, prop, receiver) {
      // First check if it's a static method on Facade
      if (prop in target) {
        const value = Reflect.get(target, prop, receiver);
        if (typeof value === "function") {
          return value.bind(target);
        }
        return value;
      }

      // Otherwise, forward to the resolved instance
      return (...args: unknown[]) => {
        const instance = target.getFacadeRoot<T>();

        if (!instance) {
          throw new Error(
            `A facade root has not been set. ` +
              `Call Facade.setFacadeModule() first.`
          );
        }

        const method = (instance as Record<string | symbol, unknown>)[prop];

        if (typeof method !== "function") {
          throw new Error(
            `Method "${String(prop)}" does not exist on the facade root.`
          );
        }

        return method.apply(instance, args);
      };
    },
  });

  return proxy as unknown as FacadeClass<T>;
}

/**
 * Create a typed facade class (without proxy)
 *
 * @param accessor - Service identifier
 * @returns Facade class constructor
 */
export function createFacadeClass<T>(
  accessor: ServiceIdentifier<T>
): typeof Facade {
  return class extends Facade {
    protected static getFacadeAccessor(): ServiceIdentifier {
      return accessor;
    }
  };
}

/**
 * Get container from a module class
 *
 * @param moduleClass - The module class
 * @returns ModuleContainer instance
 */
export function getContainerFromModule(moduleClass: Newable): ModuleContainer {
  return getModuleContainer(moduleClass);
}
