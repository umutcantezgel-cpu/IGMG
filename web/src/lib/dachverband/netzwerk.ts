import type { Locale } from '@/i18n/routing';

/**
 * IGMG-Netzwerk (Plan Marktstart, E-044): stabile Ziele beim Dachverband, bei IGMG Reisen und bei den Fachvereinen, auf
 * die die Website verlinkt. Nur Links – keine Bilder, keine Einbettungen, keine Anfragen beim Seitenaufruf (K-14).
 * Belegt: jede Adresse live geprüft bzw. im Crawl vom 13.10.2026 mit Status 200. Titel und Kurzbeschreibungen stehen in
 * `messages/bereiche/dachverband.json` unter `dachverband.ziele.<schluessel>`; gerendert von `Verweisliste`.
 * Nicht aufgenommen (Menschen-Punkt): tip.igmg.org, der YouTube-Kanal und App-Store-Links.
 */

/** Stand des Verzeichnisses (JJJJ-MM-TT); jährliche Linkpflege. */
export const NETZWERK_STAND = '2026-10-27';

/** Adresse je Sprache: Deutsch Pflicht; fehlt Türkisch oder Englisch, gilt die deutsche Adresse (Rückfall). */
export type NetzwerkAdressen = { de: string; tr?: string; en?: string };

export type NetzwerkZiel = {
  url: NetzwerkAdressen;
  /** Sprache, in der Besucherinnen und Besucher der jeweiligen Seitensprache das Ziel lesen (nach dem Rückfall). */
  zielSprache: Record<Locale, Locale>;
};

/** Eigene Fassungen je Sprache; fehlende Sprachen landen auf der deutschen Seite. */
const fassungen = (url: NetzwerkAdressen): NetzwerkZiel => ({
  url,
  zielSprache: { de: 'de', tr: url.tr ? 'tr' : 'de', en: url.en ? 'en' : 'de' },
});
/** Seite nur auf Deutsch. */
const deutsch = (de: string): NetzwerkZiel => fassungen({ de });
/** Seite nur auf Türkisch (Zeitschriften, Kinderclub): alle Sprachen landen dort. */
const tuerkisch = (de: string): NetzwerkZiel => ({ url: { de }, zielSprache: { de: 'tr', tr: 'tr', en: 'tr' } });
/** Eine Adresse mit Material in allen drei Sprachen (Download-Seiten der Begleiter). */
const dreisprachig = (de: string): NetzwerkZiel => ({ url: { de }, zielSprache: { de: 'de', tr: 'tr', en: 'en' } });

const IGMG = 'https://www.igmg.org';
const REISEN = 'https://www.igmgreisen.com';

