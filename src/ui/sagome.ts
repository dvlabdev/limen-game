// Id sagoma → SVG inline (ARENA_S23_SPEC §3). Sagome statiche del viandante e dei nemici, in posa neutra.
// COPIA di design/sagome.proposed.ts (C2a), GENERATO da design/genera.mjs (geometria in design/sagome-dati.mjs):
// non modificare a mano. Integrato qui da Codice nella fase C2.
// Masse piene in currentColor, di profilo, rivolte a destra: il nemico si specchia (opzione `specchia`).
// Sistema di coordinate di SCENA_SPEC §2.1: 120 unità = 120 px su S23, origine a terra sotto il bacino, y verso il basso.

export type IdSagoma = 'viandante.assalto' | 'viandante.guardia' | 'viandante.attesa' | 'viandante.distanza' | 'recluta' | 'duellante' | 'bruto' | 'lanciere' | 'mietitore';

export interface Sagoma {
  /** Nome leggibile, anche per aria-label. */
  etichetta: string;
  /** Altezza della cima della testa in unità (120 = altezza di riferimento). Il boss è più alto. */
  altezza: number;
  /** Contenuto interno dell'SVG, nel viewBox di VIEWBOX_SAGOMA. */
  svg: string;
}

/** Viewbox comune a tutte le sagome: x simmetrico, così la specchiatura non sposta la figura. Origine a terra, sotto il bacino. */
export const VIEWBOX_SAGOMA = { x: -100, y: -158, w: 200, h: 164 } as const;

/** Altezza di riferimento in unità: con `px: 120` una unità vale un pixel. */
export const ALTEZZA_RIFERIMENTO = 120;

/** Posizione in scena delle posture del viandante, in passi (SCENA_SPEC §1.1 asse E; un passo = 24 unità). */
export const PASSO_POSTURA: Record<string, number> = { assalto: 1, guardia: 0, attesa: 0, distanza: -1 };

