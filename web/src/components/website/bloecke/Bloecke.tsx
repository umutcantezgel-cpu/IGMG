import type { Sprache } from '@/lib/i18n/inhalt';
import type { BildKarte } from '@/lib/medien/bild';
import type { Block } from '@/lib/validierung/bloecke';
import { zielAdresse } from '@/server/queries/menues';
import type { DateiKarte } from '@/server/queries/seiten';
import { ladeSeitenAdressen } from '@/server/queries/seiten';
import { GebetszeitenAnsicht, KontaktAnsicht, NachrichtenAnsicht, TermineAnsicht } from './DatenBloecke';
import { BildAnsicht, DownloadAnsicht, GalerieAnsicht } from './MedienBloecke';
import { HadithAnsicht, VersAnsicht } from './ReligioeseBloecke';
import { AufrufAnsicht, FaqAnsicht, SpaltenAnsicht, TextBlockAnsicht, TrennerAnsicht } from './TextBloecke';

/**
 * Ausgabe der Bausteine einer freien Seite (ADR 0032) als Server-Komponenten: ruhiger Rhythmus mit gleichen Abständen,
 * Lesespalte für Text, ganze Breite für Raster. Daten-Bausteine lesen gecachte Abfragen mit eigenen Tags; die Seite
 * bleibt statisch (MUSTER 1).
 */
export async function Bloecke({
  bloecke,
  sprache,
  bilder,
  dateien,
}: {
  bloecke: readonly Block[];
  sprache: Sprache;
  bilder: BildKarte;
  dateien: DateiKarte;
}) {
  const seiten = bloecke.some((b) => b.typ === 'aufruf') ? await ladeSeitenAdressen() : {};
  return (
    <div className="flex flex-col gap-12 py-abschnitt md:gap-16">
      {bloecke.map((b) => {
        switch (b.typ) {
          case 'text':
            return <TextBlockAnsicht key={b.id} b={b} sprache={sprache} bilder={bilder} />;
          case 'bild':
            return <BildAnsicht key={b.id} b={b} sprache={sprache} bilder={bilder} />;
          case 'galerie':
            return <GalerieAnsicht key={b.id} b={b} sprache={sprache} bilder={bilder} />;
          case 'aufruf':
            return <AufrufAnsicht key={b.id} b={b} sprache={sprache} href={zielAdresse(b.ziel, sprache, seiten)} />;
          case 'faq':
            return <FaqAnsicht key={b.id} b={b} sprache={sprache} />;
          case 'trenner':
            return <TrennerAnsicht key={b.id} />;
          case 'spalten':
            return <SpaltenAnsicht key={b.id} b={b} sprache={sprache} />;
          case 'termine':
            return <TermineAnsicht key={b.id} b={b} sprache={sprache} />;
          case 'nachrichten':
            return <NachrichtenAnsicht key={b.id} b={b} sprache={sprache} />;
          case 'kontakt':
            return <KontaktAnsicht key={b.id} b={b} sprache={sprache} />;
          case 'download':
            return <DownloadAnsicht key={b.id} b={b} sprache={sprache} dateien={dateien} />;
          case 'gebetszeiten':
            return <GebetszeitenAnsicht key={b.id} b={b} sprache={sprache} />;
          case 'vers':
            return <VersAnsicht key={b.id} b={b} sprache={sprache} />;
          case 'hadith':
            return <HadithAnsicht key={b.id} b={b} sprache={sprache} />;
        }
      })}
    </div>
  );
}
