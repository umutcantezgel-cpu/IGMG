// Beispielinhalte aus dem Bestand (ADR 0015), maschinell erzeugt mit _lauf/werkzeuge/erzeuge-seed-daten.py.
// Jeder Eintrag trägt seine Fundstelle; Personennamen sind durch Platzhalter ersetzt. Nicht von Hand ändern.
import type { SeedNachricht } from '../typen';

export const BEISPIEL_NACHRICHTEN: SeedNachricht[] = [
  {
    slug: 'neue-gebetszeiten-fuer-den-winter',
    titel: {
      de: 'Neue Gebetszeiten für den Winter',
    },
    kurztext: {
      de: 'Ab dem 1. November gelten neue Gebetszeiten. Bitte beachten Sie die aktualisierten Zeiten für eine bessere Teilnahme.',
    },
    absaetze: {
      de: ['Ab dem 1. November gelten neue Gebetszeiten. Bitte beachten Sie die aktualisierten Zeiten für eine bessere Teilnahme.'],
    },
    kategorie: 'neuigkeiten',
    wichtig: true,
    veroeffentlicht: '2025-07-20T10:00',
    // Von Hand angepasst (Sichtabnahme Z-04, ST-1): Die Bestandsmeldung von 2025 ist keine Empfehlung mehr, sonst stünde
    // sie mit „Wichtig“ als veralteter Aufmacher über neueren Beiträgen. Aufmacher regelt `waehleAufmacher` (Frist 30 Tage).
    empfohlen: false,
    lesezeit: 2,
    quelle: 'bestand/src/app/components/NewsSection.tsx:11-20',
  },
  {
    slug: 'ramadan-vorbereitung-2025',
    titel: {
      de: 'Ramadan Vorbereitung 2025',
    },
    kurztext: {
      de: 'Informationen zu den geplanten Aktivitäten und Programmen für den kommenden Ramadan.',
    },
    absaetze: {
      de: ['Informationen zu den geplanten Aktivitäten und Programmen für den kommenden Ramadan.'],
    },
    kategorie: 'ankuendigung',
    wichtig: false,
    veroeffentlicht: '2025-07-18T10:00',
    empfohlen: false,
    lesezeit: 3,
    quelle: 'bestand/src/app/components/NewsSection.tsx:21-30',
  },
  {
    slug: 'gemeinschaftskueche-erweitert',
    titel: {
      de: 'Gemeinschaftsküche erweitert',
    },
    kurztext: {
      de: 'Unsere Küche wurde renoviert und erweitert, um größere Veranstaltungen zu unterstützen.',
    },
    absaetze: {
      de: ['Unsere Küche wurde renoviert und erweitert, um größere Veranstaltungen zu unterstützen.'],
    },
    kategorie: 'neuigkeiten',
    wichtig: false,
    veroeffentlicht: '2025-07-15T10:00',
    empfohlen: false,
    lesezeit: 1,
    quelle: 'bestand/src/app/components/NewsSection.tsx:31-40',
  },
  {
    slug: 'neuer-imam-stellt-sich-vor',
    titel: {
      de: 'Neuer Imam stellt sich vor',
    },
    kurztext: {
      de: 'Wir freuen uns, [Name – Imam] als neues Mitglied unserer Gemeinde willkommen zu heißen.',
    },
    absaetze: {
      de: ['Wir freuen uns, [Name – Imam] als neues Mitglied unserer Gemeinde willkommen zu heißen.'],
    },
    kategorie: 'gemeinde',
    wichtig: false,
    veroeffentlicht: '2025-07-12T10:00',
    empfohlen: false,
    lesezeit: 4,
    quelle: 'bestand/src/app/components/NewsSection.tsx:41-50',
  },
  {
    slug: 'ramadan-2024-programm-und-zeiten',
    titel: {
      de: 'Ramadan 2024: Programm und Zeiten',
      tr: 'Ramazan 2024: Program ve Saatler',
      en: 'Ramadan 2024: Schedule and Times',
    },
    kurztext: {
      de: 'Erfahren Sie alles über unser Ramadan-Programm mit Iftar-Zeiten, Tarawih-Gebeten und besonderen Veranstaltungen.',
      tr: 'İftar saatleri, teravih namazları ve özel etkinliklerle Ramazan programımız hakkında her şeyi öğrenin.',
      en: 'Learn everything about our Ramadan program with Iftar times, Tarawih prayers and special events.',
    },
    absaetze: {
      de: ['Der heilige Monat Ramadan steht vor der Tür...'],
      tr: ['Mübarek Ramazan ayı yaklaşıyor...'],
      en: ['The holy month of Ramadan is approaching...'],
    },
    kategorie: 'religioes',
    wichtig: false,
    veroeffentlicht: '2024-03-10T10:00',
    empfohlen: true,
    lesezeit: 5,
    quelle: 'bestand/src/app/components/News.tsx:159-172',
  },
  {
    slug: 'neue-korankurse-fuer-erwachsene-starten',
    titel: {
      de: 'Neue Korankurse für Erwachsene starten',
      tr: 'Yetişkinler için yeni Kuran kursları başlıyor',
      en: 'New Quran courses for adults starting',
    },
    kurztext: {
      de: 'Ab April bieten wir neue Korankurse für Erwachsene an. Anmeldungen ab sofort möglich.',
      tr: 'Nisan ayından itibaren yetişkinler için yeni Kuran kursları sunuyoruz. Kayıtlar hemen başlayabilir.',
      en: 'Starting in April, we offer new Quran courses for adults. Registration is now open.',
    },
    absaetze: {
      de: ['Wir freuen uns, neue Bildungsmöglichkeiten anzukündigen...'],
      tr: ['Yeni eğitim fırsatlarını duyurmaktan mutluluk duyuyoruz...'],
      en: ['We are pleased to announce new educational opportunities...'],
    },
    kategorie: 'bildung',
    wichtig: false,
    veroeffentlicht: '2024-03-08T10:00',
    empfohlen: false,
    lesezeit: 3,
    quelle: 'bestand/src/app/components/News.tsx:173-186',
  },
  {
    slug: 'gemeinschaftskueche-hilfe-fuer-beduerftige',
    titel: {
      de: 'Gemeinschaftsküche: Hilfe für Bedürftige',
      tr: 'Toplum Mutfağı: İhtiyaç sahiplerine yardım',
      en: 'Community Kitchen: Help for those in need',
    },
    kurztext: {
      de: 'Unsere neue Gemeinschaftsküche versorgt täglich bedürftige Familien mit warmen Mahlzeiten.',
      tr: 'Yeni toplum mutfağımız her gün ihtiyaç sahibi ailelere sıcak yemek sağlıyor.',
      en: 'Our new community kitchen provides warm meals to families in need every day.',
    },
    absaetze: {
      de: ['Als Teil unserer sozialen Verantwortung haben wir...'],
      tr: ['Sosyal sorumluluğumuzun bir parçası olarak...'],
      en: ['As part of our social responsibility, we have...'],
    },
    kategorie: 'soziales',
    wichtig: false,
    veroeffentlicht: '2024-03-05T10:00',
    empfohlen: true,
    lesezeit: 4,
    quelle: 'bestand/src/app/components/News.tsx:187-200',
  },
  {
    slug: 'jugendcamp-2024-anmeldungen-offen',
    titel: {
      de: 'Jugendcamp 2024 Anmeldungen offen',
      tr: 'Gençlik Kampı 2024 kayıtları açık',
      en: 'Youth Camp 2024 registration open',
    },
    kurztext: {
      de: 'Das diesjährige Jugendcamp findet vom 15.-22. Juli statt. Begrenzte Plätze verfügbar.',
      tr: 'Bu yılki gençlik kampı 15-22 Temmuz tarihleri arasında yapılacak. Sınırlı kontenjan mevcut.',
      en: "This year's youth camp takes place from July 15-22. Limited spots available.",
    },
    absaetze: {
      de: ['Unser jährliches Jugendcamp ist eine großartige Gelegenheit...'],
      tr: ['Yıllık gençlik kampımız harika bir fırsat...'],
      en: ['Our annual youth camp is a great opportunity...'],
    },
    kategorie: 'veranstaltung',
    wichtig: false,
    veroeffentlicht: '2024-03-03T10:00',
    empfohlen: false,
    lesezeit: 3,
    quelle: 'bestand/src/app/components/News.tsx:201-214',
  },
  {
    slug: 'moscheererweiterung-genehmigt',
    titel: {
      de: 'Moscheererweiterung genehmigt',
      tr: 'Cami genişletme projesi onaylandı',
      en: 'Mosque expansion approved',
    },
    kurztext: {
      de: 'Die Stadtverwaltung hat unseren Erweiterungsplan genehmigt. Bauarbeiten beginnen im Herbst.',
      tr: 'Belediye genişletme planımızı onayladı. İnşaat çalışmaları sonbaharda başlayacak.',
      en: 'The city administration has approved our expansion plan. Construction work begins in autumn.',
    },
    absaetze: {
      de: ['Nach langen Verhandlungen und Planungen...'],
      tr: ['Uzun müzakereler ve planlamalardan sonra...'],
      en: ['After long negotiations and planning...'],
    },
    kategorie: 'ankuendigung',
    wichtig: false,
    veroeffentlicht: '2024-03-01T10:00',
    empfohlen: true,
    lesezeit: 6,
    quelle: 'bestand/src/app/components/News.tsx:215-228',
  },
  {
    slug: 'interreligioeser-dialog-erfolgreich',
    titel: {
      de: 'Interreligiöser Dialog erfolgreich',
      tr: 'Dinlerarası diyalog başarılı',
      en: 'Interfaith dialogue successful',
    },
    kurztext: {
      de: 'Das erste interreligiöse Dialogtreffen war ein voller Erfolg mit über 100 Teilnehmern.',
      tr: "İlk dinlerarası diyalog toplantısı 100'den fazla katılımcıyla büyük başarı oldu.",
      en: 'The first interfaith dialogue meeting was a great success with over 100 participants.',
    },
    absaetze: {
      de: ['Am vergangenen Wochenende fand unser erstes...'],
      tr: ['Geçtiğimiz hafta sonu ilk...'],
      en: ['Last weekend our first...'],
    },
    kategorie: 'gemeinde',
    wichtig: false,
    veroeffentlicht: '2024-02-28T10:00',
    empfohlen: false,
    lesezeit: 4,
    quelle: 'bestand/src/app/components/News.tsx:229-242',
  },
  // Von Hand ergänzt (Lauf Gemeinde-Plattform, H-I01, AUFTRAG 3.9): Nachtrag zur fertiggestellten Moschee, kein Ersatz
  // für die historische Meldung von 2024. Datum der Eröffnung und Einzelheiten liefert die Gemeinde (MN-08).
  {
    slug: 'eroeffnung-der-neuen-fatih-moschee',
    titel: {
      de: 'Eröffnung der neuen Fatih-Moschee',
      tr: "Yeni Fatih Camii'nin açılışı",
      en: 'Opening of the new Fatih Mosque',
    },
    kurztext: {
      de: 'Die neue Fatih-Moschee ist fertiggestellt. Eröffnung: [Datum – von der Gemeinde].',
      tr: 'Yeni Fatih Camii tamamlandı. Açılış: [Tarih – cemaat tarafından].',
      en: 'The new Fatih Mosque is complete. Opening: [Date – from the community].',
    },
    absaetze: {
      de: [
        'Die neue Fatih-Moschee in [Ortsangabe – von der Gemeinde] ist fertiggestellt. Die Eröffnung findet am [Datum – von der Gemeinde] statt.',
        '[Programm und Einzelheiten zur Eröffnung – von der Gemeinde]',
      ],
      tr: [
        '[Konum – cemaat tarafından] adresindeki yeni Fatih Camii tamamlandı. Açılış [Tarih – cemaat tarafından] tarihinde yapılacak.',
        '[Açılış programı ve ayrıntılar – cemaat tarafından]',
      ],
      en: [
        'The new Fatih Mosque in [Location – from the community] is complete. The opening will take place on [Date – from the community].',
        '[Programme and details of the opening – from the community]',
      ],
    },
    kategorie: 'gemeinde',
    wichtig: false,
    veroeffentlicht: '2026-10-12T10:00',
    empfohlen: false,
    lesezeit: 1,
    quelle:
      'AUFTRAG 3.9 und _gemeinde/berichte/E0-K05-moschee-fundstellen.md (Nachtrag „Eröffnung“); Datum und Einzelheiten Platzhalter (MN-08)',
  },
];
