/**
 * Types pour les frameworks supportés
 */

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
 * Type pour les choix de framework dans l'interface utilisateur
 */
export interface FrameworkChoice {
  name: string;
  value: FrameworkType;
}

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
