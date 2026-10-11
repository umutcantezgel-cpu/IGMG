/**
 * Strukturierte Daten nach schema.org (JSON-LD, K-16) als reine Funktionen: Sie bauen Objekte, ausgegeben werden sie
 * von `components/website/JsonLd.tsx`. Absolute Adressen (Website, Detailseiten, Bilder) setzen die Aufrufer mit
 * `basisUrl()` und `adresse()` aus `metadaten.ts`; diese Datei kennt weder Konfiguration noch Datenbank.
 *
 * Grundsatz G-05: Platzhalter in eckigen Klammern und leere Werte fallen weg. Nichts wird ergänzt, was die Gemeinde
 * nicht gepflegt hat.
 */

export const KONTEXT = 'https://schema.org';

/** Name der Organisation in strukturierten Daten (Eigenname, nicht übersetzt). */
export const ORGANISATION = 'IGMG Wetzlar';

/** Ein JSON-LD-Objekt mit schema.org-Kontext und Typ. */
export type JsonLdObjekt = { '@context': typeof KONTEXT; '@type': string } & Record<string, unknown>;

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

/** Kontaktangaben aus dem Seiteninhalt „kontakt“ (gleiche Feldnamen). */
export type KontaktAngaben = {
  adresse?: string | null;
  telefon?: string | null;
  email?: string | null;
  social?: { facebook?: string; instagram?: string; youtube?: string };
  koordinaten?: { breite: number; laenge: number };
};

/**
 * Die Moschee (schema.org Mosque). Zugleich die Organisationsangaben der Website: Name, Adresse, Telefon, E-Mail,
 * Koordinaten und die gepflegten Profile (sameAs, nur https).
 */
export function moschee({ url, kontakt }: { url: string; kontakt: KontaktAngaben }): JsonLdObjekt {
  const adresse = gepflegt(kontakt.adresse);
  const telefon = gepflegt(kontakt.telefon);
  const email = gepflegt(kontakt.email);
  const profile = [kontakt.social?.facebook, kontakt.social?.instagram, kontakt.social?.youtube].flatMap((l) => httpsLink(l) ?? []);
  const geo = kontakt.koordinaten;
  return {
    '@context': KONTEXT,
    '@type': 'Mosque',
    name: ORGANISATION,
    url,
    ...(adresse ? { address: postanschrift(adresse) } : {}),
    ...(telefon ? { telephone: telefon } : {}),
    ...(email ? { email } : {}),
    ...(geo ? { geo: { '@type': 'GeoCoordinates', latitude: geo.breite, longitude: geo.laenge } } : {}),
    ...(profile.length ? { sameAs: profile } : {}),
  };
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
