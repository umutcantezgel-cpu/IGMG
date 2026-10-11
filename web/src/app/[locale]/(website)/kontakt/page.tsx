import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Anfahrt } from '@/components/website/kontakt/Anfahrt';
import { AngeboteBesuch } from '@/components/website/kontakt/AngeboteBesuch';
import { KontaktKarten } from '@/components/website/kontakt/KontaktKarten';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeSeiteninhalt } from '@/server/queries/seiteninhalte';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('kontakt');
  return metadatenFuer({ pfad: '/kontakt', titel: t('titel'), beschreibung: t('untertitel') });
}

/** Kontakt & Anfahrt (design/Contact.dc.html, Blatt S11): Kontaktdaten, Öffnungszeiten, Anfahrt, Karte erst nach Klick. */
export default async function KontaktSeite() {
  const [t, tp, kontakt] = await Promise.all([getTranslations('kontakt'), getTranslations('kopf'), ladeSeiteninhalt('kontakt')]);
  return (
    <Seitenrahmen bereich="moschee" seite="kontakt" sprachZiel="/kontakt" pfad={[{ label: tp('kontakt') }]}>
      <PageHeader kennung={tp('moschee')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-8 px-4 pt-8 pb-12 md:px-8 md:pt-12 md:pb-24">
        <KontaktKarten kontakt={kontakt} />
        <Anfahrt kontakt={kontakt} />
        <AngeboteBesuch kontakt={kontakt} />
        {/* B03 (Welle B): Kontaktformular hier einfügen. Bis dahin gibt es weder Formular noch toten Knopf. */}
      </div>
    </Seitenrahmen>
  );
}
