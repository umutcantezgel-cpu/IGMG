/**
 * Surensuche der Übersicht (clientseitig, ohne Server): Name in Umschrift oder arabisch, oder die Nummer.
 * Die Umschrift der Quelle schreibt lange Vokale doppelt („Al-Faatiha“, „Yaseen“); Suchende tippen „Fatiha“,
 * „Yasin“ oder türkisch „Bakara“. Beide Seiten werden deshalb gleich vereinfacht. Reine Funktionen.
 */

/** Vereinfachte Form: klein, ohne Akzente und arabische Vokalzeichen, ohne Zeichen; lange Vokale einfach, q → k. */
export function sucheNormal(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f\u064b-\u065f\u0670\u06d6-\u06ed]/g, '')
    .toLocaleLowerCase('de')
    .replace(/ı/g, 'i')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/([aiu])\1+/g, '$1')
    .replace(/q/g, 'k');
}

/** Suchschlüssel einer Sure für das Attribut `data-suche`: Umschrift und arabischer Name, vereinfacht. */
export function surenSchluessel(umschrift: string, nameAr: string): string {
  return `${sucheNormal(umschrift)} ${sucheNormal(nameAr)}`;
}

/** Passt die Sure zur Eingabe? Ziffern: genau diese Nummer; sonst Teilstück des Schlüssels. Leere Eingabe: alle. */
export function passt(eingabe: string, nr: number, schluessel: string): boolean {
  const roh = eingabe.trim();
  if (!roh) return true;
  if (/^\d+$/.test(roh)) return Number(roh) === nr;
  const q = sucheNormal(roh);
  return q.length > 0 && schluessel.includes(q);
}
