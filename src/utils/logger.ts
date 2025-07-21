/**
 * Module d'utilitaires pour la journalisation
 */
import chalk from 'chalk';

/**
 * Classe utilitaire pour la journalisation
 */
export class Logger {
  /**
   * Affiche un message d'information
   * @param message - Message à afficher
   */
  static info(message: string): void {
    console.log(chalk.blue(`ℹ️ ${message}`));
  }

  /**
   * Affiche un message de succès
   * @param message - Message à afficher
   */
  static success(message: string): void {
    console.log(chalk.green(`✅ ${message}`));
  }

  /**
   * Affiche un message d'erreur
   * @param message - Message à afficher
   * @param error - Erreur optionnelle
   */
  static error(message: string, error?: unknown): void {
    console.error(chalk.red(`❌ ${message}`), error || '');
  }

  /**
   * Affiche un message d'avertissement
   * @param message - Message à afficher
   */
  static warning(message: string): void {
    console.log(chalk.yellow(`⚠️ ${message}`));
  }

  /**
   * Affiche un message de débogage
   * @param message - Message à afficher
   */
  static debug(message: string): void {
    if (process.env.DEBUG) {
      console.log(chalk.gray(`🔍 ${message}`));
    }
  }
}
