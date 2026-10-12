import { ArrowRight, CircleCheck, CircleX, Clock, Info, MapPin, User } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import type { Ziel } from '@/i18n/navigation';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { BildDaten } from '@/lib/medien/bild';
import { cn } from '@/lib/utils';
import type { Anmeldeweg, KursDaten } from '@/server/queries/kurse';
import { Bildplatzhalter } from './Bildplatzhalter';
import { Achtstern } from './Icons';
import { MedienBild, SIZES_RASTER } from './MedienBild';
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
export async function CourseCard({
  kurs,
  sprache,
  bild,
}: {
  kurs: KursDaten;
  sprache: Sprache;
  /** Bild aus der Mediathek; null oder fehlend = Bildplatzhalter wie bisher */
  bild?: BildDaten | null;
}) {
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
  const AktionIcon = zustand === 'join' ? MapPin : ArrowRight;
  const StatusIcon = status.Icon;

  return (
    <article
      className={cn(
        'relative flex h-full flex-col overflow-hidden rounded-lg border border-linie bg-weiss text-18 shadow-s1',
        // Hover nur bei klickbarer Karte (K-007, EventCard): die ganze Karte führt zur Aktion
        ziel && 'transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:shadow-s2',
      )}
    >
      {bild ? (
        <MedienBild bild={bild} sprache={sprache} sizes={SIZES_RASTER} className="h-40 border-b border-linie" />
      ) : (
        <Bildplatzhalter beschriftung={t('foto', { titel })} className="h-40 border-b border-linie" />
      )}
      <div className="flex flex-1 flex-col gap-3.5 p-6">
        <span className={cn('inline-flex items-center gap-1.5 self-start rounded-pill px-3 py-0.5 text-16 font-bold', status.klasse)}>
          <StatusIcon aria-hidden className="size-4" />
          {status.text}
        </span>
        <Text feld={kurs.titel} sprache={sprache} als="h3" className="text-24" />
        {kurs.beschreibung ? (
          <Text feld={kurs.beschreibung} sprache={sprache} als="p" className="max-w-text text-pretty text-tinte-2" />
        ) : null}
        <div className="flex flex-col gap-2 border-t border-linie pt-4">
          <dl className="flex flex-col gap-2">
            {kurs.zielgruppe ? (
              <div className="flex items-start gap-3">
                <dt className="flex pt-0.75 text-gruen-700">
                  <User aria-hidden className="size-5" />
                  <span className="sr-only">{t('zielgruppe')}</span>
                </dt>
                <dd className="font-bold text-pretty">
                  <Text feld={kurs.zielgruppe} sprache={sprache} />
                </dd>
              </div>
            ) : null}
            {kurs.zeiten ? (
              <div className="flex items-start gap-3">
                <dt className="flex pt-0.75 text-gruen-700">
                  <Clock aria-hidden className="size-5" />
                  <span className="sr-only">{t('zeiten')}</span>
                </dt>
                <dd className="text-pretty">
                  <Text feld={kurs.zeiten} sprache={sprache} />
                </dd>
              </div>
            ) : null}
          </dl>
          {kurs.hinweis ? (
            <p className="flex items-start gap-3 text-pretty text-tinte-2">
              <span className="flex pt-0.75 text-gruen-700">
                <Info aria-hidden className="size-5" />
              </span>
              <Text feld={kurs.hinweis} sprache={sprache} />
            </p>
          ) : null}
        </div>
        {kurs.inhalte.length ? (
          <div className="flex flex-col gap-1.5">
            <h4 className="font-text text-16 font-bold text-tinte-2">{t('kursinhalte')}</h4>
            <ul className="flex flex-col gap-0.5 text-16">
              {kurs.inhalte.map((inhalt, n) => (
                <li key={n} className="flex items-start gap-2.5">
                  <Achtstern size={12} className="mt-1.5 shrink-0 text-gruen-700" />
                  <Text feld={inhalt} sprache={sprache} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {/* In der vollbreiten letzten Karte (768–1279 px) bleibt der Knopf so breit wie in den schmalen Karten */}
        <div className="mt-auto pt-2 md:max-w-sm">
          {ziel ? (
            <Link
              href={ziel}
              aria-label={t('linkName', { aktion: aktionText, titel })}
              className={cn(
                // Ganze Karte klickbar über den Pseudo-Bereich (wie EventCard); Rückmeldung B-01
                'flex min-h-12 items-center justify-center gap-2 rounded-md px-5 font-bold no-underline transition duration-(--dauer-rueckmeldung) after:absolute after:inset-0 after:content-[""] active:scale-98',
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
