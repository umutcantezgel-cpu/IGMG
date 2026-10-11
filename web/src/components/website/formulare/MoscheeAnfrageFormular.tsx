import { getTranslations } from 'next-intl/server';
import { AltchaFeld } from '@/components/formular/AltchaFeld';
import { FeldAuswahl, FeldBereich, FeldHaken, FeldOptionen, FeldText } from '@/components/formular/Felder';
import { FormWizard } from '@/components/formular/FormWizard';
import { ErfolgsAnsicht } from '@/components/formular/Rueckmeldung';
import { pfadFuer } from '@/i18n/navigation';
import type { Fehlerstand } from '@/lib/formulare/wizard';
import { ANFORDERUNGEN, BUDGETS, ZEITRAEUME } from '@/lib/validierung/formulare/moschee-anfrage';

type Sprache = 'de' | 'tr' | 'en';

/**
 * Webseite für Moscheen (B07, Blatt S22, design/MosqueRequest.dc.html und FormWizard.dc.html): drei Schritte im
 * FormWizard (E-028). Server-Komponente – die Seite rendert Schritt 1 leer, `sendeMoscheeAnfrage` jeden weiteren
 * Schritt mit den Werten. Texte: `moscheeAnfrage` (Bereichsdatei), allgemeine Formulartexte aus `formulare`.
 */
