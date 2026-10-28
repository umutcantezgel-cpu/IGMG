import type { z } from 'zod';
import { schema } from '../../../src/lib/db';
import { schema as inhaltSchema } from '../../../src/lib/validierung/seiteninhalte/hadsch-umra';
import type { BereichsSeed } from './typ';

/**
 * Beispielinhalt „hadsch-umra“ (Plan Marktstart P4, E-044 Nr. 1, ADR 0046): Seite „Hadsch & Umra“ der Gemeinde. Stand der
 * Angaben ist der Crawl von igmgreisen.com vom 13.10.2026; Texte eigenständig formuliert (de/tr/en, keine Folge von acht
 * Wörtern aus dem Crawl), Fakten mit Quelle und Stand. Übernommen sind nur Termine, Fristen, Anzahlungen und Links.
 *
 * Bewusst nicht übernommen:
 * - Preise (widersprüchlich im Crawl, „Die Preise werden noch bekannt gegeben“) – die Seite verweist auf IGMG Reisen.
 * - Telefonnummern und Namen der Regionalstellen (Mobilnummern, G-04); die Zuständigkeit für Wetzlar ist nicht belegt, die
 *   Ansprechperson der Gemeinde bleibt ein Platzhalter (M-104).
 * - Die Unterlage „tebligat.pdf“ (Rundschreiben von 2014, veraltet) und alles Religiöse: Koranverse, die Talbiya und
 *   Bittgebete der Quellen (G-06). Die Erklärung „Was ist Hadsch, was ist Umra?“ ist das Wissensthema `hajj-umrah` (P5).
 * - Seminartermine der Gemeinde (nicht belegt, Platzhalter).
 * Die Tonsprache der Videos ist unklar (Hinweis auf der Seite); tr/en-Titel sind eigene Übersetzungen.
 */

const REISEN = 'https://www.igmgreisen.com';

/** Herkunft des Seeds (Spalte `quelle`). */
export const HADSCH_UMRA_QUELLE = [
  `${REISEN}/de/hadsch/ und ${REISEN}/hac/ (Hadsch 2027, Frist 01.11.2026)`,
  `${REISEN}/de/umra/ und ${REISEN}/umre/ (Umra 2026/2027)`,
  `${REISEN}/de/umra-anmeldebedingungen/`,
  `${REISEN}/de/zweigstellen/`,
  `${REISEN}/de/dokumente/`,
  `${REISEN}/de/videos/ und ${REISEN}/videolar/`,
  `${REISEN}/kultur-turlari/`,
  `${REISEN}/de/impressum/`,
  'https://www.igmg.org/umre-yoldasim/',
]
  .join('; ')
  .concat(
    ' – Crawl 13.10.2026; Texte eigenständig formuliert mit Zustimmung der IGMG (E-044, ADR 0046); keine Preise, keine Telefonnummern (G-04)',
  );

const SEMINARE = {
  de: '[Termine der Vorbereitungsseminare – von der Gemeinde]',
  tr: '[Hazırlık seminerlerinin tarihleri – cemaat tarafından]',
  en: '[Dates of the preparation seminars – from the community]',
};

