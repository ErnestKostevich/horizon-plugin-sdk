import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import kleur from 'kleur';

interface PublishOptions {
  api: string;
  token?: string;
}

export async function publishCommand(opts: PublishOptions): Promise<void> {
  const cwd = process.cwd();
  const manifestPath = path.join(cwd, 'manifest.json');
  const manifest = JSON.parse(await fsp.readFile(manifestPath, 'utf8'));
  const bundlePath = path.join(cwd, 'dist', `${manifest.id}-${manifest.version}.hzplugin`);

  if (!fs.existsSync(bundlePath)) throw new Error(`Bundle not found at ${bundlePath}. Run 'hz-plugin build' first.`);

  const token = opts.token || process.env.HORIZON_TOKEN;
  if (!token) throw new Error('Missing auth token. Set HORIZON_TOKEN env or pass --token.');

  const form = new FormData();
  form.append('slug', manifest.id);
  form.append('name', manifest.name);
  form.append('description', manifest.description);
  form.append('priceUsd', String(manifest.priceUsd ?? 0));
  form.append('category', manifest.category || 'other');
  const bytes = await fsp.readFile(bundlePath);
  form.append('bundle', new Blob([new Uint8Array(bytes)]), path.basename(bundlePath));

  const res = await fetch(`${opts.api.replace(/\/$/, '')}/api/plugins/publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Publish failed (${res.status}): ${body}`);
  }
  const data: { plugin_id: string; status: string; message?: string } = await res.json();
  console.log(kleur.green(`\n✓ Submitted ${data.plugin_id} — status: ${data.status}`));
  if (data.message) console.log(kleur.gray(`  ${data.message}\n`));
}