export const SAGOME: Record<IdSagoma, Sagoma> = {
  'viandante.assalto': {
    etichetta: 'Viandante · Assalto',
    altezza: 105,
    svg: '<path d="M11 -81L22.7 -93.3L26.9 -89.6L15.9 -76.6Z"/><path d="M22 -91.4L22 -107.4L26.5 -107.5L27.6 -91.6Z"/><path d="M27.3 -107.5L25.5 -110.3L22.2 -109.8L21.3 -106.5L23.9 -104.4L26.9 -105.9Z"/><path d="M9.2 -46.9L7.5 -19L-2 -19L-3.2 -47.1Z"/><path d="M4.6 -14.6L-21.8 -5.2L-24.2 -10.8L0.9 -23.4Z"/><path d="M-28 -3L-26 -9L-20 -9L-9.4 0L-15 0Z"/><path d="M10.6 -84.6L5.1 -82.2L-0.9 -69.5L-14.8 -57.4L-27.4 -47.9L-20.8 -39.3L-37.3 -35.5L-19.9 -32.7L-26.7 -23.4L-7 -27.2L-0.2 -43.9Z"/><path d="M-3.9 -49.4L9.4 -44.8L15.4 -56.1L20.8 -68.3L21.5 -78.7L6.2 -84L0.3 -68.9Z"/><path d="M6.2 -52.3L29.4 -36.6L24.5 -28.5L-0.2 -41.7Z"/><path d="M31.7 -33.4L35 -5.6L29 -4.4L22.3 -31.7Z"/><path d="M27 0L29 -6L35 -6L46 0L40 0Z"/><path d="M10.8 -81.9L14 -94.5L20.8 -93L18.6 -80.2Z"/><path d="M20.3 -85.3L25.4 -89.4L26.4 -94.7L25 -101L19 -105.2L10.8 -104.3L0.7 -96.6L6.8 -89.7L10.2 -85.2Z"/><path d="M10.4 -80.7L19.9 -94.9L25 -91.7L16.5 -76.9Z"/><path d="M19.4 -92.8L17.8 -108.8L22.7 -109.4L25.4 -93.7Z"/><path d="M23.6 -109.1L21.6 -112.2L18 -111.6L17 -108.1L19.9 -105.8L23.1 -107.4Z"/><path fill-rule="evenodd" d="M17.5 -115.3L-9.7 -144.6L-15.5 -147.4L-13.1 -141.5L14.2 -112.2ZM14.4 -116L-7 -138.9L-7.6 -138.4L13.8 -115.4Z"/><path d="M23.6 -117.2L21.7 -119.2L10 -108.3L11.9 -106.3Z"/><path d="M23.6 -107.4L18.7 -112.6L16.8 -110.8L21.7 -105.7Z"/><path d="M22.6 -106.5L25.6 -106.4L25.5 -103.5L22.5 -103.6Z"/>',
  },
  'viandante.guardia': {
    etichetta: 'Viandante · Guardia',
    altezza: 112,
    svg: '<path d="M2 -85.6L12.6 -72.3L8.3 -68.7L-3 -81.4Z"/><path d="M7.9 -71.7L15.4 -85.9L19.5 -83.9L12.9 -69.3Z"/><path d="M20.5 -84.9L18.7 -87.7L15.4 -87.2L14.5 -83.9L17.1 -81.8L20.1 -83.3Z"/><path d="M6 -51.3L10.4 -23.6L1.1 -21.6L-6 -48.7Z"/><path d="M8.8 -18.9L-14.1 -2.6L-17.9 -7.4L2.8 -26.3Z"/><path d="M-21 0L-19 -6L-13 -6L-2 0L-8 0Z"/><path d="M-5 -88L-9.5 -84L-11 -70L-14.8 -54L-20 -41L-15.5 -35L-23.6 -26L-12.5 -29L-14.1 -18L-3 -28L-2 -46Z"/><path d="M-7.3 -50L6.7 -50L8.7 -62.6L9.9 -75.9L7.2 -86L-9 -86L-9.6 -69.8Z"/><path d="M3.8 -54.8L24.9 -36.3L18.9 -28.8L-3.8 -45.2Z"/><path d="M26.6 -31.7L20 -4.5L14 -5.5L17.2 -33.4Z"/><path d="M12 0L14 -6L20 -6L31 0L25 0Z"/><path d="M-4 -86L-3.5 -100.5L3.5 -100.5L4 -86Z"/><path d="M4 -92.5L8.5 -97.3L8.8 -102.7L6.5 -108.7L0 -112.1L-8 -110L-17 -101L-10 -95L-6 -91Z"/><path d="M1.7 -86.3L14.8 -75.4L11 -70.7L-2.7 -80.7Z"/><path d="M10.1 -74.3L17.2 -88.7L21.7 -86.6L15.7 -71.8Z"/><path d="M22.8 -87.7L20.8 -90.7L17.2 -90.1L16.2 -86.6L19.1 -84.3L22.3 -86Z"/><path fill-rule="evenodd" d="M22.4 -93.8L26.5 -133.6L24.9 -139.8L22 -134L17.8 -94.3ZM20.7 -96.6L24 -127.8L23.2 -127.9L19.9 -96.6Z"/><path d="M27.7 -90.4L28 -93.2L12.1 -94.9L11.8 -92.1Z"/><path d="M20.3 -84L21.1 -91.1L18.5 -91.4L17.7 -84.3Z"/><path d="M19 -84.2L20.9 -81.9L18.6 -80L16.7 -82.3Z"/>',
  },
  'viandante.attesa': {
    etichetta: 'Viandante · Attesa',
    altezza: 89,
    svg: '<path d="M17.6 -67.1L18.5 -50.1L13 -49.6L11 -66.5Z"/><path d="M17.2 -52.2L30.5 -43.3L28.1 -39.5L14.3 -47.5Z"/><path d="M32.4 -41.4L30.6 -44.2L27.3 -43.7L26.4 -40.4L29 -38.3L32 -39.9Z"/><path d="M3.4 -41.3L22 -20.3L15.2 -13.6L-5.4 -32.7Z"/><path d="M19.4 -12.3L-8.5 -9L-9.5 -15L17.7 -21.6Z"/><path d="M-14 -7L-12 -13L-6 -13L4 0L-1 0Z"/><path d="M12.4 -72.9L6.6 -71.5L-1.3 -59.8L-13.8 -48.3L-24.9 -41L-22 -33.7L-34.6 -31.8L-21.7 -27.8L-28.1 -20.6L-12.4 -21.9L-4.6 -34.4Z"/><path d="M-7.4 -40.4L4.9 -33.8L12.6 -44L19.9 -55.3L22.2 -65.4L8 -73L-0.2 -59Z"/><path d="M-0.3 -43.1L27.4 -38.3L26.2 -28.9L-1.7 -30.9Z"/><path d="M30.5 -30.6L11.4 -10L6.6 -14L23.1 -36.6Z"/><path d="M4 -7L6 -13L12 -13L21.9 0L17 0Z"/><path d="M12.3 -70.5L17.1 -79.3L23.4 -76.2L19.5 -67Z"/><path d="M22.2 -69L27.8 -72.6L29.4 -77.8L28.6 -84.2L23.1 -89L14.8 -88.9L3.9 -82.4L9.3 -74.9L12.2 -70Z"/><path d="M17.6 -68.2L23.5 -52.2L17.9 -49.9L11 -65.5Z"/><path d="M21.8 -53.9L36.4 -47.3L34.6 -42.8L19.5 -48.2Z"/><path d="M38.8 -45.1L36.9 -48.1L33.2 -47.6L32.3 -44L35.1 -41.7L38.4 -43.4Z"/><path fill-rule="evenodd" d="M40.9 -41L79.2 -29.3L85.6 -29.7L80.5 -33.7L42.3 -45.4ZM44 -42L74 -32.9L74.2 -33.6L44.2 -42.8Z"/><path d="M36.6 -36.4L39.3 -35.5L43.9 -50.8L41.3 -51.7Z"/><path d="M31.8 -44.8L38.6 -42.8L39.3 -45.2L32.5 -47.3Z"/><path d="M32.1 -46.1L29.5 -44.7L28.1 -47.3L30.7 -48.7Z"/>',
  },
  'viandante.distanza': {
    etichetta: 'Viandante · Distanza',
    altezza: 112,
    svg: '<path d="M-19.3 -82.1L-35.1 -88.4L-33.2 -93.7L-17 -88.3Z"/><path d="M-36.5 -89.7L-44.1 -103.8L-40.2 -106L-31.7 -92.4Z"/><path d="M-39 -104.9L-40.9 -107.7L-44.2 -107.2L-45.1 -103.9L-42.5 -101.8L-39.5 -103.4Z"/><path d="M-2.9 -53.9L0 -26L-9.4 -24.6L-15.1 -52.1Z"/><path d="M-1.3 -22.1L-21.8 -2.9L-26.2 -7.1L-8.2 -28.6Z"/><path d="M-29 0L-27 -6L-21 -6L-10 0L-16 0Z"/><path d="M-23.7 -88.4L-27 -83.4L-24.8 -69.5L-23.2 -53.3L-24.2 -40.1L-19.3 -35.5L-23.6 -25.5L-14.9 -30.8L-13.4 -20.3L-6.5 -32L-9.9 -48.6Z"/><path d="M-16 -51.1L-2.5 -54.7L-3.8 -67.4L-6.2 -80.6L-11.4 -89.6L-27 -85.5L-23.4 -69.6Z"/><path d="M-5 -57.7L15.5 -38.6L9.3 -31.3L-13 -48.3Z"/><path d="M17 -36.2L23 -8.8L17 -7.2L7.8 -33.7Z"/><path d="M15 -3L17 -9L23 -9L33.5 0L28 0Z"/><path d="M-22.3 -87.1L-23.9 -99.5L-17 -100.7L-14.4 -88.5Z"/><path d="M-15.7 -92.5L-11.7 -97.8L-12 -103.2L-14.9 -108.9L-21.7 -111.6L-29.4 -108.7L-37.4 -98.8L-29.9 -93.6L-25.5 -90Z"/><path d="M-18.9 -88.7L-2.2 -91.7L-0.9 -85.8L-17.4 -81.7Z"/><path d="M-1.8 -91.8L14.1 -92.9L14.6 -88L-1.2 -85.8Z"/><path d="M17.7 -90.4L15.8 -93.5L12.1 -92.9L11.2 -89.4L14 -87.1L17.3 -88.8Z"/><path fill-rule="evenodd" d="M20.9 -88.6L64.8 -91.7L70.7 -94.4L64.5 -96.2L20.6 -93.2ZM23.4 -90.7L58.7 -93.1L58.7 -93.9L23.3 -91.5Z"/><path d="M18.5 -82.7L21.3 -82.9L20.2 -98.9L17.4 -98.7Z"/><path d="M11 -88.9L18.1 -89.4L17.9 -92L10.8 -91.5Z"/><path d="M10.9 -90.2L8.9 -88L6.7 -89.9L8.7 -92.1Z"/>',
  },
  'recluta': {
    etichetta: 'Recluta',
    altezza: 115,
    svg: '<path d="M4 -88.5L9.4 -72.4L4.7 -70.7L-1.5 -86.5Z"/><path d="M6.3 -73.9L21.7 -78.4L22.9 -74.5L7.8 -69.1Z"/><path d="M25 -76.4L23.4 -79L20.4 -78.5L19.7 -75.6L22 -73.7L24.7 -75.1Z"/><path d="M5.4 -55.1L10 -27.5L1.6 -25.7L-5.4 -52.9Z"/><path d="M9.1 -23.9L-9.9 -3.3L-14.1 -6.7L2.5 -29.3Z"/><path d="M-17 0L-15 -6L-9 -6L2 0L-4 0Z"/><path d="M-4.5 -82.3L-7.3 -76.4L-8.9 -56.5L-4 -53.2L-4.9 -74.3Z"/><path d="M-6.5 -54.3L6 -53.7L8.4 -66.2L10.1 -79.4L8.3 -89.6L-6.1 -90.4L-7.6 -74.2Z"/><path d="M4.2 -57.6L21.4 -35.4L14.9 -29.9L-4.2 -50.4Z"/><path d="M22.4 -32.1L16.7 -4.6L11.3 -5.4L14 -33.3Z"/><path d="M9 0L11 -6L17 -6L28 0L22 0Z"/><path d="M-2.1 -90L-1.6 -103.5L5.4 -103.5L5.9 -90Z"/><path d="M5.9 -95L10.4 -99.5L11.1 -105.1L9.7 -106.5L9.3 -111.9L3.9 -114.9L-4.1 -114.3L-8.6 -107.5L-8.1 -99L-4.1 -94Z"/><path d="M9.3 -111.9L11.3 -105.1L12.5 -105.1L10.8 -112.3Z"/><path d="M3.3 -89.9L16 -78.6L12.5 -74.5L-0.8 -85Z"/><path d="M14.7 -79.2L30.4 -76.5L29.8 -72.1L13.9 -73.9Z"/><path d="M33.1 -74.3L31.3 -77.1L28.1 -76.6L27.3 -73.4L29.8 -71.3L32.7 -72.8Z"/><path fill-rule="evenodd" d="M34.7 -69.3L58.5 -56.6L64.9 -55.8L60.7 -60.7L36.9 -73.4ZM37.9 -69.7L54.1 -61.1L54.5 -61.8L38.3 -70.5Z"/><path d="M29.5 -65.6L32 -64.3L39.5 -78.4L37.1 -79.7Z"/><path d="M26.4 -74.8L32.7 -71.5L33.9 -73.8L27.6 -77.1Z"/><path d="M27 -76L24.2 -75.1L23.3 -77.9L26.2 -78.8Z"/><path fill-rule="evenodd" d="M21.1 -89.7L37.5 -89.7L37.5 -80.3L35.9 -74.1L29.3 -67.2L22.6 -74.1L21.1 -80.3ZM22.6 -87.8L35.9 -87.8L35.9 -80.6L34.6 -74.9L29.3 -69.6L24 -74.9L22.6 -80.6L23.4 -80.7L24.7 -75.4L29.3 -70.8L33.9 -75.4L35.1 -80.7L35.1 -86.8L23.4 -86.8Z"/>',
  },
  'duellante': {
    etichetta: 'Duellante',
    altezza: 121,
    svg: '<path d="M-1.6 -84.9L-11.7 -98.5L-8.4 -101.1L2.4 -88Z"/><path d="M-11.9 -100.8L-4.1 -114.8L-1 -113.1L-8.2 -98.8Z"/><path d="M-0.2 -113.9L-1.6 -116.1L-4.1 -115.7L-4.8 -113.2L-2.8 -111.6L-0.5 -112.8Z"/><path d="M2.7 -52.9L1.2 -24.9L-6.1 -25.1L-6.7 -53.1Z"/><path d="M0.2 -22.4L-20.3 -3.3L-23.7 -6.7L-5 -27.6Z"/><path d="M-27 0L-25 -6L-19 -6L-8 0L-14 0Z"/><path d="M-3.8 -90.3L-8.1 -86.7L-11.4 -71.9L-9.4 -59.7L-3.3 -61.1Z"/><path d="M-7.4 -53.5L3 -52.6L5.6 -65L7.6 -78.2L6.5 -88.4L-5.6 -89.4L-7.5 -73.4Z"/><path d="M1.8 -55.9L17.9 -33L12.1 -28.5L-5.8 -50.1Z"/><path d="M18.4 -32.2L28.2 -5.9L23.8 -4.1L11.6 -29.3Z"/><path d="M21 0L23 -6L29 -6L40 0L34 0Z"/><path d="M-2.9 -89L-1.9 -103L5.1 -102.7L5.1 -88.7Z"/><path d="M4.1 -94.7L8.8 -98.9L9.5 -103.9L7.8 -108.4L-3.8 -111.3L-7.4 -103.5L-4.5 -95.3Z"/><path d="M-13 -109.3L0.1 -110.4L15 -107.9L21.2 -109.9L13.3 -112.7L5.6 -117.2L-4.4 -116.5L-9.7 -112.5Z"/><path d="M-1.5 -116.1L-13.1 -120.9L-24.3 -119.7L-32.7 -114.3L-26.5 -115.9L-17.5 -116.4L-5.7 -113.4Z"/><path d="M2.2 -88.5L14.9 -77.3L12 -73.7L-1.3 -84.3Z"/><path d="M13.4 -77.8L29.4 -77.4L29.4 -73.6L13.4 -73.2Z"/><path d="M32 -75.5L30.5 -77.8L27.7 -77.4L27 -74.7L29.2 -72.9L31.7 -74.2Z"/><path d="M36.6 -75.7L87.3 -87.3L90.1 -88.4L87.1 -88.2L36 -78.2Z"/><path d="M32.8 -75.1L36.5 -75.9L36.1 -78L32.3 -77.2Z"/><path d="M33.8 -76.4L37.1 -70.5L39.2 -70.9L36.5 -83.6L34.4 -83.2Z"/><path d="M26.5 -73.7L32.8 -75.1L32.3 -77.2L26.1 -75.9Z"/><path d="M26.3 -74.8L25.4 -72.4L23 -74.1L24.5 -76.7Z"/>',
  },
  'bruto': {
    etichetta: 'Bruto',
    altezza: 112,
    svg: '<path d="M14.9 -86.7L20.7 -66.5L13.6 -64.2L6.5 -84Z"/><path d="M19.3 -68.5L35.5 -56.7L32.1 -51.7L15.1 -62.3Z"/><path d="M37.9 -54.2L35.5 -58L31 -57.3L29.8 -52.9L33.3 -50.1L37.4 -52.1Z"/><path d="M6.2 -49.7L6.6 -23.6L-6.1 -22.5L-10.2 -48.3Z"/><path d="M4.9 -18.7L-14 -2.2L-20 -7.8L-4.4 -27.5Z"/><path d="M-22 0L-20 -6L-14 -6L0 0L-9 0Z"/><path d="M3.2 -89.7L-4 -81.6L-11.1 -65.1L-9.1 -55.8L-1.1 -72.1Z"/><path d="M-11.9 -52.6L7.1 -45.7L14.8 -58.2L21.5 -71.9L21.8 -84L-0.2 -92L-7.4 -75Z"/><path d="M4.1 -54.5L20.2 -34L10.8 -25.5L-8.1 -43.5Z"/><path d="M21.8 -30.6L23.1 -5.6L14.9 -4.4L9.2 -28.9Z"/><path d="M14 0L16 -6L22 -6L36 0L27 0Z"/><path d="M8.1 -88.5L10.8 -97.1L17.6 -95.4L15.9 -86.6Z"/><path d="M19.2 -87.3L24.2 -92.3L24.6 -99.3L22.2 -103.8L16.2 -106.3L8.2 -106.3L3.2 -100.3L3.2 -92.3L7.2 -86.8Z"/><path d="M12.7 -105.7L14.7 -111.9L16.7 -105.7Z"/><path d="M5.7 -103.7L4.6 -109.7L8.6 -105.5Z"/><path d="M14.8 -87.9L25.3 -69.7L18.4 -65.4L6.6 -82.8Z"/><path d="M23.9 -71L40.8 -60.4L37.5 -54.7L19.8 -64Z"/><path d="M43.6 -57.5L41 -61.7L36.1 -60.9L34.9 -56.1L38.7 -53.1L43 -55.3Z"/><path d="M30.7 -63.3L71.7 -22.3L74.4 -24.9L33.4 -66Z"/><path fill-rule="evenodd" d="M65.3 -18.6L66.4 -15.5L78.4 -3.4L80.9 -3.1L93.6 -15.8L93.2 -18.3L81.2 -30.3L78 -31.4ZM69.9 -15.5L70.8 -14.6L82.1 -25.9L81.2 -26.8Z"/>',
  },
  'lanciere': {
    etichetta: 'Lanciere',
    altezza: 120,
    svg: '<path d="M2.8 -88.8L5.3 -72L0.8 -71.2L-2.6 -87.9Z"/><path d="M4.8 -73.1L14.8 -60.6L11.9 -58.2L1.3 -70.2Z"/><path d="M15.9 -59.4L14.4 -61.7L11.6 -61.3L10.9 -58.6L13.1 -56.8L15.5 -58.1Z"/><path d="M2 -54.8L5 -26.9L-2.7 -25.7L-8 -53.2Z"/><path d="M4.1 -23.8L-15.1 -3.4L-18.9 -6.6L-1.8 -28.8Z"/><path d="M-22 0L-20 -6L-14 -6L-3 0L-9 0Z"/><path d="M-5.7 -85.5L-8.4 -78.7L-10.5 -58.8L-5.9 -55.3L-5.7 -76.4Z"/><path d="M-8.9 -54.6L2.5 -53.4L5.5 -66.1L7.8 -79.6L6.7 -90.2L-6.5 -91.6L-8.7 -75.1Z"/><path d="M0.8 -57.3L18.4 -35.5L12.5 -30.4L-6.8 -50.7Z"/><path d="M19.4 -33.2L19.5 -5.1L14.5 -4.9L11.6 -32.7Z"/><path d="M12 0L14 -6L20 -6L31 0L25 0Z"/><path d="M-3.1 -90.9L-2.1 -104.9L4.9 -104.7L4.9 -90.7Z"/><path d="M5.4 -96.3L9.8 -100.8L10 -106.8L7.9 -110.8L2.4 -114.4L-4.6 -114L-8.6 -107.8L-8 -100.2L-4.6 -95.3Z"/><path d="M-7.6 -109.8L-0.6 -114.8L7.4 -112.8L3.4 -120.4L-8.6 -119L-12.6 -113.8Z"/><path d="M7.8 -108.2L10 -108.2L9 -102.2Z"/><path d="M-8.7 -57.6L3.8 -56.3L3.2 -41.3L-4.8 -37.1L-11.2 -42.8Z"/><path d="M2.9 -89.4L8.3 -73.2L3.6 -71.5L-2.7 -87.4Z"/><path d="M7.2 -74.5L20.8 -66.1L18.8 -62.6L4.7 -70.2Z"/><path d="M22.5 -64.4L20.9 -66.9L17.9 -66.4L17.2 -63.5L19.5 -61.6L22.2 -63Z"/><path d="M-0.1 -41.8L80.5 -125.3L78.5 -127.2L-2.1 -43.8Z"/><path d="M79.5 -126.3L85.6 -127.3L92 -139.2L80.4 -132.3Z"/><path d="M79.9 -121.7L82 -123.9L77.1 -128.6L75 -126.5Z"/><path d="M-1.1 -42.8L-1.4 -39L-5.2 -38.5L-4.9 -42.3Z"/>',
  },
  'mietitore': {
    etichetta: 'Mietitore',
    altezza: 131,
    svg: '<path d="M3.3 -97.1L19.5 -85.4L17.5 -82.5L0.9 -93.8Z"/><path d="M16.9 -84.6L23.7 -102.3L26.3 -101.3L20.1 -83.4Z"/><path d="M26.9 -101.8L25.8 -103.6L23.7 -103.3L23.2 -101.2L24.8 -99.9L26.7 -100.9Z"/><path d="M3.8 -58.6L7.6 -29.9L1.8 -28.9L-3.8 -57.4Z"/><path d="M7.2 -27.8L-9.4 -4L-12.6 -6L2.2 -31Z"/><path d="M-16 0L-14 -6L-8 -6L3 0L-3 0Z"/><path d="M-3.1 -99.3L-7.6 -92.6L-12 -72.9L-17.5 -51.2L-25 -29.7L-18.4 -24.2L-18.3 -11.2L-10.9 -16.7L-7.6 -6.4L-1.1 -14L6.3 -5.4L11 -15.1L14.5 -6.9L17.9 -26.7L9.4 -49.3L8.5 -65.4L8.2 -75.5Z"/><path d="M-5.8 -58.4L5.4 -57.6L8 -71.5L9.9 -86.2L8.5 -97.5L-4.4 -98.4L-6.2 -80.5Z"/><path d="M3.3 -60.1L18 -35.1L13 -31.9L-3.3 -55.9Z"/><path d="M18.4 -32.9L11.9 -4.6L8.1 -5.4L12.6 -34Z"/><path d="M5 0L7 -6L13 -6L24 0L18 0Z"/><path d="M-1.2 -98.2L0.3 -113.1L7.3 -112.6L6.8 -97.6Z"/><path d="M6.4 -103.7L11.3 -109.5L11.4 -116.5L8.3 -121.6L2.8 -130.9L-4.6 -124.3L-12.2 -111.7L-5.6 -105.3L-1.7 -102.1Z"/><path d="M2.9 -97.5L21.6 -90.4L20.3 -86.8L1.4 -93.3Z"/><path d="M19.3 -89.5L29.1 -105.8L31.7 -104.3L22.5 -87.7Z"/><path d="M32.5 -105.1L31.3 -107L29 -106.6L28.4 -104.4L30.2 -103L32.2 -104Z"/><path d="M31.8 -7.1L31.8 -151.1L29 -151.1L29 -7.1Z"/><path d="M30.9 -154.4L36.2 -153.2L41.7 -151L46.5 -147.9L50.6 -144.1L53.8 -139.7L56.2 -134.9L57.6 -129.9L56.5 -129.5L53.9 -133.7L50.8 -137.3L47.1 -140.2L43.1 -142.2L38.8 -143.5L34.6 -144L29.9 -143.7Z"/><path d="M33.6 -142.1L33.6 -150.1L27.2 -150.1L27.2 -142.1Z"/><path d="M30.4 -7.1L32.6 -4.1L30.4 -1.1L28.2 -4.1Z"/>',
  },
};

