import { ArrowRight, ExternalLink } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Stern8 } from '@/components/website/Icons';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import {
  fuerOrganisation,
  gemeinschaftsthemen,
  neuesteHutba,
  sichtbareEintraege,
  type OrganisationKuerzel,
} from '@/lib/dachverband/auswahl';
import { netzwerkZiel } from '@/lib/dachverband/netzwerk';
import { cn } from '@/lib/utils';
import { heuteBerlin } from '@/lib/zeit/heute';
import { ladeSeiteninhalt } from '@/server/queries/seiteninhalte';
import { DachverbandKarte, EXTERN_LINK, sprachHinweis } from './DachverbandKarte';
import { HutbaKarte } from './HutbaKarte';

const SEKUNDAER =
  'inline-flex min-h-12 items-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5.5 font-bold text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) druck hover:bg-gruen-50 hover:text-gruen-800';
const TEXTLINK = 'inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-700 underline underline-offset-4';

/** Gemeinschaftsthemen neben der Predigt auf der Startseite, Einträge im Kasten auf /nachrichten. */
const THEMEN_START = 3;
const EINTRAEGE_NACHRICHTEN = 5;

type Variante =
  | { variante: 'startseite'; sprache: Locale }
  | { variante: 'nachrichten'; sprache: Locale }
  | { variante: 'organisation'; sprache: Locale; kuerzel: OrganisationKuerzel };

/**
 * Abschnitt „Aus dem Dachverband“ (Plan Marktstart P3, E-044 Nr. 2): Freitagspredigt und Gemeinschaftsthemen der IGMG aus
 * dem Seiteninhalt „dachverband“ – nur Links, keine Bilder und keine Anfragen beim Aufruf (K-14), reine
 * Server-Komponente (K-12, 0 kB Client-JavaScript). Sichtbar sind Einträge mit Schalter „sichtbar“, die nicht abgelaufen
 * sind (heutiges Datum aus dem Cache, die Seiten bleiben statisch). Ohne passende Einträge erscheint nichts.
 * - `startseite`: Abschnitt der Startseite (F-40-Ordnung) mit Predigt-Karte und bis zu drei Gemeinschaftsthemen.
 * - `nachrichten`: Kasten unter den Ankündigungen mit den fünf neuesten Einträgen.
 * - `organisation`: Einträge der Art, die zur Organisation gehört (KT Frauen, GT Jugend, KGT junge Frauen; AT keine).
 */
export async function DachverbandAbschnitt(props: Variante) {
  const { sprache } = props;
  const [inhalt, heute, t] = await Promise.all([ladeSeiteninhalt('dachverband'), heuteBerlin(), getTranslations('dachverband')]);
  const eintraege = inhalt.eintraege;

  if (props.variante === 'organisation') {
    const liste = fuerOrganisation(eintraege, props.kuerzel, heute.datum);
    if (!liste.length) return null;
    const id = `${props.kuerzel}-dachverband`;
    return (
      <section aria-labelledby={id} className="flex min-w-0 flex-col gap-4 border-t border-linie pt-6">
        <h3 id={id} className="font-text text-20 leading-snug font-bold tracking-normal">
          {t('abschnitt.organisationTitel')}
        </h3>
        <ul className="grid gap-4 md:grid-cols-2">
          {liste.slice(0, 4).map((e) => (
            <li key={e.schluessel} className="min-w-0">
              <DachverbandKarte eintrag={e} sprache={sprache} stufe="h4" />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const alle = netzwerkZiel('freitagspredigt', sprache);
  const alleHinweis = sprachHinweis({ aufDeutsch: t('aufDeutsch'), aufTuerkisch: t('aufTuerkisch') }, alle.zielSprache, sprache);
  const alleText = t('abschnitt.alleHutbas');

  if (props.variante === 'nachrichten') {
    const liste = sichtbareEintraege(eintraege, heute.datum).slice(0, EINTRAEGE_NACHRICHTEN);
    if (!liste.length) return null;
    return (
      <section aria-labelledby="dachverband-titel" className="mb-10 flex flex-col gap-5 md:mb-14">
        <div className="flex flex-col gap-2">
          <h2 id="dachverband-titel" className="flex items-center gap-3 text-display-2">
            <Stern8 className="size-6 shrink-0 text-gruen-800" />
            {t('abschnitt.kennung')}
          </h2>
          <p className="max-w-text text-18 text-pretty text-tinte-2">{t('abschnitt.nachrichtenText')}</p>
        </div>
        <ul className="grid min-w-0 overflow-hidden rounded-lg border border-linie bg-weiss shadow-s1">
          {liste.map((e) => (
            <li key={e.schluessel} className="border-t border-linie first:border-t-0">
              <DachverbandKarte eintrag={e} sprache={sprache} rahmen={false} />
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <a
            href={alle.href}
            hrefLang={alle.zielSprache}
            rel="noopener noreferrer"
            aria-label={`${alleHinweis ? `${alleText} ${alleHinweis}` : alleText}: ${t('externeSeite')}`}
            className={EXTERN_LINK}
          >
            <span>{alleText}</span>
            {alleHinweis ? <span className="font-normal text-tinte-2">{alleHinweis}</span> : null}
            <ExternalLink aria-hidden className="size-4 shrink-0" />
          </a>
          <Link href="/igmg" className={TEXTLINK}>
            <span>{t('abschnitt.mehrIgmg')}</span>
            <ArrowRight aria-hidden className="size-5" />
          </Link>
        </div>
      </section>
    );
  }

  const hutba = neuesteHutba(eintraege, heute.datum);
  const themen = gemeinschaftsthemen(eintraege, heute.datum, THEMEN_START);
  if (!hutba && !themen.length) return null;
  return (
    <section aria-labelledby="dachverband-titel" className="border-t border-linie bg-sand">
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-8 px-4 py-abschnitt md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="flex max-w-einleitung flex-col gap-3">
            <span className="inline-flex items-center gap-2 text-16 font-bold text-gruen-800">
              <Stern8 className="size-4" />
              {t('abschnitt.kennung')}
            </span>
            <h2 id="dachverband-titel" className="text-display-2">
              {t('abschnitt.titel')}
            </h2>
            <p className="text-20 leading-einleitung text-pretty text-tinte-2">{t('abschnitt.text')}</p>
          </div>
          <Link href="/igmg" className={SEKUNDAER}>
            <span>{t('abschnitt.mehrIgmg')}</span>
            <ArrowRight aria-hidden className="size-5" />
          </Link>
        </div>
        <div className={cn('grid items-start gap-6', hutba && themen.length ? 'lg:grid-cols-2' : '')}>
          {hutba ? <HutbaKarte eintrag={hutba} sprache={sprache} /> : null}
          {themen.length ? (
            <div className="flex min-w-0 flex-col gap-4">
              <h3 className="font-text text-20 leading-snug font-bold tracking-normal">{t('abschnitt.themenTitel')}</h3>
              <ul className="flex flex-col gap-4">
                {themen.map((e) => (
                  <li key={e.schluessel}>
                    <DachverbandKarte eintrag={e} sprache={sprache} stufe="h4" />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
