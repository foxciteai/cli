import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { FoxciteClient } from '@foxcite/sdk';

export const auditCommand = new Command('audit')
  .description('Trigger an on-demand SEO audit scan')
  .option('-q, --query <string>', 'The search query to audit')
  .action(async (options) => {
    const apiKey = process.env.FOXCITE_API_KEY;
    const baseUrl = process.env.FOXCITE_API_URL;

    if (!apiKey) {
      console.error(chalk.red('Error: FOXCITE_API_KEY environment variable is missing.'));
      process.exit(1);
    }

    const configPath = path.join(process.cwd(), 'foxcite.json');
    if (!fs.existsSync(configPath)) {
      console.error(chalk.red('Error: foxcite.json missing. Please run `foxcite init` first.'));
      process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // We need a query either from options or from config defaults
    const query = options.query || config.default_query;
    if (!query) {
      console.error(chalk.red('Error: Please provide a query using -q or specify default_query in foxcite.json.'));
      process.exit(1);
    }

    const spinner = ora(`Initiating audit for "${query}"...`).start();

    try {
      const client = new FoxciteClient({ apiKey, baseUrl });
      
      const response = await client.audits.quickAudit({
        name: config.name,
        domain: config.domain,
        niche: config.niche,
        query: query
      });

      spinner.succeed('Audit initiated successfully.');
      console.log(`\nScan ID: ${chalk.cyan(response.scan_id)}`);
      console.log(`Status:  ${chalk.green(response.status)}`);
      console.log(`\nYou can check the dashboard for the results of this scan.`);

    } catch (error: any) {
      spinner.fail('Audit failed.');
      console.error(chalk.red(error.message || 'Unknown error occurred.'));
      process.exit(1);
    }
  });
