import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { FoxciteClient } from '@foxcite/sdk';
import { isJsonMode, logError, logSuccess, logJson, logInfo, createSpinner } from '../utils/output.js';

export const pullCommand = new Command('pull')
  .description('Download actionable AI playbooks for the linked workspace')
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
    const spinner = createSpinner('Fetching active playbooks...').start();

    try {
      const client = new FoxciteClient({ apiKey, baseUrl });
      
      const playbooks = await client.playbooks.list(brandId);
      spinner.succeed(`Fetched ${playbooks.length} playbooks.`);

      if (playbooks.length === 0) {
        if (isJsonMode()) {
          logJson({ status: 'success', playbooks: [] });
        } else {
          logInfo('No active playbooks found. Try running an audit first.');
        }
        return;
      }

      const outDir = path.join(process.cwd(), '.foxcite', 'playbooks');
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      const downloadedPlaybooks = [];
      const downloadSpinner = createSpinner('Downloading playbook content...').start();

      for (const playbook of playbooks) {
        // Only pull completed playbooks
        if (playbook.status !== 'completed') continue;

        try {
          const detail = await client.playbooks.get(brandId, playbook.id);
          
          let fileName = `${playbook.target_query.replace(/[^a-zA-Z0-9]/g, '_')}_${playbook.target_engine}.md`;
          let filePath = path.join(outDir, fileName);

          // Build markdown content
          let mdContent = `# Playbook: ${playbook.target_query} (${playbook.target_engine})\n\n`;
          if (detail.cited_source?.title) {
            mdContent += `**Deconstructed Competitor:** ${detail.cited_source.title}\n\n`;
          }
          mdContent += detail.markdown_content;

          fs.writeFileSync(filePath, mdContent);
          
          downloadedPlaybooks.push({
            id: playbook.id,
            query: playbook.target_query,
            engine: playbook.target_engine,
            file: filePath
          });
        } catch (err: any) {
          logError(`Failed to download playbook ${playbook.id}: ${err.message}`, false);
        }
      }

      downloadSpinner.succeed(`Downloaded ${downloadedPlaybooks.length} playbooks to .foxcite/playbooks/`);

      if (isJsonMode()) {
        logJson({ status: 'success', playbooks: downloadedPlaybooks });
      } else {
        logSuccess('Playbooks are ready for implementation.');
      }

    } catch (error: any) {
      spinner.fail('Failed to fetch playbooks.');
      logError(error.message || 'Unknown error occurred.');
      return;
    }
  });
