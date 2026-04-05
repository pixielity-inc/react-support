/**
 * @fileoverview Vitest setup file
 *
 * Configures the testing environment before running tests.
 *
 * @module @abdokouta/react-support
 * @category Configuration
 */

/**
 * Setup before each test — clean state.
 */
beforeEach(() => {
  vi.clearAllMocks();
});

/**
 * Cleanup after each test.
 */
afterEach(() => {
  vi.resetAllMocks();
});
