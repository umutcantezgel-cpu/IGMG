import { ExternalLink, Landmark, Mail, MapPin, Phone } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { telefonHref } from '@/lib/telefon';
import { HTTPS_URL } from '@/lib/validierung/url';
import type { IgmgInhalt } from '@/lib/validierung/seiteninhalte/igmg';

const LINK = 'flex min-h-12 items-center wrap-anywhere text-gruen-700 underline underline-offset-3';

/** Sichtbarer Text einer Webadresse ohne Protokoll und Schrägstrich am Ende („www.igmg.org“). */
function anzeigeAdresse(adresse: string): string {
  const url = new URL(adresse);
  return `${url.host}${url.pathname.replace(/\/$/, '')}`;
}

/**
 * Reiter „Kontakt“ (design/IGMGInfo.dc.html Z. 97–107; Plan Marktstart P1): IGMG-Zentralverwaltung mit Adresse, Telefon,
 * E-Mail, Website und Vereinsregister (laut Impressum von igmg.org). Telefon, E-Mail und Website werden nur zu Links,
 * wenn sie keine Platzhalter sind; die Website nur als https-Adresse (sonst Text wie im Bestand, Blatt S12). Das Register
 * entfällt, solange es leer ist. Darstellung wie auf der Kontaktseite (KontaktKarten): Symbol in Grün, Linkzeile 48 px.
 */
export async function Kontakt({ inhalt }: { inhalt: IgmgInhalt }) {
  const [t, td] = await Promise.all([getTranslations('igmg'), getTranslations('dachverband')]);
  const k = inhalt.kontakt;
  const telefon = telefonHref(k.telefon);
  const website = HTTPS_URL.safeParse(k.website).success ? k.website : null;
  const felder = [
    { Icon: MapPin, label: t('adresse'), wert: <span className="whitespace-pre-line">{k.adresse}</span> },
    {
      Icon: Phone,
      label: t('telefon'),
      wert: telefon ? (
        <a href={telefon} className={LINK}>
          {k.telefon}
        </a>
      ) : (
        <span>{k.telefon}</span>
      ),
    },
    {
      Icon: Mail,
      label: t('email'),
      // Link nur für eine Adresse – Platzhalter und leerer Wert bleiben Text (kein „mailto:“ ohne Ziel, R-BC-S3)
      wert:
        !k.email.includes('@') || k.email.startsWith('[') ? (
          <span>{k.email}</span>
        ) : (
          <a href={`mailto:${k.email}`} aria-label={`${k.email}: ${t('email')}`} className={LINK}>
            {k.email}
          </a>
        ),
    },
    {
      Icon: ExternalLink,
      label: t('website'),
      wert: website ? (
        // Externe Seite: nur ein Link, keine Vorschau und keine Anfrage beim Aufruf (K-14)
        <a
          href={website}
          rel="noopener noreferrer"
          aria-label={`${anzeigeAdresse(website)}: ${t('website')}, ${td('externeSeite')}`}
          className={LINK}
        >
          {anzeigeAdresse(website)}
        </a>
      ) : (
        <span>{k.website}</span>
      ),
    },
    ...(k.register ? [{ Icon: Landmark, label: t('register'), wert: <span>{k.register}</span> }] : []),
  ];
  return (
    <section
      aria-labelledby="igmg-kontakt"
      className="flex max-w-seitenkopf flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-10"
    >
      <h2 id="igmg-kontakt" className="flex items-center gap-2.5 text-display-2">
        <Phone aria-hidden className="size-7 shrink-0 text-gruen-700" />
        {t('kontaktTitel')}
      </h2>
      <dl className="grid raster-kacheln gap-4">
        {felder.map(({ Icon, label, wert }) => (
          <div key={label} className="flex min-w-0 flex-col gap-1 rounded-md bg-sand p-4">
            <dt className="flex items-center gap-2.5 font-bold">
              <Icon aria-hidden className="size-5 shrink-0 text-gruen-700" />
              {label}
            </dt>
            <dd className="m-0 wrap-anywhere">{wert}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
