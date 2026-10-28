/**
 * Sprachneutrale Entitätsdaten der Gemeinde und ihres Dachverbands (Plan Marktstart, E-044; K-16) für strukturierte
 * Daten (`jsonld.ts`), Metadaten und `/llms.txt` (`llms.ts`). Nur Belegtes (G-05); Personennamen stehen hier nie (G-04).
 * Der lokalisierte Name der Moschee steht in messages/{de,tr,en}.json unter `meta.moscheeName` – hier nur der Schlüssel.
 */

/** Beleg für Gründung und Regionalverband: IGMG-Artikel „IGMG-Gemeinde Wetzlar feiert 30. Jubiläum“ vom 07.04.2008. */
const ARTIKEL_2008 = 'https://www.igmg.org/igmg-gemeinde-wetzlar-feiert-30-jubila%c2%a4um/';

export const ENTITAET = {
  /** Marke der Website (Eigenname, nicht übersetzt; wie `ORGANISATION` in jsonld.ts). */
  kurzname: 'IGMG Wetzlar',
  /** Schlüssel des lokalisierten Moscheenamens (de „Fatih-Moschee Wetzlar“, tr „Wetzlar Fatih Camii“, en „Fatih Mosque Wetzlar“). */
  moscheeNameSchluessel: 'meta.moscheeName',
  /** Weitere Namen in allen Sprachen (schema.org `alternateName`); „IGMG-Gemeinde Wetzlar“ wie im Artikel von 2008. */
  alternateName: ['Fatih-Moschee Wetzlar', 'Wetzlar Fatih Camii', 'Fatih Mosque Wetzlar', 'IGMG-Gemeinde Wetzlar'],
  /** Sitz der Gemeinde (Ort, Bundesland, Land): geografische Tatsachen, gelten auch ohne gepflegte Straße (M-010). */
  sitz: { ort: 'Wetzlar', kreis: 'Lahn-Dill-Kreis', bundesland: 'Hessen', land: 'DE' },
  /** Gründungsjahr der Gemeinde (Nutzerentscheidung E-044 Nr. 4, Beleg: 30-Jahr-Feier 2008). */
  gruendung: '1978',
  gruendungBeleg: ARTIKEL_2008,
  /** Dachverband (`parentOrganization`): Angaben laut Impressum von igmg.org. */
  dachverband: {
    name: 'Islamische Gemeinschaft Millî Görüş e.V.',
    alternateName: 'IGMG',
    url: 'https://www.igmg.org/',
    adresse: { strasse: 'Colonia-Allee 3', plz: '51067', ort: 'Köln', land: 'DE' },
    register: 'Amtsgericht Köln, VR 17018',
  },
  /** Regionalverband (`memberOf`, nur der Name): belegt nur durch den Artikel von 2008; aktuelle Bestätigung ist ein Menschen-Punkt. */
  regionalverband: { name: 'IGMG Regionalverband Hessen', beleg: ARTIKEL_2008, stand: '2008-04-07' },
} as const;

export type Entitaet = typeof ENTITAET;
