import chalk from 'chalk';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import { FrameworkChoice, FrameworkType, PackageJson } from '../types.js';

/**
 * Détecte le framework utilisé dans le projet
 * @param {string} projectPath - Chemin vers le projet
 * @returns {Promise<FrameworkType>} - Le framework détecté
 */
export async function detectFramework(
  projectPath: string
): Promise<FrameworkType> {
  try {
    console.log(chalk.blue('Détection du framework...'));

    // Vérifier si package.json existe
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (!(await fs.pathExists(packageJsonPath))) {
      console.log(
        chalk.yellow(
          'Aucun fichier package.json trouvé. Impossible de détecter automatiquement le framework.'
        )
      );
      return promptFramework();
    }

    // Lire package.json
    const packageJson: PackageJson = await fs.readJson(packageJsonPath);
    const { dependencies = {}, devDependencies = {} } = packageJson;
    const allDependencies = { ...dependencies, ...devDependencies };

    // Détecter le framework basé sur les dépendances
    if (allDependencies['next']) {
      return 'nextjs';
    } else if (allDependencies['react-scripts']) {
      return 'create-react-app';
    } else if (allDependencies['@angular/core']) {
      return 'angular';
    } else if (allDependencies['vue']) {
      // Distinguer entre Vue CLI et Vite
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

    // Si aucun framework n'est détecté, demander à l'utilisateur
    console.log(
      chalk.yellow('Impossible de détecter automatiquement le framework.')
    );
    return promptFramework();
  } catch (error) {
    console.error(
      chalk.red('Erreur lors de la détection du framework:'),
      error
    );
    return promptFramework();
  }
}

/**
 * Demande à l'utilisateur de sélectionner un framework
 * @returns {Promise<FrameworkType>} - Le framework sélectionné
 */
async function promptFramework(): Promise<FrameworkType> {
  const choices: FrameworkChoice[] = [
    { name: 'Next.js', value: 'nextjs' },
    { name: 'Create React App', value: 'create-react-app' },
    { name: 'Angular', value: 'angular' },
    { name: 'Vue CLI', value: 'vue-cli' },
    { name: 'Vue + Vite', value: 'vite-vue' },
    { name: 'Svelte', value: 'svelte' },
    { name: 'Vite', value: 'vite' },
    { name: 'Webpack', value: 'webpack' },
    { name: 'Autre', value: 'other' },
  ];

  const { framework } = await inquirer.prompt<{ framework: FrameworkType }>([
    {
      type: 'list',
      name: 'framework',
      message: 'Sélectionnez votre framework:',
      choices,
    },
  ]);

  return framework;
}
