/**
 * Module of utilities for logging
 */
import chalk from 'chalk';

/**
 * Utility class for logging
 */
export class Logger {
  /**
   * Displays an information message
   * @param message - Message to display
   */
  static info(message: string): void {
    console.log(chalk.blue(`ℹ️ ${message}`));
  }

  /**
   * Displays a success message
   * @param message - Message to display
   */
  static success(message: string): void {
    console.log(chalk.green(`✅ ${message}`));
  }

  /**
   * Displays an error message
   * @param message - Message to display
   * @param error - Optional error
   */
  static error(message: string, error?: unknown): void {
    console.error(chalk.red(`❌ ${message}`), error || '');
  }

  /**
   * Displays a warning message
   * @param message - Message to display
   */
  static warning(message: string): void {
    console.log(chalk.yellow(`⚠️ ${message}`));
  }

  /**
   * Displays a debug message
   * @param message - Message to display
   */
  static debug(message: string): void {
    if (process.env.DEBUG) {
      console.log(chalk.gray(`🔍 ${message}`));
    }
  }
}
