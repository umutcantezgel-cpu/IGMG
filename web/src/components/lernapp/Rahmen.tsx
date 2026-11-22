import { ChartNoAxesColumnIncreasing, House, Library, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import { Footer } from '@/components/website/Footer';
import { Header } from '@/components/website/Header';
import type { SprachEintrag } from '@/components/website/kopf/Sprachwahl';
import { funktionAn } from '@/lib/funktionen';
import { lernAdresse } from '@/lib/lernapp/adressen';
import { istKursSlug, kursInOberflaeche, OBERFLAECHEN, richtung, type Oberflaeche } from '@/lib/lernapp/kurse';
import { lernTexte } from '@/lib/lernapp/texte';
import { LernStern } from './Zeichen';

export type Bereich = 'start' | 'fortschritt' | 'wortschatz' | 'einstellungen';

/** Bereiche der Leiste „Lernen“; `spiegeln`: gerichtetes Zeichen (steigende Säulen), in `rtl` gespiegelt (KERN 4.0 §7). */
const NAV = [
  { bereich: 'start', pfad: '', Zeichen: House, spiegeln: false },
  { bereich: 'fortschritt', pfad: 'fortschritt', Zeichen: ChartNoAxesColumnIncreasing, spiegeln: true },
  { bereich: 'wortschatz', pfad: 'wortschatz', Zeichen: Library, spiegeln: false },
  { bereich: 'einstellungen', pfad: 'einstellungen', Zeichen: Settings, spiegeln: false },
] as const;

/**
 * Rahmen jeder Seite im Lernbereich – derselbe wie auf der Website (eine Website, ein Rahmen): Sprunglink, Kopfzeile der
 * Website (Logo, Hauptmenü, Suche, Sprachwahl, Anmelden; „Bildung“ ist markiert), darunter die Leiste „Lernen“ mit den
 * vier Bereichen, Hauptinhalt, Hinweisband des Lernbereichs und die Fußzeile der Website. So führt von jeder Seite ein
 * Klick zurück auf die Website und von jeder Website-Seite einer in den Lernbereich.
 *
 * Kopf und Fuß der Website stehen in der passenden Website-Sprache (`src/i18n/request.ts`: tr bleibt tr, de und ar
 * bekommen Deutsch). In der arabischen Oberfläche sind sie als deutsch und von links nach rechts ausgezeichnet
 * (`data-website-rahmen`, Schriften in `globals.css`), der Lernbereich dazwischen bleibt arabisch und `rtl`.
 * Die Sprachwahl im Kopf nennt die Oberflächensprachen des Lernbereichs; `pfad` ist der Rest nach `/lern-app/<ui>` –
 * eine Seite, die es in einer Sprache nicht gibt (Koran-Arabisch in `ar`), führt dort zum Start. Links des Lernbereichs
 * sind einfache `<a>` (ganze Seiten, die der Service Worker vorhält). Anmelden erscheint nur mit dem Schalter `konten`,
 * „Gruppe“ nur mit `lernapp_gruppen`.
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
  const [konten, gruppen] = await Promise.all([funktionAn('konten'), funktionAn('lernapp_gruppen')]);
  const kurs = pfad.split('/')[0];
  const sprachZiel = (s: Oberflaeche) => (istKursSlug(kurs) && !kursInOberflaeche(kurs, s) ? lernAdresse(s) : lernAdresse(s, pfad));
  const sprachen: SprachEintrag[] = OBERFLAECHEN.map((s) => ({
    code: s,
    kurz: s.toUpperCase(),
    name: lernTexte(s)('sprache.eigenname'),
    href: sprachZiel(s),
  }));
  const weitere = [
    // Gruppe (Zuweisungen, Gruppenziel, Bestenliste) nur mit dem Schalter `lernapp_gruppen` (Personendaten, L7-02)
    ...(gruppen ? [{ adresse: lernAdresse(ui, 'gruppe'), text: t('rahmen.gruppe') }] : []),
    { adresse: lernAdresse(ui, 'quellen'), text: t('rahmen.quellen') },
    ...(konten ? [{ adresse: lernAdresse(ui, 'anmelden'), text: t('rahmen.anmelden') }] : []),
  ];
  // Website-Bausteine in der arabischen Oberfläche: deutsch, von links nach rechts
  const website = ui === 'ar' ? ({ lang: 'de', dir: 'ltr' } as const) : {};
  return (
    <>
      <a
        href="#inhalt"
        className="sr-only z-(--ebene-sprung) rounded-md bg-weiss px-4 py-3 font-bold focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
      >
        {t('rahmen.zumInhalt')}
      </a>
      <div data-website-rahmen {...website}>
        <Header
          aktiv="bildung"
          aktuell="lern-app"
          sprachZiel="/"
          lernbereich={{ sprache: ui, sprachen, anmeldenHref: konten ? lernAdresse(ui, 'anmelden') : undefined }}
        />
      </div>
      <nav aria-label={t('rahmen.navigation')} className="bg-gruen-950 text-weiss">
        <div className="mx-auto flex max-w-(--container-inhalt) items-center gap-x-6 px-2 md:px-8">
          <a
            href={lernAdresse(ui)}
            className="hidden min-h-14 shrink-0 items-center gap-2 font-display text-20 font-semibold text-weiss no-underline outline-weiss hover:text-gruen-100 md:inline-flex"
          >
            <LernStern className="size-6 shrink-0 text-gruen-100" />
            {t('rahmen.bereich')}
          </a>
          {/* Telefon: drei beschriftete Reiter und das Zahnrad (ohne sichtbaren Text – vier Wörter passen nicht in 390 px) */}
          <ul className="grid w-full raster-lernleiste md:flex md:w-auto md:flex-1 md:gap-1">
            {NAV.map(({ bereich: b, pfad: p, Zeichen, spiegeln }) => {
              const hier = bereich === b;
              const zahnrad = b === 'einstellungen';
              return (
                <li key={b} className={zahnrad ? 'md:ms-auto' : undefined}>
                  <a
                    href={lernAdresse(ui, p)}
                    aria-current={hier ? 'page' : undefined}
                    className={`flex min-h-14 flex-col items-center justify-center gap-0.5 border-b-3 text-16 font-bold no-underline outline-weiss md:my-1.5 md:min-h-11 md:flex-row md:gap-2 md:rounded-md md:border-b-0 md:px-3 ${zahnrad ? 'min-w-14 px-3' : 'px-1'} ${hier ? 'border-weiss text-weiss md:bg-weiss md:text-gruen-950 md:hover:text-gruen-950' : 'border-transparent text-gruen-50 hover:text-weiss md:hover:bg-gruen-800'}`}
                  >
                    <Zeichen
                      aria-hidden
                      className={`shrink-0 ${zahnrad ? 'size-6 md:size-5' : 'size-5'} ${spiegeln ? 'rtl:-scale-x-100' : ''}`}
                    />
                    <span className={zahnrad ? 'sr-only md:not-sr-only' : 'max-w-full truncate'}>{t(`rahmen.${b}`)}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
      <main id="inhalt" tabIndex={-1} className="mx-auto w-full max-w-(--container-inhalt) px-4 py-8 focus:outline-none md:px-8 md:py-12">
        {children}
      </main>
      <section aria-label={t('rahmen.hinweisband')} className="border-t border-linie bg-sand">
        <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-4 px-4 py-6 md:px-8">
          <p className="max-w-einleitung text-16 text-tinte-2">{t('rahmen.geraet')}</p>
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
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
                {weitere.map((l) => (
                  <li key={l.adresse}>
                    <a href={l.adresse} className="inline-flex min-h-11 items-center text-16 underline-offset-4 hover:underline">
                      {l.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </section>
      <div data-website-rahmen {...website}>
        <Footer vorabladen={false} />
      </div>
    </>
  );
}
