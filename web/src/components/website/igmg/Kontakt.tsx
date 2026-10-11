import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { IgmgInhalt } from '@/lib/validierung/seiteninhalte/igmg';

/**
 * Reiter „Kontakt“ (design/IGMGInfo.dc.html Z. 97–107): IGMG Zentralverwaltung mit vier Feldern. Die E-Mail wird
 * nur als Link ausgegeben, wenn sie kein Platzhalter ist; die Website bleibt Text (wie im Bestand, Blatt S12).
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
      wert: k.email.startsWith('[') ? (
        <span>{k.email}</span>
      ) : (
        <a
          href={`mailto:${k.email}`}
          aria-label={`${k.email}: ${t('email')}`}
          className="[overflow-wrap:anywhere] underline underline-offset-[3px]"
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
      className="flex max-w-[880px] flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-10"
    >
      <h2 id="igmg-kontakt" className="flex items-center gap-2.5 text-30">
        <Phone aria-hidden className="size-7 shrink-0 text-gruen-700" />
        {t('kontaktTitel')}
      </h2>
      <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4">
        {felder.map(({ Icon, label, wert }) => (
          <div key={label} className="flex flex-col gap-1 rounded-md bg-sand p-4">
            <dt className="flex items-center gap-2 font-bold">
              <Icon aria-hidden className="size-5 shrink-0" />
              {label}
            </dt>
            <dd className="m-0 [overflow-wrap:anywhere]">{wert}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
