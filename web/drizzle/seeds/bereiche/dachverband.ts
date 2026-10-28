import type { z } from 'zod';
import { schema } from '../../../src/lib/db';
import { NETZWERK } from '../../../src/lib/dachverband/netzwerk';
import { schema as inhaltSchema } from '../../../src/lib/validierung/seiteninhalte/dachverband';
import type { BereichsSeed } from './typ';

/**
 * Beispielinhalt „dachverband“ (Plan Marktstart P3, E-044 Nr. 1 und 2, ADR 0046): Freitagspredigten (Hutba) und
 * Gemeinschaftsthemen der IGMG – nur Links, keine Bilder (K-14), keine politischen Pressemitteilungen.
 *
 * Freitagspredigten: Titel, Link und Veröffentlichung aus dem RSS-Feed der IGMG (Abruf 28.10.2026: 20.08.–22.10.2026) und
 * für 30.07.–13.08.2026 aus der Rubrikseite im Crawl vom 13.10.2026. Datum ist jeweils der Freitag der Woche (die IGMG
 * veröffentlicht meist donnerstags). Kein Kurztext und kein Auszug (G-06). Türkische und englische Titel und Adressen nur,
 * wo sie auf den Startseiten igmg.org/tr/ bzw. /en/ (Crawl 13.10.2026) mit gleichem Datum in der Rubrik
 * „Cuma Hutbesi“/„Friday Khutba“ stehen – die Zuordnung ist über Datum und Rubrik abgeleitet, nicht über hreflang
 * (M-102); sonst sichtbarer Rückfall auf die deutsche Seite (K-02). Die Kennung ist der Adressteil wie im Feed-Abgleich,
 * damit der Abgleich die Einträge wiedererkennt.
 *
 * Gemeinschaftsthemen: Kurztexte eigenständig formuliert (de/tr/en) aus den belegten Angaben der verlinkten IGMG-Seiten;
 * keine Personennamen (G-04), keine Aussage über eine Teilnahme der Gemeinde Wetzlar (G-05). Ausgewählt nach der
 * Positivliste aus dem Plan; nicht aufgenommen: Pressemitteilungen zu Wahlen, Politik und Landespolitik, SES Academy.
 */

const IGMG = 'https://www.igmg.org';

/** Herkunft des Seeds (Spalte `quelle`). */
export const DACHVERBAND_QUELLE = [
  `${IGMG}/category/irschad/freitagspredigt/feed/ (Abruf 28.10.2026)`,
  `${IGMG}/freitagspredigt/, ${IGMG}/tr/, ${IGMG}/en/ (Crawl 13.10.2026)`,
  `${IGMG}/tag-der-offenen-moschee-offene-tueren-fuer-begegnung-und-zusammenhalt/ (03.10.2026)`,
  `${IGMG}/umweltbewusst-zur-moschee-islamische-gemeinschaft-startet-vierte-emissionsfreie-woche/ (11.09.2026)`,
  `${IGMG}/ramazan-yoldasim/ (Dateien Januar 2026)`,
  `${IGMG}/bayram-unter-nachbarn-aktion-erfolgreich-durchgefuehrt/ (26.03.2026)`,
  `${IGMG}/ratgeber-fuer-klimafreundliche-moscheen/ (Datei April 2026)`,
  `${IGMG}/qalam/ (Broschüre Oktober 2024)`,
]
  .join('; ')
  .concat(' – Texte eigenständig formuliert mit Zustimmung der IGMG (E-044, ADR 0046); Hutba nur Titel, Datum und Link (G-06)');

type Eingabe = z.input<typeof inhaltSchema>;
type EintragEingabe = NonNullable<Eingabe['eintraege']>[number];

/** Freitagspredigt aus dem Feed: Kennung = Adressteil, Datum = Freitag der Woche, ohne Kurztext. */
const hutba = (
  pfad: string,
  datum: string,
  titel: { de: string; tr?: string; en?: string },
  fassungen: { tr?: string; en?: string } = {},
): EintragEingabe => ({
  schluessel: pfad,
  art: 'hutba',
  datum,
  titel,
  url: `${IGMG}/${pfad}/`,
  ...(fassungen.tr ? { urlTr: `${IGMG}/tr/${fassungen.tr}/` } : {}),
  ...(fassungen.en ? { urlEn: `${IGMG}/en/${fassungen.en}/` } : {}),
  sichtbar: true,
  herkunft: 'feed',
});

