import chalk from 'chalk';
import ora from 'ora';

export function isJsonMode(): boolean {
  return process.env.FOXCITE_JSON_OUTPUT === 'true';
}

export function logInfo(message: string) {
  if (!isJsonMode()) {
    console.log(chalk.blue(`ℹ ${message}`));
  }
}

export function logSuccess(message: string) {
  if (!isJsonMode()) {
    console.log(chalk.green(`✔ ${message}`));
  }
}

export function logError(message: string, exit: boolean = true) {
  if (isJsonMode()) {
    console.error(JSON.stringify({ error: message }));
  } else {
    console.error(chalk.red(`❌ Error: ${message}`));
  }
  if (exit) {
    process.exit(1);
  }
}

export function logJson(data: any) {
  console.log(JSON.stringify(data, null, 2));
}

export function createSpinner(message: string) {
  if (isJsonMode()) {
    // Return a mock spinner that does nothing
    return {
      start: () => ({ succeed: () => {}, fail: () => {}, info: () => {}, text: '' }),
      succeed: () => {},
      fail: () => {},
      info: () => {},
      text: ''
    };
  }
  return ora(message);
}
