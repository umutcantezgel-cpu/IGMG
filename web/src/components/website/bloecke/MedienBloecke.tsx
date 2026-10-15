import { Download, FileText } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Bildplatzhalter } from '@/components/website/Bildplatzhalter';
import { MedienBild, SIZES_RASTER, SIZES_TEXTSPALTE } from '@/components/website/MedienBild';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { BildKarte } from '@/lib/medien/bild';
import type { BlockVon } from '@/lib/validierung/bloecke';
import type { DateiKarte } from '@/server/queries/seiten';
import { BlockKopf, BlockRahmen, dateiGroesse, tx } from './hilfen';

/** Ganze Inhaltsbreite (1280 px im Container, darunter volle Breite). */
const SIZES_BREIT = '(min-width: 1344px) 1280px, 100vw';

/**
 * Baustein „Bild“ (K-10): Alt-Text aus dem Baustein (Pflicht, je Sprache mit Rückfall), Bildunterschrift optional.
 * Fehlt das Medium (Papierkorb), bleibt eine ruhige Platzhalterfläche statt eines kaputten Bilds.
 */
export async function BildAnsicht({ b, sprache, bilder }: { b: BlockVon<'bild'>; sprache: Sprache; bilder: BildKarte }) {
  const t = await getTranslations({ locale: sprache, namespace: 'bloecke' });
  const bild = bilder[b.mediumId];
  const unterschrift = tx(b.unterschrift, sprache);
  const breit = b.breite === 'breit';
  return (
    <BlockRahmen breit={breit}>
      <figure className="flex flex-col gap-3">
        {bild ? (
          <MedienBild
            bild={{ ...bild, alt: { de: b.alt.de, tr: b.alt.tr, en: b.alt.en } }}
            sprache={sprache}
            sizes={breit ? SIZES_BREIT : SIZES_TEXTSPALTE}
            className="h-auto w-full rounded-lg border border-linie"
          />
        ) : (
          <Bildplatzhalter beschriftung={t('bildFehlt')} className="aspect-16/9 w-full rounded-lg border border-linie" />
        )}
        {unterschrift.text ? (
          <figcaption lang={unterschrift.lang} className="max-w-text text-16 text-tinte-2">
            {unterschrift.text}
          </figcaption>
        ) : null}
      </figure>
    </BlockRahmen>
  );
}

/** Baustein „Bildergalerie“: Raster gleich großer Bilder (4:3), zwei Spalten am Telefon, drei ab 768 px. */
export function GalerieAnsicht({ b, sprache, bilder }: { b: BlockVon<'galerie'>; sprache: Sprache; bilder: BildKarte }) {
  const titel = tx(b.titel, sprache);
  const id = `b-${b.id}`;
  const sichtbar = b.bilder.filter((g) => bilder[g.mediumId]);
  if (!sichtbar.length) return null;
  return (
    <BlockRahmen breit beschriftung={titel.text ? id : undefined}>
      {titel.text ? <BlockKopf id={id} titel={titel.text} lang={titel.lang} /> : null}
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
        {sichtbar.map((g, i) => (
          <li key={`${g.mediumId}-${i}`}>
            <MedienBild
              bild={{ ...bilder[g.mediumId], alt: { de: g.alt.de, tr: g.alt.tr, en: g.alt.en } }}
              sprache={sprache}
              sizes={SIZES_RASTER}
              className="aspect-4/3 w-full rounded-lg border border-linie"
            />
          </li>
        ))}
      </ul>
    </BlockRahmen>
  );
}

/** Baustein „Datei zum Herunterladen“: Karte mit Dateityp und Größe; die Datei kommt aus der Mediathek. */
export async function DownloadAnsicht({ b, sprache, dateien }: { b: BlockVon<'download'>; sprache: Sprache; dateien: DateiKarte }) {
  const datei = dateien[b.mediumId];
  if (!datei) return null;
  const t = await getTranslations({ locale: sprache, namespace: 'bloecke' });
  const titel = tx(b.titel, sprache);
  const beschreibung = tx(b.beschreibung, sprache);
  const art = datei.typ === 'application/pdf' ? 'PDF' : (datei.dateiname?.split('.').pop()?.toUpperCase() ?? t('datei'));
  return (
    <BlockRahmen>
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-linie bg-weiss p-5 shadow-s1 md:p-6">
        <span aria-hidden className="flex size-14 shrink-0 items-center justify-center rounded-md bg-gruen-50 text-gruen-800">
          <FileText className="size-7" />
        </span>
        <div className="flex min-w-0 flex-1 basis-60 flex-col gap-1">
          <p lang={titel.lang} className="text-20 leading-tight font-bold">
            {titel.text}
          </p>
          {beschreibung.text ? (
            <p lang={beschreibung.lang} className="text-16 text-tinte-2">
              {beschreibung.text}
            </p>
          ) : null}
          <p className="text-16 text-tinte-2">{t('dateiAngabe', { art, groesse: dateiGroesse(datei.groesse, sprache) })}</p>
        </div>
        <a
          href={datei.url}
          download={datei.dateiname ?? true}
          aria-label={`${t('herunterladen')}: ${titel.text}`}
          className="inline-flex min-h-12 w-full druck items-center justify-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5.5 font-bold text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800 sm:w-auto"
        >
          <Download aria-hidden className="size-5" />
          {t('herunterladen')}
        </a>
      </div>
    </BlockRahmen>
  );
}
