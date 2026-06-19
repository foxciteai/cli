import { Command } from 'commander';
import chalk from 'chalk';
import { FoxciteClient } from '@foxcite/sdk';
import { isJsonMode, logJson, createSpinner } from '../utils/output.js';

export const statusCommand = new Command('status')
  .description('Check connection to Foxcite Platform and list active brands')
  .action(async () => {
    const apiKey = process.env.FOXCITE_API_KEY;
    const baseUrl = process.env.FOXCITE_API_URL;
    
    if (!apiKey) {
      console.error(chalk.red('Error: FOXCITE_API_KEY environment variable is missing.'));
      console.log(chalk.yellow('Run `foxcite init` or set the variable manually.'));
      process.exit(1);
    }

    const spinner = createSpinner('Connecting to Foxcite API...').start();

    try {
      const client = new FoxciteClient({ apiKey, baseUrl });
      
      const brands = await client.brands.list();
      spinner.succeed(`Connected successfully! Found ${brands.length} brand(s).`);

      if (isJsonMode()) {
        logJson({ status: 'success', brands });
        return;
      }
      
      if (brands.length > 0) {
        console.log('\n' + chalk.bold.cyan('Active Workspaces:'));
        brands.forEach(brand => {
          console.log(`- ${chalk.cyan(brand.name)} (${brand.domain})`);
          console.log(`  Niche: ${brand.niche}`);
        });
      } else {
        console.log(chalk.yellow('\nNo brands found. Go to the dashboard to create one.'));
      }

    } catch (error: any) {
      spinner.fail('Connection failed.');
      console.error(chalk.red(error.message || 'Unknown error occurred.'));
      process.exit(1);
    }
  });
