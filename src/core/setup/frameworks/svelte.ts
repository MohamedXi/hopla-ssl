/**
 * Configuration module for Svelte
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

/**
 * Configure a Svelte project to use HTTPS
 * @param projectPath - Path to the project
 */
export async function setupSvelte(projectPath: string): Promise<void> {
  console.log(chalk.blue('Configuring Svelte...'));

  // Check if it's a SvelteKit or standard Svelte project
  const svelteConfigPath = path.join(projectPath, 'svelte.config.js');
  const isSvelteKit = await fs.pathExists(svelteConfigPath);

  if (isSvelteKit) {
    // Configuration for SvelteKit
    const viteConfigPath = path.join(projectPath, 'vite.config.js');
    const viteConfigTsPath = path.join(projectPath, 'vite.config.ts');

    const configPath = (await fs.pathExists(viteConfigTsPath)) ? viteConfigTsPath : viteConfigPath;

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
      key: fs.readFileSync('./ssl/key.pem'),
      cert: fs.readFileSync('./ssl/cert.pem'),
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
      key: fs.readFileSync('./ssl/key.pem'),
      cert: fs.readFileSync('./ssl/cert.pem'),
    }
  }
});
`;

    // If the configuration file doesn't exist, create it
    if (!(await fs.pathExists(configPath))) {
      await fs.writeFile(isTypeScript ? viteConfigTsPath : viteConfigPath, viteConfigContent);
    } else {
      // If the file exists, try to modify it
      let existingConfig = await fs.readFile(configPath, 'utf-8');

      if (!existingConfig.includes('https:')) {
        // Replace defineConfig({ with defineConfig({ server: { https: { ... }},
        if (existingConfig.includes('defineConfig({')) {
          existingConfig = existingConfig.replace(
            'defineConfig({',
            `defineConfig({
  server: {
    https: {
      key: fs.readFileSync('./ssl/key.pem'),
      cert: fs.readFileSync('./ssl/cert.pem'),
    }
  },`
          );

          // Add imports if necessary
          if (!existingConfig.includes('import fs from')) {
            existingConfig = `import fs from 'fs';\nimport path from 'path';\n${existingConfig}`;
          }

          await fs.writeFile(configPath, existingConfig);
        } else {
          // If we can't modify the file, replace it
          await fs.writeFile(configPath, viteConfigContent);
        }
      }
    }
  } else {
    // Configuration for standard Svelte (rollup or webpack)
    const rollupConfigPath = path.join(projectPath, 'rollup.config.js');

    if (await fs.pathExists(rollupConfigPath)) {
      // Configuration for Rollup
      let rollupConfig = await fs.readFile(rollupConfigPath, 'utf-8');

      // Add HTTPS configuration if it doesn't already exist
      if (!rollupConfig.includes('https:')) {
        const importStatement = `import fs from 'fs';\nimport path from 'path';\n`;

        // Ajouter les imports si nécessaire
        if (!rollupConfig.includes('import fs from')) {
          rollupConfig = importStatement + rollupConfig;
        }

        // Look for server configuration
        if (rollupConfig.includes('!production && serve(')) {
          rollupConfig = rollupConfig.replace(
            '!production && serve(',
            `!production && serve({
        https: {
          key: fs.readFileSync('./ssl/key.pem'),
          cert: fs.readFileSync('./ssl/cert.pem'),
        },
      },`
          );
        } else {
          // Add a server configuration if it doesn't exist
          rollupConfig += `
// HTTPS configuration added by hopla-ssl
if (!production) {
  require('sirv')('public', {
    https: {
      key: fs.readFileSync('./ssl/key.pem'),
      cert: fs.readFileSync('./ssl/cert.pem'),
    }
  });
}
`;
        }

        await fs.writeFile(rollupConfigPath, rollupConfig);
      }
    } else {
      // Create a generic configuration file for Svelte
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJson = await fs.readJson(packageJsonPath);

      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }

      packageJson.scripts['dev:https'] =
        `HTTPS=true SSL_CRT_FILE=ssl/cert.pem SSL_KEY_FILE=ssl/key.pem npm run dev`;

      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }
  }

  console.log(
    chalk.green('Svelte configured! Use "npm run dev" or "npm run dev:https" to start with HTTPS.')
  );
}
