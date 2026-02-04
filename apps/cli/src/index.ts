#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { installCommand } from './commands/install.js'
import { listCommand } from './commands/list.js'
import { searchCommand } from './commands/search.js'
import { removeCommand } from './commands/remove.js'

const program = new Command()

program
  .name('verbvault')
  .description(chalk.magenta('🎯 VerbVault CLI') + ' - Install themed spinner verbs for Claude Code')
  .version('0.1.0')

program
  .command('install <theme>')
  .alias('i')
  .description('Install a theme by slug or ID')
  .option('-f, --force', 'Overwrite existing verbs')
  .action(installCommand)

program
  .command('remove <theme>')
  .alias('rm')
  .description('Remove an installed theme')
  .action(removeCommand)

program
  .command('list')
  .alias('ls')
  .description('List installed themes')
  .action(listCommand)

program
  .command('search <query>')
  .alias('s')
  .description('Search for themes')
  .option('-t, --tag <tag>', 'Filter by tag')
  .option('-l, --limit <number>', 'Limit results', '10')
  .action(searchCommand)

// Show help by default if no command
if (process.argv.length === 2) {
  console.log()
  console.log(chalk.magenta.bold('  🎯 VerbVault CLI'))
  console.log(chalk.gray('  Install themed spinner verbs for Claude Code'))
  console.log()
  console.log(chalk.white('  Quick Start:'))
  console.log(chalk.cyan('    $ npx verbvault install pirates-treasure'))
  console.log(chalk.cyan('    $ npx verbvault search "space"'))
  console.log()
  program.help()
}

program.parse()
