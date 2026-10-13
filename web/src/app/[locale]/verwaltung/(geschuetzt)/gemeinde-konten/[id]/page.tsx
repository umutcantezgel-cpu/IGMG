import { ArrowLeft, Lock, LockOpen, Save, Trash2 } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Rueckfrage } from '@/components/verwaltung/lernen/Rueckfrage';
import { karte, pilleFehler, pilleGut, pilleNeutral, pilleWarnung } from '@/components/verwaltung/lernen/stil';
import { Meldung } from '@/components/verwaltung/Meldung';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { funktionAn } from '@/lib/funktionen';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { GEMEINDE_ROLLEN, loeschZustand } from '@/lib/lernen/verwaltung';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import {
  gemeindeKontoEntsperren,
  gemeindeKontoJetztLoeschen,
  gemeindeKontoSperren,
  gemeindeRollenSpeichern,
} from '@/server/actions/gemeinde-konten';
import { ladeGemeindeKontoAnsicht } from '@/server/queries/verwaltung/gemeinde-konten';

const MELDUNGEN = ['rollen', 'gesperrt', 'entsperrt'] as const;
const FEHLER = ['selbst', 'verwaltungskonto', 'kindRollen', 'unbekannt', 'fristLaeuft', 'nichtGefunden'] as const;
const zeitpunkt = (d: Date) => `${datumLang(d, 'de')}, ${uhrzeit(d, 'de')}`;

/**
 * Verwaltung › Gemeinde-Konto (H-L05): Kontoarten ändern, Bezüge (Kinder, Gruppenleitung, eigener Lerndatensatz),
 * sperren (S-18: alle Sitzungen enden sofort) und – nach Ablauf eines Löschantrags – vollständig löschen.
 */
