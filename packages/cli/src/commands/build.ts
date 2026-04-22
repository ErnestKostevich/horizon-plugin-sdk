import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import archiver from 'archiver';
import kleur from 'kleur';

interface BuildOptions {
  out?: string;
}

const REQUIRED_MANIFEST_KEYS = ['id', 'name', 'version', 'description', 'author', 'tools', 'permissions'];

export async function buildCommand(opts: BuildOptions): Promise<void> {
  const cwd = process.cwd();
  const manifestPath = path.join(cwd, 'manifest.json');
  const mainPath = path.join(cwd, 'main.js');

  const manifestRaw = await fsp.readFile(manifestPath, 'utf8').catch(() => {
    throw new Error('manifest.json not found. Run `hz-plugin init <name>` first.');
  });
  await fsp.access(mainPath).catch(() => { throw new Error('main.js not found next to manifest.json.'); });

  const manifest = JSON.parse(manifestRaw);
  for (const key of REQUIRED_MANIFEST_KEYS) {
    if (!(key in manifest)) throw new Error(`manifest.json missing required key: ${key}`);
  }
  if (!/^[a-z0-9-]{3,48}$/.test(manifest.id)) throw new Error('manifest.id must be 3–48 lowercase kebab-case chars.');
  if (!/^\d+\.\d+\.\d+/.test(manifest.version)) throw new Error('manifest.version must be SemVer.');

  const outDir = path.join(cwd, 'dist');
  await fsp.mkdir(outDir, { recursive: true });
  const outPath = opts.out ? path.resolve(opts.out) : path.join(outDir, `${manifest.id}-${manifest.version}.hzplugin`);
  const output = fs.createWriteStream(outPath);
  const zip = archiver('zip', { zlib: { level: 9 } });

  const done = new Promise<void>((resolve, reject) => {
    output.on('close', resolve);
    zip.on('error', reject);
  });

  zip.pipe(output);
  zip.file(manifestPath, { name: 'manifest.json' });
  zip.file(mainPath, { name: 'main.js' });
  for (const opt of ['icon.png', 'README.md']) {
    const p = path.join(cwd, opt);
    if (fs.existsSync(p)) zip.file(p, { name: opt });
  }
  await zip.finalize();
  await done;

  const stat = await fsp.stat(outPath);
  console.log(kleur.green(`\n✓ ${path.relative(cwd, outPath)} (${(stat.size / 1024).toFixed(1)} KB)\n`));
}
