// Messrouten der Lern-App (L8-02), aus dem Code abgeleitet (web/src/app/lern-app/**, Konto-Seiten in Mein Bereich, Station
// auf /lernen) mit dem Testkurs der E2E (drizzle/seeds/lernapp-test.ts: je Richtung Einheit a1.e01, Lektionen l01–l04).
// Budgets je Art nach KERN 4.0 §9 (Messweise wie web/scripts/messen.mjs bzw. lernapp-budget.mjs, gz -9 je Datei):
//   huelle/start/lernpfad (statische Seiten der Lern-App) ≤ 180 KB gesamt · spieler (Üben, Wiederholen, Einstufung) ≤ 210 KB ·
//   meinbereich ≤ 230 KB · website (Station /lernen) ≤ 180 KB (K-12).
// SEO zählt nur auf indexierbaren Seiten (Start, Lernpfade, Quellen, Website); alle übrigen sind `noindex`.

export const JS_GRENZE = { huelle: 180, start: 180, lernpfad: 180, spieler: 210, meinbereich: 230, website: 180 };

/** Lernpfad je Oberfläche: Richtung mit der Oberfläche als Ausgangssprache (Standard UI = Ausgang). */
export const KURS_JE_UI = { de: 'tr-aus-de', tr: 'de-aus-tr', ar: 'de-aus-ar' };
const ziel = (kurs) => kurs.split('-aus-')[0];
export const lektion = (kurs, n) => `${kurs}.a1.e01.l0${n}`;
export const einheit = (kurs) => `${ziel(kurs)}.a1.e01`;

/** Lighthouse: Lern-App-Routen (öffentlich, ohne Konto), /lernen und die Lern-App-Seiten in Mein Bereich (mit Anmeldung). */
export function lighthouseRouten(konto = {}) {
  const r = [
    { name: 'Einstieg (308 → /lern-app/de)', pfad: '/lern-app', art: 'start', seo: true },
    { name: 'Start de', pfad: '/lern-app/de', art: 'start', seo: true },
    { name: 'Start tr', pfad: '/lern-app/tr', art: 'start', seo: true },
    { name: 'Start ar (RTL)', pfad: '/lern-app/ar', art: 'start', seo: true },
    { name: 'Lernpfad de · tr-aus-de', pfad: '/lern-app/de/tr-aus-de', art: 'lernpfad', seo: true },
    { name: 'Lernpfad tr · de-aus-tr', pfad: '/lern-app/tr/de-aus-tr', art: 'lernpfad', seo: true },
    { name: 'Lernpfad ar · de-aus-ar (RTL)', pfad: '/lern-app/ar/de-aus-ar', art: 'lernpfad', seo: true },
    { name: 'Spieler tr · de-aus-tr l01', pfad: `/lern-app/tr/de-aus-tr/ueben?l=${lektion('de-aus-tr', 1)}`, art: 'spieler', seo: false },
    { name: 'Spieler ar · de-aus-ar l01 (RTL)', pfad: `/lern-app/ar/de-aus-ar/ueben?l=${lektion('de-aus-ar', 1)}`, art: 'spieler', seo: false },
    { name: 'Wiederholen de', pfad: '/lern-app/de/tr-aus-de/wiederholen', art: 'spieler', seo: false },
    { name: 'Einstufung de', pfad: '/lern-app/de/tr-aus-de/einstufung', art: 'spieler', seo: false },
    { name: 'Tipps de', pfad: `/lern-app/de/tr-aus-de/tipps?e=${einheit('tr-aus-de')}`, art: 'huelle', seo: false },
    { name: 'Quellen de', pfad: '/lern-app/de/quellen', art: 'huelle', seo: true },
    { name: 'Fortschritt de', pfad: '/lern-app/de/fortschritt', art: 'start', seo: false },
    { name: 'Wortschatz de', pfad: '/lern-app/de/wortschatz', art: 'huelle', seo: false },
    { name: 'Einstellungen de', pfad: '/lern-app/de/einstellungen', art: 'huelle', seo: false },
    { name: 'Gruppe de (ohne Anmeldung)', pfad: '/lern-app/de/gruppe', art: 'huelle', seo: false },
    { name: 'Anmelden de (dynamisch)', pfad: '/lern-app/de/anmelden', art: 'huelle', seo: false },
    { name: 'Wissenskurs de · islam', pfad: '/lern-app/de/islam', art: 'lernpfad', seo: true },
    { name: 'Koran-Arabisch tr · koran', pfad: '/lern-app/tr/koran', art: 'lernpfad', seo: true },
    { name: 'Website /lernen (Stationen)', pfad: '/lernen', art: 'website', seo: true },
  ];
  if (konto.lehrkraft && konto.gruppe)
    r.push({
      name: 'Mein Bereich · Lehrkraft › Lern-App',
      pfad: `/mein-bereich/unterricht/${konto.gruppe}/lern-app`,
      art: 'meinbereich',
      seo: false,
      zustand: konto.lehrkraft,
    });
  if (konto.kind) r.push({ name: 'Mein Bereich · Schüler-Start (Kind)', pfad: '/mein-bereich', art: 'meinbereich', seo: false, zustand: konto.kind });
  if (konto.eltern && konto.kindId)
    r.push({
      name: 'Mein Bereich · Lernwoche des Kindes (Eltern)',
      pfad: `/mein-bereich/kinder/${konto.kindId}`,
      art: 'meinbereich',
      seo: false,
      zustand: konto.eltern,
    });
  return r;
}