export default async function GemeindeKonto({ params, searchParams }: PageProps<'/[locale]/verwaltung/gemeinde-konten/[id]'>) {
  const a = await verlangeSeitenRecht('gemeindekonto.lesen');
  if (!(await funktionAn('konten'))) notFound();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const k = await ladeGemeindeKontoAnsicht(id, a);
  if (!k) notFound();
  const [t, tg] = await Promise.all([getTranslations('verwaltung.gemeindeKonten'), getTranslations('verwaltung.shell')]);
  const bearbeiten = darf(a.rollen, 'gemeindekonto.bearbeiten');
  const selbst = k.id === a.benutzerId;
  const lernendeSehen = darf(a.rollen, 'lernende.lesen');
  const meldung = MELDUNGEN.find((m) => m === sp.meldung);
  const fehler = FEHLER.find((f) => f === sp.fehler);
  const loeschen = loeschZustand(k.loeschenAb, new Date());
  const zugangErlaubt = bearbeiten && !selbst && !k.verwaltung;

  return (
    <>
      <NextLink
        href="/verwaltung/gemeinde-konten"
        className="inline-flex min-h-12 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <VerwaltungsKopf titel={k.name} kennung={tg('gruppe.betrieb')} einleitung={<span className="break-all">{k.kennung}</span>} />
      <p className="flex flex-wrap items-center gap-2 text-16 text-tinte-2">
        <span>{t('detail.seit', { datum: datumLang(k.erstelltAm, 'de') })}</span>
        <span aria-hidden>·</span>
        <span>{t('detail.sitzungen', { anzahl: k.sitzungen })}</span>
        <span aria-hidden>·</span>
        <span className={k.zweiFaktor ? pilleGut : k.rollen.includes('lehrkraft') ? pilleWarnung : pilleNeutral}>
          {k.zweiFaktor ? t('detail.zweiFaktorJa') : t('detail.zweiFaktorNein')}
        </span>
        {k.istKind ? <span className={pilleNeutral}>{t('kinderkonto')}</span> : null}
        {k.gesperrtAm ? <span className={pilleFehler}>{t('detail.gesperrtSeit', { datum: zeitpunkt(k.gesperrtAm) })}</span> : null}
      </p>
      {meldung ? <Meldung art="erfolg">{t(`meldung.${meldung}`)}</Meldung> : null}
      {fehler ? <Meldung art="fehler">{t(`fehler.${fehler}`)}</Meldung> : null}
      {k.verwaltung ? (
        <Meldung art="info">
          {t('detail.verwaltungHinweis')}{' '}
          {darf(a.rollen, 'benutzer.lesen') ? (
            <NextLink href={`/verwaltung/benutzer/${k.id}`} className="underline underline-offset-4">
              {t('detail.zuBenutzer')}
            </NextLink>
          ) : null}
        </Meldung>
      ) : null}
      {selbst ? <Meldung art="info">{t('detail.selbstHinweis')}</Meldung> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="konto-rollen" className={karte}>
          <h2 id="konto-rollen" className="text-24">
            {t('detail.rollenTitel')}
          </h2>
          {bearbeiten && !selbst ? (
            <form action={gemeindeRollenSpeichern} className="flex flex-col gap-3">
              <input type="hidden" name="id" value={k.id} />
              <fieldset className="flex flex-col gap-2">
                <legend className="sr-only">{t('detail.rollenTitel')}</legend>
                {GEMEINDE_ROLLEN.map((r) => {
                  const gesperrt = k.istKind && r !== 'schueler';
                  return (
                    <label
                      key={r}
                      className="grid min-h-12 cursor-pointer raster-symbol gap-x-3 has-disabled:cursor-not-allowed has-disabled:text-tinte-2"
                    >
                      <input
                        type="checkbox"
                        name="rollen"
                        value={r}
                        defaultChecked={k.rollen.includes(r)}
                        disabled={gesperrt}
                        className="row-span-2 mt-1 size-5 accent-gruen-700"
                      />
                      <span className="font-bold">{t(`rolle.${r}`)}</span>
                      <span className="text-16 text-tinte-2">{t(`rolleHinweis.${r}`)}</span>
                    </label>
                  );
                })}
              </fieldset>
              {k.istKind ? <p className="text-16 text-tinte-2">{t('detail.kindRollen')}</p> : null}
              <p className="text-16 text-tinte-2">{t('detail.rollenHinweis')}</p>
              <Button type="submit" variant="secondary" className="self-start">
                <Save aria-hidden />
                {t('detail.rollenSpeichern')}
              </Button>
            </form>
          ) : (
            <p>{k.rollen.length ? k.rollen.map((r) => t(`rolle.${r}`)).join(', ') : t('keineRolle')}</p>
          )}
        </section>

        <section aria-labelledby="konto-bezuege" className={karte}>
          <h2 id="konto-bezuege" className="text-24">
            {t('detail.bezuegeTitel')}
          </h2>
          <dl className="flex flex-col gap-3">
            <div>
              <dt className="font-bold">{t('detail.kinder')}</dt>
              <dd>
                {k.kinder.length ? (
                  <ul className="flex flex-col">
                    {k.kinder.map((x) => (
                      <li key={x.id}>
                        {lernendeSehen ? (
                          <NextLink href={`/verwaltung/lernende/${x.id}`} className="underline underline-offset-4">
                            {x.anzeigename}
                          </NextLink>
                        ) : (
                          x.anzeigename
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-tinte-2">{t('detail.keine')}</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="font-bold">{t('detail.leitung')}</dt>
              <dd>
                {k.leitung.length ? (
                  <ul className="flex flex-col">
                    {k.leitung.map((g) => (
                      <li key={g.id}>
                        <NextLink href={`/verwaltung/gruppen/${g.id}`} className="underline underline-offset-4">
                          {g.name}
                        </NextLink>{' '}
                        <span className="text-tinte-2">({t(`detail.leitungRolle.${g.rolle}`)})</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-tinte-2">{t('detail.keine')}</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="font-bold">{t('detail.eigeneLernende')}</dt>
              <dd>
                {k.eigeneLernende ? (
                  lernendeSehen ? (
                    <NextLink href={`/verwaltung/lernende/${k.eigeneLernende.id}`} className="underline underline-offset-4">
                      {k.eigeneLernende.anzeigename}
                    </NextLink>
                  ) : (
                    k.eigeneLernende.anzeigename
                  )
                ) : (
                  <span className="text-tinte-2">{t('detail.keine')}</span>
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="konto-zugang" className={karte}>
          <h2 id="konto-zugang" className="text-24">
            {t('detail.zugangTitel')}
          </h2>
          <p>{t('detail.sperrenText')}</p>
          {zugangErlaubt ? (
            k.gesperrtAm ? (
              <form action={gemeindeKontoEntsperren}>
                <input type="hidden" name="id" value={k.id} />
                <Button type="submit" variant="outline">
                  <LockOpen aria-hidden />
                  {t('detail.entsperren')}
                </Button>
              </form>
            ) : (
              <Rueckfrage
                aktion={gemeindeKontoSperren}
                felder={{ id: k.id }}
                icon={<Lock aria-hidden />}
                gefaehrlich
                texte={{
                  ausloeser: t('detail.sperren'),
                  titel: t('detail.sperrenTitel', { name: k.name }),
                  text: t('detail.sperrenFrage'),
                  bestaetigen: t('detail.sperrenBestaetigen'),
                  abbrechen: t('detail.abbrechen'),
                }}
              />
            )
          ) : null}
        </section>

        <section id="loeschen" aria-labelledby="konto-loeschen" className={karte}>
          <h2 id="konto-loeschen" className="text-24">
            {t('detail.loeschenTitel')}
          </h2>
          {loeschen === 'kein' ? (
            <p className="text-tinte-2">{t('detail.keinAntrag')}</p>
          ) : (
            <>
              <p className="font-bold">
                {loeschen === 'faellig'
                  ? t('detail.antragFaellig', { datum: datumLang(k.loeschenAb!, 'de') })
                  : t('detail.antragLaeuft', { datum: datumLang(k.loeschenAb!, 'de') })}
              </p>
              <p className="text-16 text-tinte-2">{t('detail.loeschenUmfang')}</p>
              {zugangErlaubt && loeschen === 'faellig' ? (
                <Rueckfrage
                  aktion={gemeindeKontoJetztLoeschen}
                  felder={{ id: k.id }}
                  icon={<Trash2 aria-hidden />}
                  gefaehrlich
                  texte={{
                    ausloeser: t('detail.jetztLoeschen'),
                    titel: t('detail.jetztLoeschenTitel', { name: k.name }),
                    text: t('detail.jetztLoeschenFrage'),
                    bestaetigen: t('detail.jetztLoeschenBestaetigen'),
                    abbrechen: t('detail.abbrechen'),
                  }}
                />
              ) : loeschen === 'laeuft' ? (
                <p className="text-16 text-tinte-2">{t('detail.erstNachFrist')}</p>
              ) : null}
            </>
          )}
        </section>
      </div>
    </>
  );
}
