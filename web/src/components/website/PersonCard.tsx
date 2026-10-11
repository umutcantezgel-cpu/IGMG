import { Award, Building2, Calendar, Mail, Phone, UserRound } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Mehrsprachig } from '@/lib/db/schema/typen';
import type { Sprache } from '@/lib/i18n/inhalt';
import { cn } from '@/lib/utils';
import { textMitSprache } from './Text';

/** Angaben zu einer Person; mehrsprachige Texte mit sichtbarem Rückfall auf Deutsch (K-02). */
export type PersonKarte = {
  name: string;
  /** Funktion als Pille, z. B. im aktuellen Vorstand. */
  funktion?: Mehrsprachig;
  /** Rollenzeile als fertiger Text, z. B. „Aktueller Vorsitzender“ (Chronik). Hat Vorrang vor `funktion`. */
  rolle?: string;
  /** Jahr des Amtsbeginns: Pille „Seit …“. */
  seit?: string;
  /** Zeitraum, z. B. „1975–1979“ oder „2025 – Heute“. */
  zeitraum?: string;
  /** Laufende Amtszeit: Pille „Aktuell“ und Rahmen mit 2 px. */
  aktuell?: boolean;
  /** Aufgaben (Vorstand) oder Errungenschaften (Chronik). */
  liste?: Mehrsprachig[];
  email?: string;
  /** Wird nur zusammen mit einer E-Mail-Adresse angezeigt (Design). */
  telefon?: string;
};

/** Initialen aus den ersten zwei Namensworten; Platzhalter „[…]“ bekommen ein Personensymbol (G-05). */
function initialen(name: string): string | null {
  if (name.startsWith('[')) return null;
  const worte = name.split(/\s+/).filter((w) => /^\p{L}/u.test(w));
  if (worte.length === 0) return null;
  return worte
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join('')
    .toLocaleUpperCase('de-DE');
}

/**
 * Karte einer Person (design/PersonCard.dc.html, Blatt C10). Varianten: board (Aufgabenbereiche) und leader
 * (Errungenschaften in der Chronik). Kein Foto: Initialen oder Personensymbol als Ersatz (K-11: Icons aria-hidden).
 * Server-Komponente ohne Interaktion außer dem Mail-Link.
 */
export async function PersonCard({ person, variante, sprache }: { person: PersonKarte; variante: 'board' | 'leader'; sprache: Sprache }) {
  const t = await getTranslations('personCard');
  const funktion = person.funktion ? textMitSprache(person.funktion, sprache) : null;
  const rolle = person.rolle ?? funktion?.text ?? '';
  const rollenSprache = person.rolle ? undefined : funktion?.lang;
  const eintraege = (person.liste ?? []).map((e) => textMitSprache(e, sprache));
  const ListenIcon = variante === 'leader' ? Award : Building2;
  const ini = initialen(person.name);

  return (
    <article
      data-variante={variante}
      className={cn(
        'flex h-full flex-col gap-4 rounded-lg bg-weiss p-6 text-18 leading-normal text-tinte shadow-s1',
        person.aktuell ? 'border-2 border-gruen-700' : 'border border-linie',
      )}
    >
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="flex size-14 shrink-0 items-center justify-center rounded-pill bg-gruen-50 text-18 font-bold text-gruen-800"
        >
          {ini ?? <UserRound aria-hidden className="size-6" />}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-24 leading-tight font-semibold break-words">{person.name}</h3>
          <div className="flex flex-wrap gap-1.5">
            {person.aktuell ? (
              <span className="inline-flex rounded-pill bg-gruen-700 px-2.5 text-16 leading-normal font-bold text-weiss">
                {t('aktuell')}
              </span>
            ) : null}
            {rolle ? (
              <span
                lang={rollenSprache}
                className="inline-flex rounded-pill bg-gruen-50 px-2.5 text-16 leading-normal font-bold text-gruen-800"
              >
                {rolle}
              </span>
            ) : null}
            {person.seit ? (
              <span className="inline-flex rounded-pill border border-linie bg-sand px-2.5 text-16 leading-normal font-bold text-tinte-2">
                {t('seit', { jahr: person.seit })}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      {person.zeitraum ? (
        <div className="flex items-center gap-2 font-bold text-gruen-800">
          <Calendar aria-hidden className="size-5 shrink-0" />
          <span>{person.zeitraum}</span>
        </div>
      ) : null}
      {eintraege.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h4 className="flex items-center gap-2 text-16 font-bold text-tinte-2">
            <ListenIcon aria-hidden className="size-4 shrink-0" />
            {variante === 'leader' ? t('errungenschaften') : t('aufgaben')}
          </h4>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-16 leading-normal">
            {eintraege.map((e, i) => (
              <li key={i} lang={e.lang}>
                {e.text}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {person.email ? (
        <div className="mt-auto flex flex-col gap-1 border-t border-linie pt-3 text-16">
          <h4 className="mb-1 font-bold text-tinte-2">{t('kontakt')}</h4>
          <a
            href={`mailto:${person.email}`}
            aria-label={`${person.email}: ${person.name}`}
            className="flex min-h-12 items-center gap-2 [overflow-wrap:anywhere] text-gruen-700 underline underline-offset-[3px]"
          >
            <Mail aria-hidden className="size-4 shrink-0" />
            {person.email}
          </a>
          {person.telefon ? (
            <span className="flex items-center gap-2 text-tinte-2">
              <Phone aria-hidden className="size-4 shrink-0" />
              {person.telefon}
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
