import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { AktionsFormular } from '@/components/verwaltung/koran/FormularBausteine';
import { KARTE, KoranNavigation, VerlaufListe, ZurueckLink } from '@/components/verwaltung/koran/Teile';
import { HADITH_RECHTE, verlangeKoranZugang } from '@/components/verwaltung/koran/zugang';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { darf } from '@/lib/rechte/pruefe';
import { HADITH_LISTEN } from '@/lib/validierung/koran';
import { listeEntfernen, listeHinzufuegen, listeVerschieben } from '@/server/actions/koran';
import { ladeHadithListen, ladeVerlauf } from '@/server/queries/verwaltung/koran';

/**
 * Kuratierte Hadith-Listen „Auswahl“ und „Hadith des Tages“ (AUFTRAG 3.3, ADR 0030): nur Verweise auf importierte
 * Hadithe; hinzufügen, sortieren, entfernen. Ändern darf nur, wer Hadithe bearbeiten und religiös freigeben darf.
 */
export default async function HadithListenSeite() {
  const a = await verlangeKoranZugang(HADITH_RECHTE);
  const [t, listen, ...verlaeufe] = await Promise.all([
    getTranslations('verwaltung.koran'),
    ladeHadithListen(),
    ...HADITH_LISTEN.map((l) => ladeVerlauf('hadith_auswahl', l, 5)),
  ]);
  const darfAendern = darf(a.rollen, 'hadith.bearbeiten') && darf(a.rollen, 'religioes.freigeben');
  const sprache = (s: string) => (['de', 'tr', 'en'].includes(s) ? t(`sprache.${s}`) : s);

  return (
    <div className="flex flex-col gap-8">
      <ZurueckLink href="/verwaltung/koran/hadith" text={t('hadith.titel')} />
      <VerwaltungsKopf kennung={t('hadith.titel')} titel={t('listen.titel')} einleitung={t('listen.einleitung')} />
      <KoranNavigation aktiv="hadith" />
      {darfAendern ? null : <p className="max-w-text text-16 text-tinte-2">{t('listen.nurLesen')}</p>}
      <div className="grid items-start gap-6 xl:grid-cols-2">
        {HADITH_LISTEN.map((liste, li) => {
          const eintraege = listen[liste];
          const id = `liste-${liste}`;
          return (
            <section key={liste} aria-labelledby={id} className={KARTE}>
              <div className="flex flex-col gap-1">
                <h2 id={id} className="flex flex-wrap items-baseline justify-between gap-2 text-24 font-bold">
                  {t(`listen.name.${liste}`)}
                  <span className="text-16 font-normal text-tinte-2">{t('listen.anzahl', { anzahl: eintraege.length })}</span>
                </h2>
                <p className="text-16 text-tinte-2">{t(`listen.text.${liste}`)}</p>
              </div>
              {eintraege.length === 0 ? (
                <p className="text-16 text-tinte-2">{t('listen.leer')}</p>
              ) : (
                <ol className="flex flex-col divide-y divide-linie">
                  {eintraege.map((e, i) => (
                    <li key={e.nummer} className="flex flex-wrap items-start gap-3 py-3">
                      <span aria-hidden className="mt-1 w-8 shrink-0 text-end text-16 font-bold text-tinte-2 tabular-nums">
                        {i + 1}.
                      </span>
                      <div className="flex min-w-0 flex-1 basis-56 flex-col gap-1">
                        <NextLink
                          href={`/verwaltung/koran/hadith/${e.nummer}`}
                          className="font-bold text-gruen-800 underline underline-offset-4"
                        >
                          {t('listen.eintrag', { nummer: e.nummer })}
                        </NextLink>
                        <p lang="ar" dir="rtl" className="line-clamp-2 font-arabic text-20">
                          {e.anfangAr}
                        </p>
                        <span className="text-16 text-tinte-2">
                          {e.geprueft.length
                            ? t('listen.geprueft', { sprachen: e.geprueft.map(sprache).join(', ') })
                            : t('listen.keineUebersetzung')}
                        </span>
                      </div>
                      {darfAendern ? (
                        <div className="ms-auto flex shrink-0 gap-1">
                          {i > 0 ? (
                            <AktionsFormular
                              aktion={listeVerschieben}
                              felder={{ liste, nummer: e.nummer, richtung: 'hoch' }}
                              knopf={t('listen.hochAria', { nummer: e.nummer })}
                              symbol={<ArrowUp aria-hidden />}
                              variante="outline"
                              nurSymbol
                            />
                          ) : null}
                          {i < eintraege.length - 1 ? (
                            <AktionsFormular
                              aktion={listeVerschieben}
                              felder={{ liste, nummer: e.nummer, richtung: 'runter' }}
                              knopf={t('listen.runterAria', { nummer: e.nummer })}
                              symbol={<ArrowDown aria-hidden />}
                              variante="outline"
                              nurSymbol
                            />
                          ) : null}
                          <AktionsFormular
                            aktion={listeEntfernen}
                            felder={{ liste, nummer: e.nummer }}
                            knopf={t('listen.entfernenAria', { nummer: e.nummer })}
                            symbol={<X aria-hidden />}
                            variante="outline"
                            nurSymbol
                          />
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ol>
              )}
              {darfAendern ? (
                <div className="border-t border-linie pt-4">
                  <AktionsFormular
                    aktion={listeHinzufuegen}
                    felder={{ liste }}
                    eingabeFeld={{ name: 'nummer', label: t('listen.nummer'), hinweis: t('hadith.nummerHinweis'), max: 8 }}
                    knopf={t('listen.hinzufuegen')}
                    symbol={<Plus aria-hidden />}
                    variante="secondary"
                  />
                </div>
              ) : null}
              <details className="text-16">
                <summary className="flex min-h-12 cursor-pointer items-center font-bold">{t('verlauf.titel')}</summary>
                <VerlaufListe eintraege={verlaeufe[li]} />
              </details>
            </section>
          );
        })}
      </div>
    </div>
  );
}
