import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import enquirer from 'enquirer';
import { FoxciteClient } from '@foxcite/sdk';
import { isJsonMode, logError, logSuccess, logJson, createSpinner } from '../utils/output.js';

export const linkCommand = new Command('link')
  .description('Link the local repository to a Foxcite Brand Workspace')
  .option('-b, --brand-id <uuid>', 'The Brand ID to link to (bypasses interactive prompt)')
  .option('-d, --domain <string>', 'The brand domain (required if --brand-id is used)')
  .action(async (options) => {
    const apiKey = process.env.FOXCITE_API_KEY;
    const baseUrl = process.env.FOXCITE_API_URL;
    
    if (!apiKey) {
      logError('FOXCITE_API_KEY environment variable is missing.');
      return;
    }

    const configPath = path.join(process.cwd(), 'foxcite.json');
    let config: any = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }

    let brandId = options.brandId;
    let domain = options.domain;

    const client = new FoxciteClient({ apiKey, baseUrl });

    if (!brandId) {
      if (isJsonMode()) {
        logError('Agent/CI mode requires --brand-id to be explicitly provided.');
        return;
      }

      const spinner = createSpinner('Fetching active brands...').start();
      try {
        const brands = await client.brands.list();
        spinner.succeed('Brands fetched successfully.');

        if (brands.length === 0) {
          logError('No active brands found on your account.');
          return;
        }

        const prompt = new (enquirer as any).Select({
          name: 'brand',
          message: 'Select a brand workspace to link:',
          choices: brands.map(b => ({
            name: `${b.name} (${b.domain})`,
            value: b
          })),
          result(name: string) {
            // enquirer's 'result' function needs to map the selected name back to the choice value
            // but for simplicity, we can just find it in the original array
            const selectedBrand = brands.find(b => `${b.name} (${b.domain})` === name);
            return selectedBrand as any;
          }
        });

        const selected: any = await prompt.run();
        brandId = selected.id;
        domain = selected.domain;
        config.name = selected.name;
        config.niche = selected.niche;

      } catch (error: any) {
        spinner.fail('Failed to fetch brands.');
        logError(error.message || 'Unknown error occurred.');
        return;
      }
    }

    if (!brandId || !domain) {
      logError('Brand ID and Domain are required.');
      return;
    }

    config.brand_id = brandId;
    config.domain = domain;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    if (isJsonMode()) {
      logJson({ status: 'success', brand_id: brandId, domain: domain });
    } else {
      logSuccess(`Workspace linked successfully to brand: ${chalk.cyan(domain)}`);
    }
  });
