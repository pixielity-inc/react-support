/**
 * Application interface for facade resolution
 *
 * This interface represents the minimal contract that an application/container
 * must implement to work with facades. It mirrors the Laravel Application contract.
 */
export interface FacadeApplication {
  /**
   * Resolve a service from the container
   *
   * @param abstract - Service identifier (string, symbol, or class)
   * @returns The resolved service instance
   */
  get<T>(abstract: string | symbol | (new (...args: unknown[]) => T)): T;

  /**
   * Check if a service has been resolved
   *
   * @param abstract - Service identifier
   * @returns True if the service has been resolved
   */
  resolved?(abstract: string | symbol): boolean;

  /**
   * Register a callback to run after a service is resolved
   *
   * @param abstract - Service identifier
   * @param callback - Callback to run after resolution
   */
  afterResolving?(
    abstract: string | symbol,
    callback: (service: unknown, app: FacadeApplication) => void
  ): void;

  /**
   * Bind an instance to the container
   *
   * @param abstract - Service identifier
   * @param instance - Instance to bind
   */
  instance?(abstract: string | symbol, instance: unknown): void;
}
