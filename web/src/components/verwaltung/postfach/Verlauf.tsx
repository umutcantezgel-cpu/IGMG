import { getTranslations } from 'next-intl/server';
import { Meldung } from '@/components/verwaltung/Meldung';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { cn } from '@/lib/utils';
import type { PostfachZustand } from '@/server/actions/postfach';
import type { UnterhaltungDetail } from '@/server/queries/verwaltung/postfach';
import { AntwortFormular } from './AntwortFormular';

type Aktion = (vorher: PostfachZustand, fd: FormData) => Promise<PostfachZustand>;

/**
 * Verlauf einer Unterhaltung (rechte Spalte): Betreff, Teilnehmende, alle Nachrichten in zeitlicher Reihenfolge und
 * das Antwortformular. Eigene Nachrichten stehen rechts, fremde links mit dem Absendernamen. Text als Klartext
 * (React escaped), Zeilenumbrüche bleiben erhalten (whitespace-pre-line).
 */
export async function Verlauf({
  unterhaltung: u,
  gesendet,
  aktion,
}: {
  unterhaltung: UnterhaltungDetail;
  gesendet: boolean;
  aktion: Aktion;
}) {
  const t = await getTranslations('verwaltung.postfach');
  return (
    <>
      <header className="flex flex-col gap-1 border-b border-linie bg-weiss px-4 py-3 md:px-6">
        <h2 className="text-24 break-words">{u.betreff}</h2>
        <p className="text-16 text-tinte-2">{u.mit.length ? t('mit', { namen: u.mit.join(', ') }) : t('ohneTeilnehmende')}</p>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        {gesendet ? <Meldung art="erfolg">{t('gesendet')}</Meldung> : null}
        <ol aria-label={t('nachrichtenLabel')} className="flex flex-col gap-4">
          {u.nachrichten.map((m) => (
            <li key={m.id} className={cn('flex max-w-6/7 flex-col gap-1', m.eigene ? 'items-end self-end' : 'items-start self-start')}>
              <div className="flex flex-wrap gap-x-3 text-16 text-tinte-2">
                <span className="font-bold text-tinte">{m.eigene ? t('ichAbsender') : (m.absenderName ?? t('absenderUnbekannt'))}</span>
                <time dateTime={m.erstelltAm.toISOString()}>
                  {datumLang(m.erstelltAm, 'de')}, {uhrzeit(m.erstelltAm, 'de')}
                </time>
              </div>
              <p
                className={cn(
                  'rounded-lg border border-linie p-3.5 text-18 break-words whitespace-pre-line',
                  m.eigene ? 'bg-gruen-50' : 'bg-weiss',
                )}
              >
                {m.text}
              </p>
            </li>
          ))}
        </ol>
        <AntwortFormular unterhaltungId={u.id} aktion={aktion} />
      </div>
    </>
  );
}
