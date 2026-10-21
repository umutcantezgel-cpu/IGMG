'use server';

import { and, eq } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { db, schema, type Transaktion } from '@/lib/db';
import { istRichtung, type KursId, kursVonSlug, zerlegeRichtung } from '@/lib/lernapp/kurse';
import { alternativeZiel, ergaenzeAlternative, zerlegeMeldungsSchluessel } from '@/lib/lernapp/meldung';
import { inhaltHash } from '@/lib/lernapp/paket/hash';
import { type LernappZustand, mitLernappRecht, waechterBefund } from '@/lib/lernapp/verwaltung/aktion';
import { kursGeaendert, zieheZurueck } from '@/lib/lernapp/veroeffentlichen';
import { verweiseDerAufgabe } from '@/server/queries/lernapp/meldungen';

/**
 * Verwaltung › Lern-App › Meldungen (L3-06, ADR 0041 Nr. 9): Alternative ergänzen, Eintrag sperren, erledigen. Recht
 * `lernapp.bearbeiten`, Schalter `lernapp`. Eine ergänzte Alternative ist eine menschliche Korrektur: neuer Inhalts-Hash
 * (gleiche Berechnung wie der Import), `menschlichGeprueft` (ein KI-Import überschreibt sie nicht, ADR 0041 Nr. 6); der
 * Religionswächter prüft den Text (S-L1 M-3). Mit dem Erledigen wird die mitgeschickte Antwort geleert (ADR 0045,
 * Fortschreibung S3/S8 Nr. 8). Audit ohne Inhalte.
 */

const UUID = z.uuid();

async function ladeMeldung(id: unknown) {
  const p = UUID.safeParse(id);
  if (!p.success) return null;
  const [m] = await db.select().from(schema.lernappMeldung).where(eq(schema.lernappMeldung.id, p.data)).limit(1);
  if (!m) return null;
  const k = zerlegeMeldungsSchluessel(m.aufgabeSchluessel);
  return { ...m, k };
}

async function erledige(
  tx: Transaktion,
  meldungId: string,
  benutzerId: string,
  aktion: 'alternative' | 'gesperrt' | 'erledigt',
  kategorie: string,
  /** Schlüssel des gesperrten bzw. ergänzten Eintrags (kein Inhalt), damit das Audit ihn nachvollziehbar nennt */
  eintrag?: string,
) {
  await tx
    .update(schema.lernappMeldung)
    .set({ status: 'erledigt', antwort: null, erledigtAm: new Date(), erledigtVon: benutzerId })
    .where(eq(schema.lernappMeldung.id, meldungId));
  await protokolliere(
    {
      benutzerId,
      aktion: 'lernapp.meldung_bearbeitet',
      zielTyp: 'lernapp_meldung',
      zielId: meldungId,
      details: eintrag ? { aktion, kategorie, eintrag } : { aktion, kategorie },
    },
    tx,
  );
}

/** Meldung ohne Änderung erledigen. */
export async function meldungErledigen(_vorher: LernappZustand, fd: FormData): Promise<LernappZustand> {
  return mitLernappRecht('lernapp.bearbeiten', async (a) => {
    const m = await ladeMeldung(fd.get('id'));
    if (!m) return { fehler: 'nichtGefunden' };
    if (m.status === 'erledigt') return { gespeichert: Date.now() };
    await db.transaction((tx) => erledige(tx, m.id, a.benutzerId, 'erledigt', m.kategorie));
    refresh();
    return { gespeichert: Date.now() };
  });
}

