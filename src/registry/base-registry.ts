/**
 * @fileoverview Base registry implementation
 * 
 * This file provides a generic base registry class that uses the Collection
 * interface for storage. It provides a consistent API for all registry
 * implementations across the application.
 * 
 * Key Features:
 * - Generic type support for any item type
 * - Default item support (fallback when item not found)
 * - Validation hooks (before add, after add)
 * - Collection-based storage (efficient O(1) operations)
 * - Type-safe API
 * - Consistent interface across all registries
 * 
 * Use Cases:
 * - Theme registry (storing and retrieving themes)
 * - Token registry (managing design tokens)
 * - Plugin registry (managing plugins)
 * - Configuration registry (storing configs)
 * - Any key-value registry needs
 * 
 * @module @abdokouta/support
 * @category Registries
 */

import { MapCollection } from "../collections/map.collection";

/**
 * Collection interface for registry storage
 */
export interface Collection<T> {
  add(key: string, value: T): void;
  get(key: string): T | undefined;
  getAll(): T[];
  getKeys(): string[];
  getAsRecord(): Record<string, T>;
  has(key: string): boolean;
  remove(key: string): boolean;
  clear(): void;
  size(): number;
  isEmpty(): boolean;
  forEach(callback: (value: T, key: string) => void): void;
  map<U>(callback: (value: T, key: string) => U): U[];
  filter(predicate: (value: T, key: string) => boolean): T[];
  find(predicate: (value: T, key: string) => boolean): T | undefined;
}

/**
 * Registry collection adapter
 * Wraps MapCollection to implement Collection interface
 */
class RegistryCollection<T> implements Collection<T> {
  private _storage = new MapCollection<string, T>();

  add(key: string, value: T): void {
    this._storage.set(key, value);
  }

  get(key: string): T | undefined {
    return this._storage.get(key);
  }

  getAll(): T[] {
    return this._storage.values();
  }

  getKeys(): string[] {
    return this._storage.keys();
  }

  getAsRecord(): Record<string, T> {
    return this._storage.toObject();
  }

  has(key: string): boolean {
    return this._storage.has(key);
  }

  remove(key: string): boolean {
    return this._storage.delete(key);
  }

  clear(): void {
    this._storage.clear();
  }

  size(): number {
    return this._storage.size();
  }

  isEmpty(): boolean {
    return this._storage.isEmpty();
  }

  forEach(callback: (value: T, key: string) => void): void {
    this._storage.each((value, key) => {
      callback(value, key);
    });
  }

  map<U>(callback: (value: T, key: string) => U): U[] {
    const result: U[] = [];
    this._storage.each((value, key) => {
      result.push(callback(value, key));
    });
    return result;
  }

  filter(predicate: (value: T, key: string) => boolean): T[] {
    const result: T[] = [];
    this._storage.each((value, key) => {
      if (predicate(value, key)) {
        result.push(value);
      }
    });
    return result;
  }

  find(predicate: (value: T, key: string) => boolean): T | undefined {
    return this._storage.first(predicate);
  }
}

/**
 * Validation result for registry operations
 * 
 * Used by validation hooks to indicate whether an operation
 * should proceed or be rejected.
 * 
 * @example
 * ```typescript
 * const result: ValidationResult = {
 *   valid: false,
 *   error: 'Item name cannot be empty'
 * };
 * ```
 */
export interface ValidationResult {
  /**
   * Whether the validation passed
   */
  valid: boolean;
  
  /**
   * Error message if validation failed
   */
  error?: string;
}

/**
 * Base registry options
 * 
 * Configuration options for creating a registry instance.
 * Allows customization of default item behavior and validation.
 * 
 * @template T - The type of items stored in the registry
 */
export interface BaseRegistryOptions<T> {
  /**
   * Default item to return when requested item is not found
   * 
   * If not provided, get() will return undefined for missing items.
   * If provided, get() will return this default item instead.
   */
  defaultItem?: T;
  
  /**
   * Validation hook called before adding an item
   * 
   * Allows custom validation logic before items are added to the registry.
   * If validation fails, the item will not be added and an error will be thrown.
   * 
   * @param key - Item key
   * @param item - Item to validate
   * @returns Validation result
   */
  validateBeforeAdd?: (key: string, item: T) => ValidationResult;
  
