import type { WegStation } from '@/components/website/elifbe/Weg';
import { STATIONEN } from '@/lib/elifbe/lektionen';

type Uebersetzer = (schluessel: string, werte?: Record<string, string | number>) => string;

/** Stationen des Elifbe-Wegs mit Texten (Namensraum `elifbe`) und Zielen. */
export function elifbeStationen(t: Uebersetzer): WegStation[] {
  return STATIONEN.map((s, i): WegStation => {
    const kennung = t('weg.station', { nr: i + 1 });
    switch (s.art) {
      case 'buchstaben':
        return { kennung, titel: t('weg.buchstabenTitel'), text: t('weg.buchstabenText'), ziel: '/elifbe/buchstaben' };
      case 'formen':
        return {
          kennung,
          titel: t('weg.formenTitel'),
          text: t('weg.formenText'),
          ziel: { pathname: '/elifbe/buchstaben', hash: 'formen' },
        };
      case 'lektion':
        return {
          kennung,
          titel: t(`lektionen.${s.lektion.schluessel}.titel`),
          text: t(`lektionen.${s.lektion.schluessel}.kurz`),
          ziel: { pathname: '/elifbe/lektion/[lektion]', params: { lektion: s.lektion.slug } },
        };
      case 'ueben':
        return { kennung, titel: t('weg.uebenTitel'), text: t('weg.uebenText'), ziel: '/elifbe/ueben' };
    }
  });
}
