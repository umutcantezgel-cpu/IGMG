import type { z } from 'zod';
import { schema } from '../../../src/lib/db';
import { schema as inhaltSchema } from '../../../src/lib/validierung/seiteninhalte/projekte';
import type { BereichsSeed } from './typ';

/**
 * Beispielinhalt „projekte“ (Blatt S10, DATEN). Texte, Namen und Zahlen wörtlich aus dem Design (Projects.dc.html) und dem
 * Bestand (Projects.tsx, tr/en); fehlende tr/en-Fassungen sind NEU ÜBERSETZT (Meldung im Bericht). Ortsangabe nicht
 * ausgeschrieben: [Ortsangabe] (Blatt S10, A5). Beträge und Bankverbindung bleiben Platzhalter (G-05): Die Gemeinde
 * liefert gesammelten Betrag, Zielbetrag und Kontodaten.
 */
const inhalt: z.input<typeof inhaltSchema> = {
  projekt: {
    name: {
      de: 'Neue Fatih Moschee Projekt',
      tr: 'Yeni Fatih Cami Projesi',
      en: 'New Fatih Mosque Project',
    },
    status: 'in_planung',
    ort: { de: '[Ortsangabe]', tr: '[Ortsangabe]', en: '[Ortsangabe]' },
    beginn: 2024,
    fertigstellung: 2026,
    beschreibung: {
      de: 'Das neue Moschee-Projekt in der [Ortsangabe] hat trotz verschiedener Hindernisse über viele Jahre hinweg Fortschritte gemacht. Obwohl es von der örtlichen Verwaltung kontinuierlich blockiert wurde, haben wir mit Entschlossenheit und Beharrlichkeit unseren Weg fortgesetzt. Und endlich wurden uns die lang erwarteten Genehmigungen erteilt, um mit diesem wichtigen Projekt fortzufahren.',
      tr: "[Ortsangabe]'deki yeni cami projesi, uzun yıllar boyunca çeşitli engellere rağmen ilerlemeye devam etti. Yerel yönetim tarafından sürekli olarak bloke edilmesine rağmen, azim ve kararlılıkla yolumuza devam ettik. Ve nihayet, bu önemli projeye devam etmek için beklediğimiz izinler verildi.",
      en: 'The new mosque project on [Ortsangabe] has continued to progress over many years despite various obstacles. Although it was continuously blocked by the local administration, we continued on our path with determination and perseverance. And finally, we have been granted the long-awaited permits to continue with this important project.',
    },
    kapazitaet: {
      wert: 500,
      einheit: { de: 'Gläubige', tr: 'Cemaat', en: 'Worshippers' },
    },
    flaecheM2: 1200,
    einrichtungen: [
      { de: 'Hauptgebetsraum', tr: 'Ana İbadet Salonu', en: 'Main Prayer Hall' },
      { de: 'Frauengebetsbereich', tr: 'Kadınlar Bölümü', en: "Women's Prayer Area" },
      { de: 'Koranschule', tr: 'Kuran Kursu', en: 'Quran School' },
      { de: 'Gemeindezentrum', tr: 'Cemaat Merkezi', en: 'Community Center' },
      { de: 'Bibliothek', tr: 'Kütüphane', en: 'Library' },
      { de: 'Küche und Sozialräume', tr: 'Mutfak ve Sosyal Alanlar', en: 'Kitchen and Social Areas' },
    ],
    modell: null,
  },
  spende: {
    titel: { de: 'Die Bedeutung von Spenden', tr: 'Bağışların Önemi', en: 'The Importance of Donations' },
    text: {
      de: 'Jetzt brauchen wir Ihre Hilfe, um dieses Ziel zu erreichen. Ein wichtiger Teil der Finanzierung kommt aus Ihren Spenden. Jede Spende bringt uns unserem Ziel einen Schritt näher und hilft uns, es schneller zu verwirklichen. Spenden jeder Größe helfen uns dabei, dieses wertvolle Projekt zu verwirklichen.',
      tr: 'Şimdi, bu hedefe ulaşmak için sizin yardımınıza ihtiyacımız var. Finansmanın önemli bir parçası bağışlarınızdan gelmektedir. Yapılan her bağış, hedefimize bir adım daha yaklaşmamızı sağlar ve daha hızlı bir şekilde tamamlamamıza yardımcı olur. Her büyüklükteki bağış, bu değerli projeyi hayata geçirmemize yardımcı olur.',
      en: 'Now we need your help to achieve this goal. A significant part of the funding comes from your donations. Every donation made brings us one step closer to our goal and helps us complete it faster. Donations of every size help us bring this valuable project to life.',
    },
    gesammelt: null,
    ziel: null,
    bankverbindung: { de: '[Bankverbindung – von der Gemeinde]' },
  },
  unterstuetzung: {
    titel: { de: 'Unterstützen Sie uns', tr: 'Destek Olun', en: 'Support Us' },
    text: {
      de: 'Werden Sie Teil dieses historischen Moments. Auch Sie können zum Moschee-Projekt in der [Ortsangabe] beitragen und dabei helfen, die Zukunft unserer Gemeinschaft zu gestalten. Spenden Sie noch heute und schließen Sie sich uns auf dieser wichtigen Reise an, um zur Entwicklung unserer Gemeinschaft beizutragen. Ihre Spende ist von entscheidender Bedeutung für den Bau einer Moschee, die zukünftigen Generationen dienen wird.',
      tr: "Bu tarihi anın bir parçası olun. Siz de [Ortsangabe]'deki cami projesine katkıda bulunarak, topluluğumuzun geleceğini şekillendirmeye yardımcı olabilirsiniz. Bugün bağış yaparak, bizimle birlikte bu önemli yolculuğa çıkın ve topluluğumuzun gelişmesine katkıda bulunun. Bağışınız, gelecek nesillere hizmet edecek bir caminin inşası için kritik öneme sahiptir.",
      en: 'Be part of this historic moment. You too can contribute to the mosque project on [Ortsangabe] and help shape the future of our community. Donate today and join us on this important journey to contribute to the development of our community. Your donation is critical for the construction of a mosque that will serve future generations.',
    },
    dank: {
      de: 'Wir danken jedem unserer Unterstützer dafür, dass sie uns bei der Verwirklichung dieses wertvollen Projekts geholfen haben. Wir glauben, dass wir gemeinsam unsere neue Moschee in der [Ortsangabe] bauen und eine neue Ära für unsere Gemeinschaft einläuten können.',
      tr: "Her bir destekçimize, bu değerli projeyi gerçekleştirmemizde bize yardımcı oldukları için teşekkür ederiz. İnanıyoruz ki, birlikte, [Ortsangabe]'deki yeni camiimizi inşa edebilir ve topluluğumuz için yeni bir dönemi başlatabiliriz.",
      en: 'We thank each of our supporters for helping us realize this valuable project. We believe that together, we can build our new mosque on [Ortsangabe] and usher in a new era for our community.',
    },
  },
  meilensteine: [
    {
      titel: { de: 'Genehmigungen erhalten', tr: 'İzinler Alındı', en: 'Permits Obtained' },
      beschreibung: {
        de: 'Alle erforderlichen Baugenehmigungen wurden erteilt',
        tr: 'Tüm gerekli yapı izinleri verildi',
        en: 'All required building permits have been granted',
      },
      datum: { de: 'März 2024', tr: 'Mart 2024', en: 'March 2024' },
      erledigt: true,
    },
    {
      titel: { de: 'Architektenpläne finalisiert', tr: 'Mimar Planları Tamamlandı', en: 'Architect Plans Finalized' },
      beschreibung: {
        de: 'Detaillierte Baupläne und Designs abgeschlossen',
        tr: 'Detaylı yapı planları ve tasarımlar tamamlandı',
        en: 'Detailed construction plans and designs completed',
      },
      datum: { de: 'April 2024', tr: 'Nisan 2024', en: 'April 2024' },
      erledigt: true,
    },
    {
      titel: { de: 'Grundsteinlegung', tr: 'Temel Atma', en: 'Groundbreaking' },
      beschreibung: { de: 'Offizielle Grundsteinlegungszeremonie', tr: 'Resmi temel atma töreni', en: 'Official groundbreaking ceremony' },
      datum: { de: 'September 2024', tr: 'Eylül 2024', en: 'September 2024' },
      erledigt: false,
    },
    {
      titel: { de: 'Rohbau', tr: 'Kaba İnşaat', en: 'Shell Construction' },
      beschreibung: {
        de: 'Fertigstellung der Rohbauarbeiten',
        tr: 'Kaba inşaat işlerinin tamamlanması',
        en: 'Completion of shell construction work',
      },
      datum: { de: 'März 2025', tr: 'Mart 2025', en: 'March 2025' },
      erledigt: false,
    },
    {
      titel: { de: 'Innenausstattung', tr: 'İç Dekorasyon', en: 'Interior Design' },
      beschreibung: {
        de: 'Innenausstattung und finale Arbeiten',
        tr: 'İç dekorasyon ve son işlemler',
        en: 'Interior design and finishing work',
      },
      datum: { de: 'Oktober 2025', tr: 'Ekim 2025', en: 'October 2025' },
      erledigt: false,
    },
    {
      titel: { de: 'Eröffnung', tr: 'Açılış', en: 'Opening' },
      beschreibung: {
        de: 'Offizielle Eröffnung der neuen Moschee',
        tr: 'Yeni caminin resmi açılışı',
        en: 'Official opening of the new mosque',
      },
      datum: { de: 'Januar 2026', tr: 'Ocak 2026', en: 'January 2026' },
      erledigt: false,
    },
  ],
};