  /**
   * Hook called after an item is successfully added
   * 
   * Useful for side effects like logging, notifications, or triggering
   * dependent updates after an item is registered.
   * 
   * @param key - Item key
   * @param item - Item that was added
   */
  afterAdd?: (key: string, item: T) => void;
}

/**
 * Base registry class
 * 
 * A generic registry implementation that provides a consistent API for
 * storing and retrieving items by key. Uses the Collection interface
 * for efficient storage with O(1) operations.
 * 
 * This class extends Collection functionality by adding:
 * - Default item support
 * - Validation hooks
 * - Consistent registry API
 * 
 * All Collection methods are directly accessible on the registry instance.
 * 
 * Performance Characteristics:
 * - register(): O(1) + validation time
 * - get(): O(1)
 * - has(): O(1)
 * - remove(): O(1)
 * - getAll(): O(n)
 * - clear(): O(1)
 * 
 * @template T - The type of items stored in the registry
 * 
 * @example
 * ```typescript
 * // Create a theme registry
 * const themeRegistry = new BaseRegistry<Theme>({
 *   defaultItem: defaultTheme,
 *   validateBeforeAdd: (key, theme) => {
 *     if (!theme.name) {
 *       return { valid: false, error: 'Theme must have a name' };
 *     }
 *     return { valid: true };
 *   }
 * });
 * 
 * // Register themes
 * themeRegistry.register('blue', blueTheme);
 * themeRegistry.register('red', redTheme);
 * 
 * // Get a theme
 * const theme = themeRegistry.get('blue');
 * 
 * // Get all themes
 * const allThemes = themeRegistry.getAll();
 * 
 * // Check if theme exists
 * if (themeRegistry.has('blue')) {
 *   console.log('Blue theme exists');
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Create a simple token registry
 * const tokenRegistry = new BaseRegistry<Token>();
 * 
 * tokenRegistry.register('primary', { value: '#0000FF' });
 * tokenRegistry.register('secondary', { value: '#FF0000' });
 * 
 * const allTokens = tokenRegistry.getAll();
 * console.log(allTokens.length); // 2
 * ```
 */
export class BaseRegistry<T> implements Collection<T> {
  /**
   * Internal collection for storing registry items
   * 
   * Uses Collection interface for flexible storage implementation.
   * By default, uses MapCollection for O(1) operations.
   */
  protected collection: Collection<T>;
  
  /**
   * Default item to return when requested item is not found
   * 
   * If set, get() will return this item instead of undefined
   * when the requested key doesn't exist in the registry.
   */
  protected defaultItem?: T;
  
  /**
   * Validation hook called before adding an item
   * 
   * If provided, this function is called before every register()
   * operation to validate the item. If validation fails, the
   * item is not added and an error is thrown.
   */
  protected validateBeforeAdd?: (key: string, item: T) => ValidationResult;
  
  /**
   * Hook called after an item is successfully added
   * 
   * If provided, this function is called after every successful
   * register() operation. Useful for side effects like logging
   * or triggering dependent updates.
   */
  protected afterAdd?: (key: string, item: T) => void;

  /**
   * Creates a new BaseRegistry instance
   * 
   * Initializes the registry with optional configuration for default
   * item and validation hooks. By default, uses MapCollection for storage.
   * 
   * @param options - Registry configuration options
   * 
   * @example
   * ```typescript
   * // Simple registry without options
   * const registry = new BaseRegistry<Theme>();
   * ```
   * 
   * @example
   * ```typescript
   * // Registry with default item
   * const registry = new BaseRegistry<Theme>({
   *   defaultItem: defaultTheme
   * });
   * ```
   * 
   * @example
   * ```typescript
   * // Registry with validation
   * const registry = new BaseRegistry<Theme>({
   *   validateBeforeAdd: (key, theme) => {
   *     if (!theme.name) {
   *       return { valid: false, error: 'Theme must have a name' };
   *     }
   *     return { valid: true };
   *   },
   *   afterAdd: (key, theme) => {
   *     console.log(`Registered theme: ${theme.name}`);
   *   }
   * });
   * ```
   */
  constructor(options: BaseRegistryOptions<T> = {}) {
    // Initialize collection with RegistryCollection (O(1) operations)
    this.collection = new RegistryCollection<T>();
    
    // Store default item if provided
    this.defaultItem = options.defaultItem;
    
    // Store validation hooks if provided
    this.validateBeforeAdd = options.validateBeforeAdd;
    this.afterAdd = options.afterAdd;
  }

