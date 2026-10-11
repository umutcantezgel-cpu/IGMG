import { getTranslations } from 'next-intl/server';
import { AnmeldeRahmen } from '@/components/verwaltung/anmeldung/AnmeldeRahmen';
import { EinladungsFormular } from '@/components/verwaltung/anmeldung/EinladungsFormular';
import { Meldung } from '@/components/verwaltung/Meldung';
import { ladeGueltigeEinladung } from '@/server/queries/einladung';

export default async function EinladungSeite({ params }: PageProps<'/[locale]/verwaltung/einladung/[token]'>) {
  const { token } = await params;
  const t = await getTranslations('verwaltung.einladung');
  const einladung = await ladeGueltigeEinladung(token);
  return (
    <AnmeldeRahmen titel={t('titel')} untertitel={einladung ? t('einleitung') : undefined}>
      {einladung ? (
        <EinladungsFormular token={token} name={einladung.name} email={einladung.email} />
      ) : (
        <Meldung art="fehler">{t('ungueltig')}</Meldung>
      )}
    </AnmeldeRahmen>
  );
}
