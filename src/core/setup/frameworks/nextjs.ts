/**
 * Configuration module for Next.js
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { PackageJson } from '../../../types/framework.types.js';

/**
 * Configure a Next.js project to use HTTPS
 * @param projectPath - Path to the project
 */
export async function setupNextJs(projectPath: string): Promise<void> {
  console.log(chalk.blue('Configuring Next.js...'));

  // Create server.js file at the project root if it doesn't exist
  const serverJsPath = path.join(projectPath, 'server.js');

  // Check if server.js already exists
  let serverJsExists = false;
  try {
    serverJsExists = await fs.pathExists(serverJsPath);
  } catch (error) {
    console.log(chalk.yellow('Error checking if server.js exists:', error));
  }

  if (serverJsExists) {
    console.log(chalk.yellow('server.js already exists, skipping creation...'));
    console.log(
      chalk.yellow('Please ensure it includes HTTPS configuration or manually update it.')
    );
  } else {
    // Create new server.js file with HTTPS configuration
    const serverJsContent = `
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'ssl/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl/cert.pem'))
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on https://localhost:3000');
  });
});
`;

    await fs.writeFile(serverJsPath, serverJsContent);
    console.log(chalk.green('Created server.js with HTTPS configuration'));
  }

  // Update package.json to use the custom server
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson: PackageJson = await fs.readJson(packageJsonPath);

  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  // Check if dev:https script already exists
  const hasDevHttpsScript = packageJson.scripts['dev:https'] !== undefined;

  if (!hasDevHttpsScript) {
    // Add the dev:https script only if it doesn't exist
    packageJson.scripts['dev:https'] = 'node server.js';
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    console.log(chalk.green('Added "dev:https" script to package.json'));
  } else {
    console.log(
      chalk.yellow('"dev:https" script already exists in package.json, keeping existing value')
    );
  }

  console.log(chalk.green('Next.js configured! Use "npm run dev:https" to start with HTTPS.'));
}
