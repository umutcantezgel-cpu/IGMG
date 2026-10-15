import type { GruppenAktion } from '@/lib/rechte/gruppen';

/**
 * Soll-Tafel der Gruppenrechte nach ADR 0026 – bewusst NICHT aus `darfInGruppe` abgeleitet, sondern aus den Regeln:
 * - Lehrkraft: alles in der eigenen Gruppe, außer Fehlmeldungen (die melden nur Eltern).
 * - Aufsicht: sehen, beide Kanäle, melden, moderieren, Anwesenheit erfassen und sehen – kein Fortschritt, keine Aufgaben,
 *   keine Elternbriefe, keine Fehlmeldungen.
 * - Schüler: Gruppe sehen, Gruppenkanal lesen/schreiben, melden; Anwesenheit und Fortschritt nur die eigenen.
 * - Eltern: Gruppe sehen, Elternkanal lesen/schreiben, melden; Anwesenheit, Fortschritt und Fehlmeldung nur fürs eigene Kind.
 * - Fremde Gruppe, fremdes Konto oder archivierte Gruppe: nichts.
 * Genutzt von der Unit-Tafel (`darfInGruppe`) und der Integrations-Tafel (`verlangeGruppenRecht` gegen die Datenbank).
 */
export const KONTOARTEN = ['lehrkraft', 'aufsicht', 'schueler', 'eltern', 'fremd'] as const;
export type Kontoart = (typeof KONTOARTEN)[number];

/** Ziel einer Aktion: die eigene Person bzw. das eigene Kind, ein fremdes Kind, kein Ziel. */
export const ZIELE = ['eigen', 'fremd', 'ohne'] as const;
export type ZielArt = (typeof ZIELE)[number];

const AUFSICHT: ReadonlySet<GruppenAktion> = new Set<GruppenAktion>([
  'gruppe.sehen',
  'chat.gruppe.lesen',
  'chat.gruppe.schreiben',
  'chat.eltern.lesen',
  'chat.eltern.schreiben',
  'chat.melden',
  'chat.moderieren',
  'anwesenheit.erfassen',
  'anwesenheit.sehen',
]);
const SCHUELER: ReadonlySet<GruppenAktion> = new Set<GruppenAktion>([
  'gruppe.sehen',
  'chat.gruppe.lesen',
  'chat.gruppe.schreiben',
  'chat.melden',
]);
const ELTERN: ReadonlySet<GruppenAktion> = new Set<GruppenAktion>([
  'gruppe.sehen',
  'chat.eltern.lesen',
  'chat.eltern.schreiben',
  'chat.melden',
]);
const NUR_EIGENES_ZIEL_SCHUELER: ReadonlySet<GruppenAktion> = new Set<GruppenAktion>(['anwesenheit.sehen', 'fortschritt.sehen']);
const NUR_EIGENES_KIND: ReadonlySet<GruppenAktion> = new Set<GruppenAktion>([
  'anwesenheit.sehen',
  'fortschritt.sehen',
  'fehlmeldung.anlegen',
]);

/** Soll: darf diese Kontoart die Aktion in ihrer eigenen (`eigeneGruppe`) bzw. einer fremden Gruppe am Ziel ausführen? */
export function soll(art: Kontoart, aktion: GruppenAktion, eigeneGruppe: boolean, ziel: ZielArt): boolean {
  if (!eigeneGruppe) return false;
  switch (art) {
    case 'lehrkraft':
      return aktion !== 'fehlmeldung.anlegen';
    case 'aufsicht':
      return AUFSICHT.has(aktion);
    case 'schueler':
      return SCHUELER.has(aktion) || (NUR_EIGENES_ZIEL_SCHUELER.has(aktion) && ziel === 'eigen');
    case 'eltern':
      return ELTERN.has(aktion) || (NUR_EIGENES_KIND.has(aktion) && ziel === 'eigen');
    case 'fremd':
      return false;
  }
}
