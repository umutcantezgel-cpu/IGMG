import { NachKlick } from '@/components/website/einbettung/NachKlick';

/**
 * Kartenfläche der Anfahrt (K-14): dünne Hülle um `NachKlick` – vor dem Klick nur der Hinweis und der Ladeknopf, danach
 * die Einbettung von OpenStreetMap ohne Referrer. Texte kommen als Props (K-12); der Platzhalter entsteht auf dem Server.
 * Die Einbettung ist Pflicht: Ohne bestätigte Koordinaten (M-010) rendert die Anfahrt auf dem Server den Platzhalter,
 * diese Fläche gibt es dann nicht (H-B10). Vor dem Klick gibt es keine Anfrage an OpenStreetMap.
 */
export function KarteNachKlick({
  einbettung,
  texte,
}: {
  einbettung: string;
  texte: {
    platzhalter: string;
    laden: string;
    hinweis: string;
    iframeTitel: string;
  };
}) {
  return (
    <NachKlick
      einbettung={einbettung}
      texte={{ laden: texte.laden, hinweis: texte.hinweis, iframeTitel: texte.iframeTitel }}
      platzhalter={<p className="text-16 text-tinte-2">{texte.platzhalter}</p>}
      verhaeltnis="karte"
      referrerPolicy="no-referrer"
    />
  );
}
