import { getLocale, getTranslations } from 'next-intl/server';
import { Verweisliste } from '@/components/website/dachverband/Verweisliste';
import type { Locale } from '@/i18n/routing';
import type { Zeitquelle } from '@/lib/gebetszeiten/typen';
import { datumOhneWochentag } from '@/lib/i18n/format';

/**
 * Herkunft der angezeigten Gebetszeiten (ADR 0048), als Server-Text ohne JavaScript (K-12): „Quelle: IGMG-Gebetskalender,
 * Stand …“ für Tage aus dem IGMG-Kalender, „Tabelle der Gemeinde“ für Importe, „berechnet (vorläufig)“ für gerechnete
 * Tage (solange die Gemeinde nicht bestätigt hat) – darunter immer der Direktlink auf den IGMG-Gebetskalender für Wetzlar.
 * Nur ein Link: igmg.org wird erst beim Klick aufgerufen (K-14).
 */
export async function GebetszeitenQuelle({
  tage,
  stand,
  rueckfall,
  bestaetigt,
}: {
  tage: readonly { quelle: Zeitquelle }[];
  /** Stand der IGMG-Zeiten (JJJJ-MM-TT) oder null */
  stand: string | null;
  rueckfall: 'naeherung' | 'methode';
  bestaetigt: boolean;
}) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('gebetszeitenQuelle');
  const arten = new Set(tage.map((x) => x.quelle));
  // Mittag UTC hält den Kalendertag in Europe/Berlin stabil
  const datum = stand ? datumOhneWochentag(new Date(`${stand}T12:00:00Z`), sprache) : null;
  return (
    <div className="flex flex-col gap-1 text-16 text-tinte-2">
      {arten.has('igmg') ? <p>{datum ? t('igmg', { datum }) : t('igmgOhneStand')}</p> : null}
      {arten.has('import') ? <p>{t('import')}</p> : null}
      {arten.has('berechnet') && !bestaetigt ? <p>{t(rueckfall === 'naeherung' ? 'berechnet' : 'berechnetMethode')}</p> : null}
      <Verweisliste eintraege={['gebetskalender']} mitBeschreibung={false} />
    </div>
  );
}
