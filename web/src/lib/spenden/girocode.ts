/**
 * GiroCode (EPC-QR, EPC069-12 Version 002) für Überweisungen an die Gemeinde (AUFTRAG 3.10, MN-13). Kein Zahlungsdienst:
 * Die Banking-App liest Empfänger, IBAN, Zweck und optional den Betrag. Reine Funktionen; das QR-Bild erzeugt `uqr`.
 */
export type GiroCodeDaten = { empfaenger: string; iban: string; bic?: string; betrag?: number; zweck: string };

/** IBAN normalisieren und mit Prüfziffer (ISO 13616, mod 97) prüfen. */
export function ibanGueltig(roh: string): string | null {
  const iban = roh.replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return null;
  const umgestellt = iban.slice(4) + iban.slice(0, 4);
  const zahl = umgestellt.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let rest = 0;
  for (const ziffer of zahl) rest = (rest * 10 + Number(ziffer)) % 97;
  return rest === 1 ? iban : null;
}

/** Formatierte IBAN in Vierergruppen zum Abschreiben. */
export function ibanAnzeige(iban: string): string {
  return iban.replace(/(.{4})/g, '$1 ').trim();
}

/** Nutzlast des EPC-QR; null bei ungültigen Daten. Betrag 0,01–999.999.999,99 €, Zweck ≤ 140 Zeichen, Name ≤ 70. */
export function girocodeNutzlast(d: GiroCodeDaten): string | null {
  const iban = ibanGueltig(d.iban);
  const name = d.empfaenger.trim();
  const zweck = d.zweck.replace(/\s+/g, ' ').trim();
  if (!iban || !name || name.length > 70 || zweck.length > 140) return null;
  if (d.betrag !== undefined && !(d.betrag >= 0.01 && d.betrag <= 999_999_999.99)) return null;
  const betrag = d.betrag !== undefined ? `EUR${d.betrag.toFixed(2)}` : '';
  return ['BCD', '002', '1', 'SCT', d.bic?.trim() ?? '', name, iban, betrag, '', '', zweck, ''].join('\n').trimEnd();
}
