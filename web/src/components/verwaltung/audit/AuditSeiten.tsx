import NextLink from 'next/link';

const link = 'inline-flex min-h-12 items-center font-bold underline underline-offset-4';

/**
 * Seitenwechsel für Zurück und Weiter; die Adressen tragen die Filter weiter. Ohne mehrere Seiten nichts.
 */
export function AuditSeiten({
  seite,
  seiten,
  zurueckHref,
  weiterHref,
  texte,
}: {
  seite: number;
  seiten: number;
  zurueckHref: string;
  weiterHref: string;
  texte: { navName: string; zurueck: string; weiter: string; seite: string };
}) {
  if (seiten <= 1) return null;
  return (
    <nav aria-label={texte.navName} className="flex flex-wrap items-center justify-between gap-3">
      {seite > 1 ? (
        <NextLink href={zurueckHref} className={link}>
          {texte.zurueck}
        </NextLink>
      ) : (
        <span />
      )}
      <p className="text-tinte-2 tabular-nums">{texte.seite}</p>
      {seite < seiten ? (
        <NextLink href={weiterHref} className={link}>
          {texte.weiter}
        </NextLink>
      ) : (
        <span />
      )}
    </nav>
  );
}
