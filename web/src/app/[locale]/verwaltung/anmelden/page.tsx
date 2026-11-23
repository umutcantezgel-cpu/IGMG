import { sql } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { AnmeldeFormular } from '@/components/verwaltung/anmeldung/AnmeldeFormular';
import { AnmeldeRahmen } from '@/components/verwaltung/anmeldung/AnmeldeRahmen';
import { Meldung } from '@/components/verwaltung/Meldung';
import { TestZugang } from '@/components/vorfuehrung/TestZugang';
import { db } from '@/lib/db';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';
import { vorfuehrung } from '@/lib/vorfuehrung/modus';
import { gewaehlterTestzugang } from '@/lib/vorfuehrung/sitzung';
import { ladeAngemeldet } from '@/lib/rechte/pruefe';

export default async function AnmeldenSeite({ searchParams }: PageProps<'/[locale]/verwaltung/anmelden'>) {
  // Beispielmodus ohne Datenbank: das Layout zeigt den Hinweis; das Formular gar nicht erst rendern (auch nicht im Datenstrom)
  if (!datenbankVerfuegbar()) return null;
  const s = await searchParams;
  // Vorführung mit Testzugang (ADR 0052): ein Login-Fenster für alle Benutzernamen – auch wer schon angemeldet ist, bleibt
  // hier (sonst ließe sich der Benutzer nicht wechseln). Die Datenbank wärmt nach der Antwort vor: Der erste Zugriff einer
  // frischen Instanz entpackt den Schnappschuss, das soll nicht erst nach dem Absenden geschehen.
  if (vorfuehrung()) {
    after(() =>
      db.execute(sql`select 1`).then(
        () => undefined,
        () => undefined,
      ),
    );
    return <TestZugang fehler={Boolean(s.fehler)} abgemeldet={Boolean(s.abgemeldet)} angemeldet={await gewaehlterTestzugang()} />;
  }
  const a = await ladeAngemeldet();
  if (a?.zweiFaktorErfuellt && a.rollen.length > 0) redirect('/verwaltung');
  const t = await getTranslations('verwaltung.anmelden');
  return (
    <AnmeldeRahmen titel={t('titel')} untertitel={t('untertitel')}>
      <div className="flex flex-col gap-5">
        {s.eingeladen ? <Meldung art="erfolg">{t('eingeladen')}</Meldung> : null}
        {s.abgemeldet ? <Meldung art="info">{t('abgemeldet')}</Meldung> : null}
        {s.passwort === 'neu' ? <Meldung art="erfolg">{t('passwortNeu')}</Meldung> : null}
        <AnmeldeFormular />
      </div>
    </AnmeldeRahmen>
  );
}
