/**
 * @fileoverview Facades module exports
 *
 * Provides Laravel-style Facade pattern for static access to DI services.
 *
 * @module @abdokouta/react-support
 * @category Facades
 */

// Base Facade class
export { Facade } from "./facade";
export type { ServiceIdentifier, Newable, ModuleContainer } from "./facade";

// Facade factory functions
export {
  createFacade,
  createFacadeClass,
  getContainerFromModule,
  type FacadeClass,
  type CreateFacadeOptions,
} from "./create-facade";

// Interfaces
export type { FacadeApplication, Fake } from "./facade.interface";
export { isFake } from "./facade.interface";
