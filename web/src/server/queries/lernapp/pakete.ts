import 'server-only';
import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { datenbankVerfuegbar, ohneLaufzeitDatenbank } from '@/lib/db/verfuegbar';
import { funktionAn } from '@/lib/funktionen';
import { clipZulaessig, istTestQuelle } from '@/lib/lernapp/audio/stimmen';
import { FORMELLISTE_ID, FORMELN, formellisteFrei } from '@/lib/lernapp/formelliste';
import { type Pruefung, sprachlichGesperrt } from '@/lib/lernapp/freigabe';
import { AufgabeVorlageSchema, verweiseVon } from '@/lib/lernapp/inhalt/schema';
import {
  istRichtung,
  type KursSlug,
  kursArt,
  kursVonSlug,
  type RichtungId,
  RICHTUNGEN,
  SPRACH_STUFEN,
  type Sprache,
  zerlegeRichtung,
} from '@/lib/lernapp/kurse';
import {
  type BauAudio,
  type BauEingabe,
  type BauEintrag,
  type BauErgebnis,
  type BauLektion,
  type BauUebersetzung,
  baueEinheit,
  baueVerzeichnis,
} from '@/lib/lernapp/paket/bauen';
import { buendelAdresse } from '@/lib/lernapp/paket/buendel';
import type { Verzeichnis } from '@/lib/lernapp/paket/typen';
import { inBloecken, textHashGemerkt } from './bloecke';

/**
 * Kurspakete aus der Datenbank (ADR 0039 Nr. 1/2, PLAN §3.10). Gecacht mit `'use cache: remote'`, `cacheLife('max')` und
 * den Tags `TAG.lernapp` und `TAG.lernappKurs(<kurs der Datenbank>)` – jede Freigabe, Veröffentlichung und jedes
 * Zurückziehen ruft `updateTag(TAG.lernappKurs(id))` (KERN 4.0 §2.3), der Import wirkt über den Bau bzw. den Start
 * (`TAG.lernapp` in `START_TAGS`). Schalter `lernapp` aus → null (Route 404); `lernapp_ungeprueft` steuert, ob Einträge
 * ohne bestandene Stichprobe mit Hinweis ausgeliefert werden (ADR 0041 Nr. 8).
 */

const STIMMEN_VORRANG = ['mensch:', 'tts:', 'test:'];
const vorrang = (stimme: string) => {
  const i = STIMMEN_VORRANG.findIndex((p) => stimme.startsWith(p));
  return i < 0 ? STIMMEN_VORRANG.length : i;
};

type InhaltTyp = (typeof schema.lernappInhaltTypEnum.enumValues)[number];

/** Prüfungen je Baustein (`<typ>:<id>`), ergänzt um die aktuellen Rollen der Prüfenden (freigabe.ts); in Blöcken. */
export async function ladePruefungen(ids: readonly { typ: InhaltTyp; id: string }[]): Promise<Map<string, Pruefung[]>> {
  const ergebnis = new Map<string, Pruefung[]>();
  if (!ids.length) return ergebnis;
  const zeilen = await inBloecken(
    ids.map((x) => x.id),
    (block) =>
      db
        .select({
          inhaltTyp: schema.lernappPruefung.inhaltTyp,
          inhaltId: schema.lernappPruefung.inhaltId,
          inhaltHash: schema.lernappPruefung.inhaltHash,
          art: schema.lernappPruefung.art,
          pruefendeId: schema.lernappPruefung.pruefendeId,
          urteil: schema.lernappPruefung.urteil,
          kategorie: schema.lernappPruefung.kategorie,
          belegeGeprueft: schema.lernappPruefung.belegeGeprueft,
          am: schema.lernappPruefung.am,
        })
        .from(schema.lernappPruefung)
        .where(inArray(schema.lernappPruefung.inhaltId, block)),
  );
  if (!zeilen.length) return ergebnis;
  const personen = zeilen.flatMap((z) => (z.pruefendeId ? [z.pruefendeId] : []));
  const rollen = new Map<string, string[]>();
  for (const r of await inBloecken(personen, (block) =>
    db
      .select({ benutzerId: schema.rolleZuweisung.benutzerId, rolle: schema.rolleZuweisung.rolle })
      .from(schema.rolleZuweisung)
      .where(inArray(schema.rolleZuweisung.benutzerId, block)),
  ))
    rollen.set(r.benutzerId, [...(rollen.get(r.benutzerId) ?? []), r.rolle]);
  for (const z of zeilen) {
    const k = `${z.inhaltTyp}:${z.inhaltId}`;
    ergebnis.set(k, [
      ...(ergebnis.get(k) ?? []),
      {
        pruefendeId: z.pruefendeId,
        pruefendeRollen: z.pruefendeId ? (rollen.get(z.pruefendeId) ?? []) : [],
        art: z.art,
        urteil: z.urteil,
        inhaltHash: z.inhaltHash,
        kategorie: z.kategorie,
        belegeGeprueft: z.belegeGeprueft,
        am: z.am,
      },
    ]);
  }
  return ergebnis;
}

