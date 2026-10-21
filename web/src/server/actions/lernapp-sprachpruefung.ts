'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { FEHLER, istKritisch } from '@/lib/lernapp/freigabe';
import { istRichtung, type KursId, type RichtungId, SPRACHEN, type Sprache, zerlegeRichtung } from '@/lib/lernapp/kurse';
import {
  einlaufAktiv,
  entscheide,
  pruefSprache,
  STICHPROBE_ARTEN,
  stichprobenGroesse,
  stichprobenSaat,
  werteAus,
  ziehe,
} from '@/lib/lernapp/stichprobe';
import { type LernappZustand, mitLernappRecht, waechterBefund } from '@/lib/lernapp/verwaltung/aktion';
import { kursGeaendert } from '@/lib/lernapp/veroeffentlichen';
import { darf, darfSprachePruefen, type RollenZuweisung } from '@/lib/rechte/matrix';
import { gemeldeteEintraege } from '@/server/queries/lernapp/meldungen';
import {
  anzahlStichproben,
  bisherigeEntscheidungen,
  kandidaten,
  ladeEinheit,
  ladePruefSprachen,
  ladeStichprobeKopf,
  ladeStichprobenEintraege,
  standVon,
  type StichprobeKopf,
} from '@/server/queries/lernapp/sprachpruefung';

/**
 * Verwaltung › Lern-App › Sprachprüfung (L3-06, ADR 0041 Nr. 3–5/10): Stichprobe ziehen, Eintrag beurteilen, Prüfsprachen
 * setzen. Jede Action prüft Datenbank, Sitzung mit zweitem Faktor, Recht und Schalter `lernapp` (`mitLernappRecht`) und
 * zusätzlich die Prüfsprache (`darfSprachePruefen`, auch für die Administration). Audit ohne Inhalte (nur Kennungen,
 * Art, Urteil, Zahlen). Ein kritisches Urteil verbirgt den Eintrag sofort (Kursstand + Cache-Tag); eine bestandene
 * Stichprobe veröffentlicht die geprüften Einträge der Einheit (ADR 0041 Nr. 2).
 */

const UUID = z.uuid();
const Art = z.enum(STICHPROBE_ARTEN);

async function darfFuer(a: { benutzerId: string; rollen: RollenZuweisung[] }, sprache: Sprache): Promise<boolean> {
  return darfSprachePruefen(a.rollen, await ladePruefSprachen(a.benutzerId), sprache);
}

