import 'server-only';
import { and, count, desc, eq, gt, isNull } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import type { LernappRubrik } from '@/lib/db/schema/lernapp-nutzung';
import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { entschluessele, verschluessele } from '@/lib/krypto';
import { GEMEINDE_FRISTEN } from '@/lib/loeschen/gemeinde';
import { darfInGruppe, type GruppenKontext } from '@/lib/rechte/gruppen';
import { ladeEinheitJson } from '@/server/queries/lernapp/pakete';
import type { Pruefliste } from '../aufgaben/auswertung/schreiben';
import { meineZuweisungen } from '../gruppe/dienst';
import type { RichtungId } from '../kurse';
import { lektionAusPaket } from '../paket/bauen';
import { lernappEinwilligung, lernappEinwilligungDetail } from '../sync/server';
import type { AbgabeAnfrage, AufgabenText, EigeneAbgabe, KeineAbgabe, PruefAntwort, Stufen } from './abgabe';
import {
  ABGABEN_JE_AUFGABE,
  ABGABEN_JE_KONTO,
  abgabeSchluessel,
  abgelaufen,
  aufgabenOrt,
  type AbgabeZustand,
  einwilligungDeckt,
  type Einstufung,
  lehrkraftLiest,
  loeschenAbFuer,
  zerlegeAbgabeSchluessel,
  zustandVon,
} from './regeln';
import { kommentarErlaubt } from './kinderschutz';

/**
 * Korrekturweg der Lehrkraft auf dem Server (L5-03; ADR 0042 Nr. 11; KERN 4.0 §5): Abgabe einer Schreibaufgabe an die
 * Lehrkraft der eigenen Gruppe, Liste und Korrektur für die Lehrkraft, eigene Abgaben mit Rückmeldung. Aufrufer (Route,
 * Action, Seite) prüfen vorher Sitzung, Kontoart und Schalter `lernapp_gruppen`; jede Funktion hier prüft Recht,
 * Einwilligung und Gruppe selbst:
 *
 * - **Abgeben** nur mit Einwilligung `lernapp` (bei Kindern die der Eltern) und nur für eine Schreibaufgabe aus dem
 *   ausgelieferten Kurspaket, die einer eigenen, aktiven Gruppe (laufende Mitgliedschaft) zugewiesen ist – die ganze
 *   Einheit oder genau diese Lektion.
 * - **Lesen** nur die Lehrkraft der Gruppe (`aufgabe.bearbeiten`: nicht die Aufsicht, nicht Eltern, nicht die
 *   Administration), nur solange die lernende Person laufendes Mitglied ist und ihre Einwilligung gilt und die Abgabe
 *   deckt (`regeln.lehrkraftLiest`). Austritt oder Widerruf → sofort nicht mehr lesbar, auch nach Wiedereintritt oder neuem
 *   Erteilen nicht (S-L2 N-2, `schreiben/folgen.ts`); fremde Abgaben verhalten sich wie „gibt es nicht“ (`KeinZugang`).
 * - **Kommentar an Kinder** (Einwilligungslage „eltern“) ist bis zur Entscheidung D-L16 gesperrt: nur Prüfliste und
 *   Einstufung (`schreiben/kinderschutz.ts`, S-L2 M-1); ein Kommentar endet als `KommentarGesperrt`.
 * - **Text und Kommentar** nur verschlüsselt (`verschluessele`, wie `lernende`); nie in Audit, Logs, Push oder Mail. Das
 *   Audit nennt nur Kennungen.
 * - **Löschung:** `loeschenAb` = Abgabe + 12 Monate (Löschlauf `loeschen/gemeinde.ts`); abgelaufene Abgaben liest
 *   niemand mehr, auch bevor der Löschlauf läuft. Eigene Abgaben löscht die Person jederzeit selbst; mit dem Konto
 *   verschwinden sie über den Fremdschlüssel.
 */
