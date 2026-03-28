import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';
import { REGISTRY, REGISTRY_KEYS } from '../registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// コンポーネントのソースは CLI パッケージの隣の react パッケージ内
const COMPONENTS_SOURCE_DIR = path.resolve(__dirname, '../../react/src/components');
const HOOKS_SOURCE_DIR = path.resolve(__dirname, '../../react/src/hooks');

function detectOutputDir(): string {
  const candidates = [
    path.join(process.cwd(), 'src', 'components', 'ui'),
    path.join(process.cwd(), 'components', 'ui'),
    path.join(process.cwd(), 'src', 'components'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(path.dirname(c))) return c;
  }
  return path.join(process.cwd(), 'src', 'components', 'ui');
}

export const addCommand = new Command('add')
  .description('Add a behave-ui component to your project')
  .argument('[components...]', `Components to add. Available: ${REGISTRY_KEYS.join(', ')}`)
  .option('-o, --out-dir <dir>', 'Target directory for the component files')
  .option('--overwrite', 'Overwrite existing files without prompting', false)
  .action(async (components: string[], options: { outDir?: string; overwrite: boolean }) => {
    if (!components.length) {
      console.log(pc.bold('\nAvailable components:\n'));
      for (const [key, meta] of Object.entries(REGISTRY)) {
        console.log(`  ${pc.cyan(key.padEnd(16))}  ${pc.gray(meta.description)}`);
      }
      console.log();
      return;
    }

    const outDir = options.outDir ?? detectOutputDir();

    for (const component of components) {
      const meta = REGISTRY[component];

      if (!meta) {
        console.error(
          pc.red(`✗ Unknown component "${component}". Available: ${REGISTRY_KEYS.join(', ')}`)
        );
        process.exit(1);
      }

      console.log(pc.bold(`\nAdding ${pc.cyan(meta.name)}...`));

      const targetDir = path.join(outDir, meta.name);
      fs.mkdirSync(targetDir, { recursive: true });

      const sourceDir = path.join(COMPONENTS_SOURCE_DIR, meta.name);

      // Copy component files
      for (const file of meta.files) {
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(targetDir, file);

        if (!fs.existsSync(sourcePath)) {
          console.error(pc.red(`  ✗ Source file not found: ${sourcePath}`));
          console.error(pc.gray('    Make sure you have built the packages first: yarn build'));
          process.exit(1);
        }

        if (fs.existsSync(targetPath) && !options.overwrite) {
          console.warn(pc.yellow(`  ⚠ ${file} already exists. Use --overwrite to replace.`));
          continue;
        }

        fs.copyFileSync(sourcePath, targetPath);
        console.log(pc.green(`  ✓ ${path.relative(process.cwd(), targetPath)}`));
      }

      // Copy hooks if needed
      if (meta.hooks && meta.hooks.length > 0) {
        console.log(pc.gray('  Copying required hooks...'));
        const hooksDir = path.join(outDir, '..', 'hooks');
        fs.mkdirSync(hooksDir, { recursive: true });

        for (const hook of meta.hooks) {
          const sourcePath = path.join(HOOKS_SOURCE_DIR, hook);
          const targetPath = path.join(hooksDir, hook);

          if (!fs.existsSync(sourcePath)) {
            console.error(pc.red(`  ✗ Hook source not found: ${sourcePath}`));
            process.exit(1);
          }

          if (fs.existsSync(targetPath) && !options.overwrite) {
            console.warn(pc.yellow(`  ⚠ ${hook} already exists. Use --overwrite to replace.`));
            continue;
          }

          fs.copyFileSync(sourcePath, targetPath);
          console.log(pc.green(`  ✓ ${path.relative(process.cwd(), targetPath)}`));
        }
      }

      if (meta.peerDeps.length) {
        console.log(pc.gray(`\n  Install peer deps if not already present:`));
        console.log(pc.gray(`  yarn add ${meta.peerDeps.join(' ')}`));
      }
    }

    console.log(pc.bold(pc.green('\n✓ Done!\n')));
  });
