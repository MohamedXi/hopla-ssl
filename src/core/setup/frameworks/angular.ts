/**
 * Configuration module for Angular
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { PackageJson } from '../../../types/framework.types.js';

/**
 * Configure an Angular project to use HTTPS
 * @param projectPath - Path to the project
 */
export async function setupAngular(projectPath: string): Promise<void> {
  console.log(chalk.blue('Configuring Angular...'));

  // Update angular.json
  const angularJsonPath = path.join(projectPath, 'angular.json');

  if (await fs.pathExists(angularJsonPath)) {
    const angularJson = await fs.readJson(angularJsonPath);
    const projectName = Object.keys(angularJson.projects)[0];
    let configUpdated = false;

    if (angularJson.projects[projectName].architect.serve.options) {
      const serveOptions = angularJson.projects[projectName].architect.serve.options;

      // Only update properties that don't exist
      if (serveOptions.ssl === undefined) {
        serveOptions.ssl = true;
        configUpdated = true;
        console.log(chalk.blue('Added ssl: true to angular.json'));
      } else {
        console.log(
          chalk.yellow('ssl option already exists in angular.json, keeping existing value')
        );
      }

      if (serveOptions.sslKey === undefined) {
        serveOptions.sslKey = 'ssl/key.pem';
        configUpdated = true;
        console.log(chalk.blue('Added sslKey: "ssl/key.pem" to angular.json'));
      } else {
        console.log(
          chalk.yellow('sslKey option already exists in angular.json, keeping existing value')
        );
      }

      if (serveOptions.sslCert === undefined) {
        serveOptions.sslCert = 'ssl/cert.pem';
        configUpdated = true;
        console.log(chalk.blue('Added sslCert: "ssl/cert.pem" to angular.json'));
      } else {
        console.log(
          chalk.yellow('sslCert option already exists in angular.json, keeping existing value')
        );
      }

      if (configUpdated) {
        await fs.writeJson(angularJsonPath, angularJson, { spaces: 2 });
        console.log(chalk.green('Updated angular.json with SSL configuration'));
      } else {
        console.log(chalk.yellow('No changes needed in angular.json, SSL already configured'));
      }
    }
  }

  // Update package.json
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson: PackageJson = await fs.readJson(packageJsonPath);

  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  // Check if start:https script already exists
  const hasStartHttpsScript = packageJson.scripts['start:https'] !== undefined;

  if (!hasStartHttpsScript) {
    // Add the start:https script only if it doesn't exist
    packageJson.scripts['start:https'] =
      `ng serve --ssl --ssl-key ssl/key.pem --ssl-cert ssl/cert.pem`;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    console.log(chalk.green('Added "start:https" script to package.json'));
  } else {
    console.log(
      chalk.yellow('"start:https" script already exists in package.json, keeping existing value')
    );
  }

  console.log(chalk.green('Angular configured! Use "npm run start:https" to start with HTTPS.'));
}
