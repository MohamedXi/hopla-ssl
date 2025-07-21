import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generateCertificate } from './certificate.js';
import { SetupProjectOptions, CertificateResult, FrameworkType, PackageJson } from '../types.js';

// Obtenir le chemin du répertoire actuel en utilisant ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configure un projet pour utiliser HTTPS en local
 * @param {SetupProjectOptions} options - Options de configuration
 * @returns {Promise<void>}
 */
export async function setupProject({ projectPath, domain = 'localhost', framework }: SetupProjectOptions): Promise<void> {
  try {
    console.log(chalk.blue(`Configuration du projet ${framework} pour HTTPS...`));
    
    // Générer les certificats dans le dossier du projet
    const sslDir = path.join(projectPath, 'ssl');
    const certPaths = await generateCertificate(domain, sslDir);
    
    // Configurer le projet en fonction du framework
    switch (framework as FrameworkType) {
      case 'nextjs':
        await setupNextJs(projectPath, certPaths);
        break;
      case 'create-react-app':
        await setupCRA(projectPath, certPaths);
        break;
      case 'angular':
        await setupAngular(projectPath, certPaths);
        break;
      case 'vue-cli':
        await setupVueCli(projectPath, certPaths);
        break;
      case 'vite-vue':
      case 'vite':
        await setupVite(projectPath, certPaths);
        break;
      case 'svelte':
        await setupSvelte(projectPath, certPaths);
        break;
      case 'webpack':
        await setupWebpack(projectPath, certPaths);
        break;
      default:
        console.log(chalk.yellow(`Le framework ${framework} n'est pas directement supporté.`));
        await setupGeneric(projectPath, certPaths);
    }
    
    console.log(chalk.green('✅ Configuration terminée!'));
  } catch (error) {
    console.error(chalk.red('Erreur lors de la configuration du projet:'), error);
    throw error;
  }
}

/**
 * Configure un projet Next.js pour utiliser HTTPS
 * @param {string} projectPath - Chemin vers le projet
 * @param {CertificateResult} certPaths - Chemins vers les certificats
 */
async function setupNextJs(projectPath: string, certPaths: CertificateResult): Promise<void> {
  console.log(chalk.blue('Configuration de Next.js...'));
  
  // Créer le fichier server.js à la racine du projet
  const serverJsPath = path.join(projectPath, 'server.js');
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
  
  // Mettre à jour package.json pour utiliser le serveur personnalisé
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson: PackageJson = await fs.readJson(packageJsonPath);
  
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  packageJson.scripts['dev:https'] = 'node server.js';
  
  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  
  console.log(chalk.green('Next.js configuré! Utilisez "npm run dev:https" pour démarrer avec HTTPS.'));
}

/**
 * Configure un projet Create React App pour utiliser HTTPS
 * @param {string} projectPath - Chemin vers le projet
 * @param {CertificateResult} certPaths - Chemins vers les certificats
 */
async function setupCRA(projectPath: string, certPaths: CertificateResult): Promise<void> {
  console.log(chalk.blue('Configuration de Create React App...'));
  
  // Créer un fichier .env à la racine du projet
  const envPath = path.join(projectPath, '.env');
  const envContent = `
HTTPS=true
SSL_CRT_FILE=ssl/cert.pem
SSL_KEY_FILE=ssl/key.pem
`;

  await fs.writeFile(envPath, envContent);
  
  console.log(chalk.green('Create React App configuré! Utilisez "npm start" pour démarrer avec HTTPS.'));
}

/**
 * Configure un projet Angular pour utiliser HTTPS
 * @param {string} projectPath - Chemin vers le projet
 * @param {CertificateResult} certPaths - Chemins vers les certificats
 */
async function setupAngular(projectPath: string, certPaths: CertificateResult): Promise<void> {
  console.log(chalk.blue('Configuration d\'Angular...'));
  
  // Mettre à jour angular.json
  const angularJsonPath = path.join(projectPath, 'angular.json');
  
  if (await fs.pathExists(angularJsonPath)) {
    const angularJson = await fs.readJson(angularJsonPath);
    const projectName = Object.keys(angularJson.projects)[0];
    
    if (angularJson.projects[projectName].architect.serve.options) {
      angularJson.projects[projectName].architect.serve.options.ssl = true;
      angularJson.projects[projectName].architect.serve.options.sslKey = 'ssl/key.pem';
      angularJson.projects[projectName].architect.serve.options.sslCert = 'ssl/cert.pem';
      
      await fs.writeJson(angularJsonPath, angularJson, { spaces: 2 });
    }
  }
  
  // Mettre à jour package.json
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson: PackageJson = await fs.readJson(packageJsonPath);
  
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  packageJson.scripts['start:https'] = 'ng serve --ssl --ssl-key ssl/key.pem --ssl-cert ssl/cert.pem';
  
  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  
  console.log(chalk.green('Angular configuré! Utilisez "npm run start:https" pour démarrer avec HTTPS.'));
}