/** Angenommene Alternative ergänzen (an der Aufgabe bzw. an der Übersetzung der Richtung) und die Meldung erledigen. */
export async function alternativeErgaenzen(_vorher: LernappZustand, fd: FormData): Promise<LernappZustand> {
  return mitLernappRecht('lernapp.bearbeiten', async (a) => {
    const m = await ladeMeldung(fd.get('id'));
    if (!m?.k) return { fehler: 'nichtGefunden' };
    const text = String(fd.get('alternative') ?? '');
    const werte = { alternative: text };
    const [aufgabe] = await db.select().from(schema.lernappAufgabe).where(eq(schema.lernappAufgabe.schluessel, m.k.aufgabe)).limit(1);
    if (!aufgabe) return { fehler: 'nichtGefunden' };
    const ziel = alternativeZiel({ ...aufgabe.daten, typ: aufgabe.typ });
    if (ziel.art === 'keine') return { fehler: 'keineAlternative' };
    const kurs = kursVonSlug(m.k.kurs) as KursId;

    if (ziel.art === 'aufgabe') {
      const vorhanden = Array.isArray(aufgabe.daten.alternativen) ? (aufgabe.daten.alternativen as string[]) : [];
      const neu = ergaenzeAlternative(vorhanden, text, { max: ziel.max, laenge: ziel.laenge });
      if (!neu.ok) return { fehler: 'pruefen', feldFehler: { alternative: `alternative_${neu.grund}` }, werte };
      const befund = waechterBefund(neu.liste.at(-1)!, aufgabe.religionsbezug);
      if (befund) return { fehler: 'pruefen', feldFehler: { alternative: `waechter_${befund}` }, werte };
      const daten = { ...aufgabe.daten, alternativen: neu.liste };
      const hash = inhaltHash({ schluessel: aufgabe.schluessel, typ: aufgabe.typ, daten });
      await db.transaction(async (tx) => {
        await tx
          .update(schema.lernappAufgabe)
          .set({ daten, inhaltHash: hash, menschlichGeprueft: true, verfasstVon: a.benutzerId })
          .where(eq(schema.lernappAufgabe.id, aufgabe.id));
        await erledige(tx, m.id, a.benutzerId, 'alternative', m.kategorie, aufgabe.schluessel);
      });
    } else {
      if (!istRichtung(m.k.kurs)) return { fehler: 'keineAlternative' };
      const sprache = zerlegeRichtung(m.k.kurs).ausgang;
      const [lemma] = await db
        .select({ id: schema.lernappLemma.id, religionsbezug: schema.lernappLemma.religionsbezug })
        .from(schema.lernappLemma)
        .where(eq(schema.lernappLemma.schluessel, ziel.bezug))
        .limit(1);
      const [satz] = lemma
        ? [undefined]
        : await db
            .select({ id: schema.lernappSatz.id, religionsbezug: schema.lernappSatz.religionsbezug })
            .from(schema.lernappSatz)
            .where(eq(schema.lernappSatz.schluessel, ziel.bezug))
            .limit(1);
      const u = schema.lernappUebersetzung;
      const bezugBedingung = lemma ? eq(u.lemmaId, lemma.id) : satz ? eq(u.satzId, satz.id) : null;
      if (!bezugBedingung) return { fehler: 'nichtGefunden' };
      const [ue] = await db
        .select()
        .from(u)
        .where(and(eq(u.sprache, sprache), bezugBedingung))
        .limit(1);
      if (!ue) return { fehler: 'nichtGefunden' };
      const neu = ergaenzeAlternative(ue.alternativen, text, { haupt: ue.text, max: ziel.max, laenge: ziel.laenge });
      if (!neu.ok) return { fehler: 'pruefen', feldFehler: { alternative: `alternative_${neu.grund}` }, werte };
      const befund = waechterBefund(neu.liste.at(-1)!, ue.religionsbezug || Boolean((lemma ?? satz)?.religionsbezug));
      if (befund) return { fehler: 'pruefen', feldFehler: { alternative: `waechter_${befund}` }, werte };
      // gleiche Felder wie der Import (inhalt/import.ts)
      const hash = inhaltHash({
        bezug: ziel.bezug,
        sprache,
        text: ue.text,
        alternativen: neu.liste,
        religionsbezug: ue.religionsbezug,
        quelle: ue.quelle,
        lizenz: ue.lizenz,
        namensnennung: ue.namensnennung,
      });
      await db.transaction(async (tx) => {
        await tx
          .update(u)
          .set({ alternativen: neu.liste, inhaltHash: hash, menschlichGeprueft: true, verfasstVon: a.benutzerId })
          .where(eq(u.id, ue.id));
        await erledige(tx, m.id, a.benutzerId, 'alternative', m.kategorie, ziel.bezug);
      });
    }
    await kursGeaendert([kurs]);
    refresh();
    return { gespeichert: Date.now() };
  });
}

/**
 * Eintrag sperren (Status `gesperrt`, sofort nicht mehr ausgeliefert): die Aufgabe selbst oder einer ihrer Verweise. Nur
 * mit ausdrücklicher Bestätigung (Feld `bestaetigt=1`, zweiter Schritt des Knopfs); das Audit nennt den Schlüssel.
 */
export async function eintragSperren(_vorher: LernappZustand, fd: FormData): Promise<LernappZustand> {
  return mitLernappRecht('lernapp.bearbeiten', async (a) => {
    const m = await ladeMeldung(fd.get('id'));
    if (!m?.k) return { fehler: 'nichtGefunden' };
    if (fd.get('bestaetigt') !== '1') return { fehler: 'bestaetigen' };
    const ziel = String(fd.get('ziel') ?? '');
    const [aufgabe] = await db.select().from(schema.lernappAufgabe).where(eq(schema.lernappAufgabe.schluessel, m.k.aufgabe)).limit(1);
    if (!aufgabe) return { fehler: 'nichtGefunden' };
    let getroffen = false;
    if (ziel === aufgabe.schluessel) getroffen = await zieheZurueck('aufgabe', aufgabe.schluessel);
    else {
      // nur Einträge, auf die die gemeldete Aufgabe verweist
      if (!verweiseDerAufgabe(aufgabe).includes(ziel)) return { fehler: 'nichtGefunden' };
      const [lemma] = await db
        .select({ id: schema.lernappLemma.id })
        .from(schema.lernappLemma)
        .where(eq(schema.lernappLemma.schluessel, ziel))
        .limit(1);
      getroffen = await zieheZurueck(lemma ? 'lemma' : 'satz', ziel);
    }
    if (!getroffen) return { fehler: 'nichtGefunden' };
    await db.transaction((tx) => erledige(tx, m.id, a.benutzerId, 'gesperrt', m.kategorie, ziel));
    refresh();
    return { gespeichert: Date.now() };
  });
}
