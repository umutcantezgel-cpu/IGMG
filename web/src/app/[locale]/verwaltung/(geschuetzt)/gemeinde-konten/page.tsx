import { Eye, MailPlus } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { feldKlein, karte, pilleFehler, pilleGut, pilleNeutral, pilleWarnung } from '@/components/verwaltung/lernen/stil';
import { Meldung } from '@/components/verwaltung/Meldung';
import { ListenKarte, ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { funktionAn } from '@/lib/funktionen';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { GEMEINDE_ROLLEN, loeschZustand } from '@/lib/lernen/verwaltung';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { gemeindeEinladungWiderrufen } from '@/server/actions/gemeinde-konten';
import {
  kontenFilterSchema,
  ladeGemeindeKonten,
  ladeLoeschantraege,
  ladeOffeneGemeindeEinladungen,
  type KontoZeile,
} from '@/server/queries/verwaltung/gemeinde-konten';

const MELDUNGEN = ['geloescht', 'widerrufen'] as const;
const zeitpunkt = (d: Date) => `${datumLang(d, 'de')}, ${uhrzeit(d, 'de')}`;

/**
 * Verwaltung › Gemeinde-Konten (H-L05): Konten mit Kontoarten (Gemeinde, Eltern, Lehrkraft, Schüler), Filter,
 * Löschanträge mit Frist, offene Einladungen. Jeder Abruf steht im Audit-Log (Namen und Adressen sind Personendaten).
 */
export default async function GemeindeKonten({ searchParams }: PageProps<'/[locale]/verwaltung/gemeinde-konten'>) {
  const a = await verlangeSeitenRecht('gemeindekonto.lesen');
  if (!(await funktionAn('konten'))) notFound();
  const sp = await searchParams;
  const filter = kontenFilterSchema.parse({ rolle: sp.rolle, zustand: sp.zustand });
  const [t, tg, konten, antraege, einladungen] = await Promise.all([
    getTranslations('verwaltung.gemeindeKonten'),
    getTranslations('verwaltung.shell'),
    ladeGemeindeKonten(filter, a),
    ladeLoeschantraege(),
    ladeOffeneGemeindeEinladungen(),
  ]);
  const bearbeiten = darf(a.rollen, 'gemeindekonto.bearbeiten');
  const meldung = MELDUNGEN.find((m) => m === sp.meldung);
  const jetzt = new Date();
  const rollen = (k: KontoZeile) =>
    k.rollen.length ? (
      <span className="flex flex-wrap gap-1.5">
        {k.rollen.map((r) => (
          <span key={r} className={pilleNeutral}>
            {t(`rolle.${r}`)}
          </span>
        ))}
        {k.verwaltung ? <span className={pilleWarnung}>{t('verwaltung')}</span> : null}
      </span>
    ) : (
      <span className="text-tinte-2">{t('keineRolle')}</span>
    );
  const zustand = (k: KontoZeile) => {
    if (k.gesperrtAm) return <span className={pilleFehler}>{t('zustand.gesperrt')}</span>;
    if (k.loeschenAb) return <span className={pilleWarnung}>{t('zustand.loeschantrag')}</span>;
    if (!k.bestaetigt && !k.istKind) return <span className={pilleNeutral}>{t('zustand.unbestaetigt')}</span>;
    return <span className={pilleGut}>{t('zustand.aktiv')}</span>;
  };
  const oeffnen = (k: KontoZeile) => (
    <Button asChild variant="outline" size="icon">
      <NextLink href={`/verwaltung/gemeinde-konten/${k.id}`}>
        <Eye aria-hidden />
        <span className="sr-only">{t('aktionAnsehen', { name: k.name })}</span>
      </NextLink>
    </Button>
  );

  return (
    <>
      <VerwaltungsKopf
        titel={t('titel')}
        kennung={tg('gruppe.betrieb')}
        einleitung={t('einleitung')}
        aktion={
          bearbeiten ? (
            <Button asChild>
              <NextLink href="/verwaltung/gemeinde-konten/einladen">
                <MailPlus aria-hidden />
                {t('einladen.titel')}
              </NextLink>
            </Button>
          ) : null
        }
      />
      {meldung ? <Meldung art="erfolg">{t(`meldung.${meldung}`)}</Meldung> : null}

      {antraege.length ? (
        <section aria-labelledby="konten-antraege" className={karte}>
          <h2 id="konten-antraege" className="text-24">
            {t('antraege.titel')}
          </h2>
          <p className="text-16 text-tinte-2">{t('antraege.hinweis')}</p>
          <ul className="flex flex-col divide-y divide-linie">
            {antraege.map((k) => {
              const z = loeschZustand(k.loeschenAb, jetzt);
              return (
                <li key={k.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="font-bold">{k.name}</span>
                    <span className="text-16 break-all text-tinte-2">{k.kennung}</span>
                    <span className="flex flex-wrap items-center gap-1.5 text-16">
                      <span className={z === 'faellig' ? pilleFehler : pilleWarnung}>
                        {z === 'faellig' ? t('antraege.faellig') : t('antraege.laeuft')}
                      </span>
                      {k.loeschenAb ? <span>{t('antraege.frist', { datum: datumLang(k.loeschenAb, 'de') })}</span> : null}
                    </span>
                  </span>
                  <Button asChild variant={z === 'faellig' ? 'default' : 'outline'} size="sm">
                    <NextLink href={`/verwaltung/gemeinde-konten/${k.id}#loeschen`}>
                      {z === 'faellig' ? t('antraege.pruefenLoeschen') : t('antraege.ansehen')}
                      <span className="sr-only">: {k.name}</span>
                    </NextLink>
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="konten-liste" className="flex flex-col gap-3">
        <h2 id="konten-liste" className="text-24">
          {t('listeTitel')}
        </h2>
        <form method="get" action="/verwaltung/gemeinde-konten" className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 font-bold">
            {t('filter.rolle')}
            <select name="rolle" defaultValue={filter.rolle} className={feldKlein}>
              <option value="alle">{t('filter.alle')}</option>
              {GEMEINDE_ROLLEN.map((r) => (
                <option key={r} value={r}>
                  {t(`rolle.${r}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 font-bold">
            {t('filter.zustand')}
            <select name="zustand" defaultValue={filter.zustand} className={feldKlein}>
              {(['alle', 'gesperrt', 'loeschantrag', 'unbestaetigt'] as const).map((z) => (
                <option key={z} value={z}>
                  {z === 'alle' ? t('filter.alle') : t(`zustand.${z}`)}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" variant="outline">
            {t('filter.anwenden')}
          </Button>
        </form>
        <p className="text-16 text-tinte-2" role="status">
          {t('anzahl', { anzahl: konten.length })}
        </p>
        {konten.length === 0 ? (
          <ListenLeer text={t('leer')} />
        ) : (
          <TabellenRahmen
            beschriftung={t('listeTitel')}
            mobil={
              <ul className="flex flex-col gap-3">
                {konten.map((k) => (
                  <ListenKarte
                    key={k.id}
                    titel={k.name}
                    angaben={[
                      { label: t('spalte.kennung'), wert: <span className="break-all">{k.kennung}</span> },
                      { label: t('spalte.rollen'), wert: rollen(k) },
                      { label: t('spalte.zustand'), wert: zustand(k) },
                      { label: t('spalte.seit'), wert: datumLang(k.erstelltAm, 'de') },
                    ]}
                    aktionen={oeffnen(k)}
                  />
                ))}
              </ul>
            }
          >
            <table className="w-full min-w-256 border-collapse text-left">
              <thead className="bg-sand">
                <tr>
                  {(['name', 'kennung', 'rollen', 'zustand', 'seit', 'aktion'] as const).map((s) => (
                    <th key={s} scope="col" className="px-4 py-3 text-16 font-bold">
                      {t(`spalte.${s}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {konten.map((k) => (
                  <tr key={k.id} className="border-t border-linie align-middle">
                    <th scope="row" className="px-4 py-3 font-bold">
                      {k.name}
                      {k.istKind ? <span className="block text-16 font-normal text-tinte-2">{t('kinderkonto')}</span> : null}
                    </th>
                    <td className="px-4 py-3 break-all">{k.kennung}</td>
                    <td className="px-4 py-3">{rollen(k)}</td>
                    <td className="px-4 py-3">{zustand(k)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{datumLang(k.erstelltAm, 'de')}</td>
                    <td className="px-4 py-3">{oeffnen(k)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabellenRahmen>
        )}
      </section>

      <section id="einladungen" aria-labelledby="konten-einladungen" className="flex flex-col gap-3">
        <h2 id="konten-einladungen" className="text-24">
          {t('einladungen.titel')}
        </h2>
        {einladungen.length === 0 ? (
          <p className="text-tinte-2">{t('einladungen.leer')}</p>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {einladungen.map((e) => (
              <li key={e.id} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-linie bg-weiss p-4">
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-bold">{e.name}</span>
                  <span className="text-16 break-all text-tinte-2">{e.email}</span>
                  <span className="flex flex-wrap items-center gap-1.5 text-16">
                    <span className={pilleNeutral}>{t(`rolle.${e.art}` as never)}</span>
                    {e.lernende ? <span>{t('einladungen.fuer', { name: e.lernende })}</span> : null}
                  </span>
                  <span className={e.abgelaufen ? 'text-16 font-bold text-fehler' : 'text-16 text-tinte-2'}>
                    {e.abgelaufen ? t('einladungen.abgelaufen') : t('einladungen.gueltigBis', { datum: zeitpunkt(e.laeuftAb) })}
                  </span>
                </span>
                {bearbeiten ? (
                  <form action={gemeindeEinladungWiderrufen}>
                    <input type="hidden" name="id" value={e.id} />
                    <Button type="submit" variant="outline" size="sm" aria-label={t('einladungen.widerrufenLabel', { name: e.name })}>
                      {t('einladungen.widerrufen')}
                    </Button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
