'use server';

import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';
import { AnmeldeErfolg, AnmeldeFormular } from '@/components/website/veranstaltungen/AnmeldeFormular';
import { inhaltGeaendert } from '@/lib/cache/aktualisieren';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import type { FormularAntwort } from '@/lib/formulare/ergebnis';
import { zurueckOhneSkript } from '@/lib/formulare/ohne-skript';
import { verarbeiteFormular, type GeplanteMail } from '@/lib/formulare/verarbeiten';
import { datumLang, datumOhneWochentag, zeitspanne } from '@/lib/i18n/format';
import { text } from '@/lib/i18n/inhalt';
import { anmeldungSchema } from '@/lib/validierung/formulare/veranstaltungsanmeldung';
import { ladeAnmeldezahl, ladeVeranstaltung } from '@/server/queries/veranstaltungen';

type Sprache = 'de' | 'tr' | 'en';

/** Veröffentlichte Veranstaltung (nicht im Papierkorb) über die ID; null, wenn unbekannt. */
async function ladeNachId(id: unknown) {
  const p = z.uuid().safeParse(id);
  if (!p.success) return null;
  const [z0] = await db
    .select({ slug: schema.veranstaltung.slug })
    .from(schema.veranstaltung)
    .where(eq(schema.veranstaltung.id, p.data))
    .limit(1);
  return z0 ? ladeVeranstaltung(z0.slug) : null;
}

/**
 * Anmeldung zu einer Veranstaltung (B04, E-020, ADR 0005). Öffentlich: Schutz und Speichern über
 * `verarbeiteFormular`; zusätzlich: Veranstaltung veröffentlicht, Anmeldung aktiv, nicht vergangen, genug Plätze.
 * Danach Platzzahl sofort aktualisieren (Tag anmeldungen:<id>). Antwort mit auf dem Server gerenderter Ansicht (E-028).
 */
export async function meldeAn(_vorher: FormularAntwort | null, fd: FormData): Promise<FormularAntwort> {
  await zurueckOhneSkript();
  const sprache = (['de', 'tr', 'en'].includes(String(fd.get('sprache'))) ? fd.get('sprache') : 'de') as Sprache;
  const t = await getTranslations({ locale: sprache, namespace: 'veranstaltung.formular' });
  let veranstaltung: { id: string; titel: string; termin: string; organisation: string | null; loeschenAb: Date | null } | null = null;
  const ergebnis = await verarbeiteFormular({
    art: 'veranstaltungsanmeldung',
    fd,
    schema: anmeldungSchema,
    sprache,
    anzahl: (d) => d.personen,
    loeschenAb: () => (veranstaltung as { loeschenAb: Date | null } | null)?.loeschenAb ?? null,
    bezugId: (d) => d.veranstaltungId,
    einwilligungen: () => [{ schluessel: 'veranstaltung.formular.einwilligung', text: t('einwilligung') }],
    pruefen: async (d) => {
      const v = await ladeNachId(d.veranstaltungId);
      if (!v || !v.anmeldungAktiv || v.vergangen) return { status: 'fehler', fehler: 'geschlossen' };
      if (v.plaetze !== null) {
        const belegt = await ladeAnmeldezahl(v.id);
        if (belegt + d.personen > v.plaetze) return { status: 'fehler', fehler: 'ausgebucht' };
      }
      const beginn = new Date(v.beginn);
      veranstaltung = {
        id: v.id,
        titel: text(v.titel, sprache),
        termin: `${datumLang(beginn, sprache)}, ${zeitspanne(beginn, v.ende ? new Date(v.ende) : null, sprache)}`,
        organisation: v.organisation,
        // Einmalige Termine: 30 Tage nach dem Ende löschen (Einwilligungstext, M-050); Reihen setzt C08
        loeschenAb: v.regel ? null : new Date(new Date(v.ende ?? v.beginn).getTime() + 30 * 86_400_000),
      };
      return null;
    },
    mails: (d): GeplanteMail[] => {
      const v = veranstaltung!;
      return [
        {
          an: d.email,
          vorlage: 'bestaetigung',
          sprache,
          daten: {
            art: 'veranstaltungsanmeldung',
            veranstaltung: v.titel,
            termin: v.termin,
            datum: datumOhneWochentag(new Date(), sprache),
          },
        },
        {
          an: `rolle:veranstaltungsanmeldung${v.organisation ? `:${v.organisation}` : ''}`,
          vorlage: 'benachrichtigung',
          sprache: 'de',
          daten: { art: 'veranstaltungsanmeldung' },
        },
      ];
    },
  });
  if (ergebnis.status === 'erfolg') {
    // Honigtopf: scheinbarer Erfolg ohne Veranstaltung – dann nichts zu aktualisieren
    if (veranstaltung) inhaltGeaendert(TAG.anmeldungenVon((veranstaltung as { id: string }).id));
    return { status: 'erfolg', ansicht: <AnmeldeErfolg sprache={sprache} /> };
  }
  const fehler = ergebnis.status === 'fehler' ? ergebnis : { status: 'fehler' as const, fehler: 'allgemein' };
  // Formular erneut mit Werten und Fehlern; freie Plätze frisch, neuer ALTCHA-Schlüssel (Lösungen sind einmalig)
  const v = await ladeNachId(fd.get('veranstaltungId'));
  const verfuegbar = v && v.plaetze !== null ? Math.max(0, v.plaetze - (await ladeAnmeldezahl(v.id))) : null;
  return {
    status: 'fehler',
    fehler: fehler.fehler,
    feldFehler: fehler.feldFehler,
    ansicht: (
      <AnmeldeFormular
        veranstaltungId={v?.id ?? ''}
        sprache={sprache}
        verfuegbar={verfuegbar}
        ergebnis={fehler}
        altchaSchluessel={randomUUID()}
      />
    ),
  };
}
