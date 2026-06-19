#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';
import { initCommand } from './commands/init.js';
import { statusCommand } from './commands/status.js';
import { auditCommand } from './commands/audit.js';
import { linkCommand } from './commands/link.js';
import { pullCommand } from './commands/pull.js';
import { keywordsCommand } from './commands/keywords.js';
import { exportCommand } from './commands/export.js';

dotenv.config();

const program = new Command();

program
  .name('foxcite')
  .description('Foxcite AEO CLI tool for auditing and managing brand visibility')
  .version('1.0.0')
  .option('--json', 'Output raw JSON for agent/CI consumption');

// Make options available globally to all commands
program.hook('preAction', (thisCommand) => {
  const opts = program.opts();
  process.env.FOXCITE_JSON_OUTPUT = opts.json ? 'true' : 'false';
});

program.addCommand(initCommand);
program.addCommand(statusCommand);
program.addCommand(auditCommand);
program.addCommand(linkCommand);
program.addCommand(pullCommand);
program.addCommand(keywordsCommand);
program.addCommand(exportCommand);

program.parse(process.argv);
