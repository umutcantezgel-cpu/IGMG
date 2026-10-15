import { BellRing, CalendarDays, Compass, Info, List, LocateFixed, MapPin, Maximize, Printer, Settings, Sun } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { DruckKnopf } from '@/components/website/gebetszeiten/DruckKnopf';
import { EinstellungenPanel } from '@/components/website/gebetszeiten/EinstellungenPanel';
import { GebetszeitenSeite } from '@/components/website/gebetszeiten/GebetszeitenSeite';
import { MeinOrt, type MeinOrtTexte } from '@/components/website/gebetszeiten/MeinOrt';
import { MonatsTabelle } from '@/components/website/gebetszeiten/MonatsTabelle';
import { QiblaPanel } from '@/components/website/gebetszeiten/QiblaPanel';
import { datumMitJahr, folgemonat, METHODEN_ANZEIGE, monatsname } from '@/components/website/gebetszeiten/zeiten';
import { PushStart } from '@/components/website/push/PushStart';
import type { PushTexte } from '@/components/website/push/PushEinstellungen';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { funktionAn } from '@/lib/funktionen';
import { vapidAusUmgebung } from '@/lib/push/vapid';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { GEBETE, type Gebet } from '@/lib/gebetszeiten/typen';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { heuteBerlin } from '@/lib/zeit/heute';
import { ladeEinstellung } from '@/server/queries/einstellungen';
import { tageszeilen } from '@/lib/gebetszeiten/hijri';
import { ladeGebetszeitenFenster, ladeGebetszeitenMonat } from '@/server/queries/gebetszeiten';

export const ensureStatic = 'navigation';

/** Locale für Datum und Hidschri im Tagesbogen (wie in start/Tagesbogen.tsx). */
const BOGEN_LOCALE: Record<Locale, string> = { de: 'de-DE', tr: 'tr-TR', en: 'en-GB' };

/**
 * Knopf „Vollbild“: eine Instanz im Kopf neben dem Datum, auf allen Breiten (Sichtabnahme Z-04, G-4; vorher stand er auf
 * dem Telefon verwaist am Seitenende).
 */
const VOLLBILD =
  'inline-flex min-h-12 shrink-0 items-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5 font-bold text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800 active:scale-98';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('gebetszeiten');
  return metadatenFuer({ pfad: '/gebetszeiten', titel: t('titel'), beschreibung: t('metaBeschreibung') });
}

/**
 * Gebetszeiten (Blatt S02): Kopf mit Datum, Standort und Vollbild-Link, darunter das nächste Gebet, die Tabs Heute,
 * Monatlich, Qibla und Einstellungen. Zeiten aus den Abfragen (K-08); der Standort ist fest Wetzlar. Koordinaten stehen
 * im Tab Einstellungen, die Qibla-Richtung im Tab Qibla.
 */
