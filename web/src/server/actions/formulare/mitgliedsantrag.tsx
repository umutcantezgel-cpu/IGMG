'use server';

import { randomUUID } from 'node:crypto';
import { getTranslations } from 'next-intl/server';
import { MitgliedsantragErfolg, MitgliedsantragFormular } from '@/components/website/formulare/MitgliedsantragFormular';
import type { FormularAntwort } from '@/lib/formulare/ergebnis';
import { zurueckOhneSkript } from '@/lib/formulare/ohne-skript';
import { verarbeiteFormular, type GeplanteMail } from '@/lib/formulare/verarbeiten';
import { schrittMitFehler, wizardSchritt } from '@/lib/formulare/wizard';
import { datumOhneWochentag } from '@/lib/i18n/format';
import { MITGLIEDSANTRAG_MEHRFACH, MITGLIEDSANTRAG_SCHRITTE, mitgliedsantragSchema } from '@/lib/validierung/formulare/mitgliedsantrag';

type Sprache = 'de' | 'tr' | 'en';

/**
 * Mitgliedsantrag (B06, ADR 0005, E-028). Schritte 1–3: nur prüfen und den nächsten Schritt rendern
 * (kein Speichern, keine Ratenbegrenzung, kein ALTCHA). Letzter Schritt: `verarbeiteFormular` mit der
 * Datenschutz-Einwilligung; Bestätigung an die Person, Benachrichtigung an die Mitgliederverwaltung (ohne Formulardaten).
 */
export async function sendeMitgliedsantrag(_vorher: FormularAntwort | null, fd: FormData): Promise<FormularAntwort> {
  await zurueckOhneSkript();
  const sprache = (['de', 'tr', 'en'].includes(String(fd.get('sprache'))) ? fd.get('sprache') : 'de') as Sprache;
  const stand = wizardSchritt(fd, mitgliedsantragSchema, MITGLIEDSANTRAG_SCHRITTE, MITGLIEDSANTRAG_MEHRFACH);
  if (stand.art === 'schritt') {
    return {
      status: stand.ergebnis ? 'fehler' : 'schritt',
      fehler: stand.ergebnis?.fehler,
      feldFehler: stand.ergebnis?.feldFehler,
      ansicht: <MitgliedsantragFormular sprache={sprache} schritt={stand.schritt} werte={stand.werte} ergebnis={stand.ergebnis} />,
    };
  }
  const t = await getTranslations({ locale: sprache, namespace: 'mitglied' });
  const ergebnis = await verarbeiteFormular({
    art: 'mitgliedsantrag',
    fd,
    schema: mitgliedsantragSchema,
    sprache,
    mehrfach: MITGLIEDSANTRAG_MEHRFACH,
    einwilligungen: () => [{ schluessel: 'mitgliedsantrag.einwilligung.datenschutz', text: t('einwilligung.datenschutzText') }],
    mails: (d): GeplanteMail[] => [
      {
        an: d.email,
        vorlage: 'bestaetigung',
        sprache,
        daten: { art: 'mitgliedsantrag', datum: datumOhneWochentag(new Date(), sprache) },
      },
      { an: 'rolle:mitgliedsantrag', vorlage: 'benachrichtigung', sprache: 'de', daten: { art: 'mitgliedsantrag' } },
    ],
  });
  if (ergebnis.status === 'erfolg') return { status: 'erfolg', ansicht: <MitgliedsantragErfolg sprache={sprache} /> };
  const fehler = ergebnis.status === 'fehler' ? ergebnis : { status: 'fehler' as const, fehler: 'allgemein' };
  // Zurück in den ersten Schritt mit Fehler (Zod) bzw. in den letzten (ALTCHA, Rate); neue ALTCHA-Aufgabe
  return {
    status: 'fehler',
    fehler: fehler.fehler,
    feldFehler: fehler.feldFehler,
    ansicht: (
      <MitgliedsantragFormular
        sprache={sprache}
        schritt={schrittMitFehler(fehler.feldFehler, MITGLIEDSANTRAG_SCHRITTE)}
        werte={fehler.werte}
        ergebnis={fehler}
        altchaSchluessel={randomUUID()}
      />
    ),
  };
}