export const NETZWERK = {
  // Dachverband
  igmg: fassungen({ de: `${IGMG}/`, tr: `${IGMG}/tr/`, en: `${IGMG}/en/` }),
  selbstdarstellung: deutsch(`${IGMG}/selbstdarstellung/`),
  struktur: deutsch(`${IGMG}/struktur-fachvereine-und-kooperationen/`),
  grundsaetze: deutsch(`${IGMG}/grundsaetze/`),
  geschichte: deutsch(`${IGMG}/vom-samen-zum-baum-historische-entwicklung-und-grundsaetze-der-igmg/`),
  satzung: deutsch(`${IGMG}/satzung/`),
  mitgliedschaft: deutsch(`${IGMG}/mitgliedschaft/`),
  // Live ist http://igmg.org/kontakt verlinkt; hier die sichere, kanonische Adresse
  kontakt: deutsch(`${IGMG}/kontakt/`),
  // Türkische und englische Predigten stehen auf den Startseiten der Sprachfassungen
  freitagspredigt: fassungen({ de: `${IGMG}/freitagspredigt/`, tr: `${IGMG}/tr/`, en: `${IGMG}/en/` }),
  frauenorganisation: deutsch(`${IGMG}/frauenorganisation/`),
  jugendorganisation: deutsch(`${IGMG}/jugendorganisation/`),
  frauenjugendorganisation: deutsch(`${IGMG}/frauenjugendorganisation/`),
  // Wetzlar = ID 20238 in der Ortsauswahl des Gebetskalenders (einziger Eintrag mit Abfrage)
  gebetskalender: fassungen({
    de: `${IGMG}/gebetskalender?stadt=Wetzlar&id=20238`,
    tr: `${IGMG}/tr/gebetskalender?stadt=Wetzlar&id=20238`,
  }),
  ramazanYoldasim: dreisprachig(`${IGMG}/ramazan-yoldasim/`),
  umreYoldasim: dreisprachig(`${IGMG}/umre-yoldasim/`),
  islamSchnellErklaert: deutsch(`${IGMG}/islam-schnell-erklaert/`),
  derIslam: deutsch(`${IGMG}/der-islam/`),
  qalam: deutsch(`${IGMG}/qalam/`),
  feste: deutsch(`${IGMG}/islamische-feste-zeiten-des-gedenkens-und-feierns/`),
  gelehrtenratHilal: deutsch(`${IGMG}/beschluss-des-igmg-gelehrtenrates-zur-sichtung-des-neumondes-des-monats-ramadan-20131434/`),
  klimaRatgeber: deutsch(`${IGMG}/ratgeber-fuer-klimafreundliche-moscheen/`),
  // IGMG Reisen (Hadsch und Umra): Deutsch unter /de/, Türkisch ohne Präfix, kein Englisch
  reisen: fassungen({ de: `${REISEN}/de/`, tr: `${REISEN}/` }),
  reisenZweigstellen: fassungen({ de: `${REISEN}/de/zweigstellen/`, tr: `${REISEN}/temsilcilikler/` }),
  reisenDokumente: fassungen({ de: `${REISEN}/de/dokumente/`, tr: `${REISEN}/dosyalar/` }),
  reisenVideos: fassungen({ de: `${REISEN}/de/videos/`, tr: `${REISEN}/videolar/` }),
  reisenHadsch: fassungen({ de: `${REISEN}/de/hadsch/`, tr: `${REISEN}/hac/` }),
  reisenUmra: fassungen({ de: `${REISEN}/de/umra/`, tr: `${REISEN}/umre/` }),
  reisenUmraBedingungen: fassungen({ de: `${REISEN}/de/umra-anmeldebedingungen/`, tr: `${REISEN}/umre-kayit-sartlari/` }),
  reisenWasIstHadsch: fassungen({ de: `${REISEN}/de/was-ist-hadsch/`, tr: `${REISEN}/hac-nedir/` }),
  reisenWasIstUmra: fassungen({ de: `${REISEN}/de/was-ist-umra/`, tr: `${REISEN}/umre-nedir/` }),
  // Fachvereine und Medien
  hasene: deutsch('https://www.hasene.org/de/'),
  zakatRechner: deutsch('https://www.hasene.org/de/zakat-rechner/'),
  ukba: deutsch('https://www.ukba.eu/de/'),
  ehz: deutsch('https://eurohalal.eu'),
  kinderclub: tuerkisch('https://www.igmgcocuk.org'),
  perspektif: tuerkisch('https://perspektif.eu'),
  // Online-Portal der Zeitung Camia (seit 2012, alle zwei Wochen; IGMG-Broschüre Juni 2026, S. 100)
  camiaHaber: tuerkisch('https://camiahaber.com'),
  sabahUlkesi: tuerkisch('https://www.sabahulkesi.com'),
} as const satisfies Record<string, NetzwerkZiel>;

export type NetzwerkSchluessel = keyof typeof NETZWERK;

export const NETZWERK_SCHLUESSEL = Object.keys(NETZWERK) as NetzwerkSchluessel[];

/** Hosts aller Ziele: Positivliste für `igmgUrl` (redaktionelle Links zum Dachverband, `src/lib/validierung/url.ts`). */
export const ERLAUBTE_HOSTS: readonly string[] = [
  ...new Set(Object.values(NETZWERK).flatMap((z: NetzwerkZiel) => Object.values(z.url).map((u) => new URL(u).hostname))),
].sort();

