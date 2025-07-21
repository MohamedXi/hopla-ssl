/**
 * Module de configuration générique pour les frameworks non directement supportés
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { CertificateResult } from '../../../types/certificate.types.js';
import { PackageJson } from '../../../types/framework.types.js';

/**
 * Configure un projet générique pour utiliser HTTPS
 * @param projectPath - Chemin vers le projet
 * @param certPaths - Chemins vers les certificats
 */
export async function setupGeneric(
  projectPath: string,
  certPaths: CertificateResult
): Promise<void> {
  console.log(chalk.blue('Configuration générique...'));

  // Créer un fichier server.js à la racine du projet
  const serverJsPath = path.join(projectPath, 'https-server.js');
  const serverJsContent = `
/**
 * Serveur HTTPS générique pour le développement local
 * Généré par hopla-ssl
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const app = express();

// Chemin vers le dossier contenant les fichiers statiques
// Modifiez cette valeur selon votre projet
const staticDir = path.join(__dirname, 'dist');

// Configuration HTTPS
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'ssl/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl/cert.pem'))
};

// Servir les fichiers statiques
app.use(express.static(staticDir));

// Rediriger toutes les routes vers index.html pour les SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// Démarrer le serveur HTTPS
const PORT = process.env.PORT || 3000;
https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(\`Serveur HTTPS démarré sur https://localhost:\${PORT}\`);
});
`;

  await fs.writeFile(serverJsPath, serverJsContent);

  // Vérifier si express est installé, sinon ajouter une note
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson: PackageJson = await fs.readJson(packageJsonPath);
    const hasExpress = packageJson.dependencies?.express || packageJson.devDependencies?.express;
    
    if (!hasExpress) {
      console.log(
        chalk.yellow(
          'Note: Ce serveur générique nécessite Express. Installez-le avec: npm install express --save'
        )
      );
    }
    
    // Ajouter un script pour démarrer le serveur HTTPS
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    packageJson.scripts['start:https'] = 'node https-server.js';
    
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  // Créer un fichier README-HTTPS.md avec des instructions
  const readmePath = path.join(projectPath, 'README-HTTPS.md');
  const readmeContent = `
# Configuration HTTPS pour le développement local

Ce projet a été configuré pour le développement HTTPS local avec [hopla-ssl](https://github.com/votre-username/hopla-ssl).

## Certificats

Les certificats SSL auto-signés ont été générés dans le dossier \`ssl/\`:
- \`key.pem\`: Clé privée
- \`cert.pem\`: Certificat
- \`ca.pem\`: Certificat de l'autorité de certification

## Utilisation

Pour démarrer le serveur de développement avec HTTPS:

\`\`\`bash
npm run start:https
\`\`\`

## Configuration personnalisée

Le fichier \`https-server.js\` contient une configuration de serveur HTTPS générique.
Vous devrez peut-être l'adapter à votre projet:

1. Modifiez la variable \`staticDir\` pour pointer vers le dossier contenant vos fichiers statiques
2. Ajustez la configuration du serveur selon vos besoins

## Dépendances requises

Ce serveur nécessite Express. Si vous ne l'avez pas déjà installé:

\`\`\`bash
npm install express --save
\`\`\`
`;

  await fs.writeFile(readmePath, readmeContent);

  console.log(
    chalk.green(
      'Configuration générique terminée! Utilisez "npm run start:https" pour démarrer avec HTTPS.'
    )
  );
  console.log(
    chalk.yellow(
      'Consultez le fichier README-HTTPS.md pour plus d\'informations sur la configuration.'
    )
  );
}
