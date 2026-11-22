import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { BildKarte } from '@/lib/medien/bild';
import type { Block } from '@/lib/validierung/bloecke';
import { zielAdresse } from '@/server/queries/menues';
import type { DateiKarte } from '@/server/queries/seiten';
import { ladeSeitenAdressen } from '@/server/queries/seiten';
import { GebetszeitenAnsicht, KontaktAnsicht, NachrichtenAnsicht, TermineAnsicht } from './DatenBloecke';
import { BlockRahmen } from './hilfen';
import { BildAnsicht, DownloadAnsicht, GalerieAnsicht } from './MedienBloecke';
import { oeffentlicheBloecke } from './oeffentlich';
import { HadithAnsicht, VersAnsicht } from './ReligioeseBloecke';
import { AufrufAnsicht, FaqAnsicht, SpaltenAnsicht, TextBlockAnsicht, TrennerAnsicht } from './TextBloecke';

/**
 * Ausgabe der Bausteine einer freien Seite (ADR 0032) als Server-Komponenten: ruhiger Rhythmus mit gleichen Abständen,
 * Lesespalte für Text, ganze Breite für Raster. Daten-Bausteine lesen gecachte Abfragen mit eigenen Tags; die Seite
 * bleibt statisch (MUSTER 1).
 * `oeffentlich`: Ausgabe der öffentlichen Seite – Platzhalter der Gemeinde „[…]“ erscheinen nicht, leer gewordene
 * Bausteine entfallen (`oeffentlicheBloecke`); bleibt kein Baustein, steht ein kurzer Hinweis mit dem Weg zur
 * Kontaktseite. Ohne die Angabe (Verwaltung: Vorschau, Fassungen, Freigabe) erscheinen die Bausteine unverändert.
 */
export async function Bloecke({
  bloecke: alle,
  sprache,
  bilder,
  dateien,
  oeffentlich = false,
}: {
  bloecke: readonly Block[];
  sprache: Sprache;
  bilder: BildKarte;
  dateien: DateiKarte;
  oeffentlich?: boolean;
}) {
  const bloecke = oeffentlich ? oeffentlicheBloecke(alle, sprache) : alle;
  if (oeffentlich && bloecke.length === 0) {
    const t = await getTranslations({ locale: sprache, namespace: 'bloecke' });
    return (
      <div className="py-abschnitt">
        <BlockRahmen>
          <p className="max-w-text text-20 leading-einleitung text-pretty text-tinte-2">{t('ohneInhalt')}</p>
          <Link
            href="/kontakt"
            className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-700 underline underline-offset-4 hover:text-gruen-800"
          >
            {t('zurKontaktseite')}
            <ArrowRight aria-hidden className="size-5" />
          </Link>
        </BlockRahmen>
      </div>
    );
  }
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
            return <KontaktAnsicht key={b.id} b={b} sprache={sprache} oeffentlich={oeffentlich} />;
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
