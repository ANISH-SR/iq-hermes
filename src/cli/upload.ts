#!/usr/bin/env tsx
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig } from '../config.js';
import { validateSkill, packageSkill, encrypt, createTempDir, cleanup } from '../skill-packager.js';
import { uploadToSolana } from '../uploader.js';
import { addToRegistry } from '../registry.js';

const program = new Command();

program
  .name('iq-upload')
  .description('Upload Hermes skills to Solana using IQLabs SDK')
  .version('1.0.0')
  .argument('<skill-path>', 'Path to skill directory')
  .option('-n, --name <name>', 'Custom skill name')
  .option('-e, --encrypt', 'Encrypt skill before upload')
  .option('--dry-run', 'Validate without uploading')
  .action(async (skillPath: string, options) => {
    const spinner = ora();
    
    try {
      // Resolve path
      const resolvedPath = path.resolve(skillPath);
      
      // Validate skill
      spinner.start('Validating skill...');
      const validation = validateSkill(resolvedPath);
      
      if (!validation.isValid) {
        spinner.fail('Validation failed');
        validation.errors.forEach(e => console.log(chalk.red(`  X ${e}`)));
        process.exit(1);
      }
      
      spinner.succeed(`Skill "${validation.metadata?.name}" is valid`);
      
      if (options.dryRun) {
        console.log(chalk.blue('\nDry run - no upload performed'));
        return;
      }

      // Load config
      spinner.start('Loading configuration...');
      const config = loadConfig();
      spinner.succeed('Configuration loaded');

      // Package skill
      spinner.start('Packaging skill...');
      const tempDir = createTempDir();
      let archivePath: string;
      let skillData: Buffer;
      
      try {
        archivePath = packageSkill(resolvedPath, tempDir);
        skillData = fs.readFileSync(archivePath);
        spinner.succeed(`Packaged (${(skillData.length / 1024).toFixed(2)} KB)`);
      } catch (err) {
        spinner.fail('Packaging failed');
        cleanup(tempDir);
        throw err;
      }

      // Encrypt if requested
      if (options.encrypt) {
        spinner.start('Encrypting...');
        if (!config.encryptionKey) {
          spinner.fail('SKILL_ENCRYPTION_KEY not set');
          cleanup(tempDir);
          process.exit(1);
        }
        skillData = encrypt(skillData, config.encryptionKey);
        spinner.succeed('Encrypted');
      }

      // Upload
      const skillName = options.name || validation.metadata?.name || path.basename(resolvedPath);
      console.log(chalk.blue(`\nUploading "${skillName}" to Solana...`));
      
      const result = await uploadToSolana(skillData, skillName, config, options.encrypt);

      // Save to registry
      addToRegistry({
        name: result.skillName,
        signature: result.signature,
        uploadedAt: new Date().toISOString(),
        size: result.size,
        encrypted: result.encrypted,
      });

      // Output result
      console.log(chalk.green('\n[SUCCESS] Upload complete!\n'));
      console.log(chalk.white('Transaction Signature: ') + chalk.cyan(result.signature));
      console.log(chalk.white('Explorer: ') + chalk.cyan(`https://explorer.solana.com/tx/${result.signature}`));
      console.log(chalk.white('Size: ') + chalk.cyan(`${(result.size / 1024).toFixed(2)} KB`));
      console.log(chalk.white('Encrypted: ') + chalk.cyan(result.encrypted ? 'Yes' : 'No'));
      console.log(chalk.gray('\nOthers can download with:'));
      console.log(chalk.gray(`  iq-download ${result.signature}`));

      cleanup(tempDir);
      
    } catch (err: any) {
      spinner.fail(`Upload failed: ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
