/**
 * Module of utilities for file operations
 */
import fs from 'fs-extra';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Gets the current directory using ESM
 * @returns The current directory
 */
export function getCurrentDir(): string {
  const __filename = fileURLToPath(import.meta.url);
  return dirname(dirname(dirname(__filename)));
}

/**
 * Gets the version from package.json
 * @returns The package version
 */
export async function getPackageVersion(): Promise<string> {
  const packageJsonPath = path.join(getCurrentDir(), 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);
  return packageJson.version || '1.0.0';
}

/**
 * Checks if a file exists
 * @param filePath - File path
 * @returns true if the file exists, false otherwise
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
 * Creates a directory if it doesn't exist
 * @param dirPath - Directory path
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

/**
 * Reads a JSON file
 * @param filePath - File path
 * @returns The content of the JSON file
 */
export async function readJsonFile<T>(filePath: string): Promise<T> {
  return await fs.readJson(filePath);
}

/**
 * Writes a JSON file
 * @param filePath - File path
 * @param data - Data to write
 */
export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await fs.writeJson(filePath, data, { spaces: 2 });
}
