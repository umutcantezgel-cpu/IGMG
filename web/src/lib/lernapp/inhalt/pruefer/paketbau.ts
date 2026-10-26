import { RICHTUNGEN, type RichtungId, zerlegeRichtung } from '../../kurse';
import {
  type BauAufgabe,
  type BauEingabe,
  type BauEintrag,
  type BauLektion,
  type BauUebersetzung,
  type Baustein,
  baueEinheit,
} from '../../paket/bauen';
import { type AufgabeVorlage, type SprachEinheitDatei, verweiseVon } from '../schema';
import type { Inhalte } from './dateien';
import { Befunde } from './typen';

/**
 * Prüfer „Paketbau-Probe“ (Stufe C, Z-L01/Z-L14 Nacharbeit 3): Jede Aufgabe einer Spracheinheit wird je Richtung so gebaut wie
 * im Paketbau (`baueEinheit` in `paket/bauen.ts`, darin `Werkbank.aufgabe`: Vorlage → Aufgabe des Spielers → Schema des
 * Spielers). Fällt eine Aufgabe dabei aus dem Paket, wird sie ein Befund – für freigegebene Einheiten blockierend, für
 * Entwürfe eine Warnung. Ohne diese Probe verwirft der Paketbau solche Aufgaben still.
 *
 * Die Probe sieht alle Bausteine als sichtbar an (kein Religionsbezug, keine Formel-Kandidaten, kein Status): Verborgene
 * Einträge sind gewollt und kein Inhaltsfehler. Ausgenommen sind Hör-Aufgaben, die ohne Clip nicht spielbar sind
 * (`schrift_tr`/`schrift_latein` nur mit `hoeren`, ohne `vorgabe`): Der Paketbau lässt sie weg, solange es kein Audio gibt.
 * Fehlt der Tipp einer Karte `grammatik_tipp` für eine Ausgangssprache, ist das eine Warnung (Abdeckung, wie im Testkurs ohne
 * arabische Tipps), keine kaputte Aufgabe. Richtungen ohne Übersetzungsdatei der Einheit (B2-Entwurf) prüft die Probe nicht.
 */

/** Baustein ohne Prüfungen, immer sichtbar (`veroeffentlicht`, ohne Religionsbezug). */
const SICHTBAR: Omit<Baustein, 'inhaltHash'> = { status: 'veroeffentlicht', religionsbezug: false, verfasstVon: null, pruefungen: [] };
const baustein = (schluessel: string): Baustein => ({ ...SICHTBAR, inhaltHash: `probe:${schluessel}` });

/** Hör-Aufgabe, die der Paketbau ohne Clip weglässt (`schrift_tr`/`schrift_latein` ohne Vorgabe). */
export const nurMitClip = (v: AufgabeVorlage): boolean =>
  (v.typ === 'schrift_tr' || v.typ === 'schrift_latein') && !v.vorgabe && Boolean(v.hoeren);

/** Gründe des Paketbaus (`warnungen` von `baueEinheit`, Form `<schlüssel>: <grund>`) je Aufgabe. */
function gruende(warnungen: readonly string[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const w of warnungen) {
    const i = w.indexOf(': ');
    if (i > 0) m.set(w.slice(0, i), w.slice(i + 2));
  }
  return m;
}

/** Zieltexte, Übersetzungen und Tipps der Probe (aus allen Inhaltsdateien). */
export type ProbeQuellen = {
  ziel: ReadonlyMap<string, BauEintrag>;
  uebersetzungen: ReadonlyMap<string, BauUebersetzung>;
  tipps: BauEingabe['tipps'];
};

/** Wortbank in die Ausgangssprache: Ihre Ablenker-Kacheln zieht der Paketbau aus allen Übersetzungen der Einheit. */
const wortbankAusgang = (a: AufgabeVorlage) => a.typ === 'wortbank' && a.nach === 'ausgang';

/**
 * Eingabe des Paketbaus für eine Einheit und Richtung aus den Inhaltsdateien – wie `ladeBauEingaben` (Abfrage in
 * `server/queries/lernapp/pakete.ts`): Zieltexte und Übersetzungen nur, soweit eine Aufgabe der Einheit auf sie verweist.
 * `auswahl` beschränkt die Aufgaben, `zusatz` nimmt weitere Verweise auf (Übersetzungen als Quelle der Wortbank-Ablenker).
 */
