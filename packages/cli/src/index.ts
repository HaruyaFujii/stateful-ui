import { Command } from 'commander';
import pc from 'picocolors';
import { addCommand } from './commands/add.js';

const program = new Command();

program
  .name('behave-ui')
  .description(
    pc.bold('behave-ui') +
      ' — behavior-first React components.\n' +
      pc.gray('Async state, forms, and data fetching — batteries included.')
  )
  .version('0.1.0');

program.addCommand(addCommand);

program
  .command('list')
  .description('List all available components')
  .action(() => {
    addCommand.parseAsync([], { from: 'user' });
  });

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(pc.red('Error:'), err instanceof Error ? err.message : String(err));
  process.exit(1);
});
