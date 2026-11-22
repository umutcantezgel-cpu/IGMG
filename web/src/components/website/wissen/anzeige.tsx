import { youtubeLink } from '@/lib/einbettung/youtube';
import type { Sprache } from '@/lib/i18n/inhalt';
import { angabe } from '@/lib/inhalt/platzhalter';
import { textMitSprache } from '../Text';
import { datumAnzeige } from './datum';
import type { WissenInhalt } from './inhalt';
import type { Anzeige, ArtikelAnzeige, ExpertenAnzeige, VideoAnzeige } from './typen';
import { VideoLink } from './VideoLink';

/**
 * Artikel, Videos und Experten des Seiteninhalts „wissen“ für die Inseln der Übersicht und der Themenseiten – ohne
 * Platzhalter der Gemeinde „[…]“ (`src/lib/inhalt/platzhalter.ts`, nichts wird erfunden): Ein Autorenname als Platzhalter
 * ergibt `null` (die Autorzeile entfällt). Ein Video ohne YouTube-ID entfällt – ohne Quelle gäbe es nichts anzusehen; die
 * übrigen bekommen ihren Link fertig vom Server (K-12, K-14). Ein Experte ohne gepflegten Namen entfällt; seine übrigen
 * Angaben sind leer, solange sie Platzhalter sind. Die Verwaltung zeigt weiterhin alle Einträge.
 */
export function wissenAnzeige(
  inhalt: WissenInhalt,
  sprache: Sprache,
  texte: { vorschau: (titel: string) => string; youtube: string },
): { artikel: ArtikelAnzeige[]; videos: VideoAnzeige[]; experten: ExpertenAnzeige[] } {
  // Klartext aus der Datenbank ist deutsch; in tr und en erscheint er mit lang="de" als sichtbarer Rückfall (K-02).
  const deutsch = (text: string): Anzeige => ({ text, lang: sprache === 'de' ? undefined : 'de' });
  const ohne = { platzhalter: true };
  return {
    artikel: inhalt.artikel.map((a) => {
      const autor = angabe(a.autor);
      return {
        schluessel: a.schluessel,
        thema: a.thema,
        titel: textMitSprache(a.titel, sprache),
        autor: autor ? deutsch(autor) : null,
        lesezeit: a.lesezeit,
        datum: a.datum ? datumAnzeige(a.datum, sprache) : '',
        text: a.text ? textMitSprache(a.text, sprache) : null,
      };
    }),
    videos: inhalt.videos.flatMap((v) => {
      if (!v.youtubeId) return [];
      const titel = textMitSprache(v.titel, sprache);
      return [
        {
          schluessel: v.schluessel,
          thema: v.thema,
          titel,
          dauer: v.dauer,
          beschreibung: textMitSprache(v.beschreibung, sprache, ohne),
          vorschau: texte.vorschau(titel.text),
          // Nur ein Link zu YouTube, keine Einbettung (K-12: die Seiten liegen an der JS-Grenze; K-14: kein Abruf beim Laden)
          link: <VideoLink href={youtubeLink(v.youtubeId)} text={texte.youtube} titel={titel.text} />,
        },
      ];
    }),
    experten: inhalt.experten.flatMap((e) => {
      const name = angabe(e.name);
      if (!name) return [];
      return [
        {
          schluessel: e.schluessel,
          name: deutsch(name),
          fachgebiet: textMitSprache(e.fachgebiet, sprache, ohne),
          institution: deutsch(angabe(e.institution) ?? ''),
          bio: textMitSprache(e.bio, sprache, ohne),
          anzahlArtikel: deutsch(angabe(e.anzahlArtikel) ?? ''),
        },
      ];
    }),
  };
}
