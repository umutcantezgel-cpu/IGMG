import type { z } from 'zod';
import { schema } from '../../../src/lib/db';
import { schema as inhaltSchema } from '../../../src/lib/validierung/seiteninhalte/igmg';
import type { BereichsSeed } from './typ';

/**
 * Beispielinhalt „igmg“ (Blatt S12, DATEN; Plan Marktstart P1, ADR 0046). Alle Texte eigenständig formuliert (de/tr/en)
 * aus den IGMG-Quellen unter `IGMG_QUELLE` – keine wörtlichen Übernahmen, mit Zustimmung der IGMG (E-044 Nr. 1).
 * Übernommen sind nur Fakten: Kennzahlen laut EN-Broschüre Juni 2026 (TR-Broschüre September 2025 mit denselben Werten),
 * Daten der Geschichte, Gremien laut Satzung (Stand 02.11.2025), Zentralkontakt laut Impressum. Die früheren Werte 518 und
 * 350.000 sind nirgends belegt und entfallen (G-05). Keine Personennamen (G-04); Geschichte ohne Zusammenfassung der
 * politischen Vorgeschichte (nur verlinkt). Religiöses: Die Bedeutung nennt die Suren nur als Fundstelle wie die verlinkte
 * Selbstdarstellung, ohne Verstext (G-06); Bedeutung und Leitbild prüft der Imam (M-101), tr/en die Muttersprachler (M-102).
 */

const IGMG = 'https://www.igmg.org';
/** Broschüren der IGMG: Englisch, 2. Auflage Juni 2026; Türkisch, 5. Auflage September 2025 (Dateipfade ändern sich jährlich, M-107). */
const BROSCHUERE_EN = `${IGMG}/wp-content/uploads/2026/07/english_igmg.pdf`;
const BROSCHUERE_TR = `${IGMG}/wp-content/uploads/2026/04/IGMG_broshure_tr_new.pdf`;

/** Herkunft des Seeds (Spalte `quelle`; Abruf der Crawls 13.10.2026, Prüfung 27.10.2026). */
export const IGMG_QUELLE = [
  `${IGMG}/selbstdarstellung/`,
  `${IGMG}/grundsaetze/`,
  `${IGMG}/vom-samen-zum-baum-historische-entwicklung-und-grundsaetze-der-igmg/`,
  `${IGMG}/struktur-fachvereine-und-kooperationen/`,
  `${IGMG}/satzung/ (Stand 02.11.2025)`,
  `${IGMG}/impressum/`,
  `${BROSCHUERE_EN} (Juni 2026)`,
  `${BROSCHUERE_TR} (September 2025)`,
  'https://www.igmgreisen.com/de/ (Unternehmen seit 2009)',
]
  .join('; ')
  .concat(' – Abruf 13.10.2026, geprüft 27.10.2026; Texte eigenständig formuliert mit Zustimmung der IGMG (E-044, ADR 0046)');

