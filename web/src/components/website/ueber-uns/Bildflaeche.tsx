import { Bildplatzhalter } from '@/components/website/Bildplatzhalter';
import { cn } from '@/lib/utils';

/**
 * Beschriftete Streifenfläche statt Foto (design/AboutUs.dc.html D:32 und D:46, Platzhalter nach M-018).
 * Beschriftung als Etikett: Das Etikett kommt aus `Bildplatzhalter` (H-E09), hier nur Rahmen und Radius des Feldes.
 * Die Beschriftung steht am role="img" als aria-label; der sichtbare Text ist für Hilfstechnik ausgeblendet.
 * `lang="de"` kennzeichnet deutschen Rückfall (K-02).
 */
export function Bildflaeche({ beschriftung, lang, className }: { beschriftung: string; lang?: string; className?: string }) {
  return <Bildplatzhalter beschriftung={beschriftung} lang={lang} className={cn('rounded-md border border-linie', className)} />;
}
