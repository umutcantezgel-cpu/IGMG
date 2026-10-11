import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Abschnitt } from './Abschnitt';

/** Knöpfe (V14): alle Varianten aus der Knopf-Bauweise; die Beispiele lösen keine Aktion aus. */
export async function Knoepfe() {
  const t = await getTranslations('verwaltung.styleguide');
  return (
    <Abschnitt id="knoepfe" titel={t('knoepfe.titel')} einleitung={t('knoepfe.einleitung')}>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="button">{t('knoepfe.primaer')}</Button>
        <Button type="button" variant="secondary">
          {t('knoepfe.sekundaer')}
        </Button>
        <Button type="button" variant="outline">
          {t('knoepfe.umriss')}
        </Button>
        <Button type="button" variant="ghost">
          {t('knoepfe.tertiaer')}
        </Button>
        <Button type="button" variant="destructive">
          {t('knoepfe.loeschen')}
        </Button>
        <Button type="button" variant="link">
          {t('knoepfe.link')}
        </Button>
        <Button type="button" disabled>
          {t('knoepfe.deaktiviert')}
        </Button>
      </div>
    </Abschnitt>
  );
}
