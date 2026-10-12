import { BookOpen, Calendar, Check, Heart, Users } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { Text } from '@/components/website/Text';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import type { SeitenInhalt } from '@/server/queries/seiteninhalte';
import { KARTE, UEBERSCHRIFT } from './stil';

/**
 * Angebote (Liste aus dem Seiteninhalt) und die Karte „Besucher willkommen“ mit zwei Chips
 * (design/Contact.dc.html:59–67).
 */
export async function AngeboteBesuch({ kontakt }: { kontakt: SeitenInhalt<'kontakt'> }) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('kontakt');
  // Ehrliche Elemente (H-B10): Die Chips sind Hinweise auf Dunkelgrün und sehen nicht wie weiße Knöpfe aus
  const chip = 'inline-flex items-center gap-1.5 rounded-pill bg-gruen-800 px-3 py-0.5 text-16 font-bold text-gruen-50';
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section aria-labelledby="kontakt-angebote" className={cn(KARTE, 'gap-4 lg:col-span-2')}>
        <h2 id="kontakt-angebote" className={UEBERSCHRIFT}>
          <Heart aria-hidden className="size-6 shrink-0 text-gruen-700" />
          {t('angebote.titel')}
        </h2>
        {/* Zwei Spalten ab 768 px, drei ab 1280 px – wie bisher je nach Breite des Feldes (kein Bruch in der Spaltenzahl) */}
        <ul className="grid gap-x-6 gap-y-2 md:grid-cols-2 xl:grid-cols-3">
          {kontakt.angebote.map((angebot, nummer) => (
            <li key={nummer} className="flex items-start gap-2.5">
              <Check aria-hidden className="mt-1 size-5 shrink-0 text-gruen-700" />
              <Text feld={angebot} sprache={sprache} />
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="kontakt-besuch" className="flex min-w-0 flex-col gap-3 rounded-lg bg-gruen-950 p-6 text-weiss">
        <h2 id="kontakt-besuch" className={cn(UEBERSCHRIFT, 'text-weiss')}>
          <Users aria-hidden className="size-6 shrink-0 text-gruen-100" />
          {t('besuch.titel')}
        </h2>
        <Text feld={kontakt.besuchstext} sprache={sprache} als="p" className="text-gruen-50" />
        <ul className="flex flex-wrap gap-2">
          <li className={chip}>
            <BookOpen aria-hidden className="size-4" />
            {t('besuch.fuehrungen')}
          </li>
          <li className={chip}>
            <Calendar aria-hidden className="size-4" />
            {t('besuch.termine')}
          </li>
        </ul>
      </section>
    </div>
  );
}
