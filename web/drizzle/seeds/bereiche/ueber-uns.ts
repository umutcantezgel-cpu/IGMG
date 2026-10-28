import type { z } from 'zod';
import { schema } from '../../../src/lib/db';
import { ENTITAET } from '../../../src/lib/seo/entitaet';
import { schema as inhaltSchema } from '../../../src/lib/validierung/seiteninhalte/ueber-uns';
import type { BereichsSeed } from './typ';

/**
 * Beispielinhalt „ueber-uns“ (Blatt S08, DATEN). Texte wörtlich aus dem Bestand (LanguageContext aboutUs), Werte und
 * Zeitleistenbilder aus dem Design. Ersatzzeichen im türkischen Zeitleisten-Eintrag (L:485) durch das eindeutige Wort
 * „taşınma“ ersetzt, siehe OFFENE FRAGEN.
 * Stand 2026 (AUFTRAG 3.9, E0-K05): Die frühere Station „Zukunft“ ist die Eröffnung der neuen Fatih-Moschee; Jahr und Foto
 * liefert die Gemeinde (MN-08). Die Inhaltsmigration `scripts/inhalte-2026.ts` ersetzt sie in bestehenden Beispieldaten.
 * Marktstart (E-044 Nr. 4): Gründungsjahr 1978 statt des Platzhalters (der Bestand schwankte zwischen 1975 und 1976),
 * belegt durch den IGMG-Bericht zur 30-Jahr-Feier vom 07.04.2008; dazu die Stationen 2008 (30 Jahre) und 2011 (Tag der
 * offenen Moschee, IGMG-Bericht vom 17.10.2011) mit Ort Wetzlar und Fotoplatzhalter. Die Eröffnung bleibt letzte Station.
 */

/** Beleg für den Tag der offenen Moschee 2011 in der Fatih-Moschee Wetzlar (IGMG-Bericht vom 17.10.2011). */
export const ARTIKEL_2011 = 'https://www.igmg.org/gutes-wetter-und-gute-gespra%c2%a4che-ae-tag-der-offenen-moschee-2011-in-wetzlar/';

/** Frühere letzte Station (Bestand), an der die Inhaltsmigration den alten Stand erkennt. */
export const ZEITLEISTE_ZUKUNFT_DE = 'Zukunft';

/** Letzte Station der Zeitleiste „Unsere Reise“: Eröffnung der neuen Fatih-Moschee (Platzhalter für Jahr und Foto). */
export const ZEITLEISTE_EROEFFNUNG = {
  kennzeichnung: { de: '[Jahr – von der Gemeinde]', tr: '[Yıl – cemaat tarafından]', en: '[Year – from the community]' },
  titel: {
    de: '[Jahr – von der Gemeinde] – Eröffnung der neuen Fatih-Moschee',
    tr: "[Yıl – cemaat tarafından] – Yeni Fatih Camii'nin açılışı",
    en: '[Year – from the community] – Opening of the new Fatih Mosque',
  },
  ort: { de: 'Wetzlar', tr: 'Wetzlar', en: 'Wetzlar' },
  bildbeschreibung: {
    de: 'Foto: Neue Fatih-Moschee [Foto – von der Gemeinde]',
    tr: 'Fotoğraf: Yeni Fatih Camii [Fotoğraf – cemaat tarafından]',
    en: 'Photo: New Fatih Mosque [Photo – from the community]',
  },
  // Nach 2019 (6): die Eröffnung bleibt das Ziel des Wegs (B-07)
  reihenfolge: 7,
  symbol: 'gebaeude',
} satisfies NonNullable<z.input<typeof inhaltSchema>['zeitleiste']>[number];

