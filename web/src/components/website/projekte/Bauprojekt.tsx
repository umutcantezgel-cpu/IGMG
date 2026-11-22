import { Calendar, CircleCheck, Clock, Hammer, Ruler, Target, Users, type LucideIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { Bildplatzhalter } from '@/components/website/Bildplatzhalter';
import { Stern8 } from '@/components/website/Icons';
import { textMitSprache } from '@/components/website/Text';
import type { Sprache } from '@/lib/i18n/inhalt';
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
 * Text vor dem Bild.
 * Runde 3 (PF-6): Bei „fertiggestellt“ entfällt die Plakette im Bild – der Stand steht neben der Kennung und im Kopf.
 * Platzhalter der Gemeinde „[…]“ erscheinen nicht (`src/lib/inhalt/platzhalter.ts`): Ortsetikett, Kennzahlen und
 * Einrichtungen gibt es nur mit Wert, in der Beschreibung entfallen Sätze mit Platzhalter; nichts wird ersetzt.
 */
export async function Bauprojekt({ inhalt, sprache }: { inhalt: ProjekteInhalt; sprache: Sprache }) {
  const t = await getTranslations('projekte');
  const tAllg = await getTranslations('allgemein');
  const p = inhalt.projekt;
  const name = textMitSprache(p.name, sprache, { platzhalter: true });
  const ort = textMitSprache(p.ort, sprache, { platzhalter: true });
  const beschreibung = textMitSprache(p.beschreibung, sprache, { platzhalter: true });
  const einheit = textMitSprache(p.kapazitaet.einheit, sprache, { platzhalter: true });
  const einrichtungen = p.einrichtungen.map((e) => textMitSprache(e, sprache, { platzhalter: true })).filter((e) => e.text);
  const { Icon: StatusIcon, klasse } = STATUS_STIL[p.status];
  const rueckfall = brauchtRueckfall(sprache, [p.name, p.ort, p.beschreibung, p.kapazitaet.einheit, ...p.einrichtungen]);
  const fertig = p.status === 'fertiggestellt';
  const statusPlakette = (
    <>
      <StatusIcon aria-hidden className="size-4 shrink-0" />
      {t(`status.${p.status}`)}
    </>
  );
  // Kennzahlen nur mit Wert: Was die Gemeinde noch nicht genannt hat, bekommt keine Kachel
  const fakten: { Icon: LucideIcon; label: string; wert: ReactNode }[] = [];
  if (p.beginn !== null) fakten.push({ Icon: Calendar, label: t('bezeichnungen.beginn'), wert: String(p.beginn) });
  if (p.fertigstellung !== null) fakten.push({ Icon: Target, label: t('bezeichnungen.fertigstellung'), wert: String(p.fertigstellung) });
  if (p.kapazitaet.wert !== null) {
    fakten.push({
      Icon: Users,
      label: t('bezeichnungen.kapazitaet'),
      wert: (
        <>
          {zahl(p.kapazitaet.wert, sprache)} {einheit.text ? <span lang={einheit.lang}>{einheit.text}</span> : null}
        </>
      ),
    });
  }
  if (p.flaecheM2 !== null) {
    fakten.push({ Icon: Ruler, label: t('bezeichnungen.flaeche'), wert: `${zahl(p.flaecheM2, sprache)} ${t('einheiten.m2')}` });
  }
  return (
    <section aria-labelledby="projekt-beschreibung" className="grid items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="relative min-h-70 min-w-0 md:min-h-115 lg:col-span-7">
        {/* Bildfläche, bis die Gemeinde ein Foto hinterlegt; unten Platz für die Etiketten (bis md zweizeilig) */}
        <Bildplatzhalter
          beschriftung={name.text ? t('3d.text', { name: name.text }) : t('kopf.eyebrow')}
          className={cn('absolute inset-0 rounded-lg border border-linie md:pb-0', fertig ? 'pb-16' : 'pb-32')}
        />
        {ort.text || !fertig ? (
          <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-2">
            {ort.text ? (
              <span lang={ort.lang} className="rounded-lg border border-linie bg-weiss px-3.5 py-2 text-16 leading-snug text-tinte-2">
                {ort.text}
              </span>
            ) : null}
            {fertig ? null : (
              <span
                aria-hidden
                className={cn('ml-auto inline-flex items-center gap-1.5 rounded-pill border px-3 py-0.5 text-16 font-bold', klasse)}
              >
                {statusPlakette}
              </span>
            )}
          </div>
        ) : null}
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
          {/* Ohne Namen (noch Platzhalter) heißt der Abschnitt wie bei „fertiggestellt“: „Das Projekt“ */}
          <h2 id="projekt-beschreibung" className="text-display-2">
            {fertig || !name.text ? t('bezeichnungen.dasProjekt') : <span lang={name.lang}>{name.text}</span>}
          </h2>
        </div>
        {beschreibung.text ? (
          <p lang={beschreibung.lang} className="max-w-text text-18 leading-relaxed text-pretty">
            {beschreibung.text}
          </p>
        ) : null}
        {rueckfall ? <p className="text-16 text-tinte-2">{tAllg('nurDeutsch')}</p> : null}
        {fakten.length > 0 ? (
          <dl className="grid grid-cols-2 gap-3">
            {fakten.map((f) => (
              <Fakt key={f.label} Icon={f.Icon} label={f.label} wert={f.wert} />
            ))}
          </dl>
        ) : null}
        {einrichtungen.length > 0 ? (
          <div className="flex flex-col gap-2">
            <span className="text-16 font-bold text-tinte-2">{t('bezeichnungen.einrichtungen')}</span>
            <ul className="flex flex-wrap gap-2">
              {einrichtungen.map((e, i) => (
                <li
                  key={i}
                  lang={e.lang}
                  className="inline-flex items-center rounded-pill border border-linie bg-sand px-3 py-1 text-16 text-tinte-2"
                >
                  {e.text}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Kennzahl mit Symbol (Beginn, Fertigstellung, Kapazität, Fläche): Symbol links, Bezeichnung und Wert rechts, 16 px
 * Innenabstand. Sichtabnahme Z-04, PR-1: Der Wert wächst mit der Kachel (18 bis 24 px, Container-Einheiten) und bricht
 * notfalls überall um – so läuft auf dem Telefon nichts über die Kachel hinaus. Kacheln gibt es nur für genannte Werte.
 */
function Fakt({ Icon, label, wert }: { Icon: LucideIcon; label: string; wert: ReactNode }) {
  return (
    <div className="@container grid raster-symbol content-start items-start gap-x-3 gap-y-0.5 rounded-lg bg-sand p-4">
      <Icon aria-hidden className="row-span-2 mt-0.5 size-6 shrink-0 text-gruen-700" />
      <dt className="text-16 leading-snug text-tinte-2">{label}</dt>
      <dd className="min-w-0 kennzahl-fliessend leading-tight font-bold wrap-anywhere hyphens-none">{wert}</dd>
    </div>
  );
}
