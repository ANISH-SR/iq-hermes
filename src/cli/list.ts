#!/usr/bin/env tsx
import { Command } from 'commander';
import chalk from 'chalk';
import { listRegistry, getRegistryPath } from '../registry.js';
import { RegistryEntry } from '../types.js';

const program = new Command();

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

program
  .name('iq-list')
  .description('List uploaded skills from registry')
  .version('1.0.0')
  .option('-v, --verbose', 'Show full transaction signatures')
  .option('--json', 'Output as JSON')
  .action((options) => {
    const registry = listRegistry();
    
    if (registry.length === 0) {
      console.log(chalk.yellow('No skills in registry.'));
      console.log(chalk.gray(`Registry: ${getRegistryPath()}`));
      console.log(chalk.gray('\nUpload a skill first:'));
      console.log(chalk.gray('  iq-upload <skill-path>'));
      return;
    }

    if (options.json) {
      console.log(JSON.stringify(registry, null, 2));
      return;
    }

    console.log(chalk.bold(`\n[REGISTRY] Uploaded Skills (${registry.length})\n`));

    registry.forEach((skill: RegistryEntry, index: number) => {
      const date = new Date(skill.uploadedAt).toLocaleDateString();
      const size = formatBytes(skill.size);
      const encrypted = skill.encrypted ? chalk.yellow('[ENC]') : chalk.gray('[PUB]');
      
      console.log(`${chalk.gray(`${index + 1}.`)} ${encrypted} ${chalk.cyan(skill.name)}`);
      console.log(`   ${chalk.gray('Size:')} ${size} ${chalk.gray('|')} ${chalk.gray('Uploaded:')} ${date}`);
      
      if (options.verbose) {
        console.log(`   ${chalk.gray('Signature:')} ${skill.signature}`);
        console.log(`   ${chalk.gray('Explorer:')} https://explorer.solana.com/tx/${skill.signature}`);
      } else {
        console.log(`   ${chalk.gray('Signature:')} ${skill.signature.slice(0, 20)}...`);
      }
      console.log('');
    });

    console.log(chalk.gray('TIP: Use --verbose for full signatures'));
    console.log(chalk.gray('TIP: Download with: iq-download <signature>'));
  });

program.parse();
