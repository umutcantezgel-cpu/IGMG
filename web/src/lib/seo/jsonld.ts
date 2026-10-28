/**
 * Strukturierte Daten nach schema.org (JSON-LD, K-16) als reine Funktionen: Sie bauen Objekte, ausgegeben werden sie
 * von `components/website/JsonLd.tsx`. Absolute Adressen (Website, Detailseiten, Bilder) setzen die Aufrufer mit
 * `basisUrl()` und `adresse()` aus `metadaten.ts`; diese Datei kennt weder Konfiguration noch Datenbank.
 *
 * Grundsatz G-05: Platzhalter in eckigen Klammern und leere Werte fallen weg. Nichts wird ergänzt, was die Gemeinde
 * nicht gepflegt hat. Die Gemeinde als Entität (ADR 0049): ein `@graph` aus Organisation „IGMG Wetzlar“, Moschee
 * „Fatih-Moschee Wetzlar“ und Website mit festen `@id` je Knoten; Namen und Fakten aus `entitaet.ts` und
 * `meta.moscheeName` (messages direkt wie in `og-bild.tsx`, damit die Funktionen rein bleiben).
 */
import de from '../../../messages/de.json';
import en from '../../../messages/en.json';
import tr from '../../../messages/tr.json';
import type { Locale } from '@/i18n/routing';
import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { waehle } from '@/lib/i18n/inhalt';
import { kontaktInhalt } from '@/lib/validierung/seiteninhalte';
import { ENTITAET } from './entitaet';

export const KONTEXT = 'https://schema.org';

/** Name der Organisation in strukturierten Daten (Eigenname, nicht übersetzt). */
export const ORGANISATION = ENTITAET.kurzname;

/** Ein JSON-LD-Objekt mit schema.org-Kontext und Typ. */
export type JsonLdObjekt = { '@context': typeof KONTEXT; '@type': string } & Record<string, unknown>;

/** Ein Knoten im `@graph` (ohne eigenen Kontext). */
export type JsonLdKnoten = { '@type': string; '@id'?: string } & Record<string, unknown>;

/** Mehrere Knoten unter einem Kontext, die sich über `@id` aufeinander beziehen. */
export type JsonLdGraph = { '@context': typeof KONTEXT; '@graph': JsonLdKnoten[] };

/** Was `components/website/JsonLd.tsx` ausgibt: ein Objekt oder ein Graph. */
export type JsonLdDaten = JsonLdObjekt | JsonLdGraph;

/** Gepflegter Text: getrimmt. Leer oder mit Platzhalter in eckigen Klammern → undefined. */
export function gepflegt(wert: string | null | undefined): string | undefined {
  const text = wert?.trim();
  return text && !/[[\]]/.test(text) ? text : undefined;
}

/** Gepflegter https-Link (Profile für sameAs); andere Adressen fallen weg. */
function httpsLink(wert: string | null | undefined): string | undefined {
  const text = gepflegt(wert);
  if (!text) return undefined;
  try {
    return new URL(text).protocol === 'https:' ? text : undefined;
  } catch {
    return undefined;
  }
}

const BERLIN = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Berlin',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
  timeZoneName: 'longOffset',
});

/** Zeitpunkt als ISO 8601 mit Berliner Versatz, z. B. „2026-07-01T12:00:00+02:00“ (Zeiten in Europe/Berlin, K-05). */
export function isoBerlin(zeitpunkt: string): string {
  const teile = Object.fromEntries(BERLIN.formatToParts(new Date(zeitpunkt)).map((t) => [t.type, t.value]));
  const versatz = (teile.timeZoneName ?? 'GMT').replace(/^GMT/, '') || '+00:00';
  return `${teile.year}-${teile.month}-${teile.day}T${teile.hour}:${teile.minute}:${teile.second}${versatz}`;
}

/** Postanschrift aus dem gepflegten Freitext (Straße, Postleitzahl und Ort stehen in einem Feld). */
function postanschrift(adresse: string) {
  return { '@type': 'PostalAddress', streetAddress: adresse };
}

/** Kontaktangaben aus dem Seiteninhalt „kontakt“ (gleiche Feldnamen, dazu `istBeispiel` aus `ladeSeiteninhalt`). */
export type KontaktAngaben = {
  adresse?: string | null;
  telefon?: string | null;
  email?: string | null;
  social?: { facebook?: string; instagram?: string; youtube?: string };
  koordinaten?: { breite: number; laenge: number };
  oeffnungszeiten?: { von: number[]; start: string; ende: string; zeiten?: string }[];
  /** Noch der Beispielinhalt aus dem Seed (nie in der Verwaltung gespeichert): Öffnungszeiten sind dann Beispielwerte (M-019). */
  istBeispiel?: boolean;
};

