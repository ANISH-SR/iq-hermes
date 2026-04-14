import { Connection } from '@solana/web3.js';
import iqlabs from '@iqlabs-official/solana-sdk';
import { DownloadResult, IQConfig } from './types.js';

export async function downloadFromSolana(
  signature: string,
  config: IQConfig
): Promise<DownloadResult> {
  const connection = new Connection(config.rpcUrl, 'confirmed');

  const result = await iqlabs.reader.readCodeIn(
    signature,
    'fast',
    (percent: number) => {
      process.stdout.write(`\rDownload progress: ${percent}%`);
    }
  );

  console.log(); // New line after progress

  const metadata = JSON.parse(result.metadata);
  const data = Buffer.from(result.data || '', 'base64');
  const skillName = metadata.filename?.replace('.tar.gz', '') || 'unknown-skill';

  return {
    skillName,
    data,
    metadata,
  };
}
