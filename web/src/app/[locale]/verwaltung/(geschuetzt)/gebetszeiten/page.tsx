import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { BerechnungFormular, ImportFormular, QuelleFormular } from '@/components/verwaltung/gebetszeiten/GebetszeitenFormulare';
import { LoeschenBestaetigen } from '@/components/verwaltung/veranstaltungen/LoeschenBestaetigen';
import { Meldung } from '@/components/verwaltung/Meldung';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { entferneImport } from '@/server/actions/gebetszeiten';
import { ladeAbdeckung, ladeGebetszeitenEinstellung, ladeImporte } from '@/server/queries/verwaltung/gebetszeiten';

const karte = 'flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6';
const datum = (d: string) => d.split('-').reverse().join('.');

/** Verwaltung › Gebetszeiten (C07, Blatt V07, K-08, ADR 0008): Quelle, Berechnung mit Vorschau, Import mit Prüfung. */
export default async function GebetszeitenVerwalten({ searchParams }: PageProps<'/[locale]/verwaltung/gebetszeiten'>) {
  const a = await verlangeSeitenRecht('gebetszeiten.lesen');
  const [t, sp, einstellung, abdeckung, importe] = await Promise.all([
    getTranslations('verwaltung.gebetszeiten'),
    searchParams,
    ladeGebetszeitenEinstellung(),
    ladeAbdeckung(),
    ladeImporte(),
  ]);
  const bearbeiten = darf(a.rollen, 'gebetszeiten.bearbeiten');
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-30 md:text-36">{t('titel')}</h1>
          <p className="max-w-[70ch] text-tinte-2">{t('untertitel')}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <NextLink href="/gebetszeiten" className="inline-flex min-h-11 items-center font-bold">
            {t('oeffentlich')}
          </NextLink>
          <NextLink href="/gebetszeiten/anzeige" prefetch={false} className="inline-flex min-h-11 items-center font-bold">
            {t('vollbild')}
          </NextLink>
        </div>
      </div>
      {sp.entfernt === '1' ? <Meldung art="erfolg">{t('importe.entfernt')}</Meldung> : null}
      {!bearbeiten ? <p className="font-bold">{t('nurLesen')}</p> : null}
      <section aria-labelledby="gz-stand" className={karte}>
        <h2 id="gz-stand" className="text-24">
          {t('stand.titel')}
        </h2>
        <ul className="flex flex-col gap-1">
          <li className="font-bold">{t(einstellung.aktiveQuelle === 'import' ? 'stand.quelleImport' : 'stand.quelleBerechnung')}</li>
          <li>{t(einstellung.bestaetigt ? 'stand.bestaetigt' : 'stand.unbestaetigt')}</li>
          <li>{abdeckung.bis ? t('stand.abdeckung', { datum: datum(abdeckung.bis) }) : t('stand.keineImporte')}</li>
        </ul>
        {einstellung.aktiveQuelle === 'import' && !abdeckung.naechste30 ? <Meldung art="info">{t('stand.luecke')}</Meldung> : null}
      </section>
      <div className="grid gap-6 xl:grid-cols-2">
        <section aria-labelledby="gz-quelle" className={karte}>
          <h2 id="gz-quelle" className="text-24">
            {t('quelle.titel')}
          </h2>
          <QuelleFormular start={{ aktiveQuelle: einstellung.aktiveQuelle, bestaetigt: einstellung.bestaetigt }} darf={bearbeiten} />
        </section>
        {bearbeiten ? (
          <section aria-labelledby="gz-import" className={karte}>
            <h2 id="gz-import" className="text-24">
              {t('import.titel')}
            </h2>
            <ImportFormular />
          </section>
        ) : null}
      </div>
      <section aria-labelledby="gz-berechnung" className={karte}>
        <h2 id="gz-berechnung" className="text-24">
          {t('berechnung.titel')}
        </h2>
        <p className="text-tinte-2">{t('berechnung.text')}</p>
        <BerechnungFormular start={einstellung} darf={bearbeiten} />
      </section>
      <section aria-labelledby="gz-importe" className="flex flex-col gap-3">
        <h2 id="gz-importe" className="text-24">
          {t('importe.titel')}
        </h2>
        {importe.length === 0 ? (
          <p className="text-tinte-2">{t('importe.leer')}</p>
        ) : (
          <div className="relative overflow-x-auto rounded-lg border border-linie bg-weiss">
            <table className="w-full min-w-[48rem] border-collapse text-left">
              <thead className="bg-sand">
                <tr>
                  {(['zeitraum', 'tage', 'datei', 'am', 'von', 'aktion'] as const).map((s) => (
                    <th key={s} scope="col" className="px-4 py-3 text-16 font-bold">
                      {t(`importe.${s}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {importe.map((i) => (
                  <tr key={i.id} className="border-t border-linie align-middle">
                    <th scope="row" className="px-4 py-3 font-bold whitespace-nowrap">
                      {datum(i.von)} – {datum(i.bis)}
                    </th>
                    <td className="px-4 py-3 tabular-nums">
                      {i.tage} / {i.zeilen}
                    </td>
                    <td className="px-4 py-3 break-all">{i.dateiname ?? '–'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {datumLang(i.erstelltAm, 'de')}, {uhrzeit(i.erstelltAm, 'de')}
                    </td>
                    <td className="px-4 py-3">{i.person ?? t('importe.unbekannt')}</td>
                    <td className="px-4 py-3">
                      {bearbeiten && i.tage > 0 ? (
                        <LoeschenBestaetigen
                          id={i.id}
                          aktion={entferneImport}
                          texte={{
                            ausloeser: t('importe.entfernen'),
                            titel: t('importe.entfernenTitel'),
                            text: t('importe.entfernenText'),
                            bestaetigen: t('importe.entfernenBestaetigen'),
                            abbrechen: t('importe.abbrechen'),
                          }}
                        />
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
