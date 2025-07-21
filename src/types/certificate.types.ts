/**
 * Types for SSL certificates
 */

/**
 * Types for mkcert
 */
export interface CertificateAuthorityOptions {
  organization: string;
  countryCode: string;
  state: string;
  locality: string;
  validity: number;
}

/**
 * Certificate generation options
 */
export interface CertificateOptions {
  domains: string[];
  validity: number;
  caKey: Buffer;
  caCert: Buffer;
}

/**
 * Certificate generation result
 */
export interface CertificateResult {
  key: string;
  cert: string;
  ca?: string;
}

/**
 * Certificate generation options
 */
export interface GenerateCertificateOptions {
  domain: string;
  outputDir: string;
  organization?: string;
  countryCode?: string;
  state?: string;
  locality?: string;
  validity?: number;
}
