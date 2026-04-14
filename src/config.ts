import { IQConfig } from './types.js';

export function loadConfig(): IQConfig {
  const rpcUrl = process.env.SOLANA_RPC_URL;
  const privateKey = process.env.SOLANA_PRIVATE_KEY;
  const encryptionKey = process.env.SKILL_ENCRYPTION_KEY;

  if (!rpcUrl) {
    throw new Error('SOLANA_RPC_URL environment variable is required');
  }

  if (!privateKey) {
    throw new Error('SOLANA_PRIVATE_KEY environment variable is required');
  }

  return {
    rpcUrl,
    privateKey,
    encryptionKey,
  };
}

export function validatePrivateKey(key: string): boolean {
  try {
    // Basic validation - should be base58 and reasonable length
    return key.length >= 32 && /^[A-HJ-NP-Za-km-z1-9]*$/.test(key);
  } catch {
    return false;
  }
}
