/**
 * Command to trust the SSL certificate in the system
 */
import chalk from 'chalk';
import { exec } from 'child_process';
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Configure the trust command
 * @param program - Commander instance
 */
export function configureTrustCommand(program: Command): void {
  program
    .command('trust')
    .description('Install the SSL certificate in your system trust store')
    .option('-p, --path <path>', 'Path to the project', process.cwd())
    .option('-d, --directory <directory>', 'Directory containing the certificates', './ssl')
    .action(async (options) => {
      try {
        console.log(chalk.blue('🔒 Installing SSL certificate in your system trust store...'));

        // Resolve the absolute path of the project and certificate
        const projectPath = path.resolve(options.path);
        const sslDir = path.resolve(projectPath, options.directory);
        const caPath = path.join(sslDir, 'ca.pem');

        // Check if the CA certificate exists
        if (!(await fs.pathExists(caPath))) {
          console.error(chalk.red('❌ CA certificate not found at:'), caPath);
          console.log(
            chalk.yellow(
              'Please run `hopla-ssl setup` or `hopla-ssl generate` first to create the certificates.'
            )
          );
          process.exit(1);
        }

        // Install the certificate in the system trust store
        await installCertificate(caPath);

        console.log(
          chalk.green('✅ Certificate successfully installed in your system trust store!')
        );
        console.log(
          chalk.yellow('You may need to restart your browser for the changes to take effect.')
        );
      } catch (error) {
        console.error(chalk.red('❌ Error installing certificate:'), error);
        process.exit(1);
      }
    });
}

/**
 * Install the certificate in the system trust store
 * @param caPath - Path to the CA certificate
 */
async function installCertificate(caPath: string): Promise<void> {
  try {
    const platform = process.platform;

    if (platform === 'darwin') {
      // macOS
      console.log(chalk.blue('Installing certificate on macOS...'));
      console.log(chalk.yellow('Note: This requires administrator privileges'));

      // Try to use sudo for macOS
      try {
        console.log(chalk.yellow('You may be prompted for your password...'));
        await execAsync(
          `sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "${caPath}"`
        );
        console.log(
          chalk.green('✅ Certificate successfully installed in your system trust store!')
        );
      } catch (error) {
        console.error(chalk.red('Error using sudo:'), error);
        console.log(
          chalk.yellow('\nAlternative method: You can manually install the certificate:')
        );
        console.log(chalk.cyan('1. Open the certificate in Keychain Access:'));
        console.log(chalk.cyan(`   open "${caPath}"`));
        console.log(chalk.cyan('2. Double-click on the certificate'));
        console.log(chalk.cyan('3. Expand the "Trust" section'));
        console.log(chalk.cyan('4. Change "When using this certificate" to "Always Trust"'));
        console.log(
          chalk.cyan('5. Close the window and enter your administrator password when prompted')
        );

        // Try to open the certificate with Keychain Access
        try {
          await execAsync(`open "${caPath}"`);
        } catch (openError) {
          console.error(chalk.red('Could not open the certificate:'), openError);
        }

        throw new Error(
          'Could not install certificate automatically. Please follow the manual instructions above.'
        );
      }
    } else if (platform === 'win32') {
      // Windows
      console.log(chalk.blue('Installing certificate on Windows...'));
      console.log(chalk.yellow('Note: This may require administrator privileges'));
      await execAsync(`certutil -addstore -f "ROOT" "${caPath}"`);
    } else if (platform === 'linux') {
      // Linux (Ubuntu/Debian based)
      console.log(chalk.blue('Installing certificate on Linux...'));
      console.log(chalk.yellow('Note: This requires sudo privileges'));

      // Check if we're on a Debian/Ubuntu system
      const hasApt = await checkCommandExists('apt');
      if (hasApt) {
        await execAsync(
          `sudo cp "${caPath}" /usr/local/share/ca-certificates/hopla-ssl-ca.crt && sudo update-ca-certificates`
        );
      } else {
        // Try with certutil (RHEL/Fedora/CentOS)
        const hasCertutil = await checkCommandExists('certutil');
        if (hasCertutil) {
          await execAsync(
            `sudo certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n "Hopla SSL Local CA" -i "${caPath}"`
          );
        } else {
          throw new Error(
            'Unsupported Linux distribution. Please install the certificate manually.'
          );
        }
      }
    } else {
      throw new Error(
        `Unsupported platform: ${platform}. Please install the certificate manually.`
      );
    }
  } catch (error) {
    console.error(chalk.red('Error installing certificate:'), error);
    console.log(chalk.yellow('You may need to install the certificate manually:'));
    console.log(chalk.yellow(`- Certificate path: ${caPath}`));
    throw error;
  }
}

/**
 * Check if a command exists in the system
 * @param command - Command to check
 */
async function checkCommandExists(command: string): Promise<boolean> {
  try {
    await execAsync(`which ${command}`);
    return true;
  } catch {
    return false;
  }
}
