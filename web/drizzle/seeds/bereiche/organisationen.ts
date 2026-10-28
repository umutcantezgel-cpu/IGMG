import type { z } from 'zod';
import { schema } from '../../../src/lib/db';
import { schema as inhaltSchema } from '../../../src/lib/validierung/seiteninhalte/organisation';
import type { BereichsSeed } from './typ';

type Eingabe = z.input<typeof inhaltSchema>;

/**
 * Seiteninhalte „organisation-<slug>“ (Blätter S15–S18, Schema aus A08). Deutsch wörtlich aus dem Design
 * (design/OrganizationPage.dc.html, Daten Z.96–127). Türkisch und Englisch wörtlich aus dem Bestand
 * (bestand/src/app/components/*Organization.tsx, Übersetzungen); wo der Bestand nichts liefert, fehlt die Fassung
 * und der Text erscheint auf Deutsch mit Hinweis (K-02). Öffnungszeiten gibt es nur auf Deutsch.
 * Adresse, Telefon und E-Mail bleiben Platzhalter in eckigen Klammern, weil die Vorlage nur Beispielwerte nennt (G-05).
 * Marktstart (E-044): Verweis auf die passende Seite beim Dachverband (`dachverband`, Schlüssel aus dem IGMG-Netzwerk);
 * KT, GT und KGT nennen in eigenen Worten ihre Eigenständigkeit seit 2009 (Belege in QUELLE_MARKTSTART). Die AT-Texte
 * deuten „Ana“ nicht mehr als Anatolien; die Bedeutung klärt die Gemeinde, der englische Titel in messages bleibt bis
 * dahin (Menschen-Punkt M-105).
 */
const KONTAKT_PLATZHALTER = { adresse: '[Adresse]', telefon: '[Telefonnummer]', email: '[E-Mail]' };

/** Belege für den Satz zur Eigenständigkeit seit 2009 und für die Verweise (Abruf 13.10.2026, geprüft 27.10.2026). */
const QUELLE_MARKTSTART =
  'Marktstart E-044: Eigenständigkeit seit 2009 nach https://www.igmg.org/vom-samen-zum-baum-historische-entwicklung-und-grundsaetze-der-igmg/ ' +
  'und https://www.igmg.org/struktur-fachvereine-und-kooperationen/ (eigene Worte); Verweis „dachverband“ aus src/lib/dachverband/netzwerk.ts';

