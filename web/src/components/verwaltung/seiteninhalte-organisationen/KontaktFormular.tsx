'use client';

import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { KontaktInhalt } from '@/lib/validierung/seiteninhalte';
import { Abschnitt, Hinweise, MehrsprachigFeld, Reihe, Rueckmeldung, TextFeld, type Aktion } from './bausteine';
import { hatPlatzhalter, leerMehr, optionalText, ausMehr, zahlZuJson, zuMehr, type MehrText } from './formwerte';
import { useListe } from './liste';

type KontaktZustand = {
  adresse: string;
  telefon: string;
  notfallTelefon: string;
  email: string;
  website: string;
  notfalltext: MehrText;
  anfahrtOeffentlich: MehrText;
  anfahrtAuto: MehrText;
  anfahrtFuss: MehrText;
  besuchstext: MehrText;
  social: { facebook: string; instagram: string; youtube: string };
  koordinaten: { breite: string; laenge: string };
};

type OeffnungZustand = { tage: MehrText; zeiten: string; von: number[]; start: string; ende: string };

/** Wochentage wie in der Fußzeile („Jetzt geöffnet“): 0 = Sonntag, 1 = Montag … 6 = Samstag. */
const WOCHENTAGE = [
  { tag: 1, schluessel: 'mo' },
  { tag: 2, schluessel: 'di' },
  { tag: 3, schluessel: 'mi' },
  { tag: 4, schluessel: 'do' },
  { tag: 5, schluessel: 'fr' },
  { tag: 6, schluessel: 'sa' },
  { tag: 0, schluessel: 'so' },
] as const;

function ausKontakt(k: KontaktInhalt): KontaktZustand {
  return {
    adresse: k.adresse,
    telefon: k.telefon,
    notfallTelefon: k.notfallTelefon,
    email: k.email,
    website: k.website,
    notfalltext: ausMehr(k.notfalltext),
    anfahrtOeffentlich: ausMehr(k.anfahrtOeffentlich),
    anfahrtAuto: ausMehr(k.anfahrtAuto),
    anfahrtFuss: ausMehr(k.anfahrtFuss),
    besuchstext: ausMehr(k.besuchstext),
    social: { facebook: k.social.facebook ?? '', instagram: k.social.instagram ?? '', youtube: k.social.youtube ?? '' },
    koordinaten: { breite: k.koordinaten ? String(k.koordinaten.breite) : '', laenge: k.koordinaten ? String(k.koordinaten.laenge) : '' },
  };
}

function ausOeffnung(o: KontaktInhalt['oeffnungszeiten'][number]): OeffnungZustand {
  return { tage: ausMehr(o.tage), zeiten: o.zeiten, von: o.von, start: o.start, ende: o.ende };
}

const neueOeffnung = (): OeffnungZustand => ({ tage: leerMehr(), zeiten: '', von: [], start: '', ende: '' });

/** Formwerte → Schema-Form (JSON): leere optionale Angaben fehlen, Koordinaten nur als Zahlen. */
function kontaktInhalt(z: KontaktZustand, oeffnungszeiten: OeffnungZustand[], angebote: MehrText[]) {
  const koord = z.koordinaten;
  return {
    adresse: z.adresse.trim(),
    telefon: z.telefon.trim(),
    notfallTelefon: z.notfallTelefon.trim(),
    email: z.email.trim(),
    website: z.website.trim(),
    oeffnungszeiten: oeffnungszeiten.map((o) => ({
      tage: zuMehr(o.tage),
      zeiten: o.zeiten.trim(),
      von: o.von,
      start: o.start,
      ende: o.ende,
    })),
    notfalltext: zuMehr(z.notfalltext),
    anfahrtOeffentlich: zuMehr(z.anfahrtOeffentlich),
    anfahrtAuto: zuMehr(z.anfahrtAuto),
    anfahrtFuss: zuMehr(z.anfahrtFuss),
    angebote: angebote.map((a) => zuMehr(a)),
    besuchstext: zuMehr(z.besuchstext),
    social: {
      facebook: optionalText(z.social.facebook),
      instagram: optionalText(z.social.instagram),
      youtube: optionalText(z.social.youtube),
    },
    koordinaten:
      koord.breite.trim() === '' && koord.laenge.trim() === ''
        ? undefined
        : { breite: zahlZuJson(koord.breite), laenge: zahlZuJson(koord.laenge) },
  };
}

type Props = {
  aktion: Aktion;
  startwerte: KontaktInhalt;
  beispiel: boolean;
  unlesbar: boolean;
  nurLesen: boolean;
};

/**
 * Kontaktdaten (Seiteninhalt „kontakt“, Muster 4/6): der ganze Inhalt liegt im Zustand dieser Komponente und
 * wird als JSON in das verborgene Feld „inhalt“ geschrieben. Die Action prüft mit dem Schema des Bereichs.
 */
