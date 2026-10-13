import { Check, Power, Star, TriangleAlert } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { AktionsFormular } from '@/components/verwaltung/koran/FormularBausteine';
import { KARTE, KoranNavigation } from '@/components/verwaltung/koran/Teile';
import { verlangeKoranZugang } from '@/components/verwaltung/koran/zugang';
import { Meldung } from '@/components/verwaltung/Meldung';
import { ListenLeer } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { datumOhneWochentag } from '@/lib/i18n/format';
import { istFreigegeben } from '@/lib/quran/ausgaben';
import { abrufVeraltet, tageSeit } from '@/lib/religioes/freigabe';
import { darf } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { ausgabeDeaktivieren, ausgabeFreigeben, ausgabeStandard } from '@/server/actions/koran';
import { ladeAusgabenVerwaltung } from '@/server/queries/verwaltung/koran';

const PILLE = 'inline-flex items-center gap-1.5 rounded-pill px-3 text-16 leading-normal font-bold';

/**
 * Verwaltung › Koran & Hadith › Ausgaben (ADR 0025, ADR 0030, MN-02): importierte Übersetzungsausgaben mit Herkunft und
 * SHA-256. Freigeben/aktivieren, Standard je Sprache und Ausschalten nur mit `religioes.freigeben`; die Freigabe gilt
 * für die unveränderte Ausgabe als Ganzes. Hinweis, wenn der Abruf älter als 90 Tage ist (Pflegepflicht).
 */
export default async function AusgabenSeite() {
  const a = await verlangeKoranZugang();
  const [t, ausgaben] = await Promise.all([getTranslations('verwaltung.koran'), ladeAusgabenVerwaltung()]);
  const darfFreigeben = darf(a.rollen, 'religioes.freigeben');
  const jetzt = new Date();
  const sprache = (s: string) => (['de', 'tr', 'en'].includes(s) ? t(`sprache.${s}`) : s.toUpperCase());

  return (
    <div className="flex flex-col gap-8">
      <VerwaltungsKopf kennung={t('kennung')} titel={t('ausgaben.titel')} einleitung={t('ausgaben.einleitung')} />
      <KoranNavigation aktiv="ausgaben" />
      <Meldung art="info">
        <p className="font-normal">{t('ausgaben.hinweisGanzes')}</p>
      </Meldung>
      {darfFreigeben ? null : <p className="max-w-text text-16 text-tinte-2">{t('ausgaben.nurLesen')}</p>}

      {ausgaben.length === 0 ? (
        <ListenLeer text={t('ausgaben.leer')} />
      ) : (
        <ul className="grid gap-6 xl:grid-cols-2">
          {ausgaben.map((g) => {
            const frei = istFreigegeben(g);
            const veraltet = abrufVeraltet(g.abgerufenAm, jetzt);
            const titelId = `ausgabe-${g.id}`;
            const angaben: [string, ReactNode][] = [
              [t('ausgaben.uebersetzer'), g.uebersetzer || '–'],
              [
                t('ausgaben.quelle'),
                <a
                  key="q"
                  href={g.url}
                  rel="noreferrer noopener"
                  target="_blank"
                  className="font-bold break-words text-gruen-800 underline"
                >
                  {g.quelle}
                </a>,
              ],
              [t('ausgaben.version'), g.version || '–'],
              [t('ausgaben.lizenz'), g.lizenz],
              [
                t('ausgaben.abgerufen'),
                t('ausgaben.abgerufenText', { datum: datumOhneWochentag(g.abgerufenAm, 'de'), tage: tageSeit(g.abgerufenAm, jetzt) }),
              ],
              [t('ausgaben.verse'), t('ausgaben.verseText', { anzahl: g.verse })],
              [
                t('ausgaben.sha'),
                <code key="s" className="font-mono text-16 break-all">
                  {g.sha256}
                </code>,
              ],
            ];
            return (
              <li key={g.id} className={cn(KARTE, frei && 'border-gruen-700')}>
                <section aria-labelledby={titelId} className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="text-16 font-bold text-tinte-2">{sprache(g.sprache)}</span>
                      <h2 id={titelId} className="text-24 font-bold break-words">
                        {g.titel}
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={cn(PILLE, frei ? 'bg-gruen-50 text-gruen-800' : 'bg-sand text-tinte-2')}>
                        {frei ? <Check aria-hidden className="size-4" /> : null}
                        {frei ? t('ausgaben.frei') : t('ausgaben.aus')}
                      </span>
                      {g.standard ? (
                        <span className={cn(PILLE, 'bg-info-toenung text-info')}>
                          <Star aria-hidden className="size-4" />
                          {t('ausgaben.standard', { sprache: sprache(g.sprache) })}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <dl className="grid gap-x-4 gap-y-1 text-16 sm:raster-stammdaten-kurz sm:gap-y-2">
                    {angaben.map(([label, wert]) => (
                      <div key={label} className="contents">
                        <dt className="font-bold text-tinte-2 max-sm:mt-2">{label}</dt>
                        <dd className="min-w-0">{wert}</dd>
                      </div>
                    ))}
                  </dl>
                  {veraltet ? (
                    <p className="flex items-start gap-2 rounded-md border border-warnung bg-warnung-toenung px-4 py-3 text-16 font-bold text-warnung">
                      <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
                      {t('ausgaben.veraltet')}
                    </p>
                  ) : null}
                  {frei && g.freigegebenAm ? (
                    <p className="text-16 text-tinte-2">
                      {t('ausgaben.freigegebenVon', {
                        name: g.freigegebenVon ?? t('kontoFehlt'),
                        datum: datumOhneWochentag(g.freigegebenAm, 'de'),
                      })}
                    </p>
                  ) : null}
                  {darfFreigeben ? (
                    <div className="flex flex-col gap-3 border-t border-linie pt-4">
                      {frei ? (
                        <>
                          {g.standard ? null : (
                            <AktionsFormular
                              aktion={ausgabeStandard}
                              felder={{ id: g.id }}
                              knopf={t('ausgaben.standardSetzen', { sprache: sprache(g.sprache) })}
                              symbol={<Star aria-hidden />}
                              variante="secondary"
                            />
                          )}
                          <AktionsFormular
                            aktion={ausgabeDeaktivieren}
                            felder={{ id: g.id }}
                            aufklappen={t('ausgaben.ausschaltenOeffnen')}
                            frage={t('ausgaben.ausschaltenFrage')}
                            knopf={t('ausgaben.ausschalten')}
                            symbol={<Power aria-hidden />}
                            variante="destructive"
                          />
                        </>
                      ) : (
                        <AktionsFormular
                          aktion={ausgabeFreigeben}
                          felder={{ id: g.id }}
                          bestaetigen={t('ausgaben.bestaetigen', { version: g.version || '–' })}
                          knopf={t('ausgaben.freigeben')}
                          symbol={<Check aria-hidden />}
                        />
                      )}
                    </div>
                  ) : null}
                </section>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
