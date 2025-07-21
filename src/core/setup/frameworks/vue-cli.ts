/**
 * Module de configuration pour Vue CLI
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { CertificateResult } from '../../../types/certificate.types.js';

/**
 * Configure un projet Vue CLI pour utiliser HTTPS
 * @param projectPath - Chemin vers le projet
 * @param certPaths - Chemins vers les certificats
 */
export async function setupVueCli(
  projectPath: string,
  certPaths: CertificateResult
): Promise<void> {
  console.log(chalk.blue('Configuration de Vue CLI...'));

  // Créer ou mettre à jour vue.config.js
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

  console.log(
    chalk.green(
      'Vue CLI configuré! Utilisez "npm run serve" pour démarrer avec HTTPS.'
    )
  );
}
