'use server';

import { randomUUID } from 'node:crypto';
import { getTranslations } from 'next-intl/server';
import { KontaktErfolg, KontaktFormular } from '@/components/website/formulare/KontaktFormular';
import type { FormularAntwort } from '@/lib/formulare/ergebnis';
import { zurueckOhneSkript } from '@/lib/formulare/ohne-skript';
import { verarbeiteFormular, type GeplanteMail } from '@/lib/formulare/verarbeiten';
import { datumOhneWochentag } from '@/lib/i18n/format';
import { kontaktSchema } from '@/lib/validierung/formulare/kontakt';

type Sprache = 'de' | 'tr' | 'en';

/**
 * Kontaktformular der Seite /kontakt (B03, ADR 0005, K-07): Schutz und Speichern über `verarbeiteFormular` (Eingang
 * „kontakt“ verschlüsselt, Einwilligung mit Textversion). Bestätigung an die anfragende Person in ihrer Sprache,
 * Benachrichtigung an `rolle:kontakt` ohne Formulardaten. Antwort mit auf dem Server gerenderter Ansicht (E-028).
 */
export async function sendeKontakt(_vorher: FormularAntwort | null, fd: FormData): Promise<FormularAntwort> {
  await zurueckOhneSkript();
  const sprache = (['de', 'tr', 'en'].includes(String(fd.get('sprache'))) ? fd.get('sprache') : 'de') as Sprache;
  const t = await getTranslations({ locale: sprache, namespace: 'kontaktformular' });
  const ergebnis = await verarbeiteFormular({
    art: 'kontakt',
    fd,
    schema: kontaktSchema,
    sprache,
    einwilligungen: () => [{ schluessel: 'kontaktformular.einwilligung', text: t('einwilligung') }],
    mails: (d): GeplanteMail[] => [
      {
        an: d.email,
        vorlage: 'bestaetigung',
        sprache,
        daten: { art: 'kontakt', datum: datumOhneWochentag(new Date(), sprache) },
      },
      { an: 'rolle:kontakt', vorlage: 'benachrichtigung', sprache: 'de', daten: { art: 'kontakt' } },
    ],
  });
  if (ergebnis.status === 'erfolg') return { status: 'erfolg', ansicht: <KontaktErfolg sprache={sprache} /> };
  const fehler = ergebnis.status === 'fehler' ? ergebnis : { status: 'fehler' as const, fehler: 'allgemein' };
  // Formular erneut mit Werten und Fehlern; neuer ALTCHA-Schlüssel (Lösungen sind einmalig)
  return {
    status: 'fehler',
    fehler: fehler.fehler,
    feldFehler: fehler.feldFehler,
    ansicht: <KontaktFormular sprache={sprache} ergebnis={fehler} altchaSchluessel={randomUUID()} />,
  };
}
