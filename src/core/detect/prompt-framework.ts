/**
 * User interface module for framework selection
 */
import inquirer from 'inquirer';
import { FrameworkType, FrameworkChoice } from '../../types/framework.types.js';

/**
 * Prompts the user to select a framework
 * @returns The selected framework
 */
export async function promptFramework(): Promise<FrameworkType> {
  const choices: FrameworkChoice[] = [
    { name: 'Next.js', value: 'nextjs' },
    { name: 'Create React App', value: 'create-react-app' },
    { name: 'Angular', value: 'angular' },
    { name: 'Vue CLI', value: 'vue-cli' },
    { name: 'Vue + Vite', value: 'vite-vue' },
    { name: 'Svelte', value: 'svelte' },
    { name: 'Vite', value: 'vite' },
    { name: 'Webpack', value: 'webpack' },
    { name: 'Other', value: 'other' }
  ];

  const { framework } = await inquirer.prompt<{ framework: FrameworkType }>([
    {
      type: 'list',
      name: 'framework',
      message: 'Select your framework:',
      choices
    }
  ]);
  
  return framework;
}