/** Beispielinhalt (Eingabeform des Schemas); exportiert für die Stand-Migration (Welle 3) und die Tests. */
export const IGMG_BEISPIEL: z.input<typeof inhaltSchema> = {
  ueberblick: {
    text: {
      de: 'Die Islamische Gemeinschaft Millî Görüş (IGMG) mit Hauptsitz in Köln ist eine islamische Religionsgemeinschaft. Zu ihr gehört auch die Fatih-Moschee Wetzlar als eine ihrer Moscheegemeinden. In den Gemeinden der IGMG kommen Gebet, religiöse Bildung, Seelsorge und soziale Arbeit unter einem Dach zusammen. Ihr Schwerpunkt liegt in Deutschland; tätig ist die IGMG außerdem in vielen Ländern Europas sowie in Nordamerika, Australien und Asien.',
      tr: 'Genel merkezi Köln’de bulunan İslam Toplumu Millî Görüş (IGMG), İslami bir din cemaatidir. Wetzlar Fatih Camii de IGMG’ye bağlı cami cemiyetlerinden biridir. IGMG cemiyetlerinde namaz, dinî eğitim, manevi rehberlik ve sosyal hizmet aynı çatı altında buluşur. Ağırlık noktası Almanya’dır; IGMG bunun yanında pek çok Avrupa ülkesinde, Kuzey Amerika’da, Avustralya’da ve Asya’da da faaliyet gösterir.',
      en: 'The Islamic Community Millî Görüş (IGMG), headquartered in Cologne, is an Islamic religious community. Fatih Mosque Wetzlar is one of its mosque communities. In IGMG’s local communities, prayer, religious education, pastoral care and social work come together under one roof. Its main focus is Germany, but IGMG is also active in many other European countries as well as in North America, Australia and Asia.',
    },
    auftrag: {
      de: 'Ihr Auftrag: den islamischen Glauben weitergeben und pflegen, ihn im Alltag lebendig halten und die Mitglieder in gesellschaftlichen Fragen vertreten – auch wenn es um ihre Grundrechte geht. Als Teil der weltweiten Umma nimmt die IGMG außerdem Anteil an der Lage von Muslimen in anderen Ländern und hilft, wo sie kann, etwa gemeinsam mit der Hilfsorganisation Hasene International.',
      tr: 'Görevi; İslam inancını aktarmak ve yaşatmak, onu gündelik hayatta canlı tutmak ve üyelerini, temel hakları söz konusu olduğunda da dahil, toplumsal konularda temsil etmektir. Dünya çapındaki ümmetin bir parçası olarak IGMG, başka ülkelerdeki Müslümanların durumunu da yakından takip eder ve elinden geldiğince yardım eder; örneğin birlikte çalıştığı Hasene International aracılığıyla.',
      en: 'Its mission is to pass on and nurture the Islamic faith, keep it alive in everyday life and represent its members on social issues, including their fundamental rights. As part of the worldwide Muslim community (Umma), IGMG also follows the situation of Muslims in other countries and helps where it can, for example together with the relief organization Hasene International.',
    },
  },
  zahlen: {
    moscheen: { wert: 700, art: 'ueber' },
    zweigstellen: { wert: 2500, art: 'rund' },
    // Nicht belegt (früher 350.000): leer und ausgeblendet
    menschenErreicht: '',
    regionen: {
      wert: 44,
      art: 'genau',
      zusatz: { de: 'davon 3 im Aufbau', tr: '3’ü kuruluş aşamasında', en: '3 of them still being set up' },
    },
    mitglieder: { wert: 200000, art: 'rund' },
    mitwirkende: { wert: 20000, art: 'rund' },
    region: { name: 'Hessen', zweigstellen: { wert: 112, art: 'genau' } },
    stand: '2026-06',
    quelle: {
      titel: {
        de: 'IGMG-Broschüre, 2. Auflage (Englisch, Juni 2026)',
        tr: 'IGMG broşürü, 5. baskı (Türkçe, Eylül 2025)',
        en: 'IGMG brochure, 2nd edition (June 2026)',
      },
      url: { de: BROSCHUERE_EN, tr: BROSCHUERE_TR, en: BROSCHUERE_EN },
    },
  },
  leitbild: {
    punkte: [
      {
        de: 'Den Islam auf der Grundlage von Koran und Sunna leben und an die nächste Generation weitergeben.',
        tr: 'İslam’ı Kur’an ve Sünnet temelinde yaşamak ve gelecek nesillere aktarmak.',
        en: 'Living Islam on the basis of the Quran and the Sunnah and passing it on to the next generation.',
      },
      {
        de: 'Die Würde jedes Menschen achten und für die Grundrechte und Freiheiten aller eintreten.',
        tr: 'Her insanın onurunu gözetmek, herkesin temel hak ve özgürlüklerine sahip çıkmak.',
        en: 'Respecting the dignity of every person and standing up for everyone’s fundamental rights and freedoms.',
      },
      {
        de: 'Moscheen und Vereine stehen allen offen – gleich welcher Herkunft oder Weltanschauung.',
        tr: 'Camiler ve dernekler, kökeni ya da dünya görüşü ne olursa olsun herkese açıktır.',
        en: 'Mosques and associations are open to everyone, whatever their origin or worldview.',
      },
      {
        de: 'Frauen und Männer sind gleichwertig; beide sollen sich aktiv am gesellschaftlichen Leben beteiligen.',
        tr: 'Kadın ve erkek eşit değerdedir; her ikisinin de toplumsal hayata etkin katılımı desteklenir.',
        en: 'Women and men are of equal worth, and both are encouraged to take an active part in society.',
      },
      {
        de: 'Im Gespräch mit Menschen anderer Religionen und Kulturen Verständnis, Vertrauen und ein friedliches Miteinander stärken.',
        tr: 'Farklı din ve kültürlerden insanlarla diyalog içinde anlayışı, güveni ve barış içinde bir arada yaşamayı güçlendirmek.',
        en: 'Building understanding, trust and peaceful coexistence through dialogue with people of other faiths and cultures.',
      },
    ],
    quelle: 'grundsaetze',
  },
  bedeutung: {
    absaetze: [
      {
        de: 'Nach islamischem Verständnis geht die gesamte Menschheit auf Adam zurück, den ersten Menschen und zugleich ersten Propheten. Ihm folgten viele weitere Propheten, die Allahs Botschaft als Wegweisung für alle Menschen überbrachten. Zu ihnen gehört Abraham (Ibrahim), auf den der Glaube an den einen Gott in besonderer Weise zurückgeführt wird.',
        tr: 'İslam anlayışına göre bütün insanlık, ilk insan ve aynı zamanda ilk peygamber olan Hz. Âdem’e dayanır. Onun ardından Allah’ın mesajını bütün insanlara yol gösterici olarak ulaştıran pek çok peygamber gelmiştir. Bunlardan biri de tek Allah inancının özellikle kendisine dayandırıldığı Hz. İbrahim’dir.',
        en: 'In Islamic understanding, all of humanity goes back to Adam, the first human being and also the first prophet. He was followed by many other prophets who delivered Allah’s message as guidance for all people. Among them is Abraham (Ibrahim), to whom belief in the one God is traced in a special way.',
      },
      {
        de: 'Hier liegt der Bezug zum Namen der IGMG: Der Koran spricht an mehreren Stellen von der „Milla“ Abrahams – der Glaubensgemeinschaft, die seinem Weg des einen Gottes folgt – und bezieht die Muslime darauf. Fundstellen sind etwa Sure Nahl, Vers 123, Sure Âli Imrân, Vers 95, und Sure Nisâ, Vers 125.',
        tr: 'IGMG’nin adı da buradan gelir: Kur’an birçok yerde Hz. İbrahim’in “millet”inden, yani onun tevhid yolunu izleyen inanç topluluğundan söz eder ve Müslümanları bu topluluğa bağlar. Nahl suresinin 123., Âl-i İmrân suresinin 95. ve Nisâ suresinin 125. ayetleri bunun örnekleridir.',
        en: 'This is where IGMG’s name comes from: in several places the Quran speaks of the “Milla” of Abraham – the community of faith that follows his path of belief in the one God – and relates Muslims to it. Examples are Surah an-Nahl, verse 123, Surah Âli Imrân, verse 95, and Surah an-Nisâ, verse 125.',
      },
      {
        de: '„Millî Görüş“ lässt sich deshalb als Blick der Glaubensgemeinschaft Abrahams verstehen; „görüş“ ist das türkische Wort für Sicht oder Blick. Gemeint ist eine Gemeinschaft, die ihren Glauben auf Abraham zurückführt, dem Vorbild des Propheten Muhammad folgt und sich für das Wohl der Menschen einsetzt.',
        tr: 'Bu yüzden “Millî Görüş”, Hz. İbrahim’in inanç topluluğunun bakışı olarak anlaşılabilir. Kastedilen; inancını Hz. İbrahim’e dayandıran, Hz. Muhammed’in örnekliğini izleyen ve insanların iyiliği için çalışan bir topluluktur.',
        en: '“Millî Görüş” can therefore be understood as the outlook of Abraham’s community of faith; “görüş” is the Turkish word for view or outlook. It describes a community that traces its faith back to Abraham, follows the example of Prophet Muhammad and works for the well-being of people.',
      },
    ],
  },
  geschichte: {
    eintraege: [
      {
        label: { de: '1960er und 1970er Jahre', tr: '1960’lar ve 1970’ler', en: '1960s and 1970s' },
        text: {
          de: 'Seit den 1960er Jahren kamen viele Musliminnen und Muslime aus der Türkei und anderen Ländern zum Arbeiten nach Deutschland und in weitere europäische Staaten. Als in den 1970er Jahren die Familien nachzogen und aus dem vorübergehenden Aufenthalt ein dauerhaftes Leben wurde, gründeten sie erste Vereine und richteten Gebetsräume ein.',
          tr: '1960’lı yıllardan itibaren Türkiye’den ve başka ülkelerden pek çok Müslüman çalışmak için Almanya’ya ve diğer Avrupa ülkelerine geldi. 1970’li yıllarda aileler de gelip geçici kalış kalıcı bir hayata dönüşünce ilk dernekler kuruldu ve mescitler açıldı.',
          en: 'From the 1960s onwards, many Muslims from Turkey and other countries came to Germany and other European countries to work. When their families followed in the 1970s and a temporary stay turned into a permanent life, they founded the first associations and set up prayer rooms.',
        },
      },
      {
        label: { de: '1969', tr: '1969', en: '1969' },
        text: {
          de: 'Am 7. September 1969 entsteht in Braunschweig aus einer Initiative von Studierenden und Arbeitern der Verein „Türkische Union e. V.“. Er gilt als Keimzelle der heutigen IGMG; an der dortigen Universität gab es schon seit 1967 einen Gebetsraum.',
          tr: '7 Eylül 1969’da Braunschweig’da öğrencilerin ve işçilerin girişimiyle “Türkische Union e. V.” derneği kurulur. Bu dernek bugünkü IGMG’nin çekirdeği sayılır; şehirdeki üniversitede 1967’den beri bir mescit bulunuyordu.',
          en: 'On 7 September 1969, an initiative of students and workers in Braunschweig leads to the association “Türkische Union e. V.”. It is regarded as the nucleus of today’s IGMG; the city’s university had already had a prayer room since 1967.',
        },
      },
      {
        label: { de: '1976', tr: '1976', en: '1976' },
        text: {
          de: 'Der Hauptsitz zieht von Braunschweig nach Köln. Im November 1976 nennt sich der Verein in „Türkische Union Europa e. V.“ um.',
          tr: 'Genel merkez Braunschweig’dan Köln’e taşınır. Dernek, Kasım 1976’da adını “Türkische Union Europa e. V.” olarak değiştirir.',
          en: 'The headquarters moves from Braunschweig to Cologne. In November 1976, the association renames itself “Türkische Union Europa e. V.”.',
        },
      },
      {
        label: { de: '1982', tr: '1982', en: '1982' },
        text: {
          de: 'Weil die Muslime in Europa vielfältiger werden, heißt der Verband ab Dezember 1982 „Islamische Union Europa e. V.“.',
          tr: 'Avrupa’daki Müslümanlar çeşitlendikçe birlik, Aralık 1982’den itibaren “Islamische Union Europa e. V.” adını taşır.',
          en: 'As Muslims in Europe become more diverse, the organization is called “Islamische Union Europa e. V.” from December 1982.',
        },
      },
      {
        label: { de: '1985', tr: '1985', en: '1985' },
        text: {
          de: 'Seit dem 20. Mai 1985 heißt die Gemeinschaft „Avrupa Millî Görüş Teşkilatları“, kurz AMGT. Im selben Jahr richtet sie in Hamburg ihren ersten Koranrezitationswettbewerb aus.',
          tr: '20 Mayıs 1985’ten itibaren topluluk “Avrupa Millî Görüş Teşkilatları” (AMGT) adını taşır. Aynı yıl Hamburg’da ilk Kur’an-ı Kerim okuma yarışmasını düzenler.',
          en: 'From 20 May 1985, the community bears the name “Avrupa Millî Görüş Teşkilatları” (AMGT). In the same year, it holds its first Quran recitation competition in Hamburg.',
        },
      },
      {
        label: { de: '1995', tr: '1995', en: '1995' },
        text: {
          de: 'Die Gemeinschaft nennt sich „IGMG – Islamische Gemeinschaft Millî Görüş“. Der neue Name zeigt: Muslime sind in Europa zu Hause und gestalten die Gesellschaft als Bürgerinnen und Bürger mit.',
          tr: 'Topluluk “IGMG – İslam Toplumu Millî Görüş” adını alır. Yeni ad, Müslümanların Avrupa’yı yurt edindiğini ve toplumu vatandaş olarak birlikte şekillendirdiğini vurgular.',
          en: 'The community takes the name “IGMG – Islamic Community Millî Görüş”. The new name expresses that Muslims are at home in Europe and help shape society as citizens.',
        },
      },
      {
        label: { de: '2001', tr: '2001', en: '2001' },
        text: {
          de: 'In Hamburg nimmt das Europäische Halal-Zertifizierungsinstitut (EHZ) seine Arbeit auf. Es prüft Lebensmittel und Herstellungsabläufe nach den Maßstäben des Gelehrtenrats der IGMG.',
          tr: 'Hamburg’da Avrupa Helal Sertifika Enstitüsü (EHZ) çalışmaya başlar. Enstitü, gıdaları ve üretim süreçlerini IGMG Din İstişare Kurulu’nun ölçütlerine göre denetler.',
          en: 'The European Halal Certification Institute (EHZ) begins its work in Hamburg. It checks food and production processes against the standards of IGMG’s Religious Advisory Council.',
        },
      },
      {
        label: { de: '2009', tr: '2009', en: '2009' },
        text: {
          de: 'Frauen-, Jugend- und Frauenjugendorganisation werden eigenständige Organisationen mit eigenen Gremien. Im selben Jahr wird die Hadsch- und Umra-Organisation der IGMG in ein eigenes Unternehmen überführt, das heute als IGMG Reisen auftritt.',
          tr: 'Kadınlar, Gençlik ve Kadınlar Gençlik teşkilatları kendi kurullarıyla müstakil teşkilatlar hâline gelir. Aynı yıl IGMG’nin hac ve umre organizasyonu ayrı bir şirkete dönüştürülür; bugün IGMG Hac ve Umre adıyla hizmet verir.',
          en: 'The women’s, youth and young women’s organizations become independent organizations with their own governing bodies. In the same year, IGMG’s Hajj and Umrah service is turned into a company of its own, known today as IGMG Reisen.',
        },
      },
      {
        label: { de: 'Heute', tr: 'Bugün', en: 'Today' },
        text: {
          de: 'Heute zählt die IGMG über 700 Moscheegemeinden, rund 2.500 Zweigstellen, 44 Regionen und rund 200.000 Mitglieder (Stand Juni 2026). Sie ist in vielen Ländern Europas tätig, in Skandinavien und auf dem Balkan, außerdem in der Türkei, auf Zypern, in Kanada, den USA, Australien, Japan und Kirgisistan.',
          tr: 'Bugün IGMG; 700’ü aşkın cami cemiyeti, yaklaşık 2.500 şube, 44 bölge ve yaklaşık 200.000 üyeden oluşur (Haziran 2026 itibarıyla). Avrupa’nın pek çok ülkesinde, İskandinavya’da ve Balkanlar’da, ayrıca Türkiye’de, Kıbrıs’ta, Kanada’da, ABD’de, Avustralya’da, Japonya’da ve Kırgızistan’da faaliyet gösterir.',
          en: 'Today IGMG counts over 700 mosque communities, around 2,500 branches, 44 regions and around 200,000 members (as of June 2026). It is active in many European countries, in Scandinavia and the Balkans, and also in Türkiye, Cyprus, Canada, the USA, Australia, Japan and Kyrgyzstan.',
        },
      },
    ],
  },
  struktur: {
    praesidium: {
      de: 'Die laufende Arbeit der IGMG richtet sich nach den Beschlüssen des Präsidiums, das der Vorsitzende der IGMG leitet. Ihm gehören an: der Generalsekretär, die Leitungen der Abteilungen für Gemeindeentwicklung, Bildung, religiöse Wegweisung (Irschad), Finanzen sowie humanitäre Hilfe und soziale Dienste, die Vorsitzenden von Frauen-, Jugend- und Frauenjugendorganisation und die Berater des Vorsitzenden.',
      tr: 'IGMG’nin günlük çalışmaları, Genel Başkan’ın yönettiği Başkanlık Divanı’nın kararlarına dayanır. Divanda Genel Sekreter; teşkilatlanma, eğitim, irşad, mali işler ile insani yardım ve sosyal hizmetler birimlerinin başkanları; Kadınlar, Gençlik ve Kadınlar Gençlik teşkilatlarının başkanları ve Genel Başkan’ın danışmanları yer alır.',
      en: 'IGMG’s day-to-day work follows the decisions of the Presidium, which is chaired by the President of IGMG. Its members are the Secretary General; the heads of the departments for community development, education, religious guidance (Irshad), finance, and humanitarian aid and social services; the heads of the women’s, youth and young women’s organizations; and the President’s advisors.',
    },
    ausschuss: {
      de: 'Umgesetzt werden die Beschlüsse vom erweiterten Vorstand, gebunden an Satzung und Geschäftsordnungen. Zu ihm zählen außer den Mitgliedern des Präsidiums die stellvertretenden Abteilungsleitungen und die Leitungen weiterer Einrichtungen, etwa für Immobilien, Hadsch und Umra, Kommunikation oder Revision. Nach der Satzung hat er höchstens 22 Mitglieder.',
      tr: 'Başkanlık Divanı’nın kararlarını, tüzüğe ve iç yönetmeliklere bağlı kalarak Merkez Yürütme Kurulu hayata geçirir. Kurulda Divan üyelerinin yanı sıra birim başkan yardımcıları ile emlak, hac ve umre, tanıtım ya da teftiş gibi alanlardaki birimlerin başkanları bulunur. Tüzüğe göre kurul en fazla 22 üyeden oluşur.',
      en: 'The Central Executive Committee puts the Presidium’s decisions into practice, bound by the statutes and internal regulations. Besides the Presidium members, it includes the deputy heads of departments and the heads of further units, for example for property, Hajj and Umrah, communications or auditing. Under the statutes it has no more than 22 members.',
    },
    gremien: {
      de: 'Die Satzung der IGMG (Stand: 2. November 2025) kennt sechs Organe: die Schura als Delegiertenversammlung und oberstes Organ, den Vorstand, das Kuratorium, den Wahlrat, den Gelehrtenrat und den Prüfungsausschuss. Die Schura kommt jährlich zusammen und wählt den Vorstand auf Vorschlag des Wahlrats für fünf Jahre. Zum Vorstand gehören der Vorsitzende, der Generalsekretär und höchstens sieben stellvertretende Vorsitzende. Der Gelehrtenrat entscheidet in theologischen Fragen und Lehrfragen.',
      tr: 'IGMG tüzüğü (2 Kasım 2025 tarihli hâli) altı organ sayar: delegeler meclisi ve en üst organ olan Şura, Yönetim Kurulu, Mütevelli Heyeti, Seçim Kurulu, Din İstişare Kurulu ve Denetim Kurulu. Şura her yıl toplanır ve Seçim Kurulu’nun önerisiyle yönetimi beş yıllığına seçer. Yönetimde Genel Başkan, Genel Sekreter ve en fazla yedi genel başkan yardımcısı bulunur. Din İstişare Kurulu, dinî ilimler ve öğreti konularında karar verir.',
      en: 'IGMG’s statutes (as amended on 2 November 2025) provide for six bodies: the Shura as the delegates’ assembly and highest body, the Board of Directors, the Board of Trustees, the Electoral Council, the Religious Advisory Council and the Audit Committee. The Shura meets every year and elects the Board of Directors for five years on the proposal of the Electoral Council. The board is made up of the President, the Secretary General and no more than seven Vice Presidents. The Religious Advisory Council decides on theological and doctrinal questions.',
    },
    fachvereine: [
      {
        name: 'Hasene International',
        bereich: { de: 'Humanitäre Hilfe weltweit', tr: 'Dünya çapında insani yardım', en: 'Humanitarian aid worldwide' },
        url: { de: 'https://www.hasene.org/de/' },
      },
      {
        name: 'UKBA',
        bereich: { de: 'Bestattungshilfe', tr: 'Cenaze yardımlaşma', en: 'Funeral assistance' },
        url: { de: 'https://www.ukba.eu/de/' },
      },
      {
        name: 'EHZ',
        bereich: { de: 'Halal-Zertifizierung von Lebensmitteln', tr: 'Gıdalarda helal sertifikası', en: 'Halal certification of food' },
        url: { de: 'https://eurohalal.eu' },
      },
      {
        name: 'IGMG Reisen',
        bereich: { de: 'Hadsch-, Umra- und Kulturreisen', tr: 'Hac, umre ve kültür gezileri', en: 'Hajj, Umrah and cultural trips' },
        url: { de: 'https://www.igmgreisen.com/de/', tr: 'https://www.igmgreisen.com/' },
      },
      {
        name: 'Sabah Ülkesi',
        bereich: { de: 'Islamische Kunst und Kultur', tr: 'İslam sanatı ve kültürü', en: 'Islamic art and culture' },
        url: { de: 'https://www.sabahulkesi.com' },
      },
      {
        name: 'EMUG',
        bereich: {
          de: 'Erwerb, Bau und Betrieb von Moscheen in Deutschland',
          tr: 'Almanya’da cami alımı, inşası ve işletilmesi',
          en: 'Acquiring, building and running mosques in Germany',
        },
      },
      {
        name: 'Fudul',
        bereich: {
          de: 'Islamische Wohlfahrt und soziale Arbeit',
          tr: 'İslami refah ve sosyal hizmet',
          en: 'Islamic welfare and social work',
        },
      },
      {
        name: 'FAIR international',
        bereich: {
          de: 'Beratung bei Diskriminierung und Rassismus',
          tr: 'Ayrımcılık ve ırkçılık karşısında danışmanlık',
          en: 'Advice on discrimination and racism',
        },
      },
      {
        name: 'Menar Institut',
        bereich: {
          de: 'Begleitung angehender Imame in Ausbildung und Praxis',
          tr: 'İmam adaylarına eğitimde ve uygulamada destek',
          en: 'Supporting future imams in training and practice',
        },
      },
      {
        name: 'ILM',
        bereich: { de: 'Bildung und akademischer Austausch', tr: 'Eğitim ve akademik iş birliği', en: 'Education and academic exchange' },
      },
      {
        name: 'PLURAL Publications',
        bereich: {
          de: 'Verlag für islamische Literatur in mehreren Sprachen',
          tr: 'Farklı dillerde İslami yayınlar',
          en: 'Publisher of Islamic literature in several languages',
        },
      },
    ],
  },
  kontakt: {
    adresse: 'Colonia-Allee 3\n51067 Köln',
    telefon: '+49 221 942240-100',
    email: 'info@igmg.org',
    website: 'https://www.igmg.org/',
    register: 'Amtsgericht Köln, VR 17018',
  },
  verweise: [
    'selbstdarstellung',
    'grundsaetze',
    'geschichte',
    'struktur',
    'satzung',
    {
      titel: {
        de: 'IGMG-Broschüre (Englisch, Juni 2026)',
        tr: 'IGMG broşürü (Türkçe, Eylül 2025)',
        en: 'IGMG brochure (June 2026)',
      },
      beschreibung: {
        de: 'Porträt des Dachverbands mit Zahlen, Regionen und Diensten als PDF',
        tr: 'Rakamlar, bölgeler ve hizmetlerle teşkilatı tanıtan PDF',
        en: 'Profile of the organization with figures, regions and services (PDF)',
      },
      url: { de: BROSCHUERE_EN, tr: BROSCHUERE_TR, en: BROSCHUERE_EN },
    },
    'freitagspredigt',
    'gebetskalender',
    'mitgliedschaft',
    'kontakt',
    'reisen',
    'kinderclub',
    'perspektif',
    'camiaHaber',
  ],
  faq: [
    {
      frage: {
        de: 'Gehört die Fatih-Moschee Wetzlar zur IGMG?',
        tr: 'Wetzlar Fatih Camii IGMG’ye mi bağlı?',
        en: 'Is Fatih Mosque Wetzlar part of IGMG?',
      },
      antwort: {
        de: 'Ja. Die Fatih-Moschee Wetzlar ist eine Moscheegemeinde der Islamischen Gemeinschaft Millî Görüş (IGMG) und gehört zur IGMG-Region Hessen. Wie jede IGMG-Gemeinde ist sie ein eigenständiger Verein mit eigenem Vorstand. Die Zentrale in Köln unterstützt sie unter anderem mit Lehrmaterial, Imamen und dem Gebetskalender.',
        tr: 'Evet. Wetzlar Fatih Camii, İslam Toplumu Millî Görüş’e (IGMG) bağlı bir cami cemiyetidir ve IGMG Hessen bölgesine dahildir. Her IGMG cemiyeti gibi kendi yönetim kurulu olan bağımsız bir dernektir. Köln’deki genel merkez onu ders materyali, imamlar ve namaz takvimi gibi konularda destekler.',
        en: 'Yes. Fatih Mosque Wetzlar is a mosque community of the Islamic Community Millî Görüş (IGMG) and belongs to IGMG’s Hessen region. Like every IGMG community, it is an independent association with its own board. The headquarters in Cologne supports it with teaching material, imams and the prayer calendar, among other things.',
      },
    },
    {
      frage: { de: 'Wie ist die IGMG aufgebaut?', tr: 'IGMG nasıl yapılanmıştır?', en: 'How is IGMG organized?' },
      antwort: {
        de: 'In drei Ebenen. Vor Ort arbeiten die Moscheegemeinden als eigenständige Vereine mit eigenem Vorstand. Regionalverbände wie die Region Hessen stimmen die Arbeit der Gemeinden in ihrem Gebiet ab. Die Zentrale in Köln plant, koordiniert und sorgt für die Qualität der Dienste. Frauen-, Jugend- und Frauenjugendorganisation haben auf allen Ebenen eigene Vorstände.',
        tr: 'Üç kademede. Yerelde cami cemiyetleri, kendi yönetim kurulları olan bağımsız dernekler olarak çalışır. Hessen bölgesi gibi bölge teşkilatları, kendi bölgelerindeki cemiyetlerin çalışmalarını uyumlu hâle getirir. Köln’deki genel merkez planlar, koordine eder ve hizmetlerin kalitesini gözetir. Kadınlar, Gençlik ve Kadınlar Gençlik teşkilatlarının her kademede kendi yönetimleri vardır.',
        en: 'On three levels. Locally, mosque communities work as independent associations with their own boards. Regional bodies such as the Hessen region coordinate the work of the communities in their area. The headquarters in Cologne plans, coordinates and looks after the quality of services. The women’s, youth and young women’s organizations have their own boards at every level.',
      },
    },
    {
      frage: {
        de: 'Wie wird man Fördermitglied der IGMG?',
        tr: 'IGMG’ye destekçi üye nasıl olunur?',
        en: 'How do I become a supporting member of IGMG?',
      },
      antwort: {
        de: 'Fördermitglied kann jede Person islamischen Glaubens werden. Den Antrag stellt man schriftlich, auch über das Formular auf igmg.org. Über die Aufnahme entscheidet der Vorstand der IGMG, der auch die Beiträge festlegt. Fördermitglieder gehören der Moscheegemeinde an ihrem Hauptwohnsitz an.\n\nDie Fördermitgliedschaft im Dachverband ist nicht dasselbe wie die Mitgliedschaft in unserem Wetzlarer Verein; beides ist getrennt möglich.',
        tr: 'İslam inancına mensup herkes destekçi üye olabilir. Başvuru yazılı olarak, igmg.org’daki form üzerinden de yapılabilir. Üyeliğe IGMG yönetimi karar verir; aidatları da yönetim belirler. Destekçi üyeler, asıl ikamet ettikleri yerdeki cami cemiyetine mensup sayılır.\n\nÇatı kuruluştaki destekçi üyelik, Wetzlar’daki derneğimize üyelikle aynı şey değildir; ikisi ayrı ayrı mümkündür.',
        en: 'Anyone of the Islamic faith can become a supporting member. You apply in writing, which includes the form on igmg.org. IGMG’s board decides on admission and also sets the fees. Supporting members belong to the mosque community where they have their main residence.\n\nSupporting membership of the umbrella organization is not the same as membership of our association in Wetzlar; the two are separate.',
      },
    },
    {
      frage: {
        de: 'Wo sitzt die IGMG, und wie erreiche ich die Zentrale?',
        tr: 'IGMG’nin merkezi nerede ve genel merkeze nasıl ulaşırım?',
        en: 'Where is IGMG based, and how can I contact its headquarters?',
      },
      antwort: {
        de: 'Der Hauptsitz ist in Köln, Colonia-Allee 3, 51067 Köln. Die Zentrale erreichen Sie unter +49 221 942240-100 oder info@igmg.org. Eingetragen ist die IGMG im Vereinsregister des Amtsgerichts Köln unter VR 17018. Für Fragen zu unserer Gemeinde wenden Sie sich bitte direkt an die Fatih-Moschee Wetzlar.',
        tr: 'Genel merkez Köln’dedir: Colonia-Allee 3, 51067 Köln. Merkeze +49 221 942240-100 numaralı telefondan veya info@igmg.org adresinden ulaşabilirsiniz. IGMG, Köln yerel mahkemesinin dernekler sicilinde VR 17018 numarasıyla kayıtlıdır. Cemiyetimizle ilgili sorularınız için lütfen doğrudan Wetzlar Fatih Camii ile iletişime geçin.',
        en: 'The headquarters is in Cologne at Colonia-Allee 3, 51067 Köln. You can reach it on +49 221 942240-100 or at info@igmg.org. IGMG is entered in the register of associations at the Cologne local court under VR 17018. For questions about our community, please contact Fatih Mosque Wetzlar directly.',
      },
    },
    {
      frage: {
        de: 'Woher stammen die Angaben auf dieser Seite?',
        tr: 'Bu sayfadaki bilgiler nereden geliyor?',
        en: 'Where does the information on this page come from?',
      },
      antwort: {
        de: 'Die Zahlen stammen aus der englischen Broschüre der IGMG vom Juni 2026; die türkische Ausgabe nennt dieselben Werte. Daten zur Geschichte, Struktur und Satzung sowie die Kontaktdaten stammen von igmg.org. Wir übernehmen Fakten mit Quelle und Stand und formulieren die Texte mit Zustimmung der IGMG selbst. Die Angaben prüfen wir einmal im Jahr.',
        tr: 'Rakamlar, IGMG’nin Haziran 2026 tarihli İngilizce broşüründen alınmıştır; Türkçe baskı da aynı değerleri verir. Tarih, yapı ve tüzükle ilgili bilgiler ile iletişim bilgileri igmg.org’dan gelir. Bilgileri kaynak ve tarihleriyle aktarıyor, metinleri ise IGMG’nin onayıyla kendimiz yazıyoruz. Bilgileri yılda bir kez kontrol ediyoruz.',
        en: 'The figures come from IGMG’s English brochure of June 2026; the Turkish edition gives the same values. Details on history, structure and statutes as well as the contact details come from igmg.org. We take over facts with their source and date and write the texts ourselves with IGMG’s consent. We review the information once a year.',
      },
    },
  ],
  stand: '2026-10-27',
};

/** Seed „igmg“ (Welle A, Marktstart P1): idempotent (onConflictDoNothing), Beispielinhalt mit Quelle, Prüfung gegen das Schema. */
export const seed: BereichsSeed = async (db) => {
  const geprueft = inhaltSchema.parse(IGMG_BEISPIEL);
  const r = await db
    .insert(schema.seiteninhalt)
    .values({ bereich: 'igmg', istBeispiel: true, quelle: IGMG_QUELLE, inhalt: geprueft })
    .onConflictDoNothing({ target: schema.seiteninhalt.bereich })
    .returning({ bereich: schema.seiteninhalt.bereich });
  return r.length;
};