/**
 * Sprecherinnen und Sprecher der Clips `mensch:<id>` mit hinterlegter Vereinbarung (ADR 0029 Nr. 4): Medium der Vereinbarung
 * nicht im Papierkorb, die Stimme passt zur Spalte `sprecherId`. Nur ihre Aufnahmen werden ausgeliefert (`clipZulaessig`).
 */
export async function sprecherMitVereinbarung(clips: readonly { stimme: string; sprecherId: string | null }[]): Promise<Set<string>> {
  const ids = [...new Set(clips.flatMap((c) => (c.sprecherId && c.stimme === `mensch:${c.sprecherId}` ? [c.sprecherId] : [])))];
  const zeilen = await inBloecken(ids, (block) =>
    db
      .select({ id: schema.lernappSprecher.id })
      .from(schema.lernappSprecher)
      .innerJoin(schema.medium, eq(schema.medium.id, schema.lernappSprecher.vereinbarungMediumId))
      .where(and(inArray(schema.lernappSprecher.id, block), isNull(schema.medium.imPapierkorbSeit))),
  );
  return new Set(zeilen.map((z) => z.id));
}

/**
 * Bausteine einer Richtung aus der Datenbank (ohne Cache; Tests und die gecachten Funktionen unten). Ohne `einheit` alle
 * Einheiten des Kurses. Leer, wenn Kurs oder Richtung nicht aktiv sind.
 */
