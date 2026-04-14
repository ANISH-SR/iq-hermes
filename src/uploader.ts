import { Connection, Keypair } from '@solana/web3.js';
import iqlabs from '@iqlabs-official/solana-sdk';
import { UploadResult, IQConfig } from './types.js';
import bs58 from 'bs58';

export async function uploadToSolana(
  data: Buffer,
  skillName: string,
  config: IQConfig,
  encrypted: boolean = false
): Promise<UploadResult> {
  const connection = new Connection(config.rpcUrl, 'confirmed');
  const signer = Keypair.fromSecretKey(bs58.decode(config.privateKey));

  const signature = await iqlabs.writer.codeIn(
    { connection, signer },
    data.toString('base64'),
    `${skillName}.tar.gz`,
    0, // upload method
    'application/gzip',
    (percent: number) => {
      process.stdout.write(`\rUpload progress: ${percent}%`);
    }
  );

  console.log(); // New line after progress

  return {
    signature,
    skillName,
    size: data.length,
    encrypted,
  };
}
