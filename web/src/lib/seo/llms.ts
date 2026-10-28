import seo from '../../../messages/bereiche/seo.json';
import de from '../../../messages/de.json';
import en from '../../../messages/en.json';
import tr from '../../../messages/tr.json';
import { pfadFuer } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { ENTITAET } from './entitaet';
import { gepflegt } from './jsonld';
import { SEO_SEITEN } from './seiten';

/**
 * Inhalt von `/llms.txt` (Format nach llmstxt.org, ADR 0049): Name, Kurzbeschreibung, belegte Fakten der Entität mit
 * Quelle und Stand (aus `entitaet.ts`), dann je Sprache die festen Seiten mit Titel und Beschreibung aus dem
 * Namensraum `seo`. Nur Texte ohne Platzhalter (G-05), keine Personen (G-04), keine Daten aus der Datenbank – die Datei
 * ist statisch. Texte direkt aus messages (wie `og-bild.tsx`), damit die Funktion rein und prüfbar bleibt.
 */

const SPRACHDATEIEN = { de, tr, en };

/** „JJJJ-MM-TT“ → „TT.MM.JJJJ“. */
const datum = (iso: string) => iso.split('-').reverse().join('.');

/** Der Text der Datei; `basis` = `basisUrl()`. */
export function llmsText(basis: string): string {
  const wurzel = basis.replace(/\/+$/, '');
  const l = seo.de.seo.llms;
  const { dachverband: dv, regionalverband: rv, sitz } = ENTITAET;
  const z: string[] = [`# ${ENTITAET.kurzname}`, ''];
  const kurz = gepflegt(de.meta.beschreibung);
  if (kurz) z.push(`> ${kurz}`, '');
  z.push(
    l.einleitung,
    '',
    `## ${l.fakten}`,
    '',
    `- ${l.moschee}: ${de.meta.moscheeName} (${tr.meta.moscheeName}; ${en.meta.moscheeName})`,
    `- ${l.ort}: ${sitz.ort}, ${sitz.kreis}, ${sitz.bundesland}`,
    `- ${l.gegruendet}: ${ENTITAET.gruendung} (${l.quelle}: ${ENTITAET.gruendungBeleg})`,
    `- ${l.dachverband}: [${dv.name} (${dv.alternateName})](${dv.url}), ${dv.adresse.strasse}, ${dv.adresse.plz} ${dv.adresse.ort}`,
    `- ${l.regionalverband}: ${rv.name} (${l.stand}: ${datum(rv.stand)}; ${l.quelle}: ${rv.beleg})`,
  );
  for (const sprache of routing.locales) {
    z.push('', `## ${SPRACHDATEIEN[sprache].meta.sprache}`, '');
    for (const { pfad, schluessel } of SEO_SEITEN) {
      const eintrag = seo[sprache].seo[schluessel];
      const titel = gepflegt(eintrag.titel);
      const text = gepflegt(eintrag.beschreibung);
      if (titel) z.push(`- [${titel}](${wurzel}${pfadFuer(pfad, sprache)})${text ? `: ${text}` : ''}`);
    }
  }
  // „Optional“ ist das Schlüsselwort des Formats für verzichtbare Verweise, kein Anzeigetext
  z.push('', '## Optional', '', `- [${l.verzeichnis}](${wurzel}/sitemap.xml)`);
  return `${z.join('\n')}\n`;
}
