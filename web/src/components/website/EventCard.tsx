import { ArrowRight, Calendar, MapPin, Star, Users } from 'lucide-react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import { datumLang, zeitspanne } from '@/lib/i18n/format';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { BildDaten } from '@/lib/medien/bild';
import { cn } from '@/lib/utils';
import type { VeranstaltungsDaten } from '@/server/queries/veranstaltungen';
import { Bildplatzhalter } from './Bildplatzhalter';
import { MedienBild, SIZES_AUFMACHER, SIZES_RASTER } from './MedienBild';
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
/** `band`: Streifen unter der Bildfläche (Listen) bzw. oben (Variante start); `kante`: linke Kante ab lg (Aufmacher). */
const ORG = {
  at: { logo: LOGOS.at, band: 'bg-org-at', kante: 'lg:border-org-at', text: 'text-org-at-text' },
  kt: { logo: LOGOS.kt, band: 'bg-org-kt', kante: 'lg:border-org-kt', text: 'text-org-kt-text' },
  gt: { logo: LOGOS.gt, band: 'bg-org-gt', kante: 'lg:border-org-gt', text: 'text-org-gt-text' },
  kgt: { logo: LOGOS.kgt, band: 'bg-org-kgt', kante: 'lg:border-org-kgt', text: 'text-org-kgt-text' },
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
 * Uhrzeit-Zeile (Befund H-FIX3): Ganztägige Termine zeigen den Hinweis statt „00:00 Uhr“. Fehlt der Hinweistext
 * (Schlüssel `karten.ganztaegig`), entfällt die Zeile, statt eine falsche Uhrzeit zu zeigen. Zeitlogik unverändert.
 */
export function uhrzeitText(v: VeranstaltungsDaten, sprache: Sprache, ganztaegigText: string | null): string | null {
  if (v.ganztaegig) return ganztaegigText;
  return zeitspanne(new Date(v.beginn), v.ende ? new Date(v.ende) : null, sprache);
}

/**
 * EventCard (design/EventCard.dc.html): Variante „start“ (Akzentband, „Mehr erfahren“, ganze Karte klickbar),
 * „liste“ (Bildfläche mit Org-Kante, „Details ansehen“ + „Anmelden“) und „aufmacher“ (wie liste; ab lg zwei Spalten
 * mit Org-Kante am Inhaltsblock, Einsatz in H-B04). Ganze Karte als Link über ::after (wie Design).
 */
export async function EventCard({
  v,
  sprache,
  variante = 'start',
  bild,
}: {
  v: VeranstaltungsDaten;
  sprache: Sprache;
  variante?: 'start' | 'liste' | 'aufmacher';
  /** Bild aus der Mediathek (nur Varianten „liste“ und „aufmacher“); null oder fehlend = Bildplatzhalter */
  bild?: BildDaten | null;
}) {
  const t = await getTranslations('karten');
  const org = v.organisation ? ORG[v.organisation] : null;
  const titel = textMitSprache(v.titel, sprache);
  const ziel = { pathname: '/veranstaltungen/[slug]' as const, params: { slug: v.slug } };
  const datum = await terminDatum(v, sprache);
  // Hinweis „ganztägig“, sobald der Schlüssel in den Sprachdateien steht (Bedarf: karten.ganztaegig)
  const zeit = uhrzeitText(v, sprache, t.has('ganztaegig') ? t('ganztaegig') : null);
  const listenArt = variante !== 'start';
  const aufmacher = variante === 'aufmacher';
  const kante = org ? org.kante : 'lg:border-gruen-700';
  const bildKlassen = aufmacher ? 'h-40 lg:h-full lg:min-h-75' : 'h-40';
  // Ohne Ort und Zielgruppe entfällt die Angabenliste; dann rücken Knöpfe bzw. Link an den Kartenboden
  const angabenZeigen = Boolean(v.ort || v.zielgruppe || v.teilnehmerHinweis);
  const zeile = (Icon: typeof MapPin, label: string, inhalt: React.ReactNode) => (
    <div className="flex items-start gap-3">
      <dt className="flex pt-0.75 text-gruen-700">
        <Icon aria-hidden className="size-5" />
        <span className="sr-only">{label}</span>
      </dt>
      <dd>{inhalt}</dd>
    </div>
  );
  return (
    <article
      data-morph-karte={`v-${v.slug}`}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-lg border border-linie bg-weiss text-18 leading-relaxed shadow-s1 transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:shadow-s2',
        aufmacher && 'lg:grid lg:grid-cols-2',
      )}
    >
      {listenArt ? (
        bild ? (
          <MedienBild bild={bild} sprache={sprache} sizes={aufmacher ? SIZES_AUFMACHER : SIZES_RASTER} className={bildKlassen} />
        ) : (
          <Bildplatzhalter beschriftung={`${t('foto')}: ${titel.text}`} className={bildKlassen} />
        )
      ) : (
        <div aria-hidden className={cn('h-1', org ? org.band : 'bg-gruen-700')} />
      )}
      {listenArt ? <div aria-hidden className={cn('h-1', aufmacher && 'lg:hidden', org ? org.band : 'bg-gruen-700')} /> : null}
      <div className={cn('flex flex-1 flex-col gap-4 p-6', aufmacher && cn('lg:border-l-4', kante))}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('inline-flex items-center rounded-pill px-3 py-0.5 text-16 leading-normal font-bold', TOENUNG[v.kategorie])}>
            {t(`kat_${v.kategorie}`)}
          </span>
          {v.empfohlen ? (
            <span className="inline-flex items-center gap-1.5 rounded-pill border border-gruen-700 bg-weiss px-3 py-px text-16 leading-normal font-bold text-gruen-800">
              <Star aria-hidden className="size-4" />
              {t('empfohlen')}
            </span>
          ) : null}
          {listenArt ? (
            <span className="inline-flex items-center rounded-pill border border-linie bg-sand px-3 py-0.5 text-16 leading-normal font-bold text-tinte-2">
              {t(v.kosten)}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          {/* Zeit zuerst (H-B01): die Terminzeile steht direkt über dem Titel */}
          <p className="flex flex-wrap items-center gap-x-2 text-16 leading-normal font-bold text-gruen-800 tabular-nums">
            <Calendar aria-hidden className="size-5" />
            <span className="sr-only">{t('datum')}</span>
            <span>{datum}</span>
            {zeit ? (
              // Punkt und Uhrzeit als eine Gruppe: bricht die Zeile um, hängt der Punkt nicht allein am Ende
              <span className="inline-flex items-center gap-x-2 whitespace-nowrap">
                <span aria-hidden>·</span>
                <span className="sr-only">{t('uhrzeit')}</span>
                <span>{zeit}</span>
              </span>
            ) : null}
          </p>
          <h3
            lang={titel.lang}
            data-morph="titel"
            className={cn(aufmacher ? 'text-display-2' : 'text-24 leading-tight', 'text-balance break-words')}
          >
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
        {angabenZeigen ? (
          <dl className="mt-auto flex flex-col gap-2 border-t border-linie pt-4">
            {v.ort ? zeile(MapPin, t('ort'), <Text feld={v.ort} sprache={sprache} />) : null}
            {v.zielgruppe || v.teilnehmerHinweis
              ? zeile(Users, t('zielgruppe'), <Text feld={v.zielgruppe ?? v.teilnehmerHinweis} sprache={sprache} />)
              : null}
          </dl>
        ) : null}
        {listenArt ? (
          <div className={cn('flex flex-wrap items-center justify-between gap-3', !angabenZeigen && 'mt-auto')}>
            <Link
              href={ziel}
              aria-label={`${t('details')}: ${titel.text}`}
              className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-700 underline underline-offset-4 after:absolute after:inset-0 after:rounded-lg after:content-['']"
            >
              <span>{t('details')}</span>
              <ArrowRight aria-hidden className="size-5" />
            </Link>
            {v.anmeldungAktiv && !v.vergangen ? (
              <Link
                href={{ ...ziel, hash: 'anmeldung' }}
                aria-label={`${t('anmelden')}: ${titel.text}`}
                className="relative inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-gruen-700 px-4.5 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss active:scale-98"
              >
                <span>{t('anmelden')}</span>
              </Link>
            ) : null}
          </div>
        ) : (
          <Link
            href={ziel}
            aria-label={`${t('mehrErfahren')}: ${titel.text}`}
            className={cn(
              "inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-700 underline underline-offset-4 after:absolute after:inset-0 after:rounded-lg after:content-['']",
              !angabenZeigen && 'mt-auto',
            )}
          >
            <span>{t('mehrErfahren')}</span>
            <ArrowRight aria-hidden className="size-5" />
          </Link>
        )}
      </div>
    </article>
  );
}