  /**
   * Register an item in the registry
   * 
   * Adds or updates an item in the registry with the specified key.
   * If an item with the same key already exists, it will be replaced.
   * 
   * If a validation hook is configured, it will be called before adding
   * the item. If validation fails, an error is thrown and the item is
   * not added.
   * 
   * If an afterAdd hook is configured, it will be called after the item
   * is successfully added.
   * 
   * Time Complexity: O(1) + validation time
   * 
   * @param key - Unique identifier for the item
   * @param item - Item to register
   * @throws Error if validation fails
   * 
   * @example
   * ```typescript
   * const registry = new BaseRegistry<Theme>();
   * 
   * // Register a theme
   * registry.register('blue', {
   *   name: 'Blue',
   *   colors: { accent: '#0000FF' }
   * });
   * 
   * // Update existing theme
   * registry.register('blue', {
   *   name: 'Blue',
   *   colors: { accent: '#0066FF' }
   * });
   * ```
   */
  register(key: string, item: T): void {
    // Run validation hook if provided
    if (this.validateBeforeAdd) {
      const result = this.validateBeforeAdd(key, item);
      
      // If validation fails, throw error with message
      if (!result.valid) {
        throw new Error(
          `Validation failed for key "${key}": ${result.error || 'Unknown error'}`
        );
      }
    }

    // Add item to collection (O(1) operation)
    this.collection.add(key, item);

    // Run afterAdd hook if provided
    if (this.afterAdd) {
      this.afterAdd(key, item);
    }
  }

  // ============================================================================
  // Collection Interface Implementation
  // All methods below delegate directly to the internal collection
  // ============================================================================

  /**
   * Add an item to the collection (alias for register)
   * 
   * This method is part of the Collection interface.
   * It delegates to register() to ensure validation hooks are called.
   * 
   * Time Complexity: O(1) + validation time
   * 
   * @param key - Unique identifier for the item
   * @param value - Item to add
   */
  add(key: string, value: T): void {
    // Delegate to register() to ensure validation hooks are called
    this.register(key, value);
  }

  /**
   * Get an item from the registry
   * 
   * Retrieves an item by its key. If the item doesn't exist:
   * - Returns the default item if one was configured
   * - Returns undefined if no default item was configured
   * 
   * Time Complexity: O(1)
   * 
   * @param key - Item identifier
   * @returns Item if found, default item if configured, or undefined
   * 
   * @example
   * ```typescript
   * const theme = registry.get('blue');
   * ```
   */
  get(key: string): T | undefined {
    // Try to get item from collection (O(1))
    const item = this.collection.get(key);
    
    // If item exists, return it
    if (item !== undefined) {
      return item;
    }
    
    // If item doesn't exist, return default item (may be undefined)
    return this.defaultItem;
  }

  /**
   * Get all items in the registry
   * 
   * Returns an array containing all items in the registry.
   * The order of items depends on the collection implementation
   * (MapCollection maintains insertion order).
   * 
   * Time Complexity: O(n) where n is the number of items
   * 
   * @returns Array of all items in the registry
   * 
   * @example
   * ```typescript
   * const allThemes = registry.getAll();
   * ```
   */
  getAll(): T[] {
    return this.collection.getAll();
  }

  /**
   * Get all keys in the registry
   * 
   * Returns an array containing all keys in the registry.
   * Useful for iteration or checking what items are registered.
   * 
   * Time Complexity: O(n) where n is the number of items
   * 
   * @returns Array of all keys in the registry
   * 
   * @example
   * ```typescript
   * const keys = registry.getKeys();
   * ```
   */
  getKeys(): string[] {
    return this.collection.getKeys();
  }

  /**
   * Get registry as a record object
   * 
   * Converts the registry to a plain JavaScript object (record)
   * with keys mapping to values. Useful for serialization.
   * 
   * Time Complexity: O(n) where n is the number of items
   * 
   * @returns Record object with keys mapping to values
   * 
   * @example
   * ```typescript
   * const record = registry.getAsRecord();
   * ```
   */
  getAsRecord(): Record<string, T> {
    return this.collection.getAsRecord();
  }

