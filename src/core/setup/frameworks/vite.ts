/**
 * Module de configuration pour Vite
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { CertificateResult } from '../../../types/certificate.types.js';

/**
 * Configure un projet Vite pour utiliser HTTPS
 * @param projectPath - Chemin vers le projet
 * @param certPaths - Chemins vers les certificats
 */
export async function setupVite(
  projectPath: string,
  certPaths: CertificateResult
): Promise<void> {
  console.log(chalk.blue('Configuration de Vite...'));

  // Créer ou mettre à jour vite.config.js/ts
  const viteConfigJsPath = path.join(projectPath, 'vite.config.js');
  const viteConfigTsPath = path.join(projectPath, 'vite.config.ts');
  
  const configPath = await fs.pathExists(viteConfigTsPath) 
    ? viteConfigTsPath 
    : viteConfigJsPath;
  
  const isTypeScript = configPath === viteConfigTsPath;
  
  const viteConfigContent = isTypeScript 
    ? `
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'ssl/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'ssl/cert.pem')),
    }
  }
});
`
    : `
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'ssl/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'ssl/cert.pem')),
    }
  }
});
`;

  // Si le fichier de configuration n'existe pas, le créer
  if (!await fs.pathExists(configPath)) {
    await fs.writeFile(isTypeScript ? viteConfigTsPath : viteConfigJsPath, viteConfigContent);
  } else {
    // Si le fichier existe, essayer de le modifier
    let existingConfig = await fs.readFile(configPath, 'utf-8');
    
    if (!existingConfig.includes('https:')) {
      // Remplacer defineConfig({ par defineConfig({ server: { https: { ... }},
      if (existingConfig.includes('defineConfig({')) {
        existingConfig = existingConfig.replace(
          'defineConfig({', 
          `defineConfig({
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'ssl/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'ssl/cert.pem')),
    }
  },`
        );
        
        // Ajouter les imports si nécessaire
        if (!existingConfig.includes('import fs from')) {
          existingConfig = `import fs from 'fs';\nimport path from 'path';\n${existingConfig}`;
        }
        
        await fs.writeFile(configPath, existingConfig);
      } else {
        // Si on ne peut pas modifier le fichier, le remplacer
        await fs.writeFile(configPath, viteConfigContent);
      }
    }
  }

  console.log(
    chalk.green(
      'Vite configuré! Utilisez "npm run dev" pour démarrer avec HTTPS.'
    )
  );
}
