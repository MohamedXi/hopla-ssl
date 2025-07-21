/**
 * Types for the hopla-ssl package
 */

/**
 * Types for mkcert
 */
export interface CertificateAuthorityOptions {
  organization: string;
  countryCode: string;
  state: string;
  locality: string;
  validity: number;
}

/**
 * Options for certificate generation
 */
export interface CertificateOptions {
  domains: string[];
  validity: number;
  caKey: Buffer;
  caCert: Buffer;
}

/**
 * Certificate generation result
 */
export interface CertificateResult {
  key: string;
  cert: string;
  ca?: string;
}

/**
 * Options for project configuration
 */
export interface SetupProjectOptions {
  projectPath: string;
  domain: string;
  framework: string;
}

/**
 * Supported frameworks types
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
 * Structure of package.json
 */
export interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  [key: string]: any;
}

/**
 * Options for the generate command
 */
export interface GenerateCommandOptions {
  domain: string;
  output: string;
}

/**
 * Options for the setup command
 */
export interface SetupCommandOptions {
  path: string;
  domain: string;
  framework?: string;
}

/**
 * Type for framework choices in the user interface
 */
export interface FrameworkChoice {
  name: string;
  value: FrameworkType;
}