export async function MoscheeAnfrageFormular({
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
    getTranslations({ locale: sprache, namespace: 'moscheeAnfrage' }),
    getTranslations({ locale: sprache, namespace: 'formulare' }),
  ]);
  const fehlerTexte = tf.raw('fehler') as Record<string, string>;
  const w = (k: string) => (typeof werte[k] === 'string' ? (werte[k] as string) : undefined);
  const liste = (k: string) => (Array.isArray(werte[k]) ? (werte[k] as string[]) : undefined);
  const f = (k: string) => {
    const s = ergebnis?.feldFehler?.[k];
    return s ? (fehlerTexte[s] ?? fehlerTexte.ungueltig) : undefined;
  };
  const p = tf('pflicht');
  const text = (
    name: string,
    label: string,
    o: { pflicht?: boolean; typ?: 'text' | 'email' | 'tel'; auto?: string; max?: number; platz?: string; voll?: boolean } = {},
  ) => (
    <FeldText
      name={name}
      label={label}
      typ={o.typ}
      pflicht={o.pflicht ? p : undefined}
      wert={w(name)}
      autoComplete={o.auto ?? 'off'}
      maxLaenge={o.max}
      platzhalter={o.platz}
      fehler={f(name)}
      className={o.voll ? 'col-span-full' : undefined}
    />
  );
  return (
    <FormWizard
      sprache={sprache}
      aktuell={schritt}
      ergebnis={ergebnis}
      sendenText={t('absenden')}
      felder={{
        mosqueName: t('feld.mosqueName'),
        contactPerson: t('feld.contactPerson'),
        email: t('feld.email'),
        phone: t('feld.phone'),
        address: t('feld.address'),
        city: t('feld.city'),
        postalCode: t('feld.postalCode'),
        country: t('feld.country'),
        currentWebsite: t('feld.currentWebsite'),
        memberCount: t('feld.memberCount'),
        requirements: t('feld.requirements'),
        budget: t('feld.budget'),
        timeline: t('feld.timeline'),
        additionalInfo: t('feld.additionalInfo'),
        dataProtection: t('feld.einwilligung'),
      }}
      altcha={<AltchaFeld key={altchaSchluessel} sprache={sprache} texte={{ label: tf('altcha.label'), hinweis: tf('altcha.hinweis') }} />}
      schritte={[
        {
          titel: t('schritt.grund'),
          gruppen: [
            {
              titel: t('gruppe.grund'),
              inhalt: (
                <>
                  {text('mosqueName', t('feld.mosqueName'), { pflicht: true, max: 120, platz: t('platz.mosqueName') })}
                  {text('contactPerson', t('feld.contactPerson'), {
                    pflicht: true,
                    auto: 'name',
                    max: 100,
                    platz: t('platz.contactPerson'),
                  })}
                  {text('email', t('feld.email'), { pflicht: true, typ: 'email', auto: 'email', max: 254, platz: t('platz.email') })}
                  {text('phone', t('feld.phone'), { typ: 'tel', auto: 'tel', max: 30, platz: t('platz.phone') })}
                </>
              ),
            },
            {
              titel: t('gruppe.standort'),
              inhalt: (
                <>
                  {text('address', t('feld.address'), {
                    pflicht: true,
                    auto: 'street-address',
                    max: 120,
                    platz: t('platz.address'),
                    voll: true,
                  })}
                  {text('city', t('feld.city'), { pflicht: true, auto: 'address-level2', max: 80, platz: t('platz.city') })}
                  {text('postalCode', t('feld.postalCode'), {
                    pflicht: true,
                    auto: 'postal-code',
                    max: 5,
                    platz: t('platz.postalCode'),
                  })}
                  {text('country', t('feld.country'), { pflicht: true, auto: 'country-name', max: 80, platz: t('platz.country') })}
                </>
              ),
            },
          ],
        },
        {
          titel: t('schritt.details'),
          gruppen: [
            {
              titel: t('gruppe.details'),
              inhalt: (
                <>
                  {text('currentWebsite', t('feld.currentWebsite'), {
                    max: 500,
                    platz: t('platz.currentWebsite'),
                    voll: true,
                  })}
                  {text('memberCount', t('feld.memberCount'), { max: 7, platz: t('platz.memberCount') })}
                </>
              ),
            },
            {
              titel: t('gruppe.anforderungen'),
              inhalt: (
                <div className="col-span-full">
                  <FeldOptionen
                    name="requirements"
                    typ="checkbox"
                    label={t('feld.requirements')}
                    wert={liste('requirements')}
                    fehler={f('requirements')}
                    optionen={ANFORDERUNGEN.map((a) => ({ wert: a, label: t(`anforderung.${a}`) }))}
                  />
                </div>
              ),
            },
          ],
        },
        {
          titel: t('schritt.projekt'),
          gruppen: [
            {
              titel: t('gruppe.projekt'),
              inhalt: (
                <>
                  <FeldAuswahl
                    name="budget"
                    label={t('feld.budget')}
                    wert={w('budget')}
                    leer={t('platz.budget')}
                    optionen={BUDGETS.map((b) => ({ wert: b, label: t(`budget.${b}`) }))}
                    fehler={f('budget')}
                  />
                  <FeldAuswahl
                    name="timeline"
                    label={t('feld.timeline')}
                    wert={w('timeline')}
                    leer={t('platz.zeitrahmen')}
                    optionen={ZEITRAEUME.map((zr) => ({ wert: zr, label: t(`zeitrahmen.${zr}`) }))}
                    fehler={f('timeline')}
                  />
                  <FeldBereich
                    name="additionalInfo"
                    label={t('feld.additionalInfo')}
                    wert={w('additionalInfo')}
                    zeilen={4}
                    maxLaenge={2000}
                    fehler={f('additionalInfo')}
                    className="col-span-full"
                  />
                  <div className="col-span-full flex flex-col gap-3">
                    <FeldHaken
                      name="dataProtection"
                      label={t('feld.einwilligung')}
                      pflicht={p}
                      wert={w('dataProtection') === 'ja'}
                      fehler={f('dataProtection')}
                    />
                    <p className="text-16">
                      <a href={pfadFuer('/datenschutz', sprache)} className="font-bold underline underline-offset-2">
                        {t('einwilligung.datenschutzLink')}
                      </a>
                    </p>
                  </div>
                </>
              ),
            },
          ],
        },
      ]}
    />
  );
}

/** Erfolgsbox nach dem Absenden (FormWizard.dc.html:16–24): Titel, Text, Verweis zur Startseite. */
export async function MoscheeAnfrageErfolg({ sprache }: { sprache: Sprache }) {
  const t = await getTranslations({ locale: sprache, namespace: 'moscheeAnfrage' });
  return (
    <ErfolgsAnsicht
      titel={t('erfolg.titel')}
      text={t('erfolg.text')}
      verweise={[{ href: pfadFuer('/', sprache), label: t('nav.startseite') }]}
    />
  );
}
