import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { schriftQuran } from '@/app/schriften-quran';
import { AktionsFormular } from '@/components/verwaltung/koran/FormularBausteine';
import { KARTE, KoranNavigation, VerlaufListe, ZurueckLink } from '@/components/verwaltung/koran/Teile';
import { KORAN_RECHTE, verlangeKoranZugang } from '@/components/verwaltung/koran/zugang';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { darf } from '@/lib/rechte/pruefe';
import { DES_TAGES } from '@/lib/religioes/des-tages';
import { cn } from '@/lib/utils';
import { heuteBerlin } from '@/lib/zeit/heute';
import { versEntfernen, versHinzufuegen, versVerschieben } from '@/server/actions/tagesvers';
import { heutigeAuswahl, ladeTagesHadithe, ladeTagesVerlauf, ladeTagesVerse } from '@/server/queries/verwaltung/tagesvers';

/**
 * Vers und Hadith des Tages (AUFTRAG 3.10, Kür K-A) im Modul „Koran & Hadith“: Hier liegt die Pflege, weil die Liste
 * „Hadith des Tages“ schon zu den Hadith-Listen dieses Moduls gehört und die religiöse Prüfung (Imam/Hoca) dieses Modul
 * nutzt – die Anzeige gehört der Redaktion. Liste „Vers des Tages“ nur als Verweis (Sure:Vers) auf den Import; ändern
 * darf, wer Verse bearbeiten und religiös freigeben darf. Die Startseite zeigt nach Datum je einen Eintrag – nur, wenn
 * die Liste nicht leer ist.
 */
export default async function DesTagesSeite() {
  const a = await verlangeKoranZugang(KORAN_RECHTE);
  const [t, verse, hadithe, verlauf, heute] = await Promise.all([
    getTranslations('verwaltung.koran'),
    ladeTagesVerse(),
    ladeTagesHadithe(),
    ladeTagesVerlauf(),
    heuteBerlin(),
  ]);
  const darfAendern = darf(a.rollen, 'quran.bearbeiten') && darf(a.rollen, 'religioes.freigeben');
  const auswahl = heutigeAuswahl(verse, hadithe, heute.datum);
  const stelle = (v: { sure: number; vers: number }) => `${v.sure}:${v.vers}`;
  const name = (v: { sureName: string; sure: number; vers: number }) => t('desTages.eintrag', { sure: v.sureName, stelle: stelle(v) });

  return (
    <div className={cn('flex flex-col gap-8', schriftQuran.variable)}>
      <ZurueckLink href="/verwaltung/koran" text={t('titel')} />
      <VerwaltungsKopf kennung={t('titel')} titel={t('desTages.titel')} einleitung={t('desTages.einleitung')} />
      <KoranNavigation aktiv="desTages" />
      {darfAendern ? null : <p className="max-w-text text-16 text-tinte-2">{t('desTages.nurLesen')}</p>}

      <section aria-labelledby="des-tages-heute" className={KARTE}>
        <h2 id="des-tages-heute" className="text-24 font-bold">
          {t('desTages.heuteTitel')}
        </h2>
        <dl className="grid gap-x-6 gap-y-2 text-16 sm:grid-cols-[auto_1fr]">
          <dt className="font-bold">{t('desTages.versTitel')}</dt>
          <dd>{auswahl.vers ? name(auswahl.vers) : t('desTages.keinEintrag')}</dd>
          <dt className="font-bold">{t('desTages.hadithTitel')}</dt>
          <dd>{auswahl.hadith ? t('listen.eintrag', { nummer: auswahl.hadith }) : t('desTages.keinEintrag')}</dd>
        </dl>
        <p className="text-16 text-tinte-2">{t('desTages.heuteText')}</p>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <section aria-labelledby="liste-vers-des-tages" className={KARTE}>
          <div className="flex flex-col gap-1">
            <h2 id="liste-vers-des-tages" className="flex flex-wrap items-baseline justify-between gap-2 text-24 font-bold">
              {t('desTages.versTitel')}
              <span className="text-16 font-normal text-tinte-2">{t('listen.anzahl', { anzahl: verse.length })}</span>
            </h2>
            <p className="text-16 text-tinte-2">{t('desTages.versText')}</p>
          </div>
          {verse.length === 0 ? (
            <p className="text-16 text-tinte-2">{t('listen.leer')}</p>
          ) : (
            <ol className="flex flex-col divide-y divide-linie">
              {verse.map((v, i) => (
                <li key={stelle(v)} className="flex flex-wrap items-start gap-3 py-3">
                  <span aria-hidden className="mt-1 w-8 shrink-0 text-end text-16 font-bold text-tinte-2 tabular-nums">
                    {i + 1}.
                  </span>
                  <div className="flex min-w-0 flex-1 basis-56 flex-col gap-1">
                    <span className="font-bold">{name(v)}</span>
                    <p lang="ar" dir="rtl" className="line-clamp-2 font-quran text-20">
                      {v.anfangAr}
                    </p>
                  </div>
                  {darfAendern ? (
                    <div className="ms-auto flex shrink-0 gap-1">
                      {i > 0 ? (
                        <AktionsFormular
                          aktion={versVerschieben}
                          felder={{ liste: DES_TAGES, stelle: stelle(v), richtung: 'hoch' }}
                          knopf={t('desTages.hochAria', { stelle: stelle(v) })}
                          symbol={<ArrowUp aria-hidden />}
                          variante="outline"
                          nurSymbol
                        />
                      ) : null}
                      {i < verse.length - 1 ? (
                        <AktionsFormular
                          aktion={versVerschieben}
                          felder={{ liste: DES_TAGES, stelle: stelle(v), richtung: 'runter' }}
                          knopf={t('desTages.runterAria', { stelle: stelle(v) })}
                          symbol={<ArrowDown aria-hidden />}
                          variante="outline"
                          nurSymbol
                        />
                      ) : null}
                      <AktionsFormular
                        aktion={versEntfernen}
                        felder={{ liste: DES_TAGES, stelle: stelle(v) }}
                        knopf={t('desTages.entfernenAria', { stelle: stelle(v) })}
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
                aktion={versHinzufuegen}
                felder={{ liste: DES_TAGES }}
                eingabeFeld={{ name: 'stelle', label: t('desTages.stelle'), hinweis: t('desTages.stelleHinweis'), max: 7 }}
                knopf={t('listen.hinzufuegen')}
                symbol={<Plus aria-hidden />}
                variante="secondary"
              />
            </div>
          ) : null}
          <details className="text-16">
            <summary className="flex min-h-12 cursor-pointer items-center font-bold">{t('verlauf.titel')}</summary>
            <VerlaufListe eintraege={verlauf} />
          </details>
        </section>

        <section aria-labelledby="liste-hadith-des-tages" className={KARTE}>
          <div className="flex flex-col gap-1">
            <h2 id="liste-hadith-des-tages" className="flex flex-wrap items-baseline justify-between gap-2 text-24 font-bold">
              {t('desTages.hadithTitel')}
              <span className="text-16 font-normal text-tinte-2">{t('listen.anzahl', { anzahl: hadithe.length })}</span>
            </h2>
            <p className="text-16 text-tinte-2">{t('desTages.hadithText')}</p>
          </div>
          <NextLink
            href="/verwaltung/koran/hadith/listen"
            className="inline-flex min-h-12 items-center self-start font-bold text-gruen-800 underline underline-offset-4"
          >
            {t('desTages.zuHadithListen')}
          </NextLink>
        </section>
      </div>
    </div>
  );
}
