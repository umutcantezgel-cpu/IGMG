import { useRef, useState } from 'react';

/** Eintrag einer wiederholbaren Gruppe; `k` ist ein stabiler Schlüssel, der das Verschieben übersteht. */
export type Eintrag<T> = { k: string; wert: T };

/** Fokusziel nach einer Bedienung (leerer Schlüssel = Schaltfläche „hinzufügen“); `nonce` löst den Fokus jedes Mal aus. */
export type Fokus = { k: string; nonce: number };

export type Liste<T> = {
  eintraege: Eintrag<T>[];
  hoechstens: number | undefined;
  fokus: Fokus | null;
  hinzu: () => void;
  aendere: (k: string, aendern: (wert: T) => T) => void;
  entferne: (k: string) => void;
  verschiebe: (k: string, richtung: -1 | 1) => void;
};

/**
 * Wiederholbare Gruppe (Eintrag hinzufügen, entfernen, nach oben, nach unten). Nach jeder Bedienung liegt der
 * Fokus am passenden Eintrag, damit Tastaturnutzung nicht ins Leere läuft.
 */
export function useListe<T>(anfang: readonly T[], neu: () => T, hoechstens?: number): Liste<T> {
  const zaehler = useRef(anfang.length);
  const nonce = useRef(0);
  const [eintraege, setEintraege] = useState<Eintrag<T>[]>(() => anfang.map((wert, i) => ({ k: `a${i}`, wert })));
  const [fokus, setFokus] = useState<Fokus | null>(null);

  const fokussiere = (k: string) => setFokus({ k, nonce: ++nonce.current });

  const hinzu = () => {
    if (hoechstens !== undefined && eintraege.length >= hoechstens) return;
    const k = `n${++zaehler.current}`;
    setEintraege((liste) => [...liste, { k, wert: neu() }]);
    fokussiere(k);
  };

  const aendere = (k: string, aendern: (wert: T) => T) =>
    setEintraege((liste) => liste.map((e) => (e.k === k ? { ...e, wert: aendern(e.wert) } : e)));

  const entferne = (k: string) => {
    const i = eintraege.findIndex((e) => e.k === k);
    const nachbar = eintraege[i + 1] ?? eintraege[i - 1];
    setEintraege((liste) => liste.filter((e) => e.k !== k));
    fokussiere(nachbar?.k ?? '');
  };

  const verschiebe = (k: string, richtung: -1 | 1) => {
    setEintraege((liste) => {
      const i = liste.findIndex((e) => e.k === k);
      const j = i + richtung;
      if (i < 0 || j < 0 || j >= liste.length) return liste;
      const neueListe = [...liste];
      [neueListe[i], neueListe[j]] = [neueListe[j], neueListe[i]];
      return neueListe;
    });
    fokussiere(k);
  };

  return { eintraege, hoechstens, fokus, hinzu, aendere, entferne, verschiebe };
}