export class KeinZugang extends Error {
  constructor() {
    super('Keine Abgabe sichtbar');
  }
}

/** Kommentar zur Abgabe eines Kindes, solange D-L16 offen ist (S-L2 M-1): nichts gespeichert. */
export class KommentarGesperrt extends Error {
  constructor() {
    super('Kommentar an Kinder gesperrt (D-L16)');
  }
}

export class AbgabeAbgelehnt extends Error {
  constructor(readonly grund: KeineAbgabe | 'grenze' | 'konflikt') {
    super(`Abgabe abgelehnt: ${grund}`);
  }
}

type KontoKurz = { benutzerId: string; istKind: boolean };

/** Ausschnitt eines Einheitenpakets, den der Korrekturweg liest (Format `paket/bauen.ts`). */
type PaketAusschnitt = {
  lektionen: { schluessel: string; aufgaben: { schluessel: string; typ: string; aufgabe?: AufgabenText }[] }[];
};

export type SchreibOrt = { kurs: RichtungId; einheit: string; lektion: string; aufgabe: AufgabenText };

/**
 * Die Schreibaufgabe im ausgelieferten Kurspaket der Richtung: Einheit, Lektion (Schlüssel der Datenbank, wie in
 * `aufgabe.bezug.lektion`) und Aufgabentext. `null`, wenn es sie nicht gibt, sie nicht ausgeliefert wird oder keine
 * Schreibaufgabe ist.
 */
export async function schreibaufgabe(kurs: string, aufgabe: string): Promise<SchreibOrt | null> {
  const ort = aufgabenOrt(kurs, aufgabe);
  if (!ort) return null;
  const paket = await ladeEinheitJson(ort.kurs, ort.einheit);
  if (!paket) return null;
  const p = JSON.parse(paket.json) as PaketAusschnitt;
  for (const l of p.lektionen) {
    const a = l.aufgaben.find((x) => x.schluessel === aufgabe);
    if (!a) continue;
    const lektion = lektionAusPaket(l.schluessel);
    if (a.typ !== 'schreiben' || !a.aufgabe || !lektion || lektion.richtung !== ort.kurs) return null;
    return {
      kurs: ort.kurs,
      einheit: ort.einheit,
      lektion: lektion.schluessel,
      aufgabe: { text: a.aufgabe.text, sprache: a.aufgabe.sprache },
    };
  }
  return null;
}

/** Eigene Gruppen, denen diese Aufgabe zugewiesen ist (ganze Einheit oder genau die Lektion). */
async function zielGruppen(kontext: GruppenKontext, ort: SchreibOrt): Promise<{ id: string; name: Mehrsprachig }[]> {
  const gruppen = new Map<string, Mehrsprachig>();
  for (const z of await meineZuweisungen(kontext))
    if (
      z.kurs === ort.kurs &&
      z.einheit === ort.einheit &&
      (z.lektion === null || z.lektion === ort.lektion) &&
      darfInGruppe(kontext, 'gruppe.sehen', z.gruppeId) &&
      kontext.eigeneGruppen.has(z.gruppeId)
    )
      gruppen.set(z.gruppeId, z.gruppe);
  return [...gruppen].map(([id, name]) => ({ id, name }));
}

type Moeglich =
  { moeglich: true; ort: SchreibOrt; gruppen: { id: string; name: Mehrsprachig }[] } | { moeglich: false; grund: KeineAbgabe };

/** Kann dieses Konto die Aufgabe abgeben, und an welche Gruppe(n)? */
export async function pruefeAbgabe(
  konto: KontoKurz,
  kontext: GruppenKontext,
  kurs: string,
  aufgabe: string,
  jetzt = new Date(),
): Promise<Moeglich> {
  const einwilligung = await lernappEinwilligung(konto.benutzerId, { istKind: konto.istKind }, jetzt);
  if (einwilligung !== 'erteilt') return { moeglich: false, grund: einwilligung === 'eltern' ? 'eltern' : 'einwilligung' };
  const ort = await schreibaufgabe(kurs, aufgabe);
  if (!ort) return { moeglich: false, grund: 'aufgabe' };
  const gruppen = await zielGruppen(kontext, ort);
  return gruppen.length ? { moeglich: true, ort, gruppen } : { moeglich: false, grund: 'zuweisung' };
}