/** Stichprobe für Einheit, Art und Richtung ziehen (Prüfende der Sprache oder Redaktion mit `lernapp.bearbeiten`). */
export async function stichprobeZiehen(_vorher: LernappZustand, fd: FormData): Promise<LernappZustand> {
  return mitLernappRecht('lernapp.lesen', async (a) => {
    const art = Art.safeParse(fd.get('art'));
    const richtungRoh = fd.get('richtung');
    const richtung: RichtungId | null = istRichtung(richtungRoh) ? richtungRoh : null;
    const einheit = await ladeEinheit(String(fd.get('einheit') ?? ''));
    if (!art.success || !einheit || !(SPRACHEN as readonly string[]).includes(einheit.kurs)) return { fehler: 'nichtGefunden' };
    const ziel = einheit.kurs as Sprache;
    if (art.data === 'uebersetzung' && (!richtung || zerlegeRichtung(richtung).ziel !== ziel)) return { fehler: 'nichtGefunden' };
    if (art.data !== 'uebersetzung' && richtung) return { fehler: 'nichtGefunden' };
    const sprache = pruefSprache(art.data, ziel, richtung ? zerlegeRichtung(richtung).ausgang : null);
    if (!darf(a.rollen, 'lernapp.bearbeiten') && !(await darfFuer(a, sprache))) return { fehler: 'keinRecht' };

    const k = await kandidaten(einheit.schluessel, art.data, richtung);
    if (!k.length) return { fehler: 'keineKandidaten' };
    const stand = standVon(k);
    const s = schema.lernappStichprobe;
    const vorhanden = await db
      .select({ entscheidung: s.entscheidung, einheitHash: s.einheitHash })
      .from(s)
      .where(and(eq(s.einheitId, einheit.id), eq(s.art, art.data), richtung ? eq(s.richtungId, richtung) : undefined));
    if (vorhanden.some((x) => x.entscheidung === 'offen')) return { fehler: 'offen' };
    if (vorhanden.some((x) => x.einheitHash === stand)) return { fehler: 'schonGezogen' };

    const einlauf = einlaufAktiv(await bisherigeEntscheidungen(sprache, art.data));
    const groesse = stichprobenGroesse({ art: art.data, sprache, einlauf, gesamt: k.length });
    const runde = (await anzahlStichproben(einheit.id, art.data, richtung)) + 1;
    const saat = stichprobenSaat({ einheit: einheit.schluessel, art: art.data, richtung, einheitHash: stand, runde });
    const gemeldet = await gemeldeteEintraege(einheit.schluessel, art.data, richtung);
    const auswahl = ziehe(
      k.map((x) => x.schluessel),
      { saat, groesse, gemeldet },
    );
    const id = await db.transaction(async (tx) => {
      const [neu] = await tx
        .insert(s)
        .values({
          einheitId: einheit.id,
          sprache,
          richtungId: richtung,
          art: art.data,
          einlauf,
          seed: saat,
          groesse: auswahl.length,
          auswahl,
          einheitHash: stand,
        })
        .returning({ id: s.id });
      await protokolliere(
        {
          benutzerId: a.benutzerId,
          aktion: 'lernapp.stichprobe_gezogen',
          zielTyp: 'lernapp_stichprobe',
          zielId: neu!.id,
          details: { einheit: einheit.schluessel, art: art.data, richtung, groesse: auswahl.length, kandidaten: k.length, einlauf },
        },
        tx,
      );
      return neu!.id;
    });
    // Kein `refresh()`: Die Oberfläche öffnet die neue Stichprobe sofort (ZiehenKnopf); ein Auffrischen der Warteschlange
    // ersetzte den Knopf vorher durch „Stichprobe öffnen“ und verlöre die Weiterleitung.
    return { gespeichert: Date.now(), id };
  });
}

const Urteil = z.enum(['ok', 'korrektur', 'abgelehnt']);
const Kategorie = z.enum(FEHLER);

/**
 * Entscheidung, sobald alle gezogenen Einträge ein Urteil zum aktuellen Hash haben: Annahmeregel; „bestanden“
 * veröffentlicht Einheit, Lektionen, Aufgaben und die geprüften Einträge (Zieltext) bzw. die Übersetzungen der Richtung.
 */
