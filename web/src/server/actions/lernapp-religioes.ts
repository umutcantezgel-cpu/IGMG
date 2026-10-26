'use server';

import { refresh } from 'next/cache';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import {
  istReligioeserBaustein,
  pruefeUrteil,
  RELIGIOESE_URTEILE,
  religioeseLage,
  type Pruefung,
  wissenSichtbar,
} from '@/lib/lernapp/freigabe';
import { KURSE, kursArt } from '@/lib/lernapp/kurse';
import { type LernappZustand, mitLernappRecht, waechterBefund } from '@/lib/lernapp/verwaltung/aktion';
import { kursGeaendert } from '@/lib/lernapp/veroeffentlichen';
import { ladeFreigabe } from '@/server/queries/lernapp/religioes';

/**
 * Verwaltung › Lern-App › Religiöse Prüfung (L6-02/03, ADR 0040 Nr. 5, KERN 4.0 §2.3): ein Urteil zu genau dem Hash, den die
 * Person gesehen hat. Reihenfolge: Datenbank → Sitzung mit zweitem Faktor und Recht `lernapp.religioes.pruefen` (nie per
 * Administration) → Schalter `lernapp` (`mitLernappRecht`) → Rolle `religioese_pruefung` ohne Administration (Stufe C N2),
 * aktueller Hash, nicht Verfasser, KI-Regel 2, Belege und Inhalt bestätigt, nicht zweimal dieselbe Person (`pruefeUrteil`).
 * Prüfende bearbeiten nicht selbst:
 * Ein Änderungsvorschlag geht als Text an die Redaktion. Jeder Schritt steht im Freigabe-Verlauf (`freigabe`) und im Audit
 * – dort ohne Inhalte (Typ, Kennung, Urteil, Stand). Wird der Baustein durch das Urteil sichtbar oder unsichtbar, steigt der
 * Kursstand und der Cache-Tag des Kurses verfällt (Zurückziehen wirkt sofort).
 */

const UUID = z.uuid();
const HASH = z.string().regex(/^[0-9a-f]{64}$/);
const Urteil = z.enum(RELIGIOESE_URTEILE);

export async function religioesPruefen(_vorher: LernappZustand, fd: FormData): Promise<LernappZustand> {
  return mitLernappRecht('lernapp.religioes.pruefen', async (a) => {
    const typ = fd.get('typ');
    const id = UUID.safeParse(fd.get('id'));
    const hash = HASH.safeParse(fd.get('hash'));
    if (!istReligioeserBaustein(typ) || !id.success || !hash.success) return { fehler: 'nichtGefunden' };
    const urteil = Urteil.safeParse(fd.get('urteil'));
    if (!urteil.success) return { fehler: 'pruefen', feldFehler: { urteil: 'urteilFehlt' } };
    const vorschlag = String(fd.get('vorschlag') ?? '')
      .normalize('NFC')
      .trim();
    const kommentar = String(fd.get('kommentar') ?? '')
      .normalize('NFC')
      .trim();
    if (vorschlag.length > 2000) return { fehler: 'pruefen', feldFehler: { vorschlag: 'zuLang' } };
    if (kommentar.length > 1000) return { fehler: 'pruefen', feldFehler: { kommentar: 'zuLang' } };
    if (urteil.data === 'aenderungsvorschlag' && !vorschlag) return { fehler: 'pruefen', feldFehler: { vorschlag: 'vorschlagFehlt' } };
    if (urteil.data === 'abgelehnt' && !kommentar) return { fehler: 'pruefen', feldFehler: { kommentar: 'begruendungFehlt' } };
    // Koran- und Hadith-Wortlaut tippt niemand ein (S-L1 M-3); religiöse Begriffe sind in diesen Texten erlaubt
    for (const [feld, text] of [
      ['vorschlag', vorschlag],
      ['kommentar', kommentar],
    ] as const) {
      const befund = text ? waechterBefund(text, true) : null;
      if (befund) return { fehler: 'pruefen', feldFehler: { [feld]: `waechter_${befund}` } };
    }

    const f = await ladeFreigabe(typ, id.data);
    if (!f || f.status === 'gesperrt') return { fehler: 'nichtGefunden' };
    // je Haken Kennung und Hash der gesehenen Fassung (`belegHaken`): ein geänderter Beleg verlangt einen neuen Haken
    const belegeBestaetigt = fd.getAll('beleg').map(String);
    const antrag = {
      pruefendeId: a.benutzerId,
      pruefendeRollen: a.rollen.map((r) => r.rolle),
      baustein: f.baustein,
      gesehenerHash: hash.data,
      urteil: urteil.data,
      belegeBestaetigt,
      inhaltBestaetigt: fd.get('bestaetigt') === '1',
    };
    const fehler = pruefeUrteil(antrag, f.pruefungen);
    if (fehler) return { fehler: `urteil_${fehler}` };

    const vorher = wissenSichtbar(f.status, f.baustein, f.pruefungen);
    const neu: Pruefung = {
      pruefendeId: a.benutzerId,
      pruefendeRollen: antrag.pruefendeRollen,
      art: 'religioes',
      urteil: urteil.data,
      inhaltHash: f.baustein.inhaltHash,
      belegeGeprueft: urteil.data === 'ok' ? f.baustein.belege.map((b) => ({ belegId: b.id, inhaltHash: b.inhaltHash })) : [],
      am: new Date(),
    };
    const nachher = religioeseLage(f.baustein, [...f.pruefungen, neu]);
    const stand = Math.min(nachher.freigaben.length, 2);
    await db.transaction(async (tx) => {
      await tx.insert(schema.lernappPruefung).values({
        inhaltTyp: typ,
        inhaltId: id.data,
        inhaltHash: f.baustein.inhaltHash,
        art: 'religioes',
        pruefendeId: a.benutzerId,
        urteil: urteil.data,
        belegeGeprueft: neu.belegeGeprueft ? [...neu.belegeGeprueft] : [],
        korrektur: vorschlag || null,
        kommentar: kommentar || null,
        am: neu.am,
      });
      // Verlauf wie bei den übrigen religiösen Freigaben (ADR 0030): 1/2 bleibt „zur Prüfung“, 2/2 ist „geprüft“
      await tx.insert(schema.freigabe).values({
        inhaltTyp: `lernapp_${typ}`,
        inhaltId: id.data,
        art: 'religioes',
        status: urteil.data !== 'ok' ? 'entwurf' : nachher.geprueft ? 'geprueft' : 'zur_pruefung',
        von: a.benutzerId,
        kommentar: urteil.data === 'ok' ? null : kommentar || null,
      });
      await protokolliere(
        {
          benutzerId: a.benutzerId,
          aktion: 'lernapp.religioes_geprueft',
          zielTyp: `lernapp_${typ}`,
          zielId: id.data,
          details: { urteil: urteil.data, stand, belege: f.baustein.belege.length, geprueft: nachher.geprueft },
        },
        tx,
      );
    });
    // Sichtbarkeit geändert (zweite Freigabe oder Einwand nach der Freigabe): neue Pakete, Cache-Tag verfällt – bei der
    // Formelliste (ohne eigenen Kurs) in allen Sprachkursen
    if (wissenSichtbar(f.status, f.baustein, [...f.pruefungen, neu]) !== vorher)
      await kursGeaendert(f.kurs ? [f.kurs] : KURSE.filter((k) => kursArt(k) === 'sprache'));
    refresh();
    return { gespeichert: Date.now(), hinweis: urteil.data === 'ok' ? `stand_${stand}` : urteil.data };
  });
}