/** Feste Kennungen der Knoten des Gemeinde-Graphen; Detailseiten können sich darauf beziehen. */
export function knotenId(basis: string, knoten: 'organisation' | 'moschee' | 'website'): string {
  return `${basis.replace(/\/+$/, '')}/#${knoten}`;
}

/**
 * Die E-Mail-Adresse des Schema-Standards ist ein Beispielwert aus dem Code (M-012): sichtbar markiert, aber keine
 * Tatsache für strukturierte Daten, solange niemand eine andere Adresse gepflegt hat.
 */
const BEISPIEL_EMAIL = kontaktInhalt.parse({}).email;

/** Lokalisierte Namen der Moschee (`meta.moscheeName`, E-044: immer mit „Wetzlar“). */
const MOSCHEE_NAME: Record<Locale, string> = { de: de.meta.moscheeName, tr: tr.meta.moscheeName, en: en.meta.moscheeName };

/** Beschreibung der Website je Sprache (`meta.beschreibung`), nur ohne Platzhalter. */
const BESCHREIBUNG: Record<Locale, string | undefined> = {
  de: gepflegt(de.meta.beschreibung),
  tr: gepflegt(tr.meta.beschreibung),
  en: gepflegt(en.meta.beschreibung),
};

const WOCHENTAGE = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

/**
 * Anschrift der Moschee: Ort, Bundesland und Land immer (Entität geografisch verankert, auch vor M-010); Straße und
 * Postleitzahl nur aus einer gepflegten Adresse („Straße Nr., PLZ Ort“, sonst der ganze Text als Straße). Das Feld der
 * Verwaltung ist mehrzeilig: Zeilenumbrüche (mit oder ohne Komma davor) gelten als Komma.
 */
function anschriftWetzlar(adresse: string | undefined) {
  const text = adresse?.replace(/\s*,?\s*\r?\n\s*/g, ', ');
  const teile = text ? /^(.+?),\s*(\d{5})\s+\S.*$/.exec(text) : null;
  return {
    '@type': 'PostalAddress',
    ...(text ? { streetAddress: teile ? teile[1] : text } : {}),
    ...(teile ? { postalCode: teile[2] } : {}),
    addressLocality: ENTITAET.sitz.ort,
    addressRegion: ENTITAET.sitz.bundesland,
    addressCountry: ENTITAET.sitz.land,
  };
}

/**
 * Öffnungszeiten (OpeningHoursSpecification) nur aus in der Verwaltung gespeicherten Kontaktdaten und nur Zeilen mit
 * Wochentagen, Beginn und Ende ohne Platzhalter. Die Seed-Werte widersprechen sich (M-019) und bleiben deshalb draußen.
 */
function oeffnungszeiten(kontakt: KontaktAngaben): JsonLdKnoten[] {
  if (kontakt.istBeispiel !== false) return [];
  return (kontakt.oeffnungszeiten ?? [])
    .filter((z) => z.von.length > 0 && z.start && z.ende && (z.zeiten === undefined || gepflegt(z.zeiten)))
    .map((z) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [...new Set(z.von)].map((tag) => `https://schema.org/${WOCHENTAGE[tag]}`),
      opens: z.start,
      closes: z.ende,
    }));
}

/**
 * Die Gemeinde als Organisation „IGMG Wetzlar“ (Marke, E-044): Gründung, Dachverband (`parentOrganization`, Anschrift
 * laut Impressum von igmg.org), Regionalverband (`memberOf`, nur der Name), Ort, Moschee als `location`. Telefon und
 * E-Mail nur gepflegt und nicht der Beispielwert; `sameAs` nur die eigenen https-Profile.
 */
