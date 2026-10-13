import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Ziel } from '@/components/website/navigation';
import { Link } from '@/i18n/link';

type Nachbar = { ziel: Ziel; text: string; name?: string };

/**
 * Blättern am Ende der Leseansicht (Sure oder Cüz): Links zum vorigen und nächsten Abschnitt mit Namen. Fehlt eine
 * Seite (erste oder letzte), bleibt ihr Platz leer; fehlen beide, entfällt die Leiste. Ohne Vorabruf: Suren sind groß.
 */
export function QuranWeiter({ label, vorher, naechste }: { label: string; vorher: Nachbar | null; naechste: Nachbar | null }) {
  if (!vorher && !naechste) return null;
  const linkKlasse =
    'flex min-h-16 min-w-0 items-center gap-3 rounded-lg border border-linie bg-weiss px-4 py-3 text-18 text-tinte no-underline transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50 hover:text-tinte hover:shadow-s2 active:scale-98';
  return (
    <nav aria-label={label} className="grid gap-3 border-t border-linie pt-8 md:grid-cols-2">
      {vorher ? (
        <Link href={vorher.ziel} rel="prev" prefetch={false} className={linkKlasse}>
          <ArrowLeft aria-hidden className="size-5 shrink-0 text-gruen-700" />
          <span className="flex min-w-0 flex-col">
            <span className="font-bold">{vorher.text}</span>
            {vorher.name ? <span className="truncate text-16 text-tinte-2">{vorher.name}</span> : null}
          </span>
        </Link>
      ) : null}
      {naechste ? (
        <Link href={naechste.ziel} rel="next" prefetch={false} className={`${linkKlasse} justify-end text-end md:col-start-2`}>
          <span className="flex min-w-0 flex-col">
            <span className="font-bold">{naechste.text}</span>
            {naechste.name ? <span className="truncate text-16 text-tinte-2">{naechste.name}</span> : null}
          </span>
          <ArrowRight aria-hidden className="size-5 shrink-0 text-gruen-700" />
        </Link>
      ) : null}
    </nav>
  );
}
