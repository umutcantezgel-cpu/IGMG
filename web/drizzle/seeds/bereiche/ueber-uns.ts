import type { z } from 'zod';
import { schema } from '../../../src/lib/db';
import { schema as inhaltSchema } from '../../../src/lib/validierung/seiteninhalte/ueber-uns';
import type { BereichsSeed } from './typ';

/**
 * Beispielinhalt „ueber-uns“ (Blatt S08, DATEN). Texte wörtlich aus dem Bestand (LanguageContext aboutUs), Werte und
 * Zeitleistenbilder aus dem Design. Das Gründungsjahr ist offen (1976 gegen 1975): Platzhalter [Gründungsjahr] (G-05).
 * Ersatzzeichen im türkischen Zeitleisten-Eintrag (L:485) durch das eindeutige Wort „taşınma“ ersetzt, siehe OFFENE FRAGEN.
 */
const inhalt: z.input<typeof inhaltSchema> = {
  geschichte: {
    absaetze: [
      {
        absatz: {
          de: 'Die IGMG Fatih Camii wurde erstmals im Jahr [Gründungsjahr] in der Formerstraße gegründet. Mit der wachsenden Gemeinde und den sich entwickelnden Bedürfnissen zogen wir von unserem ersten Standort in die Garbenheimerstraße um. Dort hatten wir die Gelegenheit, eine größere Moschee und ein Gemeindezentrum zu schaffen.',
          tr: "IGMG Fatih Camii, ilk olarak [Kuruluş yılı] yılında Formerstraße'de kuruldu. Zamanla büyüyen cemaatimiz ve gelişen ihtiyaçlarımız doğrultusunda, ilk yerimizden Garbenheimerstraße'ye taşındık. Burada daha büyük bir cami ve toplum merkezi oluşturma fırsatı bulduk.",
          en: 'IGMG Fatih Camii was first established in [Founding year] on Formerstraße. As our community grew and our needs developed, we moved from our first location to Garbenheimerstraße. There we had the opportunity to create a larger mosque and community center.',
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
      kennzeichnung: { de: '[Gründungsjahr]', tr: '[Kuruluş yılı]', en: '[Founding year]' },
      titel: {
        de: '[Gründungsjahr] - Gründung in der Formerstraße',
        tr: "[Kuruluş yılı] - Formerstraße'de kuruluş",
        en: '[Founding year] - Founded on Formerstraße',
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
      kennzeichnung: { de: '2019', tr: '2019', en: '2019' },
      titel: {
        de: '2019 - Umzug zur Philipsstraße (aktueller Standort)',
        tr: "2019 - Philipsstraße'ye taşınma (mevcut konum)",
        en: '2019 - Move to Philipsstraße (current location)',
      },
      ort: { de: 'Philipsstraße', tr: 'Philipsstraße', en: 'Philipsstraße' },
      bildbeschreibung: { de: 'Foto: Moderne Moschee - Neues Zuhause in der Philipsstraße' },
      reihenfolge: 4,
      symbol: 'standort',
    },
    {
      kennzeichnung: { de: 'Zukunft', tr: 'Gelecek', en: 'Future' },
      titel: {
        de: 'Zukunft - Weiterhin im Dienste unserer Gemeinde',
        tr: 'Gelecek - Cemaatimize hizmet etmeye devam',
        en: 'Future - Continuing to serve our community',
      },
      ort: { de: 'Wetzlar', tr: 'Wetzlar', en: 'Wetzlar' },
      bildbeschreibung: { de: 'Foto: Zukunftsvision - Gemeinsam in die Zukunft' },
      reihenfolge: 5,
      symbol: 'aufwaerts',
    },
  ],
  gemeinschaft: {
    absaetze: [
      {
        absatz: {
          de: 'Die Geschichte der IGMG Fatih Camii begann im Keller eines Hauses. Als wir im Jahr [Gründungsjahr] gegründet wurden, beschwerten sich einige Anwohner über den Lärm. Aber wir gaben nicht auf. Mit Glauben und Entschlossenheit setzten wir diese Reise fort, die wir mit unserer kleinen Gemeinschaft begonnen hatten.',
          tr: "IGMG Fatih Camii'nin hikayesi, bir evin bodrum katında başladı. [Kuruluş yılı] yılında kurulduğumuzda, çevredeki bazı sakinler gürültü nedeniyle şikayette bulundular. Ama biz pes etmedik. İnanç ve kararlılıkla, küçük topluluğumuzla başladığımız bu yolculuğu sürdürdük.",
          en: "The story of IGMG Fatih Camii began in the basement of a house. When we were founded in [Founding year], some residents complained about the noise. But we didn't give up. With faith and determination, we continued this journey that we started with our small community.",
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

/** Seed „ueber-uns“ (Welle A): idempotent (onConflictDoNothing), Beispielinhalt mit Quelle, Prüfung gegen das Schema. */
export const seed: BereichsSeed = async (db) => {
  const geprueft = inhaltSchema.parse(inhalt);
  const r = await db
    .insert(schema.seiteninhalt)
    .values({
      bereich: 'ueber-uns',
      istBeispiel: true,
      quelle:
        'bestand/src/app/components/LanguageContext.tsx:209-268 (de), 467-526 (tr), 725-784 (en), L:485 Ersatzzeichen durch taşınma ersetzt; design/AboutUs.dc.html:26-29, 54-58, 92-102; Blatt S08 (Jahresmarken tr/en abgeleitet)',
      inhalt: geprueft,
    })
    .onConflictDoNothing({ target: schema.seiteninhalt.bereich })
    .returning({ bereich: schema.seiteninhalt.bereich });
  return r.length;
};