/** Beispielinhalt „ueber-uns“ (exportiert für Stand-Migrationen und Tests). */
export const UEBER_UNS_BEISPIEL: z.input<typeof inhaltSchema> = {
  geschichte: {
    absaetze: [
      {
        absatz: {
          de: 'Die IGMG Fatih Camii wurde erstmals im Jahr 1978 in der Formerstraße gegründet. Mit der wachsenden Gemeinde und den sich entwickelnden Bedürfnissen zogen wir von unserem ersten Standort in die Garbenheimerstraße um. Dort hatten wir die Gelegenheit, eine größere Moschee und ein Gemeindezentrum zu schaffen.',
          tr: "IGMG Fatih Camii, ilk olarak 1978 yılında Formerstraße'de kuruldu. Zamanla büyüyen cemaatimiz ve gelişen ihtiyaçlarımız doğrultusunda, ilk yerimizden Garbenheimerstraße'ye taşındık. Burada daha büyük bir cami ve toplum merkezi oluşturma fırsatı bulduk.",
          en: 'IGMG Fatih Camii was first established in 1978 on Formerstraße. As our community grew and our needs developed, we moved from our first location to Garbenheimerstraße. There we had the opportunity to create a larger mosque and community center.',
        },
      },
      {
        absatz: {
          de: 'Da unsere stetig wachsende Gemeinde jedoch mehr Platz benötigte, entschieden wir uns für einen Umzug zum Niedergirmeser Weg. Hier fanden wir einen größeren und geeigneteren Ort für unsere Gemeinde.',
          tr: "Ancak, sürekli büyüyen cemaatimiz için daha fazla alan gerekti. Bu nedenle Niedergirmeser Weg'e taşınma kararı aldık. Burada cemaatimiz için daha büyük ve daha uygun bir yer bulduk.",
          en: 'However, as our continuously growing community needed more space, we decided to move to Niedergirmeser Weg. Here we found a larger and more suitable place for our community.',
        },
      },
      {
        absatz: {
          de: 'Im Jahr 2008 feierte die Gemeinde ihr 30-jähriges Bestehen in Wetzlar. 2011 öffnete die Fatih-Moschee Wetzlar zum bundesweiten Tag der offenen Moschee ihre Türen für Besucherinnen und Besucher.',
          tr: "Cemaatimiz 2008 yılında Wetzlar'daki 30. kuruluş yılını kutladı. 2011'de ise Wetzlar Fatih Camii, Almanya genelinde düzenlenen Açık Cami Günü'nde kapılarını ziyaretçilere açtı.",
          en: 'In 2008, the community celebrated 30 years in Wetzlar. In 2011, Fatih Mosque Wetzlar opened its doors to visitors for the nationwide Open Mosque Day.',
        },
      },
      {
        absatz: {
          de: 'Im Jahr 2019 fand der letzte und größte Umzug unserer Moschee statt. Unser weitläufiges Gelände in der Philipsstraße wurde zum idealen Ort, um die Bedürfnisse unserer wachsenden Gemeinschaft zu erfüllen.',
          tr: "2019 yılında ise camiimizin son ve en büyük taşınması gerçekleşti. Philipsstraße'deki geniş alanımız, büyüyen topluluğumuzun ihtiyaçlarını karşılamak için ideal bir yer oldu.",
          en: 'In 2019, the last and largest move of our mosque took place. Our spacious grounds on Philipsstraße became the ideal place to meet the needs of our growing community.',
        },
      },
      {
        absatz: {
          de: 'Von der Vergangenheit bis heute ist die Geschichte unserer Moschee eine Geschichte des kontinuierlichen Wachstums und des Strebens, unserer Gemeinde besser zu dienen. Wie heute werden wir auch morgen unserer Gemeinde weiterhin dienen. Wir danken Ihnen, dass Sie uns auf dieser Reise begleiten.',
          tr: 'Geçmişten bugüne, camiimizin öyküsü, sürekli büyüme ve cemaatimize daha iyi hizmet etme çabasının bir hikayesidir. Bugün olduğu gibi, yarın da cemaatimize hizmet etmeye devam edeceğiz. Bizimle bu yolculukta olduğunuz için teşekkür ederiz.',
          en: 'From past to present, the story of our mosque is one of continuous growth and striving to better serve our community. As today, we will continue to serve our community tomorrow. We thank you for being with us on this journey.',
        },
      },
    ],
  },
  zeitleiste: [
    {
      kennzeichnung: { de: '1978', tr: '1978', en: '1978' },
      titel: {
        de: '1978 - Gründung in der Formerstraße',
        tr: "1978 - Formerstraße'de kuruluş",
        en: '1978 - Founded on Formerstraße',
      },
      ort: { de: 'Formerstraße', tr: 'Formerstraße', en: 'Formerstraße' },
      bildbeschreibung: { de: 'Foto: Bescheidenes Gebäude - Anfänge in der Formerstraße' },
      reihenfolge: 1,
      symbol: 'haus',
    },
    {
      kennzeichnung: { de: 'Frühe Jahre', tr: 'İlk yıllar', en: 'Early years' },
      titel: {
        de: 'Frühe Jahre - Umzug zur Garbenheimerstraße',
        tr: "İlk yıllar - Garbenheimerstraße'ye taşınma",
        en: 'Early years - Move to Garbenheimerstraße',
      },
      ort: { de: 'Garbenheimerstraße', tr: 'Garbenheimerstraße', en: 'Garbenheimerstraße' },
      bildbeschreibung: { de: 'Foto: Größeres Gemeindezentrum - Wachstum in Garbenheimerstraße' },
      reihenfolge: 2,
      symbol: 'gebaeude',
    },
    {
      kennzeichnung: { de: 'Wachstumsphase', tr: 'Büyüme dönemi', en: 'Growth period' },
      titel: {
        de: 'Wachstumsphase - Umzug zum Niedergirmeser Weg',
        tr: "Büyüme dönemi - Niedergirmeser Weg'e taşınma",
        en: 'Growth period - Move to Niedergirmeser Weg',
      },
      ort: { de: 'Niedergirmeser Weg', tr: 'Niedergirmeser Weg', en: 'Niedergirmeser Weg' },
      bildbeschreibung: { de: 'Foto: Wachsende Gemeinde - Expansion am Niedergirmeser Weg' },
      reihenfolge: 3,
      symbol: 'gemeinde',
    },
    {
      kennzeichnung: { de: '2008', tr: '2008', en: '2008' },
      titel: {
        de: '2008 - 30 Jahre Gemeinde',
        tr: '2008 - Cemaatimizin 30. yılı',
        en: '2008 - 30 years of our community',
      },
      ort: { de: 'Wetzlar', tr: 'Wetzlar', en: 'Wetzlar' },
      bildbeschreibung: {
        de: 'Foto: Feier zum 30-jährigen Bestehen [Foto – von der Gemeinde]',
        tr: 'Fotoğraf: 30. yıl kutlaması [Fotoğraf – cemaat tarafından]',
        en: 'Photo: 30th anniversary celebration [Photo – from the community]',
      },
      reihenfolge: 4,
      symbol: 'herz',
    },
    {
      kennzeichnung: { de: '2011', tr: '2011', en: '2011' },
      titel: {
        de: '2011 - Tag der offenen Moschee in der Fatih-Moschee',
        tr: "2011 - Fatih Camii'nde Açık Cami Günü",
        en: '2011 - Open Mosque Day at the Fatih Mosque',
      },
      ort: { de: 'Wetzlar', tr: 'Wetzlar', en: 'Wetzlar' },
      bildbeschreibung: {
        de: 'Foto: Tag der offenen Moschee 2011 [Foto – von der Gemeinde]',
        tr: 'Fotoğraf: 2011 Açık Cami Günü [Fotoğraf – cemaat tarafından]',
        en: 'Photo: Open Mosque Day 2011 [Photo – from the community]',
      },
      reihenfolge: 5,
      symbol: 'gemeinde',
    },
    {
      kennzeichnung: { de: '2019', tr: '2019', en: '2019' },
      titel: {
        de: '2019 - Umzug zur Philipsstraße (aktueller Standort)',
        tr: "2019 - Philipsstraße'ye taşınma (mevcut konum)",
        en: '2019 - Move to Philipsstraße (current location)',
      },
      ort: { de: 'Philipsstraße', tr: 'Philipsstraße', en: 'Philipsstraße' },
      bildbeschreibung: { de: 'Foto: Moderne Moschee - Neues Zuhause in der Philipsstraße' },
      reihenfolge: 6,
      symbol: 'standort',
    },
    ZEITLEISTE_EROEFFNUNG,
  ],
  gemeinschaft: {
    absaetze: [
      {
        absatz: {
          de: 'Die Geschichte der IGMG Fatih Camii begann im Keller eines Hauses. Als wir im Jahr 1978 gegründet wurden, beschwerten sich einige Anwohner über den Lärm. Aber wir gaben nicht auf. Mit Glauben und Entschlossenheit setzten wir diese Reise fort, die wir mit unserer kleinen Gemeinschaft begonnen hatten.',
          tr: "IGMG Fatih Camii'nin hikayesi, bir evin bodrum katında başladı. 1978 yılında kurulduğumuzda, çevredeki bazı sakinler gürültü nedeniyle şikayette bulundular. Ama biz pes etmedik. İnanç ve kararlılıkla, küçük topluluğumuzla başladığımız bu yolculuğu sürdürdük.",
          en: "The story of IGMG Fatih Camii began in the basement of a house. When we were founded in 1978, some residents complained about the noise. But we didn't give up. With faith and determination, we continued this journey that we started with our small community.",
        },
      },
      {
        absatz: {
          de: 'Im Laufe der Zeit begann unsere kleine Gemeinde zu wachsen und schließlich, nach jahrelangen Anstrengungen, fanden wir die Gelegenheit, unser eigenes Eigentum zu erwerben.',
          tr: 'Zaman geçtikçe, küçük cemaatimiz büyümeye başladı ve sonunda, yıllar süren çaba sonucunda, kendimize ait bir mülk edinme fırsatı bulduk.',
          en: 'Over time, our small congregation began to grow and finally, after years of effort, we found the opportunity to acquire our own property.',
        },
      },
      {
        absatz: {
          de: 'Die Geschichte der IGMG Fatih Camii ist eine Geschichte von Glaube, Vertrauen, Ausdauer und Gemeinschaftsgeist. Und diese Geschichte wird, wie heute, auch morgen weitergehen. Wir danken Ihnen, dass Sie diesen Weg mit uns gegangen sind.',
          tr: "IGMG Fatih Camii'nin hikayesi, iman, inanç, azim ve topluluk ruhunun bir hikayesidir. Ve bu hikaye, bugün olduğu gibi, yarın da devam edecektir. Bu yolu birlikte yürüdüğünüz için teşekkür ederiz.",
          en: 'The story of IGMG Fatih Camii is a story of faith, belief, perseverance and community spirit. And this story will continue tomorrow, just as it does today. Thank you for walking this path with us.',
        },
      },
    ],
  },
  werte: [
    {
      titel: { de: 'Glaube', tr: 'İman', en: 'Faith' },
      beschreibung: {
        de: 'Unser Glaube ist das Fundament unserer Gemeinschaft und leitet uns in allem, was wir tun.',
        tr: 'İmanımız cemaatimizin temelidir ve yaptığımız her şeyde bize rehberlik eder.',
        en: 'Our faith is the foundation of our community and guides us in everything we do.',
      },
      reihenfolge: 1,
      symbol: 'herz',
    },
    {
      titel: { de: 'Gemeinschaft', tr: 'Topluluk', en: 'Community' },
      beschreibung: {
        de: 'Wir schaffen einen Ort der Zusammengehörigkeit für alle Mitglieder unserer vielfältigen Gemeinde.',
        tr: 'Çeşitli cemaatimizin tüm üyeleri için aidiyet duygusu yaratan bir yer oluştururuz.',
        en: 'We create a place of belonging for all members of our diverse congregation.',
      },
      reihenfolge: 2,
      symbol: 'gemeinde',
    },
    {
      titel: { de: 'Dienst', tr: 'Hizmet', en: 'Service' },
      beschreibung: {
        de: 'Wir sind der Gemeinde und der Gesellschaft durch Bildung, soziale Dienste und spirituelle Führung verpflichtet.',
        tr: 'Eğitim, sosyal hizmetler ve manevi rehberlik yoluyla cemaat ve topluma hizmet etmeyi taahhüt ediyoruz.',
        en: 'We are committed to serving the community and society through education, social services and spiritual guidance.',
      },
      reihenfolge: 3,
      symbol: 'gebaeude',
    },
    {
      titel: { de: 'Wachstum', tr: 'Büyüme', en: 'Growth' },
      beschreibung: {
        de: 'Wir wachsen kontinuierlich, um den sich wandelnden Bedürfnissen unserer Gemeinde gerecht zu werden.',
        tr: 'Cemaatimizin değişen ihtiyaçlarını karşılamak için sürekli olarak büyürüz.',
        en: 'We continuously grow to meet the changing needs of our community.',
      },
      reihenfolge: 4,
      symbol: 'aufwaerts',
    },
  ],
};

