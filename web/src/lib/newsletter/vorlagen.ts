/**
 * Namen der Newsletter-Vorlagen im Mail-Ausgang (Spalte `mail_ausgang.vorlage`). Die Daten der Zeile enthalten nur
 * das Token (Bestätigung) bzw. die Ausgabe-ID und das Abmelde-Token (Ausgabe) – nie den Inhalt der Ausgabe.
 */
export const NEWSLETTER_VORLAGE = {
  bestaetigen: 'newsletter_bestaetigen',
  ausgabe: 'newsletter_ausgabe',
} as const;

/** Adressen der Links in den Mails (Route Handler, siehe src/app/api/newsletter). */
export function newsletterLink(basis: string, art: 'bestaetigen' | 'abmelden', token: string, sprache: string): string {
  return `${basis}/api/newsletter/${art}?${new URLSearchParams({ token, sprache })}`;
}
