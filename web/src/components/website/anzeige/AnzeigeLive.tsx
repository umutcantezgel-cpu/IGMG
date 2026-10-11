'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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

/**
 * Moschee-Bildschirm (design/FullscreenPrayerTimes.dc.html, Blatt S03, K-08): Uhr und Tageswechsel in
 * Europe/Berlin, Sprache wechselt alle 10 s (de/tr), Restzeit bis zum nächsten Gebet. Die Daten reichen 45 Tage –
 * ohne Netz läuft die Anzeige weiter; mit Netz lädt sie nach Mitternacht neu (frische Zeiten).
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

  return (
    <div lang={sprache} className="@container flex min-h-dvh flex-col bg-gruen-950 text-weiss [&_:focus-visible]:outline-weiss">
      <header className="flex items-center justify-between gap-4 border-b border-gruen-800 px-[clamp(16px,3cqi,48px)] py-[clamp(16px,2cqi,32px)]">
        {/* Telefon: Name und Ort fest zweizeilig – ein schriftbreitenabhängiger Umbruch würde beim Schrifttausch springen (CLS) */}
        <div className="flex items-center gap-4">
          <span className="flex shrink-0 rounded-md bg-weiss p-1">
            <Image src="/bilder/logos/logo-igmg-wetzlar.png" alt="" width={40} height={40} className="size-10" priority />
          </span>
          <div className="flex flex-col md:flex-row md:items-center md:gap-4">
            <h1 className="text-[clamp(24px,2.4cqi,36px)] leading-tight whitespace-nowrap">IGMG Wetzlar</h1>
            <span aria-hidden className="hidden text-gruen-100 md:inline">
              •
            </span>
            <span className="text-[clamp(20px,1.8cqi,30px)] leading-snug text-gruen-100">{t.ort}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {berechnet ? (
            <span className="rounded-pill bg-warnung-toenung px-3 py-0.5 text-18 font-bold text-warnung">{t.berechnet}</span>
          ) : null}
          {!online ? <span className="rounded-pill bg-info-toenung px-3 py-0.5 text-18 font-bold text-info">{t.offline}</span> : null}
          <Link
            href={zurueckHref}
            aria-label={t.schliessen}
            className="flex size-14 items-center justify-center rounded-lg border border-gruen-100 text-weiss hover:bg-gruen-800 hover:text-weiss"
          >
            <X aria-hidden className="size-7" />
          </Link>
        </div>
      </header>

      <section className="flex flex-wrap items-center justify-between gap-x-12 gap-y-6 px-[clamp(16px,3cqi,48px)] py-[clamp(20px,3cqi,40px)]">
        <div className="flex flex-col gap-1">
          <span className="min-h-[1em] text-[clamp(64px,7cqi,144px)] leading-none font-bold tabular-nums">{uhr}</span>
          <span className="min-h-[1.5em] text-[clamp(20px,2cqi,30px)] text-gruen-100">{datum || '\u00a0'}</span>
        </div>
        <div className="flex min-w-[min(100%,300px)] flex-col rounded-lg border-2 border-gruen-100 bg-gruen-800 px-6 py-4 leading-tight">
          <span className="text-18 font-bold text-gruen-100">{t.naechstes}</span>
          <strong className="text-36 tabular-nums">{naechstesZeit ?? '––:––'}</strong>
          <span className="min-h-[1.55em] text-20">
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
      </section>

      <main className="flex flex-1 flex-col gap-[clamp(16px,2cqi,32px)] px-[clamp(16px,3cqi,48px)] pb-[clamp(16px,2cqi,32px)]">
        <h2 className="text-[clamp(30px,3cqi,48px)]">{t.ueberschrift}</h2>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-[clamp(12px,1.5cqi,24px)]">
          {GEBETE.map((g) => {
            const istAktuell = aktuell === g;
            const istNaechstes = !istAktuell && naechstes?.gebet === g && !naechstes.morgen;
            return (
              <li
                key={g}
                aria-current={istAktuell ? 'time' : undefined}
                className={klassen(
                  'flex flex-col gap-2 rounded-2xl border-2 p-[clamp(16px,2cqi,32px)]',
                  istAktuell
                    ? 'border-weiss bg-weiss text-gruen-950'
                    : istNaechstes
                      ? 'border-gruen-100 bg-gruen-800'
                      : 'border-gruen-800 bg-gruen-950',
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[clamp(24px,2.4cqi,36px)] font-bold">{t.namen[g]}</span>
                  {istAktuell || istNaechstes ? (
                    <span
                      className={klassen(
                        'rounded-pill px-3 py-0.5 text-18 font-bold',
                        istAktuell ? 'bg-gruen-700 text-weiss' : 'bg-weiss text-gruen-950',
                      )}
                    >
                      {istAktuell ? t.aktuell : t.naechstes}
                    </span>
                  ) : null}
                </div>
                <span className="text-[clamp(48px,6cqi,96px)] leading-none font-bold tabular-nums">{zeiten?.[g]}</span>
                <span
                  dir="rtl"
                  lang="ar"
                  className={klassen(
                    // feste Höhe: der spätere Tausch auf Amiri verschiebt nichts (CLS)
                    'block h-[1.6em] overflow-visible text-right font-arabic text-[clamp(28px,2.6cqi,40px)] leading-[1.6]',
                    istAktuell ? 'text-gruen-800' : 'text-gruen-100',
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
          className="min-h-[2.5em] rounded-lg border border-gruen-800 px-6 py-4 text-center text-[clamp(20px,2cqi,30px)] font-bold"
        >
          {status}
        </p>
      </main>
      <footer className="px-[clamp(16px,3cqi,48px)] pt-4 pb-6 text-center text-18 text-gruen-100">{t.hinweis}</footer>
    </div>
  );
}
