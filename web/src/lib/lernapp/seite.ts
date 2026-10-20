import 'server-only';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ui } from 'next/root-params';
import { funktionAn } from '@/lib/funktionen';
import { lernAdresse } from './adressen';
import { istKursSlug, kursInOberflaeche, OBERFLAECHEN, type KursSlug, type Oberflaeche } from './kurse';

/**
 * Bausteine der Lern-App-Seiten auf dem Server (ADR 0037 Nr. 2/4). Seiten sind statisch: Sie lesen weder Cookies noch
 * Kopfzeilen, nur den Root-Parameter `[ui]` (next/root-params) und die gecachte Einstellung der Funktionsschalter.
 */

/** Oberflächensprache der Seite; Unbekanntes ergibt 404 (Absicherung zur Parameter-Zuordnung im Layout). */
export async function oberflaeche(): Promise<Oberflaeche> {
  const wert = await ui();
  if (!wert || !(OBERFLAECHEN as readonly string[]).includes(wert)) notFound();
  return wert as Oberflaeche;
}

/**
 * Funktionsschalter `lernapp` (ADR 0035, KERN 4.0 §6): aus heißt 404. Sicher aus (Umgebung) beantwortet schon der Proxy
 * mit 404; aus über Einstellung oder Standard der Produktion rendert die Seite „nicht gefunden“ (gecachte Einstellung,
 * Tag `einstellungen` – ein Umschalten im Cockpit erneuert die Seiten).
 */
export async function verlangeLernApp(): Promise<void> {
  if (!(await funktionAn('lernapp'))) notFound();
}

/** Kurs der Adresse prüfen: bekannter Kurs, in dieser Oberfläche erreichbar (Koran-Arabisch nicht in `ar`). */
export function kursOder404(kurs: string, sprache: Oberflaeche): KursSlug {
  if (!istKursSlug(kurs) || !kursInOberflaeche(kurs, sprache)) notFound();
  return kurs;
}

/**
 * Metadaten einer Lern-App-Seite: Titel, Beschreibung, kanonische Adresse und Sprachfassungen (hreflang) der drei
 * Oberflächen – ohne die Sprachen, in denen es die Seite nicht gibt (Koran-Arabisch in `ar`). Hüllen ohne eigenen Inhalt
 * (Übung, Wiederholung, Einstellungen …) werden nicht indexiert.
 */
export function lernMetadaten({
  ui: sprache,
  pfad,
  titel,
  beschreibung,
  index = true,
}: {
  ui: Oberflaeche;
  /** Rest nach `/lern-app/<ui>`, z. B. `''`, `'einstellungen'`, `'tr-aus-de/ueben'` */
  pfad: string;
  titel?: string;
  beschreibung?: string;
  index?: boolean;
}): Metadata {
  const kurs = pfad.split('/')[0];
  const sprachen = OBERFLAECHEN.filter((s) => !istKursSlug(kurs) || kursInOberflaeche(kurs, s));
  return {
    ...(titel ? { title: titel } : {}),
    ...(beschreibung ? { description: beschreibung } : {}),
    alternates: {
      canonical: lernAdresse(sprache, pfad),
      languages: {
        ...Object.fromEntries(sprachen.map((s) => [s, lernAdresse(s, pfad)])),
        'x-default': lernAdresse('de', pfad),
      },
    },
    ...(index ? {} : { robots: { index: false, follow: true } }),
  };
}
