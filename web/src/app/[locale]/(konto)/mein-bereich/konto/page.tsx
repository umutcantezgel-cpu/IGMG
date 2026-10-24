import {
  FileDown,
  Fingerprint,
  GraduationCap,
  KeyRound,
  MonitorSmartphone,
  PenLine,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { AbmeldenKnopf } from '@/components/konto/AbmeldenKnopf';
import { Haken } from '@/components/konto/Haken';
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
import { KNOPF_PRIMAER, KNOPF_SEKUNDAER } from '@/components/mein-bereich/Bausteine';
import { MeinBereichRahmen } from '@/components/mein-bereich/MeinBereichRahmen';
import { PasskeyHinzufuegen } from '@/components/mein-bereich/PasskeyHinzufuegen';
import { Meldung } from '@/components/verwaltung/Meldung';
import type { Locale } from '@/i18n/routing';
import { aktuelleSitzungsId, faktorPflicht, verlangeKontoSeite } from '@/lib/konto/zugang';
import { absaetze, eigeneLernappEinwilligung, lernappMitKontoAn } from '@/lib/lernapp/einwilligung';
import { anzahlEigenerAbgaben } from '@/lib/lernapp/schreiben/folgen';
import { cn } from '@/lib/utils';
import { lernappBestenlisteZuruecknehmen, lernappEinwilligungAendern } from '@/server/actions/lernapp-einwilligung';
import { andereSitzungenBeenden, passkeyEntfernen, schreibabgabenLoeschen, sitzungBeenden } from '@/server/actions/mein-bereich';
import { ladeKontoDetails, ladeLoeschantrag } from '@/server/queries/konto';

/** Je Anfrage gerendert, wartet auf die Sitzung (siehe Layout). */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meinBereich.meta');
  return { title: t('konto') };
}

const LOCALE: Record<Locale, string> = { de: 'de-DE', tr: 'tr-TR', en: 'en-GB' };
/** Rückmeldungen der Aktion „Schreibabgaben löschen“ (`?abgaben=…`); andere Werte zeigen nichts. */
const ABGABEN_MELDUNG = { geloescht: 'erfolg', bestaetigen: 'fehler', zuViele: 'fehler' } as const;
/** Rückmeldungen der Einwilligung „Lern-App“ (`?lernapp=…`, S-L3 N-2); andere Werte zeigen nichts. */
const LERNAPP_MELDUNG = {
  erteilt: 'erfolg',
  widerrufen: 'erfolg',
  ausgeblendet: 'erfolg',
  haken: 'fehler',
  eltern: 'info',
  zuViele: 'fehler',
} as const;

