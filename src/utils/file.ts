/**
 * Module d'utilitaires pour les opérations sur les fichiers
 */
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

/**
 * Obtient le chemin du répertoire actuel en utilisant ESM
 * @returns Le chemin du répertoire actuel
 */
export function getCurrentDir(): string {
  const __filename = fileURLToPath(import.meta.url);
  return dirname(dirname(dirname(__filename)));
}

/**
 * Lit la version depuis package.json
 * @returns La version du package
 */
export async function getPackageVersion(): Promise<string> {
  const packageJsonPath = path.join(getCurrentDir(), 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);
  return packageJson.version || '1.0.0';
}

/**
 * Vérifie si un fichier existe
 * @param filePath - Chemin du fichier
 * @returns true si le fichier existe, false sinon
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Crée un répertoire s'il n'existe pas
 * @param dirPath - Chemin du répertoire
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

/**
 * Lit un fichier JSON
 * @param filePath - Chemin du fichier
 * @returns Le contenu du fichier JSON
 */
export async function readJsonFile<T>(filePath: string): Promise<T> {
  return await fs.readJson(filePath);
}

/**
 * Écrit un fichier JSON
 * @param filePath - Chemin du fichier
 * @param data - Données à écrire
 */
export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await fs.writeJson(filePath, data, { spaces: 2 });
}
