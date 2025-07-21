/**
 * Export de tous les types du projet
 */

export * from './certificate.types.js';
export * from './framework.types.js';
export * from './setup.types.js';

/**
 * Options pour la commande generate
 */
export interface GenerateCommandOptions {
  domain: string;
  output: string;
  org?: string;
  country?: string;
  state?: string;
  locality?: string;
  validity?: string;
}
