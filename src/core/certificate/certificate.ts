/**
 * SSL certificate generation module
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import mkcert from 'mkcert';
import path from 'path';
import { CertificateResult, GenerateCertificateOptions } from '../../types/certificate.types.js';

/**
 * Generates an SSL certificate for local development
 * @param domain - The domain for which to generate the certificate (e.g. localhost)
 * @param outputDir - The directory where to store the generated certificates
 * @param options - Additional options for certificate generation
 * @returns Paths to the key and certificate files
 */
export async function generateCertificate(
  domain = 'localhost',
  outputDir = './ssl',
  options?: Partial<GenerateCertificateOptions>
): Promise<CertificateResult> {
  try {
    console.log(chalk.blue(`Generating SSL certificate for ${domain}...`));

    // Create the output directory if it doesn't exist
    await fs.ensureDir(outputDir);

    // Generate a new certificate authority
    const ca = await mkcert.createCA({
      organization: options?.organization || 'Hopla SSL Local CA',
      countryCode: options?.countryCode || 'FR',
      state: options?.state || 'Local Development',
      locality: options?.locality || 'Development Environment',
      validity: options?.validity || 365,
    } as any);

    // Generate a certificate signed by our CA
    const cert = await mkcert.createCert({
      domains: [domain, `*.${domain}`, 'localhost', '127.0.0.1', '::1'],
      validity: options?.validity || 365,
      ca: {
        key: ca.key,
        cert: ca.cert,
      },
    } as any);

    // File paths
    const keyPath = path.join(outputDir, 'key.pem');
    const certPath = path.join(outputDir, 'cert.pem');
    const caPath = path.join(outputDir, 'ca.pem');

    // Write the files
    await fs.writeFile(keyPath, cert.key);
    await fs.writeFile(certPath, cert.cert);
    await fs.writeFile(caPath, ca.cert);

    console.log(chalk.green(`Certificate successfully generated in ${outputDir}`));
    console.log(chalk.yellow('Files created:'));
    console.log(chalk.yellow(`- Private key: ${keyPath}`));
    console.log(chalk.yellow(`- Certificate: ${certPath}`));
    console.log(chalk.yellow(`- CA Certificate: ${caPath}`));

    return {
      key: keyPath,
      cert: certPath,
      ca: caPath,
    };
  } catch (error) {
    console.error(chalk.red('Error generating certificate:'), error);
    throw error;
  }
}
