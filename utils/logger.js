import chalk from "chalk";

export const logger = {
  success: (text) => console.log(chalk.bold.green(`✔ ${text}`)),
  error: (text) => console.log(chalk.bold.red(`✖ ${text}`)),
  warning: (text) => console.log(chalk.bold.yellow(`⚠ ${text}`)),
  info: (text) => console.log(chalk.bold.blue(`ℹ ${text}`)),
  debug: (text) => console.log(chalk.bold.gray(`● ${text}`)),
};
