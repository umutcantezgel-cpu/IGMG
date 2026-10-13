/**
 * Mails der Gemeinde-Konten (ADR 0026, AUFTRAG 3.11): in der Sprache der Person, ohne Inhalte außer dem Link –
 * keine Namen, keine Rollen, keine Formulardaten. Texte unter `konto.mails.<art>` (messages/bereiche/konto.json).
 * Reine Funktionen und Typen (unit-getestet); das Rendern steht in `ausgang.ts`.
 */
export const KONTO_VORLAGEN = ['konto-bestaetigen', 'konto-vorhanden', 'konto-einladung', 'konto-passwort'] as const;
export type KontoVorlage = (typeof KONTO_VORLAGEN)[number];
export type MailSprache = 'de' | 'tr' | 'en';

export function istKontoVorlage(v: string): v is KontoVorlage {
  return (KONTO_VORLAGEN as readonly string[]).includes(v);
}

/** Schlüssel der Texte unter `konto.mails` je Vorlage. */
export const KONTO_MAIL_SCHLUESSEL: Record<KontoVorlage, string> = {
  'konto-bestaetigen': 'bestaetigen',
  'konto-vorhanden': 'vorhanden',
  'konto-einladung': 'einladung',
  'konto-passwort': 'passwort',
};

/**
 * „Passwort vergessen“ nutzt für Verwaltung und Gemeinde denselben Better-Auth-Weg (Vorlage `passwort`). Welche Mail
 * passt, steht im Rücksprung des Links (`callbackURL`): Verwaltung → deutsche Verwaltungsmail (null),
 * sonst Gemeinde-Konto in der Sprache des Pfads (`/tr/…`, `/en/…`, ohne Präfix Deutsch).
 */
export function kontoSpracheAusLink(link: string | undefined): MailSprache | null {
  if (!link) return null;
  let ziel: string | null;
  try {
    ziel = new URL(link).searchParams.get('callbackURL');
  } catch {
    return null;
  }
  if (!ziel) return null;
  let pfad: string;
  try {
    pfad = new URL(ziel, 'http://basis.invalid').pathname;
  } catch {
    return null;
  }
  if (/^\/(?:(?:de|tr|en)\/)?verwaltung(?:\/|$)/.test(pfad)) return null;
  const m = /^\/(tr|en)(?:\/|$)/.exec(pfad);
  return m ? (m[1] as MailSprache) : 'de';
}
