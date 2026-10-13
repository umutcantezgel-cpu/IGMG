import { ArrowRight, BookOpenText, FileText } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { FreigabeEntscheidung } from '@/components/verwaltung/freigaben/FreigabeEntscheidung';
import { Meldung } from '@/components/verwaltung/Meldung';
import { Ansichten, PILLE } from '@/components/verwaltung/seiten/Ansichten';
import { ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { RichText } from '@/components/website/RichText';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { darf, verlangeSeitenRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { entscheideFreigabe } from '@/server/actions/freigaben';
import { ladeVerlauf, ladeWarteschlange, type FreigabeEintrag } from '@/server/queries/verwaltung/freigaben';

const STATUS_FARBE = {
  entwurf: 'bg-sand text-tinte-2',
  zur_pruefung: 'bg-info-toenung text-info',
  geprueft: 'bg-gruen-50 text-gruen-800',
} as const;

function darfEntscheiden(a: Angemeldet, e: FreigabeEintrag): boolean {
  if (e.art === 'religioes') return darf(a.rollen, 'religioes.freigeben');
  return darf(a.rollen, 'seite.veroeffentlichen', { organisation: e.organisation });
}

/**
 * Verwaltung › Freigaben (ADR 0030, ADR 0032): Warteschlange „zur Prüfung“ getrennt nach religiös und redaktionell,
 * je Inhalt alle Angaben zum Lesen und die Entscheidung mit Kommentar; der Verlauf zeigt die letzten 50 Schritte.
 */
export default async function Freigaben({ searchParams }: PageProps<'/[locale]/verwaltung/freigaben'>) {
  const a = await verlangeSeitenRecht('freigabe.lesen');
  const sp = await searchParams;
  const verlauf = sp.ansicht === 'verlauf';
  const erledigt = sp.erledigt === 'freigeben' || sp.erledigt === 'zurueckweisen' ? sp.erledigt : null;
  const [t, tg, offen] = await Promise.all([
    getTranslations('verwaltung.freigaben'),
    getTranslations('verwaltung.shell'),
    ladeWarteschlange(),
  ]);
  const zeit = (d: Date) => `${datumLang(d, 'de')}, ${uhrzeit(d, 'de')}`;
  const ansichten = (
    <Ansichten
      label={t('ansichten')}
      eintraege={[
        { schluessel: 'offen', label: t('offen', { anzahl: offen.length }), href: '/verwaltung/freigaben', aktiv: !verlauf },
        { schluessel: 'verlauf', label: t('verlauf'), href: '/verwaltung/freigaben?ansicht=verlauf', aktiv: verlauf },
      ]}
    />
  );

  if (verlauf) {
    const zeilen = await ladeVerlauf();
    return (
      <>
        <VerwaltungsKopf titel={t('titel')} kennung={tg('gruppe.inhalte')} einleitung={t('einleitung')} />
        {ansichten}
        {zeilen.length === 0 ? (
          <ListenLeer text={t('leerVerlauf')} />
        ) : (
          <TabellenRahmen beschriftung={t('verlauf')}>
            <table className="w-full min-w-192 border-collapse text-left">
              <thead className="bg-sand">
                <tr>
                  {(['am', 'inhalt', 'art', 'status', 'von', 'kommentar'] as const).map((s) => (
                    <th key={s} scope="col" className="px-4 py-3 text-16 font-bold">
                      {t(`spalte.${s}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {zeilen.map((z) => (
                  <tr key={z.id} className="border-t border-linie align-top">
                    <th scope="row" className="px-4 py-3 font-normal tabular-nums">
                      {zeit(z.am)}
                    </th>
                    <td className="px-4 py-3">
                      <span className="block font-bold">{t(`typ.${z.inhaltTyp}`)}</span>
                      <span className="text-16 text-tinte-2">{z.titel ?? z.inhaltId}</span>
                    </td>
                    <td className="px-4 py-3">{t(`gruppe.${z.art}`)}</td>
                    <td className="px-4 py-3">
                      <span className={cn(PILLE, STATUS_FARBE[z.status])}>{t(`status.${z.status}`)}</span>
                    </td>
                    <td className="px-4 py-3">{z.von ?? t('unbekannt')}</td>
                    <td className="px-4 py-3 text-16">{z.kommentar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabellenRahmen>
        )}
      </>
    );
  }

  const gruppen = (['religioes', 'redaktion'] as const).map((art) => ({ art, eintraege: offen.filter((e) => e.art === art) }));
  return (
    <>
      <VerwaltungsKopf titel={t('titel')} kennung={tg('gruppe.inhalte')} einleitung={t('einleitung')} />
      {ansichten}
      {erledigt ? <Meldung art="erfolg">{t(`erledigt.${erledigt}`)}</Meldung> : null}
      {offen.length === 0 ? <ListenLeer text={t('leer')} /> : null}
      {gruppen.map(({ art, eintraege }) =>
        eintraege.length ? (
          <section key={art} aria-labelledby={`gruppe-${art}`} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 id={`gruppe-${art}`} className="flex items-center gap-2 font-display text-24 font-semibold">
                {art === 'religioes' ? (
                  <BookOpenText aria-hidden className="size-6 text-gruen-700" />
                ) : (
                  <FileText aria-hidden className="size-6 text-gruen-700" />
                )}
                {t(`gruppe.${art}`)} <span className="text-tinte-2">({eintraege.length})</span>
              </h2>
              <p className="max-w-einleitung text-16 text-tinte-2">{t(`gruppeHinweis.${art}`)}</p>
            </div>
            <ul className="flex flex-col gap-4">
              {eintraege.map((e) => {
                const darfEs = darfEntscheiden(a, e);
                return (
                  <li
                    key={`${e.inhaltTyp}:${e.inhaltId}`}
                    className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 shadow-s1 md:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className={cn(PILLE, 'self-start bg-sand text-tinte-2')}>{t(`typ.${e.inhaltTyp}`)}</span>
                        <h3
                          className="font-text text-20 font-bold tracking-normal"
                          lang={e.inhaltTyp === 'quran_wortbedeutung' ? 'ar' : undefined}
                          dir={e.inhaltTyp === 'quran_wortbedeutung' ? 'rtl' : undefined}
                        >
                          {e.titel}
                        </h3>
                        <p className="text-16 text-tinte-2">
                          {e.eingereichtAm
                            ? e.eingereichtVon
                              ? t('eingereicht', { name: e.eingereichtVon, datum: zeit(e.eingereichtAm) })
                              : t('eingereichtOhneName', { datum: zeit(e.eingereichtAm) })
                            : e.eingereichtVon
                              ? t('verfasstVon', { name: e.eingereichtVon })
                              : null}
                        </p>
                      </div>
                      {e.inhaltTyp === 'seite' ? (
                        <NextLink
                          href={`/verwaltung/freigaben/seite/${e.inhaltId}`}
                          aria-label={t('seiteAnsehenName', { titel: e.titel })}
                          className="inline-flex min-h-12 items-center gap-2 font-bold underline underline-offset-4"
                        >
                          {t('seiteAnsehen')}
                          <ArrowRight aria-hidden className="size-4" />
                        </NextLink>
                      ) : null}
                    </div>
                    {e.angaben.length ? (
                      <dl className="grid gap-x-4 gap-y-2 text-18 md:raster-symbol">
                        {e.angaben.map((g, i) => (
                          <div key={i} className="contents">
                            <dt className="font-bold text-tinte-2">{t(`angabe.${g.label}`)}</dt>
                            <dd
                              lang={g.lang}
                              dir={g.dir}
                              className={cn('whitespace-pre-line', g.dir === 'rtl' && 'font-arabic text-24 leading-loose')}
                            >
                              {g.wert}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                    {e.text ? (
                      <div className="rounded-md border border-linie bg-papier p-4">
                        <RichText doc={e.text} />
                      </div>
                    ) : null}
                    {darfEs ? (
                      <FreigabeEntscheidung aktion={entscheideFreigabe} inhaltTyp={e.inhaltTyp} inhaltId={e.inhaltId} titel={e.titel} />
                    ) : (
                      <Meldung art="info">{e.art === 'religioes' ? t('nurReligioes') : t('nurVeroeffentlichen')}</Meldung>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null,
      )}
    </>
  );
}
