import { clsx, type ClassValue } from 'clsx';

/**
 * Klassen zusammensetzen ohne tailwind-merge (≈ 10 kB) – für Client-Komponenten öffentlicher Seiten (K-12).
 * Nur für Grundklassen plus sich ausschließende Varianten; widersprechen sich Klassen, gewinnt die CSS-Reihenfolge.
 * Server-Komponenten und Verwaltung dürfen weiter `cn()` aus `@/lib/utils` nutzen (dort kostet es nichts bzw. ist egal).
 */
export function klassen(...eingaben: ClassValue[]): string {
  return clsx(eingaben);
}
