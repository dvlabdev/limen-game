// Versione della build: la inietta scripts/build.ts (define di esbuild) con l'hash breve del commit e la data.
// Fuori dalla build (sviluppo, test) vale "dev".
declare const __LIMEN_COMMIT__: string;
declare const __LIMEN_DATA__: string;

export interface Versione {
  commit: string;
  data: string;
}

export const VERSIONE: Versione = {
  commit: typeof __LIMEN_COMMIT__ === 'string' ? __LIMEN_COMMIT__ : 'dev',
  data: typeof __LIMEN_DATA__ === 'string' ? __LIMEN_DATA__ : '',
};

export function testoVersione(v: Versione = VERSIONE): string {
  return v.data ? `${v.commit} · ${v.data}` : v.commit;
}
