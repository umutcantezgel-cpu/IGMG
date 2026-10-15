'use client';

import { useSyncExternalStore } from 'react';

/**
 * Gewünschter Kurs der Voranmeldung (F-44): Die Formularseite ist statisch (K-01) – den Kurs aus der Adresse
 * (`?kurs=<slug>`, Link „Für diesen Kurs voranmelden“) liest erst der Browser. Nach dem ersten Schritt rendert der Server
 * jeden Schritt mit den Werten; dann kommt der Kurs als `wert`. Erlaubt sind nur Kurse aus `kurse` (vom Server, nur mit
 * Anmeldeweg „Voranmeldung“); alles andere zeigt nichts und sendet nichts. Der Server prüft beim Absenden erneut.
 * Kein next-intl im Browser: Satzvorlage und Titel kommen fertig vom Server.
 */
function ausAdresse(): string {
  return new URLSearchParams(window.location.search).get('kurs') ?? '';
}
const ohneAbo = () => () => undefined;

export function KursWahl({
  kurse,
  vorlage,
  wert,
}: {
  /** Erlaubte Kurse: Kennung → Titel in der Seitensprache (`lang` nur beim deutschen Rückfall) */
  kurse: Record<string, { titel: string; lang?: string }>;
  /** „Voranmeldung für den Kurs: {titel}“ */
  vorlage: string;
  /** Kurs aus dem vorigen Schritt (Server); fehlt er, zählt die Adresse */
  wert?: string;
}) {
  const adresse = useSyncExternalStore(ohneAbo, ausAdresse, () => '');
  const slug = wert ?? adresse;
  const kurs = Object.hasOwn(kurse, slug) ? kurse[slug] : null;
  if (!kurs) return null;
  const [vor, nach = ''] = vorlage.split('{titel}');
  return (
    <>
      <input type="hidden" name="kurs" value={slug} />
      <p className="rounded-md border-l-4 border-gruen-700 bg-gruen-50 px-4 py-3 font-bold text-pretty text-gruen-800">
        {vor}
        <span lang={kurs.lang}>{kurs.titel}</span>
        {nach}
      </p>
    </>
  );
}