/** Antwort der Prüfung für die Oberfläche (Gruppennamen in der Sprache der Oberfläche, Arabisch → Deutsch). */
export function alsPruefAntwort(m: Moeglich, sprache: 'de' | 'tr'): PruefAntwort {
  if (!m.moeglich) return m;
  return { moeglich: true, gruppen: m.gruppen.map((g) => ({ id: g.id, name: g.name[sprache] ?? g.name.de ?? '' })) };
}

/**
 * Abgabe speichern (verschlüsselt). Idempotent über die Kennung aus dem Gerät: dieselbe Kennung desselben Kontos für
 * dieselbe Aufgabe ergibt `vorhanden`; eine fremde Kennung `konflikt` (ohne etwas zu verraten).
 */
export async function reicheEin(
  konto: KontoKurz,
  kontext: GruppenKontext,
  e: AbgabeAnfrage,
  jetzt = new Date(),
): Promise<'eingereicht' | 'vorhanden'> {
  const schluessel = abgabeSchluessel(e.kurs, e.aufgabe);
  const [da] = await db
    .select({ benutzerId: schema.lernappSchreibabgabe.benutzerId, aufgabe: schema.lernappSchreibabgabe.aufgabeSchluessel })
    .from(schema.lernappSchreibabgabe)
    .where(eq(schema.lernappSchreibabgabe.id, e.id));
  if (da) {
    if (da.benutzerId === konto.benutzerId && da.aufgabe === schluessel) return 'vorhanden';
    throw new AbgabeAbgelehnt('konflikt');
  }
  const m = await pruefeAbgabe(konto, kontext, e.kurs, e.aufgabe, jetzt);
  if (!m.moeglich) throw new AbgabeAbgelehnt(m.grund);
  if (!m.gruppen.some((g) => g.id === e.gruppe)) throw new AbgabeAbgelehnt('zuweisung');

  const A = schema.lernappSchreibabgabe;
  const v = verschluessele({ text: e.text });
  const rubrik: LernappRubrik = { pruefliste: e.pruefliste };
  return db.transaction(async (tx) => {
    // Grenzen zählen und einfügen in einem Zug: Die Zeile des Kontos bleibt bis zum Ende gesperrt, damit gleichzeitige
    // Abgaben desselben Kontos nacheinander zählen und die Grenzen nicht gemeinsam überschreiten (Gegenprüfung L5-03).
    // `no key update` hält Fremdschlüssel-Prüfungen anderer Tabellen (Sitzung, Audit) nicht auf.
    await tx.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.id, konto.benutzerId)).for('no key update');
    const [[jeAufgabe], [jeKonto]] = await Promise.all([
      tx
        .select({ n: count() })
        .from(A)
        .where(and(eq(A.benutzerId, konto.benutzerId), eq(A.aufgabeSchluessel, schluessel), eq(A.gruppeId, e.gruppe))),
      tx.select({ n: count() }).from(A).where(eq(A.benutzerId, konto.benutzerId)),
    ]);
    if ((jeAufgabe?.n ?? 0) >= ABGABEN_JE_AUFGABE || (jeKonto?.n ?? 0) >= ABGABEN_JE_KONTO) throw new AbgabeAbgelehnt('grenze');
    const neu = await tx
      .insert(A)
      .values({
        id: e.id,
        benutzerId: konto.benutzerId,
        gruppeId: e.gruppe,
        aufgabeSchluessel: schluessel,
        textVerschluesselt: v.daten,
        schluesselId: v.schluesselId,
        rubrik,
        eingereichtAm: jetzt,
        loeschenAb: loeschenAbFuer(jetzt, GEMEINDE_FRISTEN.lernappAbgabeMonate),
      })
      .onConflictDoNothing()
      .returning({ id: A.id });
    // Gleichzeitig dieselbe Kennung: Die andere Anfrage hat gespeichert
    if (!neu.length) return 'vorhanden';
    await protokolliere(
      {
        benutzerId: konto.benutzerId,
        aktion: 'lernapp.schreibabgabe_eingereicht',
        zielTyp: 'gruppe',
        zielId: e.gruppe,
        details: { abgabe: e.id },
      },
      tx,
    );
    return 'eingereicht';
  });
}

