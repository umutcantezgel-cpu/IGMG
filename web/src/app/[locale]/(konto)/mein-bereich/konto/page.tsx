import { FileDown, Fingerprint, KeyRound, MonitorSmartphone, ShieldCheck, Trash2, UserRound, X } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { AbmeldenKnopf } from '@/components/konto/AbmeldenKnopf';
import { KontoEinstieg } from '@/components/konto/KontoEinstieg';
import { Abschnitt, Status } from '@/components/mein-bereich/Abschnitt';
import {
  DatenExport,
  LoeschAntrag,
  PasswortAendernFormular,
  ProfilFormular,
  ZweiFaktorAbschalten,
  ZweiFaktorEinrichten,
} from '@/components/mein-bereich/KontoFormulare';
import { MeinBereichRahmen } from '@/components/mein-bereich/MeinBereichRahmen';
import { PasskeyHinzufuegen } from '@/components/mein-bereich/PasskeyHinzufuegen';
import { Meldung } from '@/components/verwaltung/Meldung';
import type { Locale } from '@/i18n/routing';
import { aktuelleSitzungsId, faktorPflicht, verlangeKontoSeite } from '@/lib/konto/zugang';
import { andereSitzungenBeenden, passkeyEntfernen, sitzungBeenden } from '@/server/actions/mein-bereich';
import { ladeKontoDetails, ladeLoeschantrag } from '@/server/queries/konto';

/** Je Anfrage gerendert, wartet auf die Sitzung (siehe Layout). */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meinBereich.meta');
  return { title: t('konto') };
}

const LOCALE: Record<Locale, string> = { de: 'de-DE', tr: 'tr-TR', en: 'en-GB' };

/**
 * Konto (AUFTRAG 3.5 „Alle“): Profil, Passwort, Zwei-Faktor (QR lokal als SVG), Passkeys, angemeldete Geräte,
 * Datenexport (Art. 15/20), Löschantrag (Art. 17). Lehrkräfte ohne zweiten Faktor sehen nur dessen Einrichtung
 * (`?faktor=pflicht`, Weiterleitung aus `verlangeKonto`). Kinderkonten: nur Profil-Sprache, Passwort, Geräte, Export.
 */
