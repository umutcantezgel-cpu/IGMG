import { Bildplatzhalter } from '@/components/website/Bildplatzhalter';
import { cn } from '@/lib/utils';

/**
 * Bildbeschreibung ohne angehängte Platzhalter der Gemeinde: „Foto: Neue Fatih-Moschee [Foto – von der Gemeinde]“ wird
 * zu „Foto: Neue Fatih-Moschee“ (für Bildfläche und Alternativtext; die Klammer ist hier ein Vermerk, kein Satzteil).
 */
export function ohneFotoVermerk(beschriftung: string): string {
  return beschriftung
    .replace(/\s*\[[^\]]*\]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Bildfläche statt Foto (design/AboutUs.dc.html D:32 und D:46, Platzhalter nach M-018): Fläche aus `Bildplatzhalter`
 * (H-E09), hier nur Rahmen und Radius des Feldes. Die Beschriftung nennt, welches Foto hierher gehört – ohne Vermerke
 * in eckigen Klammern. `lang="de"` kennzeichnet deutschen Rückfall (K-02).
 */
export function Bildflaeche({ beschriftung, lang, className }: { beschriftung: string; lang?: string; className?: string }) {
  return (
    <Bildplatzhalter beschriftung={ohneFotoVermerk(beschriftung)} lang={lang} className={cn('rounded-md border border-linie', className)} />
  );
}
