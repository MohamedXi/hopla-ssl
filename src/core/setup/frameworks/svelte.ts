/**
 * Module de configuration pour Svelte
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { CertificateResult } from '../../../types/certificate.types.js';

/**
 * Configure un projet Svelte pour utiliser HTTPS
 * @param projectPath - Chemin vers le projet
 * @param certPaths - Chemins vers les certificats
 */
export async function setupSvelte(
  projectPath: string,
  certPaths: CertificateResult
): Promise<void> {
  console.log(chalk.blue('Configuration de Svelte...'));

  // Vérifier si c'est un projet SvelteKit ou Svelte standard
  const svelteConfigPath = path.join(projectPath, 'svelte.config.js');
  const isSvelteKit = await fs.pathExists(svelteConfigPath);

  if (isSvelteKit) {
    // Configuration pour SvelteKit
    const viteConfigPath = path.join(projectPath, 'vite.config.js');
    const viteConfigTsPath = path.join(projectPath, 'vite.config.ts');

    const configPath = (await fs.pathExists(viteConfigTsPath))
      ? viteConfigTsPath
      : viteConfigPath;

    const isTypeScript = configPath === viteConfigTsPath;

    const viteConfigContent = isTypeScript
      ? `
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [sveltekit()],
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
import { sveltekit } from '@sveltejs/kit/vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'ssl/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'ssl/cert.pem')),
    }
  }
});
`;

    // Si le fichier de configuration n'existe pas, le créer
    if (!(await fs.pathExists(configPath))) {
      await fs.writeFile(
        isTypeScript ? viteConfigTsPath : viteConfigPath,
        viteConfigContent
      );
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
  } else {
    // Configuration pour Svelte standard (rollup ou webpack)
    const rollupConfigPath = path.join(projectPath, 'rollup.config.js');

    if (await fs.pathExists(rollupConfigPath)) {
      // Configuration pour Rollup
      let rollupConfig = await fs.readFile(rollupConfigPath, 'utf-8');

      // Ajouter la configuration HTTPS si elle n'existe pas déjà
      if (!rollupConfig.includes('https:')) {
        const importStatement = `import fs from 'fs';\nimport path from 'path';\n`;

        // Ajouter les imports si nécessaire
        if (!rollupConfig.includes('import fs from')) {
          rollupConfig = importStatement + rollupConfig;
        }

        // Chercher la configuration du serveur
        if (rollupConfig.includes('!production && serve(')) {
          rollupConfig = rollupConfig.replace(
            '!production && serve(',
            `!production && serve({
        https: {
          key: fs.readFileSync(path.resolve(__dirname, 'ssl/key.pem')),
          cert: fs.readFileSync(path.resolve(__dirname, 'ssl/cert.pem')),
        },
      },`
          );
        } else {
          // Ajouter une configuration de serveur si elle n'existe pas
          rollupConfig += `
// Configuration HTTPS ajoutée par hopla-ssl
if (!production) {
  require('sirv')('public', {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'ssl/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'ssl/cert.pem')),
    }
  });
}
`;
        }

        await fs.writeFile(rollupConfigPath, rollupConfig);
      }
    } else {
      // Créer un fichier de configuration générique pour Svelte
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJson = await fs.readJson(packageJsonPath);

      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }

      packageJson.scripts['dev:https'] =
        'HTTPS=true SSL_CRT_FILE=ssl/cert.pem SSL_KEY_FILE=ssl/key.pem npm run dev';

      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }
  }

  console.log(
    chalk.green(
      'Svelte configuré! Utilisez "npm run dev" ou "npm run dev:https" pour démarrer avec HTTPS.'
    )
  );
}
