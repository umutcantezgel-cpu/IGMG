import { OBERFLAECHEN, istOberflaeche, lernTexte, richtung } from '@/lib/lernapp/texte';

export function generateStaticParams() {
  return OBERFLAECHEN.map((sprache) => ({ ui: sprache }));
}

/**
 * Web-App-Manifest der Lern-App je Oberflächensprache (ADR 0037 Nr. 8): eigene `id` und eigener `scope` `/lern-app/`,
 * getrennt vom Manifest der Website (`app/manifest.ts`, Scope `/`). Gleiche `id` für alle Sprachen: eine installierte
 * App, die in der Sprache startet, in der sie installiert wurde. Name und Symbole sind Platzhalter (OFFENE FRAGE
 * ADR 0037, Symbole aus dem Achtstern folgen). Statisch beim Bau erzeugt.
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
    background_color: '#fcfaf6',
    theme_color: '#065f46',
    icons: [
      { src: '/symbole/symbol-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/symbole/symbol-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/symbole/symbol-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
  return new Response(JSON.stringify(manifest), { headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' } });
}
