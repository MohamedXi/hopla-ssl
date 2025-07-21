/**
 * Configuration module for Webpack
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

/**
 * Configure a Webpack project to use HTTPS
 * @param projectPath - Path to the project
 */
export async function setupWebpack(projectPath: string): Promise<void> {
  console.log(chalk.blue('Configuring Webpack...'));

  // Look for the webpack configuration file
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
    // Modify the existing webpack configuration file
    let webpackConfig = await fs.readFile(configPath, 'utf-8');

    // Add HTTPS configuration if it doesn't already exist
    if (!webpackConfig.includes('https:')) {
      const importStatement = `const fs = require('fs');\nconst path = require('path');\n`;

      // Add imports if necessary
      if (!webpackConfig.includes('const fs =') && !webpackConfig.includes('import fs from')) {
        webpackConfig = importStatement + webpackConfig;
      }

      // Look for the development server configuration
      if (webpackConfig.includes('devServer:')) {
        // Find the position of devServer
        const devServerPos = webpackConfig.indexOf('devServer:');
        const openBracePos = webpackConfig.indexOf('{', devServerPos);

        if (openBracePos !== -1) {
          // Insert HTTPS configuration after the opening brace
          webpackConfig =
            webpackConfig.slice(0, openBracePos + 1) +
            `
      https: {
        key: fs.readFileSync('./ssl/key.pem'),
        cert: fs.readFileSync('./ssl/cert.pem'),
      },` +
            webpackConfig.slice(openBracePos + 1);
        }
      } else {
        // Add a devServer configuration if it doesn't exist
        if (webpackConfig.includes('module.exports = {')) {
          webpackConfig = webpackConfig.replace(
            'module.exports = {',
            `module.exports = {
  devServer: {
    https: {
      key: fs.readFileSync('./ssl/key.pem'),
      cert: fs.readFileSync('./ssl/cert.pem'),
    },
  },`
          );
        }
      }

      await fs.writeFile(configPath, webpackConfig);
    }
  } else {
    // Create a new webpack configuration file
    const webpackConfigPath = path.join(projectPath, 'webpack.config.js');
    const webpackConfigContent = `
const fs = require('fs');
const path = require('path');

module.exports = {
  // Your existing webpack configuration
  devServer: {
    https: {
      key: fs.readFileSync('./ssl/key.pem'),
      cert: fs.readFileSync('./ssl/cert.pem'),
    },
    hot: true,
    historyApiFallback: true,
  },
};
`;

    await fs.writeFile(webpackConfigPath, webpackConfigContent);
  }

  // Update package.json to add an HTTPS startup script
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);

    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    // Add a script to start with HTTPS
    packageJson.scripts['start:https'] = 'webpack serve --https';

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  console.log(chalk.green('Webpack configured! Use "npm run start:https" to start with HTTPS.'));
}
