import { MODELL_DATEIEN, modellAdresse, ORT, ORT_HINWEISE, ortAdresse } from './modell';

/**
 * Download der Sprechübung in den Vorrat `igmg-lernapp-modelle` (L8-02, Gegenprüfung zu `a0795f7b`): Der Worker legt die
 * 7 Modell- und Konfigurationsdateien, die ORT-`.wasm` und deren Drittlizenzen (ThirdPartyNotices, Z-L17) selbst in den
 * Vorrat, bevor er die Pipeline baut – je Datei genau ein Abruf, Fortschritt nach gelesenen Bytes. Der Lern-App-SW liefert
 * die Drittlizenzen danach auch ohne Netz aus dem Vorrat (Link auf der Seite „Quellen“). transformers.js findet danach jede Datei im Vorrat: keine
 * Vorabfrage der Größe (`get_file_metadata`), kein zweiter Abruf, und Tokenizer und Prozessor gelten als vorhanden.
 *
 * Vorher (bis `a0795f7b`) übergab der Worker transformers.js eine Fortschrittsmeldung; dafür fragte es vorab jede Datei per
 * vollständigem GET ab, ohne den Körper zu lesen, und der Service Worker lud Encoder und Decoder ein zweites Mal, weil
 * sein Vorrat beim eigentlichen Laden noch nicht fertig geschrieben war.
 *
 * Liegt der Lern-App-Service-Worker davor, legt auch er die Antwort in denselben Vorrat (gleicher Schlüssel, der spätere
 * Eintrag gilt); über das Netz geht jede Datei trotzdem genau einmal.
 *
 * Rein bis auf die übergebenen Schnittstellen (Vorrat, Abruf, Meldung) – im Unit-Test mit Attrappen geprüft, im Browser mit
 * `scripts/lernapp/sprechen-rauchtest.mjs` (echter Worker und Service Worker).
 */

/** Was der Worker vom Vorrat braucht (Teil der Cache-API; `keys`/`delete` zum Wegräumen älterer Fassungen). */
export type Vorrat = Pick<Cache, 'match' | 'put' | 'keys' | 'delete'>;
/** Abruf vom eigenen Ursprung (im Worker `fetch`). */
export type Abruf = (adresse: string, init?: RequestInit) => Promise<Response>;
/** Fortschritt je Datei: gelesene Bytes und erwartete Größe. */
export type Meldung = (datei: string, geladen: number, gesamt: number) => void;

/**
 * Eine Datei des Downloads: Name für die Fortschrittsanzeige, Adresse und Schlüssel im Vorrat (`/lern-app/modelle/…`,
 * Drittlizenzen `/lern-app/lizenzen/…?v=<fassung>`), Größe. `lizenz`: Lizenztext – ein Fehler bricht den Download nicht ab (der nächste Start holt
 * ihn nach); so bleibt ein Gerät, das das Modell schon offline hat, auch ohne Netz bei der Sprachprüfung.
 */
export type VorratDatei = { datei: string; pfad: string; bytes: number; lizenz?: true };

/** Alles, was transformers.js und ORT aus dem Vorrat lesen, und die Drittlizenzen von ORT (Worker und ORT-`.mjs` lädt der Browser selbst). */
export const VORRAT_DATEIEN: readonly VorratDatei[] = [
  ...MODELL_DATEIEN.map((d) => ({ datei: d.pfad, pfad: modellAdresse(d.pfad), bytes: d.bytes })),
  { datei: ORT.wasm, pfad: ortAdresse(ORT.wasm), bytes: ORT.wasmBytes },
  { datei: 'onnxruntime-ThirdPartyNotices.txt', pfad: ORT_HINWEISE.adresse, bytes: ORT_HINWEISE.bytes, lizenz: true },
];

/** Fortschritt höchstens je Megabyte melden (sonst eine Nachricht je Netzstück, ≈ 1500 für den ganzen Download). */
const MELDESCHRITT = 1_000_000;

/** Kopfzeilen der Antwort ohne Länge und Kodierung: Der Körper im Vorrat ist schon entpackt, die Länge stand nicht immer dabei. */
function kopfzeilen(antwort: Response): Headers {
  const kopf = new Headers(antwort.headers);
  kopf.delete('content-length');
  kopf.delete('content-encoding');
  return kopf;
}

