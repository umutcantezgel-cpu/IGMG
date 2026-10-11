/**
 * Alle Cache-Tags (ADR 0004). Keine Freitext-Tags im Code – nur diese Funktionen.
 * Server Actions der Verwaltung rufen `updateTag(...)` mit genau diesen Werten auf.
 */
export const TAG = {
  veranstaltungen: 'veranstaltungen',
  veranstaltung: (id: string) => `veranstaltung:${id}`,
  /** Anmeldezahlen (Platzzählung) – alle bzw. je Veranstaltung */
  anmeldungen: 'anmeldungen',
  anmeldungenVon: (id: string) => `anmeldungen:${id}`,
  nachrichten: 'nachrichten',
  nachricht: (id: string) => `nachricht:${id}`,
  ankuendigungen: 'ankuendigungen',
  kurse: 'kurse',
  wissen: 'wissen',
  seiteninhalt: (bereich: string) => `seiteninhalt:${bereich}`,
  gebetszeiten: 'gebetszeiten',
  gebetszeitenMonat: (jahrMonat: string) => `gebetszeiten:${jahrMonat}`,
  medien: 'medien',
  einstellungen: 'einstellungen',
  quran: 'quran',
} as const;

/** Tags, die beim Start verfallen (ADR 0017) – alle inhaltsbezogenen Listen-Tags. */
export const START_TAGS = [
  TAG.veranstaltungen,
  TAG.anmeldungen,
  TAG.nachrichten,
  TAG.ankuendigungen,
  TAG.kurse,
  TAG.wissen,
  TAG.gebetszeiten,
  TAG.medien,
  TAG.einstellungen,
  TAG.quran,
  'seiteninhalt',
] as const;
