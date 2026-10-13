import type { JSONContent } from '@tiptap/core';
import { ArrowLeft, Trash2 } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { BesondererTagFormular } from '@/components/verwaltung/besondere-tage/BesondererTagFormular';
import { Meldung } from '@/components/verwaltung/Meldung';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { datumOhneWochentag } from '@/lib/i18n/format';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { heuteBerlin } from '@/lib/zeit/heute';
import { entferneBesonderenTag, speichereBesonderenTag } from '@/server/actions/besondere-tage';
import { ladeBesonderenTag } from '@/server/queries/verwaltung/besondere-tage';

/**
 * Verwaltung › Besonderer Tag: Datum korrigieren, Titel und Beschreibung, Übersetzungen, Freigabe (ADR 0030).
 * `neu` legt einen eigenen Tag an (Art „sonstiges“ vorbelegt).
 */
export default async function BesondererTagBearbeiten({ params, searchParams }: PageProps<'/[locale]/verwaltung/besondere-tage/[id]'>) {
  const a = await verlangeSeitenRecht('kalender.bearbeiten');
  const [{ id }, suche] = await Promise.all([params, searchParams]);
  const neu = id === 'neu';
  const z = neu ? null : await ladeBesonderenTag(id);
  if (!neu && !z) notFound();
  const [t, tg, heute] = await Promise.all([
    getTranslations('verwaltung.besondereTage'),
    getTranslations('verwaltung.shell'),
    heuteBerlin(),
  ]);
  const darfFreigeben = darf(a.rollen, 'religioes.freigeben');
  const startwerte: Record<string, string> = z
    ? {
        id: z.id,
        art: z.art,
        datum: z.datum,
        titelDe: z.titel.de,
        titelTr: z.titel.tr ?? '',
        titelEn: z.titel.en ?? '',
        bestaetigen: z.freigabe === 'geprueft' ? 'ja' : '',
      }
    : { art: 'sonstiges', datum: heute.datum };
  const texte = {
    De: (z?.beschreibung?.de as JSONContent | undefined) ?? null,
    Tr: (z?.beschreibung?.tr as JSONContent | undefined) ?? null,
    En: (z?.beschreibung?.en as JSONContent | undefined) ?? null,
  };
  const jahr = (z?.datum ?? heute.datum).slice(0, 4);
  return (
    <>
      <NextLink
        href={`/verwaltung/besondere-tage?jahr=${jahr}`}
        className="inline-flex min-h-12 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <VerwaltungsKopf titel={z ? z.titel.de : t('neuTitel')} kennung={tg('gruppe.inhalte')} />
      {suche.angelegt ? <Meldung art="erfolg">{t('angelegt')}</Meldung> : null}
      {z?.freigabe === 'geprueft' && z.geprueftAm ? (
        <Meldung art="info">{t('geprueftVon', { datum: datumOhneWochentag(z.geprueftAm, 'de') })}</Meldung>
      ) : null}
      <BesondererTagFormular
        aktion={speichereBesonderenTag}
        startwerte={startwerte}
        texte={texte}
        modus={neu ? 'neu' : 'bearbeiten'}
        darfFreigeben={darfFreigeben}
      />
      {z ? (
        <form action={entferneBesonderenTag} className="flex flex-wrap items-center gap-3 rounded-lg border border-linie bg-weiss p-5">
          <input type="hidden" name="id" value={z.id} />
          <Button type="submit" variant="outline" className="hover:border-fehler hover:bg-fehler-toenung hover:text-fehler">
            <Trash2 aria-hidden />
            {t('entfernen')}
          </Button>
          <span className="text-16 text-tinte-2">{t('entfernenText')}</span>
        </form>
      ) : null}
    </>
  );
}
