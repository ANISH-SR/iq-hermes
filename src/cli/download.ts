#!/usr/bin/env tsx
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import os from 'os';
import { loadConfig } from '../config.js';
import { extractSkill, decrypt, validateSkill, createTempDir, cleanup } from '../skill-packager.js';
import { downloadFromSolana } from '../downloader.js';

const program = new Command();

program
  .name('iq-download')
  .description('Download Hermes skills from Solana')
  .version('1.0.0')
  .argument('<signature>', 'Transaction signature of the skill')
  .option('-o, --output <path>', 'Output directory', '.')
  .option('-i, --install', 'Install to ~/.hermes/skills/')
  .option('-f, --force', 'Overwrite existing skill')
  .action(async (signature: string, options) => {
    const spinner = ora();
    
    try {
      // Load config
      spinner.start('Loading configuration...');
      const config = loadConfig();
      spinner.succeed('Configuration loaded');

      // Download
      console.log(chalk.blue(`\nDownloading skill from ${signature.slice(0, 20)}...`));
      const result = await downloadFromSolana(signature, config);

      // Decrypt if needed
      let skillData = result.data;
      if (config.encryptionKey) {
        spinner.start('Decrypting...');
        skillData = decrypt(skillData, config.encryptionKey);
        spinner.succeed('Decrypted');
      }

      // Determine output path
      let outputPath: string;
      if (options.install) {
        outputPath = path.join(os.homedir(), '.hermes', 'skills');
      } else {
        outputPath = path.resolve(options.output);
      }

      const finalPath = path.join(outputPath, result.skillName);

      // Check if exists
      if (fs.existsSync(finalPath) && !options.force) {
        console.log(chalk.yellow(`\n[WARNING] Skill "${result.skillName}" already exists`));
        console.log(chalk.gray(`   at ${finalPath}`));
        console.log(chalk.gray('   Use --force to overwrite'));
        process.exit(1);
      }

      // Extract
      spinner.start('Extracting...');
      const tempDir = createTempDir();
      let extractedPath: string;
      
      try {
        const archivePath = path.join(tempDir, `${result.skillName}.tar.gz`);
        fs.writeFileSync(archivePath, skillData);
        extractedPath = extractSkill(archivePath, outputPath);
        spinner.succeed('Extracted');
      } catch (err) {
        spinner.fail('Extraction failed');
        cleanup(tempDir);
        throw err;
      }

      // Validate
      spinner.start('Validating...');
      const validation = validateSkill(extractedPath);
      if (!validation.isValid) {
        spinner.fail('Validation failed');
        validation.errors.forEach(e => console.log(chalk.red(`  X ${e}`)));
        cleanup(tempDir);
        process.exit(1);
      }
      spinner.succeed('Validation passed');

      // Output result
      console.log(chalk.green('\n[SUCCESS] Download complete!\n'));
      console.log(chalk.white('Skill: ') + chalk.cyan(result.skillName));
      console.log(chalk.white('Location: ') + chalk.cyan(extractedPath));
      console.log(chalk.white('Size: ') + chalk.cyan(`${(result.data.length / 1024).toFixed(2)} KB`));
      
      if (options.install) {
        console.log(chalk.gray('\nUse the skill with:'));
        console.log(chalk.gray(`  /${result.skillName}`));
      }

      cleanup(tempDir);
      
    } catch (err: any) {
      spinner.fail(`Download failed: ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
