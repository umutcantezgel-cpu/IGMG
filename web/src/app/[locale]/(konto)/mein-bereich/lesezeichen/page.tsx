import { BookMarked, RefreshCw } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Abschnitt, Status } from '@/components/mein-bereich/Abschnitt';
import { LesezeichenListe } from '@/components/mein-bereich/LesezeichenListe';
import { MeinBereichRahmen } from '@/components/mein-bereich/MeinBereichRahmen';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { verlangeMeinBereich } from '@/lib/konto/zugang';
import { ladeQuranStand } from '@/server/queries/quran';

/** Je Anfrage gerendert, wartet auf die Sitzung (siehe Layout). */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meinBereich.meta');
  return { title: t('lesezeichen') };
}

/**
 * Koran-Lesezeichen (AUFTRAG 3.1: „Lesezeichen lokal, Sync nur nach Einschalten in Mein Bereich“): Liste aus dem
 * Gerätespeicher; der Sync-Schalter ist sichtbar, aber noch ohne Funktion (ehrlicher Hinweis), bis der Abgleich
 * über `api/mein/**` gebaut ist.
 */
export default async function LesezeichenSeite() {
  const sprache = (await getLocale()) as Locale;
  const k = await verlangeMeinBereich(sprache);
  const t = await getTranslations('meinBereich.lesezeichen');
  const { suren } = await ladeQuranStand();
  const namen = Object.fromEntries(suren.map((s) => [s.nr, s.nameAr]));
  return (
    <MeinBereichRahmen
      konto={k}
      aktuell="lesezeichen"
      titel={t('titel')}
      untertitel={t('untertitel')}
      sprachZiel="/mein-bereich/lesezeichen"
    >
      <Abschnitt id="liste" Icon={BookMarked} titel={t('listeTitel')} text={t('lokal')}>
        <LesezeichenListe
          sureLink={pfadFuer({ pathname: '/quran/[sure]', params: { sure: '__SURE__' } }, sprache)}
          quranLink={pfadFuer('/quran', sprache)}
          namen={namen}
        />
      </Abschnitt>
      <Abschnitt
        id="sync"
        Icon={RefreshCw}
        titel={t('sync.titel')}
        rechts={<Status an={false} text={t('sync.bald')} />}
        text={t('sync.text')}
      >
        <label className="flex min-h-12 cursor-not-allowed items-center gap-3 text-tinte-2">
          <span className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-pill border border-rand bg-sand">
            <input
              type="checkbox"
              role="switch"
              disabled
              aria-describedby="sync-hinweis"
              className="peer absolute inset-0 cursor-not-allowed opacity-0"
            />
            <span aria-hidden className="ml-1 size-5 rounded-pill bg-weiss shadow-s1" />
          </span>
          <span className="font-bold">{t('sync.label')}</span>
        </label>
        <p id="sync-hinweis" className="mt-2 text-16 text-tinte-2">
          {t('sync.hinweis')}
        </p>
      </Abschnitt>
    </MeinBereichRahmen>
  );
}