/**
 * Configure un projet Vue CLI pour utiliser HTTPS
 * @param {string} projectPath - Chemin vers le projet
 * @param {CertificateResult} certPaths - Chemins vers les certificats
 */
async function setupVueCli(projectPath: string, certPaths: CertificateResult): Promise<void> {
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
  
  console.log(chalk.green('Vue CLI configuré! Utilisez "npm run serve" pour démarrer avec HTTPS.'));
}

/**
 * Configure un projet Vite pour utiliser HTTPS
 * @param {string} projectPath - Chemin vers le projet
 * @param {CertificateResult} certPaths - Chemins vers les certificats
 */
async function setupVite(projectPath: string, certPaths: CertificateResult): Promise<void> {
  console.log(chalk.blue('Configuration de Vite...'));
  
  // Créer ou mettre à jour vite.config.js
  const viteConfigPath = path.join(projectPath, 'vite.config.js');
  let viteConfigContent = '';
  
  if (await fs.pathExists(viteConfigPath)) {
    // Lire le fichier existant
    const existingConfig = await fs.readFile(viteConfigPath, 'utf-8');
    
    // Vérifier si le fichier utilise ESM ou CJS
    const isESM = existingConfig.includes('export default') || existingConfig.includes('import');
    
    if (isESM) {
      viteConfigContent = `
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

// Importer la configuration existante
${existingConfig.replace('export default', 'const existingConfig =')}

// Fusionner avec notre configuration HTTPS
export default defineConfig({
  ...existingConfig,
  server: {
    ...existingConfig.server,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'ssl/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'ssl/cert.pem')),
    }
  }
});
`;
    } else {
      viteConfigContent = `
const fs = require('fs');
const path = require('path');
const { defineConfig } = require('vite');

// Importer la configuration existante
${existingConfig.replace('module.exports =', 'const existingConfig =')}

// Fusionner avec notre configuration HTTPS
module.exports = defineConfig({
  ...existingConfig,
  server: {
    ...existingConfig.server,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'ssl/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'ssl/cert.pem')),
    }
  }
});
`;
    }
  } else {
    // Créer un nouveau fichier de configuration
    viteConfigContent = `
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'ssl/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'ssl/cert.pem')),
    }
  }
});
`;
  }
  
  await fs.writeFile(viteConfigPath, viteConfigContent);
  
  console.log(chalk.green('Vite configuré! Utilisez "npm run dev" pour démarrer avec HTTPS.'));
}

/**
 * Configure un projet Svelte pour utiliser HTTPS
 * @param {string} projectPath - Chemin vers le projet
 * @param {CertificateResult} certPaths - Chemins vers les certificats
 */
