import { zerlege } from '../abgleich/tokens';
import { AufgabeSchema, type Aufgabe, type Inhalt, type Lektion } from '../aufgaben/schema';
import { formelTreffer, type LateinFormel, texteIn } from '../formelkandidat';
import { LATEIN_FORMELN } from '../formelliste';
import { sprachSichtbarkeit, type Pruefung, type Sichtbarkeit, type Status } from '../freigabe';
import { AufgabeVorlageSchema, type AufgabeVorlage } from '../inhalt/schema';
import { type KursId, type KursSlug, type RichtungId, type Sprache, type Stufe, zerlegeRichtung } from '../kurse';
import { SYMBOLE, type SymbolEintrag, symbolBild } from '../symbole';
import { kanonisch, sha256Hex, textHash } from './hash';
import {
  type BuendelVerweis,
  type EintragHerkunft,
  INHALT_LIZENZ,
  PAKET_FORMAT,
  type Paket,
  VERZEICHNIS_FORMAT,
  type Verzeichnis,
  type VerzeichnisEinheit,
} from './typen';

/**
 * Paketbau (ADR 0039 Nr. 1, PLAN §3.10): aus den Bausteinen der Datenbank das kanonische JSON je Richtung und Einheit.
 * Rein bis auf den Hash; die Abfrage liegt in `web/src/server/queries/lernapp/pakete.ts`.
 *
 * **Nur Ausgeliefertes** (ADR 0041 Nr. 2, ADR 0040 Nr. 5): Jeder Baustein – Einheit, Lektion, Aufgabe, Zieltext,
 * Übersetzung, Tipp – geht durch `sprachSichtbarkeit` aus `freigabe.ts` (Status, Sprachprüfungen zum aktuellen Hash,
 * zwei religiöse Freigaben und freigegebene Formelliste bei `religionsbezug` bzw. Formel-Kandidat, Schalter
 * `lernapp_ungeprueft`). Eine Aufgabe, deren Ziel oder Übersetzung
 * verborgen ist, fällt aus dem Paket; verborgene Ablenker und Paare fallen einzeln weg, solange die Aufgabe spielbar bleibt.
 * Eine Lektion ohne Aufgabe und eine Einheit ohne Lektion gibt es nicht im Paket.
 *
 * **Formel-Kandidaten** (Stufe C N2, Gegenprüfung Z-L10): Enthält ein Text eine lateinische Formel der Formelliste (F-de,
 * F-tr; `formelkandidat.ts`), gilt sein Baustein als Eintrag mit Religionsbezug, auch ohne Kennzeichen – also verborgen,
 * solange die Liste nicht freigegeben ist, danach nur mit zwei eigenen religiösen Freigaben und nie mit Stimme. Das deckt
 * Wege ohne den blockierenden Inhaltsprüfer ab (Import im Vercel-Bau, „Alternative ergänzen“) und gilt unabhängig vom
 * Schalter `lernapp_ungeprueft`. Arabische Formeln erkennt der Paketbau nicht (nur das Formel-Lexikon des Wächters beim Import).
 *
 * **Aufgaben** entstehen aus den Vorlagen des Inhalts (inhalt/schema.ts) und werden gegen das Schema des Spielers geprüft.
 * Karten heißen `<richtung>:<schlüssel>` (je Richtung eigene Wiederholung). Lektionen heißen `<richtung>.<stufe>.eNN.lNN`.
 *
 * **Audio** nur für Zieltexte ohne Religionsbezug (ADR 0039 Nr. 7) aus den Clips der Zielsprache (`lernapp_audio`).
 * Hörübungen ohne Clip bleiben im Paket; der Spieler zeigt „Audio folgt“ und überspringt sie (KERN 4.0 §4).
 *
 * **Bildkarten** (`bild_wort`): Die Geometrie des Motivs (`symbol` des Lemmas, Register `symbole.ts`) steht in der Aufgabe.
 */

export type Baustein = {
  status: Status;
  inhaltHash: string;
  religionsbezug: boolean;
  verfasstVon: string | null;
  /** Prüfungen zu diesem Baustein (alle Hashes; gezählt wird nur der aktuelle) */
  pruefungen: readonly Pruefung[];
};

export type BauEintrag = Baustein & {
  art: 'lemma' | 'satz';
  schluessel: string;
  text: string;
  /** Motiv der Bildkarte (nur Lemmata) */
  symbol?: string | null;
  quelle: string;
  lizenz: string;
  namensnennung: string | null;
};

export type BauUebersetzung = Baustein & {
  bezug: string;
  text: string;
  alternativen: readonly string[];
  quelle: string;
  lizenz: string;
  namensnennung: string | null;
};

export type BauAufgabe = Baustein & { schluessel: string; typ: string; daten: unknown };
export type BauLektion = Baustein & {
  schluessel: string;
  art: Lektion['art'];
  ziel: Partial<Record<Sprache, string>>;
  aufgaben: readonly BauAufgabe[];
};
export type BauTipp = Baustein & { schluessel: string; titel: string | null; inhalt: { type: 'doc' } & Record<string, unknown> };
export type BauAudio = { adresse: string; buendelBytes: number; versatz: number; laenge: number; dauerMs: number; stimme: string };

