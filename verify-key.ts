import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const key = process.env.SOLANA_PRIVATE_KEY || '';

console.log('Key length:', key.length);
console.log('First 5 chars:', key.slice(0, 5));
console.log('Last 5 chars:', key.slice(-5));

try {
  const decoded = bs58.decode(key);
  console.log('Decoded bytes:', decoded.length);
  
  if (decoded.length !== 64) {
    console.log('ERROR: Expected 64 bytes, got', decoded.length);
    process.exit(1);
  }
  
  const keypair = Keypair.fromSecretKey(decoded);
  console.log('Valid key!');
  console.log('Public Key:', keypair.publicKey.toString());
} catch (e: any) {
  console.log('Error:', e.message);
}
