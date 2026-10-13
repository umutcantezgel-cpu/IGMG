'use server';

import { randomUUID } from 'node:crypto';
import { getTranslations } from 'next-intl/server';
import { after } from 'next/server';
import { NewsletterErfolg, NewsletterFormular } from '@/components/website/newsletter/NewsletterFormular';
import { db, schema } from '@/lib/db';
import type { FormularAntwort } from '@/lib/formulare/ergebnis';
import { zurueckOhneSkript } from '@/lib/formulare/ohne-skript';
import { begrenzeBestaetigungen, pruefeEinsendung } from '@/lib/formulare/verarbeiten';
import { funktionAn } from '@/lib/funktionen';
import { verschluessele } from '@/lib/krypto';
import { versendeOffeneMails } from '@/lib/mail/ausgang';
import { meldeAn } from '@/lib/newsletter/dienst';
import { NEWSLETTER_VORLAGE } from '@/lib/newsletter/vorlagen';
import { newsletterSchema } from '@/lib/validierung/formulare/newsletter';

type Sprache = 'de' | 'tr' | 'en';

/**
 * Newsletter-Anmeldung (AUFTRAG 3.10, K-B, ADR 0005): Schutz über `pruefeEinsendung` (Rate je IP → Honigtopf →
 * ALTCHA → Zod), dann Double-Opt-in über `meldeAn` (Adresse verschlüsselt, Eindeutigkeit per HMAC). Die Mail
 * „Anmeldung bestätigen“ geht über den Mail-Ausgang (verschlüsselt, höchstens 3 Bestätigungen je Adresse und Tag).
 * Die Antwort ist immer dieselbe – sie verrät nie, ob die Adresse schon angemeldet ist. Ohne Funktionsschalter
 * „newsletter“ nimmt die Action nichts an.
 */
export async function meldeNewsletterAn(_vorher: FormularAntwort | null, fd: FormData): Promise<FormularAntwort> {
  await zurueckOhneSkript();
  const sprache = (['de', 'tr', 'en'].includes(String(fd.get('sprache'))) ? fd.get('sprache') : 'de') as Sprache;
  if (!(await funktionAn('newsletter'))) {
    return {
      status: 'fehler',
      fehler: 'allgemein',
      ansicht: (
        <NewsletterFormular sprache={sprache} ergebnis={{ status: 'fehler', fehler: 'allgemein' }} altchaSchluessel={randomUUID()} />
      ),
    };
  }
  const pruefung = await pruefeEinsendung({ kennung: 'newsletter', fd, schema: newsletterSchema, mehrfach: ['themen'] });
  if (!pruefung.ok) {
    // Honigtopf ausgefüllt: scheinbarer Erfolg, nichts gespeichert
    if (pruefung.ergebnis.status === 'erfolg') return { status: 'erfolg', ansicht: <NewsletterErfolg sprache={sprache} /> };
    const fehler = pruefung.ergebnis.status === 'fehler' ? pruefung.ergebnis : { status: 'fehler' as const, fehler: 'allgemein' };
    return {
      status: 'fehler',
      fehler: fehler.fehler,
      feldFehler: fehler.feldFehler,
      ansicht: <NewsletterFormular sprache={sprache} ergebnis={fehler} altchaSchluessel={randomUUID()} />,
    };
  }
  const d = pruefung.daten;
  // Die Einwilligung ist der Text, den die Person gesehen hat (Sprache der Seite); seine Version speichert `meldeAn`
  const t = await getTranslations({ locale: sprache, namespace: 'newsletter' });
  const token = await meldeAn(d.email, d.mailSprache, d.themen, t('einwilligung'));
  if (token) {
    await db.transaction(async (tx) => {
      const mails = await begrenzeBestaetigungen([{ an: d.email, vorlage: 'bestaetigung', sprache: d.mailSprache, daten: { token } }], tx);
      if (!mails.length) return;
      const v = verschluessele({ an: d.email, daten: { token } });
      await tx.insert(schema.mailAusgang).values({
        vorlage: NEWSLETTER_VORLAGE.bestaetigen,
        sprache: d.mailSprache,
        datenVerschluesselt: v.daten,
        schluesselId: v.schluesselId,
      });
    });
    after(() => versendeOffeneMails().catch(() => undefined));
  }
  return { status: 'erfolg', ansicht: <NewsletterErfolg sprache={sprache} /> };
}
