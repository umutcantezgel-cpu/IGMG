/**
 * Gruppenrechte der Lernplattform (ADR 0026). Reine Daten und Funktionen – ohne Datenbank, vollständig
 * unit-testbar. Den Kontext lädt `ladeGruppenKontext` (gemeinde.ts). Jede Konto-Action prüft zuerst Schalter, Sitzung
 * und zweiten Faktor (`verlangeKontoRecht`, ggf. mit Kontoart), lädt dann den Kontext und prüft das Gruppenrecht mit
 * `darfInGruppe` – in der Action selbst (lehrkraft.ts) oder im Dienst, den sie aufruft (lib/chat/dienst.ts,
 * lib/lernen/dienst.ts). `verlangeGruppenRecht` (gemeinde.ts) bündelt beide Schritte; die Wahrheitstafel prüft darüber den
 * ganzen Weg gegen die Datenbank. Schüler sehen nur sich selbst, Eltern nur ihr Kind, Lehrkräfte und Aufsicht nur ihre Gruppen.
 */

export const GRUPPEN_AKTIONEN = [
  'gruppe.sehen',
  'chat.gruppe.lesen',
  'chat.gruppe.schreiben',
  'chat.eltern.lesen',
  'chat.eltern.schreiben',
  'chat.melden',
  'chat.moderieren',
  'anwesenheit.erfassen',
  'anwesenheit.sehen',
  'fortschritt.erfassen',
  'fortschritt.sehen',
  'fehlmeldung.anlegen',
  'aufgabe.bearbeiten',
  'elternbrief.senden',
] as const;
export type GruppenAktion = (typeof GRUPPEN_AKTIONEN)[number];

export type LeitungsRolle = 'lehrkraft' | 'aufsicht';

/** Bezüge eines Kontos zu Gruppen. */
export type GruppenKontext = {
  benutzerId: string;
  /** Gruppen, die das Konto leitet (Lehrkraft) oder beaufsichtigt. */
  leitung: ReadonlyMap<string, LeitungsRolle>;
  /** Eigener Lerndatensatz (Schülerkonto) und dessen Gruppen. */
  eigeneLernendeId: string | null;
  eigeneGruppen: ReadonlySet<string>;
  /** Kinder (Elternkonto): Lernende-ID → Gruppen-IDs. */
  kinder: ReadonlyMap<string, ReadonlySet<string>>;
};

/** Ziel einer Gruppenaktion: betroffene/r Lernende/r (bei Anwesenheit, Fortschritt, Fehlmeldung). */
export type GruppenZiel = { lernendeId?: string };

const NUR_LEITUNG: ReadonlySet<GruppenAktion> = new Set<GruppenAktion>(['chat.moderieren', 'anwesenheit.erfassen']);
const NUR_LEHRKRAFT: ReadonlySet<GruppenAktion> = new Set<GruppenAktion>([
  'fortschritt.erfassen',
  'aufgabe.bearbeiten',
  'elternbrief.senden',
]);

function istElternteilInGruppe(k: GruppenKontext, gruppeId: string, lernendeId?: string): boolean {
  for (const [kind, gruppen] of k.kinder) {
    if (gruppen.has(gruppeId) && (lernendeId === undefined || lernendeId === kind)) return true;
  }
  return false;
}

export function darfInGruppe(k: GruppenKontext, aktion: GruppenAktion, gruppeId: string, ziel: GruppenZiel = {}): boolean {
  const leitung = k.leitung.get(gruppeId);
  const schueler = k.eigeneLernendeId !== null && k.eigeneGruppen.has(gruppeId);
  const eltern = istElternteilInGruppe(k, gruppeId);

  if (NUR_LEHRKRAFT.has(aktion)) return leitung === 'lehrkraft';
  if (NUR_LEITUNG.has(aktion)) return leitung !== undefined;

  switch (aktion) {
    case 'gruppe.sehen':
      return leitung !== undefined || schueler || eltern;
    case 'chat.gruppe.lesen':
    case 'chat.gruppe.schreiben':
      return leitung !== undefined || schueler;
    case 'chat.eltern.lesen':
    case 'chat.eltern.schreiben':
      return leitung !== undefined || eltern;
    case 'chat.melden':
      return leitung !== undefined || schueler || eltern;
    case 'anwesenheit.sehen':
      if (leitung !== undefined) return true;
      if (schueler && ziel.lernendeId === k.eigeneLernendeId) return true;
      return ziel.lernendeId !== undefined && istElternteilInGruppe(k, gruppeId, ziel.lernendeId);
    case 'fortschritt.sehen':
      if (leitung === 'lehrkraft') return true;
      if (schueler && ziel.lernendeId === k.eigeneLernendeId) return true;
      return ziel.lernendeId !== undefined && istElternteilInGruppe(k, gruppeId, ziel.lernendeId);
    case 'fehlmeldung.anlegen':
      return ziel.lernendeId !== undefined && istElternteilInGruppe(k, gruppeId, ziel.lernendeId);
    default:
      return false;
  }
}

/** Gruppen, die ein Konto überhaupt sehen darf (für Listen). */
export function sichtbareGruppen(k: GruppenKontext): Set<string> {
  const ids = new Set<string>([...k.leitung.keys(), ...k.eigeneGruppen]);
  for (const gruppen of k.kinder.values()) for (const g of gruppen) ids.add(g);
  return ids;
}
