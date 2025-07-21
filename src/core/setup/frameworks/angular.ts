/**
 * Configuration module for Angular
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { CertificateResult } from '../../../types/certificate.types.js';
import { PackageJson } from '../../../types/framework.types.js';

/**
 * Configure an Angular project to use HTTPS
 * @param projectPath - Path to the project
 * @param certPaths - Paths to the certificates
 */
export async function setupAngular(
  projectPath: string,
  certPaths: CertificateResult
): Promise<void> {
  console.log(chalk.blue("Configuring Angular..."));

  // Update angular.json
  const angularJsonPath = path.join(projectPath, 'angular.json');

  if (await fs.pathExists(angularJsonPath)) {
    const angularJson = await fs.readJson(angularJsonPath);
    const projectName = Object.keys(angularJson.projects)[0];

    if (angularJson.projects[projectName].architect.serve.options) {
      angularJson.projects[projectName].architect.serve.options.ssl = true;
      angularJson.projects[projectName].architect.serve.options.sslKey =
        'ssl/key.pem';
      angularJson.projects[projectName].architect.serve.options.sslCert =
        'ssl/cert.pem';

      await fs.writeJson(angularJsonPath, angularJson, { spaces: 2 });
    }
  }

  // Update package.json
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson: PackageJson = await fs.readJson(packageJsonPath);

  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  packageJson.scripts['start:https'] =
    'ng serve --ssl --ssl-key ssl/key.pem --ssl-cert ssl/cert.pem';

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

  console.log(
    chalk.green(
      'Angular configured! Use "npm run start:https" to start with HTTPS.'
    )
  );
}
