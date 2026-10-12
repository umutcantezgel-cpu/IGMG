import { CircleAlert, CircleCheck, Hand, Info, TriangleAlert, type LucideIcon } from 'lucide-react';

/** Status einer Startklar-Prüfung. Die Typen liegen hier, damit Seite und Liste dieselben Stile nutzen (H-B06). */
export type PruefStatus = 'fehler' | 'warnung' | 'manuell' | 'hinweis' | 'ok';

/**
 * Stil je Status: Badge (`klasse`) und Ziffer der Bilanz (`ziffer`). Die Bedeutung trägt zusätzlich das Symbol, damit
 * Graustufen eindeutig bleiben. Ohne farbige Seitenkanten (H-C08).
 */
export const STATUS_STIL: Record<PruefStatus, { Icon: LucideIcon; klasse: string; ziffer: string }> = {
  fehler: { Icon: CircleAlert, klasse: 'border-fehler bg-fehler-toenung text-fehler', ziffer: 'text-fehler' },
  warnung: { Icon: TriangleAlert, klasse: 'border-warnung bg-warnung-toenung text-warnung', ziffer: 'text-warnung' },
  manuell: { Icon: Hand, klasse: 'border-info bg-info-toenung text-info', ziffer: 'text-info' },
  hinweis: { Icon: Info, klasse: 'border-info bg-info-toenung text-info', ziffer: 'text-info' },
  ok: { Icon: CircleCheck, klasse: 'border-gruen-700 bg-gruen-50 text-gruen-800', ziffer: 'text-gruen-800' },
};