/** Linkziel für eine Seitensprache: Adresse (mit Rückfall auf Deutsch), Sprache des Ziels und ob sie abweicht. */
export function netzwerkZiel(schluessel: NetzwerkSchluessel, sprache: Locale): { href: string; zielSprache: Locale; rueckfall: boolean } {
  const ziel: NetzwerkZiel = NETZWERK[schluessel];
  const zielSprache = ziel.zielSprache[sprache];
  return { href: ziel.url[sprache] ?? ziel.url.de, zielSprache, rueckfall: zielSprache !== sprache };
}

const vergleichbar = (adresse: string): string | null => {
  try {
    return new URL(adresse).href;
  } catch {
    return null;
  }
};

/** Hostname ohne „www.“ (sabahulkesi.com = www.sabahulkesi.com); null bei ungültiger Adresse. */
const hostOhneWww = (adresse: string): string | null => {
  try {
    return new URL(adresse).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
};

/**
 * Hosts, deren ganze Website laut Verzeichnis nur eine andere Sprache als Deutsch hat (`tuerkisch`: alle Seitensprachen
 * landen dort), mit dieser Sprache. Deutsche Ziele zählen nicht: Ohne eigene Adresse gilt beim Aufrufer ohnehin Deutsch,
 * und eine gepflegte türkische oder englische Unterseite (etwa hasene.org/tr/) soll keinen Hinweis „(auf Deutsch)“
 * bekommen. Teilen sich Ziele mit verschiedenen Sprachen einen Host, gilt er nicht als einsprachig.
 */
const EINSPRACHIGE_HOSTS: ReadonlyMap<string, Locale> = (() => {
  const hosts = new Map<string, Locale | null>();
  for (const z of Object.values(NETZWERK) as NetzwerkZiel[]) {
    const sprachen = new Set(Object.values(z.zielSprache));
    const nur = sprachen.size === 1 && !sprachen.has('de') ? z.zielSprache.de : null;
    for (const adresse of Object.values(z.url)) {
      const host = hostOhneWww(adresse);
      if (host) hosts.set(host, hosts.has(host) && hosts.get(host) !== nur ? null : nur);
    }
  }
  return new Map([...hosts].filter((e): e is [string, Locale] => e[1] !== null));
})();

/**
 * Sprache, in der eine gepflegte Adresse auf einer Seite der Sprache `sprache` gelesen wird, wenn sie im Verzeichnis
 * steht – etwa Sabah Ülkesi (nur Türkisch), das auf der Strukturseite nur unter „de“ gespeichert ist. Zuerst wie
 * `netzwerkZiel` für diese Sprache, sonst nach der Sprachfassung, unter der die Adresse steht. Vergleich nach URL-Norm
 * (abschließendes „/“ der Startseite egal). Sonst nach dem Host, wenn die ganze Website nur eine Sprache hat
 * (`EINSPRACHIGE_HOSTS`: auch sabahulkesi.com ohne „www.“ oder eine Unterseite). null: nicht im Verzeichnis, der
 * Aufrufer entscheidet wie bisher.
 */
export function netzwerkZielSprache(href: string, sprache: Locale): Locale | null {
  const gesucht = vergleichbar(href);
  if (!gesucht) return null;
  for (const k of NETZWERK_SCHLUESSEL) {
    const ziel = netzwerkZiel(k, sprache);
    if (vergleichbar(ziel.href) === gesucht) return ziel.zielSprache;
  }
  for (const z of Object.values(NETZWERK) as NetzwerkZiel[])
    for (const [fassung, adresse] of Object.entries(z.url) as [Locale, string][])
      if (vergleichbar(adresse) === gesucht) return z.zielSprache[fassung];
  return EINSPRACHIGE_HOSTS.get(hostOhneWww(gesucht) ?? '') ?? null;
}