export interface OpzioniSagoma {
  /** Altezza di riferimento in px (predefinita 120): l'SVG è largo e alto in proporzione. */
  px?: number;
  /** Classe CSS aggiuntiva. */
  classe?: string;
  /** true: la sagoma porta significato da sola (role="img" con aria-label). Predefinito: decorativa. */
  parlante?: boolean;
  /** true: figura specchiata, rivolta a sinistra. Si usa per i nemici (SCENA_SPEC §2.1). */
  specchia?: boolean;
}

/** Restituisce l'SVG inline della sagoma. La stringa è costante e sicura: non va passata a esc(). */
export function sagoma(id: string, opz: OpzioniSagoma = {}): string {
  const s = (SAGOME as Record<string, Sagoma | undefined>)[id];
  if (!s) return '';
  const k = (opz.px ?? ALTEZZA_RIFERIMENTO) / ALTEZZA_RIFERIMENTO;
  const { x, y, w, h } = VIEWBOX_SAGOMA;
  const a11y = opz.parlante ? `role="img" aria-label="${s.etichetta}"` : 'aria-hidden="true"';
  const classe = opz.classe ? `sagoma ${opz.classe}` : 'sagoma';
  const corpo = opz.specchia ? `<g transform="scale(-1 1)">${s.svg}</g>` : s.svg;
  return `<svg class="${classe}" viewBox="${x} ${y} ${w} ${h}" width="${+(w * k).toFixed(1)}" height="${+(h * k).toFixed(1)}" fill="currentColor" focusable="false" ${a11y}>${corpo}</svg>`;
}
