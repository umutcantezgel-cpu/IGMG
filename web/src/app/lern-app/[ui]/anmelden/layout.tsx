import { connection } from 'next/server';

/**
 * Anmeldung im Scope der Lern-App (ADR 0037 Nr. 4, O-7): je Anfrage gerendert – Nonce-CSP, `noindex` und `no-store`
 * setzt der Proxy (L1-02), wie bei den Konto-Seiten der Website. `instant = false`: Die Seite darf auf dem Server auf die
 * Sitzung warten.
 */
export const instant = false;

export default async function LernAppAnmeldenLayout({ children }: LayoutProps<'/lern-app/[ui]/anmelden'>) {
  await connection();
  return children;
}
