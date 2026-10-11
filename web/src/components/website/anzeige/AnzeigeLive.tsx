'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { type CSSProperties, useEffect, useState } from 'react';
import { berlinerDatum, naechstesGebet, restzeit, zeitpunkt } from '@/lib/gebetszeiten/naechstes';
import { GEBETE, type Gebet, type GebetszeitTag } from '@/lib/gebetszeiten/typen';
import { klassen } from '@/lib/klassen';

export type AnzeigeTexte = {
  ort: string;
  schliessen: string;
  aktuell: string;
  naechstes: string;
  ueberschrift: string;
  aktuelleZeit: string;
  naechsteZeit: string;
  restzeit: string;
  morgen: string;
  hinweis: string;
  berechnet: string;
  offline: string;
  namen: Record<Gebet, string>;
  arabisch: Record<Gebet, string>;
  einheitStd: string;
  einheitMin: string;
};
type Sprache = 'de' | 'tr' | 'en';
const LOCALE: Record<Sprache, string> = { de: 'de-DE', tr: 'tr-TR', en: 'en-GB' };

/** B-10 Gebetszeit-Wechsel: Die Hervorhebung wandert per Überblendung (`dauer-wechsel`, Kurve `ease-standard`). */
const WECHSEL = 'transition-colors duration-(--dauer-wechsel) ease-standard';
/** Dauer des Einblendens für den neuen Namens- und Zeitbereich (`blendet-ein` liest `--dauer`). */
const DAUER_WECHSEL = { '--dauer': 'var(--dauer-wechsel)' } as CSSProperties;

/**
 * Moschee-Bildschirm (design/FullscreenPrayerTimes.dc.html, Blatt S03, K-08): Uhr und Tageswechsel in
 * Europe/Berlin, Sprache wechselt alle 10 s (de/tr), Restzeit bis zum nächsten Gebet. Die Daten reichen 45 Tage –
 * ohne Netz läuft die Anzeige weiter; mit Netz lädt sie nach Mitternacht neu (frische Zeiten).
 * Größen wachsen in Stufen mit der Breite des Bildschirms (Container-Varianten `@3xl` … `@7xl` am Wurzelelement);
 * die Zeiten sind so groß, wie sechs Karten in einer Reihe bei 1920 px noch ohne Überlauf passen (`text-anzeige-64`).
 * Bewegung nur bei einem Gebetswechsel (B-10); beim ersten Laden steht alles sofort da, der Countdown tickt ohne Bewegung.
 */
