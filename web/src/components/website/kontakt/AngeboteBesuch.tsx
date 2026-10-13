import { ArrowRight, Check } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { Text } from '@/components/website/Text';
import type { Locale } from '@/i18n/routing';
import type { SeitenInhalt } from '@/server/queries/seiteninhalte';
import { UEBERSCHRIFT } from './stil';

/**
 * Angebote (Liste aus dem Seiteninhalt) und die Karte „Besucher willkommen“ (design/Contact.dc.html:59–67).
 * H-E03: Die Besuchskarte ist eine helle Sandfläche mit Rand und führt mit einem Link zum Nachrichtenformular.
 */
export async function AngeboteBesuch({ kontakt }: { kontakt: SeitenInhalt<'kontakt'> }) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('kontakt');
  return (
    <div className="grid items-start gap-6 lg:grid-cols-3">
      <section aria-labelledby="kontakt-angebote" className="flex min-w-0 flex-col gap-4 lg:col-span-2">
        <h2 id="kontakt-angebote" className="text-display-2">
          {t('angebote.titel')}
        </h2>
        {/* Zwei Spalten ab 768 px, auch breit: In Drittelspalten brachen längere Angebote zweizeilig um (Sichtabnahme C3) */}
        <ul className="grid gap-x-6 gap-y-2 md:grid-cols-2">
          {kontakt.angebote.map((angebot, nummer) => (
            <li key={nummer} className="flex items-start gap-2.5">
              <Check aria-hidden className="mt-1 size-5 shrink-0 text-gruen-700" />
              <Text feld={angebot} sprache={sprache} />
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="kontakt-besuch" className="flex min-w-0 flex-col gap-3 rounded-lg border border-linie bg-sand p-6">
        <h2 id="kontakt-besuch" className={UEBERSCHRIFT}>
          {t('besuch.titel')}
        </h2>
        <Text feld={kontakt.besuchstext} sprache={sprache} als="p" className="text-tinte-2" />
        <a
          href="#nachricht"
          className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-700 underline underline-offset-4"
        >
          {t('besuch.vereinbaren')}
          <ArrowRight aria-hidden className="size-5" />
        </a>
      </section>
    </div>
  );
}