  /**
   * Check if an item is registered
   * 
   * Checks whether an item with the specified key exists in the registry.
   * Does not check the value, only the presence of the key.
   * 
   * Time Complexity: O(1)
   * 
   * @param key - Item identifier to check
   * @returns True if item is registered, false otherwise
   * 
   * @example
   * ```typescript
   * if (registry.has('blue')) {
   *   console.log('Blue theme exists');
   * }
   * ```
   */
  has(key: string): boolean {
    return this.collection.has(key);
  }

  /**
   * Remove an item from the registry
   * 
   * Removes an item with the specified key from the registry.
   * Returns true if the item was removed, false if it didn't exist.
   * 
   * Time Complexity: O(1)
   * 
   * @param key - Item identifier to remove
   * @returns True if item was removed, false if it didn't exist
   * 
   * @example
   * ```typescript
   * const removed = registry.remove('blue');
   * ```
   */
  remove(key: string): boolean {
    return this.collection.remove(key);
  }

  /**
   * Clear all items from the registry
   * 
   * Removes all items from the registry, leaving it empty.
   * This operation is irreversible.
   * 
   * Time Complexity: O(1)
   * 
   * @example
   * ```typescript
   * registry.clear();
   * ```
   */
  clear(): void {
    this.collection.clear();
  }

  /**
   * Get the number of items in the registry
   * 
   * Returns the total count of items currently registered.
   * 
   * Time Complexity: O(1)
   * 
   * @returns Number of items in the registry
   * 
   * @example
   * ```typescript
   * console.log(registry.size()); // 2
   * ```
   */
  size(): number {
    return this.collection.size();
  }

  /**
   * Check if the registry is empty
   * 
   * Returns true if the registry contains no items, false otherwise.
   * This is a convenience method equivalent to checking if size() === 0.
   * 
   * Time Complexity: O(1)
   * 
   * @returns True if registry has no items, false otherwise
   * 
   * @example
   * ```typescript
   * console.log(registry.isEmpty()); // true
   * ```
   */
  isEmpty(): boolean {
    return this.collection.isEmpty();
  }

  /**
   * Iterate over all items in the registry
   * 
   * Executes a callback function for each item in the registry.
   * Items are iterated in insertion order (for MapCollection).
   * 
   * Time Complexity: O(n) where n is the number of items
   * 
   * @param callback - Function to call for each item (value, key)
   * 
   * @example
   * ```typescript
   * registry.forEach((theme, key) => {
   *   console.log(`${key}: ${theme.name}`);
   * });
   * ```
   */
  forEach(callback: (value: T, key: string) => void): void {
    this.collection.forEach(callback);
  }

  /**
   * Map over all items in the registry
   * 
   * Transforms each item in the registry using a callback function
   * and returns an array of the transformed values.
   * 
   * Time Complexity: O(n) where n is the number of items
   * 
   * @template U - The type of the transformed items
   * @param callback - Function to transform each item (value, key) => U
   * @returns Array of transformed items
   * 
   * @example
   * ```typescript
   * const names = registry.map(theme => theme.name);
   * ```
   */
  map<U>(callback: (value: T, key: string) => U): U[] {
    return this.collection.map(callback);
  }

  /**
   * Filter items in the registry
   * 
   * Returns an array of items that pass the test implemented by the
   * provided predicate function.
   * 
   * Time Complexity: O(n) where n is the number of items
   * 
   * @param predicate - Function to test each item (value, key) => boolean
   * @returns Array of items that pass the test
   * 
   * @example
   * ```typescript
   * const darkThemes = registry.filter(theme => theme.isDark);
   * ```
   */
  filter(predicate: (value: T, key: string) => boolean): T[] {
    return this.collection.filter(predicate);
  }

  /**
   * Find an item in the registry
   * 
   * Returns the first item that satisfies the provided predicate function.
   * Returns undefined if no item passes the test.
   * 
   * Time Complexity: O(n) worst case, O(1) best case
   * 
   * @param predicate - Function to test each item (value, key) => boolean
   * @returns First item that passes the test, or undefined
   * 
   * @example
   * ```typescript
   * const defaultTheme = registry.find(theme => theme.isDefault);
   * ```
   */
  find(predicate: (value: T, key: string) => boolean): T | undefined {
    return this.collection.find(predicate);
  }
}