/** Quelle des Beispielinhalts (ADR 0015), mit den Belegen zum Marktstart (E-044). */
export const UEBER_UNS_QUELLE =
  'bestand/src/app/components/LanguageContext.tsx:209-268 (de), 467-526 (tr), 725-784 (en), L:485 Ersatzzeichen durch taşınma ersetzt; design/AboutUs.dc.html:26-29, 54-58, 92-102; Blatt S08 (Jahresmarken tr/en abgeleitet); letzte Station „Eröffnung der neuen Fatih-Moschee“ nach AUFTRAG 3.9 (Jahr und Foto Platzhalter, MN-08); ' +
  `Gründungsjahr 1978 nach E-044 Nr. 4, Beleg ${ENTITAET.gruendungBeleg} (07.04.2008, 30-Jahr-Feier); Stationen 2008 und 2011 und der Absatz dazu nach diesem Bericht und ${ARTIKEL_2011} (17.10.2011), eigene Worte`;

/** Seed „ueber-uns“ (Welle A): idempotent (onConflictDoNothing), Beispielinhalt mit Quelle, Prüfung gegen das Schema. */
export const seed: BereichsSeed = async (db) => {
  const geprueft = inhaltSchema.parse(UEBER_UNS_BEISPIEL);
  const r = await db
    .insert(schema.seiteninhalt)
    .values({
      bereich: 'ueber-uns',
      istBeispiel: true,
      quelle: UEBER_UNS_QUELLE,
      inhalt: geprueft,
    })
    .onConflictDoNothing({ target: schema.seiteninhalt.bereich })
    .returning({ bereich: schema.seiteninhalt.bereich });
  return r.length;
};
