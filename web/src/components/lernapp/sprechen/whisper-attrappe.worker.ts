import { gutVerstaendlich, trefferAnteil, zielWoerter } from '@/lib/lernapp/sprechen/auswertung';
import { type AnArbeiter, MODELL_DATEIEN, ORT, type VomArbeiter } from '@/lib/lernapp/sprechen/modell';

/**
 * Attrappe des Whisper-Workers – nur im Testbau (`E2E_ATTRAPPEN=1`, ADR 0042 Folgen): Der Bauschritt
 * `scripts/lernapp-modelle.mjs` legt sie dann an die Stelle des echten Workers; im Produktionsbau gibt es sie nicht
 * (der Schritt verweigert sie bei `VERCEL_ENV=production`). Sie lädt kein Modell und meldet dasselbe Protokoll: Fortschritt
 * je Datei, „bereit“, Probelauf 900 ms, und als Ergebnis alle Zielwörter erkannt außer dem letzten bei mehr als vier
 * Wörtern. Keine Abschrift.
 */

const bereich = self as unknown as {
  postMessage: (n: VomArbeiter) => void;
  onmessage: ((e: MessageEvent<AnArbeiter>) => void) | null;
};
const sende = (n: VomArbeiter) => bereich.postMessage(n);

bereich.onmessage = (e: MessageEvent<AnArbeiter>) => {
  const n = e.data;
  if (n.art === 'laden') {
    for (const d of [...MODELL_DATEIEN, { pfad: ORT.wasm, bytes: ORT.wasmBytes }])
      sende({ art: 'fortschritt', datei: d.pfad, geladen: d.bytes, gesamt: d.bytes });
    sende({ art: 'bereit' });
  } else if (n.art === 'probe') sende({ art: 'probe', ms: 900 });
  else if (n.art === 'erkenne') {
    const { vergleich } = zielWoerter(n.ziel, n.sprache);
    const treffer = vergleich.map((_, i) => vergleich.length <= 4 || i < vergleich.length - 1);
    sende({
      art: 'ergebnis',
      id: n.id,
      ergebnis: { status: gutVerstaendlich(treffer, 0.6) ? 'gut' : 'teilweise', treffer, anteil: trefferAnteil(treffer) },
    });
  }
};
