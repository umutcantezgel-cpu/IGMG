'use server';

import { randomUUID } from 'node:crypto';
import { getTranslations } from 'next-intl/server';
import { MoscheeAnfrageErfolg, MoscheeAnfrageFormular } from '@/components/website/formulare/MoscheeAnfrageFormular';
import type { FormularAntwort } from '@/lib/formulare/ergebnis';
import { zurueckOhneSkript } from '@/lib/formulare/ohne-skript';
import { verarbeiteFormular, type GeplanteMail } from '@/lib/formulare/verarbeiten';
import { schrittMitFehler, wizardSchritt } from '@/lib/formulare/wizard';
import { datumOhneWochentag } from '@/lib/i18n/format';
import { MOSCHEE_MEHRFACH, MOSCHEE_SCHRITTE, moscheeAnfrageSchema } from '@/lib/validierung/formulare/moschee-anfrage';

type Sprache = 'de' | 'tr' | 'en';

/**
 * Webseite für Moscheen (B07, Blatt S22, ADR 0005, E-028). Schritte 1–2: nur prüfen und den nächsten Schritt rendern
 * (kein Speichern, keine Ratenbegrenzung, kein ALTCHA). Letzter Schritt: `verarbeiteFormular` mit der
 * Datenschutz-Einwilligung; Bestätigung an die anfragende Person, Benachrichtigung an die zuständige Rolle
 * (ohne Formulardaten).
 */
export async function sendeMoscheeAnfrage(_vorher: FormularAntwort | null, fd: FormData): Promise<FormularAntwort> {
  await zurueckOhneSkript();
  const sprache = (['de', 'tr', 'en'].includes(String(fd.get('sprache'))) ? fd.get('sprache') : 'de') as Sprache;
  const stand = wizardSchritt(fd, moscheeAnfrageSchema, MOSCHEE_SCHRITTE, MOSCHEE_MEHRFACH);
  if (stand.art === 'schritt') {
    return {
      status: stand.ergebnis ? 'fehler' : 'schritt',
      fehler: stand.ergebnis?.fehler,
      feldFehler: stand.ergebnis?.feldFehler,
      ansicht: <MoscheeAnfrageFormular sprache={sprache} schritt={stand.schritt} werte={stand.werte} ergebnis={stand.ergebnis} />,
    };
  }
  const t = await getTranslations({ locale: sprache, namespace: 'moscheeAnfrage' });
  const ergebnis = await verarbeiteFormular({
    art: 'moschee_anfrage',
    fd,
    schema: moscheeAnfrageSchema,
    sprache,
    mehrfach: MOSCHEE_MEHRFACH,
    einwilligungen: () => [{ schluessel: 'moscheeAnfrage.feld.einwilligung', text: t('feld.einwilligung') }],
    mails: (d): GeplanteMail[] => [
      {
        an: d.email,
        vorlage: 'bestaetigung',
        sprache,
        daten: { art: 'moschee_anfrage', datum: datumOhneWochentag(new Date(), sprache) },
      },
      { an: 'rolle:moschee_anfrage', vorlage: 'benachrichtigung', sprache: 'de', daten: { art: 'moschee_anfrage' } },
    ],
  });
  if (ergebnis.status === 'erfolg') return { status: 'erfolg', ansicht: <MoscheeAnfrageErfolg sprache={sprache} /> };
  const fehler = ergebnis.status === 'fehler' ? ergebnis : { status: 'fehler' as const, fehler: 'allgemein' };
  // Zurück in den Schritt mit dem ersten Fehler (Zod); bei ALTCHA oder Ratenbegrenzung im letzten Schritt
  return {
    status: 'fehler',
    fehler: fehler.fehler,
    feldFehler: fehler.feldFehler,
    ansicht: (
      <MoscheeAnfrageFormular
        sprache={sprache}
        schritt={schrittMitFehler(fehler.feldFehler, MOSCHEE_SCHRITTE)}
        werte={fehler.werte}
        ergebnis={fehler}
        altchaSchluessel={randomUUID()}
      />
    ),
  };
}
