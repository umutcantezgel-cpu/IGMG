import { CircleAlert, CircleCheck, Hand, Info, TriangleAlert, type LucideIcon } from 'lucide-react';

/** Status einer Startklar-Prüfung. Die Typen liegen hier, damit Seite und Liste dieselben Stile nutzen (H-B06). */
export type PruefStatus = 'fehler' | 'warnung' | 'manuell' | 'hinweis' | 'ok';

/**
 * Stil je Status: Badge (`klasse`), Kante der Prüfkarte und der Bilanzkasten (`kante`, 4-px-Linie links in
 * Etikettfarbe), Ziffer der Bilanz (`ziffer`). Die Bedeutung trägt zusätzlich das Symbol, damit Graustufen eindeutig bleiben.
 */
export const STATUS_STIL: Record<PruefStatus, { Icon: LucideIcon; klasse: string; kante: string; ziffer: string }> = {
  fehler: {
    Icon: CircleAlert,
    klasse: 'border-fehler bg-fehler-toenung text-fehler',
    kante: 'border-l-fehler',
    ziffer: 'text-fehler',
  },
  warnung: {
    Icon: TriangleAlert,
    klasse: 'border-warnung bg-warnung-toenung text-warnung',
    kante: 'border-l-warnung',
    ziffer: 'text-warnung',
  },
  manuell: { Icon: Hand, klasse: 'border-info bg-info-toenung text-info', kante: 'border-l-info', ziffer: 'text-info' },
  hinweis: { Icon: Info, klasse: 'border-info bg-info-toenung text-info', kante: 'border-l-info', ziffer: 'text-info' },
  ok: { Icon: CircleCheck, klasse: 'border-gruen-700 bg-gruen-50 text-gruen-800', kante: 'border-l-gruen-700', ziffer: 'text-gruen-800' },
};
