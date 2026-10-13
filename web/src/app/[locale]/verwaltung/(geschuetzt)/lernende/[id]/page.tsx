import { ArrowLeft, UserMinus, UserPlus } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { EinladungFormular } from '@/components/verwaltung/lernen/EinladungFormular';
import {
  alsTag,
  feldKlein,
  karte,
  pilleFehler,
  pilleFehlerLang,
  pilleGut,
  pilleNeutral,
  pilleWarnung,
} from '@/components/verwaltung/lernen/stil';
import { Meldung } from '@/components/verwaltung/Meldung';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { alterAus } from '@/lib/chat/regeln';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { leseTextVersion } from '@/lib/konto/einwilligung';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { gemeindeEinladen, gemeindeEinladungWiderrufen } from '@/server/actions/gemeinde-konten';
import { mitgliedEntfernen, mitgliedHinzufuegen } from '@/server/actions/gruppen';
import { setzeLernendeStatus } from '@/server/actions/lernende';
import { ladeGruppenAuswahl } from '@/server/queries/verwaltung/gruppen';
import { ladeLernendeDetail } from '@/server/queries/verwaltung/lernende';

const MELDUNGEN = ['status', 'mitglied', 'mitgliedEntfernt', 'widerrufen'] as const;
const zeitpunkt = (d: Date) => `${datumLang(d, 'de')}, ${uhrzeit(d, 'de')}`;

/**
 * Verwaltung › Lernende (H-L02): entschlüsselte Angaben (jeder Abruf im Audit-Log), Gruppen, Eltern-Bezüge und
 * Einladungen, Einwilligungen mit Textfassung, Zeit und erteilender Person (Widerruf sichtbar), Kinderzugang, Status.
 */