/** Seed „projekte“ (Welle A): idempotent (onConflictDoNothing), Beispielinhalt mit Quelle, Prüfung gegen das Schema. */
export const seed: BereichsSeed = async (db) => {
  const geprueft = inhaltSchema.parse(inhalt);
  const r = await db
    .insert(schema.seiteninhalt)
    .values({
      bereich: 'projekte',
      istBeispiel: true,
      quelle:
        'design/Projects.dc.html: Name D:26, Status D:27, Beschreibung D:32, Zeitraum D:34-35, Spenden D:42-43, Spendenkonto D:49, Spezifikationen D:58-61, Unterstützen D:66-68, Meilensteine D:93-104; bestand/src/app/components/Projects.tsx (de/tr/en): Name T:31, T:112, T:193; Beschreibung T:32, T:113, T:194; Zeitraum T:35-36, T:116-117, T:197-198; Spenden T:39-43, T:120-123, T:201-204; Unterstützen T:46-48, T:127-129, T:208-210; Einrichtungen T:92-97, T:173-178, T:254-259; Meilensteine T:52-85, T:133-166, T:214-247; Knöpfe T:183-185, T:264-266; Blatt S10 (Ortsangabe [Ortsangabe] nach A5; Beträge und Bankverbindung nur Platzhalter nach G-05)',
      inhalt: geprueft,
    })
    .onConflictDoNothing({ target: schema.seiteninhalt.bereich })
    .returning({ bereich: schema.seiteninhalt.bereich });
  return r.length;
};
