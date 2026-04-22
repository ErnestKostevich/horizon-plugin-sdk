import { Command } from 'commander';
import kleur from 'kleur';
import { initCommand } from './commands/init';
import { buildCommand } from './commands/build';
import { publishCommand } from './commands/publish';

const program = new Command();
program
  .name('hz-plugin')
  .description('CLI for building and publishing Horizon Genesis plugins.')
  .version('0.1.0');

program
  .command('init <name>')
  .description('Scaffold a new plugin in the given directory.')
  .option('--template <name>', 'Template to use', 'basic')
  .action(initCommand);

program
  .command('build')
  .description('Validate manifest and produce a .hzplugin bundle.')
  .option('--out <path>', 'Output path (defaults to dist/<id>-<version>.hzplugin)')
  .action(buildCommand);

program
  .command('publish')
  .description('Upload the built bundle to horizonaai.dev for review.')
  .option('--api <url>', 'Marketplace API base', 'https://api.horizonaai.dev')
  .option('--token <jwt>', 'Auth token (overrides HORIZON_TOKEN env)')
  .action(publishCommand);

program.parseAsync(process.argv).catch((err) => {
  console.error(kleur.red(`\n✗ ${err instanceof Error ? err.message : String(err)}\n`));
  process.exit(1);
});
