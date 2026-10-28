import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import {
  AbgleichFormular,
  AbgleichFreigeben,
  BerechnungFormular,
  ImportFormular,
  JetztAbgleichen,
  KonflikteUebernehmen,
  NaeherungVorschlag,
  QuelleFormular,
} from '@/components/verwaltung/gebetszeiten/GebetszeitenFormulare';
import { LoeschenBestaetigen } from '@/components/verwaltung/veranstaltungen/LoeschenBestaetigen';
import { Meldung } from '@/components/verwaltung/Meldung';
import { TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { NETZWERK } from '@/lib/dachverband/netzwerk';
import { GEBETE } from '@/lib/gebetszeiten/typen';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { entferneImport } from '@/server/actions/gebetszeiten';
import { ladeAbdeckung, ladeAbgleichStand, ladeGebetszeitenEinstellung, ladeImporte } from '@/server/queries/verwaltung/gebetszeiten';

const karte = 'flex min-w-0 flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6';
const datum = (d: string) => d.split('-').reverse().join('.');
const QUELLE_STAND = { igmg: 'stand.quelleIgmg', import: 'stand.quelleImport', berechnung: 'stand.quelleBerechnung' } as const;

/**
 * Verwaltung › Gebetszeiten (C07, Blatt V07, K-08, ADR 0008, ADR 0048): Stand, Quelle, IGMG-Abgleich mit „Jetzt abgleichen“,
 * Freigabe und Konflikten, eingefügte Tabelle aus dem IGMG-Gebetskalender, Import mit Prüfung, Berechnung mit Vorschau und
 * Kalibrierung der Näherung.
 */
export default async function GebetszeitenVerwalten({ searchParams }: PageProps<'/[locale]/verwaltung/gebetszeiten'>) {
  const a = await verlangeSeitenRecht('gebetszeiten.lesen');
  const [t, sp, einstellung, abdeckung, importe] = await Promise.all([
    getTranslations('verwaltung.gebetszeiten'),
    searchParams,
    ladeGebetszeitenEinstellung(),
    ladeAbdeckung(),
    ladeImporte(),
  ]);
  const abgleich = await ladeAbgleichStand(einstellung.abgleich.stadtId);
  const bearbeiten = darf(a.rollen, 'gebetszeiten.bearbeiten');
  const tg = await getTranslations('verwaltung.shell');
  const zeit = (d: Date) => `${datumLang(d, 'de')}, ${uhrzeit(d, 'de')}`;
  const n = einstellung.naeherung;
  return (
    <>
      <VerwaltungsKopf
        titel={t('titel')}
        kennung={tg('gruppe.inhalte')}
        einleitung={t('untertitel')}
        aktion={
          <div className="flex flex-wrap gap-4">
            <NextLink href="/gebetszeiten" className="inline-flex min-h-11 items-center font-bold">
              {t('oeffentlich')}
            </NextLink>
            <NextLink href="/gebetszeiten/anzeige" prefetch={false} className="inline-flex min-h-11 items-center font-bold">
              {t('vollbild')}
            </NextLink>
          </div>
        }
      />
      {sp.entfernt === '1' ? <Meldung art="erfolg">{t('importe.entfernt')}</Meldung> : null}
      {!bearbeiten ? <p className="font-bold">{t('nurLesen')}</p> : null}
      <section aria-labelledby="gz-stand" className={karte}>
        <h2 id="gz-stand" className="text-24">
          {t('stand.titel')}
        </h2>
        <ul className="flex flex-col gap-1">
          <li className="font-bold">{t(QUELLE_STAND[einstellung.aktiveQuelle])}</li>
          <li>{t(einstellung.rueckfall === 'naeherung' ? 'stand.rueckfallNaeherung' : 'stand.rueckfallMethode')}</li>
          <li>{t(einstellung.bestaetigt ? 'stand.bestaetigt' : 'stand.unbestaetigt')}</li>
          <li>{abdeckung.bis ? t('stand.abdeckung', { datum: datum(abdeckung.bis) }) : t('stand.keineImporte')}</li>
        </ul>
        {einstellung.aktiveQuelle !== 'berechnung' && !abdeckung.naechste30 ? <Meldung art="info">{t('stand.luecke')}</Meldung> : null}
      </section>
      <section aria-labelledby="gz-abgleich" className={karte}>
        <h2 id="gz-abgleich" className="text-24">
          {t('abgleich.titel')}
        </h2>
        <p className="text-tinte-2">{t('abgleich.text')}</p>
        <ul className="flex flex-col gap-1">
          {abgleich.feed ? <li className="font-bold">{t('abgleich.feed')}</li> : null}
          {abgleich.datei ? <li className="font-bold">{t('abgleich.datei')}</li> : null}
          <li>{t(einstellung.abgleich.aktiv ? 'abgleich.an' : 'abgleich.aus')}</li>
          <li>
            {abgleich.letzterErfolg
              ? t('abgleich.letzterErfolg', { zeit: zeit(abgleich.letzterErfolg.gestartet) })
              : t('abgleich.keinErfolg')}
          </li>
        </ul>
        {!abgleich.feed && !abgleich.datei ? <Meldung art="info">{t('abgleich.nichtEingerichtet')}</Meldung> : null}
        {abgleich.ausstehend ? (
          <section aria-labelledby="gz-ausstehend" className="flex flex-col gap-3 rounded-md border border-linie p-4">
            <h3 id="gz-ausstehend" className="text-20 font-bold">
              {t('abgleich.ausstehendTitel')}
            </h3>
            <p>{t('abgleich.ausstehendText', { tage: abgleich.ausstehend.tage })}</p>
            {abgleich.ausstehend.auffaellig.length ? (
              <ul className="list-disc pl-5 text-16 tabular-nums">
                {abgleich.ausstehend.auffaellig.slice(0, 12).map((f) => (
                  <li key={`${f.datum}-${f.gebet}`}>
                    {t('abgleich.abweichung', { datum: datum(f.datum), gebet: t(`gebet.${f.gebet}`), minuten: f.abweichungMin })}
                  </li>
                ))}
              </ul>
            ) : null}
            {bearbeiten ? <AbgleichFreigeben laufId={abgleich.ausstehend.id} /> : null}
          </section>
        ) : null}
        {abgleich.konflikte.length ? (
          <section aria-labelledby="gz-konflikte" className="flex flex-col gap-3 rounded-md border border-linie p-4">
            <h3 id="gz-konflikte" className="text-20 font-bold">
              {t('abgleich.konflikteTitel')}
            </h3>
            <p>{t('abgleich.konflikteText')}</p>
            <ul className="list-disc pl-5 text-16 tabular-nums">
              {abgleich.konflikte.slice(0, 12).map((k) => (
                <li key={k.datum}>
                  {datum(k.datum)}:{' '}
                  {GEBETE.filter((g) => k.abweichungMin[g] !== undefined)
                    .map((g) => `${t(`gebet.${g}`)} ${k.abweichungMin[g]! > 0 ? '+' : ''}${k.abweichungMin[g]}`)
                    .join(', ')}
                </li>
              ))}
            </ul>
            {bearbeiten ? (
              <>
                <KonflikteUebernehmen />
                <p className="text-16 text-tinte-2">{t('abgleich.konflikteHinweis')}</p>
              </>
            ) : null}
          </section>
        ) : null}
        {bearbeiten ? <JetztAbgleichen /> : null}
        <AbgleichFormular start={einstellung.abgleich} darf={bearbeiten} />
        <section aria-labelledby="gz-laeufe" className="flex flex-col gap-3">
          <h3 id="gz-laeufe" className="text-20 font-bold">
            {t('abgleich.laeufeTitel')}
          </h3>
          {abgleich.laeufe.length === 0 ? (
            <p className="text-tinte-2">{t('abgleich.keineLaeufe')}</p>
          ) : (
            <TabellenRahmen beschriftung={t('abgleich.laeufeTitel')}>
              <table className="w-full min-w-192 border-collapse text-left tabular-nums">
                <thead className="bg-sand">
                  <tr>
                    {(['zeit', 'status', 'tage', 'konflikte', 'abweichung'] as const).map((s) => (
                      <th key={s} scope="col" className="px-4 py-3 text-16 font-bold">
                        {t(`abgleich.spalten.${s}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {abgleich.laeufe.map((l) => (
                    <tr key={l.id} className="border-t border-linie align-middle">
                      <th scope="row" className="px-4 py-3 font-bold whitespace-nowrap">
                        {zeit(l.gestartet)}
                      </th>
                      <td className="px-4 py-3">
                        {t(`abgleich.status.${l.status}`)}
                        {l.fehlerCode ? ` – ${t(`abgleich.fehlerCode.${l.fehlerCode}` as never)}` : null}
                      </td>
                      <td className="px-4 py-3">
                        {l.tageGeprueft} / {l.tageNeu} / {l.tageGeaendert}
                      </td>
                      <td className="px-4 py-3">{l.konflikte}</td>
                      <td className="px-4 py-3">{t('abgleich.minuten', { anzahl: l.maxAbweichungMin })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TabellenRahmen>
          )}
        </section>
      </section>
      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
        <section aria-labelledby="gz-quelle" className={karte}>
          <h2 id="gz-quelle" className="text-24">
            {t('quelle.titel')}
          </h2>
          <QuelleFormular start={{ aktiveQuelle: einstellung.aktiveQuelle, bestaetigt: einstellung.bestaetigt }} darf={bearbeiten} />
        </section>
        {bearbeiten ? (
          <section aria-labelledby="gz-einfuegen" className={karte}>
            <h2 id="gz-einfuegen" className="text-24">
              {t('import.einfuegen.titel')}
            </h2>
            <ImportFormular art="einfuegen" kalenderUrl={NETZWERK.gebetskalender.url.de} />
          </section>
        ) : null}
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
      <section aria-labelledby="gz-naeherung" className={karte}>
        <h2 id="gz-naeherung" className="text-24">
          {t('naeherung.titel')}
        </h2>
        <p className="text-tinte-2">{t('naeherung.text')}</p>
        <ul className="flex flex-col gap-1 tabular-nums">
          <li>
            {t('naeherung.werte', {
              fajr: n.fajrWinkel,
              isha: n.ishaWinkel,
              temkin: GEBETE.map((g) => `${t(`gebet.${g}`)} ${n.temkinSek[g]}`).join(', '),
            })}
          </li>
          <li>
            {t('naeherung.kalibriert', {
              am: datum(n.kalibriert.am),
              basis: n.kalibriert.basis,
              tage: n.kalibriert.tage,
              fehler: n.kalibriert.maxFehlerMin,
            })}
          </li>
        </ul>
        {bearbeiten ? <NaeherungVorschlag /> : null}
      </section>
      <section aria-labelledby="gz-importe" className="flex flex-col gap-3">
        <h2 id="gz-importe" className="text-24">
          {t('importe.titel')}
        </h2>
        {importe.length === 0 ? (
          <p className="text-tinte-2">{t('importe.leer')}</p>
        ) : (
          <TabellenRahmen beschriftung={t('importe.titel')}>
            <table className="w-full min-w-192 border-collapse text-left">
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
          </TabellenRahmen>
        )}
      </section>
    </>
  );
}
