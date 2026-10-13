import { bicGueltig } from '@/lib/spenden/ansicht';
import { ibanGueltig } from '@/lib/spenden/girocode';
import { spendenEinstellung, type SpendenEinstellung } from './einstellungen';

/**
 * Formular „Spenden“ unter Verwaltung › Einstellungen (MN-13): Bankverbindung und bis zu {@link ZWECK_PLAETZE}
 * Spendenzwecke. Feldnamen: `empfaenger`, `iban`, `bic`, je Zweck `zweck<n>TitelDe|Tr|En`,
 * `zweck<n>BeschreibungDe|Tr|En`, `zweck<n>Verwendungszweck`. Leere Zweck-Zeilen entfallen. Eine leere IBAN ist
 * erlaubt (Spenden ausgeblendet). Fehler als Schlüssel unter `verwaltung.spenden.fehler`.
 */
export const ZWECK_PLAETZE = 4;

export type SpendenFormularErgebnis = { ok: true; wert: SpendenEinstellung } | { ok: false; feldFehler: Record<string, string> };

const SPRACHEN = ['De', 'Tr', 'En'] as const;

/** Startwerte des Formulars aus der gespeicherten Einstellung. */
export function spendenFormularWerte(e: SpendenEinstellung): Record<string, string> {
  const w: Record<string, string> = { empfaenger: e.empfaenger, iban: e.iban, bic: e.bic };
  for (let i = 0; i < ZWECK_PLAETZE; i++) {
    const z = e.zwecke[i];
    w[`zweck${i}TitelDe`] = z?.titel.de ?? '';
    w[`zweck${i}TitelTr`] = z?.titel.tr ?? '';
    w[`zweck${i}TitelEn`] = z?.titel.en ?? '';
    w[`zweck${i}BeschreibungDe`] = z?.beschreibung?.de ?? '';
    w[`zweck${i}BeschreibungTr`] = z?.beschreibung?.tr ?? '';
    w[`zweck${i}BeschreibungEn`] = z?.beschreibung?.en ?? '';
    w[`zweck${i}Verwendungszweck`] = z?.verwendungszweck ?? '';
  }
  return w;
}

export function spendenAusFormular(roh: Record<string, string>): SpendenFormularErgebnis {
  const wert = (k: string) => (roh[k] ?? '').trim();
  const fehler: Record<string, string> = {};
  const empfaenger = wert('empfaenger');
  const ibanRoh = wert('iban');
  const bicRoh = wert('bic');
  const iban = ibanRoh ? ibanGueltig(ibanRoh) : '';
  if (ibanRoh && !iban) fehler.iban = 'iban';
  if (ibanRoh && !empfaenger) fehler.empfaenger = 'pflicht';
  if (empfaenger.length > 70) fehler.empfaenger = 'zuLang';
  const bic = bicRoh ? bicGueltig(bicRoh) : '';
  if (bicRoh && !bic) fehler.bic = 'bic';

  const zwecke: SpendenEinstellung['zwecke'] = [];
  for (let i = 0; i < ZWECK_PLAETZE; i++) {
    const titel = Object.fromEntries(SPRACHEN.map((s) => [s, wert(`zweck${i}Titel${s}`)])) as Record<(typeof SPRACHEN)[number], string>;
    const beschreibung = Object.fromEntries(SPRACHEN.map((s) => [s, wert(`zweck${i}Beschreibung${s}`)])) as Record<
      (typeof SPRACHEN)[number],
      string
    >;
    const verwendungszweck = wert(`zweck${i}Verwendungszweck`).replace(/\s+/g, ' ');
    const irgendwas = [...Object.values(titel), ...Object.values(beschreibung), verwendungszweck].some(Boolean);
    if (!irgendwas) continue;
    if (!titel.De) fehler[`zweck${i}TitelDe`] = 'pflicht';
    if (!verwendungszweck) fehler[`zweck${i}Verwendungszweck`] = 'pflicht';
    if (verwendungszweck.length > 140) fehler[`zweck${i}Verwendungszweck`] = 'zuLang';
    for (const s of SPRACHEN) {
      if (titel[s].length > 80) fehler[`zweck${i}Titel${s}`] = 'zuLang';
      if (beschreibung[s].length > 300) fehler[`zweck${i}Beschreibung${s}`] = 'zuLang';
    }
    // Übersetzung der Beschreibung ohne deutsche Fassung ergibt keinen Sinn (Deutsch ist Pflicht, ADR 0002)
    if (!beschreibung.De && (beschreibung.Tr || beschreibung.En)) fehler[`zweck${i}BeschreibungDe`] = 'pflicht';
    zwecke.push({
      titel: { de: titel.De, ...(titel.Tr ? { tr: titel.Tr } : {}), ...(titel.En ? { en: titel.En } : {}) },
      ...(beschreibung.De
        ? {
            beschreibung: {
              de: beschreibung.De,
              ...(beschreibung.Tr ? { tr: beschreibung.Tr } : {}),
              ...(beschreibung.En ? { en: beschreibung.En } : {}),
            },
          }
        : {}),
      verwendungszweck,
    });
  }
  if (Object.keys(fehler).length) return { ok: false, feldFehler: fehler };
  const geprueft = spendenEinstellung.safeParse({ empfaenger, iban: iban || '', bic: bic || '', zwecke });
  if (!geprueft.success) return { ok: false, feldFehler: { formular: 'pruefen' } };
  return { ok: true, wert: geprueft.data };
}
