import { ArrowRight, CircleCheck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Bildplatzhalter } from '@/components/website/Bildplatzhalter';
import { Stern8 } from '@/components/website/Icons';
import { Text, textMitSprache } from '@/components/website/Text';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { ladeSeiteninhalt } from '@/server/queries/seiteninhalte';

const SEKUNDAER =
  'inline-flex min-h-12 items-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5.5 font-bold text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) active:scale-98 hover:bg-gruen-50 hover:text-gruen-800';
const TEXTLINK = 'inline-flex min-h-12 items-center gap-2 font-bold text-gruen-700 underline underline-offset-4';

/**
 * „Unsere neue Moschee – eröffnet“ (Vorführpfad Station 1, AUFTRAG 3.9): ruhiger Abschnitt ohne Bewegung unter dem
 * Bogen. Name, Beschreibung (mit Platzhaltern für Ort und Eröffnungsdatum) und Fertigstellungsjahr kommen aus dem
 * Seiteninhalt „projekte“, den die Gemeinde pflegt (MN-08) – nichts davon steht im Code. Das Foto ist ein beschrifteter
 * Platzhalter, bis die Gemeinde eines liefert: keine generierten Moscheebilder, keine Kuppel- oder Halbmondgrafik.
 * Erscheint nur, solange das Projekt „fertiggestellt“ ist; sonst erzählt /projekte den Stand.
 */
export async function UnsereMoschee({ sprache }: { sprache: Locale }) {
  const [inhalt, t, tp] = await Promise.all([ladeSeiteninhalt('projekte'), getTranslations('start'), getTranslations('projekte')]);
  const p = inhalt.projekt;
  if (p.status !== 'fertiggestellt') return null;
  const name = textMitSprache(p.name, sprache);
  return (
    <section aria-labelledby="moschee-titel" className="border-b border-linie bg-papier">
      <div className="mx-auto grid max-w-(--container-inhalt) items-center gap-8 px-4 py-abschnitt-klein md:px-8 lg:grid-cols-12 lg:gap-16">
        <Bildplatzhalter
          beschriftung={tp('3d.text', { name: name.text })}
          lang={name.lang}
          className="aspect-16/9 rounded-lg border border-linie lg:col-span-5 lg:aspect-16/10"
        />
        <div className="flex min-w-0 flex-col gap-5 lg:col-span-7">
          <div className="flex flex-col gap-3">
            <span className="inline-flex items-center gap-2 self-start text-16 font-bold text-gruen-800">
              <Stern8 className="size-4" />
              <Text feld={p.name} sprache={sprache} />
            </span>
            <h2 id="moschee-titel" className="text-display-2 text-balance">
              {t('moschee.titel')}
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 self-start rounded-pill border border-gruen-700 bg-gruen-50 px-3 py-0.5 text-16 font-bold text-gruen-800">
            <CircleCheck aria-hidden className="size-4 shrink-0" />
            {tp('status.fertiggestellt')}
            {p.fertigstellung === null ? null : <span className="font-normal"> · {p.fertigstellung}</span>}
          </span>
          <Text
            feld={p.beschreibung}
            sprache={sprache}
            als="p"
            className="max-w-text text-20 leading-einleitung text-pretty text-tinte-2"
          />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/projekte" className={SEKUNDAER}>
              <span>{t('moschee.projekt')}</span>
              <ArrowRight aria-hidden className="size-5" />
            </Link>
            <Link href="/ueber-uns" className={TEXTLINK}>
              <span>{t('moschee.geschichte')}</span>
              <ArrowRight aria-hidden className="size-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
