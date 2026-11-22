import { ArrowRight, BookOpen, CalendarDays, Clock, GraduationCap, PenLine, UserPlus, type LucideIcon } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Stern8 } from '@/components/website/Icons';
import { pfadFuer, type Ziel } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';

type Eintrag = { schluessel: string; Zeichen: LucideIcon; href: string; neu?: boolean };

/**
 * „Was Sie hier finden“ (Startseite, direkt unter dem Kopf): sechs Einstiege mit je einem Satz Nutzen – Gebetszeiten,
 * Koran, Lern-App, Elifbe, Veranstaltungen, Mitglied werden. Wer die Seite zum ersten Mal sieht, erkennt sofort, was es
 * gibt und wohin ein Klick führt. Die Lern-App (Lernbereich unter `/lern-app/<ui>`: Türkisch bleibt Türkisch, Deutsch und
 * Englisch bekommen die deutsche Oberfläche) steht nur mit dem Schalter `lernapp` da – sonst rückt „Kontakt“ nach, damit
 * das Raster voll bleibt. Fester Teil der Seite wie der Kopf (kein Abschnitt der sortierbaren Liste, F-40). Server-
 * Komponente ohne Programmcode im Browser; ganze Karte klickbar (Link über die Fläche).
 */
export async function Ueberblick({ sprache }: { sprache: Locale }) {
  const [t, lernApp] = await Promise.all([getTranslations('start.ueberblick'), funktionAn('lernapp')]);
  const ziel = (z: Ziel) => pfadFuer(z, sprache);
  const eintraege: Eintrag[] = [
    { schluessel: 'gebetszeiten', Zeichen: Clock, href: ziel('/gebetszeiten') },
    { schluessel: 'quran', Zeichen: BookOpen, href: ziel('/quran') },
    lernApp
      ? { schluessel: 'lernApp', Zeichen: GraduationCap, href: `/lern-app/${sprache === 'tr' ? 'tr' : 'de'}`, neu: true }
      : { schluessel: 'kontakt', Zeichen: ArrowRight, href: ziel('/kontakt') },
    { schluessel: 'elifbe', Zeichen: PenLine, href: ziel('/elifbe') },
    { schluessel: 'veranstaltungen', Zeichen: CalendarDays, href: ziel('/veranstaltungen') },
    { schluessel: 'mitglied', Zeichen: UserPlus, href: ziel('/mitglied-werden') },
  ];
  return (
    <section aria-labelledby="ueberblick-titel" className="border-b border-linie bg-weiss">
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-8 px-4 py-abschnitt-klein md:px-8">
        <div className="flex max-w-einleitung flex-col gap-3">
          <span className="inline-flex items-center gap-2 self-start text-16 font-bold text-gruen-800">
            <Stern8 className="size-4" />
            {t('kennung')}
          </span>
          <h2 id="ueberblick-titel" className="text-display-2">
            {t('titel')}
          </h2>
          <p className="text-20 leading-einleitung text-pretty text-tinte-2">{t('text')}</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {eintraege.map(({ schluessel, Zeichen, href, neu }) => (
            <li
              key={schluessel}
              className="group relative flex items-start gap-4 rounded-lg border border-linie bg-papier p-5 shadow-s1 transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50 md:p-6"
            >
              <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-md bg-gruen-700 text-weiss">
                <Zeichen className="size-6" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <h3 className="flex flex-wrap items-center gap-x-3 gap-y-1 text-24 leading-ueberschrift">
                  <NextLink
                    href={href}
                    prefetch={false}
                    className="text-tinte no-underline group-hover:text-gruen-800 after:absolute after:inset-0 after:rounded-lg"
                  >
                    {t(`${schluessel}.titel`)}
                  </NextLink>
                  {neu ? (
                    <span className="rounded-pill border border-gruen-700 bg-weiss px-2.5 font-text text-16 leading-relaxed font-bold tracking-normal text-gruen-800">
                      {t('neu')}
                    </span>
                  ) : null}
                </h3>
                <p className="text-18 text-pretty text-tinte-2">{t(`${schluessel}.text`)}</p>
                <span className="mt-1 inline-flex items-center gap-2 text-16 font-bold text-gruen-700">
                  {t(`${schluessel}.link`)}
                  <ArrowRight
                    aria-hidden
                    className="size-5 shrink-0 transition duration-(--dauer-rueckmeldung) group-hover:translate-x-1"
                  />
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
