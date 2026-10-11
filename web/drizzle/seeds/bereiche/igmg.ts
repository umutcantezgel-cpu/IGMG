import type { z } from 'zod';
import { schema } from '../../../src/lib/db';
import { schema as inhaltSchema } from '../../../src/lib/validierung/seiteninhalte/igmg';
import type { BereichsSeed } from './typ';

/**
 * Beispielinhalt „igmg“ (Blatt S12, DATEN; Welle A). Texte wörtlich aus dem Bestand (IGMGInfo.tsx, t.de/t.tr/t.en),
 * Zahlen und Gliederung aus dem Design (IGMGInfo.dc.html). Widersprüchliche Zahlen (Zweigstellen, Regionalverbände,
 * Mitglieder) und die Zentralkontakte stehen als Platzhalter (G-05; Blatt S12, Auffälligkeiten 1 und 3).
 * Neu übersetzt (tr/en): Jahreszahl-Labels der Geschichte (Bestand nur deutsch fest, tsx:322 und tsx:332).
 * Keine Personennamen (G-04). Religiöse Texte: die Bedeutung-Absätze nennen Suren nur als Erläuterung (G-06, siehe Bericht).
 */
const inhalt: z.input<typeof inhaltSchema> = {
  ueberblick: {
    text: {
      de: 'Die Islamische Gemeinschaft Millî Görüş (IGMG) ist eine Religionsgemeinschaft. Sie hat das Ziel der Vermittlung und Pflege des islamischen Glaubens, seiner Verwirklichung in allen sozialen Bezügen und der Erfüllung der koranischen Gebote. Darüber hinaus vertritt die IGMG ihre Mitglieder in gesellschaftlichen, sozialen und politischen Angelegenheiten und setzt sich für die Sicherung ihrer Grundrechte ein.',
      tr: 'İslam Toplumu Millî Görüş (IGMG) bir din toplumudur. İslam inancının aktarılması ve korunması, sosyal tüm ilişkilerde gerçekleştirilmesi ve Kurani emirlerin yerine getirilmesi hedefine sahiptir. Bunun yanı sıra IGMG, üyelerini toplumsal, sosyal ve siyasi konularda temsil eder ve temel haklarının güvence altına alınması için çalışır.',
      en: 'The Islamic Community Millî Görüş (IGMG) is a religious community. Its goal is to mediate and preserve the Islamic faith, its realization in all social relationships, and the fulfillment of Quranic commandments. Furthermore, the IGMG represents its members in social, societal, and political matters and advocates for securing their fundamental rights.',
    },
    auftrag: {
      de: 'Als Teil der weltweiten islamischen Gemeinschaft (Umma) ist es zudem Aufgabe der IGMG, die Probleme der Muslime weltweit aufmerksam zu beobachten und zu ihrer Lösung beizutragen.',
      tr: "Dünya çapındaki İslam ümmetinin bir parçası olarak, IGMG'nin dünya çapındaki Müslümanların sorunlarını dikkatle izlemek ve çözümlerine katkıda bulunmak da görevidir.",
      en: 'As part of the worldwide Islamic community (Umma), it is also the task of IGMG to attentively observe the problems of Muslims worldwide and contribute to their solution.',
    },
  },
  zahlen: {
    moscheen: '518',
    zweigstellen: '[Zahl fehlt: Zweigstellen]',
    menschenErreicht: '350.000',
  },
  bedeutung: {
    absaetze: [
      {
        de: 'Der islamischen Lehre zufolge stammt die Menschheit von dem ersten Menschen und Propheten Adam ab. Seitdem betraute Allah zahllose Propheten mit der Verkündung seiner Botschaft als Richtschnur und Rechtleitung für alle Menschen. Einer dieser Propheten war Abraham, der als Begründer des Monotheismus gilt.',
        tr: "İslami öğretiye göre, insanlık ilk insan ve peygamber Adem'den türemiştir. O zamandan beri Allah, sayısız peygamberi mesajını tüm insanlar için kılavuz ve hidayet olarak duyurma göreviyle yükledi. Bu peygamberlerden biri, tek tanrıcılığın kurucusu kabul edilen İbrahim'di.",
        en: 'According to Islamic teaching, humanity descends from the first human and prophet Adam. Since then, Allah has entrusted countless prophets with proclaiming His message as guidance and direction for all people. One of these prophets was Abraham, who is considered the founder of monotheism.',
      },
      {
        de: 'Der Name der IGMG steht in direkter Beziehung zum Propheten Abraham. Denn an vielen Stellen im Koran ist im Zusammenhang mit der Wiederbelebung des Monotheismus durch den Islam auch von Muslimen als der „Milla“ (Gemeinschaft) Abrahams die Rede. So etwa unter anderem in den Suren Nahl, Vers 123, Âli Imrân, Vers 95 und Nisâ, Vers 125.',
        tr: `IGMG'nin adı doğrudan Peygamber İbrahim ile ilişkilidir. Çünkü Kuran'da pek çok yerde, İslam'ın tek tanrıcılığı yeniden canlandırması bağlamında Müslümanlardan İbrahim'in "Milleti" (toplumu) olarak bahsedilir. Örneğin Nahl suresi 123. ayet, Âl-i İmrân suresi 95. ayet ve Nisâ suresi 125. ayet gibi.`,
        en: 'The name of IGMG is directly related to Prophet Abraham. For in many places in the Quran, in connection with the revival of monotheism through Islam, Muslims are also referred to as the "Milla" (community) of Abraham. For example, in Suras An-Nahl, verse 123, Ali Imran, verse 95, and An-Nisa, verse 125.',
      },
      {
        de: 'Demnach beschreibt „Millî Görüş“ („görüş“ türkisch für „Sichtweise“) eine Gemeinschaft, die ihre Sichtweise und ihren Glauben auf die Gemeinschaft Abrahams zurückführt und dem Weg des Propheten Muhammad folgt. Ihr Ziel ist es, dieser Perspektive und dem Selbstverständnis einer islamischen Gemeinschaft gerecht zu werden, und sich für das Wohlergehen der Menschen einzusetzen.',
        tr: `"Millî Görüş" ("görüş" Türkçe'de "bakış açısı" anlamına gelir) demnach bir toplumu tanımlar ki, bakış açısını ve inancını İbrahim topluluğuna dayandırır ve Peygamber Muhammed'in yolunu takip eder. Amacı, bu perspektife ve bir İslami toplumun öz anlayışına uygun olmak ve insanların refahı için çalışmaktır.`,
        en: 'Accordingly, "Millî Görüş" ("görüş" Turkish for "perspective") describes a community that traces its perspective and faith back to the community of Abraham and follows the path of Prophet Muhammad. Its goal is to live up to this perspective and the self-understanding of an Islamic community, and to work for the welfare of people.',
      },
    ],
  },
  geschichte: {
    eintraege: [
      {
        label: { de: '1960er Jahre', tr: "1960'lar", en: '1960s' },
        text: {
          de: 'Ab den 1960er Jahren emigrierten Millionen Muslime aus der Türkei und anderen Ländern nach Europa, um in Deutschland und anderen Staaten Europas zu arbeiten. Mit Beginn des Familiennachzuges und der dauerhaften Sesshaftwerdung der sogenannten Gastarbeiter ab den 70er Jahren fanden sich erste kleine Gemeinden zusammen und eröffneten eigene Gebetsräume.',
          tr: "1960'lardan itibaren, Türkiye ve diğer ülkelerden milyonlarca Müslüman, Almanya ve diğer Avrupa ülkelerinde çalışmak için Avrupa'ya göç etti. 70'li yıllardan itibaren aile birleşimi ve sözde misafir işçilerin kalıcı yerleşimi ile ilk küçük topluluklar bir araya geldi ve kendi ibadet yerleri açtı.",
          en: 'From the 1960s onwards, millions of Muslims from Turkey and other countries emigrated to Europe to work in Germany and other European states. With the beginning of family reunification and the permanent settlement of the so-called guest workers from the 70s onwards, first small communities came together and opened their own prayer rooms.',
        },
      },
      {
        label: { de: 'Frühe Vernetzung', tr: 'Erken Ağ Oluşturma', en: 'Early Networking' },
        text: {
          de: 'Diese Gemeinschaften vernetzten sich schon bald zu Föderationen auf regionaler Ebene. Allerdings fehlte ein zentraler Dachverband, der insbesondere Aufgaben wie den Bau von Moscheen, die Organisation der Pilgerfahrten und die Anwerbung und Ausbildung von Imamen hätte übernehmen können.',
          tr: 'Bu topluluklar kısa sürede bölgesel düzeyde federasyonlar halinde ağ oluşturdu. Ancak özellikle cami inşası, hac yolculuklarının organizasyonu ve imam alımı ve eğitimi gibi görevleri üstlenebilecek merkezi bir çatı örgütü eksikti.',
          en: 'These communities soon networked into federations at the regional level. However, there was a lack of a central umbrella organization that could particularly take on tasks such as the construction of mosques, the organization of pilgrimages, and the recruitment and training of imams.',
        },
      },
      {
        label: { de: '1970er-1980er Jahre', tr: "1970'ler-1980'ler", en: '1970s–1980s' },
        text: {
          de: 'Ende der 70er Jahre fand die europaweite Vernetzung der Arbeit statt. In den 80er Jahren entwickelten sich feste Strukturen, was zur Gründung der AMGT als Vorläufer der heutigen IGMG führte.',
          tr: "70'lerin sonunda Avrupa çapında ağ oluşturma çalışması gerçekleşti. 80'lerde sağlam yapılar gelişti, bu da bugünkü IGMG'nin öncüsü olan AMGT'nin kurulmasına yol açtı.",
          en: "At the end of the 70s, the Europe-wide networking of work took place. In the 80s, solid structures developed, which led to the founding of AMGT as the predecessor of today's IGMG.",
        },
      },
      {
        label: { de: 'Wachstum', tr: 'Büyüme', en: 'Growth' },
        text: {
          de: 'Dank einer ständig wachsenden Zahl von Regionalverbänden und Zweigstellen entwickelte sich die IGMG in den Folgejahren zu einer der größten zivilgesellschaftlichen Organisationen Europas.',
          tr: "Sürekli artan bölgesel birlikler ve şubeler sayısı sayesinde IGMG, takip eden yıllarda Avrupa'nın en büyük sivil toplum kuruluşlarından biri haline geldi.",
          en: 'Thanks to a constantly growing number of regional associations and branches, IGMG developed in the following years into one of the largest civil society organizations in Europe.',
        },
      },
      {
        label: { de: 'Heute', tr: 'Bugün', en: 'Today' },
        text: {
          de: 'Heute ist die IGMG eine Gemeinschaft, die der umfassenden Religionsverwirklichung dient und mit ihrer Frauen-, Jugend-, Studierenden- und Frauenjugendorganisation knapp [Zahl fehlt: Zweigstellen] Zweigstellen unterhält. Sie ist eine fest etablierte Organisation, die ihre Arbeit in vielen Ländern Europas, sowie in den USA, in Australien, Japan, Kanada und Kirgisistan durchführt. Mit ihren [Zahl fehlt: Regionalverbände] Regionalverbänden, 20.000 Mitwirkenden und rund [Zahl fehlt: Mitglieder] Mitgliedern, führt die IGMG ihre Dienstleistungen für Hunderttausende Menschen ohne Unterbrechung fort.',
          tr: "Bugün IGMG, kapsamlı din gerçekleştirmesine hizmet eden ve kadın, gençlik, öğrenci ve kadın gençlik organizasyonu ile yaklaşık [Zahl fehlt: Zweigstellen] şubeye sahip bir topluluktur. Avrupa'nın birçok ülkesinde, ayrıca ABD, Avustralya, Japonya, Kanada ve Kırgızistan'da çalışmalarını yürüten sağlam köklü bir organizasyondur. [Zahl fehlt: Regionalverbände] bölge birliği, 20.000 katılımcı ve yaklaşık [Zahl fehlt: Mitglieder] üyesi ile IGMG, yüz binlerce insan için hizmetlerini kesintisiz olarak sürdürür.",
          en: "Today, IGMG is a community that serves comprehensive religious realization and maintains nearly [Zahl fehlt: Zweigstellen] branches with its women's, youth, student, and women's youth organizations. It is a well-established organization that carries out its work in many European countries, as well as in the USA, Australia, Japan, Canada, and Kyrgyzstan. With its [Zahl fehlt: Regionalverbände] regional associations, 20,000 participants, and around [Zahl fehlt: Mitglieder] members, IGMG continues its services for hundreds of thousands of people without interruption.",
        },
      },
    ],
  },
  struktur: {
    praesidium: {
      de: 'Das vom Vorsitzenden geleitete Präsidium ist neben dem vertretungsberechtigten Vorstand das höchste Entscheidungs- und Führungsgremium der IGMG. Es besteht aus den Leitern der acht Abteilungen Generalsekretariat, Gemeindeentwicklung, Finanzen, Irschad, Bildung, Frauen, Jugend und Frauenjugend sowie den Beratern des Vorsitzenden.',
      tr: "Başkan tarafından yönetilen başkanlık, temsil yetkili yönetimin yanı sıra IGMG'nin en yüksek karar ve yönetim organıdır. Genel Sekreterlik, Toplum Geliştirme, Finans, İrşat, Eğitim, Kadın, Gençlik ve Kadın Gençlik olmak üzere sekiz bölüm müdürü ve başkanın danışmanlarından oluşur.",
      en: "The presidium led by the chairman is, alongside the authorized board, the highest decision-making and leadership body of IGMG. It consists of the heads of the eight departments: General Secretariat, Community Development, Finance, Irshad, Education, Women, Youth, and Women's Youth, as well as the advisors to the chairman.",
    },
    ausschuss: {
      de: 'Verantwortlich für die Umsetzung der im Präsidium getroffenen Beschlüsse ist der Zentrale Ausführungsausschuss. Er setzt sich zusammen aus den im Präsidium vertretenen Abteilungsleitern, den stellvertretenden Abteilungsleitern des Generalsekretariats, der Irschadabteilung, der Bildungsabteilung und der Abteilung für Gemeindeentwicklung.',
      tr: 'Başkanlıkta alınan kararların uygulanmasından Merkez Uygulama Komitesi sorumludur. Başkanlıkta temsil edilen bölüm müdürleri, Genel Sekreterlik, İrşat Bölümü, Eğitim Bölümü ve Toplum Geliştirme Bölümü müdür yardımcılarından oluşur.',
      en: 'The Central Executive Committee is responsible for implementing the decisions made in the presidium. It is composed of the department heads represented in the presidium, the deputy department heads of the General Secretariat, the Irshad Department, the Education Department, and the Community Development Department.',
    },
  },
  kontakt: {
    adresse: '[Adresse]',
    telefon: '[Telefonnummer]',
    email: '[E-Mail]',
    website: '[Website]',
  },
};

/** Seed „igmg“ (Welle A): idempotent (onConflictDoNothing), Beispielinhalt mit Quelle, Prüfung gegen das Schema. */
export const seed: BereichsSeed = async (db) => {
  const geprueft = inhaltSchema.parse(inhalt);
  const r = await db
    .insert(schema.seiteninhalt)
    .values({
      bereich: 'igmg',
      istBeispiel: true,
      quelle:
        'bestand/uploads/igmg-wetzlar-website/src/app/components/IGMGInfo.tsx:26-428 (t.de/t.tr/t.en; Gründnung korrigiert, tsx:54); design/IGMGInfo.dc.html:15-110 (Zahlen, Gliederung, Kontakt-Platzhalter); Blatt S12 (DATEN, Auffälligkeiten 1, 3, 5)',
      inhalt: geprueft,
    })
    .onConflictDoNothing({ target: schema.seiteninhalt.bereich })
    .returning({ bereich: schema.seiteninhalt.bereich });
  return r.length;
};
