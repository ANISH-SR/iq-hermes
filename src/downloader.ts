import { Connection } from '@solana/web3.js';
import iqlabs from '@iqlabs-official/solana-sdk';
import { DownloadResult, IQConfig } from './types.js';
import chalk from 'chalk';

function renderProgressBar(percent: number, width: number = 30): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  const bar = chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  return `[${bar}] ${percent}%`;
}

export async function downloadFromSolana(
  signature: string,
  config: IQConfig
): Promise<DownloadResult> {
  const connection = new Connection(config.rpcUrl, 'confirmed');
  
  // Configure IQLabs SDK with user's RPC
  iqlabs.setRpcUrl(config.rpcUrl);

  const result = await iqlabs.reader.readCodeIn(
    signature,
    'fast',
    (percent: number) => {
      process.stdout.write(`\r${renderProgressBar(percent)}`);
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
