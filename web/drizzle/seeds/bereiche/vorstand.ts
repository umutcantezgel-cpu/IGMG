import type { z } from 'zod';
import { schema } from '../../../src/lib/db';
import { ENTITAET } from '../../../src/lib/seo/entitaet';
import { schema as vorstandSchema } from '../../../src/lib/validierung/seiteninhalte/vorstand';
import type { BereichsSeed } from './typ';

/**
 * Quellen (ADR 0015): Design und Bestand; Personennamen und Telefonnummern sind Platzhalter (G-04, G-05). Marktstart
 * (E-044 Nr. 4): Führung seit dem Gründungsjahr 1978 statt 1975 aus dem Design; die erste Amtszeit beginnt 1978.
 */
export const VORSTAND_QUELLE =
  'design/BoardMembers.dc.html:20–74; bestand/BoardMembers.tsx:29–266 (Funktionen, Jahre, E-Mail, Zeiträume); ' +
  'Namen als Platzhalter (G-04); Telefon als Platzhalter (G-05); ' +
  `Führungsjahr und Beginn der ersten Amtszeit 1978 nach E-044 Nr. 4 (Beleg ${ENTITAET.gruendungBeleg}, 07.04.2008) statt 1975 aus BoardMembers.dc.html:30`;

/** Mitglied des aktuellen Vorstands; Funktion und Aufgaben nur deutsch (Bestand ohne Übersetzung, Rückfall sichtbar). */
const mitglied = (name: string, funktion: string, seit: string, aufgaben: string[], email: string) => ({
  name,
  funktion: { de: funktion },
  seit,
  aufgaben: aufgaben.map((de) => ({ de })),
  email,
  telefon: '[Telefonnummer]',
});

/** Amtszeit der Chronik. `bis` leer und `aktuell` wahr heißt „Heute“ (Design: „2025 – Heute“). */
const amt = (name: string, von: string, bis: string, erfolge: string[], aktuell = false) => ({
  name,
  von,
  bis,
  aktuell,
  erfolge: erfolge.map((de) => ({ de })),
});

/** Beispielinhalt „vorstand“ (exportiert für Stand-Migrationen und Tests). */
export const VORSTAND_BEISPIEL: z.input<typeof vorstandSchema> = {
  fuehrungSeit: '1978',
  vorstand: [
    mitglied(
      '[Name – Vorsitzender]',
      'Vorsitzender',
      '2025',
      ['Gesamtleitung der Gemeinde', 'Strategische Planung', 'Externe Vertretung'],
      'vorsitzender@igmg-wetzlar.de',
    ),
    mitglied(
      '[Name – Stellvertretender Vorsitzender]',
      'Stellvertretender Vorsitzender',
      '2021',
      ['Unterstützung der Gesamtleitung', 'Koordination der Gemeindearbeit', 'Bildungsprogramme'],
      'stellvertretung@igmg-wetzlar.de',
    ),
    mitglied(
      '[Name – Schatzmeister]',
      'Schatzmeister',
      '2019',
      ['Finanzplanung und -kontrolle', 'Budgetverwaltung', 'Spendenverwaltung'],
      'finanzen@igmg-wetzlar.de',
    ),
    mitglied(
      '[Name – Bildungsbeauftragter]',
      'Bildungsbeauftragter',
      '2020',
      ['Koranschulleitung', 'Erwachsenenbildung', 'Sprachkurse'],
      'bildung@igmg-wetzlar.de',
    ),
    mitglied(
      '[Name – Jugendbeauftragter]',
      'Jugendbeauftragter',
      '2022',
      ['Jugendarbeit GT/KGT', 'Sportaktivitäten', 'Freizeitprogramme'],
      'jugend@igmg-wetzlar.de',
    ),
    mitglied(
      '[Name – Sozialbeauftragter]',
      'Sozialbeauftragter',
      '2021',
      ['Soziale Projekte', 'Bedürftige unterstützen', 'Gemeindedienste'],
      'soziales@igmg-wetzlar.de',
    ),
  ],
  vorsitzende: [
    amt('[Name – Vorsitz]', '1978', '1979', ['Gründung der ersten Moschee', 'Etablierung der Gemeinde', 'Aufbau der Grundstrukturen']),
    amt('[Name – Vorsitz]', '1979', '1981', ['Erweiterung der Gebetsräume', 'Erste Jugendprogramme', 'Aufbau der Frauenorganisation']),
    amt('[Name – Vorsitz]', '1981', '1983', ['Ausbau der Bildungsprogramme', 'Koranschule-Gründung', 'Verstärkung der Gemeindearbeit']),
    amt('[Name – Vorsitz]', '1983', '1989', [
      'Umzug zur Garbenheimerstraße',
      'Ausbau der Jugendarbeit',
      'Erste interkulturelle Programme',
      'Stärkung der Finanzen',
    ]),
    amt('[Name – Vorsitz]', '1989', '1993', ['Modernisierung der Gemeinde', 'Ausbau der Bibliothek', 'Verstärkung der Sozialarbeit']),
    amt('[Name – Vorsitz]', '1993', '1994', ['Konsolidierung der Strukturen', 'Vorbereitung für Wachstum']),
    amt('[Name – Vorsitz]', '1994', '1998', [
      'Umzug zum Niedergirmeser Weg',
      'Ausbau der Familienarbeit',
      'Erste Computerkurse',
      'Stärkung der Nachbarschaftsbeziehungen',
    ]),
    amt('[Name – Vorsitz]', '1998', '2001', ['Digitalisierung der Verwaltung', 'Erweiterung der Sprachkurse', 'Aufbau der Website']),
    amt('[Name – Vorsitz]', '2001', '2009', [
      'Aufbau der Sportgruppen',
      'Einführung der Nachhilfe',
      'Stärkung der Integration',
      'Kooperationen mit lokalen Vereinen',
      'Renovierung der Gebetsräume',
    ]),
    amt('[Name – Vorsitz]', '2009', '2012', ['Planung des Moschee-Neubaus', 'Fundraising-Kampagnen', 'Ausbau der Seniorenarbeit']),
    amt('[Name – Vorsitz]', '2012', '2025', [
      'Umzug zur Philipsstraße',
      'Aufbau des modernen Gemeindezentrums',
      'Einführung digitaler Services',
      'Ausbau der Bildungsprogramme',
      'Stärkung der Öffentlichkeitsarbeit',
      'Interreligiöser Dialog',
    ]),
    amt('[Name – Vorsitz]', '2025', '', ['Modernisierung der IT-Infrastruktur', 'Neue Bildungsinitiativen'], true),
  ],
};

/** Seed „vorstand“ (Paket A04): Beispielinhalte, idempotent (onConflictDoNothing), Rückgabe: Anzahl neuer Zeilen. */
export const seed: BereichsSeed = async (db) => {
  const inhalt = vorstandSchema.parse(VORSTAND_BEISPIEL);
  const r = await db
    .insert(schema.seiteninhalt)
    .values({ bereich: 'vorstand', inhalt, istBeispiel: true, quelle: VORSTAND_QUELLE })
    .onConflictDoNothing({ target: schema.seiteninhalt.bereich })
    .returning({ bereich: schema.seiteninhalt.bereich });
  return r.length;
};
