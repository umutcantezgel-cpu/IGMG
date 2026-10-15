import { ArrowLeft, Check } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Fragment, type CSSProperties, type ReactNode } from 'react';
import type { Fehlerstand } from '@/lib/formulare/wizard';
import { cn } from '@/lib/utils';
import { Honigtopf } from './Felder';
import { FehlerZusammenfassung } from './Rueckmeldung';
import { SendenKnopf } from './SendenKnopf';

/**
 * Schritt-Anzeiger (H-B07): unter 1024 px eine Reihe aus Schrittmarken mit Linien (sichtbar), die Schrittliste nur für Lesende;
 * ab 1024 px die Liste mit Achtstern-Marken – `seitenleiste`: eine Spalte links neben dem Formular, `oben`: eine Reihe
 * darüber (Standard).
 */
const SPALTEN_LG: Record<number, string> = { 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' };
/** Achtstern der Schrittmarke (K-008, wie `Achtstern` in Icons.tsx) */
const ACHTSTERN = 'M12 3.5 14.5 6H18v3.5l2.5 2.5-2.5 2.5V18h-3.5L12 20.5 9.5 18H6v-3.5L3.5 12 6 9.5V6h3.5z';
/** Blendet den neuen Schritt in der Überblendung `dauer-wechsel` ein (B-04). */
const BLENDET_EIN: CSSProperties = { '--dauer': 'var(--dauer-wechsel)' } as CSSProperties;

export type WizardGruppe = { titel: string; hinweis?: string; inhalt: ReactNode };
export type WizardSchritt = { titel: string; gruppen: WizardGruppe[] };

/**
 * Schrittmarke (K-008): Achtstern als Fläche mit Umriss; aktuell voll grün mit weißer Ziffer, erledigt hell mit grünem
 * Häkchen, kommend Weiß oder Sand (`sandig`: Sand in der Seitenleiste und in der Telefonreihe aller Assistenten; die
 * Liste „oben“ ab 1024 px bleibt weiß).
 */
function Schrittmarke({ nr, stand, sandig = false }: { nr: number; stand: 'erledigt' | 'aktuell' | 'kommend'; sandig?: boolean }) {
  return (
    <span aria-hidden className="relative grid size-9 shrink-0 place-items-center">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="absolute inset-0 size-full">
        <path
          d={ACHTSTERN}
          strokeWidth={2}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className={cn(
            stand === 'erledigt' && 'fill-gruen-50 stroke-gruen-700',
            stand === 'aktuell' && 'fill-gruen-700 stroke-gruen-700',
            stand === 'kommend' && (sandig ? 'fill-sand stroke-rand' : 'fill-weiss stroke-rand'),
          )}
        />
      </svg>
      {stand === 'erledigt' ? (
        <Check aria-hidden className="relative size-4 text-gruen-800" />
      ) : (
        <span className={cn('relative text-16 font-bold', stand === 'aktuell' ? 'text-weiss' : 'text-tinte-2')}>{nr}</span>
      )}
    </span>
  );
}

/**
 * FormWizard (B01, C12, FormWizard.dc.html, E-028): Server-Komponente ohne eigenes Client-JavaScript.
 * Alle Schritte stehen im Formular, nur der aktuelle ist sichtbar (`hidden`) – so bleiben Eingaben erhalten.
 * „Weiter“ und „Zurück“ senden das Formular (`richtung`), `wizardSchritt()` prüft auf dem Server den Schritt
 * und die Action rendert den nächsten. Funktioniert auch ohne JavaScript. ALTCHA nur im letzten Schritt.
 * Erster Absende-Knopf im Formular ist ein unsichtbares „Weiter“: Die Eingabetaste geht vor, nicht zurück.
 */
export async function FormWizard({
  sprache,
  schritte,
  aktuell,
  ergebnis,
  felder,
  fehlerTexte = {},
  sendenText,
  altcha,
  gewechselt = false,
  anordnung = 'oben',
}: {
  sprache: 'de' | 'tr' | 'en';
  schritte: WizardSchritt[];
  /** Index des sichtbaren Schritts (0 …) */
  aktuell: number;
  ergebnis?: Fehlerstand;
  /** Feldname → Beschriftung (Fehler-Zusammenfassung) */
  felder: Record<string, string>;
  /** formularspezifische Fehlertexte zusätzlich zu `formulare.fehler` */
  fehlerTexte?: Record<string, string>;
  /** Beschriftung des letzten Knopfs, z. B. „Voranmeldung absenden“ */
  sendenText: string;
  /** `<AltchaFeld key=… />` – wird nur im letzten Schritt gerendert */
  altcha: ReactNode;
  /** true nach einem Schrittwechsel ohne Fehler: der sichtbare Schritt blendet ein (B-04); beim ersten Laden nicht */
  gewechselt?: boolean;
  /** `seitenleiste`: Schrittliste links neben dem Formular ab 1024 px; `oben` (Standard): darüber */
  anordnung?: 'oben' | 'seitenleiste';
}) {
  const t = await getTranslations({ locale: sprache, namespace: 'formulare' });
  const letzter = schritte.length - 1;
  const schritt = Math.min(Math.max(aktuell, 0), letzter);
  const fehler = { ...(t.raw('fehler') as Record<string, string>), ...fehlerTexte };
  const seitenleiste = anordnung === 'seitenleiste';
  return (
    <div className={cn('flex flex-col gap-6', seitenleiste && 'lg:grid lg:grid-cols-3 lg:items-start lg:gap-8')}>
      <nav aria-label={t('wizard.fortschritt')} className={cn('flex flex-col gap-3', seitenleiste && 'lg:sticky lg:top-6')}>
        {/* Schrittwechsel ohne Fehler: Fokus auf die Schrittzeile (data-fokus), damit Lesende den neuen Schritt hören */}
        <p
          data-fokus={ergebnis ? undefined : true}
          tabIndex={-1}
          className={cn('font-bold text-gruen-800 outline-none', seitenleiste && 'lg:sr-only')}
        >
          {t('wizard.schrittZeile', { nr: schritt + 1, anzahl: schritte.length, titel: schritte[schritt].titel })}
        </p>
        {/* Unter 1024 px: Schrittmarken mit Linien dazwischen, Linie bis einschließlich dem aktuellen Schritt gefüllt; die Liste darunter lesen Lesende */}
        <div aria-hidden className="flex items-center lg:hidden">
          {schritte.map((s, i) => (
            <Fragment key={s.titel}>
              {i > 0 ? <span className={cn('-mx-1.25 h-0.5 flex-1 rounded-pill', i <= schritt ? 'bg-gruen-700' : 'bg-linie')} /> : null}
              <Schrittmarke nr={i + 1} stand={i < schritt ? 'erledigt' : i === schritt ? 'aktuell' : 'kommend'} sandig />
            </Fragment>
          ))}
        </div>
        <ol
          className={cn(
            'sr-only m-0 grid list-none gap-2 p-0 lg:not-sr-only',
            seitenleiste ? 'lg:grid-cols-1 lg:gap-3' : SPALTEN_LG[schritte.length],
          )}
        >
          {schritte.map((s, i) => (
            <li key={s.titel} aria-current={i === schritt ? 'step' : undefined} className="relative flex min-w-0 flex-col gap-1.5">
              {/* Fortschrittsbalken über dem Titel ab 1024 px (in der Seitenleiste entfällt er: die Marke zeigt den Stand) */}
              {seitenleiste ? null : (
                <span aria-hidden className={cn('hidden h-1.5 rounded-pill lg:block', i <= schritt ? 'bg-gruen-700' : 'bg-linie')} />
              )}
              <span
                className={cn(
                  'flex min-w-0 flex-row items-center gap-1.5 text-16 leading-tight font-bold',
                  !seitenleiste && 'lg:flex-col lg:items-start',
                  i === schritt ? 'text-gruen-800' : 'text-tinte-2',
                )}
              >
                <Schrittmarke nr={i + 1} stand={i < schritt ? 'erledigt' : i === schritt ? 'aktuell' : 'kommend'} sandig={seitenleiste} />
                <span className="min-w-0">{s.titel}</span>
                {i < schritt ? <span className="sr-only">{t('wizard.erledigt')}</span> : null}
              </span>
              {/* Seitenleiste ab 1024 px: Linie Spitze an Spitze zur nächsten Marke, grün bis zur aktuellen; statisch, ohne Bewegung */}
              {seitenleiste && i < letzter ? (
                <span
                  aria-hidden
                  className={cn(
                    'absolute top-7.75 -bottom-4.25 left-4.25 hidden w-0.5 rounded-pill lg:block',
                    i < schritt ? 'bg-gruen-700' : 'bg-linie',
                  )}
                />
              ) : null}
            </li>
          ))}
        </ol>
      </nav>
      <div className={cn('flex min-w-0 flex-col gap-6', seitenleiste && 'lg:col-span-2')}>
        {ergebnis ? (
          <FehlerZusammenfassung
            fehler={ergebnis.fehler}
            feldFehler={ergebnis.feldFehler}
            felder={felder}
            texte={{ fehler, zusammenfassung: t('zusammenfassung') }}
          />
        ) : null}
        <button type="submit" name="richtung" value="weiter" hidden tabIndex={-1} aria-hidden />
        <input type="hidden" name="schritt" value={schritt} />
        <input type="hidden" name="sprache" value={sprache} />
        {schritte.map((s, i) => (
          <div
            key={s.titel}
            hidden={i !== schritt}
            className={cn('flex flex-col gap-6', gewechselt && i === schritt && 'blendet-ein')}
            style={gewechselt && i === schritt ? BLENDET_EIN : undefined}
          >
            {s.gruppen.map((g) => (
              <fieldset key={g.titel} className="m-0 flex min-w-0 flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-8">
                <legend className="-ml-2 px-2 font-display text-24 font-semibold">{g.titel}</legend>
                {g.hinweis ? <p className="max-w-text text-16 text-tinte-2">{g.hinweis}</p> : null}
                <div className="grid gap-x-6 gap-y-4 sm:raster-kacheln">{g.inhalt}</div>
              </fieldset>
            ))}
          </div>
        ))}
        <Honigtopf label={t('honigtopf')} />
        {schritt === letzter ? altcha : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          {schritt > 0 ? (
            <button
              type="submit"
              name="richtung"
              value="zurueck"
              className="inline-flex min-h-12 w-full druck cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5.5 font-bold text-gruen-800 transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 sm:w-auto"
            >
              <ArrowLeft aria-hidden className="size-5" />
              {t('wizard.zurueck')}
            </button>
          ) : (
            <span className="hidden sm:block" />
          )}
          {schritt < letzter ? (
            <SendenKnopf
              className="w-full sm:w-auto"
              symbol="weiter"
              name="richtung"
              wert="weiter"
              texte={{ senden: t('wizard.weiter'), sendet: t('sendet') }}
            />
          ) : (
            <SendenKnopf className="w-full sm:w-auto" name="richtung" wert="weiter" texte={{ senden: sendenText, sendet: t('sendet') }} />
          )}
        </div>
      </div>
    </div>
  );
}
