/**
 * Collection interface for registry storage.
 *
 * Defines the contract for a key-value store used internally by
 * registries. Every method operates on string keys and generic values,
 * providing O(1) lookups, inserts, and deletes when backed by a Map.
 *
 * @typeParam T - The type of values stored in the collection
 */
export interface Collection<T> {
  /**
   * Add or replace a value under the given key.
   *
   * @param key   - Unique string identifier
   * @param value - Value to store
   */
  add(key: string, value: T): void;

  /**
   * Retrieve a value by its key.
   *
   * @param key - The key to look up
   * @returns The stored value, or `undefined` if the key does not exist
   */
  get(key: string): T | undefined;

  /**
   * Return every value in the collection as an array.
   *
   * Iteration order matches insertion order (Map semantics).
   *
   * @returns An array of all stored values
   */
  getAll(): T[];

  /**
   * Return every key in the collection as an array.
   *
   * @returns An array of all registered keys
   */
  getKeys(): string[];

  /**
   * Convert the collection to a plain record object.
   *
   * Useful for serialisation or passing data to APIs that
   * expect a simple `Record<string, T>`.
   *
   * @returns A shallow copy of the collection as a record
   */
  getAsRecord(): Record<string, T>;

  /**
   * Check whether a key exists in the collection.
   *
   * @param key - The key to test
   * @returns `true` if the key is present
   */
  has(key: string): boolean;

  /**
   * Remove a key and its associated value.
   *
   * @param key - The key to remove
   * @returns `true` if the key existed and was removed, `false` otherwise
   */
  remove(key: string): boolean;

  /**
   * Remove all entries from the collection.
   */
  clear(): void;

  /**
   * Return the number of entries in the collection.
   *
   * @returns The current entry count
   */
  size(): number;

  /**
   * Check whether the collection contains zero entries.
   *
   * @returns `true` when `size() === 0`
   */
  isEmpty(): boolean;

  /**
   * Execute a callback for every entry in insertion order.
   *
   * @param callback - Receives `(value, key)` for each entry
   */
  forEach(callback: (value: T, key: string) => void): void;

  /**
   * Transform every entry and collect the results into an array.
   *
   * @typeParam U - The return type of the mapping function
   * @param callback - Receives `(value, key)` and returns the mapped value
   * @returns An array of mapped results in insertion order
   */
  map<U>(callback: (value: T, key: string) => U): U[];

  /**
   * Return all values whose entries satisfy the predicate.
   *
   * @param predicate - Receives `(value, key)` and returns `true` to keep
   * @returns An array of matching values
   */
  filter(predicate: (value: T, key: string) => boolean): T[];

  /**
   * Return the first value whose entry satisfies the predicate.
   *
   * @param predicate - Receives `(value, key)` and returns `true` to match
   * @returns The first matching value, or `undefined` if none match
   */
  find(predicate: (value: T, key: string) => boolean): T | undefined;
}
