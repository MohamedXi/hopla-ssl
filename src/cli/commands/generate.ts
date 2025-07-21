/**
 * Command to generate SSL certificates
 */
import chalk from 'chalk';
import { Command } from 'commander';
import { generateCertificate } from '../../core/certificate/index.js';
import { GenerateCommandOptions } from '../../types/index.js';

/**
 * Configure the generate command
 * @param program - Commander instance
 */
export function configureGenerateCommand(program: Command): void {
  program
    .command('generate')
    .description('Generate a self-signed SSL certificate')
    .option('-d, --domain <domain>', 'Domain for the certificate', 'localhost')
    .option('-o, --output <dir>', 'Output directory', './ssl')
    .option('--org <organization>', 'Organization for the certificate', 'Hopla SSL Local CA')
    .option('--country <countryCode>', 'Country code for the certificate (2 letters)', 'FR')
    .option('--state <state>', 'State or province for the certificate', 'Local Development')
    .option('--locality <locality>', 'Locality for the certificate', 'Development Environment')
    .option('--validity <days>', 'Certificate validity in days', '365')
    .action(async (options: GenerateCommandOptions) => {
      try {
        console.log(chalk.blue('🔐 Generating SSL certificate...'));

        // Convertir validity en nombre si fourni
        const validity = options.validity ? parseInt(options.validity, 10) : undefined;

        const result = await generateCertificate(options.domain, options.output, {
          organization: options.org,
          countryCode: options.country,
          state: options.state,
          locality: options.locality,
          validity,
        });

        console.log(chalk.green('✅ Certificate successfully generated!'));
        console.log(chalk.yellow('📁 Files created:'));
        console.log(chalk.yellow(`- Private key: ${result.key}`));
        console.log(chalk.yellow(`- Certificate: ${result.cert}`));
        if (result.ca) {
          console.log(chalk.yellow(`- CA Certificate: ${result.ca}`));
        }
      } catch (error) {
        console.error(chalk.red('❌ Error generating certificate:'), error);
        process.exit(1);
      }
    });
}
