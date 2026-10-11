import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { IgmgInhalt } from '@/lib/validierung/seiteninhalte/igmg';

/**
 * Reiter „Kontakt“ (design/IGMGInfo.dc.html Z. 97–107): IGMG Zentralverwaltung mit vier Feldern. Die E-Mail wird
 * nur als Link ausgegeben, wenn sie kein Platzhalter ist; die Website bleibt Text (wie im Bestand, Blatt S12).
 * Darstellung der Angaben wie auf der Kontaktseite (KontaktKarten): Symbol in Grün, Linkzeile mindestens 48 px hoch.
 */
export async function Kontakt({ inhalt }: { inhalt: IgmgInhalt }) {
  const t = await getTranslations('igmg');
  const k = inhalt.kontakt;
  const felder = [
    { Icon: MapPin, label: t('adresse'), wert: <span className="whitespace-pre-line">{k.adresse}</span> },
    { Icon: Phone, label: t('telefon'), wert: <span>{k.telefon}</span> },
    {
      Icon: Mail,
      label: t('email'),
      // Link nur für eine Adresse – Platzhalter und leerer Wert bleiben Text (kein „mailto:“ ohne Ziel, R-BC-S3)
      wert:
        !k.email.includes('@') || k.email.startsWith('[') ? (
          <span>{k.email}</span>
        ) : (
          <a
            href={`mailto:${k.email}`}
            aria-label={`${k.email}: ${t('email')}`}
            className="flex min-h-12 items-center wrap-anywhere text-gruen-700 underline underline-offset-3"
          >
            {k.email}
          </a>
        ),
    },
    { Icon: ExternalLink, label: t('website'), wert: <span>{k.website}</span> },
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
