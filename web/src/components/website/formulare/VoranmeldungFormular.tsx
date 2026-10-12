import { getTranslations } from 'next-intl/server';
import { AltchaFeld } from '@/components/formular/AltchaFeld';
import { FeldBereich, FeldHaken, FeldOptionen, FeldText } from '@/components/formular/Felder';
import { FormWizard } from '@/components/formular/FormWizard';
import { ErfolgsAnsicht } from '@/components/formular/Rueckmeldung';
import { pfadFuer } from '@/i18n/navigation';
import type { Fehlerstand } from '@/lib/formulare/wizard';
import { GESCHLECHTER, KLASSEN } from '@/lib/validierung/formulare/voranmeldung';

type Sprache = 'de' | 'tr' | 'en';

/**
 * Schüler-Voranmeldung (B05, Blatt S20, design/StudentRegistration.dc.html): vier Schritte im FormWizard (E-028).
 * Server-Komponente – die Seite rendert Schritt 1 leer, `sendeVoranmeldung` jeden weiteren Schritt mit den Werten.
 */
export async function VoranmeldungFormular({
  sprache,
  schritt = 0,
  werte = {},
  ergebnis,
  altchaSchluessel,
}: {
  sprache: Sprache;
  schritt?: number;
  werte?: Record<string, unknown>;
  ergebnis?: Fehlerstand;
  altchaSchluessel?: string;
}) {
  const [t, tf] = await Promise.all([
    getTranslations({ locale: sprache, namespace: 'voranmeldung' }),
    getTranslations({ locale: sprache, namespace: 'formulare' }),
  ]);
  const fehlerTexte = tf.raw('fehler') as Record<string, string>;
  const w = (k: string) => (typeof werte[k] === 'string' ? (werte[k] as string) : undefined);
  const f = (k: string) => {
    const s = ergebnis?.feldFehler?.[k];
    return s ? (fehlerTexte[s] ?? fehlerTexte.ungueltig) : undefined;
  };
  const p = tf('pflicht');
  const text = (
    name: string,
    label: string,
    o: { pflicht?: boolean; typ?: 'text' | 'email' | 'tel' | 'date'; auto?: string; max?: number; voll?: boolean } = {},
  ) => (
    <FeldText
      name={name}
      label={label}
      typ={o.typ}
      pflicht={o.pflicht === false ? undefined : p}
      wert={w(name)}
      autoComplete={o.auto ?? 'off'}
      maxLaenge={o.max}
      fehler={f(name)}
      className={o.voll ? 'col-span-full' : undefined}
    />
  );
  const eltern = (n: 1 | 2) => {
    const pf = n === 1;
    const opt = (label: string) =>
      pf ? (
        label
      ) : (
        <>
          {label} <span className="font-normal text-tinte-2">{tf('optional')}</span>
        </>
      );
    return (
      <>
        <FeldText
          name={`eltern${n}Name`}
          label={opt(t('feld.elternName'))}
          pflicht={pf ? p : undefined}
          wert={w(`eltern${n}Name`)}
          autoComplete={pf ? 'name' : 'off'}
          maxLaenge={100}
          fehler={f(`eltern${n}Name`)}
          className="col-span-full"
        />
        <FeldText
          name={`eltern${n}Telefon`}
          typ="tel"
          label={opt(t('feld.elternTelefon'))}
          pflicht={pf ? p : undefined}
          wert={w(`eltern${n}Telefon`)}
          autoComplete={pf ? 'tel' : 'off'}
          maxLaenge={30}
          fehler={f(`eltern${n}Telefon`)}
        />
        <FeldText
          name={`eltern${n}Email`}
          typ="email"
          label={opt(t('feld.elternEmail'))}
          pflicht={pf ? p : undefined}
          wert={w(`eltern${n}Email`)}
          autoComplete={pf ? 'email' : 'off'}
          maxLaenge={254}
          fehler={f(`eltern${n}Email`)}
        />
      </>
    );
  };
  return (
    <FormWizard
      sprache={sprache}
      anordnung="seitenleiste"
      aktuell={schritt}
      ergebnis={ergebnis}
      gewechselt={!ergebnis && Object.keys(werte).length > 0}
      sendenText={t('absenden')}
      felder={{
        klasse: t('feld.klasse'),
        geschlecht: t('feld.geschlecht'),
        vorname: t('feld.vorname'),
        nachname: t('feld.nachname'),
        geburtsdatum: t('feld.geburtsdatum'),
        strasse: t('feld.strasse'),
        plz: t('feld.plz'),
        ort: t('feld.ort'),
        eltern1Name: t('zusammenfassung.eltern1Name'),
        eltern1Telefon: t('zusammenfassung.eltern1Telefon'),
        eltern1Email: t('zusammenfassung.eltern1Email'),
        eltern2Name: t('zusammenfassung.eltern2Name'),
        eltern2Telefon: t('zusammenfassung.eltern2Telefon'),
        eltern2Email: t('zusammenfassung.eltern2Email'),
        geschwister: t('feld.geschwister'),
        ausgefuelltVon: t('feld.ausgefuelltVon'),
        einwilligungKontakt: t('einwilligung.kontakt'),
        einwilligungDatenschutz: t('einwilligung.datenschutz'),
      }}
      altcha={<AltchaFeld key={altchaSchluessel} sprache={sprache} texte={{ label: tf('altcha.label'), hinweis: tf('altcha.hinweis') }} />}
      schritte={[
        {
          titel: t('schritt.kind'),
          gruppen: [
            {
              titel: t('gruppe.klasse'),
              inhalt: (
                <div className="col-span-full">
                  <FeldOptionen
                    name="klasse"
                    typ="radio"
                    label={t('feld.klasse')}
                    pflicht={p}
                    wert={w('klasse')}
                    fehler={f('klasse')}
                    spaltenMin="grid-cols-1"
                    optionen={KLASSEN.map((k) => ({ wert: k, label: t(`klasse.${k}`), beschreibung: t(`klasse.${k}Text`) }))}
                  />
                </div>
              ),
            },
            {
              titel: t('gruppe.kind'),
              inhalt: (
                <>
                  <div className="col-span-full">
                    <FeldOptionen
                      name="geschlecht"
                      typ="radio"
                      label={t('feld.geschlecht')}
                      pflicht={p}
                      wert={w('geschlecht')}
                      fehler={f('geschlecht')}
                      spaltenMin="sm:grid-cols-2"
                      optionen={GESCHLECHTER.map((g) => ({ wert: g, label: t(`feld.${g}`) }))}
                    />
                  </div>
                  {text('vorname', t('feld.vorname'), { max: 100 })}
                  {text('nachname', t('feld.nachname'), { max: 100 })}
                  {text('geburtsdatum', t('feld.geburtsdatum'), { typ: 'date' })}
                </>
              ),
            },
          ],
        },
        {
          titel: t('schritt.adresse'),
          gruppen: [
            {
              titel: t('gruppe.adresse'),
              inhalt: (
                <>
                  {text('strasse', t('feld.strasse'), { auto: 'street-address', max: 120, voll: true })}
                  {text('plz', t('feld.plz'), { auto: 'postal-code', max: 5 })}
                  {text('ort', t('feld.ort'), { auto: 'address-level2', max: 80 })}
                </>
              ),
            },
          ],
        },
        {
          titel: t('schritt.eltern'),
          gruppen: [
            { titel: t('gruppe.eltern1'), inhalt: eltern(1) },
            { titel: t('gruppe.eltern2'), inhalt: eltern(2) },
          ],
        },
        {
          titel: t('schritt.einwilligungen'),
          gruppen: [
            {
              titel: t('gruppe.zusatz'),
              inhalt: (
                <>
                  <FeldBereich
                    name="geschwister"
                    label={
                      <>
                        {t('feld.geschwister')} <span className="font-normal text-tinte-2">{tf('optional')}</span>
                      </>
                    }
                    hinweis={t('feld.geschwisterHinweis')}
                    wert={w('geschwister')}
                    zeilen={3}
                    maxLaenge={500}
                    fehler={f('geschwister')}
                    className="col-span-full"
                  />
                  {text('ausgefuelltVon', t('feld.ausgefuelltVon'), { max: 100, voll: true })}
                </>
              ),
            },
            {
              titel: t('gruppe.einwilligungen'),
              hinweis: t('hinweisEinwilligungen'),
              inhalt: (
                <div className="col-span-full flex flex-col gap-3">
                  <FeldHaken
                    name="einwilligungKontakt"
                    label={t('einwilligung.kontakt')}
                    pflicht={p}
                    wert={w('einwilligungKontakt') === 'ja'}
                    fehler={f('einwilligungKontakt')}
                  />
                  <FeldHaken
                    name="einwilligungDatenschutz"
                    label={t('einwilligung.datenschutz')}
                    pflicht={p}
                    wert={w('einwilligungDatenschutz') === 'ja'}
                    fehler={f('einwilligungDatenschutz')}
                  />
                  <p className="text-16">
                    <a href={pfadFuer('/datenschutz', sprache)} className="font-bold underline underline-offset-2">
                      {t('einwilligung.datenschutzLink')}
                    </a>
                  </p>
                </div>
              ),
            },
          ],
        },
      ]}
    />
  );
}

export async function VoranmeldungErfolg({ sprache }: { sprache: Sprache }) {
  const t = await getTranslations({ locale: sprache, namespace: 'voranmeldung' });
  return (
    <ErfolgsAnsicht
      titel={t('erfolg.titel')}
      text={t('erfolg.text')}
      verweise={[
        { href: pfadFuer('/', sprache), label: t('erfolg.startseite') },
        { href: pfadFuer('/bildung/korankurse', sprache), label: t('erfolg.korankurse') },
      ]}
    />
  );
}
