import { Mail, MessageSquare } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/website/PageHeader';
import { Abschnitt, Entwurfshinweis, Rechtsgliederung } from '@/components/website/rechtliches/Rechtstext';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Link } from '@/i18n/link';
import { metadatenFuer } from '@/lib/seo/metadaten';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('barrierefreiheit');
  return metadatenFuer({ pfad: '/barrierefreiheit', titel: t('titel'), beschreibung: t('untertitel') });
}

const ABSCHNITTE = ['geltung', 'stand', 'umgesetzt', 'einschraenkungen', 'erstellung', 'feedback', 'schlichtung'] as const;

/** Platzhalter „[…]“ gestrichelt hervorheben (wie auf den Rechtsseiten), damit sie beim Prüfen auffallen (G-05). */
function MitPlatzhaltern({ text }: { text: string }) {
  return text.split(/(\[[^\]]*\])/).map((teil, i) =>
    teil.startsWith('[') && teil.endsWith(']') ? (
      <span key={i} className="rounded-sm border border-dashed border-rand px-1">
        {teil}
      </span>
    ) : (
      teil
    ),
  );
}

function Absatz({ text }: { text: string }) {
  return (
    <p className="max-w-(--container-text) text-pretty">
      <MitPlatzhaltern text={text} />
    </p>
  );
}

function Liste({ punkte }: { punkte: string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 ps-6">
      {punkte.map((p) => (
        <li key={p} className="max-w-(--container-text) text-pretty">
          <MitPlatzhaltern text={p} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Erklärung zur Barrierefreiheit (AUFTRAG 5): markierter Entwurf nach dem Muster der BITV 2.0 mit BFSG-Bezug. Offene
 * Angaben (Stand, Datum, Kontakt, Frist, Schlichtungsstelle) sind Platzhalter der Gemeinde; die bekannten
 * Einschränkungen nennen arabische Texte mit Bildschirmlesern und Rezitationen ohne Transkript. Rückmeldung über
 * /kontakt. Statisch.
 */
export default async function BarrierefreiheitSeite() {
  const t = await getTranslations('barrierefreiheit');
  return (
    <Seitenrahmen bereich="keiner" seite="barrierefreiheit" sprachZiel="/barrierefreiheit" pfad={[{ label: t('kennung') }]}>
      <PageHeader kennung={t('kennung')} titel={t('titel')} untertitel={t('untertitel')} />
      <Rechtsgliederung
        titel={t('inhaltsverzeichnis')}
        punkte={ABSCHNITTE.map((id) => ({ id, titel: t(`abschnitte.${id}`) }))}
        entwurf={<Entwurfshinweis titel={t('entwurf')} text={t('entwurfText')} />}
      >
        <Abschnitt id="geltung" titel={t('abschnitte.geltung')}>
          <Absatz text={t('geltung.text')} />
          <Absatz text={t('geltung.grundlage')} />
        </Abschnitt>
        <Abschnitt id="stand" titel={t('abschnitte.stand')}>
          <Absatz text={t('stand.text')} />
        </Abschnitt>
        <Abschnitt id="umgesetzt" titel={t('abschnitte.umgesetzt')}>
          <Absatz text={t('umgesetzt.text')} />
          <Liste punkte={t.raw('umgesetzt.punkte') as string[]} />
        </Abschnitt>
        <Abschnitt id="einschraenkungen" titel={t('abschnitte.einschraenkungen')}>
          <Absatz text={t('einschraenkungen.text')} />
          <Liste punkte={t.raw('einschraenkungen.punkte') as string[]} />
        </Abschnitt>
        <Abschnitt id="erstellung" titel={t('abschnitte.erstellung')}>
          <Absatz text={t('erstellung.text')} />
        </Abschnitt>
        <Abschnitt id="feedback" titel={t('abschnitte.feedback')}>
          <Absatz text={t('feedback.text')} />
          <p className="flex items-center gap-2.5">
            <Mail aria-hidden className="size-5 shrink-0 text-gruen-700" />
            <MitPlatzhaltern text={t('feedback.email')} />
          </p>
          <Link
            href="/kontakt"
            className="inline-flex min-h-12 items-center gap-2 self-start rounded-md bg-gruen-700 px-6 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss active:scale-98"
          >
            <MessageSquare aria-hidden className="size-5" />
            {t('feedback.kontakt')}
          </Link>
        </Abschnitt>
        <Abschnitt id="schlichtung" titel={t('abschnitte.schlichtung')}>
          <Absatz text={t('schlichtung.text')} />
        </Abschnitt>
      </Rechtsgliederung>
    </Seitenrahmen>
  );
}
