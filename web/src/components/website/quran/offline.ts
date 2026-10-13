import { adresse, lies, schreibe, SPEICHER, type LeserPfade } from './leser-typen';

/**
 * Offline-Koran (H-O01, B-27): speichert, was die Person ausdrücklich wählt, im Vorrat `igmg-koran-v1` des Browsers –
 * die Seite selbst, Wort- und Übersetzungsdaten der Suren, die Programmteile und Schriften der Seite und auf Wunsch
 * die Rezitation. Der Service Worker (public/sw.js) liefert sie ohne Netz aus. Nichts geht an den Server außer den
 * üblichen Abrufen; das Verzeichnis der gespeicherten Seiten liegt nur im Gerät (`igmg-quran-offline`).
 */
export const KORAN_VORRAT = 'igmg-koran-v1';

export type OfflineEintrag = { titel: string; bytes: number; zeit: number; urls: string[]; audio: boolean };
export type Fortschritt = { geladen: number; gesamt: number | null; dateien: number; fertig: number };

export function offlineMoeglich(): boolean {
  return typeof window !== 'undefined' && 'caches' in window && 'serviceWorker' in navigator;
}

export function liesVerzeichnis(): Record<string, OfflineEintrag> {
  return lies<Record<string, OfflineEintrag>>(SPEICHER.offline) ?? {};
}

/** Adressen einer Leseseite: Seite, Daten je Sure, Programmteile und Schriften, optional Rezitation. */
export async function sammleAdressen(o: {
  behaelter: HTMLElement;
  pfade: LeserPfade;
  ausgabe: string | null;
  htmlAusgabe: string | null;
  rezitation: string | null;
}): Promise<string[]> {
  const suren = [...new Set([...o.behaelter.querySelectorAll<HTMLElement>('[data-sure]')].map((e) => Number(e.dataset.sure)))].filter(
    (s) => s >= 1 && s <= 114,
  );
  const urls = new Set<string>([location.pathname]);
  for (const s of suren) {
    urls.add(adresse(o.pfade.woerter, { s }));
    if (o.ausgabe && o.ausgabe !== o.htmlAusgabe) urls.add(adresse(o.pfade.uebersetzung, { s, a: o.ausgabe }));
  }
  // Programmteile, Stile und Schriften, die diese Seite geladen hat (unveränderlich, Inhalts-Hash)
  for (const r of performance.getEntriesByType('resource')) {
    const u = new URL(r.name, location.href);
    if (u.origin === location.origin && u.pathname.startsWith('/_next/static/')) urls.add(u.pathname);
  }
  for (const el of document.querySelectorAll<HTMLLinkElement | HTMLScriptElement>('link[rel="stylesheet"][href], script[src]')) {
    const u = new URL('href' in el ? el.href : el.src, location.href);
    if (u.origin === location.origin && u.pathname.startsWith('/_next/static/')) urls.add(u.pathname);
  }
  if (o.rezitation) {
    for (const s of suren) {
      const zeiten = adresse(o.pfade.zeiten, { s, r: o.rezitation });
      const antwort = await fetch(zeiten).catch(() => null);
      if (!antwort?.ok) continue;
      urls.add(zeiten);
      const daten = (await antwort.json().catch(() => null)) as { audio?: { pfad: string }[] } | null;
      for (const a of daten?.audio ?? []) if (typeof a.pfad === 'string' && a.pfad.startsWith('/')) urls.add(a.pfad);
    }
  }
  return [...urls];
}

/** Eine Antwort ganz lesen und dabei die echten Bytes melden. */
async function lese(antwort: Response, mehr: (n: number) => void): Promise<Blob> {
  if (!antwort.body) return antwort.blob();
  const teile: BlobPart[] = [];
  const leser = antwort.body.getReader();
  for (;;) {
    const { done, value } = await leser.read();
    if (done) break;
    teile.push(value);
    mehr(value.byteLength);
  }
  return new Blob(teile, { type: antwort.headers.get('content-type') ?? '' });
}

/**
 * Speichert die Adressen (je höchstens vier gleichzeitig). `gesamt` ist die Summe der angekündigten Größen, sobald alle
 * Antworten sie nennen (ungepackte Übertragung); sonst bleibt sie offen und der Ring folgt der Zahl der Dateien.
 */
export async function speichere(
  schluessel: string,
  titel: string,
  urls: string[],
  melde: (f: Fortschritt) => void,
  signal: AbortSignal,
): Promise<OfflineEintrag> {
  const vorrat = await caches.open(KORAN_VORRAT);
  void navigator.storage?.persist?.().catch(() => false);
  const f: Fortschritt = { geladen: 0, gesamt: 0, dateien: urls.length, fertig: 0 };
  const angekuendigt = new Map<string, number | null>();
  const offen = [...urls];
  const gespeichert: string[] = [];
  const arbeite = async () => {
    for (let url = offen.shift(); url; url = offen.shift()) {
      const antwort = await fetch(url, { signal, credentials: 'same-origin' });
      if (!antwort.ok) continue;
      const laenge = antwort.headers.get('content-encoding') ? null : Number(antwort.headers.get('content-length')) || null;
      angekuendigt.set(url, laenge);
      f.gesamt =
        angekuendigt.size === urls.length && [...angekuendigt.values()].every((x) => x)
          ? [...angekuendigt.values()].reduce<number>((a, b) => a + (b ?? 0), 0)
          : null;
      const daten = await lese(antwort, (n) => {
        f.geladen += n;
        melde({ ...f });
      });
      const kopf = new Headers({ 'content-type': antwort.headers.get('content-type') ?? 'application/octet-stream' });
      await vorrat.put(url, new Response(daten, { status: 200, headers: kopf }));
      gespeichert.push(url);
      f.fertig++;
      melde({ ...f });
    }
  };
  try {
    await Promise.all(Array.from({ length: Math.min(4, urls.length) }, arbeite));
  } catch (fehler) {
    // Abgebrochen oder Netzfehler: Halbes wieder entfernen, damit nichts Unvollständiges als gespeichert gilt
    await Promise.all(gespeichert.map((u) => vorrat.delete(u)));
    throw fehler;
  }
  const eintrag: OfflineEintrag = {
    titel,
    bytes: f.geladen,
    zeit: Date.now(),
    urls: gespeichert,
    audio: urls.some((u) => u.startsWith('/audio/')),
  };
  schreibe(SPEICHER.offline, { ...liesVerzeichnis(), [schluessel]: eintrag });
  return eintrag;
}

/** Entfernt eine gespeicherte Seite; Programmteile, die eine andere gespeicherte Seite braucht, bleiben. */
export async function entferne(schluessel: string): Promise<void> {
  const verzeichnis = liesVerzeichnis();
  const weg = verzeichnis[schluessel];
  delete verzeichnis[schluessel];
  if (weg) {
    const gebraucht = new Set(Object.values(verzeichnis).flatMap((e) => e.urls));
    const vorrat = await caches.open(KORAN_VORRAT);
    await Promise.all(weg.urls.filter((u) => !gebraucht.has(u)).map((u) => vorrat.delete(u)));
  }
  schreibe(SPEICHER.offline, verzeichnis);
}
