/**
 * CLI entry point
 */
import chalk from 'chalk';
import { Command } from 'commander';
import {
  configureGenerateCommand,
  configureSetupCommand,
  configureTrustCommand,
} from './commands/index.js';

/**
 * Configure and run the CLI
 */
export function runCLI(): void {
  const program = new Command();

  program
    .name('hopla-ssl')
    .description('Tool to facilitate the use of HTTPS in local development')
    .version('1.0.0');

  // Configure commands
  configureGenerateCommand(program);
  configureSetupCommand(program);
  configureTrustCommand(program);

  // Display help if no command is specified
  if (process.argv.length <= 2) {
    console.log(chalk.blue('🔒 Hopla SSL - Easy HTTPS for local development'));
    program.help();
  }

  // Error handling
  program.exitOverride((err) => {
    if (err.code === 'commander.helpDisplayed') {
      process.exit(0);
    }

    console.error(chalk.red('❌ Error:'), err.message);
    process.exit(1);
  });

  try {
    program.parse(process.argv);
  } catch (error) {
    console.error(chalk.red('❌ Unexpected error:'), error);
    process.exit(1);
  }
}
