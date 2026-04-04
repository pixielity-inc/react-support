/**
 * Multiple Instance Manager
 *
 * Abstract base class for managing multiple named instances backed by
 * different drivers. TypeScript adaptation of Laravel's
 * `MultipleInstanceManager` pattern.
 *
 * Concrete managers extend this class and implement:
 * - `getDefaultInstance()` — which instance name to use by default
 * - `getInstanceConfig(name)` — read config for a named instance
 * - `createDriver(driver, config)` — create an instance for a known driver
 *
 * Config is injected via DI in the concrete manager's constructor using
 * `@Inject(CONFIG_TOKEN)`. The base class handles lazy resolution,
 * caching, custom driver registration, and instance lifecycle.
 *
 * @typeParam T - The type of instance this manager creates
 *
 * @example
 * ```typescript
 * @Injectable()
 * class CacheManager extends MultipleInstanceManager<Store> {
 *   constructor(@Inject(CACHE_CONFIG) private config: CacheModuleOptions) {
 *     super();
 *   }
 *
 *   getDefaultInstance() { return this.config.default; }
 *   getInstanceConfig(name) { return this.config.stores[name]; }
 *
 *   protected createDriver(driver, config) {
 *     switch (driver) {
 *       case 'memory': return new MemoryStore(config);
 *       case 'redis':  return new RedisStore(config);
 *       case 'null':   return new NullStore();
 *       default: throw new Error(`Driver [${driver}] not supported.`);
 *     }
 *   }
 * }
 * ```
 *
 * @module services/base-manager
 */

import type { DriverCreator } from "@/types";

/**
 * Abstract base manager for multi-instance, multi-driver services.
 *
 * @typeParam T - The type of instance managed (e.g., Store, RedisConnection)
 */
export abstract class MultipleInstanceManager<T> {
  // ──────────────────────────────────────────────────────────────────────────
  // State
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Resolved instances, keyed by instance name.
   * Instances are created once and reused on subsequent calls.
   */
  private readonly instances: Map<string, T> = new Map();

  /**
   * Custom driver creators registered via `extend()`.
   * Keyed by driver name.
   */
  private readonly customCreators: Map<string, DriverCreator<T>> = new Map();

  /**
   * The config key that identifies the driver.
   * Override in subclasses if your config uses a different field name.
   *
   * @default 'driver'
   */
  protected readonly driverKey: string = 'driver';

  // ──────────────────────────────────────────────────────────────────────────
  // Abstract Methods (implement in concrete managers)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Get the default instance name.
   *
   * Reads from the injected config (e.g., `this.config.default`).
   *
   * @returns The name of the default instance
   */
  abstract getDefaultInstance(): string;

  /**
   * Get the configuration for a named instance.
   *
   * Reads from the injected config (e.g., `this.config.stores[name]`).
   *
   * @param name - Instance name
   * @returns The config object, or undefined if not configured
   */
  abstract getInstanceConfig(name: string): Record<string, any> | undefined;

  /**
   * Create a driver instance for a known driver type.
   *
   * Called when no custom creator is registered for the driver.
   * Implement with a switch/map over your package's built-in drivers.
   *
   * @param driver - The driver name (e.g., 'memory', 'redis', 'smtp')
   * @param config - The raw instance config
   * @returns A new driver instance
   * @throws Error if the driver is not supported
   */
  protected abstract createDriver(driver: string, config: Record<string, any>): T;

  // ──────────────────────────────────────────────────────────────────────────
  // Public API
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Get an instance by name.
   *
   * Returns a cached instance if available, otherwise resolves and caches it.
   * If no name is provided, returns the default instance.
   *
   * @param name - Instance name (uses default if omitted)
   * @returns The resolved instance
   * @throws Error if the instance is not configured
   */
  instance(name?: string): T {
    const instanceName = name ?? this.getDefaultInstance();

    // Return cached instance if it exists
    const existing = this.instances.get(instanceName);
    if (existing) {
      return existing;
    }

    // Resolve, cache, and return
    const resolved = this.resolve(instanceName);
    this.instances.set(instanceName, resolved);

    return resolved;
  }

  /**
   * Register a custom driver creator.
   *
   * Custom creators take priority over built-in drivers.
   *
   * @param driver - Driver name
   * @param creator - Factory function that creates an instance from config
   * @returns this (for chaining)
   */
  extend(driver: string, creator: DriverCreator<T>): this {
    this.customCreators.set(driver, creator);

    return this;
  }

  /**
   * Remove a cached instance, forcing re-creation on next access.
   *
   * @param name - Instance name (uses default if omitted)
   * @returns this (for chaining)
   */
  forgetInstance(name?: string): this {
    const instanceName = name ?? this.getDefaultInstance();
    this.instances.delete(instanceName);

    return this;
  }

  /**
   * Remove all cached instances.
   */
  purge(): void {
    this.instances.clear();
  }

  /**
   * Check if an instance has been resolved and cached.
   *
   * @param name - Instance name
   */
  hasResolvedInstance(name: string): boolean {
    return this.instances.has(name);
  }

  /**
   * Get all resolved instance names.
   */
  getResolvedInstances(): string[] {
    return Array.from(this.instances.keys());
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Resolution (private)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Resolve an instance by name.
   *
   * 1. Reads config via `getInstanceConfig()` (from injected config)
   * 2. Extracts the driver name from the config
   * 3. Checks custom creators first
   * 4. Falls back to `createDriver()`
   *
   * @param name - Instance name
   * @returns A new instance
   */
  private resolve(name: string): T {
    const config = this.getInstanceConfig(name);

    if (!config) {
      throw new Error(`Instance [${name}] is not defined.`);
    }

    const driver = config[this.driverKey];
    if (!driver) {
      throw new Error(
        `Instance [${name}] does not specify a "${this.driverKey}".`
      );
    }

    // Custom creator takes priority
    const customCreator = this.customCreators.get(driver);
    if (customCreator) {
      return customCreator(config);
    }

    // Delegate to concrete manager
    return this.createDriver(driver, config);
  }
}
