import chalk from 'chalk';        // holy shit 

export function showIntro(): void {
  // Matrix rain header
  console.log();

  // Matrix rain effect simulation        meh :(
  const rain = [            
    '01010101010101010101010101010101010101010101010101010',
    '10101010101010101010101010101010101010101010101010101',
    '11001100110011001100110011001100110011001100110011001',
  ];

  // Show random matrix rain lines
  rain.forEach((line, i) => {
    setTimeout(() => {
      console.log(chalk.green.dim(line.slice(0, 53)));
    }, i * 100);
  });

  // Project info
  setTimeout(() => {
    console.log(chalk.gray('\n  ┌────────────────────────────────────────────────────┐'));
    console.log(chalk.gray('  │ ') + chalk.white.bold('IQ Skill Uploader v1.0.0') + chalk.gray('                          │'));
    console.log(chalk.gray('  ├────────────────────────────────────────────────────┤'));
    console.log(chalk.gray('  │ ') + chalk.white('Store Hermes agent skills on Solana permanently') + chalk.gray('   │'));
    console.log(chalk.gray('  │ ') + chalk.white('~2000x cheaper than standard Solana storage') + chalk.gray('       │'));
    console.log(chalk.gray('  │ ') + chalk.white('Powered by IQLabs SDK codeIn() technology') + chalk.gray('         │'));
    console.log(chalk.gray('  └────────────────────────────────────────────────────┘'));
    console.log();
  }, 400);
}

export function showQuickHelp(): void {
  console.log(chalk.cyan.bold('  Quick Commands:'));
  console.log();
  console.log(chalk.white('    iqlabs upload <path>        ') + chalk.gray('Upload a skill to Solana'));
  console.log(chalk.white('    iqlabs download <sig>       ') + chalk.gray('Download skill by signature'));
  console.log(chalk.white('    iqlabs list                 ') + chalk.gray('Show your uploaded skills'));
  console.log(chalk.white('    iqlabs help                 ') + chalk.gray('Show detailed help'));
  console.log();
  console.log(chalk.gray('  For more info: ') + chalk.cyan('https://github.com/ANISH-SR/iq-hermes'));
  console.log();
}
