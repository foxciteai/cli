import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

export const initCommand = new Command('init')
  .description('Initialize a new Foxcite workspace configuration')
  .action(async () => {
    const configPath = path.join(process.cwd(), 'foxcite.json');
    const envPath = path.join(process.cwd(), '.env');

    console.log(chalk.blue('🦊 Initializing Foxcite Workspace...'));

    const spinner = ora('Creating configuration files...').start();

    if (!fs.existsSync(configPath)) {
      const defaultConfig = {
        name: "My Brand",
        domain: "example.com",
        niche: "SaaS Platform"
      };
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
      spinner.succeed(`Created ${chalk.bold('foxcite.json')}`);
    } else {
      spinner.info(`${chalk.bold('foxcite.json')} already exists.`);
    }

    if (!fs.existsSync(envPath)) {
      fs.writeFileSync(envPath, 'FOXCITE_API_KEY=YOUR_API_KEY_HERE\n');
      console.log(`\n✅ Created ${chalk.bold('.env')}. Please add your ${chalk.bold('FOXCITE_API_KEY')}.`);
    } else {
      const envContent = fs.readFileSync(envPath, 'utf8');
      if (!envContent.includes('FOXCITE_API_KEY=')) {
        fs.appendFileSync(envPath, '\nFOXCITE_API_KEY=YOUR_API_KEY_HERE\n');
        console.log(`\n✅ Appended ${chalk.bold('FOXCITE_API_KEY')} to existing ${chalk.bold('.env')}.`);
      }
    }

    console.log(`\n🎉 Initialization complete. Run ${chalk.cyan('foxcite status')} to test your connection.`);
  });
