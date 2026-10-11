import { ArrowRight, CircleCheck, CircleX, Clock, Info, LogIn, User } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import type { Ziel } from '@/i18n/navigation';
import type { Sprache } from '@/lib/i18n/inhalt';
import { cn } from '@/lib/utils';
import type { Anmeldeweg, KursDaten } from '@/server/queries/kurse';
import { Bildplatzhalter } from './Bildplatzhalter';
import { Text, textMitSprache } from './Text';

/**
 * Lokales Ziel je Anmeldeweg (design/CourseCard.dc.html Z38, Blatt C09): Voranmeldung bzw. Kontakt › Anfahrt.
 * Geschlossen hat kein Ziel; die Aktion ist dann eine deaktivierte Schaltfläche.
 */
export function zielFuer(anmeldeweg: Anmeldeweg): Ziel | null {
  if (anmeldeweg === 'register') return { pathname: '/bildung/voranmeldung' };
  if (anmeldeweg === 'join') return { pathname: '/kontakt', hash: 'karte' };
  return null;
}

/**
 * Kursangebots-Karte (design/CourseCard.dc.html, Blatt C09): Bildfläche, Status, Titel, Beschreibung, Zielgruppe,
 * Zeiten, Kursinhalte und Aktion. Oberflächentexte aus messages/bereiche/korankurse.json (Namensraum kurskarte),
 * Kursdaten aus der Tabelle kurs. Serverkomponente, ohne Interaktion im Browser (K-12).
 */
export async function CourseCard({ kurs, sprache }: { kurs: KursDaten; sprache: Sprache }) {
  const t = await getTranslations('kurskarte');
  const titel = textMitSprache(kurs.titel, sprache).text;
  const zustand = kurs.anmeldeweg;
  const ziel = zielFuer(zustand);
  const status =
    zustand === 'closed'
      ? { text: t('statusGeschlossen'), klasse: 'bg-fehler-toenung text-fehler', Icon: CircleX }
      : {
          text: zustand === 'register' ? t('statusVoranmeldung') : t('statusKeineAnmeldung'),
          klasse: 'bg-gruen-50 text-gruen-800',
          Icon: CircleCheck,
        };
  const aktionText = zustand === 'register' ? t('aktionVoranmeldung') : zustand === 'join' ? t('aktionTeilnahme') : t('aktionGesperrt');
  const AktionIcon = zustand === 'join' ? LogIn : ArrowRight;
  const StatusIcon = status.Icon;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-linie bg-weiss text-18 shadow-s1 transition-[box-shadow,border-color] hover:border-gruen-700 hover:shadow-s2">
      <Bildplatzhalter beschriftung={t('foto', { titel })} className="h-[150px] border-b border-linie" />
      <div className="flex flex-1 flex-col gap-3.5 p-6">
        <span className={cn('inline-flex items-center gap-1.5 self-start rounded-pill px-3 py-0.5 text-16 font-bold', status.klasse)}>
          <StatusIcon aria-hidden className="size-4" />
          {status.text}
        </span>
        <Text feld={kurs.titel} sprache={sprache} als="h3" className="text-24" />
        {kurs.beschreibung ? <Text feld={kurs.beschreibung} sprache={sprache} als="p" className="text-pretty text-tinte-2" /> : null}
        <dl className="flex flex-col gap-2">
          {kurs.zielgruppe ? (
            <div className="flex items-start gap-3">
              <dt className="flex pt-[3px] text-gruen-700">
                <User aria-hidden className="size-5" />
                <span className="sr-only">{t('zielgruppe')}</span>
              </dt>
              <dd className="font-bold">
                <Text feld={kurs.zielgruppe} sprache={sprache} />
              </dd>
            </div>
          ) : null}
          {kurs.zeiten ? (
            <div className="flex items-start gap-3">
              <dt className="flex pt-[3px] text-gruen-700">
                <Clock aria-hidden className="size-5" />
                <span className="sr-only">{t('zeiten')}</span>
              </dt>
              <dd>
                <Text feld={kurs.zeiten} sprache={sprache} />
              </dd>
            </div>
          ) : null}
        </dl>
        {kurs.hinweis ? (
          <p className="flex items-start gap-2.5 rounded-md bg-tag-bildung-bg px-3.5 py-2.5 text-16 text-tinte">
            <Info aria-hidden className="mt-0.5 size-[18px] shrink-0 text-tag-bildung" />
            <Text feld={kurs.hinweis} sprache={sprache} />
          </p>
        ) : null}
        {kurs.inhalte.length ? (
          <div className="flex flex-col gap-1.5">
            <h4 className="font-text text-16 font-bold text-tinte-2">{t('kursinhalte')}</h4>
            <ul className="flex list-disc flex-col gap-0.5 pl-5.5 text-16">
              {kurs.inhalte.map((inhalt, n) => (
                <li key={n}>
                  <Text feld={inhalt} sprache={sprache} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="mt-auto pt-2">
          {ziel ? (
            <Link
              href={ziel}
              aria-label={t('linkName', { aktion: aktionText, titel })}
              className={cn(
                'flex min-h-12 items-center justify-center gap-2 rounded-md px-5 font-bold no-underline',
                zustand === 'register'
                  ? 'bg-gruen-700 text-weiss hover:bg-gruen-800 hover:text-weiss'
                  : 'border-2 border-gruen-700 bg-weiss text-gruen-800 hover:bg-gruen-50 hover:text-gruen-800',
              )}
            >
              <AktionIcon aria-hidden className="size-5" />
              {aktionText}
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-md border border-dashed border-rand bg-sand px-5 font-bold text-tinte-2"
            >
              <CircleX aria-hidden className="size-5" />
              {aktionText}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
