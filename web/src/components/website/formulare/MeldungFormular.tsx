import { getTranslations } from 'next-intl/server';
import { AltchaFeld } from '@/components/formular/AltchaFeld';
import { FeldAuswahl, FeldBereich, FeldEinwilligung, FeldOptionen, FeldText, Honigtopf } from '@/components/formular/Felder';
import { ErfolgsAnsicht, FehlerZusammenfassung } from '@/components/formular/Rueckmeldung';
import { SendenKnopf } from '@/components/formular/SendenKnopf';
import { pfadFuer } from '@/i18n/navigation';
import type { FormularErgebnis } from '@/lib/formulare/ergebnis';

type Sprache = 'de' | 'tr' | 'en';
type Fehlerstand = Extract<FormularErgebnis, { status: 'fehler' }>;

/**
 * Meldung an die Verwaltung (C10b, E-034, E-037): Felder nach TicketDialog.dc.html, Betreff zusätzlich. Server-Komponente
 * ohne eigenes `<form>` – das umgibt `FormularInsel`. `sendeMeldung` rendert sie nach einem Fehler mit Werten,
 * Feldfehlern und neuem ALTCHA-Schlüssel (Lösungen sind einmalig). Die Seite rendert sie leer.
 * Abschnitte (Fieldset mit Legende) gliedern nur die Anzeige; Feldnamen und Reihenfolge bleiben wie bisher.
 */