export type BauEinheit = Baustein & {
  schluessel: string;
  stufe: Stufe;
  reihenfolge: number;
  thema: Partial<Record<Sprache, string>>;
  symbol: string | null;
  nurFuerAusgang: Sprache | null;
};

export type BauEingabe = {
  richtung: RichtungId;
  einheit: BauEinheit;
  /** nach Reihenfolge sortiert, Aufgaben ebenso */
  lektionen: readonly BauLektion[];
  /** Zieltexte (Lemmata und Sätze) nach Schlüssel, auch aus früheren Einheiten, soweit verwiesen */
  eintraege: ReadonlyMap<string, BauEintrag>;
  /** Übersetzungen in die Ausgangssprache nach Bezug */
  uebersetzungen: ReadonlyMap<string, BauUebersetzung>;
  tipps: readonly BauTipp[];
  /** Clips der Zielsprache nach Text-Hash (bevorzugte Stimme bereits gewählt) */
  audio: ReadonlyMap<string, BauAudio>;
  /** Register der Bildkarten (Standard: `symbole.json`) */
  symbole?: ReadonlyMap<string, SymbolEintrag>;
};

export type BauOptionen = {
  ungeprueftZeigen: boolean;
  /** Formelliste freigegeben (`formelliste.ts`); ohne Angabe gesperrt – dann bleibt jeder Eintrag mit Religionsbezug verborgen. */
  formellisteFrei?: boolean;
  /** Lateinische Formeln der Liste (Standard: Leitfaden, `formelliste.ts` `LATEIN_FORMELN`); nur Tests geben eigene an. */
  formeln?: readonly LateinFormel[];
};

export type BauErgebnis = { paket: Paket; json: string; hash: string; bytes: number; warnungen: string[] };

const verfasserVon = (b: Baustein) => [b.verfasstVon];

function sicht(b: Baustein, o: BauOptionen): Sichtbarkeit {
  return sprachSichtbarkeit(
    { status: b.status, inhaltHash: b.inhaltHash, religionsbezug: b.religionsbezug, verfasser: verfasserVon(b) },
    b.pruefungen,
    o,
  );
}

/** Kartenschlüssel je Richtung (FSRS, ADR 0038 Nr. 3). */
export const kartenSchluessel = (richtung: RichtungId, schluessel: string): string => `${richtung}:${schluessel}`;

/** Lektionsschlüssel im Paket: Kursteil durch die Richtung ersetzt (`tr.a1.e01.l01` → `tr-aus-de.a1.e01.l01`). */
export function lektionImPaket(richtung: RichtungId, kurs: KursId, schluessel: string): string {
  return `${richtung}${schluessel.slice(kurs.length)}`;
}

/** Lektionsschlüssel der Datenbank zum Schlüssel im Paket (für Zuweisungen, `aufgabe.bezug.lektion`). */
export function lektionAusPaket(schluesselImPaket: string): { richtung: string; schluessel: string } | null {
  const m = /^((de|tr|ar)-aus-(de|tr|ar))(\..+)$/.exec(schluesselImPaket);
  if (!m) return null;
  return { richtung: m[1] ?? '', schluessel: `${m[2]}${m[4]}` };
}

/** Deterministische Auswahl ohne Zufall: nach SHA-256 aus Saat und Wert sortiert. */
function stabilSortiert(werte: readonly string[], saat: string): string[] {
  return [...werte].sort((a, b) => {
    const ha = sha256Hex(`${saat}|${a}`);
    const hb = sha256Hex(`${saat}|${b}`);
    return ha < hb ? -1 : ha > hb ? 1 : 0;
  });
}

const vergleichsform = (s: string) => s.normalize('NFC').toLocaleLowerCase();

