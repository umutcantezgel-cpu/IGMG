import { ExternalLink } from 'lucide-react';

/**
 * Link „Auf YouTube ansehen“ für ein Wissensvideo mit YouTube-ID (Marktstart P7): reiner Link, keine Einbettung und kein
 * Vorschaubild (K-14). Server-Komponente: Die Seiten geben ihn den Inseln (`WissenInsel`, `ThemaInsel`) fertig gerendert
 * mit (`VideoAnzeige.link`), damit Markup und Zeichen nicht im Client-Bundle landen (K-12, Welle 3 – JS-Grenze der
 * Wissensseiten). Das Zeichen ist nur Schmuck; der zugängliche Name nennt Ziel und Video.
 */
export function VideoLink({ href, text, titel }: { href: string; text: string; titel: string }) {
  return (
    <a
      href={href}
      rel="noopener noreferrer"
      aria-label={`${text}: ${titel}`}
      className="inline-flex min-h-12 items-center gap-2 font-bold text-gruen-700 underline underline-offset-4"
    >
      {text}
      <ExternalLink aria-hidden className="size-4" />
    </a>
  );
}
