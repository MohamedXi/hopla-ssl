/**
 * Types for project configuration
 */
import { FrameworkType } from './framework.types.js';

/**
 * Options for project configuration
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
 * Options for the setup command
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
