/**
 * Mails der Gemeinde-Konten (ADR 0026, AUFTRAG 3.11): in der Sprache der Person, ohne Inhalte außer dem Link –
 * keine Namen, keine Rollen, keine Formulardaten. Texte unter `konto.mails.<art>` (messages/bereiche/konto.json).
 * Reine Funktionen und Typen (unit-getestet); das Rendern steht in `ausgang.ts`.
 */
export const KONTO_VORLAGEN = [
  'konto-bestaetigen',
  'konto-vorhanden',
  'konto-einladung',
  'konto-passwort',
  // DSFA D-16: Vorwarnung vor der Löschung inaktiver Konten (Kinderkonten: an die Eltern)
  'konto-inaktiv',
  'konto-inaktiv-kind',
  // Sicherheitshinweis nach neuem Passkey bzw. neu eingerichteter Zwei-Faktor-Anmeldung (ohne Geheimnisse)
  'konto-passkey',
  'konto-zwei-faktor',
  // S2/S3: an die übrigen sorgeberechtigten Eltern – neuer Eltern-Kind-Bezug bzw. neues Passwort des Kinderzugangs
  'konto-elternbezug',
  'konto-kinderpasswort',
  // Nacharbeit N4: an das Elternkonto selbst – Beenden seines Eltern-Kind-Bezugs beantragt bzw. vollzogen
  'konto-elternbezug-beenden',
  'konto-elternbezug-beendet',
] as const;
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
  'konto-inaktiv': 'inaktiv',
  'konto-inaktiv-kind': 'inaktivKind',
  'konto-passkey': 'passkey',
  'konto-zwei-faktor': 'zweiFaktor',
  'konto-elternbezug': 'elternbezug',
  'konto-kinderpasswort': 'kinderpasswort',
  'konto-elternbezug-beenden': 'elternbezugBeenden',
  'konto-elternbezug-beendet': 'elternbezugBeendet',
};

/**
 * Sicherheitshinweise für Konten der Verwaltung (Deutsch, Layout der Benachrichtigung): neuer Passkey bzw. neu
 * eingerichtete Zwei-Faktor-Anmeldung. Texte unter `verwaltung.sicherheit.mails` (messages/verwaltung/sicherheit.json).
 */
export const SICHERHEITS_VORLAGEN = { passkey: 'sicherheit-passkey', zwei_faktor: 'sicherheit-zwei-faktor' } as const;
export type SicherheitsArt = keyof typeof SICHERHEITS_VORLAGEN;

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
