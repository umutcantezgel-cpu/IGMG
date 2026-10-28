import { and, eq, inArray, isNotNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { schema, type Transaktion } from '../../../src/lib/db';
import { NETZWERK_STAND, netzwerkZiel, type NetzwerkSchluessel } from '../../../src/lib/dachverband/netzwerk';
import type { Mehrsprachig, MehrsprachigRich } from '../../../src/lib/db/schema/typen';
import { sperreInhaltsstaende } from '../../../src/lib/inhalt/sperre';
import { wissenKlartext } from '../../../src/lib/validierung/wissen';
import { entwurfDokument, KI_ENTWURF_VERFASSER, KI_ENTWURF_VERMERK, linkZiele } from '../../../src/lib/wissen/entwurf';
import type { BereichsSeed } from './typ';

/**
 * Seed „wissen-entwuerfe“ (Plan Marktstart P5, ADR 0047, Nutzerentscheidung E-044 Nr. 5): vier religiöse Erklärtexte als
 * KI-Entwurf – Hadsch und Umra, islamischer Kalender, Zakat/Fitra/Fidya/Kurban, Freitagsgebet. Status „veröffentlicht“,
 * Freigabe „zur Prüfung“: Mit dem Schalter `website_wissen_vorschau` sind sie sofort öffentlich, deutlich gekennzeichnet
 * als „Entwurf zur Prüfung – noch nicht vom Imam geprüft“ und mit `noindex`; der Imam gibt sie über Verwaltung › Freigaben
 * frei (ADR 0030). Bewusst NICHT über die Liste THEMEN von `wissen.ts` – die markiert jede Zeile als geprüften Bestand.
 *
 * Texte: eigenständig formuliert, nur belegte Aussagen aus den verlinkten Quellen (Crawl igmg.org und igmgreisen.com vom
 * 13.10.2026, Netzwerk-Ziele live geprüft am 27.10.2026). Keine Verse, Hadithe, Bittgebete, keine Übersetzung religiöser
 * Texte, keine arabische Schrift (G-06, ADR 0030 Nr. 4); Surenangabe nur dort, wo die verlinkte Predigt sie nennt; keine
 * Beträge (Fitra, Fidya und Zakat gibt die IGMG bekannt). Auszeichnung der Zeilen: `entwurfDokument` (`### Frage`,
 * `- Punkt`, `{Linktext|ziel}`). Einmal je Datenbank (Merker `ENTWURF_MERKER`): Was die Redaktion endgültig gelöscht hat,
 * legen weder `db:seed` noch die Stand-Migration im Bau neu an. Tests: `tests/unit/wissen-entwuerfe.test.ts`,
 * `tests/integration/wissen-entwuerfe.test.ts`, `tests/integration/inhalte-marktstart.test.ts`.
 */

type Sprache = 'de' | 'tr' | 'en';
const SPRACHEN: readonly Sprache[] = ['de', 'tr', 'en'];

/** Stand der Quellen: Crawl (13.10.2026) und Netzwerk-Verzeichnis (live geprüft). */
export const ENTWURF_STAND = { crawl: '2026-10-13', netzwerk: NETZWERK_STAND } as const;

/** Netzwerk-Ziele der Texte; die Adresse je Sprache kommt aus `NETZWERK` (Rückfall auf Deutsch mit Hinweis im Linktext). */
const NETZWERK_ZIELE = [
  'reisenWasIstHadsch',
  'reisenWasIstUmra',
  'reisenHadsch',
  'reisenUmra',
  'reisenZweigstellen',
  'umreYoldasim',
  'feste',
  'gelehrtenratHilal',
  'hasene',
  'zakatRechner',
  'freitagspredigt',
  'islamSchnellErklaert',
] as const satisfies readonly NetzwerkSchluessel[];

const IGMG = 'https://www.igmg.org';

/** Einzelne Beiträge auf igmg.org (Crawl 13.10.2026, Status 200), nur auf Deutsch – außer der Predigt vom 8.10.2026. */
const BEITRAEGE: Record<string, Record<Sprache, string>> = {
  hidschraNeujahr: nurDeutsch(`${IGMG}/hutba-die-hidschra-und-das-neue-mondjahr/`),
  regaib: nurDeutsch(`${IGMG}/hutba-die-gesegneten-drei-monate-und-die-regaib-nacht/`),
  miradsch: nurDeutsch(`${IGMG}/hutba-der-mira%c2%a2dsch/`),
  berat: nurDeutsch(`${IGMG}/hutba-die-bera%c2%a2t-nacht/`),
  ramadanBesinnung: nurDeutsch(`${IGMG}/ramadan-die-zeit-der-besinnung/`),
  hutbaZakatFitra: nurDeutsch(`${IGMG}/hutba-wer-zahlt-die-zakat-und-die-fitra-abgabe/`),
  hutbaKurban: nurDeutsch(`${IGMG}/hutba-kurban-und-das-kurbanfest/`),
  hutbaSozialeMedien: {
    de: `${IGMG}/rechte-und-pflichten-in-sozialen-medien/`,
    tr: `${IGMG}/tr/sosyal-medyada-kul-hakki/`,
    en: `${IGMG}/en/the-rights-of-others-on-social-media/`,
  },
};

function nurDeutsch(url: string): Record<Sprache, string> {
  return { de: url, tr: url, en: url };
}

/** Linkziele je Sprache (Schlüssel → https-Adresse) für `entwurfDokument`. */
export function entwurfZiele(sprache: Sprache): Record<string, string> {
  return {
    ...Object.fromEntries(NETZWERK_ZIELE.map((k) => [k, netzwerkZiel(k, sprache).href])),
    ...Object.fromEntries(Object.entries(BEITRAEGE).map(([k, v]) => [k, v[sprache]])),
  };
}

const dokument = (sprache: Sprache, zeilen: readonly string[]) => entwurfDokument(zeilen, entwurfZiele(sprache));

export type WissenEntwurf = {
  slug: string;
  sortierung: number;
  titel: Mehrsprachig;
  kurztext: Mehrsprachig;
  inhalt: MehrsprachigRich;
};

/** Die vier Entwürfe in der Reihenfolge nach den zwölf Bestandsthemen (Sortierung 13–16). */
export const WISSEN_ENTWUERFE: readonly WissenEntwurf[] = [
  {
    slug: 'hajj-umrah',
    sortierung: 13,
    titel: { de: 'Hadsch und Umra', tr: 'Hac ve Umre', en: 'Hajj and Umrah' },
    kurztext: {
      de: 'Der Hadsch ist die große Pilgerfahrt nach Mekka und eine der fünf Säulen des Islam; er ist an feste Tage im Monat Zulhidscha gebunden. Die Umra, die kleine Pilgerfahrt, ist fast das ganze Jahr über möglich. Hier steht, was beide unterscheidet und wie die Anmeldung von Wetzlar aus geht.',
      tr: 'Hac, Mekke’ye yapılan büyük ibadet yolculuğu ve İslam’ın beş şartından biridir; Zilhicce ayının belirli günlerine bağlıdır. Küçük hac olarak da bilinen umre ise yılın hemen her döneminde yapılabilir. İkisinin farkını ve Wetzlar’dan kaydın nasıl yapıldığını burada bulabilirsiniz.',
      en: 'Hajj is the great pilgrimage to Mecca and one of the five pillars of Islam; it is tied to fixed days in the month of Dhul Hijjah. Umrah, the lesser pilgrimage, is possible almost all year round. Here is how the two differ and how to register from Wetzlar.',
    },
    inhalt: {
      de: dokument('de', [
        'Kurz gesagt: Der Hadsch, die große Pilgerfahrt nach Mekka, ist eine der fünf Säulen des Islam und für alle Musliminnen und Muslime, die die Voraussetzungen erfüllen, einmal im Leben Pflicht. Die Umra ist ein Besuch der Kaaba, der fast zu jeder Zeit des Jahres möglich ist. Wer aus Wetzlar oder Mittelhessen mit der Islamischen Gemeinschaft Millî Görüş (IGMG) pilgern möchte, wendet sich an deren Reisedienst IGMG Reisen.',
        '### Was ist der Hadsch?',
        'Der Hadsch zählt zu den fünf Säulen des Islam. Pflicht wurde er im neunten Jahr nach der Hidschra; ein Jahr später pilgerte der Prophet Muhammad selbst mit den Muslimen nach Mekka – diese Reise ist als Abschiedspilgerfahrt bekannt. Wer die Voraussetzungen erfüllt, muss den Hadsch einmal im Leben vollziehen.',
        '### Wann findet der Hadsch statt?',
        'Der Hadsch hat eine feste Zeit. Nach der Erklärung von IGMG Reisen müssen die Kaaba und Arafat in der Zeit vom 1. Schawwal bis zum 9. Zulhidscha besucht werden; der 9. Zulhidscha ist der Tag des Aufenthalts in Arafat. Am 10. Zulhidscha beginnt das viertägige Kurbanfest (Opferfest), mit dem die jährliche Pilgerfahrt endet.',
        '### Was ist die Umra?',
        'Das Wort Umra bedeutet „Besuch“; gemeint ist ein besonderer Besuch der Kaaba in Mekka. Wer die Umra vollzieht, tritt in den Weihezustand (Ihram), umrundet die Kaaba (Tawaf), geht zwischen den Hügeln Safa und Marwa hin und her (Say) und lässt sich zum Abschluss die Haare scheren. Damit endet der Weihezustand.',
        '### Wann ist die Umra möglich?',
        'Die Umra ist an keine Jahreszeit gebunden. Ausgenommen sind nach IGMG Reisen nur der Tag von Arafat und die ersten vier Tage des Kurbanfestes. Eine Umra im Ramadan gilt als besonders empfehlenswert.',
        '### Worin unterscheiden sich Hadsch und Umra?',
        'Zur Umra gehören weder der Aufenthalt in Arafat und Muzdalifa noch das Opfertier oder die symbolische Steinigung. Deshalb heißt sie auch „kleiner Hadsch“, der eigentliche Hadsch dagegen „großer Hadsch“. Nach hanafitischer und malikitischer Lehre ist die Umra eine stark empfohlene Sunna, die man einmal im Leben vollziehen sollte; die schafiitische und die hanbalitische Rechtsschule sehen sie als Pflicht.',
        '### Wer kann pilgern?',
        'Für die Umra nennt IGMG Reisen diese Voraussetzungen: Man ist Muslim, bei klarem Verstand, religionsmündig, frei, gesund und finanziell zur Reise in der Lage, und der Reiseweg ist sicher. Auch für den Hadsch gelten Voraussetzungen; wer sie erfüllt, ist einmal im Leben dazu verpflichtet. Ob sie in Ihrem Fall erfüllt sind, besprechen Sie am besten mit dem Imam.',
        '### Wie melde ich mich von Wetzlar aus an?',
        'Anmeldungen nimmt IGMG Reisen über ihre Regionalstellen und Vertretungen entgegen; für Hessen gibt es eine eigene Regionalstelle. Für Gruppen aus Hessen nennt der aktuelle Flugplan Abflüge ab Frankfurt. Verbindlich sind die Termine, Fristen und Bedingungen auf igmgreisen.com. IGMG Reisen empfiehlt außerdem, vor dem Hadsch an einem Hadsch-Seminar in der eigenen Region teilzunehmen.',
        'Zur Vorbereitung auf die Umra bietet die IGMG einen Umra-Begleiter zum Herunterladen an, auf Deutsch, Türkisch, Englisch und Französisch. Bei Fragen {nehmen Sie gern Kontakt mit der Fatih-Moschee Wetzlar auf|/kontakt}.',
        '### Quellen',
        '- {IGMG Reisen: Was ist Hadsch?|reisenWasIstHadsch}',
        '- {IGMG Reisen: Was ist Umra?|reisenWasIstUmra}',
        '- {IGMG Reisen: Hadsch – Termine und Bedingungen|reisenHadsch}',
        '- {IGMG Reisen: Umra – Saisons und Termine|reisenUmra}',
        '- {IGMG Reisen: Regionalstellen|reisenZweigstellen}',
        '- {IGMG: Umra-Begleiter|umreYoldasim}',
        '- {IGMG: Islamische Feste – Zeiten des Gedenkens und Feierns|feste}',
        'Stand der Quellen: 13. Oktober 2026.',
      ]),
      tr: dokument('tr', [
        'Kısaca: Hac, Mekke’ye yapılan büyük ibadet yolculuğudur. İslam’ın beş şartından biridir ve şartlarını taşıyan her Müslümana ömründe bir kez farzdır. Umre ise Kâbe’nin özel olarak ziyaret edilmesidir ve yılın hemen her döneminde yapılabilir. Wetzlar’dan veya Orta Hessen’den İslam Toplumu Millî Görüş (IGMG) ile hacca ya da umreye gitmek isteyenler, IGMG’nin seyahat hizmeti IGMG Hac ve Umre’ye (IGMG Reisen) başvurabilir.',
        '### Hac nedir?',
        'Hac, İslam’ın beş şartından biridir. Hicretin dokuzuncu yılında farz kılındı; bir yıl sonra Hz. Muhammed, Müslümanlarla birlikte bizzat hacca gitti. Bu yolculuk Veda Haccı olarak bilinir. Şartlarını taşıyan kişi haccı ömründe bir kez yerine getirmekle yükümlüdür.',
        '### Hac ne zaman yapılır?',
        'Haccın belirli bir zamanı vardır. IGMG Reisen’in açıklamasına göre Kâbe ve Arafat, 1 Şevval ile 9 Zilhicce arasındaki dönemde ziyaret edilmelidir; Arafat vakfesinin günü 9 Zilhicce’dir. 10 Zilhicce’de başlayan dört günlük Kurban Bayramı, yıllık hac yolculuğunun sonuna denk gelir.',
        '### Umre nedir?',
        'Umre kelime olarak “ziyaret” anlamına gelir; dinî anlamda Kâbe’nin özel bir ziyaretidir. Umre yapan kişi ihrama girer, Kâbe’yi tavaf eder, Safa ile Merve tepeleri arasında sa’y yapar ve son olarak saçlarını tıraş ettirir. Böylece ihramdan çıkar.',
        '### Umre ne zaman yapılabilir?',
        'Umre belirli bir mevsime bağlı değildir. IGMG Reisen’e göre umre yalnızca Arefe gününde ve Kurban Bayramı’nın ilk dört gününde yapılmaz. Ramazan ayında yapılan umre ayrıca faziletli sayılır.',
        '### Hac ile umre arasındaki fark nedir?',
        'Umrede Arafat ve Müzdelife vakfesi, kurban kesimi ve şeytan taşlama yoktur. Bu yüzden umreye “küçük hac”, asıl hacca ise “büyük hac” denir. Hanefî ve Mâlikî mezheplerine göre umre, ömürde bir kez yapılması kuvvetle tavsiye edilen müekked bir sünnettir; Şâfiî ve Hanbelî mezhepleri ise onu farz kabul eder.',
        '### Kimler hacca veya umreye gidebilir?',
        'IGMG Reisen umre için şu şartları sayar: Müslüman, akıllı, ergin ve özgür olmak, sağlıklı olmak ve yolculuğa maddi gücü yetmek; ayrıca yolun güvenli olması gerekir. Hac için de şartlar vardır; bu şartları taşıyan kişiye hac ömründe bir kez farzdır. Şartların sizin durumunuzda yerine gelip gelmediğini en iyi imamla konuşabilirsiniz.',
        '### Wetzlar’dan nasıl kayıt yaptırabilirim?',
        'IGMG Reisen kayıtları bölge temsilcilikleri ve şubeler aracılığıyla alır; Hessen için ayrı bir bölge temsilciliği vardır. Güncel uçuş planında Hessen’den katılanlar için kalkışlar Frankfurt’tan gösteriliyor. Tarihler, son başvuru günleri ve şartlar için igmgreisen.com’daki bilgiler bağlayıcıdır. IGMG Reisen, hacdan önce bölgenizde düzenlenen bir hac seminerine katılmanızı da tavsiye eder.',
        'Umreye hazırlık için IGMG’nin Umre Yoldaşım rehberini indirebilirsiniz; rehber Almanca, Türkçe, İngilizce ve Fransızca olarak yayımlandı. Sorularınız için {Wetzlar Fatih Camii ile iletişime geçebilirsiniz|/tr/iletisim}.',
        '### Kaynaklar',
        '- {IGMG Reisen: Hac nedir?|reisenWasIstHadsch}',
        '- {IGMG Reisen: Umre nedir?|reisenWasIstUmra}',
        '- {IGMG Reisen: hac programı ve şartları|reisenHadsch}',
        '- {IGMG Reisen: umre programı|reisenUmra}',
        '- {IGMG Reisen: temsilcilikler|reisenZweigstellen}',
        '- {IGMG: Umre Yoldaşım|umreYoldasim}',
        '- {IGMG: İslami bayramlar (Almanca)|feste}',
        'Kaynakların durumu: 13 Ekim 2026.',
      ]),
      en: dokument('en', [
        'In short: Hajj, the great pilgrimage to Mecca, is one of the five pillars of Islam and an obligation once in a lifetime for every Muslim who meets its conditions. Umrah is a visit to the Kaaba that can be made at almost any time of the year. Anyone in Wetzlar or Central Hesse who wishes to go on pilgrimage with the Islamic Community Millî Görüş (IGMG) can turn to IGMG Reisen, its Hajj and Umrah travel service.',
        '### What is Hajj?',
        'Hajj is one of the five pillars of Islam. It became obligatory in the ninth year after the Hijrah; a year later the Prophet Muhammad performed the pilgrimage himself together with the Muslims, a journey known as the Farewell Pilgrimage. Anyone who meets the conditions must perform Hajj once in their life.',
        '### When does Hajj take place?',
        'Hajj has a fixed time. According to IGMG Reisen, the Kaaba and Arafat must be visited in the period from 1 Shawwal to 9 Dhul Hijjah; 9 Dhul Hijjah is the day of standing at Arafat. The four-day Eid al-Adha (Kurban Bayramı) begins on 10 Dhul Hijjah and coincides with the end of the annual pilgrimage.',
        '### What is Umrah?',
        'The word Umrah means “visit”; in the religious sense it is a special visit to the Kaaba. Pilgrims enter the state of consecration (ihram), walk around the Kaaba (tawaf), go back and forth between the hills of Safa and Marwa (sa’y) and finally have their hair shaved. This ends the state of ihram.',
        '### When can Umrah be performed?',
        'Umrah is not tied to a season. According to IGMG Reisen, the only exceptions are the Day of Arafat and the first four days of Eid al-Adha. An Umrah during Ramadan is considered especially recommended.',
        '### How do Hajj and Umrah differ?',
        'Umrah does not include the stay at Arafat and Muzdalifa, the sacrifice or the symbolic stoning. This is why it is also called the “lesser Hajj”, while Hajj itself is the “greater Hajj”. In the Hanafi and Maliki schools, Umrah is a strongly recommended sunnah to be performed once in a lifetime; the Shafi’i and Hanbali schools regard it as obligatory.',
        '### Who can go on pilgrimage?',
        'For Umrah, IGMG Reisen lists these conditions: being Muslim, of sound mind, of age, free, healthy and financially able to travel, and the route must be safe. Hajj also has conditions; whoever meets them is obliged to perform it once in their life. Whether they apply in your case is best discussed with the imam.',
        '### How do I register from Wetzlar?',
        'IGMG Reisen takes registrations through its regional offices and branches; there is a separate regional office for Hesse. The current flight schedule lists departures from Frankfurt for groups from Hesse. Dates, deadlines and conditions are binding only as published on igmgreisen.com, which is available in German and Turkish. Before Hajj, IGMG Reisen also recommends attending a Hajj seminar in your region.',
        'To prepare for Umrah, IGMG offers an Umrah guide to download in German, Turkish, English and French. If you have any questions, {please contact Fatih Mosque Wetzlar|/en/contact}.',
        '### Sources',
        '- {IGMG Reisen: What is Hajj? (in German)|reisenWasIstHadsch}',
        '- {IGMG Reisen: What is Umrah? (in German)|reisenWasIstUmra}',
        '- {IGMG Reisen: Hajj dates and conditions (in German)|reisenHadsch}',
        '- {IGMG Reisen: Umrah seasons and dates (in German)|reisenUmra}',
        '- {IGMG Reisen: regional offices (in German)|reisenZweigstellen}',
        '- {IGMG: Umrah guide|umreYoldasim}',
        '- {IGMG: Islamic festivals (in German)|feste}',
        'Sources as of 13 October 2026.',
      ]),
    },
  },
  {
    slug: 'islamic-calendar',
    sortierung: 14,
    titel: {
      de: 'Islamischer Kalender, Feste und gesegnete Nächte',
      tr: 'İslami takvim, bayramlar ve mübarek geceler',
      en: 'Islamic calendar, festivals and blessed nights',
    },
    kurztext: {
      de: 'Der islamische Kalender folgt dem Mond und zählt die Jahre ab der Hidschra. Ein Monat beginnt, wenn die neue Mondsichel sichtbar ist; die IGMG legt den Beginn nach einem Beschluss ihres Gelehrtenrats fest. Dazu die Feste und gesegneten Nächte im Überblick.',
      tr: 'İslami takvim aya göre işler ve yılları hicretten itibaren sayar. Yeni ay, hilal görüldüğünde başlar; IGMG ayın başlangıcını Din İstişare Kurulu’nun kararına göre belirler. Bayramlar ve mübarek geceler de burada kısaca anlatılıyor.',
      en: 'The Islamic calendar follows the moon and counts its years from the Hijrah. A month begins when the new crescent is visible; IGMG sets the start according to a decision of its council of scholars. Here is an overview of the festivals and blessed nights.',
    },
    inhalt: {
      de: dokument('de', [
        'Kurz gesagt: Der islamische Kalender ist ein Mondkalender. Er zählt die Jahre ab der Hidschra, der Auswanderung des Propheten Muhammad von Mekka nach Medina im Jahr 622. Nach ihm richten sich das Fasten im Ramadan, der Hadsch, die Zakat, die Fitra und die Festtage. Weil er dem Mond folgt, wandern Ramadan und Feste von Jahr zu Jahr durch den gewohnten Kalender.',
        '### Wann beginnt ein islamischer Monat?',
        'Ein Monat beginnt, sobald nach Sonnenuntergang die neue Mondsichel über dem westlichen Horizont zu sehen ist. Er endet, wenn die nächste Sichel gesichtet wird.',
        '### Wie legt die IGMG den Monatsbeginn fest?',
        'Die IGMG folgt einem Beschluss ihres Gelehrtenrats, den sie 2013 veröffentlicht hat. Er beruht auf Beschlüssen des Europäischen Rates für Fatwa und Forschung (ECFR) von 1999 in Köln und 2009 in Istanbul sowie auf einer Versammlung in der IGMG-Zentrale im Jahr 2008. Die wichtigsten Regeln:',
        '- Maßgeblich ist, dass die Mondsichel gesichtet wird – mit bloßem Auge oder mit einem Teleskop.',
        '- Eine Sichtung muss durch astronomische Berechnungen gestützt sein.',
        '- Als sichtbar gilt die Sichel nur, wenn ihr Abstand zur Sonne nach der Konjunktion mehr als 8 Grad beträgt und sie nach Sonnenuntergang mindestens 5 Grad über dem Horizont steht.',
        '- Ein bestimmter Ort ist nicht vorgeschrieben: Es reicht, wenn die Sichel irgendwo auf der Welt gesehen wird.',
        'Die Termine des jeweiligen Jahres gibt die IGMG bekannt. Die Daten im {Kalender der Fatih-Moschee Wetzlar|/kalender} sind vorausberechnet und gelten als vorläufig, bis sie bestätigt sind.',
        '### Welche Feste gibt es?',
        'Das wichtigste Fest ist das Kurbanfest (Opferfest, türkisch Kurban Bayramı). Es dauert vier Tage, beginnt am 10. Zulhidscha, dem zwölften Monat, und schließt die jährliche Pilgerfahrt ab. Wer es sich leisten kann, opfert ein Tier und teilt das Fleisch mit Bedürftigen.',
        'Das zweite große Fest ist das Ramadanfest (türkisch Ramazan Bayramı) am 1. Schawwal, dem zehnten Monat. Zum Auftakt beten die Gläubigen gemeinsam in der Moschee das Festgebet; danach treffen sich Familien und Freunde, die Kinder werden beschenkt und Ältere besucht.',
        '### Was sind die gesegneten Nächte?',
        'Die gesegneten Nächte (türkisch Kandil) liegen in den drei Monaten Radschab, Schaban und Ramadan. Muslime kommen dann schon am Abend in der Moschee zusammen, beten gemeinsam, lesen im Koran und gedenken Allahs (Zikr). Jede dieser Nächte beginnt am Abend vor dem genannten Tag.',
        '- Regaib-Nacht: die Nacht zum ersten Freitag im Radschab, also von Donnerstag auf Freitag',
        '- Miradsch-Nacht: die Nacht zum 27. Radschab',
        '- Berat-Nacht: die Nacht vom 14. auf den 15. Schaban',
        '- Kadr-Nacht: die Nacht zum 27. Ramadan, in der Muslime der Herabsendung der ersten Koranverse gedenken',
        'Gedenktage sind außerdem der Geburtstag des Propheten (Mevlid) und der Aschura-Tag am 10. Muharram, dem ersten Monat des islamischen Jahres.',
        '### Quellen',
        '- {IGMG: Islamische Feste – Zeiten des Gedenkens und Feierns|feste}',
        '- {Beschluss des IGMG-Gelehrtenrates zur Sichtung des Neumondes (2013)|gelehrtenratHilal}',
        '- {Freitagspredigt: Die Hidschra und das neue Mondjahr (2005)|hidschraNeujahr}',
        '- {Freitagspredigt: Die gesegneten drei Monate und die Regaib-Nacht (2015)|regaib}',
        '- {Freitagspredigt: Der Miradsch (2014)|miradsch}',
        '- {Freitagspredigt: Die Berat-Nacht (2014)|berat}',
        '- {IGMG: Ramadan – die Zeit der Besinnung|ramadanBesinnung}',
        'Stand der Quellen: 13. Oktober 2026.',
      ]),
      tr: dokument('tr', [
        'Kısaca: İslami takvim bir ay takvimidir. Yılları, Hz. Muhammed’in 622 yılında Mekke’den Medine’ye hicretinden itibaren sayar. Ramazan orucu, hac, zekât, fitre ve bayramlar bu takvime göre belirlenir. Ay takvimine dayandığı için Ramazan ve bayramlar her yıl alışılmış takvimde başka günlere denk gelir.',
        '### İslami bir ay ne zaman başlar?',
        'Bir ay, güneş battıktan sonra yeni hilal batı ufkunda görüldüğünde başlar ve bir sonraki hilal görülünce sona erer.',
        '### IGMG ayın başlangıcını nasıl belirler?',
        'IGMG, Din İstişare Kurulu’nun 2013’te yayımladığı bir karara uyar. Bu karar, Avrupa Fetva ve Araştırma Konseyi’nin (ECFR) 1999’da Köln’de ve 2009’da İstanbul’da aldığı kararlara ve 2008’de IGMG genel merkezinde yapılan bir toplantıya dayanır. En önemli kurallar:',
        '- Belirleyici olan hilalin görülmesidir; çıplak gözle ya da teleskopla.',
        '- Görüldüğü bildirilen hilal astronomik hesaplarla da desteklenmelidir.',
        '- Hilal ancak kavuşumdan sonra güneşe uzaklığı 8 dereceyi aşıyorsa ve güneş battıktan sonra ufkun en az 5 derece üzerindeyse görülebilir kabul edilir.',
        '- Belirli bir yer şart değildir: Hilalin dünyanın herhangi bir yerinde görülmesi yeterlidir.',
        'Her yılın tarihlerini IGMG duyurur. {Wetzlar Fatih Camii’nin takviminde|/tr/takvim} yer alan tarihler önceden hesaplanmıştır ve onaylanana kadar geçici sayılır.',
        '### Hangi bayramlar var?',
        'En önemli bayram Kurban Bayramı’dır. Dört gün sürer, on ikinci ay olan Zilhicce’nin 10’unda başlar ve yıllık hac yolculuğunun sonuna denk gelir. Gücü yeten kurban keser ve etini ihtiyaç sahipleriyle paylaşır.',
        'İkinci büyük bayram, onuncu ay olan Şevval’in 1’inde başlayan Ramazan Bayramı’dır. Bayram, camide birlikte kılınan bayram namazıyla başlar; ardından aileler ve dostlar bir araya gelir, çocuklara hediyeler verilir, büyükler ziyaret edilir.',
        '### Mübarek geceler nelerdir?',
        'Mübarek geceler (kandiller) Recep, Şaban ve Ramazan aylarındadır. Müslümanlar bu gecelerde akşamdan camide toplanır; birlikte namaz kılar, Kur’an okur ve zikreder. Her kandil, belirtilen günden önceki akşam başlar.',
        '- Regaib Kandili: Recep ayının ilk cumasına bağlanan gece, yani perşembeyi cumaya bağlayan gece',
        '- Miraç Kandili: Recep ayının 27’sine bağlanan gece',
        '- Berat Kandili: Şaban ayının 14’ünü 15’ine bağlayan gece',
        '- Kadir Gecesi: Ramazan ayının 27’sine bağlanan gece; Müslümanlar bu gecede Kur’an’ın ilk ayetlerinin indirilişini anar',
        'Bunların yanı sıra Hz. Peygamber’in doğumu (Mevlid) ve İslami yılın ilk ayı olan Muharrem’in 10’undaki Aşure günü de anma günleridir.',
        '### Kaynaklar',
        '- {IGMG: İslami bayramlar (Almanca)|feste}',
        '- {IGMG Din İstişare Kurulu’nun hilal kararı (Almanca, 2013)|gelehrtenratHilal}',
        '- {Cuma hutbesi: Hicret ve yeni hicri yıl (Almanca, 2005)|hidschraNeujahr}',
        '- {Cuma hutbesi: Üç aylar ve Regaib Kandili (Almanca, 2015)|regaib}',
        '- {Cuma hutbesi: Miraç (Almanca, 2014)|miradsch}',
        '- {Cuma hutbesi: Berat Kandili (Almanca, 2014)|berat}',
        '- {IGMG: Ramazan, tefekkür zamanı (Almanca)|ramadanBesinnung}',
        'Kaynakların durumu: 13 Ekim 2026.',
      ]),
      en: dokument('en', [
        'In short: the Islamic calendar is a lunar calendar. It counts its years from the Hijrah, the Prophet Muhammad’s emigration from Mecca to Medina in 622. Fasting in Ramadan, Hajj, Zakat, Fitra and the festival days all follow this calendar. Because it follows the moon, Ramadan and the festivals move through the usual calendar from year to year.',
        '### When does an Islamic month begin?',
        'A month begins as soon as the new crescent can be seen above the western horizon after sunset, and it ends when the next crescent is sighted.',
        '### How does IGMG set the start of a month?',
        'IGMG follows a decision of its council of scholars published in 2013. It is based on decisions of the European Council for Fatwa and Research (ECFR) taken in Cologne in 1999 and in Istanbul in 2009, and on a meeting at IGMG’s headquarters in 2008. The main rules:',
        '- What counts is that the crescent is sighted, with the naked eye or a telescope.',
        '- A reported sighting must be supported by astronomical calculations.',
        '- The crescent only counts as visible if, after the conjunction, its distance from the sun exceeds 8 degrees and it stands at least 5 degrees above the horizon after sunset.',
        '- No particular place is required: it is enough for the crescent to be seen anywhere in the world.',
        'IGMG announces the dates for each year. The dates in the {calendar of Fatih Mosque Wetzlar|/en/calendar} are calculated in advance and remain provisional until they are confirmed.',
        '### Which festivals are there?',
        'The most important festival is Eid al-Adha (Kurban Bayramı). It lasts four days, begins on 10 Dhul Hijjah, the twelfth month, and coincides with the end of the annual pilgrimage. Those who can afford it sacrifice an animal and share the meat with people in need.',
        'The second major festival is Eid al-Fitr (Ramazan Bayramı) on 1 Shawwal, the tenth month. It opens with the festival prayer said together in the mosque; afterwards families and friends meet, children receive presents and older relatives are visited.',
        '### What are the blessed nights?',
        'The blessed nights (Kandil in Turkish) fall in the three months of Rajab, Sha’ban and Ramadan. On these nights Muslims gather in the mosque from the evening, pray together, read the Quran and remember Allah (dhikr). Each of these nights begins on the evening before the date given.',
        '- Night of Raghaib: the night before the first Friday of Rajab, i.e. from Thursday to Friday',
        '- Night of the Ascension (Mi’raj): the night before 27 Rajab',
        '- Night of Bara’ah (Berat): the night from 14 to 15 Sha’ban',
        '- Night of Power (Qadr): the night before 27 Ramadan, when Muslims remember the revelation of the first verses of the Quran',
        'Days of remembrance also include the Prophet’s birthday (Mawlid) and the day of Ashura on 10 Muharram, the first month of the Islamic year.',
        '### Sources',
        '- {IGMG: Islamic festivals (in German)|feste}',
        '- {IGMG council of scholars: decision on sighting the new moon (in German, 2013)|gelehrtenratHilal}',
        '- {Friday sermon: The Hijrah and the new lunar year (in German, 2005)|hidschraNeujahr}',
        '- {Friday sermon: The three blessed months and the Night of Raghaib (in German, 2015)|regaib}',
        '- {Friday sermon: The Mi’raj (in German, 2014)|miradsch}',
        '- {Friday sermon: The Night of Bara’ah (in German, 2014)|berat}',
        '- {IGMG: Ramadan, a time of reflection (in German)|ramadanBesinnung}',
        'Sources as of 13 October 2026.',
      ]),
    },
  },
  {
    slug: 'zakat-fitra-qurban',
    sortierung: 15,
    titel: { de: 'Zakat, Fitra, Fidya und Kurban', tr: 'Zekât, fitre, fidye ve kurban', en: 'Zakat, Fitra, Fidya and Qurban' },
    kurztext: {
      de: 'Zakat ist die jährliche Pflichtabgabe auf Vermögen, Fitra die Gabe vor dem Ramadanfest, Fidya der Ausgleich für Fastentage, die jemand wegen Krankheit nicht nachholen kann, und Kurban das Opfer zum Kurbanfest. Die Beträge gibt die IGMG bekannt.',
      tr: 'Zekât, mal üzerinden verilen yıllık bir farzdır; fitre Ramazan Bayramı’ndan önce verilir, fidye hastalık nedeniyle kaza edilemeyen oruçların karşılığıdır, kurban ise Kurban Bayramı’nda kesilir. Miktarları IGMG duyurur.',
      en: 'Zakat is the yearly obligatory payment on wealth, Fitra the gift before Eid al-Fitr, Fidya the compensation for fasting days that cannot be made up because of illness, and Qurban the sacrifice at Eid al-Adha. IGMG announces the amounts.',
    },
    inhalt: {
      de: dokument('de', [
        'Kurz gesagt: Zakat, Fitra, Fidya und Kurban sind Formen des Gebens, mit denen Muslime Bedürftige unterstützen. Die Zakat beträgt 2,5 Prozent auf Vermögen, das man seit einem Jahr besitzt. Die Fitra wird vor dem Ramadanfest gegeben, die Fidya ersetzt Fastentage, die jemand wegen Krankheit nicht nachholen kann, und das Kurban-Opfer gehört zum Kurbanfest. Spenden dafür nimmt Hasene International entgegen, die Hilfsorganisation, mit der die Islamische Gemeinschaft Millî Görüş (IGMG) weltweit hilft.',
        '### Was ist die Zakat?',
        'Die Zakat ist ein Gottesdienst mit dem eigenen Vermögen. Zu ihr verpflichtet ist, wer erwachsen und bei klarem Verstand ist und nach den religiösen Maßstäben als wohlhabend gilt. Ihr Satz beträgt 2,5 Prozent; er gilt für Vermögen, das man seit mindestens einem Jahr besitzt, samt dem Zuwachs in dieser Zeit.',
        'Wer die Zakat erhalten darf, ist genau geregelt: Die Empfängergruppen nennt der Koran in Sure Tawba (9), Vers 60, und die verlinkte Freitagspredigt der IGMG erläutert sie. Die IGMG rät, Zakat und Fitra über eine Organisation zu geben, damit die Verteilung nach den religiösen Vorgaben gesichert ist. Wie hoch die eigene Zakat ist, lässt sich mit dem {Zakat-Rechner von Hasene|zakatRechner} ermitteln.',
        '### Was ist die Fitra?',
        'Die Fitra ist eine Gabe, die zum Ramadan gehört. Sie wird vor dem Ramadanfest gegeben, damit Bedürftige sie noch für das Fest nutzen können. Wer sie erst nach dem Festgebet gibt, leistet keine Fitra mehr, sondern eine gewöhnliche Spende (Sadaka).',
        '### Was ist die Fidya?',
        'Wer wegen einer Krankheit nicht fasten und die Fastentage auch später nicht nachholen kann, gibt nach der Freitagspredigt der IGMG für jeden dieser Tage eine Fitra oder Fidya.',
        '### Wie hoch sind Fitra und Fidya?',
        'Die Beträge gibt die IGMG bekannt. Wir nennen hier bewusst keine Zahlen, damit keine veralteten Beträge stehen bleiben. Die aktuellen Angaben finden Sie bei {Hasene International|hasene}; Sie können auch in der Fatih-Moschee Wetzlar nachfragen.',
        '### Was ist Kurban?',
        'Kurban ist das Opfer zum Kurbanfest. Wer wohlhabend ist und nicht selbst auf dem Hadsch ist, schlachtet ein Opfertier und verteilt das Fleisch an Bedürftige, Freunde und Bekannte. Das Tier muss bestimmte Anforderungen an Alter und Gesundheit erfüllen; geopfert wird an festgelegten Tagen, die nach dem Festgebet am 10. Zulhidscha beginnen. Viele Muslime in Europa geben ihr Kurban als Spende, die Bedürftigen weltweit zugutekommt.',
        '### Wie spende ich Zakat, Fitra und Kurban?',
        'Diese Spenden nimmt {Hasene International|hasene} entgegen. Wichtig: Sie gehen nicht an die Fatih-Moschee Wetzlar. Wer die Gemeinde in Wetzlar unterstützen möchte, findet die Möglichkeiten auf unserer {Spendenseite|/spenden}.',
        '### Quellen',
        '- {Freitagspredigt: Wer zahlt die Zakat und die Fitra-Abgabe? (2014)|hutbaZakatFitra}',
        '- {Freitagspredigt: Kurban und das Kurbanfest (2013)|hutbaKurban}',
        '- {IGMG: Islamische Feste – Zeiten des Gedenkens und Feierns|feste}',
        '- {Hasene International|hasene}',
        '- {Zakat-Rechner von Hasene|zakatRechner}',
        'Stand der Quellen: 13. Oktober 2026 (Hasene: 27. Oktober 2026).',
      ]),
      tr: dokument('tr', [
        'Kısaca: Zekât, fitre, fidye ve kurban, Müslümanların ihtiyaç sahiplerine destek olduğu verme biçimleridir. Zekât, bir yıldır sahip olunan malın yüzde 2,5’idir. Fitre Ramazan Bayramı’ndan önce verilir; fidye, hastalık nedeniyle kaza edilemeyen oruçların yerine geçer; kurban ise Kurban Bayramı’na aittir. Bu bağışları, İslam Toplumu Millî Görüş’ün (IGMG) dünya çapında yardım ettiği insani yardım kuruluşu Hasene International kabul eder.',
        '### Zekât nedir?',
        'Zekât, mal ile yapılan bir ibadettir. Ergin ve akıllı olup dinî ölçülere göre zengin sayılan kişiye farzdır. Oranı yüzde 2,5’tir; en az bir yıldır sahip olunan mal ile bu süre içindeki artışı için verilir.',
        'Zekâtın kimlere verilebileceği açıkça belirlenmiştir: Zekât alabilecek grupları Kur’an, Tevbe suresinin (9) 60. ayetinde sayar; IGMG’nin bağlantısı verilen cuma hutbesi bu grupları açıklar. IGMG, dağıtımın dinî esaslara uygun yapılması için zekât ve fitrenin bir kuruluş aracılığıyla verilmesini tavsiye eder. Kendi zekâtınızı {Hasene’nin zekât hesaplayıcısıyla (Almanca)|zakatRechner} hesaplayabilirsiniz.',
        '### Fitre nedir?',
        'Fitre, Ramazan’a bağlı bir sadakadır. İhtiyaç sahiplerinin bayramda kullanabilmesi için Ramazan Bayramı’ndan önce verilir. Bayram namazından sonra verilirse artık fitre sayılmaz, sıradan bir sadaka olur.',
        '### Fidye nedir?',
        'IGMG’nin cuma hutbesine göre hastalık nedeniyle oruç tutamayan ve tutamadığı günleri daha sonra da kaza edemeyecek olan kişi, her gün için bir fitre veya fidye verir.',
        '### Fitre ve fidye ne kadardır?',
        'Miktarları IGMG duyurur. Eskimiş rakamlar kalmasın diye burada bilerek tutar vermiyoruz. Güncel bilgileri {Hasene International’da (Almanca)|hasene} bulabilir ya da Wetzlar Fatih Camii’ne sorabilirsiniz.',
        '### Kurban nedir?',
        'Kurban, Kurban Bayramı’nda kesilen hayvandır. Varlıklı olup o yıl hacda bulunmayan Müslüman bir kurban keser ve etini ihtiyaç sahipleri, dostları ve tanıdıklarıyla paylaşır. Hayvanın yaş ve sağlık bakımından belirli şartları taşıması gerekir; kurban, 10 Zilhicce’deki bayram namazından sonra başlayan belirli günlerde kesilir. Avrupa’daki pek çok Müslüman kurbanını bağış olarak verir ve böylece dünyanın dört bir yanındaki ihtiyaç sahiplerine ulaştırır.',
        '### Zekât, fitre ve kurban bağışını nasıl yapabilirim?',
        'Bu bağışları {Hasene International (Almanca)|hasene} kabul eder. Önemli: Bu bağışlar Wetzlar Fatih Camii’ne gitmez. Wetzlar’daki cemaatimizi desteklemek isteyenler yollarını {bağış sayfamızda|/tr/bagis} bulabilir.',
        '### Kaynaklar',
        '- {Cuma hutbesi: Zekâtı ve fitreyi kim verir? (Almanca, 2014)|hutbaZakatFitra}',
        '- {Cuma hutbesi: Kurban ve Kurban Bayramı (Almanca, 2013)|hutbaKurban}',
        '- {IGMG: İslami bayramlar (Almanca)|feste}',
        '- {Hasene International (Almanca)|hasene}',
        '- {Hasene: zekât hesaplayıcı (Almanca)|zakatRechner}',
        'Kaynakların durumu: 13 Ekim 2026 (Hasene: 27 Ekim 2026).',
      ]),
      en: dokument('en', [
        'In short: Zakat, Fitra, Fidya and Qurban are forms of giving through which Muslims support people in need. Zakat amounts to 2.5 percent of wealth that has been owned for a year. Fitra is given before Eid al-Fitr, Fidya replaces fasting days that someone cannot make up because of illness, and the Qurban sacrifice belongs to Eid al-Adha. Donations for all of these are accepted by Hasene International, the aid organisation through which the Islamic Community Millî Görüş (IGMG) helps worldwide.',
        '### What is Zakat?',
        'Zakat is an act of worship performed with one’s wealth. It is obligatory for anyone who is adult, of sound mind and wealthy by religious standards. The rate is 2.5 percent and applies to wealth owned for at least one year, including what it has grown by in that time.',
        'Who may receive Zakat is clearly defined: the Quran names the groups of recipients in Surah at-Tawbah (9), verse 60, and the linked IGMG Friday sermon explains them. IGMG advises giving Zakat and Fitra through an organisation so that distribution follows the religious rules. You can work out your own Zakat with the {Hasene Zakat calculator (in German)|zakatRechner}.',
        '### What is Fitra?',
        'Fitra is a charitable gift linked to Ramadan. It is given before Eid al-Fitr so that people in need can still use it for the festival. Given only after the Eid prayer, it no longer counts as Fitra but as ordinary charity (sadaqa).',
        '### What is Fidya?',
        'According to the IGMG Friday sermon, anyone who cannot fast because of illness and will not be able to make up the days later gives a Fitra or Fidya for each of those days.',
        '### How much are Fitra and Fidya?',
        'IGMG announces the amounts. We deliberately do not give figures here so that no outdated amounts remain on this page. You can find the current figures at {Hasene International (in German)|hasene} or ask at Fatih Mosque Wetzlar.',
        '### What is Qurban?',
        'Qurban is the sacrifice at Eid al-Adha. Muslims who are well off and are not on Hajj themselves sacrifice an animal and share the meat with people in need, friends and acquaintances. The animal must meet certain requirements of age and health, and the sacrifice takes place on set days that begin after the Eid prayer on 10 Dhul Hijjah. Many Muslims in Europe give their Qurban as a donation that reaches people in need worldwide.',
        '### How do I donate Zakat, Fitra and Qurban?',
        'These donations are accepted by {Hasene International (in German)|hasene}. Please note: they do not go to Fatih Mosque Wetzlar. If you would like to support the community in Wetzlar, you will find the ways to do so on our {donations page|/en/donate}.',
        '### Sources',
        '- {Friday sermon: Who pays Zakat and Fitra? (in German, 2014)|hutbaZakatFitra}',
        '- {Friday sermon: Qurban and Eid al-Adha (in German, 2013)|hutbaKurban}',
        '- {IGMG: Islamic festivals (in German)|feste}',
        '- {Hasene International (in German)|hasene}',
        '- {Hasene Zakat calculator (in German)|zakatRechner}',
        'Sources as of 13 October 2026 (Hasene: 27 October 2026).',
      ]),
    },
  },
  {
    slug: 'friday-prayer',
    sortierung: 16,
    titel: { de: 'Freitagsgebet und Freitagspredigt', tr: 'Cuma namazı ve cuma hutbesi', en: 'Friday prayer and Friday sermon' },
    kurztext: {
      de: 'Das Freitagsgebet ist das wöchentliche Gemeinschaftsgebet in der Moschee, das ein Imam leitet; dazu gehört die Freitagspredigt (Hutba). Die IGMG gibt jede Woche eine Predigt heraus, zum Nachlesen auf Deutsch, Türkisch, Englisch und in weiteren Sprachen.',
      tr: 'Cuma namazı, her hafta camide bir imamın kıldırdığı cemaat namazıdır; cuma hutbesi de buna dâhildir. IGMG her hafta bir hutbe yayımlar; hutbeyi Türkçe, Almanca, İngilizce ve başka dillerde okuyabilirsiniz.',
      en: 'Friday prayer is the weekly congregational prayer in the mosque, led by an imam and including the Friday sermon (khutbah). IGMG publishes a sermon every week that you can read in German, Turkish, English and other languages.',
    },
    inhalt: {
      de: dokument('de', [
        'Kurz gesagt: Zum Freitagsgebet kommen Muslime jede Woche am Freitag gemeinsam in der Moschee zusammen. Ein Imam leitet das Gebet und hält dabei eine Predigt, die Hutba. Die Islamische Gemeinschaft Millî Görüş (IGMG) veröffentlicht jede Woche eine Freitagspredigt, die man in mehreren Sprachen nachlesen kann.',
        '### Was ist das Freitagsgebet?',
        'Neben den fünf täglichen Gebeten gibt es Gebete für besondere Anlässe: jede Woche das Freitagsgebet, im Ramadan das Tarawih und zweimal im Jahr das Festgebet. Diese Gebete verrichten die Gläubigen gemeinsam in der Moschee, und ein Imam leitet sie. Der Imam ist zugleich Lehrer, Berater und Seelsorger der Gemeinde.',
        '### Was ist die Hutba?',
        'Die Hutba (türkisch hutbe) ist die Predigt beim Freitagsgebet. Sie greift Fragen des Glaubens und des Alltags auf. In den Predigten der IGMG ging es im Herbst 2026 zum Beispiel um Verantwortung in den sozialen Medien, um barmherziges Wirtschaften und um Gerechtigkeit in der Erziehung.',
        '### Wo finde ich die Freitagspredigt der IGMG?',
        'Die IGMG veröffentlicht ihre Freitagspredigt jede Woche mit Datum auf ihrer {Seite der Freitagspredigten|freitagspredigt}. Meist gibt es dazu Fassungen zum Herunterladen auf Deutsch, Türkisch, Englisch, Arabisch, Niederländisch, Französisch, Schwedisch und Dänisch. Auf Türkisch und Englisch erscheint die Predigt außerdem auf den Sprachseiten der IGMG.',
        '### Wo kann ich in Wetzlar zum Freitagsgebet gehen?',
        'In der Fatih-Moschee Wetzlar kommen die Gläubigen freitags zum gemeinsamen Gebet zusammen. Die täglichen Gebetszeiten für Wetzlar finden Sie unter {Gebetszeiten|/gebetszeiten}. Wann das Freitagsgebet beginnt, erfahren Sie bei der Gemeinde ({Kontakt|/kontakt}).',
        '### Quellen',
        '- {IGMG: Freitagspredigten|freitagspredigt}',
        '- {Beispiel: Rechte und Pflichten in sozialen Medien (veröffentlicht am 8. Oktober 2026)|hutbaSozialeMedien}',
        '- {IGMG: Islam – schnell erklärt|islamSchnellErklaert}',
        'Stand der Quellen: 13. Oktober 2026.',
      ]),
      tr: dokument('tr', [
        'Kısaca: Müslümanlar her hafta cuma günü cuma namazı için camide bir araya gelir. Namazı bir imam kıldırır; imam ayrıca hutbe denen bir konuşma yapar. İslam Toplumu Millî Görüş (IGMG) her hafta bir cuma hutbesi yayımlar; bu hutbe birçok dilde okunabilir.',
        '### Cuma namazı nedir?',
        'Beş vakit namazın yanı sıra özel vesilelerle kılınan namazlar da vardır: her hafta cuma namazı, Ramazan’da teravih ve yılda iki kez bayram namazı. Bu namazlar camide cemaatle kılınır ve bir imam tarafından kıldırılır. İmam aynı zamanda cemaatin öğretmeni, danışmanı ve manevi rehberidir.',
        '### Hutbe nedir?',
        'Hutbe, cuma namazında yapılan vaazdır. İman ve günlük hayatla ilgili konuları ele alır. IGMG’nin 2026 sonbaharındaki hutbelerinde örneğin sosyal medyada kul hakkı, infak ve çocuk eğitiminde adalet ile merhamet konuları işlendi.',
        '### IGMG’nin cuma hutbesini nerede bulabilirim?',
        'IGMG cuma hutbesini her hafta tarihiyle birlikte {Türkçe sayfasında|freitagspredigt} yayımlar. Genellikle hutbenin Almanca, Türkçe, İngilizce, Arapça, Felemenkçe, Fransızca, İsveççe ve Danca indirilebilir sürümleri de bulunur. Almanca hutbeler IGMG’nin Almanca sitesinde yer alır.',
        '### Wetzlar’da cuma namazını nerede kılabilirim?',
        'Wetzlar Fatih Camii’nde cemaat cuma günleri birlikte namaz kılmak için bir araya gelir. Wetzlar için günlük namaz vakitlerini {Namaz Vakitleri|/tr/namaz-vakitleri} sayfasında bulabilirsiniz. Cuma namazının saatini cemaatimizden öğrenebilirsiniz ({İletişim|/tr/iletisim}).',
        '### Kaynaklar',
        '- {IGMG: cuma hutbeleri|freitagspredigt}',
        '- {Örnek: Sosyal medyada kul hakkı (8 Ekim 2026’da yayımlandı)|hutbaSozialeMedien}',
        '- {IGMG: Kısaca İslam (Almanca)|islamSchnellErklaert}',
        'Kaynakların durumu: 13 Ekim 2026.',
      ]),
      en: dokument('en', [
        'In short: every Friday, Muslims come together in the mosque for the Friday prayer. An imam leads the prayer and also gives a sermon, the khutbah. The Islamic Community Millî Görüş (IGMG) publishes a Friday sermon every week that can be read in several languages.',
        '### What is the Friday prayer?',
        'Besides the five daily prayers there are prayers for special occasions: the Friday prayer every week, tarawih during Ramadan and the festival prayer twice a year. Believers perform these prayers together in the mosque, led by an imam. The imam is also the community’s teacher, adviser and pastoral carer.',
        '### What is the khutbah?',
        'The khutbah (hutbe in Turkish) is the sermon at the Friday prayer. It deals with questions of faith and everyday life. In autumn 2026, for example, IGMG’s sermons covered responsibility on social media, spending and sharing with mercy, and justice in raising children.',
        '### Where can I read IGMG’s Friday sermon?',
        'IGMG publishes its Friday sermon every week with its date on its {English pages|freitagspredigt}. There are usually downloadable versions in German, Turkish, English, Arabic, Dutch, French, Swedish and Danish. German sermons appear on IGMG’s German website.',
        '### Where can I attend Friday prayer in Wetzlar?',
        'At Fatih Mosque Wetzlar, the community gathers on Fridays to pray together. You will find the daily prayer times for Wetzlar on the {prayer times|/en/prayer-times} page. To find out when Friday prayer begins, please ask the community ({contact|/en/contact}).',
        '### Sources',
        '- {IGMG: Friday sermons|freitagspredigt}',
        '- {Example: The rights of others on social media (published 8 October 2026)|hutbaSozialeMedien}',
        '- {IGMG: Islam explained in brief (in German)|islamSchnellErklaert}',
        'Sources as of 13 October 2026.',
      ]),
    },
  },
];

/** Quellenvermerk (Spalte `quelle`): Herkunft, alle verlinkten Adressen aus allen Sprachen, Stand. */
export function entwurfQuelle(e: WissenEntwurf): string {
  const adressen = [...new Set(SPRACHEN.flatMap((s) => linkZiele(e.inhalt[s]).filter((h) => h.startsWith('https://'))))];
  return `${KI_ENTWURF_VERFASSER}, eigenständig formuliert aus: ${adressen.join(' ')} – Stand ${ENTWURF_STAND.crawl} (Crawl), ${ENTWURF_STAND.netzwerk} (Netzwerk-Ziele)`;
}

/** Tabellenzeile eines Entwurfs: veröffentlicht, „zur Prüfung“, Verfasser KI-Entwurf, als Beispielinhalt gekennzeichnet. */
export function entwurfZeile(e: WissenEntwurf): typeof schema.wissenThema.$inferInsert {
  return {
    slug: e.slug,
    status: 'veroeffentlicht',
    freigabe: 'zur_pruefung',
    verfasstVon: KI_ENTWURF_VERFASSER,
    istBeispiel: true,
    quelle: entwurfQuelle(e),
    // Wie der Bestand (wissen.ts): einheitliche Kategorie „thema“
    kategorie: 'thema',
    titel: e.titel,
    kurztext: e.kurztext,
    inhalt: e.inhalt,
    klartext: wissenKlartext({ titel: e.titel, kurztext: e.kurztext, inhalt: e.inhalt }),
    sortierung: e.sortierung,
  };
}

/**
 * Schlüssel des Merkers in `einstellung` (Nachtrag ADR 0019 vom 28.10.2026), Wert `{ slugs: [...] }`: Slugs der KI-Entwürfe,
 * die diese Datenbank je bekommen hat.
 */
export const ENTWURF_MERKER = 'wissen_entwuerfe_angelegt';

const merker = z.object({ slugs: z.array(z.string()) });

/** Datenbank oder offene Transaktion (Seed, Stand-Migration). */
type Schreiber = Pick<Transaktion, 'select' | 'insert'>;

/** Ein wirklich eingefügtes Thema (`returning`). */
export type NeuerEntwurf = { id: string; slug: string };

/**
 * Legt die Entwürfe mit diesen Slugs an – Themen mit gleichem Slug bleiben unverändert (onConflictDoNothing) –, dazu je
 * neuem Thema den Antrag „zur Prüfung“ im Freigabe-Verlauf (Warteschlange und Cockpit) und die erste Fassung als Revision
 * (der KI-Stand bleibt nach Änderungen abrufbar). Rückgabe: die wirklich eingefügten Themen.
 */
export async function legeEntwuerfeAn(db: Schreiber, slugs: readonly string[]): Promise<NeuerEntwurf[]> {
  const auswahl = WISSEN_ENTWUERFE.filter((e) => slugs.includes(e.slug));
  if (!auswahl.length) return [];
  const neu = await db
    .insert(schema.wissenThema)
    .values(auswahl.map(entwurfZeile))
    .onConflictDoNothing({ target: schema.wissenThema.slug })
    .returning({ id: schema.wissenThema.id, slug: schema.wissenThema.slug });
  if (!neu.length) return [];
  await db.insert(schema.freigabe).values(
    neu.map((t) => ({
      inhaltTyp: 'wissen_thema',
      inhaltId: t.id,
      art: 'religioes' as const,
      status: 'zur_pruefung' as const,
      kommentar: KI_ENTWURF_VERMERK,
    })),
  );
  await db.insert(schema.revision).values(
    neu.map((t) => {
      const e = WISSEN_ENTWUERFE.find((x) => x.slug === t.slug)!;
      return {
        inhaltTyp: 'wissen_thema',
        inhaltId: t.id,
        inhalt: {
          slug: e.slug,
          titel: e.titel,
          kurztext: e.kurztext,
          inhalt: e.inhalt,
          status: 'veroeffentlicht',
          freigabe: 'zur_pruefung',
        },
        erstelltVon: null,
        kommentar: KI_ENTWURF_VERFASSER,
      };
    }),
  );
  return neu;
}

/**
 * Slugs, die die Stand-Migration vor dem Merker schon angelegt hat: Audit `inhalt.angelegt` mit `details.migration` und
 * `details.slug` (nur sie schreibt diese Angaben). So bleibt auch ein Entwurf gelöscht, den die Redaktion vor dem Merker
 * endgültig gelöscht hat.
 */
async function vonDerMigrationAngelegt(db: Pick<Transaktion, 'select'>, slugs: readonly string[]): Promise<string[]> {
  const a = schema.auditEintrag;
  const slug = sql<string>`${a.details}->>'slug'`;
  const zeilen = await db
    .select({ slug })
    .from(a)
    .where(
      and(eq(a.aktion, 'inhalt.angelegt'), eq(a.zielTyp, 'wissen_thema'), isNotNull(sql`${a.details}->>'migration'`), inArray(slug, slugs)),
    );
  return zeilen.map((z) => z.slug);
}

/**
 * Fehlende Entwürfe einmal je Datenbank anlegen (Seed `db:seed` und Stand-Migration `inhalte-marktstart`): angelegt wird
 * nur ein Slug, der fehlt UND nicht im Merker `ENTWURF_MERKER` steht. Ein Thema, das die Redaktion endgültig gelöscht hat
 * (Verwaltung oder Leerung des Papierkorbs), kommt so mit dem nächsten Bau nicht zurück (ADR 0047 Nr. 4). Danach gilt:
 * Merker = bisheriger Merker ∪ vorhandene ∪ neu angelegte Slugs. Bestand ohne Merker (vor dem 28.10.2026 angelegt): Als
 * schon angelegt gelten die vorhandenen Slugs und die, die die Stand-Migration laut Audit angelegt hat. Aufrufer laufen in
 * einer Transaktion unter der Sperre der Inhaltsstände (`sperreInhaltsstaende`). Rückgabe: die wirklich eingefügten Themen.
 */
export async function legeFehlendeEntwuerfeAn(db: Schreiber): Promise<NeuerEntwurf[]> {
  const alle = WISSEN_ENTWUERFE.map((e) => e.slug);
  const [gespeichert] = await db
    .select({ wert: schema.einstellung.wert })
    .from(schema.einstellung)
    .where(eq(schema.einstellung.schluessel, ENTWURF_MERKER))
    .limit(1);
  const vorhanden = (
    await db.select({ slug: schema.wissenThema.slug }).from(schema.wissenThema).where(inArray(schema.wissenThema.slug, alle))
  ).map((z) => z.slug);
  const gelesen = merker.safeParse(gespeichert?.wert);
  const bisher = gelesen.success ? gelesen.data.slugs : [...vorhanden, ...(await vonDerMigrationAngelegt(db, alle))];
  const neu = await legeEntwuerfeAn(
    db,
    alle.filter((s) => !bisher.includes(s) && !vorhanden.includes(s)),
  );
  const slugs = [...new Set([...bisher, ...vorhanden, ...neu.map((t) => t.slug)])];
  if (!gelesen.success || slugs.length !== gelesen.data.slugs.length)
    await db
      .insert(schema.einstellung)
      .values({ schluessel: ENTWURF_MERKER, wert: { slugs } })
      .onConflictDoUpdate({ target: schema.einstellung.schluessel, set: { wert: { slugs }, geaendertAm: new Date() } });
  return neu;
}

/**
 * Seed „wissen-entwuerfe“ (idempotent, einmal je Datenbank): legt die fehlenden Entwürfe an, die diese Datenbank nie bekommen
 * hat (`legeFehlendeEntwuerfeAn`), in einer Transaktion unter der Sperre der Inhaltsstände. Rückgabe: Anzahl neuer Themen.
 */
export const seed: BereichsSeed = (db) =>
  db.transaction(async (tx) => {
    await sperreInhaltsstaende(tx);
    return (await legeFehlendeEntwuerfeAn(tx)).length;
  });
