/**
 * Types pour le package hopla-ssl
 */

/**
 * Types pour mkcert
 */
export interface CertificateAuthorityOptions {
  organization: string;
  countryCode: string;
  state: string;
  locality: string;
  validity: number;
}

/**
 * Options pour la génération de certificat
 */
export interface CertificateOptions {
  domains: string[];
  validity: number;
  caKey: Buffer;
  caCert: Buffer;
}

/**
 * Résultat de la génération de certificat
 */
export interface CertificateResult {
  key: string;
  cert: string;
  ca?: string;
}

/**
 * Options pour la configuration d'un projet
 */
export interface SetupProjectOptions {
  projectPath: string;
  domain: string;
  framework: string;
}

/**
 * Types de frameworks supportés
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
 * Structure de package.json
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
 * Options pour la commande generate
 */
export interface GenerateCommandOptions {
  domain: string;
  output: string;
}

/**
 * Options pour la commande setup
 */
export interface SetupCommandOptions {
  path: string;
  domain: string;
  framework?: string;
}

/**
 * Type pour les choix de framework dans l'interface utilisateur
 */
export interface FrameworkChoice {
  name: string;
  value: FrameworkType;
}