export async function MeldungFormular({
  sprache,
  ergebnis,
  altchaSchluessel,
}: {
  sprache: Sprache;
  ergebnis?: Fehlerstand;
  altchaSchluessel?: string;
}) {
  const [t, tf] = await Promise.all([
    getTranslations({ locale: sprache, namespace: 'meldung' }),
    getTranslations({ locale: sprache, namespace: 'formulare' }),
  ]);
  // Fehlertexte: eigene Schlüssel der Meldung zuerst, sonst die allgemeinen Formulartexte
  const fehlerTexte = { ...(tf.raw('fehler') as Record<string, string>), ...(t.raw('fehler') as Record<string, string>) };
  const w = ergebnis?.werte ?? {};
  const wert = (k: string) => (typeof w[k] === 'string' ? (w[k] as string) : undefined);
  const f = (k: string) => {
    const s = ergebnis?.feldFehler?.[k];
    return s ? (fehlerTexte[s] ?? fehlerTexte.ungueltig) : undefined;
  };
  const datenschutz = { href: pfadFuer('/datenschutz', sprache), label: t('datenschutz') };
  const optional = <span className="font-normal text-tinte-2">{tf('optional')}</span>;
  const pflicht = tf('pflicht');
  return (
    <>
      {ergebnis ? (
        <FehlerZusammenfassung
          fehler={ergebnis.fehler}
          feldFehler={ergebnis.feldFehler}
          felder={{
            typ: t('typ'),
            organisation: t('organisation'),
            betreff: t('betreff'),
            beschreibung: t('beschreibung'),
            vorname: t('vorname'),
            nachname: t('nachname'),
            telefon: t('telefon'),
            email: t('email'),
            rueckmeldung: t('rueckmeldung'),
            rueckmeldeArt: t('rueckmeldeArt'),
            einwilligung: datenschutz.label,
          }}
          texte={{ fehler: fehlerTexte, zusammenfassung: tf('zusammenfassung') }}
        />
      ) : null}
      <input type="hidden" name="sprache" value={sprache} />
      <div className="flex flex-col gap-8">
        <fieldset className="m-0 flex min-w-0 flex-col gap-4 border-0 p-0">
          <legend className="mb-4 p-0 font-display text-24 font-semibold">{t('gruppe.person')}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <FeldText
              name="vorname"
              label={t('vorname')}
              pflicht={pflicht}
              platzhalter={t('vornamePlatzhalter')}
              wert={wert('vorname')}
              autoComplete="given-name"
              maxLaenge={100}
              fehler={f('vorname')}
            />
            <FeldText
              name="nachname"
              label={t('nachname')}
              pflicht={pflicht}
              platzhalter={t('nachnamePlatzhalter')}
              wert={wert('nachname')}
              autoComplete="family-name"
              maxLaenge={100}
              fehler={f('nachname')}
            />
            <FeldText
              name="telefon"
              typ="tel"
              label={
                <>
                  {t('telefon')} {optional}
                </>
              }
              platzhalter={t('telefonPlatzhalter')}
              wert={wert('telefon')}
              autoComplete="tel"
              maxLaenge={30}
              fehler={f('telefon')}
            />
            <FeldText
              name="email"
              typ="email"
              label={
                <>
                  {t('email')} {optional}
                </>
              }
              platzhalter={t('emailPlatzhalter')}
              wert={wert('email')}
              autoComplete="email"
              maxLaenge={254}
              fehler={f('email')}
            />
          </div>
        </fieldset>
        <hr aria-hidden="true" className="m-0 border-0 border-t border-linie" />
        <fieldset className="m-0 flex min-w-0 flex-col gap-4 border-0 p-0">
          <legend className="mb-4 p-0 font-display text-24 font-semibold">{t('gruppe.anliegen')}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <FeldAuswahl
              name="organisation"
              label={
                <>
                  {t('organisation')} {optional}
                </>
              }
              leer={t('organisationAllgemein')}
              optionen={[
                { wert: 'at', label: t('organisationen.at') },
                { wert: 'kt', label: t('organisationen.kt') },
                { wert: 'gt', label: t('organisationen.gt') },
                { wert: 'kgt', label: t('organisationen.kgt') },
              ]}
              wert={wert('organisation')}
              fehler={f('organisation')}
            />
            <FeldAuswahl
              name="typ"
              label={t('typ')}
              pflicht={pflicht}
              leer={t('typPlatzhalter')}
              optionen={[
                { wert: 'beschwerde', label: t('typen.beschwerde') },
                { wert: 'wunsch', label: t('typen.wunsch') },
                { wert: 'vorschlag', label: t('typen.vorschlag') },
                { wert: 'information', label: t('typen.information') },
              ]}
              wert={wert('typ')}
              fehler={f('typ')}
            />
            <FeldText
              name="betreff"
              label={t('betreff')}
              pflicht={pflicht}
              wert={wert('betreff')}
              maxLaenge={160}
              fehler={f('betreff')}
              className="sm:col-span-2"
            />
            <FeldBereich
              name="beschreibung"
              label={t('beschreibung')}
              pflicht={pflicht}
              wert={wert('beschreibung')}
              zeilen={4}
              platzhalter={t('beschreibungPlatzhalter')}
              maxLaenge={2000}
              fehler={f('beschreibung')}
              className="sm:col-span-2"
            />
          </div>
        </fieldset>
        <hr aria-hidden="true" className="m-0 border-0 border-t border-linie" />
        <fieldset className="m-0 flex min-w-0 flex-col gap-4 border-0 p-0">
          <legend className="mb-4 p-0 font-display text-24 font-semibold">{t('gruppe.rueckmeldung')}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FeldOptionen
                name="rueckmeldung"
                label={t('rueckmeldung')}
                pflicht={pflicht}
                typ="radio"
                optionen={[
                  { wert: 'ja', label: t('ja') },
                  { wert: 'nein', label: t('nein') },
                ]}
                wert={wert('rueckmeldung')}
                fehler={f('rueckmeldung')}
                kompakt
              />
            </div>
            <div className="sm:col-span-2">
              <FeldOptionen
                name="rueckmeldeArt"
                label={t('rueckmeldeArt')}
                hinweis={t('rueckmeldeArtHinweis')}
                typ="radio"
                optionen={[
                  { wert: 'telefon', label: t('arten.telefon') },
                  { wert: 'email', label: t('arten.email') },
                  { wert: 'persoenlich', label: t('arten.persoenlich') },
                ]}
                wert={wert('rueckmeldeArt')}
                fehler={f('rueckmeldeArt')}
                spaltenMin="sm:grid-cols-3"
              />
            </div>
          </div>
        </fieldset>
        <hr aria-hidden="true" className="m-0 border-0 border-t border-linie" />
        <fieldset className="m-0 flex min-w-0 flex-col gap-4 border-0 p-0">
          <legend className="mb-4 p-0 font-display text-24 font-semibold">{t('gruppe.einwilligung')}</legend>
          <FeldEinwilligung
            name="einwilligung"
            text={t('einwilligung')}
            link={datenschutz}
            wert={wert('einwilligung') === 'ja'}
            fehler={f('einwilligung')}
          />
        </fieldset>
      </div>
      {/* Die Prüfung gehört zum Absenden, nicht zur Einwilligung: optisch abgesetzt */}
      <hr aria-hidden="true" className="m-0 border-0 border-t border-linie" />
      <Honigtopf label={tf('honigtopf')} />
      <AltchaFeld key={altchaSchluessel} sprache={sprache} texte={{ label: tf('altcha.label'), hinweis: tf('altcha.hinweis') }} />
      <div className="self-stretch sm:self-start">
        <SendenKnopf className="w-full sm:w-auto" texte={{ senden: t('senden'), sendet: tf('sendet') }} />
      </div>
    </>
  );
}

/** Erfolgsansicht nach dem Absenden (E-028): der Hinweis auf die Bestätigung steht nur, wenn eine E-Mail angegeben wurde. */
export async function MeldungErfolg({ sprache, bestaetigung }: { sprache: Sprache; bestaetigung: boolean }) {
  const t = await getTranslations({ locale: sprache, namespace: 'meldung' });
  return (
    <ErfolgsAnsicht
      titel={t('erfolg.titel')}
      text={bestaetigung ? t('erfolg.mitBestaetigung') : t('erfolg.text')}
      verweise={[{ href: pfadFuer('/', sprache), label: t('erfolg.startseite') }]}
    />
  );
}
