import type { Mehrsprachig } from '@/lib/db/schema/typen';
import type { SpendenEinstellung } from '@/lib/validierung/einstellungen';
import { girocodeNutzlast, ibanAnzeige, ibanGueltig } from './girocode';

/**
 * Was /spenden aus der Einstellung „spenden“ zeigt (AUFTRAG 3.10, MN-13). Reine Funktion: Nur mit gültiger IBAN
 * (Prüfziffer) und Empfänger gibt es eine Bankverbindung und GiroCodes; sonst `null` → ehrlicher Platzhalter.
 * Ohne eingetragene Zwecke gibt es einen allgemeinen Zweck mit dem übergebenen Verwendungszweck.
 */
export type SpendenZweckAnsicht = {
  schluessel: string;
  titel: Mehrsprachig | null;
  beschreibung: Mehrsprachig | null;
  verwendungszweck: string;
  /** EPC-Nutzlast für den QR-Code (ohne Betrag – den wählt die spendende Person) */
  nutzlast: string;
};

export type SpendenAnsicht = {
  empfaenger: string;
  iban: string;
  ibanAnzeige: string;
  bic: string | null;
  zwecke: SpendenZweckAnsicht[];
};

const BIC = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

export function bicGueltig(roh: string): string | null {
  const bic = roh.replace(/\s+/g, '').toUpperCase();
  return BIC.test(bic) ? bic : null;
}

export function spendenAnsicht(e: SpendenEinstellung, allgemeinerZweck: string): SpendenAnsicht | null {
  const iban = ibanGueltig(e.iban);
  const empfaenger = e.empfaenger.trim();
  if (!iban || !empfaenger) return null;
  const bic = e.bic.trim() ? bicGueltig(e.bic) : null;
  const zwecke: Omit<SpendenZweckAnsicht, 'nutzlast'>[] = e.zwecke.length
    ? e.zwecke.map((z, i) => ({
        schluessel: `zweck-${i + 1}`,
        titel: z.titel,
        beschreibung: z.beschreibung?.de ? { de: z.beschreibung.de, tr: z.beschreibung.tr, en: z.beschreibung.en } : null,
        verwendungszweck: z.verwendungszweck,
      }))
    : [{ schluessel: 'allgemein', titel: null, beschreibung: null, verwendungszweck: allgemeinerZweck }];
  const mitCode: SpendenZweckAnsicht[] = [];
  for (const z of zwecke) {
    const nutzlast = girocodeNutzlast({ empfaenger, iban, bic: bic ?? undefined, zweck: z.verwendungszweck });
    if (nutzlast) mitCode.push({ ...z, nutzlast });
  }
  if (!mitCode.length) return null;
  return { empfaenger, iban, ibanAnzeige: ibanAnzeige(iban), bic, zwecke: mitCode };
}
