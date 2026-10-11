import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { AnmeldeFormular } from '@/components/verwaltung/anmeldung/AnmeldeFormular';
import { AnmeldeRahmen } from '@/components/verwaltung/anmeldung/AnmeldeRahmen';
import { Meldung } from '@/components/verwaltung/Meldung';
import { ladeAngemeldet } from '@/lib/rechte/pruefe';

export default async function AnmeldenSeite({ searchParams }: PageProps<'/[locale]/verwaltung/anmelden'>) {
  const a = await ladeAngemeldet();
  if (a?.zweiFaktorErfuellt && a.rollen.length > 0) redirect('/verwaltung');
  const t = await getTranslations('verwaltung.anmelden');
  const s = await searchParams;
  return (
    <AnmeldeRahmen titel={t('titel')} untertitel={t('untertitel')}>
      <div className="flex flex-col gap-5">
        {s.eingeladen ? <Meldung art="erfolg">{t('eingeladen')}</Meldung> : null}
        {s.abgemeldet ? <Meldung art="info">{t('abgemeldet')}</Meldung> : null}
        {s['keine-rolle'] ? <Meldung art="fehler">{t('keineRolle')}</Meldung> : null}
        <AnmeldeFormular />
      </div>
    </AnmeldeRahmen>
  );
}