function entschluesseleText(daten: Buffer | null, schluesselId: number | null): string | null {
  if (!daten || schluesselId === null) return null;
  return entschluessele<{ text: string }>(daten, schluesselId).text;
}

/** Aufgabentexte mehrerer Abgaben (je Richtung und Einheit ein Paket). */
async function aufgabenTexte(schluessel: readonly string[]): Promise<Map<string, AufgabenText>> {
  const texte = new Map<string, AufgabenText>();
  for (const s of new Set(schluessel)) {
    const z = zerlegeAbgabeSchluessel(s);
    const ort = z ? await schreibaufgabe(z.kurs, z.aufgabe) : null;
    if (ort) texte.set(s, ort.aufgabe);
  }
  return texte;
}

const nurStufen = (p: Partial<Record<string, number>> | undefined): Stufen => ({ ...(p ?? {}) }) as Stufen;

/** Eigene Abgaben (Art. 15: die eigenen Daten) mit Text und Rückmeldung, neueste zuerst; abgelaufene nicht mehr. */
export async function eigeneAbgaben(benutzerId: string, sprache: 'de' | 'tr', jetzt = new Date()): Promise<EigeneAbgabe[]> {
  const A = schema.lernappSchreibabgabe;
  const zeilen = await db
    .select({
      id: A.id,
      aufgabeSchluessel: A.aufgabeSchluessel,
      gruppe: schema.gruppe.name,
      textVerschluesselt: A.textVerschluesselt,
      schluesselId: A.schluesselId,
      rubrik: A.rubrik,
      kommentarVerschluesselt: A.kommentarVerschluesselt,
      kommentarSchluesselId: A.kommentarSchluesselId,
      korrigiertAm: A.korrigiertAm,
      eingereichtAm: A.eingereichtAm,
      loeschenAb: A.loeschenAb,
    })
    .from(A)
    .leftJoin(schema.gruppe, eq(schema.gruppe.id, A.gruppeId))
    .where(and(eq(A.benutzerId, benutzerId), gt(A.loeschenAb, jetzt)))
    .orderBy(desc(A.eingereichtAm));
  const texte = await aufgabenTexte(zeilen.map((z) => z.aufgabeSchluessel));
  return zeilen.flatMap((z) => {
    const ort = zerlegeAbgabeSchluessel(z.aufgabeSchluessel);
    if (!ort) return [];
    return [
      {
        id: z.id,
        kurs: ort.kurs,
        aufgabe: texte.get(z.aufgabeSchluessel) ?? null,
        gruppe: z.gruppe ? (z.gruppe[sprache] ?? z.gruppe.de ?? null) : null,
        eingereichtAm: z.eingereichtAm.toISOString(),
        loeschenAb: z.loeschenAb.toISOString(),
        text: entschluesseleText(z.textVerschluesselt, z.schluesselId) ?? '',
        selbst: nurStufen(z.rubrik.pruefliste),
        rueckmeldung: z.korrigiertAm
          ? {
              am: z.korrigiertAm.toISOString(),
              kommentar: entschluesseleText(z.kommentarVerschluesselt, z.kommentarSchluesselId),
              pruefliste: nurStufen(z.rubrik.lehrkraft),
              einstufung: z.rubrik.einstufung ?? null,
            }
          : null,
      },
    ];
  });
}

