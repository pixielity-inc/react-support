/**
 * @abdokouta/support
 *
 * Laravel-style utilities for JavaScript/TypeScript.
 * Provides Str class for string manipulation, Collection classes for data structures,
 * and BaseRegistry for building extensible registry patterns.
 *
 * @example
 * String manipulation:
 * ```typescript
 * import { Str } from '@abdokouta/support';
 *
 * Str.camel('foo_bar');           // 'fooBar'
 * Str.snake('fooBar');            // 'foo_bar'
 * Str.slug('Hello World');        // 'hello-world'
 * Str.contains('Hello', 'ell');   // true
 * ```
 *
 * @example
 * Collection usage:
 * ```typescript
 * import { collect } from '@abdokouta/support';
 *
 * const collection = collect([1, 2, 3, 4, 5]);
 * collection.filter(n => n > 2).map(n => n * 2).sum(); // 24
 * ```
 *
 * @example
 * Registry pattern:
 * ```typescript
 * import { BaseRegistry } from '@abdokouta/support';
 *
 * const registry = new BaseRegistry<MyType>();
 * registry.register('key', myValue);
 * const value = registry.get('key');
 * ```
 *
 * @module @abdokouta/support
 */

// ============================================================================
// String Utilities
// ============================================================================
export { Str } from "./str";

// ============================================================================
// Collection Utilities
// ============================================================================
export { Collection, collect } from "./collections";
export { MapCollection, collectMap } from "./collections";
export { SetCollection, collectSet } from "./collections";

// Re-export types from collect.js for convenience
export type { Collection as CollectJsCollection } from "collect.js";

// ============================================================================
// Registries
// ============================================================================
export { BaseRegistry } from "./registry";
export type { BaseRegistryOptions, ValidationResult } from "./registry";

// ============================================================================
// Facades
// ============================================================================
export {
  Facade,
  createFacade,
  createFacadeClass,
  getContainerFromModule,
  isFake,
} from "./facades";
export type {
  ServiceIdentifier,
  Newable,
  ModuleContainer,
  FacadeClass,
  CreateFacadeOptions,
  FacadeApplication,
  Fake,
} from "./facades";
