'use client';

import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AKTIVITAET_SYMBOLE,
  DACHVERBAND_ZIELE,
  type AktivitaetSymbol,
  type DachverbandZiel,
  type OrganisationInhalt,
} from '@/lib/validierung/seiteninhalte/organisation';
import { Abschnitt, AuswahlFeld, Hinweise, MehrsprachigFeld, Reihe, Rueckmeldung, TextFeld, type Aktion } from './bausteine';
import { ausMehr, hatPlatzhalter, leerMehr, zuMehr, type MehrText } from './formwerte';
import { useListe } from './liste';

export type OrgZustand = {
  beschreibung: MehrText;
  mission: MehrText;
  vision: MehrText;
  kontakt: { adresse: string; telefon: string; email: string };
  /** Seite beim Dachverband; leer heißt „kein Verweis“ (null im Inhalt). */
  dachverband: DachverbandZiel | '';
};

export type AktivitaetZustand = { symbol: AktivitaetSymbol; titel: MehrText; text: MehrText };

/** Inhalt → Formwerte. Jedes Feld des Schemas muss hier und in `organisationInhalt` stehen, sonst geht es beim Speichern verloren. */
export function ausOrganisation(o: OrganisationInhalt): OrgZustand {
  return {
    beschreibung: ausMehr(o.beschreibung),
    mission: ausMehr(o.mission),
    vision: ausMehr(o.vision),
    kontakt: { adresse: o.kontakt.adresse, telefon: o.kontakt.telefon, email: o.kontakt.email },
    dachverband: o.dachverband ?? '',
  };
}

/** Formwerte → Schema-Form (JSON). Name und Untertitel sind festgelegt und stehen nicht im Inhalt. */
export function organisationInhalt(z: OrgZustand, aktivitaeten: AktivitaetZustand[], zeilen: MehrText[]) {
  return {
    beschreibung: zuMehr(z.beschreibung),
    mission: zuMehr(z.mission),
    vision: zuMehr(z.vision),
    aktivitaeten: aktivitaeten.map((a) => ({ symbol: a.symbol, titel: zuMehr(a.titel), text: zuMehr(a.text) })),
    oeffnungszeiten: zeilen.map((w) => zuMehr(w)),
    kontakt: { adresse: z.kontakt.adresse.trim(), telefon: z.kontakt.telefon.trim(), email: z.kontakt.email.trim() },
    dachverband: z.dachverband === '' ? null : z.dachverband,
  };
}

type Props = {
  aktion: Aktion;
  startwerte: OrganisationInhalt;
  name: string;
  beispiel: boolean;
  unlesbar: boolean;
};

/**
 * Inhalt einer Organisationsseite (Bereich `organisation-…`, Muster 4/6). Das Ziel steht in der Action (an die
 * Seite gebunden), die Oberfläche zeigt nur die Angaben dieser Organisation. Die Seite beim Dachverband ist eine
 * Auswahl aus dem IGMG-Netzwerk (E-044) – keine freie Adresse; Linktexte und Adressen pflegt das Netzwerk.
 */