/**
 * Konto (AUFTRAG 3.5 „Alle“): Profil, Passwort, Zwei-Faktor (QR lokal als SVG), Passkeys, angemeldete Geräte,
 * Datenexport (Art. 15/20), Löschantrag (Art. 17). Lehrkräfte ohne zweiten Faktor sehen nur dessen Einrichtung
 * (`?faktor=pflicht`, Weiterleitung aus `verlangeKonto`). Kinderkonten: nur Profil-Sprache, Passwort, Geräte, Export.
 * Wer Schreibabgaben der Lern-App gespeichert hat, kann sie hier endgültig löschen – auch Kinder und auch, wenn die
 * Gruppen der Lern-App ausgeschaltet sind (S-L2 N-2). Einwilligung „Lern-App“ (S-L3 N-2): ab 16 selbst erteilen, solange
 * ein Schalter mit Personendaten der Lern-App an ist; widerrufen und die Zustimmung zur Bestenliste zurücknehmen immer.
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
  const [details, antrag, abgaben, lernapp, lernappAn] = await Promise.all([
    ladeKontoDetails(k.benutzerId, aktuell),
    ladeLoeschantrag(k.benutzerId),
    anzahlEigenerAbgaben(k.benutzerId),
    eigeneLernappEinwilligung(k.benutzerId, k.istKind),
    lernappMitKontoAn(),
  ]);
  if (!details) return null;
  const zeit = new Intl.DateTimeFormat(LOCALE[sprache], { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin' });
  const datum = new Intl.DateTimeFormat(LOCALE[sprache], { dateStyle: 'long', timeZone: 'Europe/Berlin' });
  const pflicht = faktorPflicht(k);
  const passkeysErlaubt = !k.istKind && k.verwaltungsRollen.length === 0;
  const andere = details.sitzungen.filter((x) => !x.aktuell).length;
  const abgabenMeldung = typeof s.abgaben === 'string' && s.abgaben in ABGABEN_MELDUNG ? (s.abgaben as keyof typeof ABGABEN_MELDUNG) : null;
  const lernappMeldung = typeof s.lernapp === 'string' && s.lernapp in LERNAPP_MELDUNG ? (s.lernapp as keyof typeof LERNAPP_MELDUNG) : null;
  const lernappSichtbar = lernappAn || lernapp.eigene !== null || lernapp.bestenliste !== null || lernappMeldung !== null;
  const lernappText =
    lernappMeldung === 'zuViele'
      ? t('zuViele')
      : lernappMeldung === 'eltern'
        ? t('konto.lernapp.eltern')
        : lernappMeldung === 'haken'
          ? t('konto.lernapp.fehler.haken')
          : lernappMeldung
            ? t(`konto.lernapp.ok.${lernappMeldung}`)
            : null;

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

      {lernappSichtbar ? (
        <Abschnitt id="lern-app" Icon={GraduationCap} titel={t('konto.lernapp.titel')} text={t('konto.lernapp.text')}>
          <div className="flex flex-col gap-4">
            {lernappMeldung && lernappText ? (
              <Meldung art={LERNAPP_MELDUNG[lernappMeldung]} fokus>
                {lernappText}
              </Meldung>
            ) : null}
            {lernapp.lage === 'eltern' ? (
              <p className="max-w-text text-16">{t(lernapp.gilt ? 'konto.lernapp.elternGilt' : 'konto.lernapp.eltern')}</p>
            ) : (
              <article
                aria-labelledby="lern-app-einwilligung"
                className={cn(
                  'flex flex-col gap-3 rounded-lg border p-4 md:px-5',
                  lernapp.eigene ? 'border-gruen-700 bg-gruen-50' : 'border-linie bg-papier',
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 id="lern-app-einwilligung" className="text-20">
                    {t('konto.lernapp.einwilligungTitel')}
                  </h3>
                  <Status an={lernapp.eigene !== null} text={t(lernapp.eigene ? 'konto.lernapp.aktiv' : 'konto.lernapp.inaktiv')} />
                </div>
                {lernapp.eigene ? (
                  <p className="text-16 text-tinte-2">{t('konto.lernapp.erteiltAm', { datum: datum.format(lernapp.eigene.erteiltAm) })}</p>
                ) : lernapp.gilt ? (
                  <p className="text-16 text-tinte-2">{t('konto.lernapp.durchEltern')}</p>
                ) : lernapp.widerrufenAm ? (
                  <p className="text-16 text-tinte-2">{t('konto.lernapp.widerrufenAm', { datum: datum.format(lernapp.widerrufenAm) })}</p>
                ) : null}
                {lernapp.eigene || lernapp.gilt || lernappAn ? (
                  <>
                    <p className="max-w-text text-16 font-bold text-tinte-2">{t('konto.lernapp.entwurf')}</p>
                    {absaetze(t(`konto.lernapp.einwilligung.${lernapp.textArt}`)).map((a) => (
                      <p key={a} className="max-w-text text-16 text-pretty">
                        {a}
                      </p>
                    ))}
                  </>
                ) : null}
                {lernapp.eigene || lernapp.gilt ? (
                  <form action={lernappEinwilligungAendern} className="flex max-w-text flex-col gap-3">
                    <input type="hidden" name="sprache" value={sprache} />
                    <input type="hidden" name="aktion" value="widerrufen" />
                    <p className="text-16 font-bold text-warnung">{t('konto.lernapp.widerrufHinweis')}</p>
                    <button type="submit" className={cn(KNOPF_SEKUNDAER, 'self-start')}>
                      {t('konto.lernapp.widerrufen')}
                    </button>
                  </form>
                ) : lernappAn ? (
                  <form action={lernappEinwilligungAendern} className="flex max-w-text flex-col gap-3">
                    <input type="hidden" name="sprache" value={sprache} />
                    <input type="hidden" name="aktion" value="erteilen" />
                    <Haken
                      id="lern-app-haken"
                      name="haken"
                      label={t('konto.lernapp.haken')}
                      fehler={lernappMeldung === 'haken' ? t('konto.lernapp.fehler.haken') : undefined}
                    />
                    <button type="submit" className={cn(KNOPF_PRIMAER, 'self-start')}>
                      {t('konto.lernapp.erteilen')}
                    </button>
                  </form>
                ) : null}
              </article>
            )}
            {lernapp.bestenliste ? (
              <form action={lernappBestenlisteZuruecknehmen} className="flex max-w-text flex-col gap-3 border-t border-linie pt-4">
                <input type="hidden" name="sprache" value={sprache} />
                <h3 className="text-20">{t('konto.lernapp.bestenliste.titel')}</h3>
                <p className="text-16">{t('konto.lernapp.bestenliste.text', { datum: datum.format(lernapp.bestenliste) })}</p>
                <button type="submit" className={cn(KNOPF_SEKUNDAER, 'self-start')}>
                  {t('konto.lernapp.bestenliste.knopf')}
                </button>
              </form>
            ) : null}
          </div>
        </Abschnitt>
      ) : null}

      {abgaben > 0 || abgabenMeldung ? (
        <Abschnitt id="schreibabgaben" Icon={PenLine} titel={t('konto.abgaben.titel')} text={t('konto.abgaben.text', { anzahl: abgaben })}>
          <div className="flex flex-col gap-4">
            {abgabenMeldung ? (
              <Meldung art={ABGABEN_MELDUNG[abgabenMeldung]} fokus>
                {abgabenMeldung === 'zuViele' ? t('zuViele') : t(`konto.abgaben.${abgabenMeldung}`)}
              </Meldung>
            ) : null}
            {abgaben > 0 ? (
              <form action={schreibabgabenLoeschen} className="flex flex-col gap-4">
                <input type="hidden" name="sprache" value={sprache} />
                <label className="flex min-h-11 cursor-pointer items-start gap-3">
                  <input type="checkbox" name="bestaetigt" value="ja" required className="mt-1 size-5 shrink-0 accent-gruen-700" />
                  <span>{t('konto.abgaben.bestaetigt')}</span>
                </label>
                <button
                  type="submit"
                  className="inline-flex min-h-12 druck cursor-pointer items-center gap-2 self-start rounded-md border-2 border-fehler bg-weiss px-5 font-bold text-fehler transition duration-(--dauer-rueckmeldung) hover:bg-fehler-toenung"
                >
                  <Trash2 aria-hidden className="size-5" />
                  {t('konto.abgaben.knopf')}
                </button>
              </form>
            ) : null}
          </div>
        </Abschnitt>
      ) : null}

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
