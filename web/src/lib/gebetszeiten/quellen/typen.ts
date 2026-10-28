import type { LieferTag } from '../abgleich-diff';

/**
 * Quellen des IGMG-Abgleichs (ADR 0048), quellenneutral: der offizielle Feed (`igmg-feed.ts`) und die von der IGMG gelieferte
 * Jahresdatei im Repository (`datei.ts`). Nur offiziell bereitgestellte Wege – nie die interne Schnittstelle der Website,
 * kein PDF-Export, keine Browser-Nachahmung, keine Cookies.
 */
export type QuellenId = 'igmg-feed' | 'igmg-datei';

/** Fehlercodes ohne Inhalte (stehen im Laufprotokoll und im Startklar-Cockpit). */
export type QuellenFehlerCode =
  'nicht_eingerichtet' | 'adresse' | 'netz' | 'zeitlimit' | 'status' | 'zu_gross' | 'inhaltstyp' | 'format' | 'pruefsumme';

export class QuellenFehler extends Error {
  constructor(
    readonly code: QuellenFehlerCode,
    readonly status?: number,
  ) {
    super(`Gebetszeiten-Quelle: ${code}${status ? ` (${status})` : ''}`);
    this.name = 'QuellenFehler';
  }
}

export type Lieferung = {
  tage: LieferTag[];
  /** Stand laut Quelle (Text wie geliefert, gekürzt), sonst null */
  stand: string | null;
  /** Ort laut Quelle: Stadt-ID oder Name, sonst null */
  ort: { id: string | null; name: string | null };
  /** SHA-256 der gelieferten Bytes (hex) */
  sha256: string;
};

/** Einsetzbarer Abruf (Tests: Fake-Feed ohne Netz); Standard ist `fetch`. */
export type Abruf = (adresse: string, init: RequestInit) => Promise<Response>;

export type HolAuftrag = {
  von: string;
  bis: string;
  stadtId: string;
  signal?: AbortSignal;
};

export interface GebetszeitenQuelle {
  id: QuellenId;
  /** Eingerichtet (Adresse gesetzt bzw. Datei vorhanden)? Ohne Netz und ohne Seiteneffekt. */
  bereit(): boolean;
  hole(auftrag: HolAuftrag): Promise<Lieferung>;
}
