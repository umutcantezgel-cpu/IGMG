import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { Meldung } from '@/components/verwaltung/Meldung';
import { KontaktFormular } from '@/components/verwaltung/seiteninhalte-organisationen/KontaktFormular';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { speichereKontakt } from '@/server/actions/seiteninhalte-organisationen';
import { ladeSeiteninhaltFuerVerwaltung } from '@/server/queries/verwaltung/seiteninhalte-organisationen';

/** Verwaltung › Seiteninhalte › Kontaktdaten (C05): Lesen mit seiteninhalt.lesen, Speichern mit seiteninhalt.bearbeiten. */
export default async function KontaktBearbeiten() {
  const a = await verlangeSeitenRecht('seiteninhalt.lesen');
  const nurLesen = !darf(a.rollen, 'seiteninhalt.bearbeiten');
  const [t, stand] = await Promise.all([
    getTranslations('verwaltung.seiteninhalteOrganisationen'),
    ladeSeiteninhaltFuerVerwaltung('kontakt'),
  ]);
  const tg = await getTranslations('verwaltung.shell');
  return (
    <>
      <NextLink
        href="/verwaltung/seiteninhalte"
        className="inline-flex min-h-11 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueckSeiteninhalte')}
      </NextLink>
      <VerwaltungsKopf titel={t('kontakt.titel')} kennung={tg('gruppe.inhalte')} einleitung={t('kontakt.einleitung')} />
      <Meldung art="info">{t('kontakt.wirkung')}</Meldung>
      <KontaktFormular
        aktion={speichereKontakt}
        startwerte={stand.inhalt}
        beispiel={stand.istBeispiel}
        unlesbar={!stand.lesbar}
        nurLesen={nurLesen}
      />
    </>
  );
}
