// Beispielinhalte aus dem Bestand (ADR 0015), maschinell erzeugt mit _lauf/werkzeuge/erzeuge-seed-daten.py.
// Jeder Eintrag trägt seine Fundstelle; Personennamen sind durch Platzhalter ersetzt. Nicht von Hand ändern.
import type { SeedVeranstaltung } from '../typen';

export const BEISPIEL_VERANSTALTUNGEN: SeedVeranstaltung[] = [
  {
    slug: 'woechentlicher-qur-an-kurs',
    titel: {
      de: "Wöchentlicher Qur'an Kurs",
    },
    kurztext: {
      de: "Lernen Sie die richtige Rezitation und Bedeutung des Qur'an in unserem wöchentlichen Kurs.",
    },
    kategorie: 'bildung',
    organisation: 'at',
    zielgruppe: {
      de: 'Offen für alle',
    },
    ort: {
      de: 'Hauptsaal',
    },
    beginn: '2026-10-10T14:00',
    ende: '2026-10-10T16:00',
    wiederholung: 'FREQ=WEEKLY;BYDAY=SA',
    empfohlen: true,
    kosten: 'kostenlos',
    quelle: 'bestand/src/app/components/EventsSection.tsx:19-30',
  },
  {
    slug: 'frauenkreis-islamische-erziehung',
    titel: {
      de: 'Frauenkreis - Islamische Erziehung',
    },
    kurztext: {
      de: 'Diskussionsrunde für Mütter über islamische Werte in der Kindererziehung.',
    },
    kategorie: 'bildung',
    organisation: 'kt',
    zielgruppe: {
      de: 'Frauen',
    },
    ort: {
      de: 'Frauenbereich',
    },
    beginn: '2026-10-06T14:00',
    ende: '2026-10-06T16:00',
    wiederholung: 'FREQ=WEEKLY;BYDAY=TU',
    empfohlen: true,
    kosten: 'kostenlos',
    quelle: 'bestand/src/app/components/EventsSection.tsx:31-42',
  },
  {
    slug: 'jugendgruppe-treffen',
    titel: {
      de: 'Jugendgruppe Treffen',
    },
    kurztext: {
      de: 'Diskussionen, Aktivitäten und islamische Bildung für junge Muslime.',
    },
    kategorie: 'jugend',
    organisation: 'gt',
    zielgruppe: {
      de: '14-25 Jahre',
    },
    ort: {
      de: 'Jugendraum',
    },
    beginn: '2026-10-09T19:00',
    ende: '2026-10-09T21:00',
    wiederholung: 'FREQ=WEEKLY;BYDAY=FR',
    empfohlen: false,
    kosten: 'kostenlos',
    quelle: 'bestand/src/app/components/EventsSection.tsx:43-54',
  },
  {
    slug: 'junge-schwestern-kreis',
    titel: {
      de: 'Junge Schwestern Kreis',
    },
    kurztext: {
      de: 'Gemeinschaft und islamische Bildung für junge Frauen und Mädchen.',
    },
    kategorie: 'jugend',
    organisation: 'kgt',
    zielgruppe: {
      de: '12-25 Jahre (weiblich)',
    },
    ort: {
      de: 'Jugend-Frauenbereich',
    },
    beginn: '2026-10-10T16:00',
    ende: '2026-10-10T18:00',
    wiederholung: 'FREQ=WEEKLY;BYDAY=SA',
    empfohlen: false,
    kosten: 'kostenlos',
    quelle: 'bestand/src/app/components/EventsSection.tsx:55-66',
  },
  {
    slug: 'islamisches-familienfest',
    titel: {
      de: 'Islamisches Familienfest',
    },
    kurztext: {
      de: 'Ein besonderer Tag für Familien mit Aktivitäten, Essen und Gemeinschaft.',
    },
    kategorie: 'gemeinde',
    organisation: 'at',
    zielgruppe: {
      de: 'Familien',
    },
    ort: {
      de: 'Gemeinschaftsbereich',
    },
    beginn: '2025-07-28T11:00',
    ende: '2025-07-28T17:00',
    wiederholung: null,
    empfohlen: true,
    kosten: 'kostenlos',
    quelle: 'bestand/src/app/components/EventsSection.tsx:67-78',
  },
  {
    slug: 'arabisch-sprachkurs',
    titel: {
      de: 'Arabisch Sprachkurs',
    },
    kurztext: {
      de: 'Grundlagen der arabischen Sprache für Anfänger und Fortgeschrittene.',
    },
    kategorie: 'bildung',
    organisation: 'at',
    zielgruppe: {
      de: 'Alle Altersgruppen',
    },
    ort: {
      de: 'Klassenzimmer 1',
    },
    beginn: '2026-10-08T18:30',
    ende: '2026-10-08T20:00',
    wiederholung: 'FREQ=WEEKLY;BYDAY=TH',
    empfohlen: false,
    kosten: 'kostenlos',
    quelle: 'bestand/src/app/components/EventsSection.tsx:79-90',
  },
  {
    slug: 'freitagsgebet-mit-khutba',
    titel: {
      de: 'Freitagsgebet mit Khutba',
      tr: 'Cuma Namazı ve Hutbe',
      en: 'Friday Prayer with Khutbah',
    },
    kurztext: {
      de: 'Wöchentliches Freitagsgebet mit anschließender Khutba',
      tr: 'Haftalık Cuma namazı ve hutbe',
      en: 'Weekly Friday prayer with sermon',
    },
    kategorie: 'gebet',
    organisation: null,
    teilnehmerHinweis: {
      de: '200+ Teilnehmer',
      tr: '200+ katılımcı',
      en: '200+ participants',
    },
    ort: {
      de: 'Hauptgebetsraum',
    },
    beginn: '2024-03-15T13:00',
    ende: null,
    wiederholung: null,
    empfohlen: true,
    kosten: 'kostenlos',
    quelle: 'bestand/src/app/components/Events.tsx:161-174',
  },
  {
    slug: 'korankurs-fuer-kinder',
    titel: {
      de: 'Korankurs für Kinder',
      tr: 'Çocuklar için Kuran Kursu',
      en: 'Quran Course for Children',
    },
    kurztext: {
      de: 'Wöchentlicher Korankurs für Kinder im Alter von 6-12 Jahren',
      tr: '6-12 yaş arası çocuklar için haftalık Kuran kursu',
      en: 'Weekly Quran course for children aged 6-12',
    },
    kategorie: 'bildung',
    organisation: null,
    teilnehmerHinweis: {
      de: '25 Teilnehmer',
      tr: '25 katılımcı',
      en: '25 participants',
    },
    ort: {
      de: 'Bildungsraum 1',
    },
    beginn: '2024-03-16T16:00',
    ende: null,
    wiederholung: null,
    empfohlen: false,
    kosten: 'kostenlos',
    quelle: 'bestand/src/app/components/Events.tsx:175-188',
  },
  {
    slug: 'gemeindeversammlung',
    titel: {
      de: 'Gemeindeversammlung',
      tr: 'Cemaat Toplantısı',
      en: 'Community Meeting',
    },
    kurztext: {
      de: 'Monatliche Versammlung zur Besprechung aktueller Themen',
      tr: 'Güncel konuları görüşmek için aylık toplantı',
      en: 'Monthly meeting to discuss current issues',
    },
    kategorie: 'gemeinde',
    organisation: null,
    teilnehmerHinweis: {
      de: '50 Teilnehmer',
      tr: '50 katılımcı',
      en: '50 participants',
    },
    ort: {
      de: 'Konferenzraum',
    },
    beginn: '2024-03-20T19:00',
    ende: null,
    wiederholung: null,
    empfohlen: true,
    kosten: 'kostenlos',
    quelle: 'bestand/src/app/components/Events.tsx:189-202',
  },
  {
    slug: 'tuerkischer-kulturabend',
    titel: {
      de: 'Türkischer Kulturabend',
      tr: 'Türk Kültür Gecesi',
      en: 'Turkish Cultural Evening',
    },
    kurztext: {
      de: 'Abend mit türkischer Musik, Tanz und traditionellem Essen',
      tr: 'Türk müziği, dans ve geleneksel yemeklerle kültür gecesi',
      en: 'Evening with Turkish music, dance and traditional food',
    },
    kategorie: 'kultur',
    organisation: null,
    teilnehmerHinweis: {
      de: '150 Teilnehmer',
      tr: '150 katılımcı',
      en: '150 participants',
    },
    ort: {
      de: 'Mehrzweckhalle',
    },
    beginn: '2024-03-25T18:00',
    ende: null,
    wiederholung: null,
    empfohlen: false,
    kosten: 'kostenpflichtig',
    quelle: 'bestand/src/app/components/Events.tsx:203-216',
  },
  {
    slug: 'jugendtreffen',
    titel: {
      de: 'Jugendtreffen',
      tr: 'Gençlik Buluşması',
      en: 'Youth Meeting',
    },
    kurztext: {
      de: 'Wöchentliches Treffen der Jugendgruppe mit Diskussionen und Aktivitäten',
      tr: 'Gençlik grubunun tartışma ve etkinliklerle haftalık buluşması',
      en: 'Weekly youth group meeting with discussions and activities',
    },
    kategorie: 'jugend',
    organisation: null,
    teilnehmerHinweis: {
      de: '30 Teilnehmer',
      tr: '30 katılımcı',
      en: '30 participants',
    },
    ort: {
      de: 'Jugendraum',
    },
    beginn: '2024-03-17T15:00',
    ende: null,
    wiederholung: null,
    empfohlen: false,
    kosten: 'kostenlos',
    quelle: 'bestand/src/app/components/Events.tsx:217-230',
  },
  {
    slug: 'frauen-kochkurs',
    titel: {
      de: 'Frauen-Kochkurs',
      tr: 'Kadınlar Yemek Kursu',
      en: "Women's Cooking Course",
    },
    kurztext: {
      de: 'Monatlicher Kochkurs für Frauen mit traditionellen Rezepten',
      tr: 'Geleneksel tariflerle kadınlar için aylık yemek kursu',
      en: 'Monthly cooking course for women with traditional recipes',
    },
    kategorie: 'frauen',
    organisation: null,
    teilnehmerHinweis: {
      de: '20 Teilnehmer',
      tr: '20 katılımcı',
      en: '20 participants',
    },
    ort: {
      de: 'Küche',
    },
    beginn: '2024-03-22T14:00',
    ende: null,
    wiederholung: null,
    empfohlen: false,
    kosten: 'kostenlos',
    quelle: 'bestand/src/app/components/Events.tsx:231-244',
  },
];
