/**
 * Configuration module for Vue CLI
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

/**
 * Configure a Vue CLI project to use HTTPS
 * @param projectPath - Path to the project
 */
export async function setupVueCli(projectPath: string): Promise<void> {
  console.log(chalk.blue('Configuring Vue CLI...'));

  // Create or update vue.config.js
  const vueConfigPath = path.join(projectPath, 'vue.config.js');
  const vueConfigContent = `
const fs = require('fs');
const path = require('path');

module.exports = {
  devServer: {
    https: {
      key: fs.readFileSync(path.join(__dirname, 'ssl/key.pem')),
      cert: fs.readFileSync(path.join(__dirname, 'ssl/cert.pem')),
    }
  }
};
`;

  await fs.writeFile(vueConfigPath, vueConfigContent);

  console.log(chalk.green('Vue CLI configured! Use "npm run serve" to start with HTTPS.'));
}
