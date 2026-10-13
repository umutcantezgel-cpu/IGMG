import type { getTranslations } from 'next-intl/server';
import { istReligioes } from '@/lib/anzeige/folien';
import { datumKurz, uhrzeitNackt } from '@/lib/i18n/format';
import { cn } from '@/lib/utils';
import type { FolieVerwaltung } from '@/server/queries/verwaltung/anzeige';
import { FREIGABE_FARBE, pille, STATUS_FARBE } from './stil';

/** Bausteine des Moduls „Anzeige“ (Server-Komponenten): Bezeichnung, Zeitplan und Stand einer Folie. */
type Uebersetzer = Awaited<ReturnType<typeof getTranslations>>;

const zeitpunkt = (d: Date) => `${datumKurz(d, 'de')}, ${uhrzeitNackt(d, 'de')}`;

/** Bezeichnung ohne religiösen Text: Titel, Stelle („Sure Al-Baqara · 2:255“) oder Hadith-Nummer. */
export function folienName(f: FolieVerwaltung, t: Uebersetzer): string {
  const b = f.bezeichnung;
  if (b.art === 'vers') return t('bezeichnung.vers', { sure: b.sure, bezug: b.bezug });
  if (b.art === 'hadith') return t('bezeichnung.hadith', { nummer: b.nummer });
  return b.titel;
}

/** Zeitplan als Text: „ab …“, „bis …“, „… bis …“ oder „immer“; dazu die Wochentage (sonst „jeden Tag“). */
export function zeitplanText(f: Pick<FolieVerwaltung, 'von' | 'bis' | 'wochentage'>, t: Uebersetzer, jetzt: Date): string {
  const zeit =
    f.bis && f.bis.getTime() <= jetzt.getTime()
      ? t('zeitplan.abgelaufen')
      : f.von && f.bis
        ? t('zeitplan.vonBis', { von: zeitpunkt(f.von), bis: zeitpunkt(f.bis) })
        : f.von
          ? t('zeitplan.ab', { von: zeitpunkt(f.von) })
          : f.bis
            ? t('zeitplan.bis', { bis: zeitpunkt(f.bis) })
            : t('zeitplan.immer');
  const tage = f.wochentage.length
    ? [...f.wochentage]
        .sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
        .map((d) => t(`wochentag.${d}`))
        .join(', ')
    : t('zeitplan.jedenTag');
  return `${zeit} · ${tage}`;
}

/** Pillen: Sichtbarkeit und – bei Vers/Hadith – Stand der religiösen Freigabe. */
export function FolienStand({ f, t }: { f: Pick<FolieVerwaltung, 'art' | 'status' | 'freigabe'>; t: Uebersetzer }) {
  return (
    <span className="inline-flex flex-wrap gap-2">
      {/* Sichtbar geschaltet, aber noch ohne religiöse Freigabe: erscheint erst danach */}
      {f.status === 'veroeffentlicht' && istReligioes(f.art) && f.freigabe !== 'geprueft' ? (
        <span className={cn(pille, STATUS_FARBE.entwurf)}>{t('status.wartet')}</span>
      ) : (
        <span className={cn(pille, STATUS_FARBE[f.status])}>{t(`status.${f.status}`)}</span>
      )}
      {istReligioes(f.art) ? <span className={cn(pille, FREIGABE_FARBE[f.freigabe])}>{t(`freigabe.${f.freigabe}`)}</span> : null}
    </span>
  );
}