export async function ladeBauEingaben(richtung: RichtungId, einheit?: string): Promise<BauEingabe[]> {
  const { ziel, ausgang } = zerlegeRichtung(richtung);
  const [kurs] = await db
    .select({ aktiv: schema.lernappKurs.aktiv, richtungAktiv: schema.lernappRichtung.aktiv })
    .from(schema.lernappKurs)
    .innerJoin(schema.lernappRichtung, eq(schema.lernappRichtung.kursId, schema.lernappKurs.id))
    .where(and(eq(schema.lernappKurs.id, ziel), eq(schema.lernappRichtung.id, richtung)));
  if (!kurs?.aktiv || !kurs.richtungAktiv) return [];

  const einheiten = await db
    .select({
      id: schema.lernappEinheit.id,
      schluessel: schema.lernappEinheit.schluessel,
      stufe: schema.lernappAbschnitt.stufe,
      reihenfolge: schema.lernappEinheit.reihenfolge,
      thema: schema.lernappEinheit.thema,
      symbol: schema.lernappEinheit.symbol,
      nurFuerAusgang: schema.lernappEinheit.nurFuerAusgang,
      status: schema.lernappEinheit.status,
      inhaltHash: schema.lernappEinheit.inhaltHash,
      verfasstVon: schema.lernappEinheit.verfasstVon,
    })
    .from(schema.lernappEinheit)
    .innerJoin(schema.lernappAbschnitt, eq(schema.lernappAbschnitt.id, schema.lernappEinheit.abschnittId))
    .where(and(eq(schema.lernappAbschnitt.kursId, ziel), einheit ? eq(schema.lernappEinheit.schluessel, einheit) : undefined))
    .orderBy(asc(schema.lernappAbschnitt.reihenfolge), asc(schema.lernappEinheit.reihenfolge), asc(schema.lernappEinheit.schluessel));
  if (!einheiten.length) return [];
  const einheitIds = einheiten.map((e) => e.id);

  const nachReihe = <T extends { reihenfolge: number; schluessel: string }>(liste: T[]) =>
    liste.sort((a, b) => a.reihenfolge - b.reihenfolge || (a.schluessel < b.schluessel ? -1 : a.schluessel > b.schluessel ? 1 : 0));
  // alle Abfragen über Listen in Blöcken (Parametergrenze); die Reihenfolge stellt die Sortierung danach her
  const lektionen = nachReihe(
    await inBloecken(einheitIds, (block) => db.select().from(schema.lernappLektion).where(inArray(schema.lernappLektion.einheitId, block))),
  );
  const aufgaben = nachReihe(
    await inBloecken(
      lektionen.map((l) => l.id),
      (block) => db.select().from(schema.lernappAufgabe).where(inArray(schema.lernappAufgabe.lektionId, block)),
    ),
  );

  // Verweise der Aufgaben (Lemmata und Sätze, auch aus früheren Einheiten)
  const verweise = new Map<string, Set<string>>();
  const lektionEinheit = new Map(lektionen.map((l) => [l.id, l.einheitId]));
  for (const a of aufgaben) {
    const v = AufgabeVorlageSchema.safeParse({ ...(a.daten as object), schluessel: a.schluessel, typ: a.typ });
    if (!v.success) continue;
    const e = lektionEinheit.get(a.lektionId)!;
    const menge = verweise.get(e) ?? new Set<string>();
    for (const s of verweiseVon(v.data)) menge.add(s);
    verweise.set(e, menge);
  }
  const alleVerweise = [...new Set([...verweise.values()].flatMap((m) => [...m]))];
  const [lemmata, saetze] = await Promise.all([
    inBloecken(alleVerweise, (block) =>
      db
        .select()
        .from(schema.lernappLemma)
        .where(and(eq(schema.lernappLemma.kursId, ziel), inArray(schema.lernappLemma.schluessel, block))),
    ),
    inBloecken(alleVerweise, (block) =>
      db
        .select()
        .from(schema.lernappSatz)
        .where(and(eq(schema.lernappSatz.kursId, ziel), inArray(schema.lernappSatz.schluessel, block))),
    ),
  ]);
  const u = schema.lernappUebersetzung;
  const uebersetzungen = [
    ...(await inBloecken(
      lemmata.map((l) => l.id),
      (block) =>
        db
          .select()
          .from(u)
          .where(and(eq(u.sprache, ausgang), inArray(u.lemmaId, block))),
    )),
    ...(await inBloecken(
      saetze.map((s) => s.id),
      (block) =>
        db
          .select()
          .from(u)
          .where(and(eq(u.sprache, ausgang), inArray(u.satzId, block))),
    )),
  ];
  const tipps = nachReihe(
    await inBloecken(einheitIds, (block) =>
      db
        .select()
        .from(schema.lernappTipp)
        .where(and(inArray(schema.lernappTipp.einheitId, block), eq(schema.lernappTipp.ausgangssprache, ausgang))),
    ),
  );

  const pruefungen = await ladePruefungen([
    ...einheiten.map((x) => ({ typ: 'einheit' as const, id: x.id })),
    ...lektionen.map((x) => ({ typ: 'lektion' as const, id: x.id })),
    ...aufgaben.map((x) => ({ typ: 'aufgabe' as const, id: x.id })),
    ...lemmata.map((x) => ({ typ: 'lemma' as const, id: x.id })),
    ...saetze.map((x) => ({ typ: 'satz' as const, id: x.id })),
    ...uebersetzungen.map((x) => ({ typ: 'uebersetzung' as const, id: x.id })),
    ...tipps.map((x) => ({ typ: 'tipp' as const, id: x.id })),
  ]);
  const p = (typ: InhaltTyp, id: string) => pruefungen.get(`${typ}:${id}`) ?? [];

  const eintraege = new Map<string, BauEintrag>();
  for (const l of lemmata)
    eintraege.set(l.schluessel, {
      art: 'lemma',
      schluessel: l.schluessel,
      text: l.lemma,
      symbol: l.symbol,
      quelle: l.quelle,
      lizenz: l.lizenz,
      namensnennung: l.namensnennung,
      status: l.status,
      inhaltHash: l.inhaltHash,
      religionsbezug: l.religionsbezug,
      verfasstVon: l.verfasstVon,
      pruefungen: p('lemma', l.id),
    });
  for (const s of saetze)
    eintraege.set(s.schluessel, {
      art: 'satz',
      schluessel: s.schluessel,
      text: s.text,
      quelle: s.quelle,
      lizenz: s.lizenz,
      namensnennung: s.namensnennung,
      status: s.status,
      inhaltHash: s.inhaltHash,
      religionsbezug: s.religionsbezug,
      verfasstVon: s.verfasstVon,
      pruefungen: p('satz', s.id),
    });
  const schluesselVonId = new Map([
    ...lemmata.map((l) => [l.id, l.schluessel] as const),
    ...saetze.map((s) => [s.id, s.schluessel] as const),
  ]);
  const uebersetzungJe = new Map<string, BauUebersetzung>();
  for (const u of uebersetzungen) {
    const bezug = schluesselVonId.get(u.lemmaId ?? u.satzId ?? '');
    if (!bezug) continue;
    uebersetzungJe.set(bezug, {
      bezug,
      text: u.text,
      alternativen: u.alternativen,
      quelle: u.quelle,
      lizenz: u.lizenz,
      namensnennung: u.namensnennung,
      status: u.status,
      inhaltHash: u.inhaltHash,
      religionsbezug: u.religionsbezug,
      verfasstVon: u.verfasstVon,
      pruefungen: p('uebersetzung', u.id),
    });
  }

  // Audio (Z-L15, Z-L20, Z-L21): nur Zieltexte ohne Religionsbezug, je Text die Stimme mit Vorrang (Mensch vor Sprachausgabe
  // vor Testton) unter den zulässigen (`clipZulaessig`): Testtöne nur für Einträge des Testkurses (Quelle `test:…`),
  // Sprachausgabe für echte Einträge nur mit freigegebener Stimme (Hörabnahme bestanden), menschliche Aufnahmen nur mit
  // hinterlegter Vereinbarung. Die Clips hängen am Text-Hash; ein echter Eintrag mit demselben Text wie ein Eintrag des
  // Testkurses bekommt deshalb nie dessen Testton (Stufe C, L15-1).
  const hashes = [...new Set([...eintraege.values()].filter((e) => !e.religionsbezug).map((e) => textHashGemerkt(e.text)))];
  const [alleClips, wahlen] = await Promise.all([
    inBloecken(hashes, (block) =>
      db
        .select()
        .from(schema.lernappAudio)
        .where(and(eq(schema.lernappAudio.sprache, ziel), inArray(schema.lernappAudio.textHash, block))),
    ),
    // Wahl im Audio-Studio (L3-06): „Sprachausgabe“ liefert eine vorhandene menschliche Aufnahme nicht aus
    inBloecken(hashes, (block) =>
      db
        .select({ textHash: schema.lernappAudioWahl.textHash, wahl: schema.lernappAudioWahl.wahl })
        .from(schema.lernappAudioWahl)
        .where(and(eq(schema.lernappAudioWahl.sprache, ziel), inArray(schema.lernappAudioWahl.textHash, block))),
    ),
  ]);
  const ohneMensch = new Set(wahlen.filter((w) => w.wahl === 'sprachausgabe').map((w) => w.textHash));
  // Audio-Stichprobe (ADR 0041 Nr. 2, PLAN §6.5): „abgelehnt“ oder kritisch (z. B. falsche Aussprache) zum aktuellen
  // Inhalts-Hash des Clips verbirgt ihn sofort; dann greift die nächste Stimme oder „Audio folgt“.
  const clipPruefungen = await ladePruefungen(alleClips.map((c) => ({ typ: 'audio' as const, id: c.id })));
  const clips = alleClips.filter(
    (c) =>
      !(ohneMensch.has(c.textHash) && c.stimme.startsWith('mensch:')) &&
      !sprachlichGesperrt(c.sha256, clipPruefungen.get(`audio:${c.id}`) ?? []),
  );
  const vereinbarung = await sprecherMitVereinbarung(clips);
  const buendelNamen = [...new Set(clips.map((c) => c.buendel))];
  const groessen = new Map<string, number>(
    (
      await inBloecken(buendelNamen, (block) =>
        db
          .select({
            buendel: schema.lernappAudio.buendel,
            bytes: sql<number>`max(${schema.lernappAudio.versatz} + ${schema.lernappAudio.laenge})`,
          })
          .from(schema.lernappAudio)
          .where(and(eq(schema.lernappAudio.sprache, ziel), inArray(schema.lernappAudio.buendel, block)))
          .groupBy(schema.lernappAudio.buendel),
      )
    ).map((z) => [z.buendel, Number(z.bytes)]),
  );
  const nachVorrang = [...clips].sort((a, b) => vorrang(a.stimme) - vorrang(b.stimme) || (a.stimme < b.stimme ? -1 : 1));
  /** Clip je Text-Hash für echte Einträge bzw. für Einträge des Testkurses. */
  const audioFuer = (testinhalt: boolean) => {
    const audio = new Map<string, BauAudio>();
    for (const c of nachVorrang) {
      if (audio.has(c.textHash) || !clipZulaessig(c.stimme, { sprache: ziel, testinhalt, vereinbarung })) continue;
      audio.set(c.textHash, {
        adresse: buendelAdresse(ziel, c.buendel),
        buendelBytes: groessen.get(c.buendel) ?? c.versatz + c.laenge,
        versatz: c.versatz,
        laenge: c.laenge,
        dauerMs: c.dauerMs,
        stimme: c.stimme,
      });
    }
    return audio;
  };
  const audioEcht = audioFuer(false);
  const audioTest = audioFuer(true);

  return einheiten.map((e) => {
    const eigene = verweise.get(e.id) ?? new Set<string>();
    const nur = <T>(m: ReadonlyMap<string, T>) => new Map([...m].filter(([k]) => eigene.has(k)));
    const bauLektionen: BauLektion[] = lektionen
      .filter((l) => l.einheitId === e.id)
      .map((l) => ({
        schluessel: l.schluessel,
        art: l.art,
        ziel: l.ziel,
        status: l.status,
        inhaltHash: l.inhaltHash,
        religionsbezug: false,
        verfasstVon: l.verfasstVon,
        pruefungen: p('lektion', l.id),
        aufgaben: aufgaben
          .filter((a) => a.lektionId === l.id)
          .map((a) => ({
            schluessel: a.schluessel,
            typ: a.typ,
            daten: a.daten,
            status: a.status,
            inhaltHash: a.inhaltHash,
            religionsbezug: a.religionsbezug,
            verfasstVon: a.verfasstVon,
            pruefungen: p('aufgabe', a.id),
          })),
      }));
    const eigeneEintraege = nur(eintraege);
    const hashesVon = (test: boolean) =>
      new Set([...eigeneEintraege.values()].filter((x) => istTestQuelle(x.quelle) === test).map((x) => textHashGemerkt(x.text)));
    const echteHashes = hashesVon(false);
    const testHashes = hashesVon(true);
    return {
      richtung,
      einheit: {
        schluessel: e.schluessel,
        stufe: e.stufe,
        reihenfolge: e.reihenfolge,
        thema: e.thema,
        symbol: e.symbol,
        nurFuerAusgang: e.nurFuerAusgang,
        status: e.status,
        inhaltHash: e.inhaltHash,
        religionsbezug: false,
        verfasstVon: e.verfasstVon,
        pruefungen: p('einheit', e.id),
      },
      lektionen: bauLektionen,
      eintraege: eigeneEintraege,
      uebersetzungen: nur(uebersetzungJe),
      tipps: tipps
        .filter((t) => t.einheitId === e.id)
        .map((t) => ({
          schluessel: t.schluessel,
          titel: t.titel,
          inhalt: t.inhalt as BauEingabe['tipps'][number]['inhalt'],
          status: t.status,
          inhaltHash: t.inhaltHash,
          religionsbezug: t.religionsbezug,
          verfasstVon: t.verfasstVon,
          pruefungen: p('tipp', t.id),
        })),
      // gleicher Text in einem echten und einem Test-Eintrag derselben Einheit: es gilt die strengere Regel (echt)
      audio: new Map([
        ...[...audioTest].filter(([h]) => testHashes.has(h) && !echteHashes.has(h)),
        ...[...audioEcht].filter(([h]) => echteHashes.has(h)),
      ]),
    };
  });
}

