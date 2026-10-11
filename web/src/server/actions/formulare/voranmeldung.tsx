'use server';

import { randomUUID } from 'node:crypto';
import { getTranslations } from 'next-intl/server';
import { VoranmeldungErfolg, VoranmeldungFormular } from '@/components/website/formulare/VoranmeldungFormular';
import type { FormularAntwort } from '@/lib/formulare/ergebnis';
import { verarbeiteFormular, type GeplanteMail } from '@/lib/formulare/verarbeiten';
import { schrittMitFehler, wizardSchritt } from '@/lib/formulare/wizard';
import { datumOhneWochentag } from '@/lib/i18n/format';
import { VORANMELDUNG_SCHRITTE, voranmeldungSchema } from '@/lib/validierung/formulare/voranmeldung';

type Sprache = 'de' | 'tr' | 'en';

/**
 * Schüler-Voranmeldung (B05, ADR 0005, E-028). Schritte 1–3: nur prüfen und den nächsten Schritt rendern
 * (kein Speichern, keine Ratenbegrenzung, kein ALTCHA). Letzter Schritt: `verarbeiteFormular` mit zwei
 * Einwilligungen; Bestätigung an Elternteil 1, Benachrichtigung an die zuständigen Rollen (ohne Formulardaten).
 */
export async function sendeVoranmeldung(_vorher: FormularAntwort | null, fd: FormData): Promise<FormularAntwort> {
  const sprache = (['de', 'tr', 'en'].includes(String(fd.get('sprache'))) ? fd.get('sprache') : 'de') as Sprache;
  const stand = wizardSchritt(fd, voranmeldungSchema, VORANMELDUNG_SCHRITTE);
  if (stand.art === 'schritt') {
    return {
      status: stand.ergebnis ? 'fehler' : 'schritt',
      fehler: stand.ergebnis?.fehler,
      feldFehler: stand.ergebnis?.feldFehler,
      ansicht: <VoranmeldungFormular sprache={sprache} schritt={stand.schritt} werte={stand.werte} ergebnis={stand.ergebnis} />,
    };
  }
  const t = await getTranslations({ locale: sprache, namespace: 'voranmeldung' });
  const ergebnis = await verarbeiteFormular({
    art: 'voranmeldung',
    fd,
    schema: voranmeldungSchema,
    sprache,
    einwilligungen: () => [
      { schluessel: 'voranmeldung.einwilligung.kontakt', text: t('einwilligung.kontakt') },
      { schluessel: 'voranmeldung.einwilligung.datenschutz', text: t('einwilligung.datenschutz') },
    ],
    mails: (d): GeplanteMail[] => [
      {
        an: d.eltern1Email,
        vorlage: 'bestaetigung',
        sprache,
        daten: { art: 'voranmeldung', datum: datumOhneWochentag(new Date(), sprache) },
      },
      { an: 'rolle:voranmeldung', vorlage: 'benachrichtigung', sprache: 'de', daten: { art: 'voranmeldung' } },
    ],
  });
  if (ergebnis.status === 'erfolg') return { status: 'erfolg', ansicht: <VoranmeldungErfolg sprache={sprache} /> };
  const fehler = ergebnis.status === 'fehler' ? ergebnis : { status: 'fehler' as const, fehler: 'allgemein' };
  // Zurück in den ersten Schritt mit Fehler (Zod) bzw. in den letzten (ALTCHA, Rate); neue ALTCHA-Aufgabe
  return {
    status: 'fehler',
    fehler: fehler.fehler,
    feldFehler: fehler.feldFehler,
    ansicht: (
      <VoranmeldungFormular
        sprache={sprache}
        schritt={schrittMitFehler(fehler.feldFehler, VORANMELDUNG_SCHRITTE)}
        werte={fehler.werte}
        ergebnis={fehler}
        altchaSchluessel={randomUUID()}
      />
    ),
  };
}
