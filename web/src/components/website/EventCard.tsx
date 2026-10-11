import { ArrowRight, Calendar, Clock, MapPin, Star, Users } from 'lucide-react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import { datumLang, zeitspanne } from '@/lib/i18n/format';
import type { Sprache } from '@/lib/i18n/inhalt';
import { cn } from '@/lib/utils';
import type { VeranstaltungsDaten } from '@/server/queries/veranstaltungen';
import { Bildplatzhalter } from './Bildplatzhalter';
import { LOGOS } from './navigation';
import { Text, textMitSprache } from './Text';

/** Tönung je Kategorie (design/EventCard.dc.html CAT/TONE) – nur Token-Klassen. */
const TOENUNG: Record<VeranstaltungsDaten['kategorie'], string> = {
  gebet: 'bg-tag-neuigkeiten-bg text-tag-neuigkeiten',
  bildung: 'bg-tag-bildung-bg text-tag-bildung',
  gemeinde: 'bg-tag-gemeinde-bg text-tag-gemeinde',
  kultur: 'bg-tag-veranstaltung-bg text-tag-veranstaltung',
  jugend: 'bg-tag-jugend-bg text-tag-jugend',
  frauen: 'bg-org-kt-toenung text-org-kt-text',
};
const ORG = {
  at: { logo: LOGOS.at, band: 'bg-org-at', text: 'text-org-at-text' },
  kt: { logo: LOGOS.kt, band: 'bg-org-kt', text: 'text-org-kt-text' },
  gt: { logo: LOGOS.gt, band: 'bg-org-gt', text: 'text-org-gt-text' },
  kgt: { logo: LOGOS.kgt, band: 'bg-org-kgt', text: 'text-org-kgt-text' },
} as const;

/** Datumstext: wiederkehrend wörtlich („Jeden Samstag“, Laufbuch D-10), sonst „Mo., 28. Juli 2025“. */
export async function terminDatum(v: VeranstaltungsDaten, sprache: Sprache): Promise<string> {
  const t = await getTranslations('termine');
  const w = v.wiederholung;
  if (w.art === 'woechentlich' && w.wochentage.length === 1 && w.intervall === 1)
    return t('woechentlich', { tag: String(w.wochentage[0]) });
  if (w.art === 'monatlich_wochentag' && w.intervall === 1)
    return t('monatlich', { position: String(w.position), tag: String(w.wochentag) });
  if (w.art === 'taeglich' && w.intervall === 1) return t('taeglich');
  return datumLang(new Date(v.beginn), sprache);
}

/**
 * EventCard (design/EventCard.dc.html): Variante „start“ (Akzentband, „Mehr erfahren“, ganze Karte klickbar)
 * und „liste“ (Bildfläche, „Details ansehen“ + „Anmelden“). Ganze Karte als Link über ::after (wie Design).
 */
export async function EventCard({
  v,
  sprache,
  variante = 'start',
}: {
  v: VeranstaltungsDaten;
  sprache: Sprache;
  variante?: 'start' | 'liste';
}) {
  const t = await getTranslations('karten');
  const org = v.organisation ? ORG[v.organisation] : null;
  const titel = textMitSprache(v.titel, sprache);
  const ziel = { pathname: '/veranstaltungen/[slug]' as const, params: { slug: v.slug } };
  const datum = await terminDatum(v, sprache);
  const zeit = zeitspanne(new Date(v.beginn), v.ende ? new Date(v.ende) : null, sprache);
  const zeile = (Icon: typeof Calendar, label: string, inhalt: React.ReactNode, fett = false) => (
    <div className="flex items-start gap-3">
      <dt className="flex pt-[3px] text-gruen-700">
        <Icon aria-hidden className="size-5" />
        <span className="sr-only">{label}</span>
      </dt>
      <dd className={cn(fett && 'font-bold')}>{inhalt}</dd>
    </div>
  );
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-linie bg-weiss text-18 leading-relaxed shadow-s1 transition-[box-shadow,border-color] hover:border-gruen-700 hover:shadow-s2">
      {variante === 'liste' ? (
        <Bildplatzhalter beschriftung={`${t('foto')}: ${titel.text}`} className="h-40 border-b border-linie" />
      ) : (
        <div aria-hidden className={cn('h-1', org ? org.band : 'bg-gruen-700')} />
      )}
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('inline-flex items-center rounded-pill px-3 py-0.5 text-16 leading-normal font-bold', TOENUNG[v.kategorie])}>
            {t(`kat_${v.kategorie}`)}
          </span>
          {v.empfohlen ? (
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-gruen-700 px-3 py-0.5 text-16 leading-normal font-bold text-weiss">
              <Star aria-hidden className="size-4" />
              {t('empfohlen')}
            </span>
          ) : null}
          {variante === 'liste' ? (
            <span className="inline-flex items-center rounded-pill border border-linie bg-sand px-3 py-0.5 text-16 leading-normal font-bold text-tinte-2">
              {t(v.kosten)}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <h3 lang={titel.lang} className="text-24 leading-tight text-balance break-words">
            {titel.text}
          </h3>
          {org ? (
            <div className="flex items-center gap-2 text-16 leading-snug text-tinte-2">
              <Image src={org.logo} alt="" width={24} height={24} className="size-6 shrink-0 rounded-sm border border-linie" />
              <span>
                {t('organisiertVon')} <strong className={org.text}>{t(`org_${v.organisation}`)}</strong>
              </span>
            </div>
          ) : null}
        </div>
        <Text feld={v.kurztext} sprache={sprache} als="p" className="text-pretty text-tinte-2" />
        <dl className="mt-auto flex flex-col gap-2 border-t border-linie pt-4">
          {zeile(Calendar, t('datum'), datum, true)}
          {zeile(Clock, t('uhrzeit'), zeit)}
          {v.ort ? zeile(MapPin, t('ort'), <Text feld={v.ort} sprache={sprache} />) : null}
          {v.zielgruppe || v.teilnehmerHinweis
            ? zeile(Users, t('zielgruppe'), <Text feld={v.zielgruppe ?? v.teilnehmerHinweis} sprache={sprache} />)
            : null}
        </dl>
        {variante === 'liste' ? (
          <div className="flex flex-wrap gap-2">
            <Link
              href={ziel}
              aria-label={`${t('details')}: ${titel.text}`}
              className="inline-flex min-h-12 flex-auto items-center justify-center gap-2 rounded-md bg-gruen-700 px-[18px] font-bold text-weiss no-underline hover:bg-gruen-800 hover:text-weiss"
            >
              <span>{t('details')}</span>
              <ArrowRight aria-hidden className="size-5" />
            </Link>
            {v.anmeldungAktiv && !v.vergangen ? (
              <Link
                href={{ ...ziel, hash: 'anmeldung' }}
                aria-label={`${t('anmelden')}: ${titel.text}`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-[18px] font-bold text-gruen-800 no-underline hover:bg-gruen-50 hover:text-gruen-800"
              >
                <span>{t('anmelden')}</span>
              </Link>
            ) : null}
          </div>
        ) : (
          <Link
            href={ziel}
            aria-label={`${t('mehrErfahren')}: ${titel.text}`}
            className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-700 underline underline-offset-4 after:absolute after:inset-0 after:rounded-lg after:content-['']"
          >
            <span>{t('mehrErfahren')}</span>
            <ArrowRight aria-hidden className="size-5" />
          </Link>
        )}
      </div>
    </article>
  );
}