/**
 * Formelliste freigegeben (KERN 4.0 §2.3, LM-09; `formelliste.ts`)? Zwei religiöse Freigaben zum aktuellen Stand der Liste
 * und Status „freigegeben“ im Leitfaden. Sonst bleiben alle Einträge mit Religionsbezug verborgen.
 */
export async function formellisteFreigegeben(): Promise<boolean> {
  const p = await ladePruefungen([{ typ: 'formelliste', id: FORMELLISTE_ID }]);
  return formellisteFrei(FORMELN, p.get(`formelliste:${FORMELLISTE_ID}`) ?? []);
}

/** Alle ausgelieferten Einheiten einer Richtung (bzw. eine). */
export async function baueRichtung(richtung: RichtungId, ungeprueftZeigen: boolean, einheit?: string): Promise<BauErgebnis[]> {
  const [eingaben, frei] = await Promise.all([ladeBauEingaben(richtung, einheit), formellisteFreigegeben()]);
  return eingaben.flatMap((e) => {
    const r = baueEinheit(e, { ungeprueftZeigen, formellisteFrei: frei });
    return r ? [r] : [];
  });
}

/** Kursverzeichnis ungecacht (Tests). Wissen und Koran-Arabisch liefern bis L6 keine Einheiten (nichts ohne zwei Freigaben). */
export async function verzeichnisVon(kurs: KursSlug, ungeprueftZeigen: boolean): Promise<Verzeichnis> {
  const kursId = kursVonSlug(kurs);
  const [zeile] = await db
    .select({ version: schema.lernappKurs.version })
    .from(schema.lernappKurs)
    .where(eq(schema.lernappKurs.id, kursId));
  const richtung = istRichtung(kurs) ? zerlegeRichtung(kurs) : null;
  const zielsprache: Sprache = richtung ? richtung.ziel : kursId === 'koran' ? 'ar' : 'de';
  return baueVerzeichnis({
    kurs,
    kursId,
    zielsprache,
    ausgangssprache: richtung?.ausgang ?? null,
    stand: zeile?.version ?? 0,
    einheiten: istRichtung(kurs) && kursArt(kursId) === 'sprache' ? await baueRichtung(kurs, ungeprueftZeigen) : [],
    stufenFolge: SPRACH_STUFEN,
  });
}

