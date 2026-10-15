// Dichiarazioni minime dei moduli di Node usati da test, sim e script.
// Le uniche dipendenze di sviluppo sono typescript ed esbuild, quindi non c'è @types/node.

declare module 'node:test' {
  export function test(nome: string, fn: () => void | Promise<void>): void;
  export function describe(nome: string, fn: () => void): void;
  export function it(nome: string, fn: () => void | Promise<void>): void;
}

declare module 'node:assert' {
  interface Assert {
    (valore: unknown, messaggio?: string): void;
    ok(valore: unknown, messaggio?: string): void;
    equal(a: unknown, b: unknown, messaggio?: string): void;
    notEqual(a: unknown, b: unknown, messaggio?: string): void;
    notStrictEqual(a: unknown, b: unknown, messaggio?: string): void;
    strictEqual<T>(a: unknown, b: T, messaggio?: string): void;
    deepStrictEqual<T>(a: unknown, b: T, messaggio?: string): void;
    throws(fn: () => unknown, atteso?: unknown, messaggio?: string): void;
  }
  const assert: Assert & { strict: Assert };
  export default assert;
}

declare module 'node:fs' {
  export function readFileSync(percorso: string, codifica: 'utf8'): string;
  export function writeFileSync(percorso: string, dati: string): void;
  export function mkdirSync(percorso: string, opz?: { recursive?: boolean }): void;
  export function existsSync(percorso: string): boolean;
}

declare module 'node:path' {
  export function resolve(...parti: string[]): string;
  export function join(...parti: string[]): string;
  export function dirname(percorso: string): string;
}

declare module 'node:url' {
  export function fileURLToPath(url: string | URL): string;
}

declare module 'esbuild' {
  export interface OutputFile { path: string; text: string }
  export interface BuildResult { outputFiles?: OutputFile[]; errors: unknown[]; warnings: unknown[] }
  export interface BuildContext {
    watch(): Promise<void>;
    serve(opz: { servedir: string; port: number }): Promise<{ host: string; port: number }>;
    dispose(): Promise<void>;
  }
  export function build(opz: Record<string, unknown>): Promise<BuildResult>;
  export function context(opz: Record<string, unknown>): Promise<BuildContext>;
}

declare const process: {
  argv: string[];
  exit(codice?: number): never;
  exitCode?: number;
  cwd(): string;
};
