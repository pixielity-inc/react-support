import type { Fake } from "@/types";

/**
 * Type guard to check if an object is a Fake instance.
 *
 * Facades can be swapped with fakes for testing purposes.
 * This utility inspects the `__isFake` marker property to
 * determine whether the given value is a test double.
 *
 * @param obj - The value to inspect
 * @returns `true` if `obj` implements the {@link Fake} interface
 *
 * @example
 * ```typescript
 * const fakeLogger = { __isFake: true as const, info: () => {} };
 *
 * isFake(fakeLogger); // true
 * isFake({ info: () => {} }); // false
 * ```
 */
export function isFake(obj: unknown): obj is Fake {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "__isFake" in obj &&
    (obj as Fake).__isFake === true
  );
}
