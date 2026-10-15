import { Link } from '@/i18n/link';
import { BUCHSTABEN, type Buchstabe, type Sprache, zeichen } from '@/lib/elifbe/alphabet';
import { cn } from '@/lib/utils';

/**
 * Buchstabenkarte (Morph-Paar „Buchstabenkarte → Glyphe“, B-05/O-13): Die Karte trägt `data-morph-karte="b-<slug>"`,
 * das Zeichen `data-morph="glyphe"`; die Buchstabenseite trägt den Namen `b-<slug>-glyphe` fest am Schreibweg.
 * Der Elifbâ-Name ist türkisch (`lang="tr"`), wenn die Seite in einer anderen Sprache steht.
 */
export function Buchstabenkarte({ b, sprache, label, gross = false }: { b: Buchstabe; sprache: Sprache; label: string; gross?: boolean }) {
  return (
    <Link
      href={{ pathname: '/elifbe/buchstaben/[buchstabe]', params: { buchstabe: b.slug } }}
      aria-label={label}
      data-morph-karte={`b-${b.slug}`}
      className={cn(
        'group relative flex druck flex-col items-center justify-between rounded-lg border border-linie bg-weiss px-2 pt-2 pb-3 text-tinte no-underline shadow-s1 transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50 hover:text-tinte',
      )}
    >
      <span aria-hidden className="self-start text-16 font-bold text-tinte-3 tabular-nums">
        {b.nr}
      </span>
      <span
        lang="ar"
        dir="rtl"
        data-morph="glyphe"
        className={cn('block text-gruen-950 group-hover:text-gruen-800', gross ? 'pb-5 buchstabe-gross' : 'text-48 leading-loose')}
      >
        {zeichen(b)}
      </span>
      <span lang={sprache === 'tr' ? undefined : 'tr'} className="text-18 leading-tight font-bold">
        {b.elifbe}
      </span>
    </Link>
  );
}

/** Raster aller 29 Buchstaben in Elifbe-Reihenfolge, von rechts nach links wie im Elifbe-Heft. */
export function Buchstabenraster({
  sprache,
  label,
  gross = false,
  className,
}: {
  sprache: Sprache;
  /** Zugänglicher Name je Karte, z. B. „Be, Buchstabe 2“. */
  label: (b: Buchstabe) => string;
  gross?: boolean;
  className?: string;
}) {
  return (
    // dir="rtl" ordnet wie im Elifbe-Heft; font-text/leading-normal heben die arabische Schrift der [dir=rtl]-Grundregel für
    // die lateinischen Namen wieder auf (das Zeichen selbst trägt lang="ar")
    <ol dir="rtl" className={cn('grid grid-cols-3 gap-3 font-text leading-normal sm:grid-cols-4 md:grid-cols-5 md:gap-4', className)}>
      {BUCHSTABEN.map((b) => (
        <li key={b.slug} dir="ltr">
          <Buchstabenkarte b={b} sprache={sprache} label={label(b)} gross={gross} />
        </li>
      ))}
    </ol>
  );
}
