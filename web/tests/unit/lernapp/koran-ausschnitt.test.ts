import { describe, expect, it } from 'vitest';
import { spieleAusschnitt, type Takt, type Wiedergabe } from '@/lib/lernapp/koran/ausschnitt';

/**
 * „Aufnahme anhören“ im Koran-Pfad (L6-05; Gegenprüfung L6-05/06): Der Ausschnitt beginnt bei der Wortzeit und hält am Ende an,
 * geprüft je Bildschirmbild statt nur über `timeupdate` (≈ 250 ms) – die Wiedergabe läuft nicht in das nächste Wort. Anhalten
 * (Schließen der Einheit, Verlassen der Seite) beendet sie sofort, auch vor dem Laden. Ersatz für Audio-Element und Takt.
 */

class AudioErsatz implements Wiedergabe {
  currentTime = 0;
  paused = true;
  geladen = 0;
  gespielt = 0;
  private hoerer = new Map<string, Set<() => void>>();
  addEventListener(art: string, f: () => void, o?: AddEventListenerOptions | boolean) {
    const g = typeof o === 'object' && o.once ? () => (this.removeEventListener(art, g), f()) : f;
    if (!this.hoerer.has(art)) this.hoerer.set(art, new Set());
    this.hoerer.get(art)!.add(g);
  }
  removeEventListener(art: string, f: () => void) {
    this.hoerer.get(art)?.delete(f);
  }
  melde(art: string) {
    for (const f of [...(this.hoerer.get(art) ?? [])]) f();
  }
  zahl(art: string) {
    return this.hoerer.get(art)?.size ?? 0;
  }
  load() {
    this.geladen++;
  }
  async play() {
    this.gespielt++;
    this.paused = false;
  }
  pause() {
    this.paused = true;
  }
}

function takt(): Takt & { bild: () => void; offen: () => number } {
  const warte = new Map<number, () => void>();
  let n = 0;
  return {
    anfordern: (f) => (warte.set(++n, f), n),
    abbrechen: (id) => void warte.delete(id),
    bild: () => {
      const jetzt = [...warte.values()];
      warte.clear();
      for (const f of jetzt) f();
    },
    offen: () => warte.size,
  };
}

const ZEIT = { startMs: 1_200, endeMs: 1_650 };

describe('Ausschnitt einer Rezitation', () => {
  it('beginnt bei der Wortzeit und hält im ersten Bild nach dem Ende an (nicht erst beim nächsten timeupdate)', async () => {
    const a = new AudioErsatz();
    const t = takt();
    spieleAusschnitt(a, ZEIT, t);
    expect(a.geladen).toBe(1);
    a.melde('loadedmetadata');
    expect(a.currentTime).toBe(1.2);
    await Promise.resolve();
    await Promise.resolve();
    expect(a.gespielt).toBe(1);
    expect(t.offen()).toBe(1);
    a.currentTime = 1.5;
    t.bild();
    expect(a.paused).toBe(false);
    expect(t.offen()).toBe(1);
    a.currentTime = 1.66; // 10 ms nach dem Ende – das nächste timeupdate käme erst ≈ 250 ms später
    t.bild();
    expect(a.paused).toBe(true);
    expect(t.offen()).toBe(0);
    expect(a.zahl('timeupdate')).toBe(0);
    expect(a.zahl('ended')).toBe(0);
  });

  it('timeupdate bleibt Rückfall (Seite im Hintergrund zeichnet keine Bilder)', async () => {
    const a = new AudioErsatz();
    const t = takt();
    spieleAusschnitt(a, ZEIT, t);
    a.melde('loadedmetadata');
    await Promise.resolve();
    a.currentTime = 1.7;
    a.melde('timeupdate');
    expect(a.paused).toBe(true);
    expect(t.offen()).toBe(0);
  });

  it('Anhalten beendet die Wiedergabe sofort und räumt auf; vor dem Laden wird gar nicht erst gespielt', async () => {
    const a = new AudioErsatz();
    const t = takt();
    const halt = spieleAusschnitt(a, ZEIT, t);
    a.melde('loadedmetadata');
    await Promise.resolve();
    halt();
    expect(a.paused).toBe(true);
    expect(t.offen()).toBe(0);
    expect(a.zahl('timeupdate')).toBe(0);

    const b = new AudioErsatz();
    spieleAusschnitt(b, ZEIT, t)();
    b.melde('loadedmetadata');
    await Promise.resolve();
    expect(b.gespielt).toBe(0);
    expect(b.currentTime).toBe(0);
  });
});