async function setupSvelte(projectPath: string, certPaths: CertificateResult): Promise<void> {
  console.log(chalk.blue('Configuration de Svelte...'));
  
  // Vérifier si c'est un projet SvelteKit (vite.config.js) ou Svelte (rollup.config.js)
  const viteConfigPath = path.join(projectPath, 'vite.config.js');
  const rollupConfigPath = path.join(projectPath, 'rollup.config.js');
  
  if (await fs.pathExists(viteConfigPath)) {
    // C'est un projet SvelteKit, utiliser la configuration Vite
    await setupVite(projectPath, certPaths);
  } else if (await fs.pathExists(rollupConfigPath)) {
    // C'est un projet Svelte avec Rollup
    const rollupConfigContent = await fs.readFile(rollupConfigPath, 'utf-8');
    const updatedRollupConfig = rollupConfigContent.replace(
      /plugins: \[/,
      `plugins: [
    // Configuration HTTPS pour le serveur de développement
    {
      name: 'https',
      configureServer(server) {
        server.https({
          key: fs.readFileSync(path.join(__dirname, 'ssl/key.pem')),
          cert: fs.readFileSync(path.join(__dirname, 'ssl/cert.pem')),
        });
      }
    },`
    );
    
    // Ajouter les imports nécessaires
    const updatedWithImports = `
import fs from 'fs';
import path from 'path';
${updatedRollupConfig}`;
    
    await fs.writeFile(rollupConfigPath, updatedWithImports);
  }
  
  console.log(chalk.green('Svelte configuré! Utilisez "npm run dev" pour démarrer avec HTTPS.'));
}

/**
 * Configure un projet Webpack pour utiliser HTTPS
 * @param {string} projectPath - Chemin vers le projet
 * @param {CertificateResult} certPaths - Chemins vers les certificats
 */
async function setupWebpack(projectPath: string, certPaths: CertificateResult): Promise<void> {
  console.log(chalk.blue('Configuration de Webpack...'));
  
  // Chercher le fichier de configuration webpack
  const webpackConfigPaths = [
    path.join(projectPath, 'webpack.config.js'),
    path.join(projectPath, 'webpack.dev.js'),
    path.join(projectPath, 'config/webpack.config.js'),
    path.join(projectPath, 'config/webpack.dev.js')
  ];
  
  let webpackConfigPath: string | null = null;
  for (const configPath of webpackConfigPaths) {
    if (await fs.pathExists(configPath)) {
      webpackConfigPath = configPath;
      break;
    }
  }
  
  if (webpackConfigPath) {
    // Lire le fichier de configuration existant
    const webpackConfigContent = await fs.readFile(webpackConfigPath, 'utf-8');
    
    // Créer un fichier de configuration HTTPS séparé
    const webpackHttpsConfigPath = path.join(path.dirname(webpackConfigPath), 'webpack.https.js');
    const webpackHttpsConfigContent = `
const fs = require('fs');
const path = require('path');
const originalConfig = require('${path.relative(path.dirname(webpackHttpsConfigPath), webpackConfigPath)}');

// Cloner la configuration
const config = { ...originalConfig };

// Ajouter la configuration HTTPS
if (config.devServer) {
  config.devServer = {
    ...config.devServer,
    https: {
      key: fs.readFileSync(path.join(__dirname, '../ssl/key.pem')),
      cert: fs.readFileSync(path.join(__dirname, '../ssl/cert.pem')),
    }
  };
} else {
  config.devServer = {
    https: {
      key: fs.readFileSync(path.join(__dirname, '../ssl/key.pem')),
      cert: fs.readFileSync(path.join(__dirname, '../ssl/cert.pem')),
    }
  };
}

module.exports = config;
`;
    
    await fs.writeFile(webpackHttpsConfigPath, webpackHttpsConfigContent);
    
    // Mettre à jour package.json
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson: PackageJson = await fs.readJson(packageJsonPath);
    
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    // Trouver la commande de démarrage existante
    const startCommand = packageJson.scripts.start || packageJson.scripts.dev || 'webpack serve';
    packageJson.scripts['start:https'] = startCommand.replace('webpack', 'webpack --config webpack.https.js');
    
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  } else {
    console.log(chalk.yellow('Aucun fichier de configuration webpack trouvé. Configuration manuelle requise.'));
  }
  
  console.log(chalk.green('Webpack configuré! Utilisez "npm run start:https" pour démarrer avec HTTPS.'));
}

/**
 * Configuration générique pour les frameworks non supportés directement
 * @param {string} projectPath - Chemin vers le projet
 * @param {CertificateResult} certPaths - Chemins vers les certificats
 */
async function setupGeneric(projectPath: string, certPaths: CertificateResult): Promise<void> {
  console.log(chalk.blue('Configuration générique...'));
  
  // Créer un fichier server.js simple
  const serverJsPath = path.join(projectPath, 'https-server.js');
  const serverJsContent = `
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir les fichiers statiques du répertoire courant
app.use(express.static('.'));

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'ssl/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl/cert.pem'))
};

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(\`Serveur HTTPS démarré sur https://localhost:\${PORT}\`);
});
`;

  await fs.writeFile(serverJsPath, serverJsContent);
  
  // Vérifier si express est installé, sinon ajouter une note
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson: PackageJson = await fs.readJson(packageJsonPath);
    const hasExpress = packageJson.dependencies && packageJson.dependencies.express;
    
    if (!hasExpress) {
      console.log(chalk.yellow('Note: Ce script nécessite Express.js. Installez-le avec "npm install express".'));
    }
    
    // Ajouter un script pour démarrer le serveur HTTPS
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    packageJson.scripts['start:https'] = 'node https-server.js';
    
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }
  
  console.log(chalk.green('Configuration générique terminée! Utilisez "npm run start:https" pour démarrer avec HTTPS.'));
}
