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
