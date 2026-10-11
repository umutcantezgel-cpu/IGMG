import { getTranslations } from 'next-intl/server';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { verlangeSitzung } from '@/lib/rechte/pruefe';
import { abmelden } from '@/server/actions/anmeldung';

/** Geschützter Bereich: Sitzung + zweiter Faktor + mindestens eine Rolle (K-06). Shell folgt in D05. */
export default async function GeschuetzterBereich({ children }: LayoutProps<'/[locale]/verwaltung'>) {
  const a = await verlangeSitzung();
  const t = await getTranslations('verwaltung');
  return (
    <>
      <header className="border-b border-linie bg-weiss">
        <div className="mx-auto flex max-w-(--container-inhalt) items-center justify-between gap-4 px-4 py-3 md:px-8">
          <span className="font-display text-20 font-semibold">{t('titel')}</span>
          <div className="flex items-center gap-3">
            <span className="text-16 text-tinte-2">{t('konto.angemeldetAls', { name: a.name })}</span>
            <form action={abmelden}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut aria-hidden />
                {t('konto.abmelden')}
              </Button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
