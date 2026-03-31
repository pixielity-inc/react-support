/**
 * @fileoverview Base Facade implementation
 *
 * This file provides the base Facade class that enables static access to
 * services resolved from the DI container. Inspired by Laravel's Facade pattern.
 *
 * Uses @abdokouta/react-di's getModuleContainer to resolve services,
 * enabling facades to work outside of React components.
 *
 * Key Features:
 * - Static interface to container-resolved services
 * - Instance caching for performance
 * - Hot-swapping for testing
 * - Fake detection for test assertions
 * - Works outside React components
 *
 * @module @abdokouta/react-support
 * @category Facades
 */

import { getModuleContainer } from "@abdokouta/react-di";
import type { Newable, ModuleContainer, ServiceIdentifier } from "@abdokouta/react-di";

import { isFake } from "./facade.interface";
import type { FacadeApplication } from "./facade.interface";

// Re-export types for convenience
export type { ServiceIdentifier, Newable, ModuleContainer };

/**
 * Base Facade class
 *
 * Provides a static interface to services resolved from the DI container.
 * Subclasses must implement `getFacadeAccessor()` to specify which service
 * the facade represents.
 *
 * @example
 * ```typescript
 * import { Facade } from '@abdokouta/react-support';
 * import { LoggerService } from './logger.service';
 * import { AppModule } from './app.module';
 *
 * class Log extends Facade {
 *   protected static getFacadeAccessor(): ServiceIdentifier {
 *     return LoggerService;
 *   }
 * }
 *
 * // Set the module once at app bootstrap
 * Facade.setFacadeModule(AppModule);
 *
 * // Use the facade statically anywhere
 * Log.info('Hello, world!');
 * Log.error('Something went wrong');
 * ```
 *
 * @example
 * ```typescript
 * // Swap with a fake for testing
 * const fakeLogs: string[] = [];
 * const fakeLogger = {
 *   __isFake: true as const,
 *   info: (msg: string) => fakeLogs.push(msg),
 *   error: (msg: string) => fakeLogs.push(msg),
 * };
 *
 * Log.swap(fakeLogger);
 * Log.info('Test message');
 * expect(fakeLogs).toContain('Test message');
 * ```
 */
export abstract class Facade {
  /**
   * The root module class for resolving services
   */
  protected static moduleClass: Newable | null = null;

  /**
   * The module container instance (cached)
   */
  protected static container: ModuleContainer | null = null;

  /**
   * The resolved object instances
   *
   * Caches resolved instances by their accessor key for performance.
   */
  protected static resolvedInstance: Map<string | symbol, unknown> = new Map();

  /**
   * Indicates if the resolved instance should be cached
   *
   * Set to false in subclasses to always resolve fresh instances.
   */
  protected static cached = true;

  /**
   * Hotswap the underlying instance behind the facade
   *
   * Useful for testing - swap the real service with a mock or fake.
   *
   * @param instance - Instance to swap in
   *
   * @example
   * ```typescript
   * // In tests
   * const mockLogger = { info: vi.fn(), error: vi.fn() };
   * Log.swap(mockLogger);
   *
   * // Now Log.info() calls mockLogger.info()
   * Log.info('test');
   * expect(mockLogger.info).toHaveBeenCalledWith('test');
   * ```
   */
  public static swap(instance: unknown): void {
    const accessor = this.getFacadeAccessor();
    const key = this.getAccessorKey(accessor);
    this.resolvedInstance.set(key, instance);
  }

  /**
   * Determines whether a "fake" has been set as the facade instance
   *
   * @returns True if the current instance is a Fake
   *
   * @example
   * ```typescript
   * if (Log.isFake()) {
   *   console.log('Using fake logger');
   * }
   * ```
   */
  public static isFake(): boolean {
    const accessor = this.getFacadeAccessor();
    const key = this.getAccessorKey(accessor);
    const instance = this.resolvedInstance.get(key);
    return instance !== undefined && isFake(instance);
  }

  /**
   * Get the root object behind the facade
   *
   * Resolves and returns the actual service instance.
   *
   * @returns The resolved service instance
   */
  public static getFacadeRoot<T = unknown>(): T {
    return this.resolveFacadeInstance(this.getFacadeAccessor()) as T;
  }