/** Eigene Abgabe löschen (jederzeit, auch ohne Schalter). `false`, wenn es keine eigene Abgabe mit dieser Kennung gibt. */
export async function loescheEigeneAbgabe(benutzerId: string, id: string): Promise<boolean> {
  return db.transaction(async (tx) => {
    const weg = await tx
      .delete(schema.lernappSchreibabgabe)
      .where(and(eq(schema.lernappSchreibabgabe.id, id), eq(schema.lernappSchreibabgabe.benutzerId, benutzerId)))
      .returning({ id: schema.lernappSchreibabgabe.id });
    if (!weg.length) return false;
    await protokolliere(
      { benutzerId, aktion: 'lernapp.schreibabgabe_geloescht', zielTyp: 'konto', zielId: benutzerId, details: { abgabe: id } },
      tx,
    );
    return true;
  });
}

// ——— Lehrkraft ———

export type AbgabeZeile = {
  id: string;
  name: string;
  kurs: RichtungId;
  aufgabe: AufgabenText | null;
  eingereichtAm: Date;
  korrigiertAm: Date | null;
  zustand: AbgabeZustand;
};

export type AbgabeDetail = AbgabeZeile & {
  text: string;
  selbst: Stufen;
  kommentar: string | null;
  pruefliste: Stufen;
  einstufung: Einstufung | null;
  /** Darf die Lehrkraft hier einen Kommentar schreiben? Nicht bei Kindern, solange D-L16 offen ist (S-L2 M-1). */
  kommentarErlaubt: boolean;
};

/**
 * Abgaben einer Gruppe, die die Lehrkraft lesen darf (`regeln.lehrkraftLiest`). Mit `id` nur diese eine. Fremde Gruppe,
 * Aufsicht, Eltern, Lernende und Administration: `KeinZugang`.
 */
async function lesbare(kontext: GruppenKontext, gruppeId: string, jetzt: Date, id?: string) {
  const lehrkraft = darfInGruppe(kontext, 'aufgabe.bearbeiten', gruppeId);
  if (!lehrkraft) throw new KeinZugang();
  const A = schema.lernappSchreibabgabe;
  const zeilen = await db
    .select({
      id: A.id,
      benutzerId: A.benutzerId,
      gruppeId: A.gruppeId,
      aufgabeSchluessel: A.aufgabeSchluessel,
      textVerschluesselt: A.textVerschluesselt,
      schluesselId: A.schluesselId,
      rubrik: A.rubrik,
      kommentarVerschluesselt: A.kommentarVerschluesselt,
      kommentarSchluesselId: A.kommentarSchluesselId,
      korrigiertAm: A.korrigiertAm,
      eingereichtAm: A.eingereichtAm,
      loeschenAb: A.loeschenAb,
      name: schema.lernende.anzeigename,
      mitglied: schema.gruppenMitglied.lernendeId,
      istKind: schema.kontoProfil.istKind,
    })
    .from(A)
    .innerJoin(schema.lernende, and(eq(schema.lernende.benutzerId, A.benutzerId), eq(schema.lernende.status, 'aktiv')))
    .leftJoin(
      schema.gruppenMitglied,
      and(
        eq(schema.gruppenMitglied.lernendeId, schema.lernende.id),
        eq(schema.gruppenMitglied.gruppeId, gruppeId),
        isNull(schema.gruppenMitglied.bis),
      ),
    )
    .leftJoin(schema.kontoProfil, eq(schema.kontoProfil.benutzerId, A.benutzerId))
    .where(and(eq(A.gruppeId, gruppeId), ...(id ? [eq(A.id, id)] : [])))
    .orderBy(desc(A.eingereichtAm));
  const kandidaten = zeilen.filter((z) => z.mitglied !== null && !abgelaufen(z.loeschenAb, jetzt));
  const konten = [...new Map(kandidaten.map((z) => [z.benutzerId, z.istKind ?? true])).entries()];
  // Je Konto: Lage (Kind: „eltern“) und seit wann die geltende Einwilligung besteht
  const einwilligung = new Map(
    await Promise.all(
      konten.map(async ([benutzerId, istKind]) => [benutzerId, await lernappEinwilligungDetail(benutzerId, { istKind }, jetzt)] as const),
    ),
  );
  return zeilen.flatMap((z) => {
    const e = einwilligung.get(z.benutzerId);
    const lesbar = lehrkraftLiest({
      lehrkraftDerGruppe: lehrkraft,
      abgabeInGruppe: z.gruppeId === gruppeId,
      laufendesMitglied: z.mitglied !== null,
      einwilligung: e?.stand === 'erteilt' && einwilligungDeckt(e.seit, z.eingereichtAm),
      abgelaufen: abgelaufen(z.loeschenAb, jetzt),
    });
    return lesbar && e ? [{ ...z, kommentarErlaubt: kommentarErlaubt(e.lage) }] : [];
  });
}

