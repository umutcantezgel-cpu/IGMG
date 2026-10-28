import type { JSONContent } from '@tiptap/core';
import type { FreigabeStatus } from '@/lib/religioes/freigabe';

/**
 * Religiöse Erklärtexte der Website als gekennzeichneter Entwurf (ADR 0047, Nutzerentscheidung E-044 Nr. 5): Mit dem
 * Schalter `website_wissen_vorschau` sind Wissensthemen „zur Prüfung“ öffentlich – immer mit dem Hinweis „Entwurf zur
 * Prüfung – noch nicht vom Imam geprüft“ und mit `noindex`. Ohne Schalter gilt allein ADR 0030 Nr. 2: öffentlich ist nur
 * „geprüft“. Ein Thema im Stand „entwurf“ (noch nicht eingereicht oder von der religiösen Prüfung zurückgewiesen) bleibt
 * immer verborgen – so nimmt der Imam einen einzelnen Text mit „Zurückweisen“ sofort von der Website.
 * Reine Funktionen ohne Datenbank (Abfragen, Actions, Seed, Tests).
 */

/** Verfasser-Vermerk der KI-Entwürfe: keine Konto-ID, deshalb darf jede Person mit `religioese_pruefung` freigeben. */
export const KI_ENTWURF_VERFASSER = 'KI-Entwurf (ADR 0047)';

/** Vermerk im Freigabe-Verlauf beim Einspielen der KI-Entwürfe (Seed `wissen-entwuerfe`). */
export const KI_ENTWURF_VERMERK =
  'KI-Entwurf (ADR 0047): eigenständig formuliert aus den verlinkten Quellen der IGMG und von IGMG Reisen, noch nicht vom Imam geprüft';

/** Freigabestände, die mit dem Schalter zusätzlich als gekennzeichneter Entwurf öffentlich sind. */
export const ENTWURF_OEFFENTLICH = ['zur_pruefung'] as const satisfies readonly FreigabeStatus[];

/** Öffentliche Freigabestände je Schalterstand: immer „geprüft“, mit Vorschau auch „zur Prüfung“. */
export function oeffentlicheFreigaben(vorschau: boolean): FreigabeStatus[] {
  return vorschau ? ['geprueft', ...ENTWURF_OEFFENTLICH] : ['geprueft'];
}

/** Trägt ein öffentlich sichtbares Thema die Entwurfskennzeichnung? (alles außer „geprüft“) */
export function istEntwurf(freigabe: FreigabeStatus): boolean {
  return freigabe !== 'geprueft';
}

/** Stammt der aktuelle Stand unverändert aus dem KI-Entwurf? (Nach einer Änderung der Redaktion steht dort deren Konto.) */
export function istKiEntwurf(verfasstVon: string | null): boolean {
  return verfasstVon === KI_ENTWURF_VERFASSER;
}

const KANN_OEFFENTLICH: readonly FreigabeStatus[] = oeffentlicheFreigaben(true);

/**
 * Muss nach dem Speichern eines Themas der öffentliche Cache (`TAG.wissen`) verfallen? Ja, wenn sich Inhalt, Sichtbarkeit
 * oder Freigabe geändert haben und das Thema vorher oder nachher öffentlich sein kann – „geprüft“ oder (mit dem Schalter)
 * „zur Prüfung“. Unabhängig vom Schalterstand: ein Verfall zu viel kostet nur einen neuen Abruf.
 */
export function wissenCacheBetroffen(alt: FreigabeStatus, neu: FreigabeStatus, geaendert: boolean, sichtbarGeaendert: boolean): boolean {
  if (!geaendert && !sichtbarGeaendert && alt === neu) return false;
  return KANN_OEFFENTLICH.includes(alt) || KANN_OEFFENTLICH.includes(neu);
}

/**
 * Kleine Auszeichnung der Entwurfstexte (Seed): nur Zeichenketten, damit der Inhalte-Wächter jede Zeile prüfen kann.
 * - `### Frage?` → Überschrift der Ebene 3 (unter „Zum Thema“, Ebene 2, der Themenseite)
 * - `- Punkt` → Listenpunkt (aufeinanderfolgende Punkte bilden eine Liste)
 * - sonst ein Absatz
 * Im Text wird `{Linktext|ziel}` zum Link: `ziel` ist ein Schlüssel in `ziele` (https-Adresse) oder ein interner Pfad
 * (`/…`). Adressen stehen nicht im Text, damit Wörter aus Adressen nicht als Sprachfehler zählen. Unbekannte Ziele werfen.
 */
export function entwurfDokument(zeilen: readonly string[], ziele: Readonly<Record<string, string>>): JSONContent {
  const inhalt: JSONContent[] = [];
  let liste: JSONContent | null = null;
  for (const roh of zeilen) {
    const zeile = roh.trim();
    if (!zeile) continue;
    if (zeile.startsWith('- ')) {
      if (!liste) {
        liste = { type: 'bulletList', content: [] };
        inhalt.push(liste);
      }
      liste.content!.push({ type: 'listItem', content: [{ type: 'paragraph', content: zeilenInhalt(zeile.slice(2), ziele) }] });
      continue;
    }
    liste = null;
    if (zeile.startsWith('### ')) inhalt.push({ type: 'heading', attrs: { level: 3 }, content: zeilenInhalt(zeile.slice(4), ziele) });
    else inhalt.push({ type: 'paragraph', content: zeilenInhalt(zeile, ziele) });
  }
  return { type: 'doc', content: inhalt };
}

const LINK = /\{([^{}|]+)\|([^{}|]+)\}/g;

function zeilenInhalt(text: string, ziele: Readonly<Record<string, string>>): JSONContent[] {
  const teile: JSONContent[] = [];
  let pos = 0;
  for (const treffer of text.matchAll(LINK)) {
    const [ganz, linktext, ziel] = treffer;
    const href = ziel.startsWith('/') ? ziel : ziele[ziel];
    if (!href) throw new Error(`Entwurfstext: unbekanntes Linkziel „${ziel}“`);
    if (treffer.index > pos) teile.push({ type: 'text', text: text.slice(pos, treffer.index) });
    teile.push({ type: 'text', text: linktext, marks: [{ type: 'link', attrs: { href } }] });
    pos = treffer.index + ganz.length;
  }
  if (pos < text.length) teile.push({ type: 'text', text: text.slice(pos) });
  return teile;
}

/** Alle Linkziele eines Dokuments in Reihenfolge, ohne Doppelte (Quellenangabe `quelle` des Seeds, Tests). */
export function linkZiele(doc: JSONContent | null | undefined): string[] {
  const ziele: string[] = [];
  const lauf = (k: JSONContent) => {
    for (const m of k.marks ?? []) {
      const href = m.type === 'link' ? m.attrs?.href : undefined;
      if (typeof href === 'string' && !ziele.includes(href)) ziele.push(href);
    }
    k.content?.forEach(lauf);
  };
  if (doc) lauf(doc);
  return ziele;
}
