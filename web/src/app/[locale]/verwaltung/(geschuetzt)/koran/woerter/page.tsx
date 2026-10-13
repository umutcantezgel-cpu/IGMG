import { PencilLine } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { schriftQuran } from '@/app/schriften-quran';
import { Button } from '@/components/ui/button';
import { Fortschritt, KoranNavigation } from '@/components/verwaltung/koran/Teile';
import { QURAN_RECHTE, verlangeKoranZugang } from '@/components/verwaltung/koran/zugang';
import { ListenKarte, ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { prozent } from '@/lib/religioes/freigabe';
import { ladeSurenFortschritt, type SureFortschritt } from '@/server/queries/verwaltung/koran';

/**
 * Verwaltung › Koran & Hadith › Wortbedeutungen (ADR 0030, MN-05): Fortschritt je Sure (Wortformen mit geprüfter
 * Bedeutung de/tr, Einträge zur Prüfung). Cüz 30 steht als Empfehlung vorn.
 */
export default async function WoerterSeite() {
  await verlangeKoranZugang(QURAN_RECHTE);
  const [t, { suren, cuz30Ab }] = await Promise.all([getTranslations('verwaltung.koran'), ladeSurenFortschritt()]);
  const name = (s: SureFortschritt) => t('woerter.sureName', { nr: s.nr, name: s.umschrift || s.nr });
  const fortschritt = (teil: number, s: SureFortschritt) => (
    <Fortschritt
      teil={teil}
      gesamt={s.formen}
      text={t('woerter.fortschritt', { teil, gesamt: s.formen, prozent: prozent(teil, s.formen) })}
    />
  );
  const werkstatt = (s: SureFortschritt) => (
    <Button asChild variant="outline">
      <NextLink href={`/verwaltung/koran/woerter/${s.nr}`} aria-label={t('woerter.werkstattAria', { nr: s.nr, name: s.umschrift })}>
        <PencilLine aria-hidden />
        {t('woerter.werkstatt')}
      </NextLink>
    </Button>
  );
  const arabisch = (s: SureFortschritt) => (
    <span lang="ar" dir="rtl" className="font-quran text-arabisch-3">
      {s.nameAr}
    </span>
  );

  const tabelle = (liste: SureFortschritt[], beschriftung: string) => (
    <TabellenRahmen
      beschriftung={beschriftung}
      mobil={
        <ul className="flex flex-col gap-3">
          {liste.map((s) => (
            <ListenKarte
              key={s.nr}
              titel={name(s)}
              angaben={[
                { label: t('woerter.spalteFormen'), wert: s.formen, zahl: true },
                { label: t('woerter.spalteDe'), wert: fortschritt(s.de, s) },
                { label: t('woerter.spalteTr'), wert: fortschritt(s.tr, s) },
                { label: t('woerter.spalteOffen'), wert: s.offen, zahl: true },
              ]}
              aktionen={werkstatt(s)}
            />
          ))}
        </ul>
      }
    >
      <table className="w-full text-start">
        <thead className="bg-sand text-16">
          <tr>
            <th scope="col" className="px-4 py-3 text-start">
              {t('woerter.spalteSure')}
            </th>
            <th scope="col" className="px-4 py-3 text-end">
              {t('woerter.spalteFormen')}
            </th>
            <th scope="col" className="px-4 py-3 text-start">
              {t('woerter.spalteDe')}
            </th>
            <th scope="col" className="px-4 py-3 text-start">
              {t('woerter.spalteTr')}
            </th>
            <th scope="col" className="px-4 py-3 text-end">
              {t('woerter.spalteOffen')}
            </th>
            <th scope="col" className="px-4 py-3 text-end">
              <span className="sr-only">{t('woerter.spalteAktion')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {liste.map((s) => (
            <tr key={s.nr} className="border-t border-linie">
              <th scope="row" className="px-4 py-2 text-start font-bold">
                <span className="flex flex-wrap items-baseline gap-x-3">
                  {name(s)}
                  {arabisch(s)}
                </span>
              </th>
              <td className="px-4 py-2 text-end tabular-nums">{s.formen}</td>
              <td className="px-4 py-2">{fortschritt(s.de, s)}</td>
              <td className="px-4 py-2">{fortschritt(s.tr, s)}</td>
              <td className="px-4 py-2 text-end tabular-nums">{s.offen}</td>
              <td className="px-4 py-2 text-end">{werkstatt(s)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TabellenRahmen>
  );

  const cuz30 = suren.filter((s) => s.nr >= cuz30Ab);
  const uebrige = suren.filter((s) => s.nr < cuz30Ab);
  return (
    <div className={`flex flex-col gap-8 ${schriftQuran.variable}`}>
      <VerwaltungsKopf kennung={t('kennung')} titel={t('woerter.titel')} einleitung={t('woerter.einleitung')} />
      <KoranNavigation aktiv="woerter" />
      {suren.length === 0 ? (
        <ListenLeer text={t('woerter.leer')} />
      ) : (
        <>
          <section aria-labelledby="woerter-cuz30" className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 id="woerter-cuz30" className="text-30 font-bold">
                {t('woerter.cuz30Titel')}
              </h2>
              <p className="max-w-text text-18 text-tinte-2">{t('woerter.cuz30Text')}</p>
            </div>
            {tabelle(cuz30, `${t('woerter.tabelle')} – ${t('woerter.cuz30Titel')}`)}
          </section>
          <section aria-labelledby="woerter-alle" className="flex flex-col gap-4">
            <h2 id="woerter-alle" className="text-30 font-bold">
              {t('woerter.alleTitel')}
            </h2>
            {tabelle(uebrige, `${t('woerter.tabelle')} – ${t('woerter.alleTitel')}`)}
          </section>
        </>
      )}
    </div>
  );
}
