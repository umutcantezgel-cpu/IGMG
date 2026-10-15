import { Calendar, CircleCheck, Clock, Hammer, Ruler, Target, Users, type LucideIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { Bildplatzhalter } from '@/components/website/Bildplatzhalter';
import { Stern8 } from '@/components/website/Icons';
import { istNurPlatzhalter, MitPlatzhaltern } from '@/components/website/Platzhalter';
import { Text, textMitSprache } from '@/components/website/Text';
import { waehle, type Sprache } from '@/lib/i18n/inhalt';
import { cn } from '@/lib/utils';
import type { ProjektStatus, ProjekteInhalt } from '@/lib/validierung/seiteninhalte/projekte';
import { brauchtRueckfall, zahl } from './hilfen';

const STATUS_STIL: Record<ProjektStatus, { Icon: LucideIcon; klasse: string }> = {
  in_planung: { Icon: Clock, klasse: 'border-dashed border-rand bg-weiss text-tinte-2' },
  im_bau: { Icon: Hammer, klasse: 'border-info bg-info-toenung text-info' },
  fertiggestellt: { Icon: CircleCheck, klasse: 'border-gruen-700 bg-gruen-50 text-gruen-800' },
};

/**
 * Bauprojekt (Design Projects.dc.html D:22–37). Linke Spalte: 3D-Platzhalter mit Ortsetikett unten links und
 * Statuspille unten rechts. Rechte Spalte: Kennung „Bauprojekt“, darunter der Projektname als Abschnittstitel (h2),
 * dann Beschreibung, die vier Fakten (Beginn, Fertigstellung, Kapazität, Fläche) und die Einrichtungen als Chips.
 * Die 3D-Ansicht ist eine beschriftete Fläche, kein 3D-Viewer und keine Bibliothek (Briefing).
 * Sichtabnahme Runde 2: Die Statusplakette steht auch neben der Kennung (PR-4; die im Bild ist dann nur Bild). Bei
 * „fertiggestellt“ trägt der Seitenkopf den Namen, der Abschnittstitel heißt dann „Das Projekt“. Unter lg steht der
 * Text vor dem Bild. Platzhalter der Gemeinde „[…]“ sind als solche gekennzeichnet (PR-3, `data-platzhalter`).
 * Runde 3 (PF-6): Bei „fertiggestellt“ entfällt die Plakette im Bild – der Stand steht neben der Kennung und im Kopf.
 */
export async function Bauprojekt({ inhalt, sprache }: { inhalt: ProjekteInhalt; sprache: Sprache }) {
  const t = await getTranslations('projekte');
  const tAllg = await getTranslations('allgemein');
  const p = inhalt.projekt;
  const name = textMitSprache(p.name, sprache).text;
  const { Icon: StatusIcon, klasse } = STATUS_STIL[p.status];
  const rueckfall = brauchtRueckfall(sprache, [p.name, p.ort, p.beschreibung, p.kapazitaet.einheit, ...p.einrichtungen]);
  const fertig = p.status === 'fertiggestellt';
  const statusPlakette = (
    <>
      <StatusIcon aria-hidden className="size-4 shrink-0" />
      {t(`status.${p.status}`)}
    </>
  );
  const gemeinde = t('platzhalter.gemeinde');
  // Ist der Ort nur ein Platzhalter, ist das ganze Etikett der Platzhalter (kein Rahmen im Rahmen)
  const ortNurPlatzhalter = istNurPlatzhalter(waehle(p.ort, sprache).text);
  return (
    <section aria-labelledby="projekt-beschreibung" className="grid items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="relative min-h-70 min-w-0 md:min-h-115 lg:col-span-7">
        {/* Das ganze Bild ist ein Platzhalter der Gemeinde (Foto folgt) */}
        <div data-platzhalter className="absolute inset-0">
          {/* Unten Platz für die Etiketten (bis md zweizeilig, bei „fertiggestellt“ nur das Ortsetikett) */}
          <Bildplatzhalter
            beschriftung={t('3d.text', { name })}
            className={cn('size-full rounded-lg border border-linie md:pb-0', fertig ? 'pb-16' : 'pb-32')}
          />
        </div>
        <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-2">
          <span
            data-platzhalter={ortNurPlatzhalter || undefined}
            className={cn(
              'rounded-lg border bg-weiss px-3.5 py-2 text-16 leading-snug text-tinte-2',
              ortNurPlatzhalter ? 'border-dashed border-rand' : 'border-linie',
            )}
          >
            <Text feld={p.ort} sprache={sprache} platzhalter={!ortNurPlatzhalter} />
          </span>
          {fertig ? null : (
            <span aria-hidden className={cn('inline-flex items-center gap-1.5 rounded-pill border px-3 py-0.5 text-16 font-bold', klasse)}>
              {statusPlakette}
            </span>
          )}
        </div>
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-4 max-lg:order-first lg:col-span-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="inline-flex items-center gap-2 text-16 font-bold text-gruen-800">
              <Stern8 className="size-4" />
              {t('bezeichnungen.beschreibungKennung')}
            </span>
            <span className={cn('inline-flex items-center gap-1.5 rounded-pill border px-3 py-0.5 text-16 font-bold', klasse)}>
              {statusPlakette}
            </span>
          </div>
          <h2 id="projekt-beschreibung" className="text-display-2">
            {fertig ? t('bezeichnungen.dasProjekt') : <Text feld={p.name} sprache={sprache} />}
          </h2>
        </div>
        <Text feld={p.beschreibung} sprache={sprache} als="p" className="max-w-text text-18 leading-relaxed text-pretty" platzhalter />
        {rueckfall ? <p className="text-16 text-tinte-2">{tAllg('nurDeutsch')}</p> : null}
        <dl className="grid grid-cols-2 gap-3">
          <Fakt
            Icon={Calendar}
            label={t('bezeichnungen.beginn')}
            platzhalter={p.beginn === null}
            wert={p.beginn === null ? gemeinde : String(p.beginn)}
          />
          <Fakt
            Icon={Target}
            label={t('bezeichnungen.fertigstellung')}
            platzhalter={p.fertigstellung === null}
            wert={p.fertigstellung === null ? gemeinde : String(p.fertigstellung)}
          />
          <Fakt
            Icon={Users}
            label={t('bezeichnungen.kapazitaet')}
            platzhalter={p.kapazitaet.wert === null}
            wert={
              p.kapazitaet.wert === null ? (
                gemeinde
              ) : (
                <>
                  {zahl(p.kapazitaet.wert, sprache)} <Text feld={p.kapazitaet.einheit} sprache={sprache} platzhalter />
                </>
              )
            }
          />
          <Fakt
            Icon={Ruler}
            label={t('bezeichnungen.flaeche')}
            platzhalter={p.flaecheM2 === null}
            wert={p.flaecheM2 === null ? gemeinde : `${zahl(p.flaecheM2, sprache)} ${t('einheiten.m2')}`}
          />
        </dl>
        <div className="flex flex-col gap-2">
          <span className="text-16 font-bold text-tinte-2">{t('bezeichnungen.einrichtungen')}</span>
          {p.einrichtungen.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {p.einrichtungen.map((e, i) => (
                <li key={i} className="inline-flex items-center rounded-pill border border-linie bg-sand px-3 py-1 text-16 text-tinte-2">
                  <Text feld={e} sprache={sprache} platzhalter />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-16 text-tinte-2">
              <MitPlatzhaltern text={gemeinde} />
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Kennzahl mit Symbol (Beginn, Fertigstellung, Kapazität, Fläche): Symbol links, Bezeichnung und Wert rechts, 16 px
 * Innenabstand. Sichtabnahme Z-04, PR-1: Ein Platzhalter der Gemeinde steht in 16 px, normal und grau (er ist kein Wert);
 * ein echter Wert wächst mit der Kachel (18 bis 24 px, Container-Einheiten) und bricht notfalls überall um – so läuft auf
 * dem Telefon nichts über die Kachel hinaus. Runde 2 (PR-3): Die Kachel eines Platzhalters ist gestrichelt umrandet
 * (Umriss nach innen, die Maße bleiben) und der Wert trägt `data-platzhalter`.
 */
function Fakt({ Icon, label, wert, platzhalter }: { Icon: LucideIcon; label: string; wert: ReactNode; platzhalter: boolean }) {
  return (
    <div
      className={cn(
        '@container grid raster-symbol content-start items-start gap-x-3 gap-y-0.5 rounded-lg bg-sand p-4',
        platzhalter && 'outline-1 -outline-offset-1 outline-rand outline-dashed',
      )}
    >
      <Icon aria-hidden className="row-span-2 mt-0.5 size-6 shrink-0 text-gruen-700" />
      <dt className="text-16 leading-snug text-tinte-2">{label}</dt>
      <dd
        data-platzhalter={platzhalter || undefined}
        className={cn(
          'min-w-0 wrap-anywhere hyphens-none',
          platzhalter ? 'text-16 leading-snug font-normal text-tinte-2' : 'kennzahl-fliessend leading-tight font-bold',
        )}
      >
        {wert}
      </dd>
    </div>
  );
}
