import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const radice = resolve(fileURLToPath(import.meta.url), '..', '..');

export async function costruisciHtml(minimizza: boolean): Promise<string> {
  const js = await build({
    entryPoints: [resolve(radice, 'src/main.ts')],
    bundle: true,
    format: 'iife',
    target: 'es2022',
    minify: minimizza,
    write: false,
    outdir: resolve(radice, 'dist'),
    logLevel: 'warning',
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
  console.log(`dist/index.html scritto (${(html.length / 1024).toFixed(1)} KB)`);
}
