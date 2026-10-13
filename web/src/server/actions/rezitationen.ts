'use server';

import { and, count, eq, inArray, like, ne } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { AudioFehler, legeAudioAb, sureDatei } from '@/lib/audio/ablage';
import { istAudioEingang } from '@/lib/audio/direkt';
import { pruefeVerszeiten, pruefeWortanfaenge, wortzeitenAusAnfaengen, type VersTripel } from '@/lib/audio/werkstatt';
import { protokolliere } from '@/lib/audit';
import { inhaltGeaendert } from '@/lib/cache/aktualisieren';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { MedienFehler, verarbeiteDatei } from '@/lib/medien/verarbeiten';
import { darf, KeinRecht, verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import { speicher } from '@/lib/storage';
import { kennungAus, rezitationSchema, REZITATION_FELDER } from '@/lib/validierung/rezitation';

/**
 * Verwaltung › Rezitationen (O-Q02, H-Q05, ADR 0029). Alles nur mit `rezitation.bearbeiten` (Rolle religiöse Prüfung,
 * Administration); Aktivieren und Standard zusätzlich mit `religioes.freigeben` und nur mit hinterlegter Vereinbarung
 * (die Datenbank erzwingt das zusätzlich). Werkstatt: Audio übernehmen, Versgrenzen und Wortzeiten speichern, Wortzeiten
 * nach der Prüfwiedergabe bestätigen. Jede Zeit wird hier mit denselben Regeln geprüft wie im Browser.
 * Öffentlich sichtbar wird nur eine aktive Rezitation – dann verfallen ihre Caches (Player, Zeiten-Route).
 */
export type RezitationZustand = {
  fehler?: string;
  feldFehler?: Record<string, string>;
  werte?: Record<string, string>;
  gespeichert?: number;
  /** Werkstatt: Ergebnis der Übernahme (neu, ersetzt, unveraendert) */
  hinweis?: string;
};

const r = schema.quranRezitation;
const ID = z.string().regex(/^[a-z0-9-]{2,40}$/);
const SURE = z.coerce.number().int().min(1).max(114);
const VERS = z.coerce.number().int().min(1).max(286);

/** Recht prüfen (erste Anweisung jeder Action); ohne Recht eine Rückmeldung statt Fehlerseite (Werkstatt ruft direkt). */
async function mitRecht(f: (a: Angemeldet) => Promise<RezitationZustand>): Promise<RezitationZustand> {
  let a: Angemeldet;
  try {
    a = await verlangeRecht('rezitation.bearbeiten');
  } catch (e) {
    if (e instanceof KeinRecht) return { fehler: 'keinRecht' };
    throw e;
  }
  return f(a);
}

async function ladeKopf(id: unknown) {
  const p = ID.safeParse(id);
  if (!p.success) return null;
  const [z] = await db
    .select({ id: r.id, aktiv: r.aktiv, standard: r.standard, vereinbarung: r.vereinbarungMediumId, art: r.art, name: r.name })
    .from(r)
    .where(eq(r.id, p.data))
    .limit(1);
  return z ?? null;
}

/** Öffentliche Caches nur, wenn die Rezitation sichtbar ist (oder es eben war). */
function oeffentlichNeu(id: string, aktiv: boolean) {
  if (aktiv) inhaltGeaendert(TAG.rezitationen, TAG.rezitation(id));
}

function werteAus(fd: FormData): Record<string, string> {
  return Object.fromEntries(REZITATION_FELDER.map((f) => [f, String(fd.get(f) ?? '')]));
}

function feldFehler(e: z.ZodError): Record<string, string> {
  const f: Record<string, string> = {};
  for (const i of e.issues) f[String(i.path[0] ?? 'formular')] ??= i.message;
  return f;
}

const name = (d: z.infer<typeof rezitationSchema>) => ({
  de: d.nameDe,
  ...(d.nameTr ? { tr: d.nameTr } : {}),
  ...(d.nameEn ? { en: d.nameEn } : {}),
});

export async function rezitationAnlegen(_vorher: RezitationZustand, fd: FormData): Promise<RezitationZustand> {
  return mitRecht(async (a) => {
    const werte = werteAus(fd);
    const p = rezitationSchema.safeParse(werte);
    if (!p.success) return { fehler: 'pruefen', feldFehler: feldFehler(p.error), werte };
    const vergeben = async (id: string) => Boolean((await db.select({ id: r.id }).from(r).where(eq(r.id, id)).limit(1))[0]);
    let id = p.data.kennung;
    if (id) {
      if (await vergeben(id)) return { fehler: 'pruefen', feldFehler: { kennung: 'kennungVergeben' }, werte };
    } else {
      const basis = kennungAus(p.data.nameDe);
      id = basis;
      for (let n = 2; (await vergeben(id)) && n < 100; n++) id = `${basis}-${n}`;
      if (await vergeben(id)) return { fehler: 'pruefen', feldFehler: { kennung: 'kennungVergeben' }, werte };
    }
    await db.transaction(async (tx) => {
      await tx.insert(r).values({
        id,
        name: name(p.data),
        rezitator: p.data.rezitator,
        art: p.data.art,
        lizenz: p.data.lizenz,
        erstelltVon: a.benutzerId,
      });
      await protokolliere(
        { benutzerId: a.benutzerId, aktion: 'inhalt.angelegt', zielTyp: 'quran_rezitation', zielId: id, details: { art: p.data.art } },
        tx,
      );
    });
    redirect(`/verwaltung/rezitationen/${id}?angelegt=1`);
  });
}

export async function rezitationAendern(_vorher: RezitationZustand, fd: FormData): Promise<RezitationZustand> {
  return mitRecht(async (a) => {
    const kopf = await ladeKopf(fd.get('id'));
    if (!kopf) return { fehler: 'nichtGefunden' };
    const werte = { ...werteAus(fd), kennung: '' };
    const p = rezitationSchema.safeParse(werte);
    if (!p.success) return { fehler: 'pruefen', feldFehler: feldFehler(p.error), werte };
    await db.transaction(async (tx) => {
      await tx
        .update(r)
        .set({ name: name(p.data), rezitator: p.data.rezitator, art: p.data.art, lizenz: p.data.lizenz })
        .where(eq(r.id, kopf.id));
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geaendert', zielTyp: 'quran_rezitation', zielId: kopf.id }, tx);
    });
    oeffentlichNeu(kopf.id, kopf.aktiv);
    refresh();
    return { gespeichert: Date.now() };
  });
}

/**
 * Vereinbarung über Rechte und Stimme (PDF) hochladen oder eine PDF-Datei aus den Medien wählen und verknüpfen.
 * Neue Dateien laufen durch die Medien-Prüfung (Magic Bytes, höchstens 10 MB) und brauchen zusätzlich `medium.hochladen`.
 */
export async function vereinbarungSetzen(_vorher: RezitationZustand, fd: FormData): Promise<RezitationZustand> {
  return mitRecht(async (a) => {
    const kopf = await ladeKopf(fd.get('id'));
    if (!kopf) return { fehler: 'nichtGefunden' };
    const m = schema.medium;
    const datei = fd.get('datei');
    let mediumId: string;
    if (datei instanceof File && datei.size > 0) {
      if (!darf(a.rollen, 'medium.hochladen')) return { fehler: 'keinRecht' };
      let v;
      try {
        v = await verarbeiteDatei(Buffer.from(await datei.arrayBuffer()), datei.name);
      } catch (e) {
        return { fehler: 'pruefen', feldFehler: { datei: e instanceof MedienFehler ? `datei_${e.grund}` : 'datei_defekt' } };
      }
      if (v.typ !== 'application/pdf') return { fehler: 'pruefen', feldFehler: { datei: 'keinPdf' } };
      const [vorhanden] = await db
        .select({ id: m.id, papierkorb: m.imPapierkorbSeit })
        .from(m)
        .where(like(m.schluessel, `${v.hash}/%`))
        .limit(1);
      if (vorhanden?.papierkorb) return { fehler: 'pruefen', feldFehler: { datei: 'datei_imPapierkorb' } };
      if (vorhanden) mediumId = vorhanden.id;
      else {
        await speicher().schreibe(v.schluessel, v.daten, v.typ);
        const [neu] = await db
          .transaction(async (tx) => {
            const zeilen = await tx
              .insert(m)
              .values({
                schluessel: v.schluessel,
                typ: v.typ,
                groesse: v.daten.length,
                alt: { de: `Vereinbarung zur Rezitation „${kopf.name.de}“` },
                dateiname: datei.name.slice(0, 200),
                erstelltVon: a.benutzerId,
              })
              .returning({ id: m.id });
            await protokolliere(
              {
                benutzerId: a.benutzerId,
                aktion: 'medium.hochgeladen',
                zielTyp: 'medium',
                zielId: zeilen[0].id,
                details: { typ: v.typ, groesse: v.daten.length, zweck: 'vereinbarung_rezitation' },
              },
              tx,
            );
            return zeilen;
          })
          .catch(async (e: unknown) => {
            await speicher()
              .loesche(v.schluessel)
              .catch(() => undefined);
            throw e;
          });
        mediumId = neu.id;
      }
    } else {
      const gewaehlt = z.uuid().safeParse(fd.get('mediumId'));
      if (!gewaehlt.success) return { fehler: 'pruefen', feldFehler: { datei: 'dateiFehlt' } };
      const [vorhanden] = await db
        .select({ id: m.id, typ: m.typ, papierkorb: m.imPapierkorbSeit })
        .from(m)
        .where(eq(m.id, gewaehlt.data))
        .limit(1);
      if (!vorhanden || vorhanden.papierkorb) return { fehler: 'pruefen', feldFehler: { datei: 'dateiFehlt' } };
      if (vorhanden.typ !== 'application/pdf') return { fehler: 'pruefen', feldFehler: { datei: 'keinPdf' } };
      mediumId = vorhanden.id;
    }
    await db.transaction(async (tx) => {
      await tx.update(r).set({ vereinbarungMediumId: mediumId }).where(eq(r.id, kopf.id));
      await protokolliere(
        { benutzerId: a.benutzerId, aktion: 'inhalt.geaendert', zielTyp: 'quran_rezitation', zielId: kopf.id, details: { vereinbarung: true } },
        tx,
      );
    });
    refresh();
    return { gespeichert: Date.now() };
  });
}

/** Verknüpfung lösen – nur, solange die Rezitation nicht aktiv ist. */
export async function vereinbarungLoesen(_vorher: RezitationZustand, fd: FormData): Promise<RezitationZustand> {
  return mitRecht(async (a) => {
    const kopf = await ladeKopf(fd.get('id'));
    if (!kopf) return { fehler: 'nichtGefunden' };
    if (kopf.aktiv) return { fehler: 'aktiv' };
    await db.transaction(async (tx) => {
      await tx.update(r).set({ vereinbarungMediumId: null }).where(and(eq(r.id, kopf.id), eq(r.aktiv, false)));
      await protokolliere(
        { benutzerId: a.benutzerId, aktion: 'inhalt.geaendert', zielTyp: 'quran_rezitation', zielId: kopf.id, details: { vereinbarung: false } },
        tx,
      );
    });
    refresh();
    return { gespeichert: Date.now() };
  });
}

/**
 * Aktivieren (öffentlich im Player) nur mit `religioes.freigeben` und hinterlegter Vereinbarung außerhalb des
 * Papierkorbs. Abschalten darf jede Person mit `rezitation.bearbeiten` (Sicherheit vor Bequemlichkeit).
 * Die erste aktive Rezitation wird Standard.
 */
export async function freigabeSetzen(_vorher: RezitationZustand, fd: FormData): Promise<RezitationZustand> {
  return mitRecht(async (a) => {
    const kopf = await ladeKopf(fd.get('id'));
    if (!kopf) return { fehler: 'nichtGefunden' };
    const an = fd.get('an') === '1';
    if (an) {
      if (!darf(a.rollen, 'religioes.freigeben')) return { fehler: 'keineFreigabe' };
      if (!kopf.vereinbarung) return { fehler: 'ohneVereinbarung' };
      const [medium] = await db
        .select({ papierkorb: schema.medium.imPapierkorbSeit })
        .from(schema.medium)
        .where(eq(schema.medium.id, kopf.vereinbarung))
        .limit(1);
      if (!medium || medium.papierkorb) return { fehler: 'ohneVereinbarung' };
    }
    await db.transaction(async (tx) => {
      if (an) {
        const [standard] = await tx
          .select({ n: count() })
          .from(r)
          .where(and(eq(r.aktiv, true), eq(r.standard, true), ne(r.id, kopf.id)));
        await tx
          .update(r)
          .set({ aktiv: true, ...(standard.n === 0 ? { standard: true } : {}) })
          .where(eq(r.id, kopf.id));
      } else await tx.update(r).set({ aktiv: false, standard: false }).where(eq(r.id, kopf.id));
      await protokolliere(
        {
          benutzerId: a.benutzerId,
          aktion: an ? 'inhalt.veroeffentlicht' : 'inhalt.geaendert',
          zielTyp: 'quran_rezitation',
          zielId: kopf.id,
          details: { aktiv: an },
        },
        tx,
      );
    });
    inhaltGeaendert(TAG.rezitationen, TAG.rezitation(kopf.id));
    refresh();
    return { gespeichert: Date.now() };
  });
}

/** Standard-Rezitation des Players (nur aktive, mit `religioes.freigeben`). */
export async function standardSetzen(_vorher: RezitationZustand, fd: FormData): Promise<RezitationZustand> {
  return mitRecht(async (a) => {
    const kopf = await ladeKopf(fd.get('id'));
    if (!kopf) return { fehler: 'nichtGefunden' };
    if (!darf(a.rollen, 'religioes.freigeben')) return { fehler: 'keineFreigabe' };
    if (!kopf.aktiv) return { fehler: 'nichtAktiv' };
    await db.transaction(async (tx) => {
      await tx.update(r).set({ standard: false }).where(ne(r.id, kopf.id));
      await tx.update(r).set({ standard: true }).where(eq(r.id, kopf.id));
      await protokolliere(
        { benutzerId: a.benutzerId, aktion: 'inhalt.geaendert', zielTyp: 'quran_rezitation', zielId: kopf.id, details: { standard: true } },
        tx,
      );
    });
    inhaltGeaendert(TAG.rezitationen);
    refresh();
    return { gespeichert: Date.now() };
  });
}

/**
 * Werkstatt: Audiodatei einer Sure aus dem Eingang übernehmen (Direkt-Upload). Prüft Magic Bytes, Größe und SHA-256,
 * legt unter dem Inhalts-Hash ab und entfernt den Eingang. Eine neue Datei ersetzt die alte samt ihren Zeiten.
 */
export async function audioUebernehmen(_vorher: RezitationZustand, fd: FormData): Promise<RezitationZustand> {
  return mitRecht(async (a) => {
    const kopf = await ladeKopf(fd.get('rezitationId'));
    const sure = SURE.safeParse(fd.get('sure'));
    if (!kopf || !sure.success) return { fehler: 'nichtGefunden' };
    const eingang = fd.get('eingang');
    if (!istAudioEingang(eingang)) return { fehler: 'eingang' };
    const dauer = z.coerce.number().int().positive().max(4 * 3_600_000).safeParse(fd.get('dauerMs'));
    const strom = await speicher().lies(eingang);
    if (!strom) return { fehler: 'eingang' };
    const roh = Buffer.from(await new Response(strom).arrayBuffer());
    // Die Bytes liegen jetzt im Speicher der Funktion; der Eingang wird nicht mehr gebraucht
    await speicher()
      .loesche(eingang)
      .catch(() => undefined);
    let ergebnis;
    try {
      ergebnis = await legeAudioAb({ rezitationId: kopf.id, sure: sure.data, vers: 0, roh, dauerMs: dauer.success ? dauer.data : null });
    } catch (e) {
      if (e instanceof AudioFehler) return { fehler: `audio_${e.grund}` };
      throw e;
    }
    await protokolliere({
      benutzerId: a.benutzerId,
      aktion: 'medium.hochgeladen',
      zielTyp: 'quran_audio',
      zielId: `${kopf.id}:${sure.data}`,
      details: { typ: ergebnis.mime, groesse: ergebnis.bytes, ergebnis: ergebnis.ergebnis },
    });
    oeffentlichNeu(kopf.id, kopf.aktiv);
    refresh();
    return { gespeichert: Date.now(), hinweis: ergebnis.ergebnis };
  });
}

const tripel = z.array(z.tuple([z.number().int(), z.number().int(), z.number().int()])).max(286);

/** Werkstatt: Versgrenzen einer Sure-Datei speichern. Verse mit geändertem Fenster verlieren die Prüfung ihrer Wortzeiten. */
export async function verszeitenSpeichern(_vorher: RezitationZustand, fd: FormData): Promise<RezitationZustand> {
  return mitRecht(async (a) => {
    const kopf = await ladeKopf(fd.get('rezitationId'));
    const sure = SURE.safeParse(fd.get('sure'));
    if (!kopf || !sure.success) return { fehler: 'nichtGefunden' };
    let verse: VersTripel[];
    try {
      const p = tripel.safeParse(JSON.parse(String(fd.get('verse') ?? '')));
      if (!p.success) return { fehler: 'verse_anzahl' };
      verse = p.data;
    } catch {
      return { fehler: 'verse_anzahl' };
    }
    const datei = await sureDatei(kopf.id, sure.data);
    if (!datei) return { fehler: 'keineDatei' };
    const [s] = await db
      .select({ verse: schema.quranSure.verseAnzahl })
      .from(schema.quranSure)
      .where(eq(schema.quranSure.nr, sure.data))
      .limit(1);
    const fehler = pruefeVerszeiten(verse, s?.verse ?? 0, datei.dauerMs);
    if (fehler) return { fehler: `verse_${fehler}` };
    const v = schema.quranVerszeit;
    const stelle = and(eq(v.rezitationId, kopf.id), eq(v.sure, sure.data));
    const geaendert = await db.transaction(async (tx) => {
      const vorher = new Map((await tx.select({ vers: v.vers, s: v.startMs, e: v.endeMs }).from(v).where(stelle)).map((z) => [z.vers, z]));
      const anders = verse.filter(([nr, start, ende]) => vorher.get(nr)?.s !== start || vorher.get(nr)?.e !== ende).map(([nr]) => nr);
      await tx.delete(v).where(stelle);
      await tx.insert(v).values(verse.map(([vers, startMs, endeMs]) => ({ rezitationId: kopf.id, sure: sure.data, vers, startMs, endeMs })));
      if (anders.length)
        await tx
          .update(schema.quranWortzeit)
          .set({ geprueft: false })
          .where(
            and(
              eq(schema.quranWortzeit.rezitationId, kopf.id),
              eq(schema.quranWortzeit.sure, sure.data),
              inArray(schema.quranWortzeit.vers, anders),
            ),
          );
      await protokolliere(
        {
          benutzerId: a.benutzerId,
          aktion: 'inhalt.geaendert',
          zielTyp: 'quran_verszeit',
          zielId: `${kopf.id}:${sure.data}`,
          details: { verse: verse.length, geaendert: anders.length },
        },
        tx,
      );
      return anders.length;
    });
    oeffentlichNeu(kopf.id, kopf.aktiv);
    refresh();
    return { gespeichert: Date.now(), hinweis: String(geaendert) };
  });
}

/** Zeitfenster eines Verses: aus der Verszeit (Sure-Datei) oder aus der eigenen Datei des Verses. */
async function versFenster(rezitationId: string, sure: number, vers: number): Promise<{ startMs: number; endeMs: number | null } | null> {
  const [zeit] = await db
    .select({ s: schema.quranVerszeit.startMs, e: schema.quranVerszeit.endeMs })
    .from(schema.quranVerszeit)
    .where(
      and(eq(schema.quranVerszeit.rezitationId, rezitationId), eq(schema.quranVerszeit.sure, sure), eq(schema.quranVerszeit.vers, vers)),
    )
    .limit(1);
  if (zeit) return { startMs: zeit.s, endeMs: zeit.e };
  const [eigen] = await db
    .select({ dauer: schema.quranAudio.dauerMs })
    .from(schema.quranAudio)
    .where(and(eq(schema.quranAudio.rezitationId, rezitationId), eq(schema.quranAudio.sure, sure), eq(schema.quranAudio.vers, vers)))
    .limit(1);
  return eigen ? { startMs: 0, endeMs: eigen.dauer } : null;
}

async function wortAnzahl(sure: number, vers: number): Promise<number> {
  const [z] = await db
    .select({ n: count() })
    .from(schema.quranWort)
    .where(and(eq(schema.quranWort.sure, sure), eq(schema.quranWort.vers, vers)));
  return z?.n ?? 0;
}

/**
 * Werkstatt: Wortanfänge eines Verses aus dem Mitklopfen (mit Einrasten und Korrektur) speichern – ungeprüft.
 * Geprüft werden sie erst mit `wortzeitenBestaetigen` nach der Prüfwiedergabe.
 */
export async function wortzeitenSpeichern(_vorher: RezitationZustand, fd: FormData): Promise<RezitationZustand> {
  return mitRecht(async (a) => {
    const kopf = await ladeKopf(fd.get('rezitationId'));
    const sure = SURE.safeParse(fd.get('sure'));
    const vers = VERS.safeParse(fd.get('vers'));
    if (!kopf || !sure.success || !vers.success) return { fehler: 'nichtGefunden' };
    let anfaenge: number[];
    try {
      const p = z.array(z.number().int().min(0)).max(200).safeParse(JSON.parse(String(fd.get('anfaenge') ?? '')));
      if (!p.success) return { fehler: 'woerter_anzahl' };
      anfaenge = p.data;
    } catch {
      return { fehler: 'woerter_anzahl' };
    }
    const fenster = await versFenster(kopf.id, sure.data, vers.data);
    if (!fenster) return { fehler: 'ohneVerszeit' };
    // Datei je Vers ohne bekannte Dauer: Ende aus der Werkstatt (Dauer der dekodierten Datei)
    const ende = fenster.endeMs ?? z.coerce.number().int().positive().max(3_600_000).safeParse(fd.get('endeMs')).data ?? null;
    if (ende === null) return { fehler: 'ohneVerszeit' };
    const fehler = pruefeWortanfaenge(anfaenge, await wortAnzahl(sure.data, vers.data), { startMs: fenster.startMs, endeMs: ende });
    if (fehler) return { fehler: `woerter_${fehler}` };
    const w = schema.quranWortzeit;
    await db.transaction(async (tx) => {
      await tx.delete(w).where(and(eq(w.rezitationId, kopf.id), eq(w.sure, sure.data), eq(w.vers, vers.data)));
      await tx.insert(w).values(
        wortzeitenAusAnfaengen(anfaenge, ende).map(([startMs, endeMs], i) => ({
          rezitationId: kopf.id,
          sure: sure.data,
          vers: vers.data,
          pos: i + 1,
          startMs,
          endeMs,
          quelle: 'mitklopfen' as const,
          geprueft: false,
        })),
      );
      await protokolliere(
        {
          benutzerId: a.benutzerId,
          aktion: 'inhalt.geaendert',
          zielTyp: 'quran_wortzeit',
          zielId: `${kopf.id}:${sure.data}:${vers.data}`,
          details: { woerter: anfaenge.length, geprueft: false },
        },
        tx,
      );
    });
    oeffentlichNeu(kopf.id, kopf.aktiv);
    refresh();
    return { gespeichert: Date.now() };
  });
}

/** Werkstatt: Wortzeiten eines Verses nach der Prüfwiedergabe als geprüft bestätigen (nur vollständige Verse). */
export async function wortzeitenBestaetigen(_vorher: RezitationZustand, fd: FormData): Promise<RezitationZustand> {
  return mitRecht(async (a) => {
    const kopf = await ladeKopf(fd.get('rezitationId'));
    const sure = SURE.safeParse(fd.get('sure'));
    const vers = VERS.safeParse(fd.get('vers'));
    if (!kopf || !sure.success || !vers.success) return { fehler: 'nichtGefunden' };
    const w = schema.quranWortzeit;
    const stelle = and(eq(w.rezitationId, kopf.id), eq(w.sure, sure.data), eq(w.vers, vers.data));
    const [vorhanden] = await db.select({ n: count() }).from(w).where(stelle);
    const anzahl = await wortAnzahl(sure.data, vers.data);
    if (!anzahl || vorhanden.n !== anzahl) return { fehler: 'unvollstaendig' };
    await db.transaction(async (tx) => {
      await tx.update(w).set({ geprueft: true }).where(stelle);
      await protokolliere(
        {
          benutzerId: a.benutzerId,
          aktion: 'inhalt.geaendert',
          zielTyp: 'quran_wortzeit',
          zielId: `${kopf.id}:${sure.data}:${vers.data}`,
          details: { woerter: anzahl, geprueft: true },
        },
        tx,
      );
    });
    oeffentlichNeu(kopf.id, kopf.aktiv);
    refresh();
    return { gespeichert: Date.now() };
  });
}
