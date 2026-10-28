import { CirclePlay } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { NachKlick } from '@/components/website/einbettung/NachKlick';
import type { Locale } from '@/i18n/routing';
import { youtubeEinbettung, youtubeLink } from '@/lib/einbettung/youtube';
import { waehle } from '@/lib/i18n/inhalt';
import type { HadschUmraInhalt } from '@/lib/validierung/seiteninhalte/hadsch-umra';

/**
 * Videos von IGMG Reisen (Plan Marktstart P4, K-14): je Video eine Fläche `NachKlick` – vor dem Klick nur ein eigener
 * Platzhalter mit Symbol, Titel und Jahr (kein Vorschaubild von YouTube), der Ladeknopf und der Hinweis zur
 * Datenübertragung; erst nach dem Klick die Einbettung über youtube-nocookie mit `strict-origin-when-cross-origin`
 * (YouTube verlangt eine Herkunftsangabe). Daneben der reine Link „Auf YouTube ansehen“. Die Texte kommen vom Server.
 */
export async function Videos({ videos, sprache }: { videos: HadschUmraInhalt['videos']; sprache: Locale }) {
  const [t, te] = await Promise.all([
    getTranslations({ locale: sprache, namespace: 'hadschUmra.videos' }),
    getTranslations({ locale: sprache, namespace: 'einbettung.video' }),
  ]);
  return (
    <ul className="grid gap-8 md:grid-cols-2">
      {videos.map((v) => {
        const titel = waehle(v.titel, sprache);
        return (
          <li key={v.youtubeId} className="flex min-w-0 flex-col">
            <NachKlick
              einbettung={youtubeEinbettung(v.youtubeId)}
              verhaeltnis="video"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="autoplay; encrypted-media; picture-in-picture"
              vollbild
              linkZiel={youtubeLink(v.youtubeId)}
              kontext={titel.text}
              texte={{
                laden: te('laden'),
                hinweis: te('hinweis'),
                iframeTitel: te('iframeTitel', { titel: titel.text }),
                link: te('aufYoutube'),
              }}
              platzhalter={
                <div className="flex flex-col items-center gap-2">
                  <CirclePlay aria-hidden className="size-10 text-gruen-700" />
                  <p lang={titel.rueckfall ? 'de' : undefined} className="text-20 font-bold text-balance text-tinte">
                    {titel.text}
                  </p>
                  {v.jahr ? <p className="text-16 text-tinte-2">{t('jahr', { jahr: v.jahr })}</p> : null}
                </div>
              }
            />
          </li>
        );
      })}
    </ul>
  );
}
