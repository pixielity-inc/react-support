/**
 * @fileoverview Vitest setup file for @abdokouta/logger package
 * 
 * This file configures the testing environment before running tests.
 * 
 * Setup Features:
 * - Global test utilities
 * - Mock configurations
 * - Test environment setup
 * - Container mocking for DI tests
 * 
 * @module @abdokouta/logger
 * @category Configuration
 */

import { expect, beforeEach, afterEach, vi } from "vitest";

/**
 * Mock @abdokouta/container decorators
 * 
 * This ensures that Injectable and Inject decorators work in tests
 * without requiring the full DI container setup.
 */
vi.mock("@abdokouta/container", () => ({
  Injectable: () => (target: any) => target,
  Inject: () => (target: any, propertyKey: string, parameterIndex: number) => {},
  Module: () => (target: any) => target,
  forRoot: (module: any, config: any) => config,
}));

/**
 * Setup before each test
 * 
 * This ensures each test starts with a clean state.
 */
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
});

/**
 * Cleanup after each test
 * 
 * This ensures proper cleanup after each test.
 */
afterEach(() => {
  // Reset all mocks after each test
  vi.resetAllMocks();
});
