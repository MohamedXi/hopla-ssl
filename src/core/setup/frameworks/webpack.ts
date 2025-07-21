/**
 * Module de configuration pour Webpack
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { CertificateResult } from '../../../types/certificate.types.js';

/**
 * Configure un projet Webpack pour utiliser HTTPS
 * @param projectPath - Chemin vers le projet
 * @param certPaths - Chemins vers les certificats
 */
export async function setupWebpack(
  projectPath: string,
  certPaths: CertificateResult
): Promise<void> {
  console.log(chalk.blue('Configuration de Webpack...'));

  // Chercher le fichier de configuration webpack
  const webpackConfigPaths = [
    path.join(projectPath, 'webpack.config.js'),
    path.join(projectPath, 'webpack.dev.js'),
    path.join(projectPath, 'config/webpack.config.js'),
    path.join(projectPath, 'config/webpack.dev.js'),
  ];

  let configPath = '';
  for (const p of webpackConfigPaths) {
    if (await fs.pathExists(p)) {
      configPath = p;
      break;
    }
  }

  if (configPath) {
    // Modifier le fichier de configuration webpack existant
    let webpackConfig = await fs.readFile(configPath, 'utf-8');

    // Ajouter la configuration HTTPS si elle n'existe pas déjà
    if (!webpackConfig.includes('https:')) {
      const importStatement = `const fs = require('fs');\nconst path = require('path');\n`;
      
      // Ajouter les imports si nécessaire
      if (!webpackConfig.includes('const fs =') && !webpackConfig.includes('import fs from')) {
        webpackConfig = importStatement + webpackConfig;
      }
      
      // Chercher la configuration du serveur de développement
      if (webpackConfig.includes('devServer:')) {
        // Trouver la position de devServer
        const devServerPos = webpackConfig.indexOf('devServer:');
        const openBracePos = webpackConfig.indexOf('{', devServerPos);
        
        if (openBracePos !== -1) {
          // Insérer la configuration HTTPS après l'ouverture de l'accolade
          webpackConfig = webpackConfig.slice(0, openBracePos + 1) + `
      https: {
        key: fs.readFileSync(path.resolve(__dirname, 'ssl/key.pem')),
        cert: fs.readFileSync(path.resolve(__dirname, 'ssl/cert.pem')),
      },` + webpackConfig.slice(openBracePos + 1);
        }
      } else {
        // Ajouter une configuration devServer si elle n'existe pas
        if (webpackConfig.includes('module.exports = {')) {
          webpackConfig = webpackConfig.replace(
            'module.exports = {',
            `module.exports = {
  devServer: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'ssl/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'ssl/cert.pem')),
    },
  },`
          );
        }
      }
      
      await fs.writeFile(configPath, webpackConfig);
    }
  } else {
    // Créer un nouveau fichier de configuration webpack
    const webpackConfigPath = path.join(projectPath, 'webpack.config.js');
    const webpackConfigContent = `
const fs = require('fs');
const path = require('path');

module.exports = {
  // Votre configuration webpack existante
  devServer: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'ssl/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'ssl/cert.pem')),
    },
    hot: true,
    historyApiFallback: true,
  },
};
`;

    await fs.writeFile(webpackConfigPath, webpackConfigContent);
  }

  // Mettre à jour package.json pour ajouter un script de démarrage HTTPS
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    // Ajouter un script pour démarrer avec HTTPS
    packageJson.scripts['start:https'] = 'webpack serve --https';
    
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  console.log(
    chalk.green(
      'Webpack configuré! Utilisez "npm run start:https" pour démarrer avec HTTPS.'
    )
  );
}
