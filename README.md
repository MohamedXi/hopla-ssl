# Hopla SSL

A simple tool to generate and install SSL certificates in local JavaScript projects.

## Description

Hopla SSL is a command-line utility that makes it easy to set up HTTPS for local development in JavaScript/TypeScript projects. It supports several popular frameworks:

- Next.js
- Create React App
- Angular
- Vue.js (Vue CLI and Vue + Vite)
- Svelte / SvelteKit
- Vite
- Webpack
- And others...

## Installation

### Installation as a development dependency (recommended)

```bash
npm install --save-dev hopla-ssl
```

### Usage without installation

```bash
npx hopla-ssl
```

## Usage

### Generate an SSL certificate

```bash
npx hopla-ssl generate
```

Options:
- `-d, --domain <domain>`: Domain for the certificate (default: localhost)
- `-o, --output <directory>`: Output directory for certificates (default: ./ssl)
- `--org <organization>`: Organization for the certificate (default: Hopla SSL Local CA)
- `--country <countryCode>`: Country code for the certificate (2 letters) (default: FR)
- `--state <state>`: State or province for the certificate (default: Local Development)
- `--locality <locality>`: Locality for the certificate (default: Development Environment)
- `--validity <days>`: Certificate validity in days (default: 365)

### Configure a project

```bash
npx hopla-ssl setup
```

Options:
- `-p, --path <path>`: Path to the project (default: current directory)
- `-d, --domain <domain>`: Domain for the certificate (default: localhost)
- `-f, --framework <framework>`: Framework used (auto-detected by default)
- `--org <organization>`: Organization for the certificate (default: Hopla SSL Local CA)
- `--country <countryCode>`: Country code for the certificate (2 letters) (default: FR)
- `--state <state>`: State or province for the certificate (default: Local Development)
- `--locality <locality>`: Locality for the certificate (default: Development Environment)
- `--validity <days>`: Certificate validity in days (default: 365)

### Help

```bash
npx hopla-ssl --help
```

## Examples

### Configure a Next.js project

```bash
cd my-nextjs-project
npm install --save-dev hopla-ssl
npx hopla-ssl setup
```

After configuration, you can start your server with HTTPS:

```bash
npm run dev:https
```

### Configure a React project

```bash
cd my-react-project
npm install --save-dev hopla-ssl
npx hopla-ssl setup
```

After configuration, you can start your server with HTTPS:

```bash
npm start
```

## How it works

1. Hopla SSL generates a self-signed SSL certificate for local development
2. It configures your project to use this certificate
3. It adds the necessary scripts to your package.json

## Supported Frameworks

| Framework | Configuration | Start Command |
|-----------|--------------|----------------------|
| Next.js | Creates a custom server | `npm run dev:https` |
| Create React App | Configures via .env | `npm start` |
| Angular | Updates angular.json | `npm run start:https` |
| Vue CLI | Creates vue.config.js | `npm run serve` |
| Vue + Vite | Updates vite.config.js | `npm run dev` |
| Svelte/SvelteKit | Configuration based on bundler | `npm run dev` |
| Webpack | Creates a webpack HTTPS config | `npm run start:https` |
| Other | Creates a simple Express server | `npm run start:https` |

## License

MIT