  /**
   * Get the registered name of the component
   *
   * Subclasses MUST override this method to specify which service
   * the facade represents.
   *
   * @returns Service identifier (string, symbol, or class)
   * @throws Error if not implemented
   *
   * @example
   * ```typescript
   * class Log extends Facade {
   *   protected static getFacadeAccessor(): ServiceIdentifier {
   *     return LoggerService; // or 'logger' string token
   *   }
   * }
   * ```
   */
  protected static getFacadeAccessor(): ServiceIdentifier {
    throw new Error("Facade does not implement getFacadeAccessor method.");
  }

  /**
   * Get a consistent key for the accessor
   */
  protected static getAccessorKey(accessor: ServiceIdentifier): string | symbol {
    if (typeof accessor === "function") {
      return accessor.name || accessor.toString();
    }
    return accessor;
  }

  /**
   * Resolve the facade root instance from the container
   *
   * @param identifier - Service identifier
   * @returns Resolved service instance
   */
  protected static resolveFacadeInstance<T>(identifier: ServiceIdentifier<T>): T {
    const key = this.getAccessorKey(identifier);

    // Check cache first
    if (this.resolvedInstance.has(key)) {
      return this.resolvedInstance.get(key) as T;
    }

    // Get container
    const container = this.getContainer();

    if (!container) {
      throw new Error(
        `Unable to resolve facade instance. Module not set. ` +
          `Call Facade.setFacadeModule(YourModule) first.`
      );
    }

    // Resolve from container
    const instance = container.get(identifier) as T;

    // Cache if enabled
    if (this.cached) {
      this.resolvedInstance.set(key, instance);
    }

    return instance;
  }

  /**
   * Get the module container
   *
   * @returns The module container instance
   */
  protected static getContainer(): ModuleContainer | null {
    if (this.container) {
      return this.container;
    }

    if (this.moduleClass) {
      this.container = getModuleContainer(this.moduleClass);
      return this.container;
    }

    return null;
  }

  /**
   * Clear a resolved facade instance
   *
   * @param name - Service identifier to clear (defaults to this facade's accessor)
   */
  public static clearResolvedInstance(name?: string | symbol): void {
    const key = name ?? this.getAccessorKey(this.getFacadeAccessor());
    this.resolvedInstance.delete(key);
  }

  /**
   * Clear all resolved instances
   *
   * Useful for test cleanup.
   */
  public static clearResolvedInstances(): void {
    this.resolvedInstance.clear();
  }

  /**
   * Get the module class
   *
   * @returns The module class
   */
  public static getFacadeModule(): Newable | null {
    return this.moduleClass;
  }

  /**
   * Set the module class for facade resolution
   *
   * Must be called during application bootstrap to enable facades.
   * Call this AFTER Inversiland.run() or Container.configure().build().
   *
   * @param module - The root module class
   *
   * @example
   * ```typescript
   * // In your app bootstrap (main.tsx)
   * import { Facade } from '@abdokouta/react-support';
   * import { Container, ContainerProvider } from '@abdokouta/react-di';
   * import { AppModule } from './app.module';
   *
   * // Initialize container
   * Container.configure().withModule(AppModule).withDefaults().build();
   *
   * // Set facade module
   * Facade.setFacadeModule(AppModule);
   *
   * // Now facades work anywhere
   * ReactDOM.createRoot(document.getElementById("root")!).render(
   *   <ContainerProvider module={AppModule}>
   *     <App />
   *   </ContainerProvider>
   * );
   * ```
   */
  public static setFacadeModule(module: Newable | null): void {
    this.moduleClass = module;
    this.container = null; // Reset container cache
  }

  /**
   * Set the container directly (alternative to setFacadeModule)
   *
   * @param container - The module container instance
   */
  public static setFacadeContainer(container: ModuleContainer | null): void {
    this.container = container;
  }

  // ============================================================================
  // Legacy API (for compatibility with FacadeApplication interface)
  // ============================================================================

  /**
   * @deprecated Use setFacadeModule instead
   */
  public static setFacadeApplication(app: FacadeApplication | null): void {
    // For backwards compatibility, store as a simple adapter
    if (app) {
      this.container = {
        get: <T>(id: ServiceIdentifier<T>) => app.get(id),
      } as ModuleContainer;
    } else {
      this.container = null;
    }
  }

  /**
   * @deprecated Use getFacadeModule instead
   */
  public static getFacadeApplication(): FacadeApplication | null {
    const container = this.getContainer();
    if (!container) return null;

    return {
      get: <T>(abstract: string | symbol | (new (...args: unknown[]) => T)) =>
        container.get(abstract as ServiceIdentifier<T>),
    };
  }
}
