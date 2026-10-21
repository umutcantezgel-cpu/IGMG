import { type AufgabeVon, type Lektion, LektionSchema } from '../aufgaben/schema';
import { type FreigabeBaustein, type KoranWortFreigabe, koranWortSichtbar, lektionSichtbar, wissenSichtbar } from '../freigabe';
import type { KoranPfadDatei } from '../inhalt/schema';
import {
  type BedeutungsSprache,
  KORAN_PAKET_FORMAT,
  KORAN_VERZEICHNIS_FORMAT,
  type KoranPaket,
  type KoranVerzeichnis,
  type KoranWort,
  type KoranWortZeit,
} from '../koran/typen';
import { kanonischGeprueft, sha256Hex } from './hash';

/**
 * Paketbau des Koran-Arabisch-Pfads (L6-05, ADR 0039 Nr. 1, ADR 0040 Nr. 5, KERN 4.0 §2.3) – rein, ohne Datenbank. Was
 * sichtbar ist, entscheidet nur `freigabe.ts`:
 *
 * - Eine **Bedeutung** (Zeile in `quran_wortbedeutung`, von Menschen verfasst, MN-05) steht im Paket nur mit zwei religiösen
 *   Freigaben zum aktuellen Inhalts-Hash ({@link koranBedeutungHash}) – sonst fehlt das Feld, und die Oberfläche zeigt
 *   „Bedeutung folgt“. Verfasser zählen nicht; jede Änderung ergibt einen neuen Hash und setzt die Freigaben zurück.
 * - Eine **Lektion** gibt es nur ganz: Jede ihrer Aufgaben `koran_wort` braucht für die Wortform und alle Ablenker eine
 *   freigegebene Bedeutung (`koranWortSichtbar`, `lektionSichtbar`); sonst fällt die Lektion weg. Wurzel-Aufgaben erst mit der
 *   geprüften Wurzeltabelle (LM-31) – der Pfad enthält bis dahin keine.
 * - Die **Wortform** stammt aus den gepinnten Koran-Daten (Stelle → `quran_wort`); sie hat keine eigene Freigabe.
 * - **Kein Audio**: keine Sprachausgabe; nur Wortzeiten geprüfter Zeiten aktiver Rezitationen (`zeit`, KERN 4.0 §4).
 */

/** Inhalts-Hash einer Koran-Wortbedeutung für die Prüfungen (`lernapp_pruefung.inhaltTyp = 'koran_bedeutung'`). */
export function koranBedeutungHash(b: { formId: number; sprache: string; bedeutung: string }): string {
  return sha256Hex(kanonischGeprueft({ art: 'koran_bedeutung', formId: b.formId, sprache: b.sprache, bedeutung: b.bedeutung.normalize('NFC') }));
}

export type KoranBedeutungEingabe = { text: string; freigabe: FreigabeBaustein };

export type KoranWortEingabe = {
  /** Wortform aus `quran_wort` (null, wenn die Stelle fehlt) */
  text: string | null;
  vorkommen: number;
  /** Bedeutung in der Sprache des Pakets samt Prüfungen (null, wenn es noch keine gibt) */
  bedeutung: KoranBedeutungEingabe | null;
  zeit?: KoranWortZeit;
};

type PfadEinheit = KoranPfadDatei['einheiten'][number];
type PfadLektion = PfadEinheit['lektionen'][number];

export type KoranEinheitEingabe = {
  einheit: PfadEinheit;
  sprache: BedeutungsSprache;
  /** je Stelle (`Sure:Vers:Wort`) */
  woerter: ReadonlyMap<string, KoranWortEingabe>;
  quellen: readonly string[];
};

export type KoranBauErgebnis = { paket: KoranPaket; json: string; hash: string; bytes: number };

const sichtbar = (b: FreigabeBaustein) => wissenSichtbar(b.status, b.baustein, b.pruefungen);

/** Bedeutung nur mit zwei Freigaben zum aktuellen Stand, sonst null („Bedeutung folgt“). */
export function sichtbareBedeutung(w: KoranWortEingabe | undefined): string | null {
  return w?.bedeutung && sichtbar(w.bedeutung.freigabe) ? w.bedeutung.text : null;
}