/** Satzzeichen am Rand eines Worts (bleiben beim Lückentext im Satz stehen). */
const RAND =
  /^([.,;:!?¿¡"„“”‚‘’'«»‹›()[\]{}…\u060C\u061B\u061F\u06D4\u2010-\u2015-]*)(.*?)([.,;:!?¿¡"„“”‚‘’'«»‹›()[\]{}…\u060C\u061B\u061F\u06D4\u2010-\u2015-]*)$/u;

/**
 * Lücke an Wort `nr` (Wörter durch Leerraum getrennt): Text davor, das Wort ohne Satzzeichen am Rand, Text danach.
 * `null`, wenn es das Wort nicht gibt oder es nur aus Satzzeichen besteht.
 */
export function lueckeIn(satz: string, nr: number): { vor: string; wort: string; nach: string } | null {
  const teile = satz.split(/(\s+)/);
  let zaehler = -1;
  for (let i = 0; i < teile.length; i++) {
    const t = teile[i] ?? '';
    if (!t || /^\s+$/.test(t)) continue;
    zaehler++;
    if (zaehler !== nr) continue;
    const m = RAND.exec(t);
    const wort = m?.[2] ?? '';
    if (!wort) return null;
    return { vor: teile.slice(0, i).join('') + (m?.[1] ?? ''), wort, nach: (m?.[3] ?? '') + teile.slice(i + 1).join('') };
  }
  return null;
}

/** Vorlagen der Typen aus L2-01 (Paketbau in `ausL2Vorlage`). */
const L2_01_VORLAGEN = [
  'bild_wort',
  'frei',
  'hoeren_waehlen',
  'hoeren_schreiben',
  'minimalpaare',
  'luecke',
  'satzbau',
  'formen',
  'harakat',
] as const;
type L201Vorlage = Extract<AufgabeVorlage, { typ: (typeof L2_01_VORLAGEN)[number] }>;
const istL201Vorlage = (v: AufgabeVorlage): v is L201Vorlage => (L2_01_VORLAGEN as readonly string[]).includes(v.typ);

class Werkbank {
  readonly ziel: Sprache;
  readonly ausgang: Sprache;
  readonly hinweise = new Set<string>();
  readonly herkunft = new Map<string, EintragHerkunft>();
  readonly buendel = new Map<string, number>();
  readonly lexikon = new Set<string>();
  readonly warnungen: string[] = [];

  constructor(
    readonly e: BauEingabe,
    readonly o: BauOptionen,
  ) {
    const r = zerlegeRichtung(e.richtung);
    this.ziel = r.ziel;
    this.ausgang = r.ausgang;
  }

  /** Sichtbarkeit merken (Hinweis „noch nicht von Muttersprachlern geprüft“). */
  sichtbar(b: Baustein, name: string): boolean {
    const s = sicht(b, this.o);
    if (s === 'mit_hinweis') this.hinweise.add(name);
    return s !== 'verborgen';
  }

  /** Zieltext mit Audio und Herkunft, oder null, wenn verborgen. */
  zielInhalt(schluessel: string): Inhalt | null {
    const e = this.e.eintraege.get(schluessel);
    if (!e) return null;
    const s = sicht(e, this.o);
    if (s === 'verborgen') return null;
    // Audio nie für Religionsbezug (ADR 0039 Nr. 7)
    const clip = e.religionsbezug ? undefined : this.e.audio.get(textHash(e.text));
    if (!this.herkunft.has(schluessel)) {
      this.herkunft.set(schluessel, {
        text: e.text,
        sprache: this.ziel,
        quelle: e.quelle,
        lizenz: e.lizenz,
        ...(e.namensnennung ? { namensnennung: e.namensnennung } : {}),
        ...(clip ? { stimme: clip.stimme } : {}),
        ...(s === 'mit_hinweis' ? { hinweis: true as const } : {}),
      });
      if (s === 'mit_hinweis') this.hinweise.add(schluessel);
      for (const w of zerlege(e.text)) this.lexikon.add(w);
    }
    if (clip) this.buendel.set(clip.adresse, clip.buendelBytes);
    return {
      text: e.text,
      sprache: this.ziel,
      ...(clip ? { audio: { buendel: clip.adresse, versatz: clip.versatz, laenge: clip.laenge, dauerMs: clip.dauerMs } } : {}),
    };
  }

  /** Übersetzung in die Ausgangssprache, oder null, wenn sie fehlt oder verborgen ist. */
  uebersetzung(schluessel: string): BauUebersetzung | null {
    const u = this.e.uebersetzungen.get(schluessel);
    if (!u) return null;
    const s = sicht(u, this.o);
    if (s === 'verborgen') return null;
    const k = `${schluessel}@${this.ausgang}`;
    if (!this.herkunft.has(k)) {
      this.herkunft.set(k, {
        text: u.text,
        sprache: this.ausgang,
        quelle: u.quelle,
        lizenz: u.lizenz,
        ...(u.namensnennung ? { namensnennung: u.namensnennung } : {}),
        ...(s === 'mit_hinweis' ? { hinweis: true as const } : {}),
      });
      if (s === 'mit_hinweis') this.hinweise.add(k);
    }
    return u;
  }

  ausgangInhalt(schluessel: string): Inhalt | null {
    const u = this.uebersetzung(schluessel);
    return u ? { text: u.text, sprache: this.ausgang } : null;
  }

  /** Ziel und Übersetzung zugleich sichtbar (Bedingung für jeden Verweis). */
  beide(schluessel: string): { ziel: Inhalt; ausgang: Inhalt; u: BauUebersetzung } | null {
    const e = this.e.eintraege.get(schluessel);
    const u = this.e.uebersetzungen.get(schluessel);
    if (!e || !u || sicht(e, this.o) === 'verborgen' || sicht(u, this.o) === 'verborgen') return null;
    const ziel = this.zielInhalt(schluessel);
    const ausgang = this.ausgangInhalt(schluessel);
    return ziel && ausgang ? { ziel, ausgang, u } : null;
  }

  /** Zieltext ohne Audio (Optionen, Varianten). */
  zielText(schluessel: string): Inhalt | null {
    const z = this.zielInhalt(schluessel);
    return z ? { text: z.text, sprache: z.sprache } : null;
  }

  /** Inhalte zu Ziel und Ablenkern; Doppelte (gleicher Text) und verborgene fallen weg, das Ziel steht vorn. */
  optionen(ziel: Inhalt, ablenker: readonly string[], seite: (k: string) => Inhalt | null): Inhalt[] {
    const gesehen = new Set([vergleichsform(ziel.text)]);
    const liste = [ziel];
    for (const a of ablenker) {
      const o = seite(a);
      if (!o || gesehen.has(vergleichsform(o.text))) continue;
      gesehen.add(vergleichsform(o.text));
      liste.push(o);
    }
    return liste;
  }

  /** Aufgabe des Spielers aus einer Vorlage (oder null). */
  aufgabe(a: BauAufgabe): Aufgabe | null {
    const v = AufgabeVorlageSchema.safeParse({ ...(a.daten as object), schluessel: a.schluessel, typ: a.typ });
    if (!v.success) {
      this.warnungen.push(`${a.schluessel}: Vorlage ungültig`);
      return null;
    }
    const roh = this.ausVorlage(v.data);
    if (!roh) return null;
    const p = AufgabeSchema.safeParse(roh);
    if (!p.success) {
      this.warnungen.push(`${a.schluessel}: ${p.error.issues.map((i) => i.message).join('; ')}`);
      return null;
    }
    return p.data;
  }

  /** Optionen in der Zielsprache aus Antwort und Ablenkern (ohne doppelte Texte; Antwort zuerst), oder null. */
  private zielOptionen(antwort: string, ablenker: readonly string[]): Inhalt[] | null {
    const a = this.zielInhalt(antwort);
    if (!a) return null;
    const texte = new Set([vergleichsform(a.text)]);
    const optionen = [a];
    for (const s of ablenker) {
      const b = this.zielInhalt(s);
      if (b && !texte.has(vergleichsform(b.text))) {
        texte.add(vergleichsform(b.text));
        optionen.push(b);
      }
    }
    return optionen.length >= 2 ? optionen : null;
  }

  /** Zieltext mit optionaler Übersetzung (aufklappbar). */
  private zeile(schluessel: string): { zeile: Inhalt; uebersetzung?: Inhalt } | null {
    const zeile = this.zielInhalt(schluessel);
    if (!zeile) return null;
    const u = this.ausgangInhalt(schluessel);
    return { zeile, ...(u ? { uebersetzung: u } : {}) };
  }

  /** Aufgaben der Typen aus L2-02 (PLAN §4, §4.2–§4.4); `undefined` für andere Typen. */
  private ausVorlageL2(v: AufgabeVorlage): unknown {
    const r = this.e.richtung;
    const k = (s: string) => kartenSchluessel(r, s);
    switch (v.typ) {
      case 'dialog': {
        const verlauf = v.zeilen.map((z) => {
          const x = this.zeile(z.satz);
          return x ? { sprecher: z.sprecher, ...x } : null;
        });
        const optionen = this.zielOptionen(v.antwort, v.ablenker);
        if (verlauf.some((x) => !x) || !optionen) return null;
        return { typ: 'dialog', schluessel: v.schluessel, karten: [k(v.antwort)], verlauf, optionen, richtig: 0 };
      }
      case 'geschichte': {
        const zeilen = v.zeilen.map((z) => {
          const x = this.zeile(z.satz);
          return x ? { ...(z.sprecher ? { sprecher: z.sprecher } : {}), ...x } : null;
        });
        if (zeilen.some((x) => !x)) return null;
        const fragen = [];
        for (const f of v.fragen) {
          const frage = this.zielInhalt(f.frage);
          const optionen = this.zielOptionen(f.antwort, f.ablenker);
          if (!frage || !optionen) return null;
          fragen.push({ nach: f.nach, frage, optionen, richtig: 0, karte: k(f.antwort) });
        }
        const titel = v.titel ? this.zielInhalt(v.titel) : null;
        return { typ: 'geschichte', schluessel: v.schluessel, ...(titel ? { titel } : {}), zeilen, fragen };
      }
      case 'lesen_fragen': {
        const text = v.absaetze.map((a) => this.zielInhalt(a));
        if (text.some((x) => !x)) return null;
        const glossen = v.glossen.flatMap((g) => {
          const b = this.beide(g);
          return b ? [{ wort: b.ziel.text, glosse: b.ausgang }] : [];
        });
        const fragen = [];
        for (const f of v.fragen) {
          if (f.art === 'rfn') {
            const aussage = this.zielInhalt(f.aussage);
            if (!aussage) return null;
            fragen.push({ art: 'rfn', aussage, richtig: f.richtig });
          } else {
            const frage = this.zielInhalt(f.frage);
            const optionen = this.zielOptionen(f.antwort, f.ablenker);
            if (!frage || !optionen) return null;
            fragen.push({ art: 'auswahl', frage, optionen, richtig: 0 });
          }
        }
        const titel = v.titel ? this.zielInhalt(v.titel) : null;
        return {
          typ: 'lesen_fragen',
          schluessel: v.schluessel,
          ...(titel ? { titel } : {}),
          text,
          ...(glossen.length ? { glossen } : {}),
          fragen,
        };
      }
      case 'grammatik_tipp': {
        const t = this.e.tipps.find((x) => x.schluessel === `${this.e.einheit.schluessel}.${this.ausgang}.${v.tipp}`);
        if (!t || !this.sichtbar(t, t.schluessel)) return null;
        const abschnitte = tippAbschnitte(t.inhalt, this.ziel);
        const titel = t.titel ?? abschnitte[0]?.ueberschrift;
        if (!titel || !abschnitte.length) return null;
        return { typ: 'grammatik_tipp', schluessel: v.schluessel, sprache: this.ausgang, titel, abschnitte };
      }
      case 'schrift_ar':
        return { ...v };
      case 'schrift_tr':
      case 'schrift_latein': {
        const inhalt = (text: string) => ({ text, sprache: this.ziel });
        const hoeren = v.hoeren ? this.zielInhalt(v.hoeren) : null;
        if (!v.vorgabe && !hoeren?.audio) return null;
        return {
          typ: v.typ,
          schluessel: v.schluessel,
          anweisung: v.anweisung,
          ...(v.vorgabe ? { vorgabe: inhalt(v.vorgabe) } : {}),
          ...(hoeren?.audio ? { hoeren } : {}),
          optionen: v.optionen.map(inhalt),
          richtig: v.richtig,
        };
      }
      case 'sprechen': {
        const x = this.zeile(v.satz);
        if (!x) return null;
        return {
          typ: 'sprechen',
          schluessel: v.schluessel,
          karten: [k(v.satz)],
          vorgabe: x.zeile,
          ...(x.uebersetzung ? { uebersetzung: x.uebersetzung } : {}),
        };
      }
      case 'schreiben': {
        const x = this.zeile(v.aufgabe);
        const muster = v.muster.map((m) => this.zielInhalt(m));
        if (!x || muster.some((m) => !m)) return null;
        return {
          typ: 'schreiben',
          schluessel: v.schluessel,
          karten: [k(v.aufgabe)],
          aufgabe: x.zeile,
          ...(x.uebersetzung ? { uebersetzung: x.uebersetzung } : {}),
          woerter: v.woerter,
          ...(v.pflichtwoerter ? { pflichtwoerter: v.pflichtwoerter } : {}),
          muster,
        };
      }
      default:
        return undefined;
    }
  }

  private ausVorlage(v: AufgabeVorlage): unknown {
    const r = this.e.richtung;
    if (istL201Vorlage(v)) return this.ausL2Vorlage(v);
    const l2 = this.ausVorlageL2(v);
    if (l2 !== undefined) return l2;
    if (v.typ === 'auswahl') {
      const z = this.beide(v.ziel);
      if (!z) return null;
      const texte = new Set<string>();
      const opt = (i: Inhalt) => {
        const k = vergleichsform(i.text);
        if (texte.has(k)) return false;
        texte.add(k);
        return true;
      };
      const vorgabe = v.anweisung === 'waehleUebersetzung' ? z.ziel : z.ausgang;
      const seite = (b: NonNullable<ReturnType<Werkbank['beide']>>) => (v.anweisung === 'waehleUebersetzung' ? b.ausgang : b.ziel);
      const optionen = [seite(z)].filter(opt);
      for (const a of v.ablenker) {
        const b = this.beide(a);
        if (b && opt(seite(b))) optionen.push(seite(b));
      }
      if (optionen.length < 2) return null;
      return {
        typ: 'auswahl',
        schluessel: v.schluessel,
        karten: [kartenSchluessel(r, v.ziel)],
        anweisung: v.anweisung,
        vorgabe,
        optionen,
        richtig: 0,
      };
    }
    if (v.typ === 'wortbank') {
      const z = this.beide(v.satz);
      if (!z) return null;
      if (v.nach === 'ziel') {
        const loesungen = [z.ziel.text, ...(v.alternativen ?? [])];
        const kacheln = [...zerlege(z.ziel.text)];
        for (const w of v.ablenker ?? []) if (!kacheln.some((k) => vergleichsform(k) === vergleichsform(w))) kacheln.push(w);
        return {
          typ: 'wortbank',
          schluessel: v.schluessel,
          karten: [kartenSchluessel(r, v.satz)],
          anweisung: 'uebersetze',
          vorgabe: z.ausgang,
          sprache: this.ziel,
          loesungen,
          kacheln: kacheln.slice(0, 24),
        };
      }
      const loesungen = [z.u.text, ...z.u.alternativen];
      const kacheln = [...zerlege(z.u.text)];
      const vorhanden = new Set(kacheln.map(vergleichsform));
      // Ablenker aus anderen sichtbaren Übersetzungen der Einheit, deterministisch je Aufgabe – nur, wenn auch ihr Zieleintrag
      // sichtbar ist (sonst kämen Wörter eines verborgenen Eintrags, z. B. mit Religionsbezug ohne Freigaben, ins Paket)
      const kandidaten = new Set<string>();
      for (const [bezug, u] of this.e.uebersetzungen) {
        const ziel = this.e.eintraege.get(bezug);
        if (bezug === v.satz || !ziel || sicht(ziel, this.o) === 'verborgen' || sicht(u, this.o) === 'verborgen') continue;
        for (const w of zerlege(u.text)) if (!vorhanden.has(vergleichsform(w))) kandidaten.add(w);
      }
      kacheln.push(...stabilSortiert([...kandidaten], v.schluessel).slice(0, 3));
      return {
        typ: 'wortbank',
        schluessel: v.schluessel,
        karten: [kartenSchluessel(r, v.satz)],
        anweisung: 'uebersetze',
        vorgabe: z.ziel,
        sprache: this.ausgang,
        loesungen,
        kacheln: kacheln.slice(0, 24),
      };
    }
    if (v.typ !== 'paare') return null;
    const links = new Set<string>();
    const rechts = new Set<string>();
    const paare = [];
    for (const l of v.lemmata) {
      const b = this.beide(l);
      if (!b) continue;
      const kl = vergleichsform(b.ziel.text);
      const kr = vergleichsform(b.ausgang.text);
      if (links.has(kl) || rechts.has(kr)) continue;
      links.add(kl);
      rechts.add(kr);
      paare.push({ links: b.ziel, rechts: b.ausgang, karte: kartenSchluessel(r, l) });
    }
    if (paare.length < 2) return null;
    return { typ: 'paare', schluessel: v.schluessel, anweisung: 'findePaare', paare };
  }

  /** Aufgaben der Typen aus L2-01 (Nutzlast nach `aufgaben/<typ>.ts`). */
  private ausL2Vorlage(v: L201Vorlage): unknown {
    const r = this.e.richtung;
    const basis = { schluessel: v.schluessel, ...(v.typ !== 'formen' ? { karten: [kartenSchluessel(r, v.ziel)] } : {}) };
    switch (v.typ) {
      case 'bild_wort': {
        const z = this.beide(v.ziel);
        const symbol = this.e.eintraege.get(v.ziel)?.symbol;
        const bild = symbol ? symbolBild(symbol, this.e.symbole ?? SYMBOLE) : null;
        if (!z || !bild) {
          if (z && !bild) this.warnungen.push(`${v.schluessel}: Lemma ohne Motiv`);
          return null;
        }
        const optionen = this.optionen({ text: z.ziel.text, sprache: z.ziel.sprache }, v.ablenker, (k) => this.zielText(k));
        if (optionen.length < 2) return null;
        return { typ: 'bild_wort', ...basis, anweisung: 'waehleWort', bild, optionen, richtig: 0, beschreibung: z.ausgang };
      }
      case 'frei': {
        const z = this.beide(v.ziel);
        if (!z) return null;
        return v.nach === 'ziel'
          ? {
              typ: 'frei',
              ...basis,
              anweisung: 'uebersetze',
              vorgabe: z.ausgang,
              sprache: this.ziel,
              loesungen: [z.ziel.text, ...(v.alternativen ?? [])],
            }
          : {
              typ: 'frei',
              ...basis,
              anweisung: 'uebersetze',
              vorgabe: z.ziel,
              sprache: this.ausgang,
              loesungen: [z.u.text, ...z.u.alternativen],
            };
      }
      case 'hoeren_waehlen': {
        const z = this.beide(v.ziel);
        if (!z) return null;
        const optionen =
          v.anweisung === 'waehleGehoertes'
            ? this.optionen({ text: z.ziel.text, sprache: z.ziel.sprache }, v.ablenker, (k) => this.zielText(k))
            : this.optionen(z.ausgang, v.ablenker, (k) => this.beide(k)?.ausgang ?? null);
        if (optionen.length < 2) return null;
        return { typ: 'hoeren_waehlen', ...basis, anweisung: v.anweisung, hoeren: z.ziel, optionen, richtig: 0 };
      }
      case 'hoeren_schreiben': {
        const hoeren = this.zielInhalt(v.ziel);
        if (!hoeren) return null;
        return { typ: 'hoeren_schreiben', ...basis, hoeren, sprache: this.ziel, loesungen: [hoeren.text, ...(v.alternativen ?? [])] };
      }
      case 'minimalpaare': {
        const hoeren = this.zielInhalt(v.ziel);
        if (!hoeren) return null;
        const optionen = this.optionen({ text: hoeren.text, sprache: hoeren.sprache }, v.ablenker, (k) => this.zielText(k));
        if (optionen.length < 2) return null;
        return { typ: 'minimalpaare', ...basis, hoeren, optionen: optionen.slice(0, 4), richtig: 0 };
      }
      case 'luecke': {
        const z = this.zielInhalt(v.ziel);
        const teile = z ? lueckeIn(z.text, v.wort) : null;
        if (!z || !teile) {
          if (z) this.warnungen.push(`${v.schluessel}: Wort ${v.wort} fehlt im Satz`);
          return null;
        }
        const hilfe = this.ausgangInhalt(v.ziel);
        return {
          typ: 'luecke',
          ...basis,
          vor: teile.vor,
          nach: teile.nach,
          sprache: this.ziel,
          ...(v.ablenker ? { optionen: [teile.wort, ...v.ablenker] } : {}),
          loesungen: [teile.wort, ...(v.alternativen ?? [])],
          ...(hilfe ? { hilfe } : {}),
        };
      }
      case 'satzbau': {
        const z = this.zielInhalt(v.ziel);
        if (!z) return null;
        const vorgabe = this.ausgangInhalt(v.ziel);
        return {
          typ: 'satzbau',
          ...basis,
          ...(vorgabe ? { vorgabe } : {}),
          sprache: this.ziel,
          kacheln: zerlege(z.text).slice(0, 24),
          loesungen: [z.text, ...(v.alternativen ?? [])],
        };
      }
      case 'formen': {
        const titel = v.lemma ? this.zielText(v.lemma) : null;
        if (v.lemma && !titel) return null;
        return {
          typ: 'formen',
          schluessel: v.schluessel,
          ...(v.lemma ? { karten: [kartenSchluessel(r, v.lemma)] } : {}),
          sprache: this.ziel,
          ...(titel ? { titel } : {}),
          zeilen: v.zeilen,
          spalten: v.spalten,
          zellen: v.zellen,
        };
      }
      case 'harakat': {
        if (this.ziel !== 'ar') return null;
        const z = this.zielText(v.ziel);
        if (!z) return null;
        const vorgabe = this.ausgangInhalt(v.ziel);
        const optionen = this.optionen(
          z,
          v.varianten.map((_, i) => String(i)),
          (i) => ({ text: v.varianten[Number(i)] ?? '', sprache: 'ar' }),
        );
        return { typ: 'harakat', ...basis, anweisung: 'waehleVokalisierung', ...(vorgabe ? { vorgabe } : {}), optionen, richtig: 0 };
      }
    }
  }
}

type TiptapKnoten = { type?: string; text?: string; attrs?: { level?: number }; content?: TiptapKnoten[] };
type Abschnitt = { ueberschrift?: string; absaetze: string[]; beispiele?: { ziel: Inhalt }[] };

/** Text eines Tiptap-Knotens (Zeilenumbrüche als Leerzeichen). */
function tiptapText(k: TiptapKnoten): string {
  if (k.type === 'text') return k.text ?? '';
  if (k.type === 'hardBreak') return ' ';
  return (k.content ?? []).map(tiptapText).join('').replace(/\s+/g, ' ').trim();
}

/**
 * Tipp (Tiptap, ADR 0006) als Karte des Übungstyps `grammatik_tipp`: Überschriften beginnen Abschnitte, Absätze und
 * Listenpunkte werden Text, Zitatblöcke Beispiele in der Zielsprache.
 */
export function tippAbschnitte(doc: { type: 'doc' } & Record<string, unknown>, ziel: Sprache): Abschnitt[] {
  const abschnitte: Abschnitt[] = [];
  const aktuell = (): Abschnitt => {
    if (!abschnitte.length) abschnitte.push({ absaetze: [] });
    return abschnitte[abschnitte.length - 1]!;
  };
  for (const k of ((doc as TiptapKnoten).content ?? []) as TiptapKnoten[]) {
    if (k.type === 'heading') {
      const ueberschrift = tiptapText(k);
      if (ueberschrift) abschnitte.push({ ueberschrift, absaetze: [] });
    } else if (k.type === 'blockquote') {
      const a = aktuell();
      for (const p of k.content ?? []) {
        const text = tiptapText(p);
        if (text) (a.beispiele ??= []).push({ ziel: { text, sprache: ziel } });
      }
    } else if (k.type === 'bulletList' || k.type === 'orderedList') {
      for (const punkt of k.content ?? []) {
        const text = tiptapText(punkt);
        if (text) aktuell().absaetze.push(text);
      }
    } else {
      const text = tiptapText(k);
      if (text) aktuell().absaetze.push(text);
    }
  }
  // Ein Abschnitt braucht Text (Schema des Spielers); höchstens 10 Absätze und 10 Beispiele, 12 Abschnitte
  return abschnitte
    .filter((a) => a.absaetze.length > 0)
    .slice(0, 12)
    .map((a) => ({ ...a, absaetze: a.absaetze.slice(0, 10), ...(a.beispiele ? { beispiele: a.beispiele.slice(0, 10) } : {}) }));
}

/**
 * Bausteine mit einem Formel-Kandidaten (siehe oben) als Religionsbezug kennzeichnen: Zieltexte in der Zielsprache,
 * Übersetzungen samt Alternativen in der Ausgangssprache, Aufgaben (alle Texte ihrer Daten, etwa Alternativen und
 * Ablenker), Tipps, Lektionsziele und das Thema der Einheit in beiden Sprachen der Richtung.
 */
function mitFormelKandidaten(e: BauEingabe, formeln: readonly LateinFormel[]): BauEingabe {
  if (!formeln.length) return e;
  const { ziel, ausgang } = zerlegeRichtung(e.richtung);
  const trifft = (texte: readonly string[], sprachen: readonly Sprache[]) =>
    texte.some((t) => sprachen.some((s) => formelTreffer(t, s, formeln) !== null));
  const markiert = <T extends Baustein>(b: T, texte: readonly string[], sprachen: readonly Sprache[]): T =>
    b.religionsbezug || !trifft(texte, sprachen) ? b : { ...b, religionsbezug: true };
  const beide = [ziel, ausgang];
  return {
    ...e,
    einheit: markiert(e.einheit, texteIn(e.einheit.thema), beide),
    lektionen: e.lektionen.map((l) => ({
      ...markiert(l, texteIn(l.ziel), beide),
      aufgaben: l.aufgaben.map((a) => markiert(a, texteIn(a.daten), beide)),
    })),
    eintraege: new Map([...e.eintraege].map(([k, x]) => [k, markiert(x, [x.text], [ziel])])),
    uebersetzungen: new Map([...e.uebersetzungen].map(([k, u]) => [k, markiert(u, [u.text, ...u.alternativen], [ausgang])])),
    tipps: e.tipps.map((t) => markiert(t, texteIn(t.inhalt), beide)),
  };
}

/**
 * Einheitenpaket einer Richtung bauen. `null`, wenn die Einheit nicht ausgeliefert wird (verborgen, nur für eine andere
 * Ausgangssprache oder ohne spielbare Lektion).
 */
export function baueEinheit(eingabe: BauEingabe, o: BauOptionen): BauErgebnis | null {
  const e = mitFormelKandidaten(eingabe, o.formeln ?? LATEIN_FORMELN);
  const w = new Werkbank(e, o);
  if (e.einheit.nurFuerAusgang && e.einheit.nurFuerAusgang !== w.ausgang) return null;
  if (!w.sichtbar(e.einheit, e.einheit.schluessel)) return null;
  const kurs = w.ziel;

  const lektionen: Lektion[] = [];
  for (const l of e.lektionen) {
    if (!w.sichtbar(l, l.schluessel)) continue;
    const aufgaben: Aufgabe[] = [];
    for (const a of l.aufgaben) {
      if (!w.sichtbar(a, a.schluessel)) continue;
      const x = w.aufgabe(a);
      if (x) aufgaben.push(x);
    }
    if (!aufgaben.length) continue;
    const titel = l.ziel[w.ausgang];
    lektionen.push({
      schluessel: lektionImPaket(e.richtung, kurs, l.schluessel),
      kurs: e.richtung,
      art: l.art,
      zielsprache: w.ziel,
      ausgangssprache: w.ausgang,
      ...(titel ? { titel } : {}),
      aufgaben,
    });
  }
  if (!lektionen.length) return null;
  const lexikon = [...w.lexikon].sort();
  for (const l of lektionen) if (lexikon.length) l.lexikon = lexikon;

  const tipps = e.tipps
    .filter((t) => w.sichtbar(t, t.schluessel))
    .map((t) => ({ schluessel: t.schluessel, ...(t.titel ? { titel: t.titel } : {}), inhalt: t.inhalt }));

  const herkunft: Record<string, EintragHerkunft> = {};
  for (const k of [...w.herkunft.keys()].sort()) herkunft[k] = w.herkunft.get(k)!;
  const audio: BuendelVerweis[] = [...w.buendel.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([adresse, bytes]) => ({ adresse, bytes }));

  const paket: Paket = {
    format: PAKET_FORMAT,
    version: 1,
    kurs: e.richtung,
    zielsprache: w.ziel,
    ausgangssprache: w.ausgang,
    einheit: {
      schluessel: e.einheit.schluessel,
      stufe: e.einheit.stufe,
      reihenfolge: e.einheit.reihenfolge,
      thema: e.einheit.thema,
      ...(e.einheit.symbol ? { symbol: e.einheit.symbol } : {}),
    },
    hinweis: w.hinweise.size > 0,
    lektionen,
    eintraege: herkunft,
    tipps,
    audio,
    lizenz: INHALT_LIZENZ,
  };
  const json = kanonisch(paket);
  return { paket, json, hash: sha256Hex(json), bytes: new TextEncoder().encode(json).length, warnungen: w.warnungen };
}

/** Kursverzeichnis aus den gebauten Einheiten (Reihenfolge: Stufe, dann Einheit). */
export function baueVerzeichnis(v: {
  kurs: KursSlug;
  kursId: KursId;
  zielsprache: Sprache;
  ausgangssprache: Sprache | null;
  stand: number;
  einheiten: readonly BauErgebnis[];
  stufenFolge: readonly Stufe[];
}): Verzeichnis {
  const einheiten: VerzeichnisEinheit[] = [...v.einheiten]
    .sort(
      (a, b) =>
        v.stufenFolge.indexOf(a.paket.einheit.stufe) - v.stufenFolge.indexOf(b.paket.einheit.stufe) ||
        a.paket.einheit.reihenfolge - b.paket.einheit.reihenfolge ||
        (a.paket.einheit.schluessel < b.paket.einheit.schluessel ? -1 : 1),
    )
    .map((x) => ({
      schluessel: x.paket.einheit.schluessel,
      stufe: x.paket.einheit.stufe,
      reihenfolge: x.paket.einheit.reihenfolge,
      thema: x.paket.einheit.thema,
      ...(x.paket.einheit.symbol ? { symbol: x.paket.einheit.symbol } : {}),
      hash: x.hash,
      bytes: x.bytes,
      lektionen: x.paket.lektionen.length,
      hinweis: x.paket.hinweis,
      audio: x.paket.audio,
    }));
  return {
    format: VERZEICHNIS_FORMAT,
    version: 1,
    kurs: v.kurs,
    kursId: v.kursId,
    zielsprache: v.zielsprache,
    ausgangssprache: v.ausgangssprache,
    stand: v.stand,
    einheiten,
  };
}
