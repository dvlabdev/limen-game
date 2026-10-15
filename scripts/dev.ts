import { context } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const radice = resolve(fileURLToPath(import.meta.url), '..', '..');
const cartella = resolve(radice, 'dist/dev');
mkdirSync(cartella, { recursive: true });

// La pagina di sviluppo carica app.js e app.css e si ricarica quando esbuild ricostruisce.
const modello = readFileSync(resolve(radice, 'src/index.html'), 'utf8')
  .replace('<style>/*STILE*/</style>', '<link rel="stylesheet" href="app-css.css">')
  .replace('<script>/*SCRIPT*/</script>', '<script src="app.js"></script><script>new EventSource("/esbuild").addEventListener("change", () => location.reload());</script>');
writeFileSync(resolve(cartella, 'index.html'), modello);

const ctx = await context({
  entryPoints: { app: resolve(radice, 'src/main.ts'), 'app-css': resolve(radice, 'src/ui/styles.css') },
  bundle: true,
  format: 'iife',
  target: 'es2022',
  outdir: cartella,
  sourcemap: true,
  logLevel: 'info',
});
await ctx.watch();
const { port } = await ctx.serve({ servedir: cartella, port: 8000 });
console.log(`Sviluppo su http://localhost:${port}`);
