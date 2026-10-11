import { getTranslations } from 'next-intl/server';
import { AltchaFeld } from '@/components/formular/AltchaFeld';
import { FeldAuswahl, FeldBereich, FeldHaken, FeldOptionen, FeldText } from '@/components/formular/Felder';
import { FormWizard } from '@/components/formular/FormWizard';
import { ErfolgsAnsicht } from '@/components/formular/Rueckmeldung';
import { pfadFuer } from '@/i18n/navigation';
import type { Fehlerstand } from '@/lib/formulare/wizard';
import { ALTERSGRUPPEN, GESCHLECHTER, INTERESSEN } from '@/lib/validierung/formulare/mitgliedsantrag';

type Sprache = 'de' | 'tr' | 'en';

/**
 * Mitgliedsantrag (B06, Blatt S21, design/JoinUs.dc.html und FormWizard.dc.html): drei Schritte im FormWizard (E-028).
 * Server-Komponente – die Seite rendert Schritt 1 leer, `sendeMitgliedsantrag` jeden weiteren Schritt mit den Werten.
 */
export async function MitgliedsantragFormular({
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
    getTranslations({ locale: sprache, namespace: 'mitglied' }),
    getTranslations({ locale: sprache, namespace: 'formulare' }),
  ]);
  const fehlerTexte = tf.raw('fehler') as Record<string, string>;
  const w = (k: string) => (typeof werte[k] === 'string' ? (werte[k] as string) : undefined);
  const liste = (k: string) => {
    const v = werte[k];
    return Array.isArray(v) ? (v as string[]) : typeof v === 'string' ? [v] : [];
  };
  const f = (k: string) => {
    const s = ergebnis?.feldFehler?.[k];
    return s ? (fehlerTexte[s] ?? fehlerTexte.ungueltig) : undefined;
  };
  const p = tf('pflicht');
  const opt = tf('optional');
  const optional = (label: string) => (
    <>
      {label} <span className="font-normal text-tinte-2">{opt}</span>
    </>
  );
  const text = (
    name: string,
    label: string,
    o: { pflicht?: boolean; typ?: 'text' | 'email' | 'tel'; auto?: string; max?: number; voll?: boolean } = {},
  ) => (
    <FeldText
      name={name}
      label={label}
      typ={o.typ}
      pflicht={o.pflicht ? p : undefined}
      wert={w(name)}
      autoComplete={o.auto ?? 'off'}
      maxLaenge={o.max}
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
        vorname: t('feld.vorname'),
        nachname: t('feld.nachname'),
        email: t('feld.email'),
        telefon: t('feld.telefon'),
        adresse: t('feld.adresse'),
        stadt: t('feld.stadt'),
        altersgruppe: t('feld.altersgruppe'),
        geschlecht: t('feld.geschlecht'),
        interessen: t('interessen.label'),
        erfahrung: t('erfahrung.label'),
        motivation: t('motivation.label'),
        datenschutz: t('einwilligung.datenschutz'),
      }}
      altcha={<AltchaFeld key={altchaSchluessel} sprache={sprache} texte={{ label: tf('altcha.label'), hinweis: tf('altcha.hinweis') }} />}
      schritte={[
        {
          titel: t('schritt.kontakt'),
          gruppen: [
            {
              titel: t('gruppe.kontakt'),
              hinweis: t('hinweisKontakt'),
              inhalt: (
                <>
                  {text('vorname', t('feld.vorname'), { pflicht: true, auto: 'given-name', max: 100 })}
                  {text('nachname', t('feld.nachname'), { pflicht: true, auto: 'family-name', max: 100 })}
                  {text('email', t('feld.email'), { pflicht: true, typ: 'email', auto: 'email', max: 254 })}
                  {text('telefon', t('feld.telefon'), { typ: 'tel', auto: 'tel', max: 30 })}
                  {text('adresse', t('feld.adresse'), { auto: 'street-address', max: 120, voll: true })}
                  {text('stadt', t('feld.stadt'), { auto: 'address-level2', max: 80 })}
                  <FeldAuswahl
                    name="altersgruppe"
                    label={t('feld.altersgruppe')}
                    leer={t('feld.waehlen')}
                    wert={w('altersgruppe')}
                    fehler={f('altersgruppe')}
                    optionen={ALTERSGRUPPEN.map((a) => ({ wert: a, label: t(`altersgruppe.${a}`) }))}
                  />
                  <FeldAuswahl
                    name="geschlecht"
                    label={t('feld.geschlecht')}
                    leer={t('feld.waehlen')}
                    wert={w('geschlecht')}
                    fehler={f('geschlecht')}
                    optionen={GESCHLECHTER.map((g) => ({ wert: g, label: t(`geschlechter.${g}`) }))}
                  />
                </>
              ),
            },
          ],
        },
        {
          titel: t('schritt.interessen'),
          gruppen: [
            {
              titel: t('gruppe.interessen'),
              inhalt: (
                <>
                  <div className="col-span-full">
                    <FeldOptionen
                      name="interessen"
                      typ="checkbox"
                      label={t('interessen.label')}
                      pflicht={p}
                      hinweis={t('interessen.hinweis')}
                      wert={liste('interessen')}
                      fehler={f('interessen')}
                      optionen={INTERESSEN.map((i) => ({ wert: i, label: t(`interessen.${i}`) }))}
                    />
                  </div>
                  <FeldBereich
                    name="erfahrung"
                    label={optional(t('erfahrung.label'))}
                    hinweis={t('erfahrung.hinweis')}
                    wert={w('erfahrung')}
                    zeilen={3}
                    maxLaenge={1000}
                    fehler={f('erfahrung')}
                    className="col-span-full"
                  />
                </>
              ),
            },
          ],
        },
        {
          titel: t('schritt.motivation'),
          gruppen: [
            {
              titel: t('gruppe.motivation'),
              inhalt: (
                <>
                  <FeldBereich
                    name="motivation"
                    label={t('motivation.label')}
                    pflicht={p}
                    hinweis={t('motivation.hinweis')}
                    wert={w('motivation')}
                    zeilen={3}
                    maxLaenge={1000}
                    fehler={f('motivation')}
                    className="col-span-full"
                  />
                  <div className="col-span-full flex flex-col gap-3">
                    <FeldHaken
                      name="newsletter"
                      label={t('newsletter.label')}
                      beschreibung={t('newsletter.beschreibung')}
                      wert={w('newsletter') === 'ja'}
                      fehler={f('newsletter')}
                    />
                    <FeldHaken
                      name="datenschutz"
                      label={t('einwilligung.datenschutz')}
                      beschreibung={t('einwilligung.datenschutzText')}
                      wert={w('datenschutz') === 'ja'}
                      fehler={f('datenschutz')}
                      pflicht={p}
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

export async function MitgliedsantragErfolg({ sprache }: { sprache: Sprache }) {
  const t = await getTranslations({ locale: sprache, namespace: 'mitglied' });
  return (
    <ErfolgsAnsicht
      titel={t('erfolg.titel')}
      text={t('erfolg.text')}
      verweise={[
        { href: pfadFuer('/', sprache), label: t('erfolg.startseite') },
        { href: pfadFuer('/veranstaltungen', sprache), label: t('erfolg.veranstaltungen') },
      ]}
    />
  );
}
