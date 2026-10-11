import { schema } from '../../../src/lib/db';
import type { BereichsSeed } from './typ';

/**
 * Seed „korankurse“ (Welle A, Paket A10, ADR 0015): die drei Korankurse aus design/QuranCourses.dc.html (Z61–63)
 * mit den Sprachfassungen aus bestand/src/app/components/QuranCourses.tsx. Beispielinhalte (istBeispiel), je Zeile
 * mit Quelle. Lehrkräfte sind Platzhalter (G-04). Englische Zeiten im 24-Stunden-Format (E-018).
 * Verfügbarkeit und Hinweise aus dem Bestand (QuranCourses.tsx:50, 66, 82 und Sprachfassungen) seit Tor A in eigenen
 * Feldern; der Hafiz-Kurs ist „geschlossen“ (Bestand: „Kurs bereits gestartet“), Status bitte bestätigen (M-076).
 */
const KURSE: (typeof schema.kurs.$inferInsert)[] = [
  {
    slug: 'korankurs-fuer-kinder',
    status: 'veroeffentlicht',
    istBeispiel: true,
    quelle: 'design/QuranCourses.dc.html:61; bestand/src/app/components/QuranCourses.tsx:38–50 (de), 128–140 (tr), 218–230 (en)',
    titel: { de: 'Korankurs für Kinder', tr: 'Çocuklar için Kuran Kursu', en: 'Quran Course for Children' },
    beschreibung: {
      de: 'Spielerisches Erlernen des Korans für Kinder in altersgerechten Gruppen. Unsere erfahrenen Lehrer führen die Kinder behutsam in die Welt des Korans ein.',
      tr: 'Yaş grubuna uygun gruplarda çocuklar için oyunlu Kuran öğrenimi. Deneyimli hocalarımız çocukları Kuran dünyasına nazikçe yönlendirir.',
      en: 'Playful learning of the Quran for children in age-appropriate groups. Our experienced teachers gently introduce children to the world of the Quran.',
    },
    zielgruppe: { de: 'Kinder (6-16 Jahre)', tr: 'Çocuklar (6-16 yaş)', en: 'Children (6-16 years)' },
    zeiten: {
      de: 'Samstag & Sonntag - 13:00–15:00 Uhr',
      tr: 'Cumartesi & Pazar - 13:00-15:00',
      en: 'Saturday & Sunday - 13:00-15:00',
    },
    leitung: { de: '[Name – Lehrkraft]' },
    inhalte: [
      { de: 'Altersgerechte Unterrichtsmethoden', tr: 'Yaş grubuna uygun öğretim yöntemleri', en: 'Age-appropriate teaching methods' },
      { de: 'Spielerisches Lernen', tr: 'Oyunlu öğrenme', en: 'Playful learning approach' },
      { de: 'Arabische Aussprache (Tajwid)', tr: 'Arapça telaffuz (Tecvid)', en: 'Arabic pronunciation (Tajweed)' },
      { de: 'Islamische Werte und Ethik', tr: 'İslami değerler ve ahlak', en: 'Islamic values and ethics' },
      {
        de: 'Kleine Gruppengrößen (max. 12 Kinder)',
        tr: 'Küçük grup boyutları (max. 12 çocuk)',
        en: 'Small group sizes (max. 12 children)',
      },
    ],
    verfuegbarkeit: 'voranmeldung',
    hinweis: {
      de: 'Außerhalb der Schulferien - Voranmeldung über Schüler-Voranmeldung',
      tr: 'Okul tatilleri dışında - Öğrenci ön kayıt üzerinden kayıt',
      en: 'Outside school holidays - Registration via Student Pre-Registration',
    },
    sortierung: 1,
  },
  {
    slug: 'korankurs-fuer-erwachsene',
    status: 'veroeffentlicht',
    istBeispiel: true,
    quelle: 'design/QuranCourses.dc.html:62; bestand/src/app/components/QuranCourses.tsx:54–66 (de), 144–156 (tr), 234–246 (en)',
    titel: { de: 'Korankurs für Erwachsene', tr: 'Yetişkinler için Kuran Kursu', en: 'Quran Course for Adults' },
    beschreibung: {
      de: 'Speziell für erwachsene männliche Gemeindemitglieder konzipierter Kurs. Vertiefung der Koranrezitation und des Verständnisses der heiligen Texte.',
      tr: 'Özellikle yetişkin erkek cemaat üyeleri için tasarlanmış kurs. Kuran okuyuşunun derinleştirilmesi ve kutsal metinlerin anlaşılması.',
      en: 'Course specially designed for adult male community members. Deepening Quran recitation and understanding of the sacred texts.',
    },
    zielgruppe: { de: 'Männliche Erwachsene (18+ Jahre)', tr: 'Yetişkin Erkekler (18+ yaş)', en: 'Adult Males (18+ years)' },
    zeiten: {
      de: 'Montag & Freitag - 20:00–21:30 Uhr',
      tr: 'Pazartesi & Cuma - 20:00-21:30',
      en: 'Monday & Friday - 20:00-21:30',
    },
    inhalte: [
      { de: 'Korrekte Rezitation (Tajwid)', tr: 'Doğru okuyuş (Tecvid)', en: 'Correct recitation (Tajweed)' },
      { de: 'Arabische Grammatik Grundlagen', tr: 'Arap dilbilgisi temelleri', en: 'Arabic grammar fundamentals' },
      { de: 'Interpretation und Bedeutung', tr: 'Yorum ve anlam', en: 'Interpretation and meaning' },
      { de: 'Memorisierungstechniken', tr: 'Ezber teknikleri', en: 'Memorization techniques' },
      { de: 'Diskussion und Austausch', tr: 'Tartışma ve paylaşım', en: 'Discussion and exchange' },
    ],
    verfuegbarkeit: 'ohne_anmeldung',
    hinweis: {
      de: 'Einfach zur angegebenen Zeit erscheinen - für alle Kenntnisstufen',
      tr: 'Belirtilen saatte gelmek yeterli - tüm seviyeler için uygun',
      en: 'Simply attend at the specified time - suitable for all levels',
    },
    sortierung: 2,
  },
  {
    slug: 'hafiz-vorbereitungskurs',
    status: 'veroeffentlicht',
    istBeispiel: true,
    quelle: 'design/QuranCourses.dc.html:63; bestand/src/app/components/QuranCourses.tsx:70–82 (de), 160–172 (tr), 250–262 (en)',
    titel: { de: 'Hafiz Vorbereitungskurs', tr: 'Hafızlık Hazırlık Kursu', en: 'Hafiz Preparation Course' },
    beschreibung: {
      de: 'Intensiver Kurs zur vollständigen Memorisierung des Korans. Ein anspruchsvolles Programm für besonders engagierte Schüler.',
      tr: "Kuran'ın tamamen ezberlemesi için yoğun kurs. Özellikle kararlı öğrenciler için zorlu bir program.",
      en: 'Intensive course for complete memorization of the Quran. A challenging program for particularly dedicated students.',
    },
    zielgruppe: { de: 'Fortgeschrittene Schüler', tr: 'İleri seviye öğrenciler', en: 'Advanced Students' },
    zeiten: { de: 'Montag-Freitag - 16:00–18:00 Uhr', tr: 'Pazartesi-Cuma - 16:00-18:00', en: 'Monday-Friday - 16:00-18:00' },
    inhalte: [
      { de: 'Vollständige Koranmemorierung', tr: 'Tam Kuran ezberleme', en: 'Complete Quran memorization' },
      { de: 'Intensive tägliche Betreuung', tr: 'Yoğun günlük takip', en: 'Intensive daily supervision' },
      { de: 'Revision und Wiederholung', tr: 'Tekrar ve gözden geçirme', en: 'Revision and repetition' },
      { de: 'Prüfungsvorbereitung', tr: 'Sınav hazırlığı', en: 'Examination preparation' },
      { de: 'Zertifizierung', tr: 'Sertifikasyon', en: 'Certification' },
    ],
    verfuegbarkeit: 'geschlossen',
    hinweis: {
      de: 'Kurs bereits gestartet - keine neuen Anmeldungen möglich',
      tr: 'Kurs zaten başlamış - yeni kayıtlar mümkün değil',
      en: 'Course already started - no new registrations possible',
    },
    sortierung: 3,
  },
];

export const seed: BereichsSeed = async (db) => {
  const r = await db.insert(schema.kurs).values(KURSE).onConflictDoNothing({ target: schema.kurs.slug }).returning({ id: schema.kurs.id });
  return r.length;
};
