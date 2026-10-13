import { AudioLines, Circle, CircleCheck, ListChecks, type LucideIcon } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/utils';
import type { SurenStand, SurenStufe } from '@/server/queries/verwaltung/rezitationen';

const STUFEN: readonly SurenStufe[] = ['leer', 'audio', 'verse', 'fertig'];
const ICON: Record<SurenStufe, LucideIcon> = { leer: Circle, audio: AudioLines, verse: ListChecks, fertig: CircleCheck };
const TON: Record<SurenStufe, string> = {
  leer: 'border-linie bg-weiss text-tinte-2',
  audio: 'border-warnung bg-warnung-toenung text-tinte',
  verse: 'border-info bg-info-toenung text-tinte',
  fertig: 'border-gruen-700 bg-gruen-50 text-gruen-950',
};

/** Empfohlene Reihenfolge (ADR 0029): Al-Fatiha, dann Cüz 30 (Suren 78–114). */
export const ZUERST = [1, ...Array.from({ length: 37 }, (_, i) => 78 + i)];
/** Reihenfolge der Werkstatt-Navigation: erst die Empfehlung, dann 2–77. */
export const REIHENFOLGE = [...ZUERST, ...Array.from({ length: 76 }, (_, i) => 2 + i)];

/**
 * Suren-Raster einer Rezitation (H-Q05): je Sure ein Feld mit Stand (Farbe, Symbol und Text – nie Farbe allein) und Link
 * in die Werkstatt. Zuerst Al-Fatiha und Cüz 30, dann die übrigen Suren.
 */
export async function SurenRaster({ id, suren }: { id: string; suren: SurenStand[] }) {
  const t = await getTranslations('verwaltung.rezitationen.raster');
  const je = new Map(suren.map((s) => [s.nr, s]));
  const feld = (nr: number) => {
    const s = je.get(nr);
    if (!s) return null;
    const Icon = ICON[s.stufe];
    return (
      <li key={nr}>
        <NextLink
          href={`/verwaltung/rezitationen/${id}/abgleich/${nr}`}
          aria-label={t('oeffnen', { nr, name: s.umschrift, stand: t(`stufe.${s.stufe}`) })}
          className={cn(
            'flex min-h-14 items-center gap-2 rounded-md border px-3 py-2 no-underline transition-colors duration-(--dauer-rueckmeldung) hover:border-gruen-800 hover:shadow-s1',
            TON[s.stufe],
          )}
        >
          <Icon aria-hidden className="size-5 shrink-0" />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="font-bold tabular-nums">{t('sure', { nr })}</span>
            <span className="truncate text-16">{s.umschrift}</span>
          </span>
        </NextLink>
      </li>
    );
  };
  const gruppe = (titel: string, liste: number[]) => (
    <div className="flex flex-col gap-3">
      <h3 className="text-20 font-bold">{titel}</h3>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">{liste.map(feld)}</ul>
    </div>
  );
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <ul aria-label={t('legende')} className="flex flex-wrap gap-x-4 gap-y-2 text-16">
          {STUFEN.map((s) => {
            const Icon = ICON[s];
            return (
              <li key={s} className="flex items-center gap-2">
                <span className={cn('inline-flex size-7 items-center justify-center rounded-sm border', TON[s])}>
                  <Icon aria-hidden className="size-4" />
                </span>
                {t(`stufe.${s}`)}
              </li>
            );
          })}
        </ul>
      </div>
      {gruppe(t('zuerst'), ZUERST)}
      {gruppe(
        t('weitere'),
        REIHENFOLGE.filter((nr) => !ZUERST.includes(nr)),
      )}
    </div>
  );
}
