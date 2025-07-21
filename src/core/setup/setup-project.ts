/**
 * Main project configuration module
 */
import chalk from 'chalk';
import path from 'path';
import { FrameworkType } from '../../types/framework.types.js';
import { SetupProjectOptions } from '../../types/index.js';
import { generateCertificate } from '../certificate/index.js';
import {
  setupAngular,
  setupCRA,
  setupGeneric,
  setupNextJs,
  setupSvelte,
  setupVite,
  setupVueCli,
  setupWebpack
} from './frameworks/index.js';

/**
 * Configure a project to use HTTPS locally
 * @param options - Configuration options
 */
export async function setupProject({
  projectPath,
  domain = 'localhost',
  framework,
  organization,
  countryCode,
  state,
  locality,
  validity
}: SetupProjectOptions): Promise<void> {
  try {
    console.log(
      chalk.blue(`Configuring ${framework} project for HTTPS...`)
    );

    // Generate certificates in the project folder
    const sslDir = path.join(projectPath, 'ssl');
    const certPaths = await generateCertificate(domain, sslDir, {
      organization,
      countryCode,
      state,
      locality,
      validity
    });

    // Configure the project based on the framework
    switch (framework as FrameworkType) {
      case 'nextjs':
        await setupNextJs(projectPath, certPaths);
        break;
      case 'create-react-app':
        await setupCRA(projectPath, certPaths);
        break;
      case 'angular':
        await setupAngular(projectPath, certPaths);
        break;
      case 'vue-cli':
        await setupVueCli(projectPath, certPaths);
        break;
      case 'vite-vue':
      case 'vite':
        await setupVite(projectPath, certPaths);
        break;
      case 'svelte':
        await setupSvelte(projectPath, certPaths);
        break;
      case 'webpack':
        await setupWebpack(projectPath, certPaths);
        break;
      default:
        console.log(
          chalk.yellow(
            `The framework ${framework} is not directly supported.`
          )
        );
        await setupGeneric(projectPath, certPaths);
    }

    console.log(chalk.green('✅ Configuration complete!'));
  } catch (error) {
    console.error(
      chalk.red('Error configuring project:'),
      error
    );
    throw error;
  }
}
