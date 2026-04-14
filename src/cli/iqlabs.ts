#!/usr/bin/env tsx
import { Command } from 'commander';
import chalk from 'chalk';
import { showIntro, showQuickHelp } from '../intro.js';
import { listRegistry, getRegistryPath, addToRegistry } from '../registry.js';
import { RegistryEntry, IQConfig } from '../types.js';
import { loadConfig } from '../config.js';
import { validateSkill, packageSkill, createTempDir, cleanup, encrypt, decrypt, extractSkill } from '../skill-packager.js';
import { uploadToSolana } from '../uploader.js';
import { downloadFromSolana } from '../downloader.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

const program = new Command();

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function showRegistry(options: any) {
  const registry = listRegistry();
  
  if (registry.length === 0) {
    console.log(chalk.yellow('[INFO] No skills in registry.'));
    console.log(chalk.gray(`Registry file: ${getRegistryPath()}`));
    console.log(chalk.gray('\nUpload a skill:'));
    console.log(chalk.cyan('  iqlabs upload <skill-path>'));
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
  console.log(chalk.gray('TIP: Download with: iqlabs download <signature>'));
}

program
  .name('iqlabs')
  .description('IQ Skill Uploader - Store Hermes skills on Solana')
  .version('1.0.0')
  .option('-v, --verbose', 'Show full transaction signatures')
  .option('--json', 'Output as JSON')
  .option('--no-intro', 'Skip intro screen')
  .action((options) => {
    if (!options.noIntro) {
      showIntro();
      setTimeout(() => {
        showQuickHelp();
        showRegistry(options);
      }, 500);
    } else {
      showRegistry(options);
    }
  });

program
  .command('upload')
  .description('Upload a skill to Solana')
  .argument('<skill-path>', 'Path to skill directory')
  .option('-n, --name <name>', 'Custom skill name')
  .option('-e, --encrypt', 'Encrypt skill before upload')
  .option('--dry-run', 'Validate without uploading')
  .action(async (skillPath, options) => {
    try {
      const fullPath = path.resolve(skillPath);
      
      // Validate
      const validation = validateSkill(fullPath);
      if (!validation.isValid) {
        console.log(chalk.red('Validation failed'));
        validation.errors.forEach(e => console.log(chalk.red(`  X ${e}`)));
        process.exit(1);
      }
      console.log(chalk.green(`[OK] Skill "${validation.metadata?.name}" is valid`));
      
      if (options.dryRun) {
        console.log(chalk.gray('\nDry run - no upload performed'));
        return;
      }

      // Load config
      const config = loadConfig();
      console.log(chalk.green('[OK] Configuration loaded'));
      
      // Package
      const tempDir = createTempDir();
      const packagePath = packageSkill(fullPath, tempDir);
      let data = fs.readFileSync(packagePath);
      const skillName = path.basename(fullPath);
      console.log(chalk.green(`[OK] Packaged (${(data.length / 1024).toFixed(2)} KB)`));
      
      // Encrypt if requested
      let isEncrypted = false;
      if (options.encrypt && config.encryptionKey) {
        data = Buffer.from(encrypt(data, config.encryptionKey));
        isEncrypted = true;
        console.log(chalk.yellow('[OK] Encrypted'));
      }

      // Upload
      console.log(chalk.cyan(`\nUploading "${skillName}" to Solana...`));
      const result = await uploadToSolana(data, skillName, config, isEncrypted);
      
      // Save to registry
      addToRegistry({
        name: skillName,
        signature: result.signature,
        uploadedAt: new Date().toISOString(),
        size: data.length,
        encrypted: isEncrypted,
      });
      
      cleanup(tempDir);

      console.log(chalk.green('\n[SUCCESS] Upload complete!\n'));
      console.log(chalk.white('Transaction Signature: ') + chalk.cyan(result.signature));
      console.log(chalk.white('Explorer: ') + chalk.cyan(`https://explorer.solana.com/tx/${result.signature}`));
      console.log(chalk.white('Size: ') + chalk.cyan(`${(data.length / 1024).toFixed(2)} KB`));
      console.log(chalk.white('Encrypted: ') + chalk.cyan(isEncrypted ? 'Yes' : 'No'));
      console.log(chalk.gray('\nOthers can download with:'));
      console.log(chalk.cyan(`  iqlabs download ${result.signature}`));
    } catch (error: any) {
      console.log(chalk.red(`Upload failed: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('download')
  .description('Download a skill from Solana')
  .argument('<signature>', 'Transaction signature')
  .option('-o, --output <path>', 'Output directory', '.')
  .option('-i, --install', 'Install to ~/.hermes/skills/')
  .option('-f, --force', 'Overwrite existing skill')
  .action(async (signature, options) => {
    try {
      const config = loadConfig();
      console.log(chalk.green('[OK] Configuration loaded'));
      
      // Download
      console.log(chalk.cyan(`\nDownloading skill from ${signature.slice(0, 20)}...`));
      const result = await downloadFromSolana(signature, config);
      
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
      const tempDir = createTempDir();
      const archivePath = path.join(tempDir, 'skill.tar.gz');
      fs.writeFileSync(archivePath, result.data);
      
      console.log(chalk.green('[OK] Extracted'));
      let extractedPath: string;
      
      try {
        const extractDir = path.join(tempDir, 'extracted');
        extractedPath = extractSkill(archivePath, extractDir);
      } catch (err) {
        console.log(chalk.red('Extraction failed'));
        cleanup(tempDir);
        throw err;
      }
      
      // Validate
      console.log(chalk.green('[OK] Validation passed'));
      const validation = validateSkill(extractedPath);
      if (!validation.isValid) {
        console.log(chalk.red('Validation failed'));
        validation.errors.forEach(e => console.log(chalk.red(`  X ${e}`)));
        cleanup(tempDir);
        process.exit(1);
      }
      
      // Move to final location
      if (fs.existsSync(finalPath)) {
        fs.rmSync(finalPath, { recursive: true });
      }
      fs.mkdirSync(path.dirname(finalPath), { recursive: true });
      fs.renameSync(extractedPath, finalPath);
      
      console.log(chalk.green('\n[SUCCESS] Download complete!\n'));
      console.log(chalk.white('Skill: ') + chalk.cyan(result.skillName));
      console.log(chalk.white('Location: ') + chalk.cyan(finalPath));
      console.log(chalk.white('Size: ') + chalk.cyan(`${(result.data.length / 1024).toFixed(2)} KB`));
      
      if (options.install) {
        console.log(chalk.gray('\nUse the skill with:'));
        console.log(chalk.gray(`  /${result.skillName}`));
      }
      
      cleanup(tempDir);
    } catch (error: any) {
      console.log(chalk.red(`Download failed: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List uploaded skills')
  .option('-v, --verbose', 'Show full signatures')
  .option('--json', 'Output as JSON')
  .action((options) => {
    showIntro();
    setTimeout(() => {
      showQuickHelp();
      showRegistry(options);
    }, 500);
  });

program.parse();