export default async function GebetszeitenSeitePage() {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('gebetszeiten');
  const tl = await getTranslations('leiste');
  const tk = await getTranslations('kopf');
  const ts = await getTranslations('start');
  const to = await getTranslations('meinOrt');
  const tp = await getTranslations('push');
  // Push nur mit Schalter und VAPID-Schlüssel (zur Bauzeit; die Seite ist statisch, ADR 0034/0035)
  const vapid = vapidAusUmgebung();
  const pushAn = vapid !== null && (await funktionAn('push')) && (await funktionAn('push_gebet'));
  const [tDe, tTr, tEn] = await Promise.all([
    getTranslations({ locale: 'de', namespace: 'leiste' }),
    getTranslations({ locale: 'tr', namespace: 'leiste' }),
    getTranslations({ locale: 'en', namespace: 'leiste' }),
  ]);
  const ort = { de: tDe('ort'), tr: tTr('ort'), en: tEn('ort') };

  const [fenster, einst, heute] = await Promise.all([ladeGebetszeitenFenster(), ladeEinstellung('gebetszeiten'), heuteBerlin()]);
  const aktuellerMonat = heute.datum.slice(0, 7);
  const monate = await Promise.all([aktuellerMonat, folgemonat(aktuellerMonat)].map((m) => ladeGebetszeitenMonat(m)));

  const namen = Object.fromEntries(GEBETE.map((g) => [g, tl(g)])) as Record<Gebet, string>;
  const beschreibungen = Object.fromEntries(GEBETE.map((g) => [g, t(`beschreibungen.${g}`)])) as Record<Gebet, string>;
  const methode = METHODEN_ANZEIGE[einst.methode] ?? null;
  const hinweisHeute = fenster.quelle === 'berechnet' && !fenster.bestaetigt;
  const datumText = datumMitJahr(heute.datum, sprache);

  const monatPanel = (
    <div id="gebetszeiten-monat" className="flex flex-col gap-6">
      <div className="flex justify-end print:hidden">
        <DruckKnopf>
          <Printer aria-hidden className="size-5" />
          <span>{t('drucken')}</span>
        </DruckKnopf>
      </div>
      {monate.map((m) => (
        <MonatsTabelle
          key={m.monat}
          monat={m}
          texte={{
            titel: t('monatTitel', { monat: monatsname(m.monat, sprache) }),
            untertitel: t('monatUntertitel'),
            berechnet: tl('berechnet'),
            ramadan: t('ramadan'),
            datum: t('tabelleDatum'),
            namen,
            hinweis: m.quelle !== 'import' && !m.bestaetigt,
          }}
        />
      ))}
    </div>
  );

  const ortTexte: MeinOrtTexte = {
    ...(Object.fromEntries(
      (
        [
          'titel',
          'einleitung',
          'standortVerwenden',
          'ortWaehlen',
          'datenschutz',
          'ohneJs',
          'laedt',
          'sucht',
          'verweigert',
          'nichtVerfuegbar',
          'spaeter',
          'frueher',
          'fehler',
          'ortLabel',
          'ortBitteWaehlen',
          'gruppeUmgebung',
          'gruppeWeitere',
          'eigenerStandort',
          'hinweisBerechnet',
          'spalteGebet',
          'spalteZeit',
          'spalteUnterschied',
          'unterschiedGleich',
          'naechstes',
          'qiblaTitel',
          'qiblaNord',
          'merken',
          'vergessen',
          'gemerktHinweis',
          'andererOrt',
        ] as const
      ).map((k) => [k, to(k)]),
    ) as Omit<
      MeinOrtTexte,
      | 'namen'
      | 'zeitenFuer'
      | 'naehe'
      | 'entfernungMoschee'
      | 'zeitzone'
      | 'unterschiedPlus'
      | 'unterschiedMinus'
      | 'qiblaWert'
      | 'qiblaAria'
      | 'qiblaGrad'
    >),
    zeitenFuer: to.raw('zeitenFuer'),
    entfernungMoschee: to.raw('entfernungMoschee'),
    zeitzone: to.raw('zeitzone'),
    unterschiedPlus: to.raw('unterschiedPlus'),
    unterschiedMinus: to.raw('unterschiedMinus'),
    unterschiedVorlesen: to.raw('unterschiedVorlesen'),
    naehe: to.raw('naehe'),
    qiblaWert: to.raw('qiblaWert'),
    qiblaAria: to.raw('qiblaAria'),
    qiblaGrad: to.raw('qiblaGrad'),
    namen,
  };
  const ortPanel = (
    <MeinOrt
      texte={ortTexte}
      sprache={BOGEN_LOCALE[sprache]}
      einstellungen={{
        methode: einst.methode,
        madhab: einst.madhab,
        hoheBreite: einst.hoheBreite,
        anpassungen: einst.anpassungen,
        breite: einst.breite,
        laenge: einst.laenge,
      }}
      symbole={{ gps: <LocateFixed aria-hidden className="size-5" />, liste: <List aria-hidden className="size-5" /> }}
    />
  );

  const pushTexte: PushTexte = {
    ...(Object.fromEntries(
      (
        [
          'themenTitel',
          'gebeteTitel',
          'minutenTitel',
          'minutenNull',
          'einwilligung',
          'speichern',
          'aktualisieren',
          'abschalten',
          'aktiv',
          'gespeichert',
          'aus',
          'verweigert',
          'nichtUnterstuetzt',
          'ios',
          'fehler',
          'mindestensEins',
          'einwilligungFehlt',
          'laedt',
        ] as const
      ).map((k) => [k, tp(k)]),
    ) as Omit<PushTexte, 'themen' | 'minuten'>),
    minuten: tp.raw('minuten'),
    themen: {
      gebet: tp('themen.gebet'),
      ankuendigung: tp('themen.ankuendigung'),
      chat: tp('themen.chat'),
      unterricht: tp('themen.unterricht'),
    },
  };

  const einstellungenPanel = methode ? (
    <EinstellungenPanel
      sprache={sprache}
      ort={ort}
      breite={einst.breite}
      laenge={einst.laenge}
      quelle={fenster.quelle}
      methode={methode}
      anpassungImsakMin={einst.anpassungen.imsak ?? 0}
      anpassungIshaMin={einst.anpassungen.yatsi ?? 0}
      madhab={null}
    />
  ) : (
    <section className="rounded-lg border border-linie bg-weiss p-5 md:p-8">
      <p>{t('methodeUnbekannt')}</p>
    </section>
  );

  return (
    <Seitenrahmen bereich="islam" seite="gebetszeiten" sprachZiel="/gebetszeiten" leiste={null} pfad={[{ label: tk('gebetszeiten') }]}>
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-8 px-4 pt-6 pb-12 md:px-8 md:pt-12 md:pb-24">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="text-display-1 text-pretty">{t('titel')}</h1>
          {/* Telefon: Datum und „Vollbild“ in der ersten Zeile, Ort und Hinweis darunter; ab md eine Zeile, „Vollbild“ rechts */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-tinte-2">
            <span className="inline-flex items-center gap-2">
              <CalendarDays aria-hidden className="size-5" />
              {datumText}
            </span>
            {/* Kein Vorabruf: Die Anzeige ist für den Moschee-Bildschirm, ihr Code (≈ 16 kB) wäre sonst Ballast (K-12) */}
            <Link
              href="/gebetszeiten/anzeige"
              prefetch={false}
              aria-label={t('vollbildAria')}
              className={`${VOLLBILD} ms-auto md:order-last`}
            >
              <Maximize aria-hidden className="size-5" />
              {t('vollbild')}
            </Link>
            <span className="inline-flex items-center gap-2">
              <MapPin aria-hidden className="size-5" />
              <span className="sr-only">{t('standort')}:</span>
              {tl('ort')}
            </span>
            {hinweisHeute ? (
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-warnung-toenung px-2.5 py-0.5 text-16 font-bold text-warnung">
                <Info aria-hidden className="size-4" />
                {tl('berechnet')}
              </span>
            ) : null}
          </div>
        </div>
        <GebetszeitenSeite
          tage={fenster.tage}
          referenz={fenster.referenz}
          texte={{
            naechstesMorgen: t.raw('naechstesMorgen'),
            uhr: tl.raw('uhr'),
            verbleibt: tl.raw('verbleibt'),
            restStunden: t.raw('restStunden'),
            restMinuten: t.raw('restMinuten'),
            naechstesTag: tl('naechstes'),
            badgeInfo: t('badgeInfo'),
            listeHeute: tl('listeHeute'),
            bogenTitel: ts('bogenTitel'),
            bogenBeschreibung: ts('bogenBeschreibung'),
            bogenLocale: BOGEN_LOCALE[sprache],
            tageszeilen: tageszeilen(
              fenster.tage.map((t) => t.datum),
              BOGEN_LOCALE[sprache],
            ),
            namen,
            beschreibungen,
            ansichtAria: t('ansichtAria'),
            tabs: {
              heute: t('tabHeute'),
              ort: to('tab'),
              monat: t('tabMonat'),
              qibla: t('tabQibla'),
              einstellungen: t('tabEinstellungen'),
            },
          }}
          tabSymbole={{
            heute: <Sun aria-hidden className="size-5" />,
            ort: <LocateFixed aria-hidden className="size-5" />,
            monat: <CalendarDays aria-hidden className="size-5" />,
            qibla: <Compass aria-hidden className="size-5" />,
            einstellungen: <Settings aria-hidden className="size-5" />,
          }}
          panels={{
            ort: ortPanel,
            monat: monatPanel,
            qibla: <QiblaPanel sprache={sprache} ort={ort} breite={einst.breite} laenge={einst.laenge} />,
            einstellungen: einstellungenPanel,
          }}
        />
        {pushAn && vapid ? (
          <PushStart
            titel={tp('titel')}
            einleitung={tp('einleitung')}
            knopf={tp('einrichten')}
            symbol={<BellRing aria-hidden className="size-6 shrink-0 text-gruen-700" />}
            texte={pushTexte}
            oeffentlich={vapid.oeffentlich}
            themen={['gebet', 'ankuendigung']}
            gebete={Object.fromEntries(GEBETE.filter((g) => g !== 'gunes').map((g) => [g, namen[g]]))}
            sprache={sprache}
          />
        ) : null}
      </div>
    </Seitenrahmen>
  );
}
