/**
 * @fileoverview Facade interfaces
 *
 * Defines the interfaces for the Facade pattern implementation.
 * Facades provide a static interface to services resolved from the DI container.
 *
 * @module @abdokouta/react-support
 * @category Facades
 */

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

/**
 * Fake interface for testing
 *
 * Facades can be swapped with fakes for testing purposes.
 * Any object implementing this interface is considered a fake.
 */
export interface Fake {
  /**
   * Marker to identify fake instances
   */
  readonly __isFake: true;
}

/**
 * Check if an object is a Fake
 *
 * @param obj - Object to check
 * @returns True if the object is a Fake
 */
export function isFake(obj: unknown): obj is Fake {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "__isFake" in obj &&
    (obj as Fake).__isFake === true
  );
}
