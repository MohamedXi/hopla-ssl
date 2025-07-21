/**
 * Types for supported frameworks
 */

/**
 * Types of supported frameworks
 */
export type FrameworkType =
  | 'nextjs'
  | 'create-react-app'
  | 'angular'
  | 'vue-cli'
  | 'vite-vue'
  | 'vue'
  | 'svelte'
  | 'vite'
  | 'webpack'
  | 'other';

/**
 * Type for framework choices in the user interface
 */
export interface FrameworkChoice {
  name: string;
  value: FrameworkType;
}

/**
 * Structure of package.json
 */
export interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  [key: string]: unknown;
}
