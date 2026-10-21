import { getTranslations } from 'next-intl/server';
import { Ansichten, PILLE } from '@/components/verwaltung/seiten/Ansichten';
import type { Status } from '@/lib/lernapp/freigabe';
import { darf, type RollenZuweisung } from '@/lib/rechte/matrix';
import { cn } from '@/lib/utils';

export type LernappBereich = 'uebersicht' | 'sprachpruefung' | 'audio' | 'meldungen' | 'quellen' | 'pruefende';

const BEREICHE = [
  { schluessel: 'uebersicht', pfad: '/verwaltung/lernapp', recht: 'lernapp.lesen' },
  { schluessel: 'sprachpruefung', pfad: '/verwaltung/lernapp/sprachpruefung', recht: 'lernapp.sprache.pruefen' },
  { schluessel: 'audio', pfad: '/verwaltung/lernapp/audio', recht: 'lernapp.audio.bearbeiten' },
  { schluessel: 'meldungen', pfad: '/verwaltung/lernapp/meldungen', recht: 'lernapp.bearbeiten' },
  { schluessel: 'quellen', pfad: '/verwaltung/lernapp/quellen', recht: 'lernapp.bearbeiten' },
  { schluessel: 'pruefende', pfad: '/verwaltung/lernapp/pruefende', recht: 'lernapp.bearbeiten' },
] as const;

/** Bereiche der Lern-App-Verwaltung als Linkliste (PLAN §7.1); nur die, für die die Rolle das Recht hat. */
export async function LernappNavigation({ aktiv, rollen }: { aktiv: LernappBereich; rollen: readonly RollenZuweisung[] }) {
  const t = await getTranslations('verwaltung.lernapp.navigation');
  const sichtbar = BEREICHE.filter((b) => darf(rollen, b.recht));
  if (sichtbar.length < 2) return null;
  return (
    <Ansichten
      label={t('label')}
      eintraege={sichtbar.map((b) => ({ schluessel: b.schluessel, label: t(b.schluessel), href: b.pfad, aktiv: b.schluessel === aktiv }))}
    />
  );
}

const STATUS_FARBE: Record<Status, string> = {
  entwurf: 'bg-sand text-tinte-2',
  automatisch_geprueft: 'bg-info-toenung text-info',
  veroeffentlicht: 'bg-gruen-50 text-gruen-800',
  gesperrt: 'bg-fehler-toenung text-fehler',
};

/** Status eines Bausteins als Pille (Farbe und Text, nie nur Farbe). */
export async function StatusPille({ status }: { status: Status }) {
  const t = await getTranslations('verwaltung.lernapp.status');
  return <span className={cn(PILLE, STATUS_FARBE[status])}>{t(status)}</span>;
}
