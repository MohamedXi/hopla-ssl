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

  // Path to the .env file
  const envPath = path.join(projectPath, '.env');

  // Required environment variables for HTTPS
  const requiredEnvVars = {
    HTTPS: 'true',
    SSL_CRT_FILE: 'ssl/cert.pem',
    SSL_KEY_FILE: 'ssl/key.pem',
  };

  // Check if .env file exists
  let existingContent = '';
  try {
    if (await fs.pathExists(envPath)) {
      existingContent = await fs.readFile(envPath, 'utf8');
      console.log(chalk.blue('Existing .env file found, preserving content...'));
    }
  } catch (error) {
    console.log(chalk.yellow('No existing .env file found, creating new one...'));
  }

  // Parse existing environment variables
  const existingEnvVars = new Map();
  if (existingContent) {
    const lines = existingContent.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key) {
          existingEnvVars.set(key.trim(), valueParts.join('=').trim());
        }
      }
    }
  }

  // Add required variables if they don't exist
  let updatedContent = existingContent;
  let addedVars = false;

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!existingEnvVars.has(key)) {
      // Add a newline if needed
      if (updatedContent && !updatedContent.endsWith('\n')) {
        updatedContent += '\n';
      }
      updatedContent += `${key}=${value}\n`;
      addedVars = true;
      console.log(chalk.blue(`Added ${key}=${value} to .env file`));
    } else {
      console.log(chalk.yellow(`${key} already exists in .env file, keeping existing value`));
    }
  }

  // Write the updated content back to the file
  await fs.writeFile(envPath, updatedContent);

  if (addedVars) {
    console.log(
      chalk.green('Create React App configured for HTTPS! Use "npm start" to start with HTTPS.')
    );
  } else {
    console.log(
      chalk.green(
        'Create React App already configured for HTTPS! Use "npm start" to start with HTTPS.'
      )
    );
  }
}