/** Liste für die Lehrkraft – ohne Texte: Name, Aufgabe, Datum, Zustand; offene zuerst. */
export async function abgabenDerGruppe(kontext: GruppenKontext, gruppeId: string, jetzt = new Date()): Promise<AbgabeZeile[]> {
  const zeilen = await lesbare(kontext, gruppeId, jetzt);
  const texte = await aufgabenTexte(zeilen.map((z) => z.aufgabeSchluessel));
  const liste = zeilen.flatMap((z) => {
    const ort = zerlegeAbgabeSchluessel(z.aufgabeSchluessel);
    return ort
      ? [
          {
            id: z.id,
            name: z.name,
            kurs: ort.kurs,
            aufgabe: texte.get(z.aufgabeSchluessel) ?? null,
            eingereichtAm: z.eingereichtAm,
            korrigiertAm: z.korrigiertAm,
            zustand: zustandVon(z),
          },
        ]
      : [];
  });
  return liste.sort((a, b) => Number(a.zustand === 'zurueckgegeben') - Number(b.zustand === 'zurueckgegeben'));
}

/** Eine Abgabe mit Text für die Lehrkraft der Gruppe (sonst `KeinZugang`). */
export async function abgabeFuerLehrkraft(
  kontext: GruppenKontext,
  gruppeId: string,
  id: string,
  jetzt = new Date(),
): Promise<AbgabeDetail> {
  const [z] = await lesbare(kontext, gruppeId, jetzt, id);
  const ort = z ? zerlegeAbgabeSchluessel(z.aufgabeSchluessel) : null;
  if (!z || !ort) throw new KeinZugang();
  const texte = await aufgabenTexte([z.aufgabeSchluessel]);
  return {
    id: z.id,
    name: z.name,
    kurs: ort.kurs,
    aufgabe: texte.get(z.aufgabeSchluessel) ?? null,
    eingereichtAm: z.eingereichtAm,
    korrigiertAm: z.korrigiertAm,
    zustand: zustandVon(z),
    text: entschluesseleText(z.textVerschluesselt, z.schluesselId) ?? '',
    selbst: nurStufen(z.rubrik.pruefliste),
    kommentar: entschluesseleText(z.kommentarVerschluesselt, z.kommentarSchluesselId),
    pruefliste: nurStufen(z.rubrik.lehrkraft),
    einstufung: z.rubrik.einstufung ?? null,
    kommentarErlaubt: z.kommentarErlaubt,
  };
}

/**
 * Rückmeldung speichern und an die lernende Person zurückgeben (Kommentar verschlüsselt, Prüfliste und Einstufung ohne
 * Note). Erneut aufgerufen, ersetzt sie die bisherige Rückmeldung. Nur die Lehrkraft der Gruppe, nur lesbare Abgaben.
 * Zur Abgabe eines Kindes kein Kommentar, solange D-L16 offen ist (`KommentarGesperrt`, nichts gespeichert); eine
 * Rückgabe ohne Kommentar entfernt dort auch einen früheren.
 */
