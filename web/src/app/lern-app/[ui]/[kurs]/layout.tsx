import { istOberflaeche, KURS_SLUGS, kursInOberflaeche } from '@/lib/lernapp/kurse';

/**
 * Kurse je Oberfläche (PLAN §3.1, `kursPfade()`): sechs Richtungen, Wissen, Koran-Arabisch (nicht in `ar`) – für den
 * Lernpfad und seine Hüllen (Üben, Wiederholen, Einstufung, Tipps), alle statisch vorgerendert. Die Parameter-Zuordnung
 * „not-found“ schließt die Liste: Ein unbekannter Kurs fällt auf die Fangroute `[ui]/[...rest]` (404 der Lern-App).
 */
export const unstable_paramMatching = { kurs: 'not-found' } as const;

export function generateStaticParams({ params }: { params: { ui: string } }) {
  const ui = params.ui;
  return istOberflaeche(ui) ? KURS_SLUGS.filter((kurs) => kursInOberflaeche(kurs, ui)).map((kurs) => ({ kurs })) : [];
}

export default function KursLayout({ children }: LayoutProps<'/lern-app/[ui]/[kurs]'>) {
  return children;
}
