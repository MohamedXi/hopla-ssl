/**
 * Configuration module for Create React App
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

/**
 * Configure a Create React App project to use HTTPS
 * @param projectPath - Path to the project
 */
export async function setupCRA(projectPath: string): Promise<void> {
  console.log(chalk.blue('Configuring Create React App...'));

  // Create a .env file at the project root
  const envPath = path.join(projectPath, '.env');
  const envContent = `
HTTPS=true
SSL_CRT_FILE=ssl/cert.pem
SSL_KEY_FILE=ssl/key.pem
`;

  await fs.writeFile(envPath, envContent);

  console.log(chalk.green('Create React App configured! Use "npm start" to start with HTTPS.'));
}
