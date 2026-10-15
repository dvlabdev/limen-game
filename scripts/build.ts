import { execSync } from 'node:child_process';
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const radice = resolve(fileURLToPath(import.meta.url), '..', '..');

// Versione della build: hash breve del commit (git, oppure GITHUB_SHA in CI) e data. Si inietta con `define`.
export function versioneBuild(): { commit: string; data: string } {
  let commit = (process.env['GITHUB_SHA'] ?? '').slice(0, 7);
  if (!commit) {
    try {
      commit = execSync('git rev-parse --short HEAD', { cwd: radice, encoding: 'utf8' }).trim();
    } catch {
      commit = 'senza-git';
    }
  }
  return { commit, data: new Date().toISOString().slice(0, 10) };
}

export async function costruisciHtml(minimizza: boolean): Promise<string> {
  const v = versioneBuild();
  const js = await build({
    entryPoints: [resolve(radice, 'src/main.ts')],
    bundle: true,
    format: 'iife',
    target: 'es2022',
    minify: minimizza,
    write: false,
    outdir: resolve(radice, 'dist'),
    logLevel: 'warning',
    define: { __LIMEN_COMMIT__: JSON.stringify(v.commit), __LIMEN_DATA__: JSON.stringify(v.data) },
  });
  const css = await build({
    entryPoints: [resolve(radice, 'src/ui/styles.css')],
    bundle: true,
    minify: minimizza,
    write: false,
    outdir: resolve(radice, 'dist'),
    logLevel: 'warning',
  });
  const script = (js.outputFiles ?? []).map((f) => f.text).join('\n').replace(/<\/script/gi, '<\/script');
  const stile = (css.outputFiles ?? []).map((f) => f.text).join('\n').replace(/<\/style/gi, '<\/style');
  const modello = readFileSync(resolve(radice, 'src/index.html'), 'utf8');
  return modello
    .replace('/*STILE*/', () => stile)
    .replace('/*SCRIPT*/', () => script);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const html = await costruisciHtml(true);
  mkdirSync(resolve(radice, 'dist'), { recursive: true });
  writeFileSync(resolve(radice, 'dist/index.html'), html);
  const v = versioneBuild();
  console.log(`dist/index.html scritto (${(html.length / 1024).toFixed(1)} KB) · versione ${v.commit} ${v.data}`);
}
