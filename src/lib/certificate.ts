import chalk from 'chalk';
import fs from 'fs-extra';
import mkcert from 'mkcert';
import path from 'path';
import { CertificateResult } from '../types.js';

/**
 * Génère un certificat SSL pour le développement local
 * @param {string} domain - Le domaine pour lequel générer le certificat (ex: localhost)
 * @param {string} outputDir - Le répertoire où stocker les certificats générés
 * @returns {Promise<CertificateResult>} - Chemins vers les fichiers de clé et certificat
 */
export async function generateCertificate(
  domain = 'localhost',
  outputDir = './ssl'
): Promise<CertificateResult> {
  try {
    console.log(chalk.blue(`Génération d'un certificat SSL pour ${domain}...`));

    // Créer le répertoire de sortie s'il n'existe pas
    await fs.ensureDir(outputDir);

    // Générer une nouvelle autorité de certification
    const ca = await mkcert.createCA({
      organization: 'Hopla SSL Local CA',
      countryCode: 'FR',
      state: 'Local Development',
      locality: 'Development Environment',
      validity: 365,
    } as any);

    // Générer un certificat signé par notre CA
    const cert = await mkcert.createCert({
      domains: [domain, `*.${domain}`, 'localhost', '127.0.0.1', '::1'],
      validity: 365,
      caKey: ca.key,
      caCert: ca.cert,
    } as any);

    // Chemins des fichiers
    const keyPath = path.join(outputDir, 'key.pem');
    const certPath = path.join(outputDir, 'cert.pem');
    const caPath = path.join(outputDir, 'ca.pem');

    // Écrire les fichiers
    await fs.writeFile(keyPath, cert.key);
    await fs.writeFile(certPath, cert.cert);
    await fs.writeFile(caPath, ca.cert);

    console.log(chalk.green(`Certificat généré avec succès dans ${outputDir}`));
    console.log(chalk.yellow('Fichiers créés:'));
    console.log(chalk.yellow(`- Clé privée: ${keyPath}`));
    console.log(chalk.yellow(`- Certificat: ${certPath}`));
    console.log(chalk.yellow(`- Certificat CA: ${caPath}`));

    return {
      key: keyPath,
      cert: certPath,
      ca: caPath,
    };
  } catch (error) {
    console.error(
      chalk.red('Erreur lors de la génération du certificat:'),
      error
    );
    throw error;
  }
}