export function KontaktFormular({ aktion, startwerte, beispiel, unlesbar, nurLesen }: Props) {
  const t = useTranslations('verwaltung.seiteninhalteOrganisationen');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const [kontakt, setKontakt] = useState<KontaktZustand>(() => ausKontakt(startwerte));
  const oeffnung = useListe<OeffnungZustand>(startwerte.oeffnungszeiten.map(ausOeffnung), neueOeffnung);
  const angebote = useListe<MehrText>(
    startwerte.angebote.map((a) => ausMehr(a)),
    leerMehr,
  );

  const setze = <K extends keyof KontaktZustand>(schluessel: K, wert: KontaktZustand[K]) =>
    setKontakt((z) => ({ ...z, [schluessel]: wert }));
  const setzeSocial = (netz: keyof KontaktZustand['social']) => (wert: string) =>
    setKontakt((z) => ({ ...z, social: { ...z.social, [netz]: wert } }));
  const setzeKoordinate = (feld: keyof KontaktZustand['koordinaten']) => (wert: string) =>
    setKontakt((z) => ({ ...z, koordinaten: { ...z.koordinaten, [feld]: wert } }));

  const inhalt = kontaktInhalt(
    kontakt,
    oeffnung.eintraege.map((e) => e.wert),
    angebote.eintraege.map((e) => e.wert),
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
        <fieldset disabled={nurLesen} className="flex min-w-0 flex-col gap-6">
          <Abschnitt
            titel={t('kontakt.abschnitt.adresse')}
            kinder={
              <>
                <TextFeld
                  pfad="adresse"
                  label={t('feld.adresse')}
                  hinweis={t('kontakt.hinweis.adresse')}
                  wert={kontakt.adresse}
                  onChange={(v) => setze('adresse', v)}
                  feldFehler={fehler}
                  zeilen={3}
                  max={300}
                  breit
                />
                <TextFeld
                  pfad="telefon"
                  label={t('feld.telefon')}
                  wert={kontakt.telefon}
                  onChange={(v) => setze('telefon', v)}
                  feldFehler={fehler}
                  typ="tel"
                  max={60}
                />
                <TextFeld
                  pfad="notfallTelefon"
                  label={t('feld.notfallTelefon')}
                  wert={kontakt.notfallTelefon}
                  onChange={(v) => setze('notfallTelefon', v)}
                  feldFehler={fehler}
                  typ="tel"
                  max={60}
                />
                <TextFeld
                  pfad="email"
                  label={t('feld.email')}
                  wert={kontakt.email}
                  onChange={(v) => setze('email', v)}
                  feldFehler={fehler}
                  typ="email"
                  max={200}
                />
                <TextFeld
                  pfad="website"
                  label={t('feld.website')}
                  hinweis={t('kontakt.hinweis.website')}
                  wert={kontakt.website}
                  onChange={(v) => setze('website', v)}
                  feldFehler={fehler}
                  max={200}
                />
              </>
            }
          />

          <Reihe
            titel={t('kontakt.abschnitt.zeiten')}
            gruppe={t('gruppe.oeffnungszeiten')}
            liste={oeffnung}
            listenPfad="oeffnungszeiten"
            hinzufuegen={t('kontakt.hinzufuegen.oeffnungszeit')}
            hinweis={t('kontakt.hinweis.ampel')}
            renderEintrag={(e, pfad) => (
              <div className="grid gap-4 md:grid-cols-2">
                <MehrsprachigFeld
                  pfad={`${pfad}.tage`}
                  label={t('feld.tage')}
                  hinweis={t('kontakt.hinweis.tage')}
                  wert={e.wert.tage}
                  onChange={(tage) => oeffnung.aendere(e.k, (w) => ({ ...w, tage }))}
                  feldFehler={fehler}
                  max={60}
                />
                <TextFeld
                  pfad={`${pfad}.zeiten`}
                  label={t('feld.zeiten')}
                  hinweis={t('kontakt.hinweis.zeiten')}
                  wert={e.wert.zeiten}
                  onChange={(zeiten) => oeffnung.aendere(e.k, (w) => ({ ...w, zeiten }))}
                  feldFehler={fehler}
                  max={60}
                />
                <fieldset className="flex min-w-0 flex-col gap-2 md:col-span-2">
                  <legend className="mb-1 font-bold">{t('kontakt.wochentage')}</legend>
                  <div className="flex flex-wrap gap-x-5 gap-y-1">
                    {WOCHENTAGE.map(({ tag, schluessel }) => (
                      <label key={tag} className="flex min-h-12 cursor-pointer items-center gap-2 font-bold">
                        <input
                          type="checkbox"
                          className="size-6 accent-gruen-700"
                          checked={e.wert.von.includes(tag)}
                          onChange={(ev) =>
                            oeffnung.aendere(e.k, (w) => ({
                              ...w,
                              von: ev.target.checked ? [...w.von, tag].sort((a, b) => a - b) : w.von.filter((x) => x !== tag),
                            }))
                          }
                        />
                        {t(`wochentage.${schluessel}`)}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <TextFeld
                  pfad={`${pfad}.start`}
                  label={t('feld.start')}
                  wert={e.wert.start}
                  onChange={(start) => oeffnung.aendere(e.k, (w) => ({ ...w, start }))}
                  feldFehler={fehler}
                  typ="time"
                />
                <TextFeld
                  pfad={`${pfad}.ende`}
                  label={t('feld.ende')}
                  wert={e.wert.ende}
                  onChange={(ende) => oeffnung.aendere(e.k, (w) => ({ ...w, ende }))}
                  feldFehler={fehler}
                  typ="time"
                />
              </div>
            )}
          />

          <Abschnitt
            titel={t('kontakt.abschnitt.notfall')}
            kinder={
              <MehrsprachigFeld
                pfad="notfalltext"
                label={t('feld.notfalltext')}
                wert={kontakt.notfalltext}
                onChange={(v) => setze('notfalltext', v)}
                feldFehler={fehler}
                zeilen={2}
                max={300}
              />
            }
          />

          <Abschnitt
            titel={t('kontakt.abschnitt.anfahrt')}
            kinder={
              <>
                <MehrsprachigFeld
                  pfad="anfahrtOeffentlich"
                  label={t('feld.anfahrtOeffentlich')}
                  wert={kontakt.anfahrtOeffentlich}
                  onChange={(v) => setze('anfahrtOeffentlich', v)}
                  feldFehler={fehler}
                  zeilen={2}
                  max={300}
                />
                <MehrsprachigFeld
                  pfad="anfahrtAuto"
                  label={t('feld.anfahrtAuto')}
                  wert={kontakt.anfahrtAuto}
                  onChange={(v) => setze('anfahrtAuto', v)}
                  feldFehler={fehler}
                  zeilen={2}
                  max={300}
                />
                <MehrsprachigFeld
                  pfad="anfahrtFuss"
                  label={t('feld.anfahrtFuss')}
                  wert={kontakt.anfahrtFuss}
                  onChange={(v) => setze('anfahrtFuss', v)}
                  feldFehler={fehler}
                  zeilen={2}
                  max={300}
                />
              </>
            }
          />

          <Abschnitt
            titel={t('kontakt.abschnitt.besuch')}
            kinder={
              <>
                <MehrsprachigFeld
                  pfad="besuchstext"
                  label={t('feld.besuchstext')}
                  wert={kontakt.besuchstext}
                  onChange={(v) => setze('besuchstext', v)}
                  feldFehler={fehler}
                  zeilen={3}
                  max={500}
                />
              </>
            }
          />

          <Reihe
            titel={t('feld.angebote')}
            gruppe={t('gruppe.angebote')}
            liste={angebote}
            listenPfad="angebote"
            hinzufuegen={t('kontakt.hinzufuegen.angebot')}
            renderEintrag={(e, pfad) => (
              <MehrsprachigFeld
                pfad={pfad}
                label={t('feld.text')}
                wert={e.wert}
                onChange={(w) => angebote.aendere(e.k, () => w)}
                feldFehler={fehler}
                max={200}
              />
            )}
          />

          <Abschnitt
            titel={t('kontakt.abschnitt.social')}
            kinder={
              <>
                <TextFeld
                  pfad="social.facebook"
                  label={t('feld.facebook')}
                  hinweis={t('kontakt.hinweis.social')}
                  wert={kontakt.social.facebook}
                  onChange={setzeSocial('facebook')}
                  feldFehler={fehler}
                  typ="url"
                  max={200}
                />
                <TextFeld
                  pfad="social.instagram"
                  label={t('feld.instagram')}
                  wert={kontakt.social.instagram}
                  onChange={setzeSocial('instagram')}
                  feldFehler={fehler}
                  typ="url"
                  max={200}
                />
                <TextFeld
                  pfad="social.youtube"
                  label={t('feld.youtube')}
                  wert={kontakt.social.youtube}
                  onChange={setzeSocial('youtube')}
                  feldFehler={fehler}
                  typ="url"
                  max={200}
                />
              </>
            }
          />

          <Abschnitt
            titel={t('kontakt.abschnitt.koordinaten')}
            kinder={
              <>
                <div className="md:col-span-2">
                  <p className="text-16 text-tinte-2">{t('kontakt.hinweis.koordinaten')}</p>
                </div>
                <TextFeld
                  pfad="koordinaten.breite"
                  label={t('feld.breite')}
                  wert={kontakt.koordinaten.breite}
                  onChange={setzeKoordinate('breite')}
                  feldFehler={fehler}
                  inputMode="decimal"
                />
                <TextFeld
                  pfad="koordinaten.laenge"
                  label={t('feld.laenge')}
                  wert={kontakt.koordinaten.laenge}
                  onChange={setzeKoordinate('laenge')}
                  feldFehler={fehler}
                  inputMode="decimal"
                />
              </>
            }
          />
        </fieldset>

        {!nurLesen ? (
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={laeuft}>
              <Save aria-hidden />
              {laeuft ? t('speichert') : t('speichern')}
            </Button>
          </div>
        ) : null}
      </form>
    </div>
  );
}
