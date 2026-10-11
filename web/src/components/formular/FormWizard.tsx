import { ArrowLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import type { Fehlerstand } from '@/lib/formulare/wizard';
import { cn } from '@/lib/utils';
import { Honigtopf } from './Felder';
import { FehlerZusammenfassung } from './Rueckmeldung';
import { SendenKnopf } from './SendenKnopf';

const SPALTEN: Record<number, string> = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5' };

export type WizardGruppe = { titel: string; hinweis?: string; inhalt: ReactNode };
export type WizardSchritt = { titel: string; gruppen: WizardGruppe[] };

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
}) {
  const t = await getTranslations({ locale: sprache, namespace: 'formulare' });
  const letzter = schritte.length - 1;
  const schritt = Math.min(Math.max(aktuell, 0), letzter);
  const fehler = { ...(t.raw('fehler') as Record<string, string>), ...fehlerTexte };
  return (
    <div className="flex flex-col gap-6">
      <nav aria-label={t('wizard.fortschritt')} className="flex flex-col gap-3">
        {/* Schrittwechsel ohne Fehler: Fokus auf die Schrittzeile (data-fokus), damit Lesende den neuen Schritt hören */}
        <p data-fokus={ergebnis ? undefined : true} tabIndex={-1} className="font-bold text-gruen-800 outline-none">
          {t('wizard.schrittZeile', { nr: schritt + 1, anzahl: schritte.length, titel: schritte[schritt].titel })}
        </p>
        <ol className={cn('m-0 grid list-none gap-2 p-0', SPALTEN[schritte.length])}>
          {schritte.map((s, i) => (
            <li key={s.titel} aria-current={i === schritt ? 'step' : undefined} className="flex min-w-0 flex-col gap-1.5">
              <span aria-hidden className={cn('h-1.5 rounded-pill', i <= schritt ? 'bg-gruen-700' : 'bg-linie')} />
              <span
                className={cn(
                  'flex flex-col items-start gap-1.5 text-16 leading-tight font-bold [overflow-wrap:anywhere] sm:flex-row sm:items-center',
                  i === schritt ? 'text-gruen-800' : 'text-tinte-2',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-pill border-2 text-16',
                    i < schritt
                      ? 'border-gruen-700 bg-gruen-700 text-weiss'
                      : i === schritt
                        ? 'border-gruen-700 bg-gruen-50 text-gruen-800'
                        : 'border-rand bg-weiss text-gruen-800',
                  )}
                >
                  {i < schritt ? '✓' : i + 1}
                </span>
                <span>{s.titel}</span>
                {i < schritt ? <span className="sr-only">{t('wizard.erledigt')}</span> : null}
              </span>
            </li>
          ))}
        </ol>
      </nav>
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
        <div key={s.titel} hidden={i !== schritt} className="flex flex-col gap-6">
          {s.gruppen.map((g) => (
            <fieldset key={g.titel} className="m-0 flex min-w-0 flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-8">
              <legend className="-ml-2 px-2 font-display text-24 font-semibold">{g.titel}</legend>
              {g.hinweis ? <p className="text-16 text-tinte-2">{g.hinweis}</p> : null}
              <div className="grid gap-x-6 gap-y-4 sm:grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">{g.inhalt}</div>
            </fieldset>
          ))}
        </div>
      ))}
      <Honigtopf label={t('honigtopf')} />
      {schritt === letzter ? altcha : null}
      <div className="flex flex-wrap justify-between gap-3">
        {schritt > 0 ? (
          <button
            type="submit"
            name="richtung"
            value="zurueck"
            className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5 font-bold text-gruen-800 hover:bg-gruen-50"
          >
            <ArrowLeft aria-hidden className="size-5" />
            {t('wizard.zurueck')}
          </button>
        ) : (
          <span />
        )}
        {schritt < letzter ? (
          <SendenKnopf symbol="weiter" name="richtung" wert="weiter" texte={{ senden: t('wizard.weiter'), sendet: t('sendet') }} />
        ) : (
          <SendenKnopf name="richtung" wert="weiter" texte={{ senden: sendenText, sendet: t('sendet') }} />
        )}
      </div>
    </div>
  );
}