/**
 * Kursverzeichnis als JSON (gecacht); null, wenn die Lern-App aus ist. Der Tag `einstellungen` lässt den Eintrag verfallen,
 * sobald ein Schalter (`lernapp`, `lernapp_ungeprueft`) in der Datenbank wechselt (S-L1 N-3).
 */
export async function ladeVerzeichnisJson(kurs: KursSlug): Promise<string | null> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.lernapp, TAG.lernappKurs(kursVonSlug(kurs)), TAG.einstellungen);
  if (!(await funktionAn('lernapp')) || !datenbankVerfuegbar()) return null;
  return JSON.stringify(await verzeichnisVon(kurs, await funktionAn('lernapp_ungeprueft')));
}

/** Einheitenpaket als kanonisches JSON mit Hash (gecacht); null, wenn aus, unbekannt oder nicht ausgeliefert. */
export async function ladeEinheitJson(kurs: RichtungId, einheit: string): Promise<{ hash: string; json: string } | null> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.lernapp, TAG.lernappKurs(kursVonSlug(kurs)), TAG.einstellungen);
  if (!(await funktionAn('lernapp')) || !datenbankVerfuegbar()) return null;
  const [r] = await baueRichtung(kurs, await funktionAn('lernapp_ungeprueft'), einheit);
  return r ? { hash: r.hash, json: r.json } : null;
}