/** Beispielinhalte der vier Organisationen mit Quelle (exportiert für Stand-Migrationen und Tests). */
export const ORGANISATIONEN_BEISPIEL: { slug: string; quelle: string; inhalt: Eingabe }[] = [
  {
    slug: 'ana-teskilati',
    quelle:
      'design/OrganizationPage.dc.html:96-103 (Daten at); bestand/src/app/components/AnatolianOrganization.tsx (Übersetzungen tr/en); Blatt S15; ' +
      'Anatolien-Deutung entfernt (M-105); ' +
      QUELLE_MARKTSTART,
    inhalt: {
      beschreibung: {
        de: 'Die Ana Teşkilatı (AT) ist eine wichtige Organisation innerhalb der Islamischen Gemeinschaft Millî Görüş (IGMG), die sich der Förderung kultureller Identität, Gemeinschaftsbildung und sozialer Aktivitäten widmet. Wir verbinden Menschen unterschiedlicher Herkunft und stärken die Bande unserer Gemeinschaft.',
        tr: 'Ana Teşkilatı (AT), İslam Toplumu Millî Görüş (IGMG) bünyesinde kültürel kimliği, toplum oluşumunu ve sosyal faaliyetleri desteklemeye adanmış önemli bir organizasyondur. Farklı kökenlerden insanları bir araya getiriyor ve topluluğumuzun bağlarını güçlendiriyoruz.',
        en: 'The Ana Teşkilatı (AT) is an important organization within the Islamic Community Millî Görüş (IGMG) dedicated to promoting cultural identity, community building, and social activities. We bring together people of different backgrounds and strengthen the bonds of our community.',
      },
      mission: {
        de: 'Bewahrung und Förderung unserer Kultur und Traditionen innerhalb der deutschen Gesellschaft, während wir gleichzeitig Integration und interkulturelle Verständigung fördern.',
        tr: 'Alman toplumunda kültürümüzü ve geleneklerimizi korumak ve geliştirmek, aynı zamanda entegrasyonu ve kültürlerarası anlayışı desteklemek.',
        en: 'Preserving and promoting our culture and traditions within German society while fostering integration and intercultural understanding.',
      },
      vision: {
        de: 'Eine starke, vereinte Gemeinschaft zu schaffen, die ihre kulturellen Wurzeln ehrt und gleichzeitig aktiv zur deutschen Gesellschaft beiträgt.',
        tr: 'Kültürel köklerini onurlandıran ve aynı zamanda Alman toplumuna aktif olarak katkıda bulunan güçlü, birleşik bir topluluk yaratmak.',
        en: 'To create a strong, united community that honors its cultural roots while actively contributing to German society.',
      },
      aktivitaeten: [
        {
          symbol: 'heart',
          titel: { de: 'Kulturelle Veranstaltungen', tr: 'Kültürel Etkinlikler', en: 'Cultural Events' },
          text: {
            de: 'Organisation traditioneller Feste, Folklore-Abende und kultureller Aufführungen',
            tr: 'Geleneksel bayramlar, folklor geceleri ve kültürel gösterilerin organizasyonu',
            en: 'Organization of traditional festivals, folklore evenings, and cultural performances',
          },
        },
        {
          symbol: 'book-open',
          titel: { de: 'Bildungsprogramme', tr: 'Eğitim Programları', en: 'Educational Programs' },
          text: {
            de: 'Türkische Sprachkurse, Kulturunterricht und Bildungsseminare',
            tr: 'Türkçe dil kursları, kültür dersleri ve eğitim seminerleri',
            en: 'Turkish language courses, cultural classes, and educational seminars',
          },
        },
        {
          symbol: 'users',
          titel: { de: 'Gemeinschaftsdienst', tr: 'Toplum Hizmeti', en: 'Community Service' },
          text: {
            de: 'Soziale Hilfsprojekte, Nachbarschaftshilfe und Unterstützung für Bedürftige',
            tr: 'Sosyal yardım projeleri, mahalle yardımlaşması ve ihtiyaç sahiplerine destek',
            en: 'Social aid projects, neighborhood assistance, and support for those in need',
          },
        },
        {
          symbol: 'graduation-cap',
          titel: { de: 'Jugendarbeit', tr: 'Gençlik Çalışması', en: 'Youth Work' },
          text: {
            de: 'Programme für junge Menschen zur Identitätsbildung und Integration',
            tr: 'Gençler için kimlik oluşumu ve entegrasyon programları',
            en: 'Programs for young people for identity formation and integration',
          },
        },
      ],
      oeffnungszeiten: [{ de: 'Montag–Freitag: 18:00–21:00 Uhr' }, { de: 'Samstag: 14:00–18:00 Uhr' }, { de: 'Sonntag: 14:00–17:00 Uhr' }],
      kontakt: KONTAKT_PLATZHALTER,
      dachverband: 'selbstdarstellung',
    },
  },
  {
    slug: 'kadin-teskilati',
    quelle:
      'design/OrganizationPage.dc.html:104-111 (Daten kt); bestand/src/app/components/WomensOrganization.tsx (Übersetzungen tr/en); Blatt S16; ' +
      QUELLE_MARKTSTART,
    inhalt: {
      beschreibung: {
        de: 'Die Kadın Teşkilatı (KT) ist das Herzstück der Frauenarbeit in der IGMG Wetzlar. Wir sind eine Gemeinschaft starker Frauen, die sich für Bildung, soziale Unterstützung und spirituelle Entwicklung einsetzen. Unsere Organisation bietet einen sicheren Raum für muslimische Frauen, um ihre Talente zu entfalten und ihre Gemeinschaft zu stärken. Als Frauenorganisation der Islamischen Gemeinschaft Millî Görüş (IGMG) ist die KT seit 2009 eigenständig – mit eigenen Leitungsgremien in jeder Region und jeder Gemeinde.',
        tr: "Kadın Teşkilatı (KT), IGMG Wetzlar'daki kadın çalışmalarının kalbidir. Eğitim, sosyal destek ve manevi gelişim için çaba gösteren güçlü kadınların topluluğuyuz. Organizasyonumuz Müslüman kadınların yeteneklerini geliştirmeleri ve topluluklarını güçlendirmeleri için güvenli bir alan sunar. İslam Toplumu Millî Görüş (IGMG) bünyesindeki kadın teşkilatı olarak KT, 2009'dan bu yana müstakil bir yapıdır; her bölgede ve her cemaatte kendi yönetim kurulları bulunur.",
        en: "The Women's Organization (KT) is the heart of women's work at IGMG Wetzlar. We are a community of strong women dedicated to education, social support, and spiritual development. Our organization provides a safe space for Muslim women to develop their talents and strengthen their community. As the women's organization of the Islamic Community Millî Görüş (IGMG), the KT has been independent since 2009, with its own governing bodies in every region and every local community.",
      },
      mission: {
        de: 'Muslimische Frauen zu stärken durch Bildung, soziale Unterstützung und spirituelle Führung, während wir gleichzeitig unsere kulturellen Werte und religiösen Prinzipien wahren.',
        tr: 'Kültürel değerlerimizi ve dini ilkelerimizi koruyarak, eğitim, sosyal destek ve manevi rehberlik yoluyla Müslüman kadınları güçlendirmek.',
        en: 'To empower Muslim women through education, social support, and spiritual guidance while preserving our cultural values and religious principles.',
      },
      vision: {
        de: 'Eine Gemeinschaft zu schaffen, in der jede Frau ihre Potentiale verwirklichen kann und als Vorbild für nachkommende Generationen dient.',
        tr: 'Her kadının potansiyelini gerçekleştirebileceği ve gelecek nesiller için örnek teşkil edebileceği bir topluluk yaratmak.',
        en: 'To create a community where every woman can realize her potential and serve as a role model for future generations.',
      },
      aktivitaeten: [
        {
          symbol: 'book-open',
          titel: { de: 'Bildung & Kurse', tr: 'Eğitim & Kurslar', en: 'Education & Courses' },
          text: {
            de: 'Islamunterricht, Koranstudium, deutsche Sprachkurse und Computerkurse für Frauen',
            tr: 'İslam dersleri, Kuran çalışması, Almanca dil kursları ve kadınlar için bilgisayar kursları',
            en: 'Islamic classes, Quran study, German language courses, and computer courses for women',
          },
        },
        {
          symbol: 'users',
          titel: { de: 'Familie & Erziehung', tr: 'Aile & Çocuk Yetiştirme', en: 'Family & Parenting' },
          text: {
            de: 'Erziehungsberatung, Mutter-Kind-Gruppen und Familienseminare',
            tr: 'Eğitim danışmanlığı, anne-çocuk grupları ve aile seminerleri',
            en: 'Parenting counseling, mother-child groups, and family seminars',
          },
        },
        {
          symbol: 'heart',
          titel: { de: 'Soziale Arbeit', tr: 'Sosyal Çalışma', en: 'Social Work' },
          text: {
            de: 'Unterstützung für bedürftige Familien, Krankenbesuche und Nachbarschaftshilfe',
            tr: 'İhtiyaç sahibi ailelere destek, hasta ziyaretleri ve komşuluk yardımı',
            en: 'Support for families in need, hospital visits, and neighborhood assistance',
          },
        },
        {
          symbol: 'pencil',
          titel: { de: 'Handwerk & Kreativität', tr: 'El Sanatları & Yaratıcılık', en: 'Crafts & Creativity' },
          text: {
            de: 'Näh- und Strickkurse, traditionelle Handarbeiten und kreative Workshops',
            tr: 'Dikiş ve örgü kursları, geleneksel el işleri ve yaratıcı atölyeler',
            en: 'Sewing and knitting courses, traditional handicrafts, and creative workshops',
          },
        },
      ],
      oeffnungszeiten: [{ de: 'Dienstag & Donnerstag: 14:00–17:00 Uhr' }, { de: 'Samstag: 10:00–13:00 Uhr' }],
      kontakt: KONTAKT_PLATZHALTER,
      dachverband: 'frauenorganisation',
    },
  },
  {
    slug: 'genclik-teskilati',
    quelle:
      'design/OrganizationPage.dc.html:112-119 (Daten gt); bestand/src/app/components/YouthOrganization.tsx (Übersetzungen tr/en); Blatt S17; ' +
      QUELLE_MARKTSTART,
    inhalt: {
      beschreibung: {
        de: 'Die Gençlik Teşkilatı (GT) ist das dynamische Herz der Jugendarbeit in der IGMG Wetzlar. Wir bieten jungen Menschen zwischen 14 und 30 Jahren einen Raum für persönliche Entwicklung, spirituelles Wachstum und aktive Teilnahme an der Gemeinschaft. Unsere Programme kombinieren moderne Ansätze mit traditionellen islamischen Werten. Als Jugendorganisation der Islamischen Gemeinschaft Millî Görüş (IGMG) ist die GT seit 2009 eigenständig – mit eigenen Leitungsgremien in jeder Region und jeder Gemeinde.',
        tr: "Gençlik Teşkilatı (GT), IGMG Wetzlar'daki gençlik çalışmasının dinamik kalbidir. 14-30 yaş arası gençlere kişisel gelişim, manevi büyüme ve topluma aktif katılım için alan sunuyoruz. Programlarımız modern yaklaşımları geleneksel İslami değerlerle birleştiriyor. İslam Toplumu Millî Görüş (IGMG) bünyesindeki gençlik teşkilatı olarak GT, 2009'dan bu yana müstakil bir yapıdır; her bölgede ve her cemaatte kendi yönetim kurulları bulunur.",
        en: 'The Youth Organization (GT) is the dynamic heart of youth work at IGMG Wetzlar. We provide young people between 14 and 30 years old with a space for personal development, spiritual growth, and active participation in the community. Our programs combine modern approaches with traditional Islamic values. As the youth organization of the Islamic Community Millî Görüş (IGMG), the GT has been independent since 2009, with its own governing bodies in every region and every local community.',
      },
      mission: {
        de: 'Junge Muslime zu selbstbewussten, engagierten Bürgern zu erziehen, die ihre religiöse Identität mit gesellschaftlicher Verantwortung verbinden.',
        tr: 'Genç Müslümanları, dini kimliklerini toplumsal sorumluluklarıyla birleştiren özgüvenli, katılımcı vatandaşlar olarak yetiştirmek.',
        en: 'To educate young Muslims to become confident, engaged citizens who connect their religious identity with social responsibility.',
      },
      vision: {
        de: 'Eine Generation zu formen, die als Brücke zwischen den Kulturen fungiert und positive Veränderungen in der Gesellschaft bewirkt.',
        tr: 'Kültürler arası köprü görevi gören ve toplumda olumlu değişiklikler yaratan bir nesil oluşturmak.',
        en: 'To shape a generation that serves as a bridge between cultures and creates positive changes in society.',
      },
      aktivitaeten: [
        {
          symbol: 'target',
          titel: { de: 'Sport & Fitness', tr: 'Spor & Fitness', en: 'Sports & Fitness' },
          text: {
            de: 'Fußballturniere, Basketballteams, Fitnesstraining und Outdoor-Aktivitäten',
            tr: 'Futbol turnuvaları, basketbol takımları, fitness antrenmanı ve açık hava etkinlikleri',
            en: 'Football tournaments, basketball teams, fitness training, and outdoor activities',
          },
        },
        {
          symbol: 'book-open',
          titel: { de: 'Bildung & Workshops', tr: 'Eğitim & Atölyeler', en: 'Education & Workshops' },
          text: {
            de: 'Persönlichkeitsentwicklung, Berufsorientierung und Leadership-Training',
            tr: 'Kişilik gelişimi, meslek yönlendirmesi ve liderlik eğitimi',
            en: 'Personal development, career guidance, and leadership training',
          },
        },
        {
          symbol: 'monitor',
          titel: { de: 'Technologie & Medien', tr: 'Teknoloji & Medya', en: 'Technology & Media' },
          text: {
            de: 'Programmierkurse, Medienproduktion und digitale Projekte',
            tr: 'Programlama kursları, medya prodüksiyonu ve dijital projeler',
            en: 'Programming courses, media production, and digital projects',
          },
        },
        {
          symbol: 'star',
          titel: { de: 'Kultur & Kunst', tr: 'Kültür & Sanat', en: 'Culture & Arts' },
          text: {
            de: 'Musik, Theater, Fotografie und kreative Ausdrucksformen',
            tr: 'Müzik, tiyatro, fotoğrafçılık ve yaratıcı ifade biçimleri',
            en: 'Music, theater, photography, and creative forms of expression',
          },
        },
      ],
      oeffnungszeiten: [
        { de: 'Mittwoch: 17:00–20:00 Uhr' },
        { de: 'Freitag: 16:00–22:00 Uhr' },
        { de: 'Samstag: 14:00–19:00 Uhr' },
        { de: 'Sonntag: 14:00–18:00 Uhr' },
      ],
      kontakt: KONTAKT_PLATZHALTER,
      dachverband: 'jugendorganisation',
    },
  },
  {
    slug: 'kadin-genclik-teskilati',
    quelle:
      'design/OrganizationPage.dc.html:120-127 (Daten kgt); bestand/src/app/components/WomensYouthOrganization.tsx (Übersetzungen tr/en); Blatt S18; ' +
      QUELLE_MARKTSTART,
    inhalt: {
      beschreibung: {
        de: 'Die Kadın Gençlik Teşkilatı (KGT) ist eine lebendige Gemeinschaft junger muslimischer Frauen zwischen 16 und 30 Jahren. Wir bieten einen unterstützenden Raum für persönliche Entwicklung, spirituelles Wachstum und kreative Entfaltung. Unsere Programme verbinden islamische Werte mit modernen Bildungsansätzen und bereiten junge Frauen auf eine erfolgreiche Zukunft vor. Als Frauenjugendorganisation der Islamischen Gemeinschaft Millî Görüş (IGMG) ist die KGT seit 2009 eigenständig – mit eigenen Leitungsgremien in jeder Region und jeder Gemeinde.',
        tr: "Kadın Gençlik Teşkilatı (KGT), 16-30 yaş arası genç Müslüman kadınların canlı bir topluluğudur. Kişisel gelişim, manevi büyüme ve yaratıcı gelişim için destekleyici bir alan sunuyoruz. Programlarımız İslami değerleri modern eğitim yaklaşımlarıyla birleştiriyor ve genç kadınları başarılı bir geleceğe hazırlıyor. İslam Toplumu Millî Görüş (IGMG) bünyesindeki genç kadınlar teşkilatı olarak KGT, 2009'dan bu yana müstakil bir yapıdır; her bölgede ve her cemaatte kendi yönetim kurulları bulunur.",
        en: "The Women's Youth Organization (KGT) is a vibrant community of young Muslim women between 16 and 30 years old. We provide a supportive space for personal development, spiritual growth, and creative expression. Our programs combine Islamic values with modern educational approaches and prepare young women for a successful future. As the young women's organization of the Islamic Community Millî Görüş (IGMG), the KGT has been independent since 2009, with its own governing bodies in every region and every local community.",
      },
      mission: {
        de: 'Junge muslimische Frauen zu selbstbewussten, gebildeten und spirituell gefestigten Persönlichkeiten zu entwickeln, die ihre Träume verwirklichen und positive Veränderungen in der Gesellschaft bewirken.',
        tr: 'Genç Müslüman kadınları özgüvenli, eğitimli ve manevi açıdan sağlam kişilikler olarak geliştirmek, hayallerini gerçekleştirmeleri ve toplumda olumlu değişiklikler yaratmaları için.',
        en: 'To develop young Muslim women into confident, educated, and spiritually grounded personalities who realize their dreams and create positive changes in society.',
      },
      vision: {
        de: 'Eine Generation starker, inspirierender Frauen zu formen, die als Vorbilder für nachkommende Generationen dienen und Brücken zwischen den Kulturen bauen.',
        tr: 'Gelecek nesiller için örnek teşkil eden ve kültürler arası köprüler kuran güçlü, ilham verici kadınlardan oluşan bir nesil oluşturmak.',
        en: 'To shape a generation of strong, inspiring women who serve as role models for future generations and build bridges between cultures.',
      },
      aktivitaeten: [
        {
          symbol: 'graduation-cap',
          titel: { de: 'Bildung & Entwicklung', tr: 'Eğitim & Gelişim', en: 'Education & Development' },
          text: {
            de: 'Persönlichkeitsentwicklung, Studienberatung, Berufsorientierung und Führungskompetenzen',
            tr: 'Kişilik gelişimi, eğitim danışmanlığı, meslek yönlendirmesi ve liderlik becerileri',
            en: 'Personal development, study counseling, career guidance, and leadership skills',
          },
        },
        {
          symbol: 'pencil',
          titel: { de: 'Kreativität & Kunst', tr: 'Yaratıcılık & Sanat', en: 'Creativity & Arts' },
          text: {
            de: 'Fotografie, Design, Kalligrafie, Kunst-Workshops und kreative Projekte',
            tr: 'Fotoğrafçılık, tasarım, kaligrafi, sanat atölyeleri ve yaratıcı projeler',
            en: 'Photography, design, calligraphy, art workshops, and creative projects',
          },
        },
        {
          symbol: 'heart',
          titel: { de: 'Soziale Projekte', tr: 'Sosyal Projeler', en: 'Social Projects' },
          text: {
            de: 'Wohltätigkeitsaktionen, Gemeinschaftsdienst und gesellschaftliches Engagement',
            tr: 'Hayırseverlik faaliyetleri, toplum hizmeti ve toplumsal katılım',
            en: 'Charity activities, community service, and social engagement',
          },
        },
        {
          symbol: 'book-open',
          titel: { de: 'Spiritualität & Wissen', tr: 'Maneviyat & Bilgi', en: 'Spirituality & Knowledge' },
          text: {
            de: 'Koranstudium, islamische Geschichte, spirituelle Entwicklung und Diskussionsrunden',
            tr: 'Kuran çalışması, İslam tarihi, manevi gelişim ve tartışma toplantıları',
            en: 'Quran study, Islamic history, spiritual development, and discussion groups',
          },
        },
      ],
      oeffnungszeiten: [{ de: 'Dienstag: 16:00–19:00 Uhr' }, { de: 'Donnerstag: 17:00–20:00 Uhr' }, { de: 'Samstag: 14:00–17:00 Uhr' }],
      kontakt: KONTAKT_PLATZHALTER,
      dachverband: 'frauenjugendorganisation',
    },
  },
];

/** Seed „organisationen“ (Welle A): je Organisation ein Seiteninhalt, idempotent, mit Quelle, geprüft gegen das Schema. */
export const seed: BereichsSeed = async (db) => {
  const werte = ORGANISATIONEN_BEISPIEL.map((s) => ({
    bereich: `organisation-${s.slug}`,
    istBeispiel: true,
    quelle: s.quelle,
    inhalt: inhaltSchema.parse(s.inhalt),
  }));
  const r = await db
    .insert(schema.seiteninhalt)
    .values(werte)
    .onConflictDoNothing({ target: schema.seiteninhalt.bereich })
    .returning({ bereich: schema.seiteninhalt.bereich });
  return r.length;
};
