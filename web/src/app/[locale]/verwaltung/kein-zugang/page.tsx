import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import NextLink from 'next/link';
import { redirect } from 'next/navigation';
import { AbmeldenKnopf } from '@/components/konto/AbmeldenKnopf';
import { AnmeldeRahmen } from '@/components/verwaltung/anmeldung/AnmeldeRahmen';
import { pfadFuer } from '@/i18n/navigation';
import { funktionAn } from '@/lib/funktionen';
import { ladeAngemeldet } from '@/lib/rechte/pruefe';

/**
 * Angemeldet, aber ohne Verwaltungsrolle (Endprüfung Stufe C): ein ehrlicher Hinweis statt „Zwei-Faktor einrichten“.
 * Nennt keine Rollen und keine Daten, nur die Wege weiter – „Mein Bereich“ (nur mit eingeschalteten Konten) und
 * Abmelden. Ohne Sitzung → Anmeldung, mit Rolle → Verwaltung; die Rechteprüfung jeder Verwaltungsseite bleibt
 * `verlangeSitzung` bzw. `verlangeSeitenRecht`.
 */
export default async function KeinZugangSeite() {
  const a = await ladeAngemeldet();
  if (!a) redirect('/verwaltung/anmelden');
  if (a.rollen.length > 0) redirect('/verwaltung');
  const [t, konten] = await Promise.all([getTranslations('verwaltung.keinZugang'), funktionAn('konten')]);
  return (
    <AnmeldeRahmen titel={t('titel')} untertitel={t('text')}>
      <div className="flex flex-wrap items-center gap-3">
        {konten ? (
          <NextLink
            href={pfadFuer('/mein-bereich', 'de')}
            prefetch={false}
            className="inline-flex min-h-12 druck items-center justify-center gap-2 rounded-md bg-gruen-700 px-5 text-18 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss"
          >
            {t('meinBereich')}
            <ArrowRight aria-hidden className="size-5" />
          </NextLink>
        ) : null}
        <AbmeldenKnopf sprache="de" text={t('abmelden')} />
      </div>
    </AnmeldeRahmen>
  );
}