export function OrganisationFormular({ aktion, startwerte, name, beispiel, unlesbar }: Props) {
  const t = useTranslations('verwaltung.seiteninhalteOrganisationen');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const [org, setOrg] = useState<OrgZustand>(() => ausOrganisation(startwerte));
  const aktivitaeten = useListe<AktivitaetZustand>(
    startwerte.aktivitaeten.map((a) => ({ symbol: a.symbol, titel: ausMehr(a.titel), text: ausMehr(a.text) })),
    () => ({ symbol: 'star', titel: leerMehr(), text: leerMehr() }),
    8,
  );
  const zeilen = useListe<MehrText>(
    startwerte.oeffnungszeiten.map((z) => ausMehr(z)),
    leerMehr,
    10,
  );

  const setze = <K extends keyof OrgZustand>(schluessel: K, wert: OrgZustand[K]) => setOrg((z) => ({ ...z, [schluessel]: wert }));
  const setzeKontakt = (feld: keyof OrgZustand['kontakt']) => (wert: string) =>
    setOrg((z) => ({ ...z, kontakt: { ...z.kontakt, [feld]: wert } }));

  const inhalt = organisationInhalt(
    org,
    aktivitaeten.eintraege.map((e) => e.wert),
    zeilen.eintraege.map((e) => e.wert),
  );
  const json = JSON.stringify(inhalt);
  const platzhalter = hatPlatzhalter(inhalt);
  const fehler = zustand.feldFehler;

  return (
    <div className="flex flex-col gap-6">
      <Hinweise beispiel={beispiel} unlesbar={unlesbar} platzhalter={platzhalter} />
      <form action={absenden} noValidate className="flex flex-col gap-6">
        <input type="hidden" name="inhalt" value={json} />
        <Rueckmeldung zustand={zustand} />
        <fieldset className="flex min-w-0 flex-col gap-6">
          <legend className="sr-only">{name}</legend>
          <Abschnitt
            titel={t('organisation.abschnitt.ueber')}
            kinder={
              <MehrsprachigFeld
                pfad="beschreibung"
                label={t('feld.beschreibung')}
                wert={org.beschreibung}
                onChange={(v) => setze('beschreibung', v)}
                feldFehler={fehler}
                zeilen={6}
                max={1200}
              />
            }
          />

          <Abschnitt
            titel={t('organisation.abschnitt.mission')}
            kinder={
              <>
                <MehrsprachigFeld
                  pfad="mission"
                  label={t('feld.mission')}
                  wert={org.mission}
                  onChange={(v) => setze('mission', v)}
                  feldFehler={fehler}
                  zeilen={4}
                  max={600}
                />
                <MehrsprachigFeld
                  pfad="vision"
                  label={t('feld.vision')}
                  wert={org.vision}
                  onChange={(v) => setze('vision', v)}
                  feldFehler={fehler}
                  zeilen={4}
                  max={600}
                />
              </>
            }
          />

          <Abschnitt
            titel={t('organisation.abschnitt.dachverband')}
            kinder={
              <AuswahlFeld
                pfad="dachverband"
                label={t('feld.dachverband')}
                hinweis={t('organisation.hinweis.dachverband')}
                wert={org.dachverband}
                onChange={(ziel) => setze('dachverband', ziel as DachverbandZiel | '')}
                optionen={[
                  { wert: '', label: t('dachverband.keiner') },
                  ...DACHVERBAND_ZIELE.map((z) => ({ wert: z, label: t(`dachverband.${z}`) })),
                ]}
                feldFehler={fehler}
                breit
              />
            }
          />

          <Reihe
            titel={t('organisation.abschnitt.aktivitaeten')}
            gruppe={t('gruppe.aktivitaeten')}
            liste={aktivitaeten}
            listenPfad="aktivitaeten"
            hinzufuegen={t('organisation.hinzufuegen.aktivitaet')}
            hinweis={t('organisation.hinweis.aktivitaeten')}
            renderEintrag={(e, pfad) => (
              <div className="grid gap-4 md:grid-cols-2">
                <AuswahlFeld
                  pfad={`${pfad}.symbol`}
                  label={t('feld.symbol')}
                  wert={e.wert.symbol}
                  onChange={(symbol) => aktivitaeten.aendere(e.k, (w) => ({ ...w, symbol: symbol as AktivitaetSymbol }))}
                  optionen={AKTIVITAET_SYMBOLE.map((s) => ({ wert: s, label: t(`symbol.${s}`) }))}
                  feldFehler={fehler}
                />
                <MehrsprachigFeld
                  pfad={`${pfad}.titel`}
                  label={t('feld.titel')}
                  wert={e.wert.titel}
                  onChange={(titel) => aktivitaeten.aendere(e.k, (w) => ({ ...w, titel }))}
                  feldFehler={fehler}
                  max={120}
                />
                <MehrsprachigFeld
                  pfad={`${pfad}.text`}
                  label={t('feld.text')}
                  wert={e.wert.text}
                  onChange={(text) => aktivitaeten.aendere(e.k, (w) => ({ ...w, text }))}
                  feldFehler={fehler}
                  zeilen={3}
                  max={400}
                />
              </div>
            )}
          />

          <Reihe
            titel={t('organisation.abschnitt.oeffnungszeiten')}
            gruppe={t('gruppe.oeffnungszeiten')}
            liste={zeilen}
            listenPfad="oeffnungszeiten"
            hinzufuegen={t('organisation.hinzufuegen.oeffnungszeit')}
            hinweis={t('organisation.hinweis.oeffnungszeiten')}
            renderEintrag={(e, pfad) => (
              <MehrsprachigFeld
                pfad={pfad}
                label={t('feld.text')}
                wert={e.wert}
                onChange={(w) => zeilen.aendere(e.k, () => w)}
                feldFehler={fehler}
                max={120}
              />
            )}
          />

          <Abschnitt
            titel={t('organisation.abschnitt.kontakt')}
            kinder={
              <>
                <div className="md:col-span-2">
                  <p className="text-16 text-tinte-2">{t('organisation.hinweis.kontakt')}</p>
                </div>
                <TextFeld
                  pfad="kontakt.adresse"
                  label={t('feld.adresse')}
                  wert={org.kontakt.adresse}
                  onChange={setzeKontakt('adresse')}
                  feldFehler={fehler}
                  zeilen={2}
                  max={300}
                  breit
                />
                <TextFeld
                  pfad="kontakt.telefon"
                  label={t('feld.telefon')}
                  wert={org.kontakt.telefon}
                  onChange={setzeKontakt('telefon')}
                  feldFehler={fehler}
                  typ="tel"
                  max={60}
                />
                <TextFeld
                  pfad="kontakt.email"
                  label={t('feld.email')}
                  wert={org.kontakt.email}
                  onChange={setzeKontakt('email')}
                  feldFehler={fehler}
                  typ="email"
                  max={200}
                />
              </>
            }
          />
        </fieldset>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={laeuft}>
            <Save aria-hidden />
            {laeuft ? t('speichert') : t('speichern')}
          </Button>
        </div>
      </form>
    </div>
  );
}
