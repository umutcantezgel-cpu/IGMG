import { ArrowRight } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { textMitSprache } from '@/components/website/Text';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { klassen } from '@/lib/klassen';
import { ladeWissensThema } from '@/server/queries/wissen';
import { EntwurfHinweis } from './EntwurfHinweis';

export type WissenErklaerungProps = {
  /** Schlüssel des Wissensthemas, z. B. `hajj-umrah`, `islamic-calendar`, `zakat-fitra-qurban`, `friday-prayer`. */
  slug: string;
  /** Sprache der Texte; ohne Angabe die Sprache der Seite. */
  sprache?: Locale;
  /** Ebene der Überschrift (Titel des Themas) passend zur einbettenden Seite; Standard 2. */
  ebene?: 2 | 3;
  className?: string;
};

/**
 * Einbettbare Erklärung aus „Islamisches Wissen“ (Plan Marktstart P5, ADR 0047) für andere Seiten wie `/hadsch-umra`,
 * `/kalender`, `/ramadan` und `/spenden`: Titel, Kurztext und „Mehr erfahren“ auf `/islamisches-wissen/<slug>`. Ist das
 * Thema noch nicht religiös geprüft (nur mit dem Schalter `website_wissen_vorschau` sichtbar), steht der kompakte Hinweis
 * „Entwurf zur Prüfung – noch nicht vom Imam geprüft“ vor dem Text. Ist das Thema nicht sichtbar (Schalter aus und nicht
 * geprüft, Papierkorb, ausgeblendet, unbekannt oder ohne Datenbank), liefert die Komponente `null` – die Seite bleibt ohne
 * Lücke. Server-Komponente ohne Client-Code (K-12); Daten über die gecachte Abfrage `ladeWissensThema`.
 */
export async function WissenErklaerung({ slug, sprache, ebene = 2, className }: WissenErklaerungProps) {
  const thema = await ladeWissensThema(slug);
  if (!thema) return null;
  const locale = sprache ?? ((await getLocale()) as Locale);
  const t = await getTranslations({ locale, namespace: 'wissen.entwurf' });
  const titel = textMitSprache(thema.titel, locale);
  const kurz = thema.kurztext ? textMitSprache(thema.kurztext, locale) : null;
  const Ueberschrift = ebene === 3 ? 'h3' : 'h2';
  const id = `wissen-erklaerung-${thema.slug}`;
  return (
    <section
      aria-labelledby={id}
      data-wissen-erklaerung={thema.slug}
      className={klassen('flex max-w-text flex-col gap-3 rounded-lg border border-linie bg-weiss p-5 md:p-6', className)}
    >
      <Ueberschrift id={id} lang={titel.lang} className="text-24 text-balance">
        {titel.text}
      </Ueberschrift>
      {thema.entwurf ? <EntwurfHinweis kompakt titel={t('titel')} text={t(thema.kiEntwurf ? 'kompaktKi' : 'kompakt')} /> : null}
      {kurz?.text ? (
        <p lang={kurz.lang} className="text-18 text-pretty text-tinte-2">
          {kurz.text}
        </p>
      ) : null}
      <Link
        href={{ pathname: '/islamisches-wissen/[thema]', params: { thema: thema.slug } }}
        aria-label={`${t('mehr')}: ${titel.text}`}
        className="inline-flex min-h-12 w-fit items-center gap-1.5 font-bold"
      >
        {t('mehr')}
        <ArrowRight aria-hidden className="size-5" />
      </Link>
    </section>
  );
}
