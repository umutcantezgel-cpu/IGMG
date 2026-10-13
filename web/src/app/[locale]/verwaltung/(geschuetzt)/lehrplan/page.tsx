import { ArrowDown, ArrowUp, Plus } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { ansichtInaktiv, ansichtLink, feldKlein, karte, pilleNeutral } from '@/components/verwaltung/lernen/stil';
import { Meldung } from '@/components/verwaltung/Meldung';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { funktionAn } from '@/lib/funktionen';
import { KURSARTEN } from '@/lib/lernen/verwaltung';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { stufeAnlegen, stufeUmbenennen, stufeVerschieben } from '@/server/actions/lehrplan';
import { ladeLehrplan } from '@/server/queries/verwaltung/lehrplan';

const MELDUNGEN = ['angelegt', 'umbenannt', 'verschoben'] as const;

/**
 * Verwaltung › Lehrplan (H-L03): Stufen je Kursart (Elifbe, Koran, Tecvid, İlmihal, Hifz) ansehen, anlegen, sortieren
 * und umbenennen (Titel de/tr). Inhalte bleiben Platzhalter in eckigen Klammern, bis Lehrkräfte sie verfassen
 * (religiöse Texte nur mit Freigabe, ADR 0030). Umbenennen ohne Skript über `<details>`.
 */