export function AnzeigeLive({
  tage,
  texte,
  sprachen,
  berechnet,
  zurueckHref,
}: {
  tage: GebetszeitTag[];
  texte: Record<Sprache, AnzeigeTexte>;
  sprachen: Sprache[];
  berechnet: boolean;
  zurueckHref: string;
}) {
  const [jetzt, setJetzt] = useState<Date | null>(null);
  const [index, setIndex] = useState(0);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const geladenAm = berlinerDatum(new Date());
    const tick = () => {
      const n = new Date();
      setJetzt(n);
      // Neuer Tag und Netz vorhanden → neu laden (frische Daten); sonst offline mit dem Vorrat weiter
      if (berlinerDatum(n) !== geladenAm && navigator.onLine) window.location.reload();
    };
    const erst = window.setTimeout(tick, 0);
    const sekunde = window.setInterval(tick, 1000);
    const sprache = window.setInterval(() => setIndex((i) => (i + 1) % sprachen.length), 10_000);
    const netz = () => setOnline(navigator.onLine);
    const taste = (e: KeyboardEvent) => {
      if (e.key === 'Escape') window.location.href = zurueckHref;
    };
    window.addEventListener('online', netz);
    window.addEventListener('offline', netz);
    document.addEventListener('keydown', taste);
    return () => {
      window.clearTimeout(erst);
      window.clearInterval(sekunde);
      window.clearInterval(sprache);
      window.removeEventListener('online', netz);
      window.removeEventListener('offline', netz);
      document.removeEventListener('keydown', taste);
    };
  }, [sprachen.length, zurueckHref]);

  const sprache = sprachen[index] ?? sprachen[0];
  const t = texte[sprache];
  const heuteDatum = jetzt ? berlinerDatum(jetzt) : null;
  const i = heuteDatum ? tage.findIndex((d) => d.datum === heuteDatum) : -1;
  const heute = i >= 0 ? tage[i] : null;
  const morgen = i >= 0 ? (tage[i + 1] ?? null) : null;
  const naechstes =
    jetzt && heute
      ? naechstesGebet({ datum: heute.datum, zeiten: heute }, morgen ? { datum: morgen.datum, zeiten: morgen } : null, jetzt, true)
      : null;
  const aktuell =
    jetzt && heute
      ? ([...GEBETE].reverse().find((g) => g !== 'gunes' && zeitpunkt(heute.datum, heute[g]).getTime() <= jetzt.getTime()) ?? null)
      : null;
  const rest = naechstes ? restzeit(naechstes.restMs) : null;
  const restText = rest ? `${rest.stunden ? `${rest.stunden}${t.einheitStd} ` : ''}${rest.minuten}${t.einheitMin}` : '';
  const fmt = (o: Intl.DateTimeFormatOptions) =>
    jetzt ? new Intl.DateTimeFormat(LOCALE[sprache], { timeZone: 'Europe/Berlin', ...o }).format(jetzt) : '';
  // Vor der Hydrierung Platzhalter in voller Breite: kein spätes LCP und keine Verschiebung (K-12)
  const uhr = fmt({ hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }) || '––:––:––';
  const datum = fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const naechstesZeit = naechstes && (naechstes.morgen ? morgen : heute)?.[naechstes.gebet];
  const status = aktuell
    ? t.aktuelleZeit.replace('{gebet}', t.namen[aktuell])
    : naechstes
      ? t.naechsteZeit.replace('{gebet}', t.namen[naechstes.gebet])
      : '';
  const zeiten = heute ?? tage[1] ?? tage[0];

  // B-10: Gewechselt wird erst, wenn ein bekanntes Gebet auf ein anderes folgt. Der Sprung von „noch keine Zeit“
  // (vor dem Einhängen) auf das erste Gebet ist kein Wechsel und bleibt ohne Bewegung.
  const kennung = naechstes ? `${naechstes.morgen ? 'morgen' : 'heute'}-${naechstes.gebet}` : null;
  const [merke, setMerke] = useState<{ kennung: string | null; gewechselt: boolean }>({ kennung: null, gewechselt: false });
  if (kennung !== merke.kennung) {
    setMerke({ kennung, gewechselt: merke.gewechselt || (merke.kennung !== null && kennung !== null) });
  }
  const gewechselt = merke.gewechselt;
  const wechsel = gewechselt ? WECHSEL : undefined;

  return (
    <div lang={sprache} className="@container flex min-h-dvh flex-col bg-gruen-950 text-weiss">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-gruen-800 px-4 py-4 @3xl:px-8 @5xl:py-6 @7xl:px-12">
        {/* Telefon: Name und Ort fest zweizeilig – ein schriftbreitenabhängiger Umbruch würde beim Schrifttausch springen (CLS) */}
        <div className="flex items-center gap-4">
          <span className="flex shrink-0 rounded-md bg-weiss p-1">
            <Image src="/bilder/logos/logo-igmg-wetzlar.png" alt="" width={40} height={40} className="size-10" priority />
          </span>
          <div className="flex flex-col md:flex-row md:items-center md:gap-4">
            <h1 className="text-24 leading-tight whitespace-nowrap @5xl:text-30 @7xl:text-36">IGMG Wetzlar</h1>
            <span aria-hidden className="hidden text-gruen-100 md:inline">
              •
            </span>
            <span className="text-20 leading-snug text-gruen-100 @5xl:text-24 @7xl:text-30">{t.ort}</span>
          </div>
        </div>
        {/* Telefon mit langen Wörtern (tr „hesaplanmış“): die Gruppe bricht in eine eigene Zeile, bleibt rechtsbündig */}
        <div className="ml-auto flex shrink-0 items-center gap-3">
          {berechnet ? (
            <span className="rounded-pill bg-warnung-toenung px-3 py-0.5 text-18 font-bold text-warnung">{t.berechnet}</span>
          ) : null}
          {!online ? <span className="rounded-pill bg-info-toenung px-3 py-0.5 text-18 font-bold text-info">{t.offline}</span> : null}
          <Link
            href={zurueckHref}
            aria-label={t.schliessen}
            className="flex size-14 items-center justify-center rounded-lg border border-gruen-100 text-weiss hover:bg-gruen-800 hover:text-weiss focus-visible:outline-weiss"
          >
            <X aria-hidden className="size-7" />
          </Link>
        </div>
      </header>

      <section className="flex flex-wrap items-center justify-between gap-x-12 gap-y-6 px-4 py-5 @3xl:px-8 @5xl:py-8 @7xl:px-12">
        <div className="flex flex-col gap-1">
          <span className="text-anzeige-64 leading-none font-bold tabular-nums @5xl:text-anzeige-96 @7xl:text-anzeige-144">{uhr}</span>
          <span className="text-20 text-gruen-100 tabular-nums @5xl:text-24 @7xl:text-30">{datum || '\u00a0'}</span>
        </div>
        <div className="flex min-w-full flex-col rounded-lg border-2 border-gruen-100 bg-gruen-800 px-6 py-4 leading-tight @3xl:min-w-75">
          <span className="text-18 font-bold text-weiss">{t.naechstes}</span>
          {/* Name, Zeit und Restzeit: blenden bei jedem Gebetswechsel neu ein (B-10); der Countdown tickt ohne Bewegung */}
          <div key={kennung ?? 'ohne'} style={DAUER_WECHSEL} className={klassen('flex flex-col', gewechselt && 'blendet-ein')}>
            <strong className="text-36 tabular-nums">{naechstesZeit ?? '––:––'}</strong>
            <span className="text-20 tabular-nums">
              {naechstes ? (
                <>
                  {t.namen[naechstes.gebet]}
                  {naechstes.morgen ? ` (${t.morgen})` : ''} · {t.restzeit.replace('{zeit}', restText)}
                </>
              ) : (
                '\u00a0'
              )}
            </span>
          </div>
        </div>
      </section>

      <main className="flex flex-1 flex-col gap-4 px-4 pb-4 @3xl:px-8 @5xl:gap-8 @5xl:pb-8 @7xl:px-12">
        <h2 className="text-30 @3xl:text-36 @7xl:text-48">{t.ueberschrift}</h2>
        <ul className="grid raster-kacheln gap-4">
          {GEBETE.map((g) => {
            const istAktuell = aktuell === g;
            const istNaechstes = !istAktuell && naechstes?.gebet === g && !naechstes.morgen;
            return (
              <li
                key={g}
                aria-current={istAktuell ? 'time' : undefined}
                className={klassen(
                  'flex flex-col gap-2 rounded-2xl border-2 p-4',
                  istAktuell
                    ? 'border-weiss bg-weiss text-gruen-950'
                    : istNaechstes
                      ? 'border-gruen-100 bg-gruen-800'
                      : 'border-gruen-800 bg-gruen-950',
                  wechsel,
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-24 font-bold wrap-anywhere @3xl:text-30">{t.namen[g]}</span>
                  {/* Das Schild wechselt mit der Rolle der Karte (Aktuell ↔ Nächstes) und blendet dabei ein (B-10) */}
                  {istAktuell || istNaechstes ? (
                    <span
                      key={istAktuell ? 'aktuell' : 'naechstes'}
                      style={DAUER_WECHSEL}
                      className={klassen(
                        'rounded-pill px-3 py-0.5 text-18 font-bold',
                        istAktuell ? 'bg-gruen-800 text-weiss' : 'bg-weiss text-gruen-950',
                        gewechselt && 'blendet-ein',
                      )}
                    >
                      {istAktuell ? t.aktuell : t.naechstes}
                    </span>
                  ) : null}
                </div>
                <span className="text-48 leading-none font-bold tabular-nums @3xl:text-anzeige-64">{zeiten?.[g]}</span>
                <span
                  dir="rtl"
                  lang="ar"
                  className={klassen(
                    // feste Höhe (eine Zeile): der spätere Tausch auf Amiri verschiebt nichts (CLS)
                    'block h-lh overflow-visible text-right font-arabic text-30 leading-relaxed @3xl:text-36',
                    istAktuell ? 'text-gruen-800' : istNaechstes ? 'text-weiss' : 'text-gruen-100',
                    wechsel,
                  )}
                >
                  {t.arabisch[g]}
                </span>
              </li>
            );
          })}
        </ul>
        <p
          role="status"
          className="min-h-lh rounded-lg border border-gruen-800 px-6 py-4 text-center text-20 font-bold tabular-nums @5xl:text-24 @7xl:text-30"
        >
          {status}
        </p>
      </main>
      <footer className="px-4 pt-4 pb-6 text-center text-18 text-gruen-100 @3xl:px-8 @7xl:px-12">{t.hinweis}</footer>
    </div>
  );
}
