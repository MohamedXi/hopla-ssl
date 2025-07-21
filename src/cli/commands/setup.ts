/**
 * Command to configure a project with HTTPS
 */
import chalk from 'chalk';
import { Command } from 'commander';
import path from 'path';
import { detectFramework } from '../../core/detect/index.js';
import { setupProject } from '../../core/setup/index.js';
import { SetupCommandOptions } from '../../types/index.js';

/**
 * Configure the setup command
 * @param program - Commander instance
 */
export function configureSetupCommand(program: Command): void {
  program
    .command('setup')
    .description('Configure a project to use HTTPS locally')
    .option('-p, --path <path>', 'Path to the project', process.cwd())
    .option('-d, --domain <domain>', 'Domain for the certificate', 'localhost')
    .option(
      '-f, --framework <framework>',
      'Framework used (nextjs, create-react-app, angular, vue-cli, vite, svelte, webpack)'
    )
    .option('--org <organization>', 'Organization for the certificate', 'Hopla SSL Local CA')
    .option('--country <countryCode>', 'Country code for the certificate (2 letters)', 'FR')
    .option('--state <state>', 'State or province for the certificate', 'Local Development')
    .option('--locality <locality>', 'Locality for the certificate', 'Development Environment')
    .option('--validity <days>', 'Certificate validity in days', '365')
    .action(async (options: SetupCommandOptions) => {
      try {
        console.log(chalk.blue('🔧 Configuring project for HTTPS...'));
        
        // Resolve the absolute path of the project
        const projectPath = path.resolve(options.path);
        
        // Detect the framework if not specified
        const framework = options.framework || await detectFramework(projectPath);
        
        // Convert validity to number if provided
        const validity = options.validity ? parseInt(options.validity, 10) : undefined;
        
        // Configure the project
        await setupProject({
          projectPath,
          domain: options.domain,
          framework,
          organization: options.org,
          countryCode: options.country,
          state: options.state,
          locality: options.locality,
          validity
        });
        
        console.log(chalk.green('✅ Configuration complete!'));
        console.log(
          chalk.yellow(
            'ℹ️ Refer to your framework\'s documentation for more information on using HTTPS.'
          )
        );
      } catch (error) {
        console.error(chalk.red('❌ Error configuring project:'), error);
        process.exit(1);
      }
    });
}
