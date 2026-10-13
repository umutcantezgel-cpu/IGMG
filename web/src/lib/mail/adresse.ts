/**
 * Zustellbarkeit von Empfängeradressen (ADR 0026). Reine Funktion ohne Serverabhängigkeit.
 *
 * Die Top-Level-Domain `.invalid` ist nach RFC 2606 nie zustellbar. Kinderkonten tragen eine synthetische Adresse
 * `k-<zufall>@konto.invalid`, Beispielkonten `…@beispiel.invalid`. Der Mail-Ausgang weist solche Adressen hart ab:
 * Es wird weder geplant noch versendet.
 */
export function istUnzustellbar(adresse: string): boolean {
  const roh = adresse.trim();
  // „Name <person@example.test>“ → nur die Adresse
  const klammer = /<([^<>]+)>\s*$/.exec(roh);
  const nur = (klammer ? klammer[1] : roh).trim().toLowerCase();
  const at = nur.lastIndexOf('@');
  if (at < 0) return true;
  const domain = nur.slice(at + 1).replace(/\.+$/, '');
  if (!domain) return true;
  const tld = domain.split('.').pop() ?? '';
  return tld === 'invalid';
}

/** Fehler des Mail-Transports für unzustellbare Empfänger (z. B. Kinderkonten); wird nie erneut versucht. */
export class MailUnzustellbar extends Error {
  constructor() {
    super('MAIL_UNZUSTELLBAR');
    this.name = 'MailUnzustellbar';
  }
}
