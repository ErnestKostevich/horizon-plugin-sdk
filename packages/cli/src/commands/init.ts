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

  await fs.writeFile(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  await fs.writeFile(path.join(dir, 'main.js'), `'use strict';\n\nmodule.exports = {\n  async hello({ who }, ctx) {\n    ctx.logger.info('hello called with', { who });\n    return { message: \`Hello, \${who}!\` };\n  }\n};\n`);
  await fs.writeFile(path.join(dir, 'README.md'), `# ${manifest.name}\n\n${manifest.description}\n\nScaffolded with \`@horizonai/plugin-cli\` (${opts.template}).\n`);
  await fs.writeFile(path.join(dir, '.gitignore'), 'node_modules/\ndist/\n*.hzplugin\n');

  console.log(kleur.green(`\n✓ Created ${slug}/`));
  console.log(kleur.gray(`  next: cd ${slug} && npx @horizonai/plugin-cli build\n`));
}