/** Beispielinhalt (Eingabeform des Schemas); exportiert für die Stand-Migration (Welle 3) und die Tests. */
export const DACHVERBAND_BEISPIEL: Eingabe = {
  eintraege: [
    // Feed, Veröffentlichung 22.10.2026 (Titel und Adressteil weichen im Feed voneinander ab)
    hutba('vorurteile-und-gesellschaftlicher-frieden-2', '2026-10-23', { de: 'Mit Würde gegen Islamfeindlichkeit' }),
    hutba('vorurteile-und-gesellschaftlicher-frieden', '2026-10-16', { de: 'Vorurteile und gesellschaftlicher Frieden' }),
    hutba(
      'rechte-und-pflichten-in-sozialen-medien',
      '2026-10-09',
      { de: 'Rechte und Pflichten in sozialen Medien', tr: 'Sosyal Medyada Kul Hakkı', en: 'The Rights of Others on Social Media' },
      { tr: 'sosyal-medyada-kul-hakki', en: 'the-rights-of-others-on-social-media' },
    ),
    {
      schluessel: 'tag-der-offenen-moschee-2026',
      art: 'kampagne',
      datum: '2026-10-03',
      titel: { de: 'Tag der offenen Moschee 2026', tr: 'Açık Cami Günü 2026', en: 'Open Mosque Day 2026' },
      kurztext: {
        de: 'Am 3. Oktober 2026 öffneten mehr als 200 Moscheen der IGMG ihre Türen – zum 30. Tag der offenen Moschee seit 1997. Seit 2007 koordiniert der Koordinationsrat der Muslime (KRM) den bundesweiten Aktionstag. Gäste lernten Gemeinden, Gebetsräume und den Alltag von Musliminnen und Muslimen kennen.',
        tr: '3 Ekim 2026’da IGMG’ye bağlı 200’den fazla cami kapılarını ziyaretçilere açtı. 1997’den beri düzenlenen Açık Cami Günü bu yıl 30. kez yapıldı; etkinliği 2007’den bu yana Müslümanlar Koordinasyon Konseyi (KRM) koordine ediyor. Ziyaretçiler cemaatleri, ibadet mekânlarını ve Müslümanların gündelik hayatını yakından tanıdı.',
        en: 'On 3 October 2026, more than 200 IGMG mosques opened their doors to visitors – the 30th Open Mosque Day since the first one in 1997. Since 2007, the Coordination Council of Muslims (KRM) has coordinated the nationwide day. Guests got to know the communities, their prayer rooms and the everyday life of Muslims.',
      },
      url: `${IGMG}/tag-der-offenen-moschee-offene-tueren-fuer-begegnung-und-zusammenhalt/`,
      sichtbar: true,
      herkunft: 'redaktion',
    },
    hutba(
      'infak-barmherzig-wirtschaften',
      '2026-10-02',
      { de: 'Infak – barmherzig wirtschaften', tr: 'İnfak: Merhamet Ekonomisi', en: 'Infaq: The Economy of Compassion' },
      { tr: 'infak-merhamet-ekonomisi', en: 'infaq-the-economy-of-compassion' },
    ),
    hutba(
      'der-wert-des-lehrens-und-des-gelehrten',
      '2026-09-25',
      { de: 'Der Wert des Lehrens und des Gelehrten', tr: 'Öğretmenin ve Âlimin Konumu', en: 'The Status of Teachers and Scholars' },
      { tr: 'oegretmenin-ve-alimin-konumu', en: 'the-status-of-teachers-and-scholars' },
    ),
    hutba(
      'gerechtigkeit-und-barmherzigkeit-in-der-erziehung',
      '2026-09-18',
      { de: 'Gerechtigkeit und Barmherzigkeit in der Erziehung', en: 'Justice and Compassion in Education' },
      { en: 'justice-and-compassion-in-education' },
    ),
    {
      schluessel: 'emissionsfreie-woche-2026',
      art: 'kampagne',
      datum: '2026-09-11',
      titel: { de: 'Emissionsfreie Woche 2026', tr: 'Emisyonsuz Hafta 2026', en: 'Emission-Free Week 2026' },
      kurztext: {
        de: 'Vom 16. bis 22. September 2026 bat die IGMG ihre Gemeinden, möglichst ohne eigenes Auto zur Moschee zu kommen: zu Fuß, mit dem Rad, mit Bus und Bahn oder in Fahrgemeinschaften. Die Klimakommission der IGMG richtete die Aktionswoche zum vierten Mal aus; Gemeinden konnten eigene Info-Abende zu Klima und Umwelt anbieten.',
        tr: 'IGMG, 16–22 Eylül 2026 tarihleri arasında cemaatlerinden camiye mümkün olduğunca kendi arabaları olmadan gelmelerini istedi: yürüyerek, bisikletle, toplu taşımayla ya da araç paylaşımıyla. Etkinliği IGMG İklim Komisyonu dördüncü kez düzenledi; cemaatler iklim ve çevre üzerine kendi bilgilendirme akşamlarını da yapabildi.',
        en: 'From 16 to 22 September 2026, the IGMG asked its communities to come to the mosque without their own car where possible – on foot, by bike, by bus and train or by car-sharing. The IGMG Climate Commission organised the week for the fourth time; communities could also hold their own information evenings on climate and the environment.',
      },
      url: `${IGMG}/umweltbewusst-zur-moschee-islamische-gemeinschaft-startet-vierte-emissionsfreie-woche/`,
      sichtbar: true,
      herkunft: 'redaktion',
    },
    hutba(
      'charakter-muslimischer-eltern',
      '2026-09-11',
      { de: 'Charakter muslimischer Eltern', en: 'The Ethics of Parenting' },
      { en: 'the-ethics-of-parenting' },
    ),
    hutba(
      'wissen-und-weisheit-im-islam',
      '2026-09-04',
      { de: 'Wissen und Weisheit im Islam', en: 'Education in Knowledge and Wisdom' },
      { en: 'education-in-knowledge-and-wisdom' },
    ),
    hutba(
      'charakter-und-gesetz-als-gesellschaftsvertrag',
      '2026-08-28',
      { de: 'Charakter und Gesetz als Gesellschaftsvertrag', en: 'Social Contract: Morality and Law' },
      { en: 'social-contract-morality-and-law' },
    ),
    hutba(
      'mawlid-nacht-das-erbe-des-propheten-achten',
      '2026-08-21',
      { de: 'Mawlid-Nacht: das Erbe des Propheten achten', en: 'Mawlid al-Nabi: Upholding the Legacy of the Prophet of Mercy' },
      { en: 'mawlid-al-nabi-upholding-the-legacy-of-the-prophet-of-mercy' },
    ),
    // Rubrikseite im Crawl (13.10.2026); nicht mehr im aktuellen Feed
    hutba(
      'gleichgewicht-von-wissen-und-handeln',
      '2026-08-14',
      { de: 'Gleichgewicht von Wissen und Handeln', en: 'The Balance Between Knowledge and Action' },
      { en: 'the-balance-between-knowledge-and-action' },
    ),
    hutba(
      'hutba-islamische-kultur',
      '2026-08-07',
      { de: 'Islamische Kultur', en: 'Islamic Civilisation and Values' },
      { en: 'islamic-civilisation-and-values' },
    ),
    hutba(
      'die-kaaba-orientierung-fuer-koerper-und-geist',
      '2026-07-31',
      { de: 'Die Kaaba: Orientierung für Körper und Geist', en: 'Kaaba: The Qibla of Our Bodies and Our Hearts' },
      { en: 'kaaba-the-qibla-of-our-bodies-and-our-hearts' },
    ),
    {
      schluessel: 'klima-ratgeber-2026',
      art: 'bildung',
      datum: '2026-04',
      titel: {
        de: 'Ratgeber für klimafreundliche Moscheen',
        tr: 'İklim dostu camiler için rehber',
        en: 'Guide to climate-friendly mosques',
      },
      kurztext: {
        de: 'Die IGMG hat einen Leitfaden für klimafreundliche Moscheegemeinden herausgegeben. Er enthält Vorschläge für alte wie neue Gebäude, für große Anlagen ebenso wie für kleine Gebetsräume, und zeigt, wie Umweltschutz Teil der Bildungsarbeit werden kann. Das PDF ist frei abrufbar, die gedruckte Fassung lässt sich kostenlos bestellen.',
        tr: 'IGMG, iklim dostu cami cemiyetleri için bir rehber yayımladı. Rehber eski ve yeni binalar, büyük külliyeler ve küçük mescitler için öneriler sunuyor ve çevre korumanın eğitim çalışmalarının bir parçası nasıl olabileceğini gösteriyor. PDF serbestçe indirilebilir, basılı nüsha ücretsiz sipariş edilebilir.',
        en: 'The IGMG has published a guide for climate-friendly mosque communities. It offers suggestions for old and new buildings, for large complexes and small prayer rooms alike, and shows how environmental protection can become part of educational work. The PDF is freely available, and printed copies can be ordered free of charge.',
      },
      url: NETZWERK.klimaRatgeber.url.de,
      sichtbar: true,
      herkunft: 'redaktion',
    },
    {
      schluessel: 'bayram-unter-nachbarn-2026',
      art: 'frauen',
      datum: '2026-03-26',
      titel: {
        de: 'Bayram unter Nachbarn',
        tr: 'Bayram unter Nachbarn: komşularla bayramlaşma',
        en: 'Bayram unter Nachbarn: celebrating Eid with neighbours',
      },
      kurztext: {
        de: 'Zum Ramadanfest 2026 hat die Frauenorganisation der IGMG die Aktion Bayram unter Nachbarn durchgeführt, als Beitrag zu den Internationalen Wochen gegen Rassismus. Wie der Name sagt, ging es darum, das Fest mit der Nachbarschaft zu teilen.',
        tr: 'IGMG Kadınlar Teşkilatı, 2026 Ramazan Bayramı’nda Uluslararası Irkçılığa Karşı Haftalar kapsamında Bayram unter Nachbarn (Komşularla Bayram) etkinliğini gerçekleştirdi. Adından da anlaşılacağı gibi amaç, bayram sevincini komşularla paylaşmaktı.',
        en: 'For Eid al-Fitr 2026, the IGMG Women’s Organisation held its Bayram unter Nachbarn campaign (Eid among neighbours) as part of the International Weeks against Racism. As the name suggests, the idea was to share the festival with the people next door.',
      },
      url: `${IGMG}/bayram-unter-nachbarn-aktion-erfolgreich-durchgefuehrt/`,
      sichtbar: true,
      herkunft: 'redaktion',
    },
    {
      schluessel: 'ramadan-begleiter-2026',
      art: 'kampagne',
      datum: '2026-01',
      titel: { de: 'Ramadan-Begleiter der IGMG', tr: 'Ramazan Yoldaşım', en: 'IGMG Ramadan Guide' },
      kurztext: {
        de: 'Zum Ramadan 2026 hat die IGMG ihren Ramadan-Begleiter in drei Sprachen herausgegeben: auf Deutsch, Türkisch und Englisch. Die Hefte stehen als PDF kostenlos zum Herunterladen bereit.',
        tr: 'IGMG, 2026 Ramazanı için Ramazan Yoldaşım kitapçığını Türkçe, Almanca ve İngilizce olarak yayımladı. Kitapçıklar PDF olarak ücretsiz indirilebilir.',
        en: 'For Ramadan 2026, the IGMG published its Ramadan guide in three languages: German, Turkish and English. The booklets can be downloaded free of charge as PDF files.',
      },
      url: NETZWERK.ramazanYoldasim.url.de,
      sichtbar: true,
      herkunft: 'redaktion',
    },
    {
      schluessel: 'qalam-bildungsakademie',
      art: 'bildung',
      datum: '2024-10',
      titel: { de: 'Qalam Bildungsakademie', tr: 'Qalam Eğitim Akademisi', en: 'Qalam Education Academy' },
      kurztext: {
        de: 'Die Qalam Bildungsakademie der IGMG-Bildungsabteilung richtet sich an Menschen, die neu zum Islam gefunden haben, und an Erwachsene, die ihren Glauben von Grund auf kennenlernen möchten. Kurse gibt es auf Deutsch, Englisch, Französisch und Niederländisch.',
        tr: 'IGMG Eğitim Başkanlığı’nın Qalam Eğitim Akademisi, İslam’ı yeni seçenlere ve dinini temelden öğrenmek isteyen yetişkinlere yöneliyor. Kurslar Almanca, İngilizce, Fransızca ve Felemenkçe olarak sunuluyor.',
        en: 'The Qalam Education Academy of the IGMG education department is aimed at people who have recently embraced Islam and at adults who want to learn the basics of their faith. Courses are offered in German, English, French and Dutch.',
      },
      url: NETZWERK.qalam.url.de,
      sichtbar: true,
      herkunft: 'redaktion',
    },
  ],
};

/** Seed „dachverband“ (Marktstart P3): idempotent (onConflictDoNothing), Beispielinhalt mit Quelle, Prüfung gegen das Schema. */
export const seed: BereichsSeed = async (db) => {
  const geprueft = inhaltSchema.parse(DACHVERBAND_BEISPIEL);
  const r = await db
    .insert(schema.seiteninhalt)
    .values({ bereich: 'dachverband', istBeispiel: true, quelle: DACHVERBAND_QUELLE, inhalt: geprueft })
    .onConflictDoNothing({ target: schema.seiteninhalt.bereich })
    .returning({ bereich: schema.seiteninhalt.bereich });
  return r.length;
};