export default async function KontoSeite({ searchParams }: PageProps<'/[locale]/mein-bereich/konto'>) {
  const sprache = (await getLocale()) as Locale;
  const k = await verlangeKontoSeite(sprache);
  const s = await searchParams;
  const t = await getTranslations('meinBereich');

  // Pflicht zum zweiten Faktor (Lehrkraft): nur die Einrichtung, ohne Navigation
  if (!k.zweiFaktorErfuellt && k.gemeindeRollen.includes('lehrkraft')) {
    return (
      <KontoEinstieg
        seite="mein-bereich"
        sprachZiel="/mein-bereich/konto"
        titel={t('konto.pflicht.titel')}
        ohneEinordnung
        konto={{ anzeigename: k.anzeigename }}
      >
        <div className="flex flex-col gap-6">
          <Meldung art="info">{t('konto.pflicht.text')}</Meldung>
          <ZweiFaktorEinrichten />
          <div className="border-t border-linie pt-5">
            <AbmeldenKnopf sprache={sprache} text={t('nav.abmelden')} />
          </div>
        </div>
      </KontoEinstieg>
    );
  }

  const aktuell = await aktuelleSitzungsId();
  const [details, antrag] = await Promise.all([ladeKontoDetails(k.benutzerId, aktuell), ladeLoeschantrag(k.benutzerId)]);
  if (!details) return null;
  const zeit = new Intl.DateTimeFormat(LOCALE[sprache], { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin' });
  const datum = new Intl.DateTimeFormat(LOCALE[sprache], { dateStyle: 'long', timeZone: 'Europe/Berlin' });
  const pflicht = faktorPflicht(k);
  const passkeysErlaubt = !k.istKind && k.verwaltungsRollen.length === 0;
  const andere = details.sitzungen.filter((x) => !x.aktuell).length;

  return (
    <MeinBereichRahmen
      konto={k}
      aktuell="konto"
      titel={t('konto.titel')}
      untertitel={t('konto.untertitel')}
      sprachZiel="/mein-bereich/konto"
    >
      {s.faktor === 'eingerichtet' ? <Meldung art="erfolg">{t('konto.zweiFaktor.eingerichtet')}</Meldung> : null}

      <Abschnitt id="profil" Icon={UserRound} titel={t('konto.profil.titel')}>
        <dl className="mb-6 grid gap-x-6 gap-y-2 rounded-md bg-sand px-4 py-3 text-16 sm:raster-symbol">
          {details.email ? (
            <>
              <dt className="font-bold">{t('konto.profil.email')}</dt>
              <dd className="break-all">{details.email}</dd>
            </>
          ) : null}
          {details.benutzername ? (
            <>
              <dt className="font-bold">{t('konto.profil.benutzername')}</dt>
              <dd className="font-mono">{details.benutzername}</dd>
            </>
          ) : null}
          <dt className="font-bold">{t('konto.profil.seit')}</dt>
          <dd>{datum.format(new Date(details.angelegt))}</dd>
        </dl>
        {k.istKind ? <p className="mb-5 text-16 text-tinte-2">{t('konto.profil.kindHinweis')}</p> : null}
        <ProfilFormular name={details.name} anzeigename={details.anzeigename} sprache={details.sprache} istKind={k.istKind} />
      </Abschnitt>

      <Abschnitt id="passwort" Icon={KeyRound} titel={t('konto.passwort.titel')} text={t('konto.passwort.hinweis')}>
        <PasswortAendernFormular />
      </Abschnitt>

      {k.istKind ? null : (
        <Abschnitt
          id="zwei-faktor"
          Icon={ShieldCheck}
          titel={t('konto.zweiFaktor.titel')}
          rechts={
            <Status an={details.zweiFaktor} text={details.zweiFaktor ? t('konto.zweiFaktor.aktiv') : t('konto.zweiFaktor.inaktiv')} />
          }
          text={details.zweiFaktor ? t('konto.zweiFaktor.textAktiv') : t('konto.zweiFaktor.text')}
        >
          {details.zweiFaktor ? (
            pflicht ? (
              <p className="text-16 text-tinte-2">{t('konto.zweiFaktor.pflicht')}</p>
            ) : (
              <ZweiFaktorAbschalten />
            )
          ) : (
            <ZweiFaktorEinrichten />
          )}
        </Abschnitt>
      )}

      {k.istKind ? null : (
        <Abschnitt id="passkeys" Icon={Fingerprint} titel={t('konto.passkeys.titel')} text={t('konto.passkeys.text')}>
          {passkeysErlaubt ? (
            <div className="flex flex-col gap-6">
              {details.passkeys.length ? (
                <ul className="flex flex-col divide-y divide-linie rounded-md border border-linie">
                  {details.passkeys.map((p) => {
                    const name = p.name || t('konto.passkeys.ohneName');
                    return (
                      <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                        <span className="flex min-w-0 flex-col">
                          <span className="font-bold break-words">{name}</span>
                          <span className="text-16 text-tinte-2">
                            {p.erstellt ? t('konto.passkeys.erstellt', { datum: datum.format(new Date(p.erstellt)) }) : null}
                            {p.gesichert ? ` · ${t('konto.passkeys.gesichert')}` : ''}
                          </span>
                        </span>
                        <form action={passkeyEntfernen}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="sprache" value={sprache} />
                          <button
                            type="submit"
                            aria-label={t('konto.passkeys.entfernenLabel', { name })}
                            className="inline-flex min-h-12 druck cursor-pointer items-center gap-2 rounded-md px-3 font-bold text-fehler transition duration-(--dauer-rueckmeldung) hover:bg-fehler-toenung"
                          >
                            <X aria-hidden className="size-5" />
                            {t('konto.passkeys.entfernen')}
                          </button>
                        </form>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-16 text-tinte-2">{t('konto.passkeys.keine')}</p>
              )}
              <PasskeyHinzufuegen standardName={t('konto.passkeys.nameStandard')} />
            </div>
          ) : (
            <Meldung art="info">{t('konto.passkeys.verwaltung')}</Meldung>
          )}
        </Abschnitt>
      )}

      <Abschnitt id="sitzungen" Icon={MonitorSmartphone} titel={t('konto.sitzungen.titel')} text={t('konto.sitzungen.text')}>
        <ul className="flex flex-col divide-y divide-linie rounded-md border border-linie">
          {details.sitzungen.map((x) => {
            const geraet = [x.geraet.browser, x.geraet.system].filter(Boolean).join(' · ') || t('konto.sitzungen.unbekannt');
            return (
              <li key={x.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <span className="flex min-w-0 flex-col">
                  <span className="flex flex-wrap items-center gap-2 font-bold">
                    {geraet}
                    {x.id === aktuell ? (
                      <span className="rounded-pill bg-gruen-50 px-2.5 py-0.5 text-16 text-gruen-800">{t('konto.sitzungen.aktuell')}</span>
                    ) : null}
                  </span>
                  <span className="text-16 text-tinte-2">
                    {t('konto.sitzungen.seit', { zeit: zeit.format(new Date(x.seit)) })} ·{' '}
                    {t('konto.sitzungen.zuletzt', { zeit: zeit.format(new Date(x.zuletzt)) })}
                  </span>
                </span>
                {x.id === aktuell ? null : (
                  <form action={sitzungBeenden}>
                    <input type="hidden" name="id" value={x.id} />
                    <input type="hidden" name="sprache" value={sprache} />
                    <button
                      type="submit"
                      aria-label={t('konto.sitzungen.beendenLabel', { geraet })}
                      className="inline-flex min-h-12 druck cursor-pointer items-center gap-2 rounded-md border border-rand bg-weiss px-4 font-bold text-tinte transition duration-(--dauer-rueckmeldung) hover:bg-sand"
                    >
                      {t('konto.sitzungen.beenden')}
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
        {andere > 0 ? (
          <form action={andereSitzungenBeenden} className="mt-4">
            <input type="hidden" name="sprache" value={sprache} />
            <button
              type="submit"
              className="inline-flex min-h-12 druck cursor-pointer items-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5 font-bold text-gruen-800 transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50"
            >
              {t('konto.sitzungen.alleAnderen')}
            </button>
          </form>
        ) : null}
      </Abschnitt>

      <Abschnitt id="daten" Icon={FileDown} titel={t('konto.export.titel')} text={t('konto.export.text')}>
        <DatenExport />
      </Abschnitt>

      <Abschnitt id="loeschen" Icon={Trash2} titel={t('konto.loeschen.titel')} text={k.istKind ? undefined : t('konto.loeschen.text')}>
        {antrag ? (
          <Meldung art="info">
            {t('konto.loeschen.gestellt', {
              seit: antrag.seit ? datum.format(new Date(antrag.seit)) : '–',
              datum: datum.format(new Date(antrag.loeschenAb)),
            })}
          </Meldung>
        ) : k.istKind ? (
          <p className="text-16 text-tinte-2">{t('konto.loeschen.kind')}</p>
        ) : (
          <LoeschAntrag />
        )}
      </Abschnitt>
    </MeinBereichRahmen>
  );
}