async function entscheideWennFertig(k: StichprobeKopf, benutzerId: string): Promise<'offen' | 'bestanden' | 'nachbessern'> {
  const eintraege = await ladeStichprobenEintraege(k);
  const bewertbar = eintraege.filter((e) => !e.fehlt);
  const urteile = bewertbar.flatMap((e) =>
    e.urteil ? [{ urteil: e.urteil.urteil, kategorie: (e.urteil.kategorie as (typeof FEHLER)[number] | null) ?? null }] : [],
  );
  const ergebnis = werteAus(urteile);
  const entscheidung = entscheide(ergebnis, bewertbar.length);
  if (entscheidung === 'offen') return entscheidung;
  const kurs = k.kurs as KursId;
  // Vor der Transaktion lesen: eine Abfrage über `db` innerhalb von `db.transaction` wartet bei einer einzelnen
  // Verbindung (PGlite, kleiner Pool) auf die Transaktion selbst.
  const alle = entscheidung === 'bestanden' ? await kandidaten(k.einheit, k.art, k.richtungId) : [];
  await db.transaction(async (tx) => {
    const s = schema.lernappStichprobe;
    await tx
      .update(s)
      .set({ entscheidung, ergebnis, entschiedenAm: new Date(), entschiedenVon: benutzerId })
      .where(and(eq(s.id, k.id), eq(s.entscheidung, 'offen')));
    if (entscheidung === 'bestanden') {
      // Nur, wenn sich der Inhalt seit dem Ziehen nicht geändert hat (sonst neu ziehen, ADR 0041 Nr. 7)
      if (standVon(alle) === k.einheitHash) {
        const ids = (typ: string) => alle.filter((x) => x.inhaltTyp === typ && x.status === 'automatisch_geprueft').map((x) => x.inhaltId);
        const offen = (t: typeof schema.lernappSatz | typeof schema.lernappLemma | typeof schema.lernappUebersetzung, liste: string[]) =>
          liste.length
            ? tx
                .update(t)
                .set({ status: 'veroeffentlicht' })
                .where(and(inArray(t.id, liste), eq(t.status, 'automatisch_geprueft')))
            : null;
        if (k.art === 'zieltext') {
          await offen(schema.lernappLemma, ids('lemma'));
          await offen(schema.lernappSatz, ids('satz'));
          const einheit = schema.lernappEinheit;
          await tx
            .update(einheit)
            .set({ status: 'veroeffentlicht' })
            .where(and(eq(einheit.id, k.einheitId), eq(einheit.status, 'automatisch_geprueft')));
          const lektionen = await tx
            .update(schema.lernappLektion)
            .set({ status: 'veroeffentlicht' })
            .where(and(eq(schema.lernappLektion.einheitId, k.einheitId), eq(schema.lernappLektion.status, 'automatisch_geprueft')))
            .returning({ id: schema.lernappLektion.id });
          const alleLektionen = await tx
            .select({ id: schema.lernappLektion.id })
            .from(schema.lernappLektion)
            .where(eq(schema.lernappLektion.einheitId, k.einheitId));
          const lektionIds = [...new Set([...lektionen, ...alleLektionen].map((l) => l.id))];
          if (lektionIds.length)
            await tx
              .update(schema.lernappAufgabe)
              .set({ status: 'veroeffentlicht' })
              .where(and(inArray(schema.lernappAufgabe.lektionId, lektionIds), eq(schema.lernappAufgabe.status, 'automatisch_geprueft')));
        } else if (k.art === 'uebersetzung') await offen(schema.lernappUebersetzung, ids('uebersetzung'));
      }
    }
    await protokolliere(
      {
        benutzerId,
        aktion: 'lernapp.stichprobe_entschieden',
        zielTyp: 'lernapp_stichprobe',
        zielId: k.id,
        details: { entscheidung, geprueft: ergebnis.geprueft, kritisch: ergebnis.kritisch, leicht: ergebnis.leicht },
      },
      tx,
    );
  });
  await kursGeaendert([kurs]);
  return entscheidung;
}

/**
 * Einen Eintrag einer Stichprobe beurteilen: Urteil `ok`, `korrektur` (mit Korrekturvorschlag) oder `abgelehnt`, Fehler-
 * kategorie Pflicht außer bei `ok`. Prüfende bearbeiten nicht selbst: Der Vorschlag geht an die Redaktion (ADR 0041 Nr. 6).
 */
