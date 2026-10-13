import { textIn, type AnzeigeFolie, type AnzeigeSprache } from '@/lib/anzeige/folien';
import { arabischeZahl, VERSENDE } from '@/lib/quran/satz';

export type FolienTexte = {
  /** „Sure {sure}, Vers {vers}“ */
  versQuelle: string;
  /** „Sahih al-Bukhari {nummer}“ */
  hadithQuelle: string;
  /** „Übersetzung: {quelle}“ */
  uebersetzung: string;
};

const fuelle = (vorlage: string, werte: Record<string, string>) => vorlage.replace(/\{(\w+)\}/g, (_, k: string) => werte[k] ?? '');

/**
 * Schriftgröße nach Textlänge: Religiöse Texte werden nie gekürzt – lange Verse und Hadithe stehen kleiner.
 * Stufen in Zeichen des arabischen Texts bzw. der Übersetzung.
 */
function arabischGroesse(laenge: number): string {
  if (laenge <= 160) return 'text-arabisch-1 @5xl:text-48';
  if (laenge <= 420) return 'text-24 @5xl:text-30 @7xl:text-36';
  return 'text-20 @5xl:text-24 @7xl:text-30';
}
function uebersetzungGroesse(laenge: number): string {
  if (laenge <= 220) return 'text-20 @5xl:text-24';
  return 'text-18 @5xl:text-20';
}

/**
 * Eine Folie der Bildschirm-Anzeige (AUFTRAG 3.10, B-25) – ohne Zustand, ohne next-intl, für die Anzeige (Client) und
 * die Vorschau der Verwaltung (Server). Größen wachsen mit der Breite des umgebenden `@container`. Vers- und
 * Hadith-Folien zeigen nur Datenbanktexte: Arabisch aus dem Import (`lang="ar" dir="rtl"`), Übersetzung nur, wenn
 * freigegeben – sonst nur Arabisch und Quelle. Versende und Ziffern aus Unicode-Codepunkten.
 */
export function FolienAnsicht({ folie, sprache, texte }: { folie: AnzeigeFolie; sprache: AnzeigeSprache; texte: FolienTexte }) {
  if (folie.art === 'text') {
    const titel = textIn(folie.titel, sprache);
    const text = textIn(folie.text, sprache);
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 text-center @5xl:gap-6">
        {titel ? (
          <p lang={titel.sprache} className="text-30 leading-tight font-bold text-balance @3xl:text-36 @5xl:text-48">
            {titel.text}
          </p>
        ) : null}
        {text ? (
          <p
            lang={text.sprache}
            className="max-w-(--container-lesen) text-20 leading-snug whitespace-pre-line text-gruen-100 @3xl:text-24 @5xl:text-30"
          >
            {text.text}
          </p>
        ) : null}
      </div>
    );
  }
  if (folie.art === 'bild') {
    const alt = textIn(folie.bild.alt, sprache);
    const titel = textIn(folie.titel, sprache);
    return (
      <figure className="flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-3">
        {/* Anzeige: Originaldatei aus der Mediathek, ohne Bildoptimierung (Kiosk, Vorrat im Browser) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={folie.bild.url}
          alt={alt?.text ?? ''}
          lang={alt?.sprache}
          width={folie.bild.breite}
          height={folie.bild.hoehe}
          className="min-h-0 w-auto max-w-full flex-1 rounded-lg object-contain"
        />
        {titel ? (
          <figcaption lang={titel.sprache} className="text-20 font-bold @5xl:text-30 @7xl:text-36">
            {titel.text}
          </figcaption>
        ) : null}
      </figure>
    );
  }
  const uebersetzung = folie.uebersetzung[sprache] ?? null;
  const laenge = folie.art === 'vers' ? folie.verse.reduce((n, v) => n + v.textAr.length, 0) : folie.textAr.length;
  const quelle =
    folie.art === 'vers'
      ? fuelle(texte.versQuelle, {
          sure: folie.sureName,
          vers: folie.verse.length > 1 ? `${folie.verse[0].nr}–${folie.verse.at(-1)!.nr}` : String(folie.verse[0]?.nr ?? ''),
        })
      : fuelle(texte.hadithQuelle, { nummer: folie.nummer });
  return (
    <figure className="flex h-full flex-1 flex-col items-center justify-center gap-4 text-center @5xl:gap-6">
      <blockquote
        lang="ar"
        dir="rtl"
        className={`max-w-(--container-inhalt) font-arabic leading-relaxed text-balance ${arabischGroesse(laenge)}`}
      >
        {folie.art === 'vers'
          ? folie.verse.map((v) => (
              <span key={v.nr}>
                {v.textAr} {VERSENDE}
                {arabischeZahl(v.nr)}{' '}
              </span>
            ))
          : folie.textAr}
      </blockquote>
      {uebersetzung ? (
        <p
          lang={sprache}
          className={`max-w-(--container-lesen) leading-snug text-gruen-100 ${uebersetzungGroesse(uebersetzung.text.length)}`}
        >
          {uebersetzung.text}
        </p>
      ) : null}
      <figcaption className="flex flex-col gap-1 text-18 text-gruen-100 @5xl:text-20">
        <cite className="font-bold text-weiss not-italic">{quelle}</cite>
        {uebersetzung ? <span>{fuelle(texte.uebersetzung, { quelle: uebersetzung.quelle })}</span> : null}
      </figcaption>
    </figure>
  );
}
