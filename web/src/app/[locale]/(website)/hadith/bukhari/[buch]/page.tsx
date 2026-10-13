import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { BuchBlaettern } from '@/components/website/hadith/BuchBlaettern';
import { BuchStern } from '@/components/website/hadith/BuchStern';
import { HadithListe } from '@/components/website/hadith/HadithListe';
import { QuellenZeile } from '@/components/website/hadith/QuellenZeile';
import { morphStil } from '@/components/website/morph';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { buchNummer } from '@/lib/hadith/anzeige';
import { text } from '@/lib/i18n/inhalt';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeHadithBuch, ladeHadithBuchNummern } from '@/server/queries/hadith';

export const ensureStatic = 'navigation';

type Parameter = { params: Promise<{ locale: string; buch: string }> };

/**
 * Beim Bau alle Bücher – aber nur mit eingeschaltetem Schalter `hadith_gesamt` (Umgebung, sonst Einstellung). Aus
 * (Produktion bis MN-06) oder ohne Import: nur der Platzhalter „_“, jede Buchadresse antwortet mit 404.
 */
export async function generateStaticParams() {
  const nummern = (await funktionAn('hadith_gesamt')) ? await ladeHadithBuchNummern() : [];
  return (nummern.length ? nummern.map(String) : ['_']).map((buch) => ({ buch }));
}

async function lade(roh: string) {
  const nr = buchNummer(roh);
  if (nr === null || !(await funktionAn('hadith_gesamt'))) return null;
  return ladeHadithBuch(nr);
}

export async function generateMetadata({ params }: Parameter): Promise<Metadata> {
  const { buch } = await params;
  const daten = await lade(buch);
  if (!daten) return {};
  const t = await getTranslations('hadith.buch');
  return metadatenFuer({
    pfad: { pathname: '/hadith/bukhari/[buch]', params: { buch: String(daten.buch.nr) } },
    titel: t('metaTitel', { titel: daten.buch.titelEn, nr: daten.buch.nr }),
    beschreibung: t('untertitel', { anzahl: daten.buch.anzahl }),
  });
}

/** Buchseite /hadith/bukhari/[buch] (AUFTRAG 3.3). URL-Daten nur innerhalb von Suspense lesen (MUSTER 1). */
export default function HadithBuchSeite({ params }: Parameter) {
  return (
    <Suspense fallback={null}>
      <HadithBuch params={params} />
    </Suspense>
  );
}

/**
 * Kopf mit der Buchnummer im Achtstern (Morph-Ziel der Kachel) und dem Titel der Quelle (Englisch), darunter alle
 * Hadithe des Buchs in der Reihenfolge der Quelle, Blättern zwischen den Büchern und die Quellenzeile.
 * Ab lg begleitet eine schmale Spalte den Lesetext (Umfang, Nummernbereich, Rückweg).
 */
async function HadithBuch({ params }: Parameter) {
  const { buch } = await params;
  const daten = await lade(buch);
  if (!daten) notFound();
  const sprache = (await getLocale()) as Locale;
  const [t, th] = await Promise.all([getTranslations('hadith.buch'), getTranslations('hadith')]);
  const { buch: b, hadithe } = daten;
  const name = text(daten.sammlung.name, sprache) || th('bukhari.titel');
  const kennung = t('kennung', { nr: b.nr });
  return (
    <Seitenrahmen
      bereich="islam"
      seite="hadith"
      sprachZiel={{ pathname: '/hadith/bukhari/[buch]', params: { buch: String(b.nr) } }}
      pfad={[{ label: th('breadcrumb'), ziel: '/hadith' }, { label: name, ziel: '/hadith/bukhari' }, { label: kennung }]}
    >
      <PageHeader
        oben={
          <Link
            href="/hadith/bukhari"
            className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-700 underline underline-offset-4"
          >
            <ArrowLeft aria-hidden className="size-5" />
            {t('zurueck')}
          </Link>
        }
        kennung={`${name} · ${kennung}`}
        titel={b.titelEn}
        titelLang="en"
        titelId="buch-titel"
        titelStil={morphStil(`hb-${b.nr}-titel`, 'text')}
        untertitel={t('untertitel', { anzahl: b.anzahl })}
        zierde={<BuchStern nr={b.nr} art="kopf" stil={morphStil(`hb-${b.nr}-bild`)} />}
      />
      <div className="mx-auto grid max-w-(--container-inhalt) items-start gap-10 px-4 pt-8 pb-abschnitt-klein md:px-8 md:pt-12 lg:grid-cols-3 lg:gap-12">
        <div className="min-w-0 lg:col-span-2">
          {hadithe.length ? <HadithListe hadithe={hadithe} sammlungName={name} beschriftung={t('liste', { nr: b.nr })} /> : null}
        </div>
        {/* Begleitspalte: ab lg mitlaufend neben dem Lesetext, auf dem Telefon nach der Liste */}
        <aside aria-label={t('dieserBand')} className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-8">
          {hadithe.length ? (
            <dl className="grid grid-cols-2 gap-3 rounded-lg border border-linie bg-weiss p-5 shadow-s1">
              <div className="flex flex-col">
                <dt className="text-16 text-tinte-2">{t('umfang')}</dt>
                <dd className="font-bold">{th('bukhari.anzahl', { anzahl: b.anzahl })}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-16 text-tinte-2">{t('nummern')}</dt>
                <dd className="font-bold tabular-nums">
                  {hadithe[0].nummer}–{hadithe.at(-1)?.nummer}
                </dd>
              </div>
            </dl>
          ) : null}
          <BuchBlaettern vorher={daten.vorher} naechstes={daten.naechstes} spalte />
          <QuellenZeile />
        </aside>
      </div>
    </Seitenrahmen>
  );
}
