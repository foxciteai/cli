import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { FoxciteClient } from '@foxcite/sdk';
import { isJsonMode, logError, logSuccess, logJson, createSpinner } from '../utils/output.js';

export const keywordsCommand = new Command('keywords')
  .description('List tracked keywords and their intent classifications')
  .action(async () => {
    const apiKey = process.env.FOXCITE_API_KEY;
    const baseUrl = process.env.FOXCITE_API_URL;

    if (!apiKey) {
      logError('FOXCITE_API_KEY environment variable is missing.');
      return;
    }

    const configPath = path.join(process.cwd(), 'foxcite.json');
    if (!fs.existsSync(configPath)) {
      logError('foxcite.json missing. Run `foxcite link` or `foxcite init` first.');
      return;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (!config.brand_id) {
      logError('brand_id is missing in foxcite.json. Run `foxcite link` first.');
      return;
    }

    const brandId = config.brand_id;
    const spinner = createSpinner('Fetching keywords...').start();

    try {
      const client = new FoxciteClient({ apiKey, baseUrl });
      
      const keywords = await client.queries.listTracked(brandId);
      spinner.succeed(`Fetched ${keywords.length} keywords.`);

      if (isJsonMode()) {
        logJson({ status: 'success', keywords });
        return;
      }

      if (keywords.length === 0) {
        console.log(chalk.yellow('No keywords currently tracked.'));
        return;
      }

      console.log('\n' + chalk.bold.cyan('Tracked Keywords & Intent:'));
      console.log(chalk.gray('--------------------------------------------------'));
      
      // Basic ASCII table
      keywords.forEach((k: any) => {
        const intentColor = 
          k.intent_type === 'navigational' ? chalk.blue :
          k.intent_type === 'informational' ? chalk.green :
          k.intent_type === 'commercial' ? chalk.yellow :
          k.intent_type === 'transactional' ? chalk.red : chalk.gray;
          
        const intent = k.intent_type ? intentColor(`[${k.intent_type.toUpperCase()}]`) : chalk.gray('[UNCLASSIFIED]');
        const confidence = k.confidence_score ? `(${(k.confidence_score * 100).toFixed(0)}%)` : '';
        
        console.log(`${intent} ${k.query} ${chalk.dim(confidence)}`);
      });
      
      console.log(chalk.gray('--------------------------------------------------\n'));

    } catch (error: any) {
      spinner.fail('Failed to fetch keywords.');
      logError(error.message || 'Unknown error occurred.');
      return;
    }
  });
