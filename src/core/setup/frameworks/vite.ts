/**
 * Configuration module for Vite
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

/**
 * Configure a Vite project to use HTTPS
 * @param projectPath - Path to the project
 */
export async function setupVite(projectPath: string): Promise<void> {
  console.log(chalk.blue('Configuring Vite...'));

  // Create or update vite.config.js/ts
  const viteConfigJsPath = path.join(projectPath, 'vite.config.js');
  const viteConfigTsPath = path.join(projectPath, 'vite.config.ts');

  const configPath = (await fs.pathExists(viteConfigTsPath)) ? viteConfigTsPath : viteConfigJsPath;

  const isTypeScript = configPath === viteConfigTsPath;

  const viteConfigContent = isTypeScript
    ? `
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
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
import fs from 'fs';
import path from 'path';

export default defineConfig({
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
    await fs.writeFile(isTypeScript ? viteConfigTsPath : viteConfigJsPath, viteConfigContent);
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

  console.log(chalk.green('Vite configured! Use "npm run dev" to start with HTTPS.'));
}
