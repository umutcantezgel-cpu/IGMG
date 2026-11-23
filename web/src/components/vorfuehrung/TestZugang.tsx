import { GraduationCap, Images, LayoutDashboard, LogIn, Smile, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import NextLink from 'next/link';
import { Button } from '@/components/ui/button';
import { Feld } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { VORFUEHRUNG_KONTEN, VORFUEHRUNG_PASSWORT, type VorfuehrungsSchluessel } from '@/lib/vorfuehrung/konten';
import { testzugangAnmelden } from '@/server/actions/vorfuehrung';

const ZEICHEN: Record<VorfuehrungsSchluessel, typeof Users> = {
  verwaltung: LayoutDashboard,
  eltern: Users,
  lehrkraft: GraduationCap,
  kind: Smile,
};

/**
 * Anmeldeseite der Vorführung mit Testzugang (ADR 0052): vier Zugänge mit je einem Knopf – Verwaltung, Eltern, Lehrkraft,
 * Kind – und darunter dasselbe zum Selbsteintragen. Benutzername und Passwort stehen offen da; der Testzugang schützt
 * nichts, die Vorführung enthält nur Beispieldaten (Hinweis oben). Ohne Client-JavaScript: jedes Formular ruft die Server
 * Action auf, falsche Eingaben kommen mit `?fehler=1` zurück.
 */
export async function TestZugang({ fehler, abgemeldet }: { fehler: boolean; abgemeldet: boolean }) {
  const t = await getTranslations('verwaltung.vorfuehrung');
  const tv = await getTranslations('verwaltung');
  return (
    <main id="inhalt" className="mx-auto flex min-h-dvh w-full max-w-(--container-seitenkopf) flex-col justify-center px-4 py-10 md:py-14">
      <div className="mb-6 flex items-center gap-3">
        <Image src="/bilder/logos/logo-igmg-wetzlar.png" alt="" width={40} height={40} className="size-10 rounded-sm" />
        <p className="font-display text-20 font-semibold">IGMG Wetzlar</p>
      </div>
      <h1 className="text-display-2">{t('titel')}</h1>
      <p className="mt-3 max-w-einleitung text-18 text-pretty text-tinte-2">{t('einleitung')}</p>
      <div className="mt-6 flex flex-col gap-3">
        {fehler ? (
          <Meldung art="fehler" id="testzugang-meldung">
            {t('fehler')}
          </Meldung>
        ) : null}
        {abgemeldet ? <Meldung art="info">{t('abgemeldet')}</Meldung> : null}
        <Meldung art="info">{t('hinweis')}</Meldung>
      </div>

      <h2 className="mt-10 font-display text-24 font-semibold">{t('zugaenge')}</h2>
      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        {VORFUEHRUNG_KONTEN.map((k) => {
          const Zeichen = ZEICHEN[k.schluessel];
          const name = t(`konten.${k.schluessel}.name`);
          return (
            <li key={k.schluessel} className="flex flex-col rounded-lg border border-linie bg-weiss p-5 shadow-s1">
              <div className="flex items-center gap-3">
                <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-md bg-gruen-50 text-gruen-800">
                  <Zeichen className="size-6" />
                </span>
                <h3 className="font-display text-20 font-semibold">{name}</h3>
              </div>
              <p className="mt-3 text-pretty text-tinte-2">{t(`konten.${k.schluessel}.text`)}</p>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 rounded-md bg-sand px-4 py-3 text-16">
                <dt className="text-tinte-2">{t('benutzername')}</dt>
                <dt className="text-tinte-2">{t('passwort')}</dt>
                <dd className="font-bold break-all">{k.benutzername}</dd>
                <dd className="font-bold break-all">{VORFUEHRUNG_PASSWORT}</dd>
              </dl>
              <form action={testzugangAnmelden} className="mt-4 flex grow items-end">
                <input type="hidden" name="benutzername" value={k.benutzername} />
                <input type="hidden" name="passwort" value={VORFUEHRUNG_PASSWORT} />
                <Button
                  type="submit"
                  variant={k.schluessel === 'verwaltung' ? 'default' : 'secondary'}
                  className="w-full whitespace-normal"
                >
                  <LogIn aria-hidden />
                  {t('anmeldenAls', { name })}
                </Button>
              </form>
            </li>
          );
        })}
      </ul>

      <section aria-labelledby="testzugang-selbst" className="mt-8 rounded-lg border border-linie bg-weiss p-5 shadow-s1 md:p-6">
        <h2 id="testzugang-selbst" className="font-display text-24 font-semibold">
          {t('selbst')}
        </h2>
        <p className="mt-1 text-tinte-2">{t('selbstText')}</p>
        <form action={testzugangAnmelden} className="mt-4 grid items-end gap-4 md:grid-cols-3">
          <Feld
            id="testzugang-benutzername"
            name="benutzername"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            label={t('benutzername')}
          />
          <Feld id="testzugang-passwort" name="passwort" type="password" autoComplete="current-password" required label={t('passwort')} />
          <Button type="submit" className="w-full">
            <LogIn aria-hidden />
            {t('anmelden')}
          </Button>
        </form>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
        <NextLink href="/verwaltung/rundgang" prefetch={false} className="inline-flex min-h-12 items-center gap-2 font-bold">
          <Images aria-hidden className="size-5" />
          {t('rundgang')}
        </NextLink>
        <NextLink href="/" prefetch={false} className="inline-flex min-h-12 items-center font-bold">
          {tv('shell.zurWebsite')}
        </NextLink>
      </div>
    </main>
  );
}
