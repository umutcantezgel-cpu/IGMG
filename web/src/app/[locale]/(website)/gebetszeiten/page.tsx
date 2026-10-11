import { CalendarDays, Info, MapPin, Maximize } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { DruckKnopf } from '@/components/website/gebetszeiten/DruckKnopf';
import { EinstellungenPanel } from '@/components/website/gebetszeiten/EinstellungenPanel';
import { GebetszeitenSeite } from '@/components/website/gebetszeiten/GebetszeitenSeite';
import { MonatsTabelle } from '@/components/website/gebetszeiten/MonatsTabelle';
import { QiblaPanel } from '@/components/website/gebetszeiten/QiblaPanel';
import { datumMitJahr, folgemonat, METHODEN_ANZEIGE, monatsname } from '@/components/website/gebetszeiten/zeiten';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { qiblaRichtung } from '@/lib/gebetszeiten/berechnung';
import { GEBETE, type Gebet } from '@/lib/gebetszeiten/typen';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { heuteBerlin } from '@/lib/zeit/heute';
import { ladeEinstellung } from '@/server/queries/einstellungen';
import { ladeGebetszeitenFenster, ladeGebetszeitenMonat } from '@/server/queries/gebetszeiten';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('gebetszeiten');
  return metadatenFuer({ pfad: '/gebetszeiten', titel: t('titel'), beschreibung: t('metaBeschreibung') });
}

/** Druckansicht des Tabs Monatlich: auf Papier erscheinen nur die Monatstabellen, Kopf, Leiste und Fuß entfallen. */
const DRUCK_CSS =
  '@media print { body * { visibility: hidden !important; } #gebetszeiten-monat, #gebetszeiten-monat * { visibility: visible !important; } #gebetszeiten-monat { position: absolute; top: 0; left: 0; width: 100%; } }';

/**
 * Gebetszeiten (design/PrayerTimes.dc.html, Blatt S02): Kopf mit Datum, Vollbild-Link und Standort, Nächstes Gebet,
 * Tabs Heute, Monatlich, Qibla, Einstellungen. Zeiten aus den Abfragen (K-08); der Standort ist fest Wetzlar.
 */
export default async function GebetszeitenSeitePage() {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('gebetszeiten');
  const tl = await getTranslations('leiste');
  const tk = await getTranslations('kopf');
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
  const winkel = Math.round(qiblaRichtung(einst.breite, einst.laenge));
  const koordinaten = t('koordinaten', {
    breite: Math.abs(einst.breite).toFixed(4),
    breitenRichtung: einst.breite >= 0 ? t('richtungNord') : t('richtungSued'),
    laenge: Math.abs(einst.laenge).toFixed(4),
    laengenRichtung: einst.laenge >= 0 ? t('richtungOst') : t('richtungWest'),
  });
  const methode = METHODEN_ANZEIGE[einst.methode] ?? null;
  const hinweisHeute = fenster.quelle === 'berechnet' && !fenster.bestaetigt;
  const datumText = datumMitJahr(heute.datum, sprache);

  const monatPanel = (
    <div id="gebetszeiten-monat" className="flex flex-col gap-6">
      <div className="flex justify-end print:hidden">
        <DruckKnopf text={t('drucken')} />
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
    <Seitenrahmen bereich="islam" seite="gebetszeiten" sprachZiel="/gebetszeiten" ohneLeiste pfad={[{ label: tk('gebetszeiten') }]}>
      <style>{DRUCK_CSS}</style>
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-8 px-4 pt-6 pb-12 md:px-8 md:pt-12 md:pb-24">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="text-36 leading-[1.15] text-pretty md:text-48">{t('titel')}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-tinte-2">
              <span className="inline-flex items-center gap-2">
                <CalendarDays aria-hidden className="size-5" />
                {datumText}
              </span>
              {hinweisHeute ? (
                <span className="inline-flex items-center gap-1.5 rounded-pill bg-warnung-toenung px-2.5 py-0.5 text-16 font-bold text-warnung">
                  <Info aria-hidden className="size-4" />
                  {tl('berechnet')}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Kein Vorabruf: Die Anzeige ist für den Moschee-Bildschirm, ihr Code (≈ 16 kB) wäre sonst Ballast (K-12) */}
            <Link
              href="/gebetszeiten/anzeige"
              prefetch={false}
              aria-label={t('vollbildAria')}
              className="inline-flex min-h-12 items-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5 font-bold text-gruen-800 no-underline hover:bg-gruen-50 hover:text-gruen-800"
            >
              <Maximize aria-hidden className="size-5" />
              {t('vollbild')}
            </Link>
            <div className="flex min-h-14 flex-col justify-center rounded-md border border-rand bg-weiss px-4 py-1.5">
              <span className="text-16 text-tinte-2">{t('standort')}</span>
              <span className="flex items-center gap-2 font-bold">
                <MapPin aria-hidden className="size-5 shrink-0 text-gruen-700" />
                {tl('ort')}
              </span>
            </div>
          </div>
        </div>
        <GebetszeitenSeite
          tage={fenster.tage}
          referenz={fenster.referenz}
          texte={{
            naechstesTitel: t.raw('naechstesTitel'),
            uhr: tl.raw('uhr'),
            verbleibt: tl.raw('verbleibt'),
            restStunden: t.raw('restStunden'),
            restMinuten: t.raw('restMinuten'),
            naechstesTag: tl('naechstes'),
            badgeGebet: t('badgeGebet'),
            badgeInfo: t('badgeInfo'),
            namen,
            beschreibungen,
            ansichtAria: t('ansichtAria'),
            tabs: {
              heute: t('tabHeute'),
              monat: t('tabMonat'),
              qibla: t('tabQibla'),
              einstellungen: t('tabEinstellungen'),
            },
          }}
          qiblaText={t('qibla', { winkel: String(winkel) })}
          koordinatenText={koordinaten}
          panels={{
            monat: monatPanel,
            qibla: <QiblaPanel sprache={sprache} ort={ort} breite={einst.breite} laenge={einst.laenge} />,
            einstellungen: einstellungenPanel,
          }}
        />
      </div>
    </Seitenrahmen>
  );
}
