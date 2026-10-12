import { getTranslations } from 'next-intl/server';
import { Fragment, type ReactNode } from 'react';
import { Zustandsgrafik } from '@/components/website/Zustandsgrafik';
import { cn } from '@/lib/utils';

/**
 * Scrollbarer Rahmen für breite Tabellen (Muster 7). Der Rahmen ist per Tastatur erreichbar, hat einen Namen
 * (role="region") und zeigt unter 768 px den Hinweis „Zum Weiterlesen seitlich wischen“ (DP-C2 Befund 3).
 * Mit `mobil` (H-B06) zeigt das Telefon stattdessen diese Fassung (Karten), die Tabelle ist dort ausgeblendet; dann
 * entfällt auch der Wischhinweis. Nur für Server-Komponenten; die Tabelle selbst bleibt unverändert.
 */
export async function TabellenRahmen({
  beschriftung,
  children,
  className,
  mobil,
}: {
  beschriftung: string;
  children: ReactNode;
  className?: string;
  mobil?: ReactNode;
}) {
  const t = await getTranslations('verwaltung.shell');
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className={cn('text-16 text-tinte-2 md:hidden', mobil && 'max-md:hidden')}>{t('wischen')}</p>
      {mobil ? <div className="flex min-w-0 flex-col gap-3 md:hidden">{mobil}</div> : null}
      <div
        role="region"
        aria-label={beschriftung}
        tabIndex={0}
        className={cn('relative overflow-x-auto rounded-lg border border-linie bg-weiss', mobil && 'max-md:hidden', className)}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Leerzustand einer Verwaltungsliste (K-16, REFERENZ §2): Karte mit Zustandsgrafik „leer“, dem Satz der Liste und –
 * nur wenn die Rolle es darf – dem Knopf zum Anlegen. Papierkorb leer: ohne `aktion` nur Grafik und Text.
 */
export function ListenLeer({ text, aktion }: { text: string; aktion?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-linie bg-weiss px-6 py-12 text-center">
      <Zustandsgrafik art="leer" />
      <p className="text-tinte-2">{text}</p>
      {aktion}
    </div>
  );
}

/** Eine Angabe auf der Telefonkarte: Bezeichnung links, Wert rechts; `zahl` setzt Ziffern tabular. */
export type KartenAngabe = { label: string; wert: ReactNode; zahl?: boolean };

/**
 * Telefonkarte einer Verwaltungsliste (Muster der Veranstaltungsliste, H-B06; K-16): Titel, Angaben als Liste,
 * Aktionen mit 48-px-Knöpfen. Die Seite liefert Aktionen und Rechte je Zeile wie in der Tabelle.
 */
export function ListenKarte({ titel, angaben, aktionen }: { titel: ReactNode; angaben: KartenAngabe[]; aktionen: ReactNode }) {
  return (
    <li className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-4">
      <h2 className="font-text text-20 font-bold tracking-normal">{titel}</h2>
      <dl className="grid raster-symbol gap-x-3 gap-y-2 text-16">
        {angaben.map((a) => (
          <Fragment key={a.label}>
            <dt className="font-bold text-tinte-2">{a.label}</dt>
            <dd className={a.zahl ? 'tabular-nums' : undefined}>{a.wert}</dd>
          </Fragment>
        ))}
      </dl>
      <div className="flex justify-end gap-2">{aktionen}</div>
    </li>
  );
}