export type PaketParameter = { kurs: string; einheit: string; hash: string };

/**
 * Parameter der Einheitenpakete für `generateStaticParams`: im Beispielmodus ohne Laufzeit-Datenbank alle (ADR 0039 Nr. 2),
 * sonst je Richtung die erste Einheit (Cache Components verlangt mindestens einen Parameter; der Rest entsteht bei Bedarf).
 * Ohne Inhalte ein Platzhalter, der 404 ergibt.
 */
export async function ladePaketParameter(): Promise<PaketParameter[]> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.lernapp);
  const alle = ohneLaufzeitDatenbank();
  const liste: PaketParameter[] = [];
  if (datenbankVerfuegbar() && (await funktionAn('lernapp'))) {
    const ungeprueft = await funktionAn('lernapp_ungeprueft');
    for (const r of RICHTUNGEN) {
      const gebaut = await baueRichtung(r, ungeprueft);
      const auswahl = alle ? gebaut : gebaut.slice(0, 1);
      liste.push(...auswahl.map((x) => ({ kurs: r, einheit: x.paket.einheit.schluessel, hash: x.hash })));
    }
  }
  return liste.length ? liste : [{ kurs: RICHTUNGEN[0], einheit: `${zerlegeRichtung(RICHTUNGEN[0]).ziel}.a1.e00`, hash: '0'.repeat(64) }];
}
