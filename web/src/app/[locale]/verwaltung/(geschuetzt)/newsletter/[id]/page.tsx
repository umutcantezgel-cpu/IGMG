import type { JSONContent } from '@tiptap/core';
import { ArrowLeft, Trash2 } from 'lucide-react';
import NextLink from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { AusgabeFormular, VersandFormular } from '@/components/verwaltung/newsletter/AusgabeFormular';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { RichText } from '@/components/website/RichText';
import { datumOhneWochentag } from '@/lib/i18n/format';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { loescheAusgabe, speichereAusgabe, versendeAusgabe } from '@/server/actions/newsletter';
import { empfaengerFuer, ladeAusgabe } from '@/server/queries/verwaltung/newsletter';

/**
 * Verwaltung › Newsletter-Ausgabe: Entwurf schreiben (`neu` legt an), Versand mit Bestätigung; versendete Ausgaben nur
 * lesen (Vorschau). Ohne `newsletter.senden` nur lesen.
 */
export default async function AusgabeSeite({ params, searchParams }: PageProps<'/[locale]/verwaltung/newsletter/[id]'>) {
  const a = await verlangeSeitenRecht('newsletter.lesen');
  const [{ id }, suche] = await Promise.all([params, searchParams]);
  const darfSenden = darf(a.rollen, 'newsletter.senden');
  const neu = id === 'neu';
  if (neu && !darfSenden) redirect('/verwaltung/kein-zugriff');
  const x = neu ? null : await ladeAusgabe(id);
  if (!neu && !x) notFound();
  const [t, tg, empfaenger] = await Promise.all([
    getTranslations('verwaltung.newsletter'),
    getTranslations('verwaltung.shell'),
    x && !x.versendetAm ? empfaengerFuer(x.themen) : Promise.resolve(0),
  ]);
  const zurueck = (
    <NextLink
      href="/verwaltung/newsletter"
      className="inline-flex min-h-12 items-center gap-2 self-start font-bold underline underline-offset-4"
    >
      <ArrowLeft aria-hidden className="size-5" />
      {t('zurueck')}
    </NextLink>
  );
  if (!x)
    return (
      <>
        {zurueck}
        <VerwaltungsKopf titel={t('neuTitel')} kennung={tg('gruppe.kommunikation')} />
        <AusgabeFormular aktion={speichereAusgabe} startwerte={{ themen: [] }} texte={{ De: null, Tr: null, En: null }} modus="neu" />
      </>
    );
  const texte = {
    De: (x.inhalt.de as JSONContent | undefined) ?? null,
    Tr: (x.inhalt.tr as JSONContent | undefined) ?? null,
    En: (x.inhalt.en as JSONContent | undefined) ?? null,
  };
  const bearbeitbar = darfSenden && !x.versendetAm;
  return (
    <>
      {zurueck}
      <VerwaltungsKopf titel={x.betreff.de} kennung={tg('gruppe.kommunikation')} />
      {suche.angelegt ? <Meldung art="erfolg">{t('angelegt')}</Meldung> : null}
      {x.versendetAm ? (
        <Meldung art="info">{t('versand.versendet', { datum: datumOhneWochentag(x.versendetAm, 'de'), anzahl: x.empfaenger })}</Meldung>
      ) : null}
      {bearbeitbar ? (
        <>
          <AusgabeFormular
            aktion={speichereAusgabe}
            startwerte={{
              id: x.id,
              betreffDe: x.betreff.de,
              betreffTr: x.betreff.tr ?? '',
              betreffEn: x.betreff.en ?? '',
              themen: x.themen,
            }}
            texte={texte}
            modus="bearbeiten"
          />
          <section
            aria-labelledby="newsletter-versand"
            className="flex flex-col gap-3 rounded-lg border-2 border-gruen-700 bg-weiss p-5 md:p-6"
          >
            <h2 id="newsletter-versand" className="font-display text-24 font-semibold">
              {t('versand.titel')}
            </h2>
            <VersandFormular aktion={versendeAusgabe} id={x.id} empfaenger={empfaenger} />
          </section>
          <form action={loescheAusgabe}>
            <input type="hidden" name="id" value={x.id} />
            <Button type="submit" variant="outline" className="hover:border-fehler hover:bg-fehler-toenung hover:text-fehler">
              <Trash2 aria-hidden />
              {t('loeschen')}
            </Button>
          </form>
        </>
      ) : (
        <section aria-labelledby="newsletter-vorschau" className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-5 md:p-6">
          <h2 id="newsletter-vorschau" className="font-display text-24 font-semibold">
            {t('vorschau')}
          </h2>
          <RichText doc={texte.De} />
          {!darfSenden && !x.versendetAm ? <p className="text-16 text-tinte-2">{t('versand.keinRecht')}</p> : null}
        </section>
      )}
    </>
  );
}
