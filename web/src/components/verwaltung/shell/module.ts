import type { Aktion } from '@/lib/rechte/matrix';

/**
 * Module der Verwaltung (V01–V14) in der Reihenfolge der Seitenleiste. Ein Modul erscheint nur, wenn es gebaut
 * ist (`gebaut`) und die Rolle es lesen darf (`recht`). Neue Module tragen sich hier ein (Welle C).
 */
export type ModulSchluessel = 'uebersicht' | 'veranstaltungen';
export type ModulIcon = 'uebersicht' | 'veranstaltungen';

export const MODULE: readonly { schluessel: ModulSchluessel; pfad: string; recht: Aktion; icon: ModulIcon }[] = [
  { schluessel: 'uebersicht', pfad: '/verwaltung', recht: 'uebersicht.lesen', icon: 'uebersicht' },
  { schluessel: 'veranstaltungen', pfad: '/verwaltung/veranstaltungen', recht: 'veranstaltung.lesen', icon: 'veranstaltungen' },
];