export async function gibZurueck(
  kontext: GruppenKontext,
  gruppeId: string,
  id: string,
  r: { kommentar: string | null; pruefliste: Pruefliste; einstufung: Einstufung | null },
  jetzt = new Date(),
): Promise<void> {
  const [z] = await lesbare(kontext, gruppeId, jetzt, id);
  if (!z) throw new KeinZugang();
  if (r.kommentar?.trim() && !z.kommentarErlaubt) throw new KommentarGesperrt();
  const kommentar = r.kommentar?.trim() ? verschluessele({ text: r.kommentar.trim() }) : null;
  const rubrik: LernappRubrik = {
    pruefliste: z.rubrik.pruefliste ?? {},
    lehrkraft: r.pruefliste,
    ...(r.einstufung ? { einstufung: r.einstufung } : {}),
  };
  await db.transaction(async (tx) => {
    const getroffen = await tx
      .update(schema.lernappSchreibabgabe)
      .set({
        rubrik,
        kommentarVerschluesselt: kommentar?.daten ?? null,
        kommentarSchluesselId: kommentar?.schluesselId ?? null,
        korrigiertVon: kontext.benutzerId,
        korrigiertAm: jetzt,
      })
      .where(and(eq(schema.lernappSchreibabgabe.id, id), eq(schema.lernappSchreibabgabe.gruppeId, gruppeId)))
      .returning({ id: schema.lernappSchreibabgabe.id });
    // Inzwischen gelöscht (die Person hat ihre Abgabe zurückgezogen): keine Rückgabe, also auch kein Audit-Eintrag
    if (!getroffen.length) throw new KeinZugang();
    await protokolliere(
      {
        benutzerId: kontext.benutzerId,
        aktion: 'lernapp.schreibabgabe_zurueckgegeben',
        zielTyp: 'gruppe',
        zielId: gruppeId,
        details: { abgabe: id },
      },
      tx,
    );
  });
}

/**
 * Eigene Abgaben für den Datenexport (Art. 15/20): alles, auch abgelaufene, die der Löschlauf noch nicht entfernt hat. Mit
 * Kennung (`id`), damit die Person eine Abgabe gezielt löschen lassen kann (S-L2 N-2); `gruppe` ist nach dem Austritt leer.
 */
export async function abgabenFuerExport(benutzerId: string): Promise<Record<string, unknown>[]> {
  const A = schema.lernappSchreibabgabe;
  const zeilen = await db.select().from(A).where(eq(A.benutzerId, benutzerId)).orderBy(desc(A.eingereichtAm));
  const lies = (daten: Buffer | null, id: number | null) => {
    try {
      return entschluesseleText(daten, id);
    } catch {
      return '[nicht entschlüsselbar – bitte an die Gemeinde wenden]';
    }
  };
  return zeilen.map((z) => {
    const ort = zerlegeAbgabeSchluessel(z.aufgabeSchluessel);
    return {
      id: z.id,
      kurs: ort?.kurs ?? null,
      aufgabe: ort?.aufgabe ?? z.aufgabeSchluessel,
      gruppe: z.gruppeId,
      eingereichtAm: z.eingereichtAm,
      loeschenAb: z.loeschenAb,
      text: lies(z.textVerschluesselt, z.schluesselId),
      selbsteinschaetzung: z.rubrik.pruefliste ?? {},
      rueckmeldung: z.korrigiertAm
        ? {
            am: z.korrigiertAm,
            kommentar: lies(z.kommentarVerschluesselt, z.kommentarSchluesselId),
            pruefliste: z.rubrik.lehrkraft ?? {},
            einstufung: z.rubrik.einstufung ?? null,
          }
        : null,
    };
  });
}
