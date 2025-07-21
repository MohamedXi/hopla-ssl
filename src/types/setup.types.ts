/**
 * Types pour la configuration des projets
 */
import { FrameworkType } from './framework.types.js';

/**
 * Options pour la configuration d'un projet
 */
export interface SetupProjectOptions {
  projectPath: string;
  domain: string;
  framework: FrameworkType;
  organization?: string;
  countryCode?: string;
  state?: string;
  locality?: string;
  validity?: number;
}

/**
 * Options pour la commande setup
 */
export interface SetupCommandOptions {
  path: string;
  domain: string;
  framework?: FrameworkType;
  org?: string;
  country?: string;
  state?: string;
  locality?: string;
  validity?: string;
}