async function eineDatei(vorrat: Vorrat, abruf: Abruf, ursprung: string, d: VorratDatei, melde: Meldung): Promise<void> {
  const adresse = new URL(d.pfad, ursprung).href;
  if (await vorrat.match(adresse)) {
    melde(d.datei, d.bytes, d.bytes);
    return;
  }
  const antwort = await abruf(adresse, { credentials: 'same-origin' });
  if (antwort.status !== 200 || !antwort.body) throw new Error(`Status ${antwort.status}`);
  // In den Arbeitsspeicher lesen (wie transformers.js selbst), dann als Ganzes ablegen. Ein Strom direkt in `put` oder in
  // einen Blob brach im Rauchtest (Chromium kopflos, wenig freier Platz auf der Platte) nach ≈ 11 MB mit „network error“ ab.
  let puffer = new Uint8Array(d.bytes);
  let geladen = 0;
  let gemeldet = 0;
  const leser = antwort.body.getReader();
  try {
    for (;;) {
      const { done, value } = await leser.read();
      if (done) break;
      if (geladen + value.byteLength > puffer.byteLength) {
        const groesser = new Uint8Array(Math.max(geladen + value.byteLength, puffer.byteLength * 2));
        groesser.set(puffer.subarray(0, geladen));
        puffer = groesser;
      }
      puffer.set(value, geladen);
      geladen += value.byteLength;
      if (geladen - gemeldet >= MELDESCHRITT) {
        gemeldet = geladen;
        melde(d.datei, geladen, d.bytes);
      }
    }
  } catch (e) {
    throw new Error(`nach ${geladen} von ${d.bytes} Bytes abgebrochen (${e instanceof Error ? e.message : String(e)})`);
  }
  const inhalt = puffer.subarray(0, geladen);
  await vorrat.put(adresse, new Response(inhalt, { status: 200, headers: kopfzeilen(antwort) }));
  melde(d.datei, geladen, d.bytes);
}

/**
 * Ältere Fassungen derselben Datei aus dem Vorrat nehmen: gleicher Pfad wie eine Datei aus `VORRAT_DATEIEN`, aber andere
 * Adresse (anderer Suchteil, z. B. die Drittlizenzen mit `?v=<fassung>` oder noch ohne Fassung). Der Lern-App-SW gleicht samt
 * Suchteil ab und würde sie nie mehr ausliefern; sie belegten nur Platz.
 */
async function alteFassungenWeg(vorrat: Vorrat, ursprung: string): Promise<void> {
  const aktuell = new Map(VORRAT_DATEIEN.map((d) => [new URL(d.pfad, ursprung).pathname, new URL(d.pfad, ursprung).href]));
  const eigen = new URL(ursprung).origin;
  const alt = (await vorrat.keys()).filter((k) => {
    const u = new URL(k.url);
    return u.origin === eigen && aktuell.has(u.pathname) && aktuell.get(u.pathname) !== u.href;
  });
  await Promise.all(alt.map((k) => vorrat.delete(k)));
}

/**
 * Legt jede fehlende Datei aus `VORRAT_DATEIEN` mit genau einem Abruf in den Vorrat; vorhandene bleiben unberührt (kein
 * Netz). Wirft bei einer fehlgeschlagenen Datei (Status ≠ 200, Abbruch) – die Übung fällt dann auf die eigene Aufnahme zurück;
 * ausgenommen Lizenztexte (`lizenz`), die beim nächsten Start erneut versucht werden. Danach fallen ältere Fassungen derselben
 * Dateien weg (`alteFassungenWeg`): Ein neuer Text der Drittlizenzen hat eine neue Adresse und kommt so beim nächsten Start
 * mit Netz in den Vorrat, statt dass die alte Kopie für immer bleibt.
 */
export async function fuelleVorrat(vorrat: Vorrat, abruf: Abruf, ursprung: string, melde: Meldung = () => undefined): Promise<void> {
  await Promise.all(
    VORRAT_DATEIEN.map((d) =>
      eineDatei(vorrat, abruf, ursprung, d, melde).catch((e: unknown) => {
        if (d.lizenz) return;
        throw new Error(`${d.datei}: ${e instanceof Error ? `${e.name}: ${e.message}` : String(e)}`);
      }),
    ),
  );
  await alteFassungenWeg(vorrat, ursprung);
}