export function probeEingabe(
  d: SprachEinheitDatei,
  richtung: RichtungId,
  q: ProbeQuellen,
  auswahl: (a: AufgabeVorlage) => boolean = () => true,
  zusatz: readonly string[] = [],
): BauEingabe {
  const verweise = new Set<string>(zusatz);
  const lektionen: BauLektion[] = d.lektionen.map((l) => ({
    ...baustein(l.schluessel),
    schluessel: l.schluessel,
    art: l.art,
    ziel: l.ziel ?? {},
    aufgaben: l.aufgaben.filter(auswahl).map((a): BauAufgabe => {
      for (const v of verweiseVon(a)) verweise.add(v);
      const { schluessel, typ, ...daten } = a;
      return { ...baustein(schluessel), schluessel, typ, daten };
    }),
  }));
  const nur = <T>(m: ReadonlyMap<string, T>) => new Map([...verweise].flatMap((k) => (m.has(k) ? [[k, m.get(k)!] as const] : [])));
  return {
    richtung,
    einheit: {
      ...baustein(d.einheit.schluessel),
      schluessel: d.einheit.schluessel,
      stufe: d.stufe,
      reihenfolge: d.einheit.reihenfolge,
      thema: d.einheit.thema,
      symbol: d.einheit.symbol ?? null,
      nurFuerAusgang: null,
    },
    lektionen,
    eintraege: nur(q.ziel),
    uebersetzungen: nur(q.uebersetzungen),
    tipps: q.tipps,
    audio: new Map(),
  };
}

/**
 * Schlüssel der Aufgaben, die der Paketbau übernimmt, und seine Gründe für die übrigen. Zwei Läufe, damit die Probe schnell
 * bleibt: erst alle Aufgaben außer der Wortbank in die Ausgangssprache, dann diese mit den Übersetzungen ihrer Sätze und von
 * fünf weiteren Verweisen der Einheit als Ablenker-Quelle (der Paketbau sortiert alle Kandidaten der Einheit je Aufgabe
 * nach SHA-256; für die Gültigkeit genügt, dass es Kandidaten gibt).
 */
function baueProbe(d: SprachEinheitDatei, richtung: RichtungId, q: ProbeQuellen): { imPaket: Set<string>; grund: Map<string, string> } {
  const o = { ungeprueftZeigen: true, formellisteFrei: true, formeln: [] };
  const alle = d.lektionen.flatMap((l) => l.aufgaben);
  const weitere = [...new Set(alle.filter((a) => !wortbankAusgang(a)).flatMap(verweiseVon))].slice(0, 5);
  const laeufe = [
    baueEinheit(
      probeEingabe(d, richtung, q, (a) => !wortbankAusgang(a)),
      o,
    ),
    ...(alle.some(wortbankAusgang) ? [baueEinheit(probeEingabe(d, richtung, q, wortbankAusgang, weitere), o)] : []),
  ];
  return {
    imPaket: new Set(laeufe.flatMap((x) => x?.paket.lektionen.flatMap((l) => l.aufgaben.map((a) => a.schluessel)) ?? [])),
    grund: gruende(laeufe.flatMap((x) => x?.warnungen ?? [])),
  };
}

/** Grund, wenn der Paketbau keinen nennt: fehlender Zieltext bzw. fehlende Übersetzung eines Verweises, sonst nicht spielbar. */
function ursache(a: AufgabeVorlage, q: ProbeQuellen): string {
  const verweise = verweiseVon(a);
  const ohneZiel = verweise.filter((k) => !q.ziel.has(k));
  if (ohneZiel.length) return `Verweis ohne Zieltext (${ohneZiel.join(', ')})`;
  const ohneUebersetzung = verweise.filter((k) => !q.uebersetzungen.has(k));
  if (ohneUebersetzung.length) return `Verweis ohne Übersetzung (${ohneUebersetzung.join(', ')})`;
  return 'nicht spielbar (zu wenige verschiedene Optionen oder Paare)';
}