export async function eintragPruefen(_vorher: LernappZustand, fd: FormData): Promise<LernappZustand> {
  return mitLernappRecht('lernapp.sprache.pruefen', async (a) => {
    const id = UUID.safeParse(fd.get('stichprobe'));
    const k = id.success ? await ladeStichprobeKopf(id.data) : null;
    if (!k) return { fehler: 'nichtGefunden' };
    if (!(await darfFuer(a, k.sprache))) return { fehler: 'keinRecht' };
    if (k.entscheidung !== 'offen') return { fehler: 'entschieden' };
    const schluessel = String(fd.get('eintrag') ?? '');
    if (!k.auswahl.includes(schluessel)) return { fehler: 'nichtGefunden' };
    const urteil = Urteil.safeParse(fd.get('urteil'));
    if (!urteil.success) return { fehler: 'pruefen', feldFehler: { urteil: 'urteilFehlt' } };
    const kategorieRoh = fd.get('kategorie');
    const kategorie = urteil.data === 'ok' ? null : Kategorie.safeParse(kategorieRoh);
    if (kategorie && !kategorie.success) return { fehler: 'pruefen', feldFehler: { kategorie: 'kategorieFehlt' } };
    const korrektur = String(fd.get('korrektur') ?? '')
      .normalize('NFC')
      .trim();
    const kommentar = String(fd.get('kommentar') ?? '').trim();
    if (korrektur.length > 600) return { fehler: 'pruefen', feldFehler: { korrektur: 'zuLang' } };
    if (kommentar.length > 500) return { fehler: 'pruefen', feldFehler: { kommentar: 'zuLang' } };
    if (urteil.data === 'korrektur' && !korrektur) return { fehler: 'pruefen', feldFehler: { korrektur: 'korrekturFehlt' } };

    const eintrag = (await kandidaten(k.einheit, k.art, k.richtungId)).find((x) => x.schluessel === schluessel);
    if (!eintrag) return { fehler: 'nichtGefunden' };
    // Religionswächter auch für Eingaben der Verwaltung (S-L1 M-3)
    for (const [feld, text] of [
      ['korrektur', korrektur],
      ['kommentar', kommentar],
    ] as const) {
      const befund = text ? waechterBefund(text, eintrag.religionsbezug) : null;
      if (befund) return { fehler: 'pruefen', feldFehler: { [feld]: `waechter_${befund}` } };
    }
    const kat = kategorie?.success ? kategorie.data : null;
    await db.transaction(async (tx) => {
      await tx.insert(schema.lernappPruefung).values({
        inhaltTyp: eintrag.inhaltTyp,
        inhaltId: eintrag.inhaltId,
        inhaltHash: eintrag.inhaltHash,
        art: k.art === 'uebersetzung' ? 'sprache_uebersetzung' : 'sprache_ziel',
        pruefendeId: a.benutzerId,
        urteil: urteil.data,
        kategorie: kat,
        korrektur: korrektur || null,
        kommentar: kommentar || null,
        stichprobeId: k.id,
      });
      await protokolliere(
        {
          benutzerId: a.benutzerId,
          aktion: 'lernapp.geprueft',
          zielTyp: 'lernapp_stichprobe',
          zielId: k.id,
          details: { art: k.art, inhaltTyp: eintrag.inhaltTyp, urteil: urteil.data, kategorie: kat },
        },
        tx,
      );
    });
    const entscheidung = await entscheideWennFertig(k, a.benutzerId);
    // Kritisch oder abgelehnt: sofort verborgen (freigabe.ts `sprachlichGesperrt`), Pakete neu
    if (entscheidung === 'offen' && (urteil.data === 'abgelehnt' || istKritisch(kat))) await kursGeaendert([k.kurs as KursId]);
    refresh();
    return { gespeichert: Date.now(), hinweis: entscheidung };
  });
}

const EBENEN = ['muttersprache', 'sehr_gut'] as const;

/**
 * Prüfsprachen einer Person setzen (ADR 0041 Nr. 1): nur mit `lernapp.bearbeiten`; die Person braucht das Recht
 * `lernapp.sprache.pruefen` über eine ihrer Rollen. Feld `sprache_<de|tr|ar>` = Ebene oder leer.
 */
export async function pruefsprachenSetzen(_vorher: LernappZustand, fd: FormData): Promise<LernappZustand> {
  return mitLernappRecht('lernapp.bearbeiten', async (a) => {
    const person = String(fd.get('benutzerId') ?? '');
    if (!/^[A-Za-z0-9_-]{1,100}$/.test(person)) return { fehler: 'nichtGefunden' };
    const rollen = await db
      .select({ rolle: schema.rolleZuweisung.rolle, organisation: schema.rolleZuweisung.organisation })
      .from(schema.rolleZuweisung)
      .where(eq(schema.rolleZuweisung.benutzerId, person));
    if (!darf(rollen, 'lernapp.sprache.pruefen')) return { fehler: 'keinPruefrecht' };
    const neu: { sprache: Sprache; ebene: (typeof EBENEN)[number] }[] = [];
    for (const sprache of SPRACHEN) {
      const w = fd.get(`sprache_${sprache}`);
      if (w === null || w === '') continue;
      if (!(EBENEN as readonly string[]).includes(String(w))) return { fehler: 'pruefen' };
      neu.push({ sprache, ebene: w as (typeof EBENEN)[number] });
    }
    await db.transaction(async (tx) => {
      await tx.delete(schema.lernappPrueferSprache).where(eq(schema.lernappPrueferSprache.benutzerId, person));
      if (neu.length) await tx.insert(schema.lernappPrueferSprache).values(neu.map((n) => ({ benutzerId: person, ...n })));
      await protokolliere(
        {
          benutzerId: a.benutzerId,
          aktion: 'lernapp.pruefsprachen_geaendert',
          zielTyp: 'benutzer',
          zielId: person,
          details: { sprachen: neu.map((n) => `${n.sprache}:${n.ebene}`).join(',') || null },
        },
        tx,
      );
    });
    refresh();
    return { gespeichert: Date.now() };
  });
}
