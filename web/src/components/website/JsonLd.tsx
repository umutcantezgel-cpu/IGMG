import type { JsonLdObjekt } from '@/lib/seo/jsonld';

/**
 * JSON-LD als Text für ein `<script type="application/ld+json">`. `<` wird als `<` geschrieben, damit ein Wert das
 * Script-Element nicht vorzeitig schließen kann (Next.js-Anleitung „JSON-LD“). Der Text bleibt gültiges JSON.
 */
export function jsonLdText(daten: JsonLdObjekt): string {
  return JSON.stringify(daten).replace(/</g, '\\u003c');
}

/** Strukturierte Daten einer Seite. Server-Komponente ohne Client-JavaScript. */
export function JsonLd({ daten }: { daten: JsonLdObjekt }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdText(daten) }} />;
}
