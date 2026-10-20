import { ChartNoAxesColumnIncreasing, House, Library, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import { pfadFuer } from '@/i18n/navigation';
import { funktionAn } from '@/lib/funktionen';
import { lernAdresse } from '@/lib/lernapp/adressen';
import { istKursSlug, kursInOberflaeche, OBERFLAECHEN, richtung, type Oberflaeche } from '@/lib/lernapp/kurse';
import { lernTexte } from '@/lib/lernapp/texte';
import { LernStern } from './Zeichen';

export type Bereich = 'start' | 'fortschritt' | 'wortschatz' | 'einstellungen';

/** Bereiche im Kopf; `spiegeln`: gerichtetes Zeichen (steigende Säulen), in `rtl` gespiegelt (KERN 4.0 §7). */
const NAV = [
  { bereich: 'start', pfad: '', Zeichen: House, spiegeln: false },
  { bereich: 'fortschritt', pfad: 'fortschritt', Zeichen: ChartNoAxesColumnIncreasing, spiegeln: true },
  { bereich: 'wortschatz', pfad: 'wortschatz', Zeichen: Library, spiegeln: false },
] as const;

/** Website-Seite in der passenden Sprache: tr bleibt tr, ar und de führen auf die deutsche Fassung. */
function website(ui: Oberflaeche, ziel: '/' | '/datenschutz' | '/impressum'): { adresse: string; sprache: 'de' | 'tr' } {
  const sprache = ui === 'tr' ? 'tr' : 'de';
  return { adresse: pfadFuer(ziel, sprache), sprache };
}

/**
 * Rahmen jeder Lern-App-Seite (Server, ohne Programmcode im Browser): Sprunglink, Kopf mit Name, Bereichen und
 * Einstellungen, Hauptinhalt, Fuß mit Sprachwahl und Rechtlichem. Links sind einfache `<a>` (ganze Seiten, die der
 * Service Worker vorhält). `pfad` ist der Rest nach `/lern-app/<ui>` für die Sprachwahl; eine Seite, die es in einer
 * Sprache nicht gibt (Koran-Arabisch in `ar`), führt dort zum Start. Anmelden erscheint nur mit dem Schalter `konten`.
 */
export async function Rahmen({
  ui,
  bereich,
  pfad,
  children,
}: {
  ui: Oberflaeche;
  bereich: Bereich | null;
  pfad: string;
  children: ReactNode;
}) {
  const t = lernTexte(ui);
  const konten = await funktionAn('konten');
  const kurs = pfad.split('/')[0];
  const sprachZiel = (s: Oberflaeche) => (istKursSlug(kurs) && !kursInOberflaeche(kurs, s) ? lernAdresse(s) : lernAdresse(s, pfad));
  const fuss = [
    { adresse: lernAdresse(ui, 'quellen'), text: t('rahmen.quellen') },
    { ...website(ui, '/datenschutz'), text: t('rahmen.datenschutz') },
    { ...website(ui, '/impressum'), text: t('rahmen.impressum') },
    { ...website(ui, '/'), text: t('rahmen.website') },
    ...(konten ? [{ adresse: lernAdresse(ui, 'anmelden'), text: t('rahmen.anmelden') }] : []),
  ];
  return (
    <>
      <a
        href="#inhalt"
        className="sr-only z-(--ebene-sprung) rounded-md bg-weiss px-4 py-3 font-bold focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
      >
        {t('rahmen.zumInhalt')}
      </a>
      <header className="border-b border-linie bg-weiss">
        <div className="mx-auto flex max-w-(--container-inhalt) flex-wrap items-center gap-x-6 gap-y-1 px-4 pt-2 md:px-8 md:py-2">
          <a
            href={lernAdresse(ui)}
            className="inline-flex min-h-11 items-center gap-2 font-display text-20 font-semibold text-tinte no-underline hover:text-gruen-800"
          >
            <LernStern className="size-7 shrink-0 text-gruen-700" />
            {t('meta.name')}
          </a>
          <nav aria-label={t('rahmen.navigation')} className="order-last w-full md:order-none md:w-auto md:flex-1">
            <ul className="grid grid-cols-3 md:flex md:gap-1">
              {NAV.map(({ bereich: b, pfad: p, Zeichen, spiegeln }) => (
                <li key={b}>
                  <a
                    href={lernAdresse(ui, p)}
                    aria-current={bereich === b ? 'page' : undefined}
                    className={`flex min-h-14 flex-col items-center justify-center gap-1 border-b-2 px-2 text-16 font-bold no-underline hover:text-gruen-800 md:min-h-11 md:flex-row md:gap-2 md:rounded-md md:border-b-0 md:px-3 ${bereich === b ? 'border-gruen-700 text-gruen-800 md:bg-gruen-50' : 'border-transparent text-tinte-2'}`}
                  >
                    <Zeichen aria-hidden className={`size-5 shrink-0 ${spiegeln ? 'rtl:-scale-x-100' : ''}`} />
                    {t(`rahmen.${b}`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a
            href={lernAdresse(ui, 'einstellungen')}
            aria-current={bereich === 'einstellungen' ? 'page' : undefined}
            className={`ms-auto inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md px-2 text-16 font-bold no-underline hover:text-gruen-800 md:ms-0 md:px-3 ${bereich === 'einstellungen' ? 'bg-gruen-50 text-gruen-800' : 'text-tinte-2'}`}
          >
            <Settings aria-hidden className="size-5 shrink-0" />
            <span className="sr-only md:not-sr-only">{t('rahmen.einstellungen')}</span>
          </a>
        </div>
      </header>
      <main id="inhalt" tabIndex={-1} className="mx-auto w-full max-w-(--container-inhalt) px-4 py-8 focus:outline-none md:px-8 md:py-12">
        {children}
      </main>
      <footer className="border-t border-linie bg-sand">
        <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-6 px-4 py-8 md:px-8">
          <p className="max-w-einleitung text-16 text-tinte-2">{t('rahmen.geraet')}</p>
          <nav aria-label={t('rahmen.sprachwahl')}>
            <ul className="flex flex-wrap gap-x-2 gap-y-1">
              {OBERFLAECHEN.map((s) => (
                <li key={s}>
                  <a
                    href={sprachZiel(s)}
                    hrefLang={s}
                    lang={s}
                    dir={richtung(s)}
                    aria-current={s === ui ? 'page' : undefined}
                    className={`inline-flex min-h-11 items-center rounded-md px-3 font-bold no-underline hover:bg-weiss ${s === ui ? 'bg-weiss text-tinte' : ''}`}
                  >
                    {lernTexte(s)('sprache.eigenname')}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label={t('rahmen.fussNavigation')}>
            <ul className="flex flex-wrap gap-x-6 gap-y-1">
              {fuss.map((l) => (
                <li key={l.adresse}>
                  <a
                    href={l.adresse}
                    hrefLang={'sprache' in l && l.sprache !== ui ? l.sprache : undefined}
                    className="inline-flex min-h-11 items-center text-16 underline-offset-4 hover:underline"
                  >
                    {l.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>
    </>
  );
}