export function pruefePaketbau(inhalte: Inhalte): Befunde {
  const b = new Befunde('paketbau');
  // Zieltexte je Kurs (alle Einheiten: Aufgaben dürfen auf frühere Einheiten verweisen)
  const zielJe = new Map<string, Map<string, BauEintrag>>();
  for (const { daten: d } of inhalte.sprache) {
    const m = zielJe.get(d.kurs) ?? new Map<string, BauEintrag>();
    const herkunft = { quelle: 'probe', lizenz: 'CC-BY-SA-4.0', namensnennung: null };
    for (const l of d.lemmata)
      m.set(l.schluessel, {
        ...baustein(l.schluessel),
        ...herkunft,
        art: 'lemma',
        schluessel: l.schluessel,
        text: l.lemma,
        symbol: l.symbol ?? null,
      });
    for (const s of d.saetze)
      m.set(s.schluessel, { ...baustein(s.schluessel), ...herkunft, art: 'satz', schluessel: s.schluessel, text: s.text });
    zielJe.set(d.kurs, m);
  }
  // Übersetzungen und Tipps je Richtung
  const uebersetzungJe = new Map<RichtungId, Map<string, BauUebersetzung>>();
  const tippsJe = new Map<string, BauEingabe['tipps']>();
  for (const { daten: u } of inhalte.uebersetzung) {
    const m = uebersetzungJe.get(u.richtung) ?? new Map<string, BauUebersetzung>();
    for (const e of u.eintraege)
      m.set(e.bezug, {
        ...baustein(`${u.richtung}:${e.bezug}`),
        bezug: e.bezug,
        text: e.text,
        alternativen: e.alternativen ?? [],
        quelle: 'probe',
        lizenz: 'CC-BY-SA-4.0',
        namensnennung: null,
      });
    uebersetzungJe.set(u.richtung, m);
    tippsJe.set(
      `${u.richtung}|${u.einheit}`,
      u.tipps.map((t) => ({ ...baustein(t.schluessel), schluessel: t.schluessel, titel: t.titel ?? null, inhalt: t.inhalt })),
    );
  }

  for (const { pfad, daten: d } of inhalte.sprache) {
    const vorlagen = d.lektionen.flatMap((l) => l.aufgaben);
    // freigegeben (Status der Datei nicht `entwurf`): Befunde blockieren
    const schwere = d.status === 'entwurf' ? 'warnung' : 'blockierend';
    for (const richtung of RICHTUNGEN) {
      const { ziel, ausgang } = zerlegeRichtung(richtung);
      if (ziel !== d.kurs || (d.einheit.nurFuerAusgang && d.einheit.nurFuerAusgang !== ausgang)) continue;
      // Richtung ohne Übersetzungsdatei der Einheit (z. B. B2-Entwurf): fehlende Übersetzungen sind kein Befund der Probe
      if (!tippsJe.has(`${richtung}|${d.einheit.schluessel}`)) continue;
      const q: ProbeQuellen = {
        ziel: zielJe.get(d.kurs) ?? new Map(),
        uebersetzungen: uebersetzungJe.get(richtung) ?? new Map(),
        tipps: tippsJe.get(`${richtung}|${d.einheit.schluessel}`) ?? [],
      };
      const { imPaket, grund } = baueProbe(d, richtung, q);
      for (const a of vorlagen) {
        if (imPaket.has(a.schluessel) || nurMitClip(a)) continue;
        // Tipp fehlt in dieser Ausgangssprache: Lücke der Abdeckung (Tipps je Ausgang können nachkommen), keine kaputte Aufgabe
        if (a.typ === 'grammatik_tipp' && !q.tipps.some((t) => t.schluessel === `${d.einheit.schluessel}.${ausgang}.${a.tipp}`)) {
          b.warnung(
            pfad,
            `Paketbau lässt die Aufgabe weg (${richtung}): Tipp ${a.tipp} fehlt für die Ausgangssprache ${ausgang}`,
            a.schluessel,
          );
          continue;
        }
        b.add(schwere, pfad, `Paketbau verwirft die Aufgabe (${richtung}): ${grund.get(a.schluessel) ?? ursache(a, q)}`, a.schluessel);
      }
    }
  }
  return b;
}