export default async function LehrplanVerwalten({ searchParams }: PageProps<'/[locale]/verwaltung/lehrplan'>) {
  const a = await verlangeSeitenRecht('gruppe.lesen');
  if (!(await funktionAn('lernplattform'))) notFound();
  const sp = await searchParams;
  const [t, tl, tg, plan] = await Promise.all([
    getTranslations('verwaltung.lehrplan'),
    getTranslations('verwaltung.lernen'),
    getTranslations('verwaltung.shell'),
    ladeLehrplan(),
  ]);
  const bearbeiten = darf(a.rollen, 'lehrplan.bearbeiten');
  const meldung = MELDUNGEN.find((m) => m === sp.meldung);
  const markiert = typeof sp.stufe === 'string' ? sp.stufe : null;
  const fehlerKursart = sp.fehler === 'titel' && typeof sp.kursart === 'string' ? sp.kursart : null;

  return (
    <>
      <VerwaltungsKopf titel={t('titel')} kennung={tg('gruppe.inhalte')} einleitung={t('einleitung')} />
      {meldung ? <Meldung art="erfolg">{t(`meldung.${meldung}`)}</Meldung> : null}
      {sp.fehler === 'titel' ? <Meldung art="fehler">{t('fehler.titel')}</Meldung> : null}
      {!bearbeiten ? <Meldung art="info">{t('nurLesen')}</Meldung> : null}
      <nav aria-label={t('kursarten')}>
        <ul className="flex flex-wrap gap-2">
          {KURSARTEN.map((k) => (
            <li key={k}>
              <a href={`#kursart-${k}`} className={cn(ansichtLink, ansichtInaktiv)}>
                {tl(`kursart.${k}`)}
                <span className="ml-2 text-tinte-2 tabular-nums">{plan[k].length}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {KURSARTEN.map((k) => {
        const stufen = plan[k];
        return (
          <section key={k} id={`kursart-${k}`} aria-labelledby={`kursart-${k}-titel`} className={cn(karte, 'scroll-mt-6')}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id={`kursart-${k}-titel`} className="text-24">
                {tl(`kursart.${k}`)}
              </h2>
              <span className="text-16 text-tinte-2">{t('anzahl', { anzahl: stufen.length })}</span>
            </div>
            {stufen.length ? (
              <ol className="flex flex-col divide-y divide-linie">
                {stufen.map((s, i) => (
                  <li
                    key={s.id}
                    className={cn(
                      'flex flex-col gap-3 py-3 md:flex-row md:items-start md:justify-between',
                      markiert === s.id && 'tritt-auf',
                    )}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        aria-hidden
                        className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-gruen-50 font-bold text-gruen-800 tabular-nums"
                      >
                        {i + 1}
                      </span>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="font-bold">
                          <span className="sr-only">{t('stufeNummer', { nummer: i + 1 })} </span>
                          {s.titel.de}
                        </span>
                        {s.titel.tr ? (
                          <span lang="tr" className="text-16 text-tinte-2">
                            {s.titel.tr}
                          </span>
                        ) : null}
                        {s.fortschritte ? (
                          <span className={cn(pilleNeutral, 'mt-1 self-start')}>{t('fortschritte', { anzahl: s.fortschritte })}</span>
                        ) : null}
                      </span>
                    </div>
                    {bearbeiten ? (
                      <div className="flex flex-wrap items-start gap-2 md:justify-end">
                        <form action={stufeVerschieben}>
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="richtung" value="hoch" />
                          <Button type="submit" variant="outline" size="icon" disabled={i === 0}>
                            <ArrowUp aria-hidden />
                            <span className="sr-only">{t('hoch', { titel: s.titel.de })}</span>
                          </Button>
                        </form>
                        <form action={stufeVerschieben}>
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="richtung" value="runter" />
                          <Button type="submit" variant="outline" size="icon" disabled={i === stufen.length - 1}>
                            <ArrowDown aria-hidden />
                            <span className="sr-only">{t('runter', { titel: s.titel.de })}</span>
                          </Button>
                        </form>
                        <details className="group min-w-0 md:w-96">
                          <summary className="inline-flex min-h-12 cursor-pointer list-none items-center rounded-md border border-rand bg-weiss px-4 font-bold hover:bg-gruen-50 [&::-webkit-details-marker]:hidden">
                            {t('umbenennen')}
                            <span className="sr-only">: {s.titel.de}</span>
                          </summary>
                          <form action={stufeUmbenennen} className="mt-3 flex flex-col gap-3 rounded-md border border-linie bg-papier p-4">
                            <input type="hidden" name="id" value={s.id} />
                            <label className="flex flex-col gap-1 font-bold">
                              {t('titelDe')}
                              <input
                                name="titelDe"
                                required
                                minLength={2}
                                maxLength={120}
                                defaultValue={s.titel.de}
                                className={feldKlein}
                              />
                            </label>
                            <label className="flex flex-col gap-1 font-bold">
                              {t('titelTr')}
                              <input name="titelTr" lang="tr" maxLength={120} defaultValue={s.titel.tr ?? ''} className={feldKlein} />
                            </label>
                            <Button type="submit" variant="secondary" className="self-start">
                              {t('speichern')}
                            </Button>
                          </form>
                        </details>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p>{t('leer')}</p>
            )}
            {bearbeiten ? (
              <form action={stufeAnlegen} className="flex flex-col gap-3 border-t border-linie pt-4">
                <input type="hidden" name="kursart" value={k} />
                <h3 className="font-text text-20 font-bold tracking-normal">{t('neueStufe')}</h3>
                {fehlerKursart === k ? <p className="font-bold text-fehler">{t('fehler.titel')}</p> : null}
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-1 font-bold">
                    {t('titelDe')}
                    <input name="titelDe" required minLength={2} maxLength={120} placeholder={t('platzhalterDe')} className={feldKlein} />
                  </label>
                  <label className="flex flex-col gap-1 font-bold">
                    {t('titelTr')}
                    <input name="titelTr" lang="tr" maxLength={120} placeholder={t('platzhalterTr')} className={feldKlein} />
                  </label>
                </div>
                <p className="text-16 text-tinte-2">{t('hinweisInhalt')}</p>
                <Button type="submit" variant="secondary" className="self-start">
                  <Plus aria-hidden />
                  {t('anlegen', { kursart: tl(`kursart.${k}`) })}
                </Button>
              </form>
            ) : null}
          </section>
        );
      })}
      <p className="text-16 text-tinte-2">
        {t('fortschrittHinweis')}{' '}
        <NextLink href="/verwaltung/gruppen" className="font-bold underline underline-offset-4">
          {t('zuGruppen')}
        </NextLink>
      </p>
    </>
  );
}