/** Aufgabe `koran_wort` (Bedeutung wählen) samt Freigabelage; null, wenn eine Wortform oder Bedeutung fehlt. */
function koranAufgabe(
  a: PfadLektion['aufgaben'][number],
  woerter: ReadonlyMap<string, KoranWortEingabe>,
  sprache: BedeutungsSprache,
): { aufgabe: AufgabeVon<'koran_wort'>; freigabe: KoranWortFreigabe } | null {
  if (a.art !== 'bedeutung') return null;
  const stellen = [a.wortform, ...a.ablenker];
  const formen = stellen.map((s) => woerter.get(s));
  const wort = formen[0];
  if (!wort?.text || formen.some((f) => !f?.bedeutung)) return null;
  const bedeutungen = formen.map((f) => f!.bedeutung!);
  return {
    aufgabe: {
      schluessel: a.schluessel,
      typ: 'koran_wort',
      anweisung: 'waehleBedeutung',
      wort: { stelle: a.wortform, text: wort.text, sprache: 'ar' },
      // richtige Bedeutung zuerst; die Anzeige mischt (koranWortReihenfolge)
      optionen: bedeutungen.map((b, i) => ({ kennung: `koran:${stellen[i]}`, text: b.text, sprache })),
      richtig: 0,
    },
    freigabe: { anweisung: 'waehleBedeutung', bedeutungen: bedeutungen.map((b) => b.freigabe) },
  };
}

/** Lektion, wenn jede Aufgabe gebaut werden kann und jede gezeigte Bedeutung freigegeben ist; sonst null. */
export function sichtbareKoranLektion(
  l: PfadLektion,
  woerter: ReadonlyMap<string, KoranWortEingabe>,
  sprache: BedeutungsSprache,
): Lektion | null {
  if (!l.aufgaben.length) return null;
  const teile = l.aufgaben.map((a) => koranAufgabe(a, woerter, sprache));
  if (teile.some((t) => t === null)) return null;
  const fertig = teile as { aufgabe: AufgabeVon<'koran_wort'>; freigabe: KoranWortFreigabe }[];
  if (!lektionSichtbar(fertig.map((t) => koranWortSichtbar(t.freigabe)))) return null;
  const lektion: Lektion = {
    schluessel: l.schluessel,
    kurs: 'koran',
    art: 'lektion',
    zielsprache: 'ar',
    ausgangssprache: sprache,
    aufgaben: fertig.map((t) => t.aufgabe),
  };
  // gleiche Prüfung wie der Spieler (z. B. doppelte Bedeutungen in einer Aufgabe): ungültig → nicht ausliefern
  return LektionSchema.safeParse(lektion).success ? lektion : null;
}

/** Einheitenpaket einer Sprache (immer mit Wortliste; Lektionen nur vollständig freigegeben). */
export function baueKoranEinheit(e: KoranEinheitEingabe): KoranBauErgebnis {
  const woerter: KoranWort[] = e.einheit.lektionen
    .flatMap((l) => l.wortformen)
    .map((stelle) => {
      const w = e.woerter.get(stelle);
      const bedeutung = sichtbareBedeutung(w);
      return {
        stelle,
        ...(w?.text ? { text: w.text } : {}),
        vorkommen: w?.vorkommen ?? 0,
        ...(bedeutung ? { bedeutung } : {}),
        ...(w?.text && w.zeit ? { zeit: w.zeit } : {}),
      };
    });
  const lektionen = e.einheit.lektionen.flatMap((l) => {
    const x = sichtbareKoranLektion(l, e.woerter, e.sprache);
    return x ? [x] : [];
  });
  const paket: KoranPaket = {
    format: KORAN_PAKET_FORMAT,
    version: 1,
    kurs: 'koran',
    sprache: e.sprache,
    einheit: {
      schluessel: e.einheit.schluessel,
      stufe: e.einheit.stufe,
      reihenfolge: e.einheit.reihenfolge,
      thema: { ...(e.einheit.thema.de ? { de: e.einheit.thema.de } : {}), ...(e.einheit.thema.tr ? { tr: e.einheit.thema.tr } : {}) },
    },
    woerter,
    lektionen,
    quellen: [...e.quellen],
    lizenz: 'CC-BY-SA-4.0',
  };
  const json = kanonischGeprueft(paket);
  return { paket, json, hash: sha256Hex(json), bytes: new TextEncoder().encode(json).length };
}

/** Verzeichnis einer Sprache aus den gebauten Einheiten (Reihenfolge des Pfads). */
export function baueKoranVerzeichnis(sprache: BedeutungsSprache, einheiten: readonly KoranBauErgebnis[]): KoranVerzeichnis {
  return {
    format: KORAN_VERZEICHNIS_FORMAT,
    version: 1,
    kurs: 'koran',
    sprache,
    einheiten: einheiten.map(({ paket, hash, bytes }) => ({
      ...paket.einheit,
      hash,
      bytes,
      woerter: paket.woerter.length,
      bedeutungen: paket.woerter.filter((w) => w.bedeutung).length,
      lektionen: paket.lektionen.map((l) => l.schluessel),
    })),
  };
}
