import fs from 'fs';
import path from 'path';
import os from 'os';
import { RegistryEntry } from './types.js';

const REGISTRY_PATH = path.join(os.homedir(), '.iq-skill-registry.json');

export function loadRegistry(): RegistryEntry[] {
  if (!fs.existsSync(REGISTRY_PATH)) {
    return [];
  }
  try {
    const data = fs.readFileSync(REGISTRY_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveRegistry(registry: RegistryEntry[]): void {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
}

export function addToRegistry(entry: RegistryEntry): void {
  const registry = loadRegistry();
  registry.push(entry);
  saveRegistry(registry);
}

export function listRegistry(): RegistryEntry[] {
  const registry = loadRegistry();
  return registry.sort((a, b) => 
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

export function getRegistryPath(): string {
  return REGISTRY_PATH;
}
