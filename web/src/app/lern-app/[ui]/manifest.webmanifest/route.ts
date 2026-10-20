import { LERNAPP_FARBE } from '@/lib/lernapp/farben';
import { OBERFLAECHEN, istOberflaeche, richtung } from '@/lib/lernapp/kurse';
import { lernTexte } from '@/lib/lernapp/texte';

export function generateStaticParams() {
  return OBERFLAECHEN.map((sprache) => ({ ui: sprache }));
}

/**
 * Web-App-Manifest der Lern-App je Oberflächensprache (ADR 0037 Nr. 8 mit Fortschreibung S1 Nr. 5): eine `id`
 * `/lern-app/` für alle drei Sprachen (eine installierte App, die in der Sprache startet, in der sie installiert wurde),
 * `scope` `/lern-app/`, getrennt vom Manifest der Website (`app/manifest.ts`, Scope `/`). Name als Platzhalter, bis der
 * Vorstand entscheidet (OFFENE FRAGE ADR 0037); Symbole aus dem Achtstern (`scripts/lernapp-symbole.mjs`). Statisch beim
 * Bau erzeugt, ein Jahr im CDN (`s-maxage`); ein neuer Bau ersetzt es.
 */
export async function GET(_anfrage: Request, { params }: RouteContext<'/lern-app/[ui]/manifest.webmanifest'>) {
  const { ui } = await params;
  if (!istOberflaeche(ui)) return new Response(null, { status: 404 });
  const t = lernTexte(ui);
  const manifest = {
    id: '/lern-app/',
    name: t('meta.name'),
    short_name: t('meta.kurzname'),
    description: t('meta.beschreibung'),
    lang: ui,
    dir: richtung(ui),
    start_url: `/lern-app/${ui}`,
    scope: '/lern-app/',
    display: 'standalone',
    background_color: LERNAPP_FARBE.papier,
    theme_color: LERNAPP_FARBE.gruen,
    icons: [
      { src: '/lern-app/symbole/symbol-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/lern-app/symbole/symbol-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/lern-app/symbole/symbol-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8', 'Cache-Control': 's-maxage=31536000' },
  });
}
