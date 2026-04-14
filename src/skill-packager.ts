import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import os from 'os';
import { createHash } from 'crypto';
import { SkillValidation, SkillMetadata } from './types.js';

export function validateSkill(skillPath: string): SkillValidation {
  const errors: string[] = [];
  const skillName = path.basename(skillPath);

  // Check SKILL.md exists
  const skillMdPath = path.join(skillPath, 'SKILL.md');
  if (!fs.existsSync(skillMdPath)) {
    errors.push(`SKILL.md not found in ${skillPath}`);
    return { isValid: false, errors };
  }

  // Read and validate SKILL.md
  const skillMd = fs.readFileSync(skillMdPath, 'utf-8');
  
  // Check frontmatter
  if (!skillMd.startsWith('---')) {
    errors.push('SKILL.md must start with YAML frontmatter (---)');
  }

  // Extract name from frontmatter
  const nameMatch = skillMd.match(/^name:\s*(.+)$/m);
  if (!nameMatch) {
    errors.push('SKILL.md frontmatter must include "name" field');
  } else {
    const declaredName = nameMatch[1].trim();
    if (declaredName !== skillName) {
      errors.push(`Skill name mismatch: directory "${skillName}" vs frontmatter "${declaredName}"`);
    }
  }

  // Check description exists
  if (!skillMd.match(/^description:\s*(.+)$/m)) {
    errors.push('SKILL.md frontmatter must include "description" field');
  }

  // Parse metadata
  let metadata: SkillMetadata | undefined;
  try {
    const frontmatterMatch = skillMd.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const yamlContent = frontmatterMatch[1];
      metadata = parseYaml(yamlContent);
    }
  } catch (e) {
    errors.push('Failed to parse YAML frontmatter');
  }

  return { 
    isValid: errors.length === 0, 
    errors,
    metadata,
  };
}

function parseYaml(yaml: string): SkillMetadata {
  const lines = yaml.split('\n');
  const result: any = {};
  let currentKey: string | null = null;
  let indent = 0;

  for (const line of lines) {
    if (!line.trim()) continue;
    
    const match = line.match(/^(\s*)(\w+):\s*(.*)$/);
    if (match) {
      const [, spaces, key, value] = match;
      indent = spaces.length;
      
      if (indent === 0) {
        currentKey = key;
        if (value) {
          result[key] = value.trim();
        } else {
          result[key] = {};
        }
      } else if (currentKey && result[currentKey]) {
        result[currentKey][key] = value.trim();
      }
    }
  }

  return result as SkillMetadata;
}

export function packageSkill(skillPath: string, tempDir: string): string {
  const skillName = path.basename(skillPath);
  const outputPath = path.join(tempDir, `${skillName}.tar.gz`);
  
  // Create tar.gz archive
  const cmd = `tar -czf "${outputPath}" -C "${path.dirname(skillPath)}" "${skillName}"`;
  execSync(cmd, { stdio: 'pipe' });
  
  return outputPath;
}

export function extractSkill(archivePath: string, outputPath: string): string {
  fs.mkdirSync(outputPath, { recursive: true });
  const cmd = `tar -xzf "${archivePath}" -C "${outputPath}"`;
  execSync(cmd, { stdio: 'pipe' });
  
  // Return extracted directory path
  const extractedName = path.basename(archivePath).replace('.tar.gz', '');
  return path.join(outputPath, extractedName);
}

export function encrypt(data: Buffer, password: string): Buffer {
  const key = createHash('sha256').update(password).digest();
  const encrypted = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    encrypted[i] = data[i] ^ key[i % key.length];
  }
  return encrypted;
}

export function decrypt(data: Buffer, password: string): Buffer {
  // XOR is symmetric
  return encrypt(data, password);
}

export function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'iq-skill-'));
}

export function cleanup(dir: string): void {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}