export function organisationKnoten({ basis, kontakt }: { basis: string; kontakt: KontaktAngaben }): JsonLdKnoten {
  const telefon = gepflegt(kontakt.telefon);
  const email = gepflegt(kontakt.email);
  const profile = [kontakt.social?.facebook, kontakt.social?.instagram, kontakt.social?.youtube].flatMap((l) => httpsLink(l) ?? []);
  const { dachverband } = ENTITAET;
  return {
    '@type': 'Organization',
    '@id': knotenId(basis, 'organisation'),
    name: ORGANISATION,
    alternateName: [...ENTITAET.alternateName],
    url: `${basis.replace(/\/+$/, '')}/`,
    foundingDate: ENTITAET.gruendung,
    location: { '@id': knotenId(basis, 'moschee') },
    areaServed: { '@type': 'City', name: ENTITAET.sitz.ort },
    parentOrganization: {
      '@type': 'Organization',
      name: dachverband.name,
      alternateName: dachverband.alternateName,
      url: dachverband.url,
      address: {
        '@type': 'PostalAddress',
        streetAddress: dachverband.adresse.strasse,
        postalCode: dachverband.adresse.plz,
        addressLocality: dachverband.adresse.ort,
        addressCountry: dachverband.adresse.land,
      },
    },
    memberOf: { '@type': 'Organization', name: ENTITAET.regionalverband.name },
    ...(telefon ? { telephone: telefon } : {}),
    ...(email && email !== BEISPIEL_EMAIL ? { email } : {}),
    ...(profile.length ? { sameAs: profile } : {}),
  };
}

/**
 * Die Moschee (schema.org Mosque, ein Ort): Name in der Sprache der Seite, die übrigen Sprachfassungen als
 * `alternateName`, Anschrift in Wetzlar, Koordinaten (erst nach Bestätigung gepflegt, M-010) und Öffnungszeiten.
 */
export function moscheeKnoten({ basis, kontakt, sprache }: { basis: string; kontakt: KontaktAngaben; sprache: Locale }): JsonLdKnoten {
  const geo = kontakt.koordinaten;
  const zeiten = oeffnungszeiten(kontakt);
  return {
    '@type': 'Mosque',
    '@id': knotenId(basis, 'moschee'),
    name: MOSCHEE_NAME[sprache],
    alternateName: Object.values(MOSCHEE_NAME).filter((n) => n !== MOSCHEE_NAME[sprache]),
    url: `${basis.replace(/\/+$/, '')}/`,
    address: anschriftWetzlar(gepflegt(kontakt.adresse)),
    ...(geo ? { geo: { '@type': 'GeoCoordinates', latitude: geo.breite, longitude: geo.laenge } } : {}),
    ...(zeiten.length ? { openingHoursSpecification: zeiten } : {}),
  };
}

/** Die Website (schema.org WebSite) in drei Sprachen; Herausgeber ist die Organisation. */
export function webseiteKnoten({ basis, sprache }: { basis: string; sprache: Locale }): JsonLdKnoten {
  const beschreibung = BESCHREIBUNG[sprache];
  return {
    '@type': 'WebSite',
    '@id': knotenId(basis, 'website'),
    url: `${basis.replace(/\/+$/, '')}/`,
    name: ORGANISATION,
    ...(beschreibung ? { description: beschreibung } : {}),
    inLanguage: ['de', 'tr', 'en'],
    publisher: { '@id': knotenId(basis, 'organisation') },
  };
}

/**
 * Gemeinde-Graph (K-16, ADR 0049) für Startseite, Kontakt, Über uns und IGMG: Organisation, Moschee und Website mit
 * gegenseitigen `@id`-Verweisen. `basis` = `basisUrl()`, `kontakt` = Seiteninhalt „kontakt“, `sprache` = Seitensprache.
 */
export function gemeindeGraph({ basis, kontakt, sprache }: { basis: string; kontakt: KontaktAngaben; sprache: Locale }): JsonLdGraph {
  return {
    '@context': KONTEXT,
    '@graph': [organisationKnoten({ basis, kontakt }), moscheeKnoten({ basis, kontakt, sprache }), webseiteKnoten({ basis, sprache })],
  };
}

/** Eine Frage mit Antwort wie im Baustein „faq“ (Deutsch Pflicht); `sichtbar: false` steht nicht auf der Seite. */
export type FaqEintrag = { frage: Mehrsprachig; antwort: Mehrsprachig; sichtbar?: boolean };

/** Höchstzahl der Fragen in einer FAQPage (ADR 0049: kurze, belegte Antworten statt langer Listen). */
export const FAQ_MAX = 10;

/**
 * Fragen und Antworten einer Seite (schema.org FAQPage) – nur, was die Seite sichtbar zeigt: keine ausgeblendeten
 * Einträge, keine Platzhalter, höchstens `FAQ_MAX`. Text in der Seitensprache mit sichtbarem Rückfall auf Deutsch
 * (dann `inLanguage: 'de'` an der Frage). Ohne verwertbaren Eintrag `null` – die Seite gibt dann nichts aus.
 * Keine Antworten zum religiösen Recht ohne Freigabe (ADR 0030 Nr. 4); das entscheiden die Aufrufer mit der Auswahl.
 */
