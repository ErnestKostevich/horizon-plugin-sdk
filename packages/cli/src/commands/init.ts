import fs from 'node:fs/promises';
import path from 'node:path';
import prompts from 'prompts';
import kleur from 'kleur';

interface InitOptions {
  template: string;
}

export async function initCommand(name: string, opts: InitOptions): Promise<void> {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  if (!slug) throw new Error('Invalid plugin name.');

  const dir = path.resolve(process.cwd(), slug);
  await fs.mkdir(dir, { recursive: true });

  const answers = await prompts([
    { type: 'text', name: 'displayName', message: 'Display name', initial: slug },
    { type: 'text', name: 'description', message: 'One-line description' },
    { type: 'text', name: 'author', message: 'Your name / handle' },
    { type: 'number', name: 'priceUsd', message: 'Price USD (0 = free)', initial: 0 },
  ], { onCancel: () => { throw new Error('Cancelled.'); } });

  const manifest = {
    id: slug,
    name: answers.displayName || slug,
    version: '0.1.0',
    description: answers.description || '',
    author: answers.author || '',
    license: 'MIT',
    category: 'other' as const,
    priceUsd: Number(answers.priceUsd) || 0,
    permissions: ['network.fetch'] as const,
    tools: [
      {
        name: 'hello',
        description: 'Say hello to the user.',
        inputSchema: {
          type: 'object' as const,
          properties: { who: { type: 'string' as const, description: 'Name to greet.' } },
          required: ['who'],
        },
      },
    ],
  };

  // Sprint-3 — scaffold writes the `execute(tool, args, ctx)` dispatcher
  // form to match every Horizon built-in plugin. The file is named
  // main.js for backward compatibility with older host versions; the
  // build step renames it to handler.js inside the .hzplugin zip.
  const handlerSource =
`'use strict';

module.exports = {
  async execute(tool, args, ctx) {
    if (tool === 'hello') {
      const who = (args && args.who) || 'world';
      return { ok: true, out: 'Hello, ' + who + '!' };
    }
    return { ok: false, error: 'Unknown tool: ' + tool };
  }
};
`;

  await fs.writeFile(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  await fs.writeFile(path.join(dir, 'main.js'), handlerSource);
  await fs.writeFile(path.join(dir, 'README.md'), `# ${manifest.name}\n\n${manifest.description}\n\nScaffolded with \`@horizonai/plugin-cli\` (${opts.template}).\n`);
  await fs.writeFile(path.join(dir, '.gitignore'), 'node_modules/\ndist/\n*.hzplugin\n');

  console.log(kleur.green(`\n✓ Created ${slug}/`));
  console.log(kleur.gray(`  next: cd ${slug} && npx @horizonai/plugin-cli build\n`));
}