export default async function LernendeAnsehen({ params, searchParams }: PageProps<'/[locale]/verwaltung/lernende/[id]'>) {
  const a = await verlangeSeitenRecht('lernende.lesen');
  if (!(await funktionAn('lernplattform'))) notFound();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const l = await ladeLernendeDetail(id, a);
  if (!l) notFound();
  const bearbeiten = darf(a.rollen, 'lernende.bearbeiten');
  const gruppeBearbeiten = darf(a.rollen, 'gruppe.bearbeiten');
  const einladen = darf(a.rollen, 'gemeindekonto.bearbeiten') && (await funktionAn('konten'));
  const [t, tg, tk, gruppen] = await Promise.all([
    getTranslations('verwaltung.lernende'),
    getTranslations('verwaltung.shell'),
    getTranslations('verwaltung.gemeindeKonten'),
    gruppeBearbeiten ? ladeGruppenAuswahl() : Promise.resolve([]),
  ]);
  const heute = berlinerDatum(new Date());
  const meldung = MELDUNGEN.find((m) => m === sp.meldung);
  const d = l.daten;
  const alter = l.sechzehnAm ? alterAus(l.sechzehnAm, heute) : null;
  const freieGruppen = gruppen.filter((g) => !l.gruppen.some((x) => x.id === g.id));
  const leer = t('detail.leer');
  const angaben: [string, string][] = [
    [t('detail.vorname'), d.vorname],
    [t('detail.nachname'), d.nachname],
    [
      t('detail.geburtsdatum'),
      d.geburtsdatum ? `${datumLang(alsTag(d.geburtsdatum), 'de')}${alter !== null ? ` (${t('alter', { alter })})` : ''}` : leer,
    ],
    [
      t('detail.geschlecht'),
      d.geschlecht
        ? t.has(`detail.geschlechtWert.${d.geschlecht}`)
          ? t(`detail.geschlechtWert.${d.geschlecht}` as never)
          : d.geschlecht
        : leer,
    ],
    [t('detail.anschrift'), [d.strasse, [d.plz, d.ort].filter(Boolean).join(' ')].filter(Boolean).join(', ') || leer],
    [
      t('detail.klasse'),
      d.klasse ? (t.has(`detail.klasseWert.${d.klasse}`) ? t(`detail.klasseWert.${d.klasse}` as never) : d.klasse) : leer,
    ],
    [t('detail.geschwister'), d.geschwister || leer],
  ];

  return (
    <>
      <NextLink
        href="/verwaltung/lernende"
        className="inline-flex min-h-12 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <VerwaltungsKopf
        titel={l.anzeigename}
        kennung={tg('gruppe.inhalte')}
        einleitung={t('detail.einleitung', { datum: datumLang(l.aufgenommenAm, 'de'), status: t(`status.${l.status}`) })}
      />
      {meldung ? <Meldung art="erfolg">{t(`meldung.${meldung}`)}</Meldung> : null}
      <Meldung art="info">{t('detail.protokolliert')}</Meldung>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <section aria-labelledby="lernende-angaben" className={karte}>
            <h2 id="lernende-angaben" className="text-24">
              {t('detail.angaben')}
            </h2>
            <dl className="grid gap-x-6 gap-y-3 sm:raster-stammdaten">
              {angaben.map(([k, w]) => (
                <div key={k} className="contents">
                  <dt className="font-bold">{k}</dt>
                  <dd className="break-words">{w}</dd>
                </div>
              ))}
            </dl>
            {d.eltern?.length ? (
              <>
                <h3 className="font-text text-20 font-bold tracking-normal">{t('detail.elternLautAnmeldung')}</h3>
                <ul className="flex flex-col gap-2">
                  {d.eltern.map((e, i) => (
                    <li key={i} className="flex flex-col">
                      <span className="font-bold">{e.name}</span>
                      <span className="text-16 break-all text-tinte-2">{[e.telefon, e.email].filter(Boolean).join(' · ') || leer}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            {l.eingangId && darf(a.rollen, 'eingang.voranmeldung.lesen') ? (
              <NextLink href={`/verwaltung/eingaenge/${l.eingangId}`} className="self-start font-bold underline underline-offset-4">
                {t('detail.zurVoranmeldung')}
              </NextLink>
            ) : null}
          </section>

          <section id="eltern" aria-labelledby="lernende-eltern" className={karte}>
            <h2 id="lernende-eltern" className="text-24">
              {t('detail.eltern')}
            </h2>
            {l.eltern.length ? (
              <ul className="flex flex-col divide-y divide-linie">
                {l.eltern.map((e) => (
                  <li key={e.benutzerId} className="flex flex-col gap-1 py-3">
                    <span className="font-bold">{e.name}</span>
                    <span className="text-16 break-all text-tinte-2">{e.email}</span>
                    <span className="flex flex-wrap gap-1.5">
                      {e.sorgeberechtigt ? <span className={pilleGut}>{t('detail.sorgeberechtigt')}</span> : null}
                      {e.bestaetigtAm ? (
                        <span className={pilleNeutral}>{t('detail.bestaetigtAm', { datum: datumLang(e.bestaetigtAm, 'de') })}</span>
                      ) : null}
                      {e.gesperrt ? <span className={pilleFehler}>{t('detail.gesperrt')}</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t('detail.keineEltern')}</p>
            )}
            {l.einladungen.length ? (
              <>
                <h3 className="font-text text-20 font-bold tracking-normal">{t('detail.einladungen')}</h3>
                <ul className="flex flex-col divide-y divide-linie">
                  {l.einladungen.map((e) => (
                    <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="font-bold">{e.name}</span>
                        <span className="text-16 break-all text-tinte-2">{e.email}</span>
                        <span className="flex flex-wrap items-center gap-1.5 text-16">
                          <span
                            className={
                              e.stand === 'angenommen'
                                ? pilleGut
                                : e.stand === 'offen'
                                  ? pilleNeutral
                                  : e.stand === 'abgelaufen'
                                    ? pilleWarnung
                                    : pilleFehler
                            }
                          >
                            {t(`detail.einladungStand.${e.stand}`)}
                          </span>
                          {e.stand === 'offen' ? (
                            <span className="text-tinte-2">{t('detail.gueltigBis', { datum: zeitpunkt(e.laeuftAb) })}</span>
                          ) : null}
                        </span>
                      </span>
                      {e.stand === 'offen' && einladen ? (
                        <form action={gemeindeEinladungWiderrufen}>
                          <input type="hidden" name="id" value={e.id} />
                          <input type="hidden" name="lernende" value={l.id} />
                          <Button
                            type="submit"
                            variant="outline"
                            size="sm"
                            aria-label={tk('einladungen.widerrufenLabel', { name: e.name })}
                          >
                            {tk('einladungen.widerrufen')}
                          </Button>
                        </form>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            {einladen ? (
              <div className="flex flex-col gap-3 border-t border-linie pt-4">
                <h3 className="font-text text-20 font-bold tracking-normal">{t('detail.elternEinladen')}</h3>
                <p className="text-16 text-tinte-2">{t('detail.elternEinladenHinweis')}</p>
                <EinladungFormular aktion={gemeindeEinladen} lernende={[]} fest={{ art: 'eltern', lernendeId: l.id }} />
              </div>
            ) : null}
          </section>

          <section aria-labelledby="lernende-einwilligungen" className={karte}>
            <h2 id="lernende-einwilligungen" className="text-24">
              {t('detail.einwilligungen')}
            </h2>
            {l.einwilligungen.length ? (
              <ul className="flex flex-col divide-y divide-linie">
                {l.einwilligungen.map((e) => {
                  const fassung = leseTextVersion(e.textVersion);
                  return (
                    <li key={e.id} className="flex flex-col gap-1 py-3">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-bold">
                          {t.has(`einwilligungArt.${e.art}`) ? t(`einwilligungArt.${e.art}` as never) : e.art}
                        </span>
                        {e.widerrufenAm ? (
                          <span className={pilleFehlerLang}>{t('detail.widerrufenAm', { datum: zeitpunkt(e.widerrufenAm) })}</span>
                        ) : (
                          <span className={pilleGut}>{t('detail.gueltig')}</span>
                        )}
                      </span>
                      <span className="text-16 text-tinte-2">
                        {t('detail.erteilt', { datum: zeitpunkt(e.erteiltAm), von: e.erteiltVon ?? t('detail.kontoGeloescht') })}
                      </span>
                      <span className="text-16 text-tinte-2">
                        {t('detail.fassung', {
                          version: fassung ? fassung.version : e.textVersion.slice(0, 24),
                          hash: fassung ? fassung.sha256.slice(0, 12) : '–',
                          sprache: e.sprache,
                        })}
                        {e.einvernehmen ? ` · ${t('detail.einvernehmen')}` : ''}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>{t('detail.keineEinwilligungen')}</p>
            )}
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="lernende-status" className={karte}>
            <h2 id="lernende-status" className="text-24">
              {t('detail.status')}
            </h2>
            {l.loeschenAb ? <p className="font-bold">{t('detail.loeschenAb', { datum: datumLang(l.loeschenAb, 'de') })}</p> : null}
            {bearbeiten ? (
              <form action={setzeLernendeStatus} className="flex flex-col gap-3">
                <input type="hidden" name="id" value={l.id} />
                <label className="flex min-w-0 flex-col gap-1 font-bold">
                  {t('spalte.status')}
                  <select name="status" defaultValue={l.status} className={feldKlein}>
                    {(['aktiv', 'pausiert', 'beendet'] as const).map((s) => (
                      <option key={s} value={s}>
                        {t(`status.${s}`)}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="text-16 text-tinte-2">{t('detail.statusHinweis')}</p>
                <Button type="submit" variant="secondary" className="self-start">
                  {t('detail.statusSpeichern')}
                </Button>
              </form>
            ) : (
              <p>{t(`status.${l.status}`)}</p>
            )}
          </section>

          <section id="gruppen" aria-labelledby="lernende-gruppen" className={karte}>
            <h2 id="lernende-gruppen" className="text-24">
              {t('detail.gruppen')}
            </h2>
            {l.gruppen.length ? (
              <ul className="flex flex-col divide-y divide-linie">
                {l.gruppen.map((g) => (
                  <li key={g.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <span className="flex min-w-0 flex-col">
                      <NextLink href={`/verwaltung/gruppen/${g.id}`} className="font-bold underline underline-offset-4">
                        {g.name}
                      </NextLink>
                      <span className="text-16 text-tinte-2">{t('detail.seit', { datum: datumLang(alsTag(g.seit), 'de') })}</span>
                    </span>
                    {gruppeBearbeiten ? (
                      <form action={mitgliedEntfernen}>
                        <input type="hidden" name="gruppeId" value={g.id} />
                        <input type="hidden" name="lernendeId" value={l.id} />
                        <input type="hidden" name="zurueck" value="lernende" />
                        <Button type="submit" variant="outline" size="sm" aria-label={t('detail.gruppeVerlassenLabel', { gruppe: g.name })}>
                          <UserMinus aria-hidden />
                          {t('detail.gruppeVerlassen')}
                        </Button>
                      </form>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t('keineGruppe')}</p>
            )}
            {gruppeBearbeiten && l.status === 'aktiv' && freieGruppen.length ? (
              <form action={mitgliedHinzufuegen} className="flex flex-col gap-3 border-t border-linie pt-4">
                <input type="hidden" name="lernendeId" value={l.id} />
                <input type="hidden" name="zurueck" value="lernende" />
                <label className="flex min-w-0 flex-col gap-1 font-bold">
                  {t('detail.gruppeWaehlen')}
                  <select name="gruppeId" required className={feldKlein}>
                    {freieGruppen.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </label>
                <Button type="submit" variant="secondary" className="self-start">
                  <UserPlus aria-hidden />
                  {t('detail.gruppeZuordnen')}
                </Button>
              </form>
            ) : null}
          </section>

          <section aria-labelledby="lernende-zugang" className={karte}>
            <h2 id="lernende-zugang" className="text-24">
              {t('detail.kinderzugang')}
            </h2>
            {l.kinderkonto ? (
              <>
                <p className="flex flex-wrap items-center gap-2">
                  <span className={l.kinderkonto.gesperrtAm ? pilleFehler : pilleGut}>
                    {l.kinderkonto.gesperrtAm ? t('detail.zugangGesperrt') : t('detail.zugangAktiv')}
                  </span>
                </p>
                <dl className="grid gap-x-4 gap-y-2 text-16 sm:raster-stammdaten-kurz">
                  <dt className="font-bold">{t('detail.benutzername')}</dt>
                  <dd className="break-all">{l.kinderkonto.benutzername ?? leer}</dd>
                  <dt className="font-bold">{t('detail.angelegt')}</dt>
                  <dd>{datumLang(l.kinderkonto.erstelltAm, 'de')}</dd>
                  <dt className="font-bold">{t('detail.letzteAnmeldung')}</dt>
                  <dd>{l.kinderkonto.letzteSitzung ? zeitpunkt(l.kinderkonto.letzteSitzung) : t('detail.nie')}</dd>
                </dl>
                {darf(a.rollen, 'gemeindekonto.lesen') ? (
                  <NextLink
                    href={`/verwaltung/gemeinde-konten/${l.kinderkonto.benutzerId}`}
                    className="self-start font-bold underline underline-offset-4"
                  >
                    {t('detail.zumKonto')}
                  </NextLink>
                ) : null}
              </>
            ) : (
              <p className="text-16 text-tinte-2">{t('detail.keinZugang')}</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