export function faqSeite(eintraege: readonly FaqEintrag[], sprache: Locale): JsonLdObjekt | null {
  const fragen = eintraege
    .filter((e) => e.sichtbar !== false)
    .flatMap((e) => {
      const frage = waehle(e.frage, sprache);
      const antwort = waehle(e.antwort, sprache);
      const [f, a] = [gepflegt(frage.text), gepflegt(antwort.text)];
      if (!f || !a) return [];
      const rueckfall = frage.sprache !== sprache || antwort.sprache !== sprache;
      return [
        {
          '@type': 'Question',
          name: f,
          acceptedAnswer: { '@type': 'Answer', text: a },
          ...(rueckfall ? { inLanguage: 'de' } : {}),
        },
      ];
    })
    .slice(0, FAQ_MAX);
  return fragen.length ? { '@context': KONTEXT, '@type': 'FAQPage', inLanguage: sprache, mainEntity: fragen } : null;
}

export type VeranstaltungAngaben = {
  /** Absolute Adresse der Detailseite. */
  url: string;
  name: string;
  beschreibung?: string | null;
  /** Absolute Adresse des Titelbildes. */
  bild?: string | null;
  /** Beginn des angezeigten (nächsten) Termins, ISO. */
  beginn: string;
  ende?: string | null;
  /** Name des Ortes (Feld „Ort“). */
  ort?: string | null;
  /** Anschrift aus den Kontaktdaten. */
  adresse?: string | null;
  vergangen: boolean;
  /** Veranstaltende Organisation. */
  veranstalter: string;
};

/**
 * Veranstaltung (schema.org Event). Ohne gepflegten Ort und ohne Anschrift entfällt `location`. Ein Status steht nur bei
 * kommenden Terminen: Das Datenmodell kennt keine Absage, vergangene Termine bekommen deshalb keinen Status.
 */
export function veranstaltung(a: VeranstaltungAngaben): JsonLdObjekt {
  const beschreibung = gepflegt(a.beschreibung);
  const ort = gepflegt(a.ort);
  const adresse = gepflegt(a.adresse);
  return {
    '@context': KONTEXT,
    '@type': 'Event',
    name: a.name,
    url: a.url,
    startDate: isoBerlin(a.beginn),
    ...(a.ende ? { endDate: isoBerlin(a.ende) } : {}),
    ...(beschreibung ? { description: beschreibung } : {}),
    ...(a.bild ? { image: a.bild } : {}),
    ...(ort || adresse
      ? { location: { '@type': 'Place', ...(ort ? { name: ort } : {}), ...(adresse ? { address: postanschrift(adresse) } : {}) } }
      : {}),
    ...(a.vergangen ? {} : { eventStatus: 'https://schema.org/EventScheduled' }),
    organizer: { '@type': 'Organization', name: a.veranstalter },
  };
}

export type NachrichtAngaben = {
  /** Absolute Adresse der Nachricht. */
  url: string;
  headline: string;
  beschreibung?: string | null;
  datePublished: string;
  /** Änderungsdatum, sofern gepflegt. */
  dateModified?: string | null;
  /** Absolute Adresse des Titelbildes. */
  bild?: string | null;
  /** Absolute Adresse des Logos des Herausgebers. */
  logo: string;
  /** Sprache des ausgegebenen Textes (bei Rückfall Deutsch). */
  sprache: string;
};

/** Neuigkeit (schema.org NewsArticle), Herausgeber ist die Gemeinde. */
export function nachricht(a: NachrichtAngaben): JsonLdObjekt {
  const beschreibung = gepflegt(a.beschreibung);
  return {
    '@context': KONTEXT,
    '@type': 'NewsArticle',
    headline: a.headline,
    url: a.url,
    datePublished: isoBerlin(a.datePublished),
    ...(a.dateModified ? { dateModified: isoBerlin(a.dateModified) } : {}),
    ...(beschreibung ? { description: beschreibung } : {}),
    ...(a.bild ? { image: a.bild } : {}),
    inLanguage: a.sprache,
    publisher: { '@type': 'Organization', name: ORGANISATION, logo: { '@type': 'ImageObject', url: a.logo } },
  };
}

/**
 * Brotkrumen (schema.org BreadcrumbList). Der letzte Eintrag ist die aktuelle Seite und braucht keine Adresse.
 * Eine Zwischenstufe ohne Adresse gehört nicht in die Liste; die Aufrufer lassen sie weg.
 */
export function brotkrumen(eintraege: { name: string; url?: string }[]): JsonLdObjekt {
  return {
    '@context': KONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: eintraege.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: e.name,
      ...(e.url ? { item: e.url } : {}),
    })),
  };
}