/**
 * axe: alle Lern-App-Routen je Oberfläche (de, tr, ar), dazu der Spieler nach der Antwort (Rückmeldeblatt), die eigene
 * Fehlerseite (absichtlich), /lernen in de/tr/en und die Lern-App-Seiten in Mein Bereich (de/tr/en) mit Anmeldung.
 * `warte`: Selektor, der den geladenen Zustand der Insel zeigt (Client-Inhalt); `antworten`: erste Option wählen und prüfen.
 */
export function axeRouten(konto = {}) {
  const r = [];
  for (const ui of ['de', 'tr', 'ar']) {
    const kurs = KURS_JE_UI[ui];
    const lp = `/lern-app/${ui}/${kurs}`;
    r.push(
      { name: `${ui} Start`, pfad: `/lern-app/${ui}`, warte: 'main h1' },
      { name: `${ui} Lernpfad`, pfad: lp, warte: 'main a[href*="/ueben?l="]' },
      { name: `${ui} Spieler l01 (Auswahl)`, pfad: `${lp}/ueben?l=${lektion(kurs, 1)}`, warte: 'main input[type="radio"]' },
      {
        name: `${ui} Spieler l01 nach der Antwort`,
        pfad: `${lp}/ueben?l=${lektion(kurs, 1)}`,
        warte: 'main input[type="radio"]',
        antworten: true,
      },
      { name: `${ui} Spieler l02 (Wortbank)`, pfad: `${lp}/ueben?l=${lektion(kurs, 2)}`, warte: 'main [role="toolbar"]' },
      { name: `${ui} Spieler l03 (Bildkarte)`, pfad: `${lp}/ueben?l=${lektion(kurs, 3)}`, warte: 'main input[type="radio"]' },
      { name: `${ui} Spieler l04 (Dialog)`, pfad: `${lp}/ueben?l=${lektion(kurs, 4)}`, warte: 'main input[type="radio"]' },
      { name: `${ui} Wiederholen`, pfad: `${lp}/wiederholen`, warte: '#wiederholen-sitzung p' },
      { name: `${ui} Einstufung`, pfad: `${lp}/einstufung`, warte: '#einstufung-test button' },
      { name: `${ui} Tipps`, pfad: `${lp}/tipps?e=${einheit(kurs)}`, warte: 'main h2' },
      { name: `${ui} Fortschritt`, pfad: `/lern-app/${ui}/fortschritt`, warte: 'main h1' },
      { name: `${ui} Wortschatz`, pfad: `/lern-app/${ui}/wortschatz`, warte: 'main h1' },
      { name: `${ui} Einstellungen`, pfad: `/lern-app/${ui}/einstellungen`, warte: 'main form' },
      { name: `${ui} Quellen`, pfad: `/lern-app/${ui}/quellen`, warte: 'main h1' },
      { name: `${ui} Gruppe (ohne Anmeldung)`, pfad: `/lern-app/${ui}/gruppe`, warte: 'main h1' },
      { name: `${ui} Anmelden`, pfad: `/lern-app/${ui}/anmelden`, warte: 'main form' },
      { name: `${ui} Wissenskurs`, pfad: `/lern-app/${ui}/islam`, warte: 'main h1' },
      ...(ui === 'ar' ? [] : [{ name: `${ui} Koran-Arabisch`, pfad: `/lern-app/${ui}/koran`, warte: 'main h1' }]),
      { name: `${ui} Nicht gefunden (absichtlich)`, pfad: `/lern-app/${ui}/gibt-es-nicht`, warte: 'main h1', fehlerseite: true },
    );
  }
  r.push(
    { name: 'Website de /lernen', pfad: '/lernen', warte: 'main h1' },
    { name: 'Website tr /ogren', pfad: '/tr/ogren', warte: 'main h1' },
    { name: 'Website en /learn', pfad: '/en/learn', warte: 'main h1' },
  );
  if (konto.lehrkraft && konto.gruppe)
    for (const [l, p] of [
      ['de', `/mein-bereich/unterricht/${konto.gruppe}/lern-app`],
      ['tr', `/tr/hesabim/derslerim/${konto.gruppe}/ogrenme-uygulamasi`],
      ['en', `/en/my-account/teaching/${konto.gruppe}/learning-app`],
    ])
      r.push({ name: `Mein Bereich ${l} Lehrkraft › Lern-App`, pfad: p, warte: 'main h1', zustand: konto.lehrkraft });
  if (konto.kind)
    for (const [l, p] of [
      ['de', '/mein-bereich'],
      ['tr', '/tr/hesabim'],
      ['en', '/en/my-account'],
    ])
      r.push({ name: `Mein Bereich ${l} Schüler-Start (Kind)`, pfad: p, warte: 'main h1', zustand: konto.kind });
  if (konto.eltern && konto.kindId)
    for (const [l, p] of [
      ['de', `/mein-bereich/kinder/${konto.kindId}`],
      ['tr', `/tr/hesabim/cocuklarim/${konto.kindId}`],
      ['en', `/en/my-account/children/${konto.kindId}`],
    ])
      r.push({ name: `Mein Bereich ${l} Lernwoche des Kindes (Eltern)`, pfad: p, warte: 'main h1', zustand: konto.eltern });
  return r;
}
