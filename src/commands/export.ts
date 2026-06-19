import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { FoxciteClient } from '@foxcite/sdk';
import { isJsonMode, logError, logSuccess, logJson, createSpinner } from '../utils/output.js';

export const exportCommand = new Command('export')
  .description('Export tracked keywords and metrics to a CSV file')
  .option('-o, --output <file>', 'Output file path', 'keywords_export.csv')
  .action(async (options) => {
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
    const spinner = createSpinner('Fetching data for export...').start();

    try {
      const client = new FoxciteClient({ apiKey, baseUrl });
      
      const keywords = await client.queries.listTracked(brandId);
      
      if (keywords.length === 0) {
        spinner.fail('No keywords found to export.');
        if (isJsonMode()) logJson({ status: 'error', message: 'No keywords found' });
        return;
      }

      spinner.text = 'Writing CSV file...';
      
      // Basic CSV Generation
      const headers = ['Query', 'Intent', 'Confidence Score', 'Last Updated'];
      const rows = keywords.map((k: any) => [
        `"${(k.query || '').replace(/"/g, '""')}"`,
        k.intent_type || 'unclassified',
        k.confidence_score || 0,
        k.updated_at || ''
      ].join(','));
      
      const csvContent = [headers.join(','), ...rows].join('\n');
      
      const outputPath = path.resolve(process.cwd(), options.output);
      fs.writeFileSync(outputPath, csvContent);
      
      spinner.succeed(`Exported ${keywords.length} keywords to ${options.output}`);

      if (isJsonMode()) {
        logJson({ status: 'success', file: outputPath, rows: keywords.length });
      } else {
        logSuccess(`Ready for import into Sheets/Excel: ${chalk.cyan(outputPath)}`);
      }

    } catch (error: any) {
      spinner.fail('Export failed.');
      logError(error.message || 'Unknown error occurred.');
      return;
    }
  });
