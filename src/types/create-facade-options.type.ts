import type { ServiceIdentifier } from "@abdokouta/react-di";

/**
 * Options for creating a facade
 */
export interface CreateFacadeOptions<T> {
  /**
   * Service identifier (string token, symbol, or class)
   */
  accessor: ServiceIdentifier<T>;

  /**
   * Whether to cache the resolved instance
   * @default true
   */
  cached?: boolean;
}