export const HADSCH_UMRA_BEISPIEL: z.input<typeof inhaltSchema> = {
  einleitung: {
    de: 'Die Fatih-Moschee Wetzlar begleitet alle, die von Wetzlar aus zum Hadsch oder zur Umra aufbrechen möchten. Gereist wird mit IGMG Reisen, der IGMG Hadsch-Umra Reisen GmbH der Islamischen Gemeinschaft Millî Görüş (IGMG) mit Sitz in Köln. Angemeldet wird über ihre Regionalstelle für Hessen; für Gruppen aus Hessen nennt IGMG Reisen Abflüge ab Frankfurt am Main. Hier finden Sie Fristen, Termine, Unterlagen und Antworten auf häufige Fragen.',
    tr: 'Wetzlar Fatih Camii, Wetzlar’dan hacca veya umreye gitmek isteyen herkese bu yolda eşlik eder. Yolculuk, merkezi Köln’de bulunan İslam Toplumu Millî Görüş’ün (IGMG) seyahat şirketi IGMG Reisen (IGMG Hadsch-Umra Reisen GmbH) ile yapılır. Kayıt, şirketin Hessen bölge temsilciliği üzerinden yapılır; IGMG Reisen, Hessen’den katılan gruplar için Frankfurt’tan kalkışlar planlıyor. Bu sayfada son başvuru tarihlerini, uçuş tarihlerini, gerekli belgeleri ve sık sorulan soruların cevaplarını bulabilirsiniz.',
    en: 'Fatih Mosque Wetzlar supports everyone in Wetzlar who wishes to set out on Hajj or Umrah. The journey itself is organised by IGMG Reisen, the travel company (IGMG Hadsch-Umra Reisen GmbH) of the Islamic Community Millî Görüş (IGMG), based in Cologne. Registration goes through its regional office for Hesse; for groups from Hesse, IGMG Reisen lists departures from Frankfurt am Main. On this page you will find deadlines, dates, documents and answers to common questions.',
  },
  hinweise: [
    {
      text: {
        de: 'Hadsch 2027: Die Unterlagen für die Anmeldung sind bis spätestens 1. November 2026 bei IGMG Reisen einzureichen.',
        tr: 'Hac 2027: Kayıt belgelerinin en geç 1 Kasım 2026’ya kadar IGMG Reisen’e teslim edilmesi gerekiyor.',
        en: 'Hajj 2027: Registration documents must reach IGMG Reisen by 1 November 2026 at the latest.',
      },
      bis: '2026-11-01',
      link: 'reisenHadsch',
    },
  ],
  programme: [
    {
      art: 'hadsch',
      titel: { de: 'Hadsch 2027', tr: 'Hac 2027', en: 'Hajj 2027' },
      text: {
        de: 'Die große Pilgerfahrt nach Mekka. IGMG Reisen bietet zwei Wege an: ein Paket über die saudische Plattform Nusuk und eine Reise mit türkischem Visum. Für Hessen sind Gruppen mit Abflug in Frankfurt im Frühjahr 2027 ausgeschrieben.',
        tr: 'Mekke’ye yapılan büyük ibadet yolculuğu. IGMG Reisen iki seçenek sunuyor: Suudi Arabistan’ın Nusuk platformu üzerinden bir paket ve Türk vizesiyle yapılan bir yolculuk. Hessen için 2027 ilkbaharında Frankfurt’tan kalkan gruplar planlandı.',
        en: 'The great pilgrimage to Mecca. IGMG Reisen offers two options: a package via the Saudi platform Nusuk and a journey with a Turkish visa. For Hesse, groups departing from Frankfurt in spring 2027 have been announced.',
      },
      link: 'reisenHadsch',
    },
    {
      art: 'umra',
      titel: { de: 'Umra-Reisen 2026/2027', tr: 'Umre yolculukları 2026/2027', en: 'Umrah trips 2026/2027' },
      text: {
        de: 'Umra-Reisen verteilen sich über das ganze Jahr, unter anderem im Dezember, im Ramadan, im April, im Sommer und im Herbst. Für Hessen und Frankfurt gibt es eigene Termine.',
        tr: 'Umre yolculukları yıl boyunca farklı dönemlerde yapılıyor; aralarında aralık, ramazan, nisan, yaz ve sonbahar dönemleri var. Hessen ve Frankfurt için ayrı tarihler belirlendi.',
        en: 'Umrah trips are spread across the year, including December, Ramadan, April, summer and autumn. Hesse and Frankfurt have dates of their own.',
      },
      link: 'reisenUmra',
    },
    {
      art: 'umra',
      titel: { de: 'Bedingungen für die Umra-Anmeldung', tr: 'Umre kayıt şartları', en: 'Umrah registration terms' },
      text: {
        de: 'Was bei Anmeldung, Anzahlung, Visum und Rücktritt gilt, regeln die Anmeldebedingungen von IGMG Reisen.',
        tr: 'Kayıt, ön ödeme, vize ve iptal konusundaki kurallar IGMG Reisen’in kayıt şartlarında yer alıyor.',
        en: 'The rules on registration, deposit, visa and cancellation are set out in the IGMG Reisen registration terms.',
      },
      link: 'reisenUmraBedingungen',
    },
    {
      art: 'kultur',
      titel: { de: 'Kulturreisen', tr: 'Kültür turları', en: 'Cultural trips' },
      text: {
        de: 'Neben den Pilgerreisen bietet IGMG Reisen Kulturreisen an, etwa nach Jerusalem, Andalusien, Bosnien und Herzegowina oder Usbekistan.',
        tr: 'IGMG Reisen, hac ve umrenin yanı sıra Kudüs, Endülüs, Bosna-Hersek veya Özbekistan gibi yerlere kültür turları da düzenliyor.',
        en: 'Besides the pilgrimages, IGMG Reisen offers cultural trips, for example to Jerusalem, Andalusia, Bosnia and Herzegovina or Uzbekistan.',
      },
      link: { de: `${REISEN}/kultur-turlari/`, seitenSprache: 'tr' },
    },
  ],
  abfluege: {
    stand: '2026-10-13',
    quellen: ['reisenHadsch', 'reisenUmra'],
    eintraege: [
      {
        art: 'hadsch',
        gruppe: { de: 'Hessen – Paket über Nusuk', tr: 'Hessen – Nusuk paketi', en: 'Hesse – Nusuk package' },
        abflughafen: 'FRA',
        zielflughafen: 'MED',
        hin: '2027-04-28',
        rueck: '2027-05-20',
      },
      {
        art: 'hadsch',
        gruppe: {
          de: 'Rhein-Saar/Hessen – mit türkischem Visum',
          tr: 'Rhein-Saar/Hessen – Türk vizesiyle',
          en: 'Rhine-Saar/Hesse – with a Turkish visa',
        },
        abflughafen: 'FRA',
        zielflughafen: 'MED',
        hin: '2027-05-03',
        rueck: '2027-05-24',
      },
      {
        art: 'hadsch',
        gruppe: { de: 'Deutschsprachige Gruppe', tr: 'Almanca konuşan grup', en: 'German-speaking group' },
        abflughafen: 'DUS/FRA',
        zielflughafen: 'JED',
        hin: '2027-05-05',
        rueck: '2027-05-27',
      },
      {
        art: 'umra',
        gruppe: { de: 'Hessen – Dezember-Umra', tr: 'Hessen – aralık umresi', en: 'Hesse – December Umrah' },
        abflughafen: 'FRA',
        zielflughafen: 'MED',
        hin: '2026-12-23',
        rueck: '2027-01-06',
      },
      {
        art: 'umra',
        gruppe: { de: 'Deutschsprachige Umra-Gruppe', tr: 'Almanca konuşan umre grubu', en: 'German-speaking Umrah group' },
        abflughafen: 'FRA',
        zielflughafen: 'JED',
        hin: '2026-12-23',
        rueck: '2027-01-06',
      },
      {
        art: 'umra',
        gruppe: { de: 'Hessen – April-Umra', tr: 'Hessen – nisan umresi', en: 'Hesse – April Umrah' },
        zielflughafen: 'MED',
        hin: '2027-03-22',
        rueck: '2027-04-02',
      },
      {
        art: 'umra',
        gruppe: { de: 'Frankfurt – Sommer-Umra', tr: 'Frankfurt – yaz umresi', en: 'Frankfurt – summer Umrah' },
        abflughafen: 'FRA',
        zielflughafen: 'MED',
        hin: '2027-06-29',
        rueck: '2027-07-08',
      },
      {
        art: 'umra',
        gruppe: { de: 'Frankfurt – Herbst-Umra', tr: 'Frankfurt – sonbahar umresi', en: 'Frankfurt – autumn Umrah' },
        abflughafen: 'FRA',
        zielflughafen: 'MED',
        hin: '2027-10-04',
        rueck: '2027-10-17',
      },
    ],
  },
  anmeldung: {
    text: {
      de: 'Die Anmeldeformulare erhalten Sie bei den Regionalstellen von IGMG Reisen. Wetzlar liegt in Hessen – die Kontaktdaten der Regionalstelle Hessen finden Sie in der Liste der Regionalstellen. Zur Umra können Sie sich bis einen Monat vor dem Abflug anmelden, solange es freie Plätze gibt. Bei der Anmeldung ist eine Anzahlung zu leisten; IGMG Reisen nennt 2.500 € für den Hadsch und 500 € für die Umra. Preise und alle Bedingungen erfahren Sie direkt bei IGMG Reisen.',
      tr: 'Kayıt formlarını IGMG Reisen’in bölge temsilciliklerinden alabilirsiniz. Wetzlar, Hessen eyaletindedir; Hessen bölge temsilciliğinin iletişim bilgileri temsilcilikler listesinde yer alıyor. Umre için, boş yer olduğu sürece uçuştan bir ay öncesine kadar kayıt yaptırabilirsiniz. Kayıt sırasında ön ödeme yapılır; IGMG Reisen bunu hac için 2.500 €, umre için 500 € olarak belirtiyor. Fiyatları ve tüm şartları doğrudan IGMG Reisen’den öğrenebilirsiniz.',
      en: 'Registration forms are available from the regional offices of IGMG Reisen. Wetzlar is in Hesse – the contact details of the Hesse regional office are in the list of regional offices. You can register for Umrah up to one month before departure, as long as places are available. A deposit is due on registration; IGMG Reisen states 2,500 € for Hajj and 500 € for Umrah. For prices and all conditions, please ask IGMG Reisen directly.',
    },
    stelle: 'reisenZweigstellen',
  },
  ansprechperson: {
    name: '[Ansprechperson Hadsch & Umra – von der Gemeinde]',
    telefon: '[Telefonnummer]',
    sprechzeit: {
      de: '[Sprechzeit – von der Gemeinde]',
      tr: '[Görüşme saatleri – cemaat tarafından]',
      en: '[Office hours – from the community]',
    },
  },
  unterlagen: [
    {
      titel: {
        de: 'Formulare: ärztliches Attest, Einverständnis der Eltern, Rücktrittsantrag',
        tr: 'Formlar: sağlık raporu, aile izin belgesi, iptal dilekçesi',
        en: 'Forms: medical certificate, parental consent, cancellation request',
      },
      url: 'reisenDokumente',
      sprache: 'de-tr',
    },
    {
      titel: {
        de: 'Hadsch- und Umraführer sowie Gesundheitsratgeber zum Herunterladen',
        tr: 'İndirilebilir hac ve umre rehberleri ile hac sağlık el kitabı',
        en: 'Hajj and Umrah guides and a health guide to download',
      },
      url: 'reisenDokumente',
      sprache: 'tr',
      jahr: '2016',
    },
    {
      titel: { de: 'Umra-Begleiter der IGMG', tr: 'IGMG’nin Umre Yoldaşım rehberi', en: 'IGMG Umrah companion' },
      url: 'umreYoldasim',
      sprache: 'mehrsprachig',
    },
  ],
  videos: [
    {
      youtubeId: 'ytTuELK2slU',
      titel: { de: 'Wie wird der Hadsch verrichtet?', tr: 'Hac nasıl yapılır?', en: 'How is Hajj performed?' },
    },
    { youtubeId: 'vkaJ9HxrJuo', titel: { de: 'Ahmets Umra-Traum', tr: 'Ahmet’in umre hayali', en: 'Ahmet’s Umrah dream' } },
    {
      youtubeId: 'eYOO4BNqx0Q',
      titel: { de: 'Was gehört ins Reisegepäck?', tr: 'Bavula neler konmalı?', en: 'What goes in the luggage?' },
    },
    {
      youtubeId: 'y_pz3asmjck',
      titel: { de: 'Umra 2026 – Dokumentation', tr: 'Umre 2026 belgeseli', en: 'Umrah 2026 documentary' },
      jahr: '2026',
    },
    {
      youtubeId: '2IMALB-98ag',
      titel: {
        de: 'Erinnerung an die heiligste Reise',
        tr: 'En kutsal yolculuğun hatırası',
        en: 'Memories of the most sacred journey',
      },
      jahr: '2026',
    },
  ],
  faq: [
    {
      frage: {
        de: 'Wo melde ich mich in Wetzlar für Hadsch oder Umra an?',
        tr: 'Wetzlar’da hac veya umre için nereye kayıt yaptırırım?',
        en: 'Where do I register for Hajj or Umrah in Wetzlar?',
      },
      antwort: {
        de: 'Die Anmeldung läuft über IGMG Reisen und ihre Regionalstellen; für Hessen gibt es eine eigene Regionalstelle. Dort erhalten Sie auch die Anmeldeformulare. Bei Fragen vorab können Sie sich an die Fatih-Moschee Wetzlar wenden.',
        tr: 'Kayıt, IGMG Reisen ve bölge temsilcilikleri üzerinden yapılır; Hessen’in kendi bölge temsilciliği vardır. Kayıt formlarını da orada alabilirsiniz. Önceden sormak istedikleriniz için Wetzlar Fatih Camii’ne başvurabilirsiniz.',
        en: 'Registration goes through IGMG Reisen and its regional offices; Hesse has a regional office of its own. That is also where you get the registration forms. If you have questions beforehand, you can contact Fatih Mosque Wetzlar.',
      },
    },
    {
      frage: {
        de: 'Bis wann muss ich mich anmelden?',
        tr: 'En geç ne zamana kadar kayıt yaptırmalıyım?',
        en: 'What is the registration deadline?',
      },
      antwort: {
        de: 'Für den Hadsch gibt es jedes Jahr eine feste Frist für die Unterlagen – für den Hadsch 2027 ist es der 1. November 2026. Zur Umra können Sie sich bis einen Monat vor dem Abflug anmelden, solange es freie Plätze gibt. Verbindlich sind die Fristen bei IGMG Reisen.',
        tr: 'Hac için belgelerin teslimi her yıl belirli bir tarihe bağlıdır; Hac 2027 için bu tarih 1 Kasım 2026’dır. Umre için, boş yer olduğu sürece uçuştan bir ay öncesine kadar kayıt yaptırabilirsiniz. Bağlayıcı olan, IGMG Reisen’in açıkladığı tarihlerdir.',
        en: 'For Hajj there is a fixed deadline for the documents each year – for Hajj 2027 it is 1 November 2026. For Umrah you can register up to one month before departure, as long as places are available. The deadlines published by IGMG Reisen are binding.',
      },
    },
    {
      frage: {
        de: 'Ab welchem Flughafen fliegen Pilgerinnen und Pilger aus Hessen?',
        tr: 'Hessen’den hacılar hangi havalimanından uçuyor?',
        en: 'Which airport do pilgrims from Hesse fly from?',
      },
      antwort: {
        de: 'Für Gruppen aus Hessen nennt IGMG Reisen Abflüge ab Frankfurt am Main, meist mit dem Ziel Medina. Die deutschsprachige Hadsch-Gruppe startet in Düsseldorf oder Frankfurt und landet in Dschidda. Die aktuellen Termine stehen in der Tabelle auf dieser Seite.',
        tr: 'IGMG Reisen, Hessen’den katılan gruplar için Frankfurt am Main’den kalkışlar planlıyor; varış noktası çoğunlukla Medine. Almanca konuşan hac grubu Düsseldorf veya Frankfurt’tan kalkıp Cidde’ye iniyor. Güncel tarihleri bu sayfadaki tabloda bulabilirsiniz.',
        en: 'For groups from Hesse, IGMG Reisen lists departures from Frankfurt am Main, mostly to Medina. The German-speaking Hajj group leaves from Düsseldorf or Frankfurt and lands in Jeddah. The current dates are in the table on this page.',
      },
    },
    {
      frage: { de: 'Welche Unterlagen brauche ich?', tr: 'Hangi belgelere ihtiyacım var?', en: 'Which documents do I need?' },
      antwort: {
        de: 'Was genau verlangt wird, steht in den Anmeldebedingungen von IGMG Reisen; dazu gehört ein gültiger Reisepass. Formulare wie das ärztliche Attest, die Einverständniserklärung der Eltern für Minderjährige und den Rücktrittsantrag stellt IGMG Reisen zum Herunterladen bereit.',
        tr: 'Tam olarak hangi belgelerin istendiği IGMG Reisen’in kayıt şartlarında yazıyor; geçerli bir pasaport bunlardan biridir. Sağlık raporu, reşit olmayanlar için aile izin belgesi ve iptal dilekçesi gibi formları IGMG Reisen indirilebilir olarak sunuyor.',
        en: 'Exactly what is required is set out in the IGMG Reisen registration terms; a valid passport is one of the requirements. IGMG Reisen provides forms such as the medical certificate, parental consent for minors and the cancellation request for download.',
      },
    },
    {
      frage: { de: 'Was kostet eine Pilgerreise?', tr: 'Hac veya umre yolculuğu ne kadar tutar?', en: 'How much does a pilgrimage cost?' },
      antwort: {
        de: 'Die Preise legt IGMG Reisen fest; sie hängen vom Programm, von der Saison und von der Zimmerbelegung ab und stehen auf igmgreisen.com. Wir nennen hier bewusst keine Preise, damit keine veralteten Angaben stehen bleiben.',
        tr: 'Fiyatları IGMG Reisen belirler; fiyatlar programa, döneme ve oda düzenine göre değişir ve igmgreisen.com’da yayımlanır. Eskimiş bilgiler kalmasın diye burada bilerek fiyat vermiyoruz.',
        en: 'Prices are set by IGMG Reisen; they depend on the programme, the season and the room type and are published on igmgreisen.com. We deliberately do not list prices here so that no outdated figures remain.',
      },
    },
    {
      frage: {
        de: 'Gibt es eine deutschsprachige Gruppe?',
        tr: 'Almanca konuşan bir grup var mı?',
        en: 'Is there a German-speaking group?',
      },
      antwort: {
        de: 'Ja. Für den Hadsch 2027 und für die Umra im Dezember 2026 hat IGMG Reisen jeweils eine deutschsprachige Gruppe ausgeschrieben. Die Termine stehen in der Tabelle der Abflüge.',
        tr: 'Evet. IGMG Reisen, Hac 2027 ve Aralık 2026 umresi için birer Almanca konuşan grup planladı. Tarihler, kalkış tablosunda yer alıyor.',
        en: 'Yes. IGMG Reisen has announced a German-speaking group both for Hajj 2027 and for the December 2026 Umrah. The dates are in the departures table.',
      },
    },
    {
      frage: { de: 'Gibt es Vorbereitungsseminare?', tr: 'Hazırlık seminerleri var mı?', en: 'Are there preparation seminars?' },
      antwort: {
        de: `IGMG Reisen empfiehlt allen, die zum Hadsch reisen, an einem Hadsch-Seminar in ihrer Region teilzunehmen. Termine für Wetzlar und Umgebung: ${SEMINARE.de}`,
        tr: `IGMG Reisen, hacca gidecek herkese bölgesinde düzenlenen bir hac seminerine katılmasını tavsiye ediyor. Wetzlar ve çevresi için tarihler: ${SEMINARE.tr}`,
        en: `IGMG Reisen recommends that everyone going on Hajj attends a Hajj seminar in their region. Dates for Wetzlar and the surrounding area: ${SEMINARE.en}`,
      },
    },
  ],
  stand: '2026-10-13',
};

/** Seed „hadsch-umra“ (Marktstart P4): idempotent (onConflictDoNothing), Beispielinhalt mit Quelle, Prüfung gegen das Schema. */
export const seed: BereichsSeed = async (db) => {
  const geprueft = inhaltSchema.parse(HADSCH_UMRA_BEISPIEL);
  const r = await db
    .insert(schema.seiteninhalt)
    .values({ bereich: 'hadsch-umra', istBeispiel: true, quelle: HADSCH_UMRA_QUELLE, inhalt: geprueft })
    .onConflictDoNothing({ target: schema.seiteninhalt.bereich })
    .returning({ bereich: schema.seiteninhalt.bereich });
  return r.length;
};
