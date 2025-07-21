/**
 * Framework detection module
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { FrameworkType, PackageJson } from '../../types/framework.types.js';
import { promptFramework } from './prompt-framework.js';

/**
 * Detects the framework used in the project
 * @param projectPath - Path to the project
 * @returns The detected framework
 */
export async function detectFramework(projectPath: string): Promise<FrameworkType> {
  try {
    console.log(chalk.blue('Detecting framework...'));

    // Check if package.json exists
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (!(await fs.pathExists(packageJsonPath))) {
      console.log(
        chalk.yellow('No package.json file found. Unable to automatically detect the framework.')
      );
      return promptFramework();
    }

    // Read package.json
    const packageJson: PackageJson = await fs.readJson(packageJsonPath);
    const { dependencies = {}, devDependencies = {} } = packageJson;
    const allDependencies = { ...dependencies, ...devDependencies };

    // Detect the framework based on dependencies
    if (allDependencies['next']) {
      return 'nextjs';
    } else if (allDependencies['react-scripts']) {
      return 'create-react-app';
    } else if (allDependencies['@angular/core']) {
      return 'angular';
    } else if (allDependencies['vue']) {
      // Distinguish between Vue CLI and Vite
      if (allDependencies['@vue/cli-service']) {
        return 'vue-cli';
      } else if (allDependencies['vite']) {
        return 'vite-vue';
      }
      return 'vue';
    } else if (allDependencies['svelte']) {
      return 'svelte';
    } else if (allDependencies['vite']) {
      return 'vite';
    } else if (allDependencies['webpack-dev-server']) {
      return 'webpack';
    }

    // If no framework is detected, ask the user
    console.log(chalk.yellow('Unable to automatically detect the framework.'));
    return promptFramework();
  } catch (error) {
    console.error(chalk.red('Error detecting framework:'), error);
    return promptFramework();
  }
}
