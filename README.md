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

### Trust the certificate

Install the SSL certificate in your system trust store to avoid browser warnings:

```bash
# On macOS and Linux, sudo is required
sudo npx hopla-ssl trust

# On Windows (run as Administrator)
npx hopla-ssl trust
```

> **Note**: Installing certificates in the system trust store requires administrator privileges.

Options:

- `-p, --path <path>`: Path to the project (default: current directory)
- `-d, --directory <directory>`: Directory containing the certificates (default: ./ssl)

If automatic installation fails, the tool will provide instructions for manual installation.

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

During setup, you'll be asked if you want to install the certificate in your system trust store. If you choose yes, the certificate will be automatically installed, avoiding browser warnings.

After configuration, you can start your server with HTTPS:

```bash
npm run dev:https
```

If you didn't install the certificate during setup, you can do it later:

```bash
npx hopla-ssl trust
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
4. It can install the certificate in your system trust store to avoid browser warnings

## Supported Frameworks

| Framework        | Configuration                   | Start Command         |
| ---------------- | ------------------------------- | --------------------- |
| Next.js          | Creates a custom server         | `npm run dev:https`   |
| Create React App | Configures via .env             | `npm start`           |
| Angular          | Updates angular.json            | `npm run start:https` |
| Vue CLI          | Creates vue.config.js           | `npm run serve`       |
| Vue + Vite       | Updates vite.config.js          | `npm run dev`         |
| Svelte/SvelteKit | Configuration based on bundler  | `npm run dev`         |
| Webpack          | Creates a webpack HTTPS config  | `npm run start:https` |
| Other            | Creates a simple Express server | `npm run start:https` |

## Contributing

Contributions are welcome! Here's how you can contribute to this project:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

### Development Setup

To set up the project for local development:

```bash
# Clone the repository
git clone https://github.com/MohamedXi/hopla-ssl.git
cd hopla-ssl

# Install dependencies
npm install

# Build the project
npm run build
```

### Testing Locally

To test your changes locally without publishing to npm:

```bash
# Link the package globally
npm link

# In your test project directory
npm link hopla-ssl
```

Alternatively, you can use the package directly from your local directory:

```bash
# In your test project
npx /path/to/your/local/hopla-ssl/directory setup
```

## Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for adding functionality in a backwards compatible manner
- **PATCH** version for backwards compatible bug fixes

Version updates are managed using npm version commands:

```bash
# For a patch release
npm version patch

# For a minor release
npm version minor

# For a major release
npm version major
```

After updating the version, the package can be published to npm:

```bash
npm publish
```

## License

MIT
