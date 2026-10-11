import { getTranslations } from 'next-intl/server';
import { CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Abschnitt } from './Abschnitt';
import { KONTRASTBEISPIELE } from './tokens';

const REGELN = ['kontrast', 'ziele', 'schrift', 'fokus', 'semantik', 'aria', 'tastatur', 'alttext', 'bewegung', 'fehler'] as const;

/** Barrierefreiheit (V14): Regeln aus dem Design, Kontrastbeispiele mit Token-Klassen, Fokusprüfung. */
export async function Barrierefreiheit() {
  const t = await getTranslations('verwaltung.styleguide');
  return (
    <Abschnitt id="barrierefreiheit" titel={t('barrierefreiheit.titel')} einleitung={t('barrierefreiheit.einleitung')}>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h3 className="text-24">{t('barrierefreiheit.pruefliste')}</h3>
          <ul className="flex flex-col gap-2">
            {REGELN.map((r) => (
              <li key={r} className="flex items-start gap-2 text-16">
                <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-gruen-700" />
                <span>{t(`barrierefreiheit.regeln.${r}`)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h3 className="text-24">{t('barrierefreiheit.kontrastTitel')}</h3>
            {KONTRASTBEISPIELE.map((k) => (
              <div key={k.schluessel} className={cn('flex flex-col gap-1 rounded-lg p-4 text-16', k.klasse)}>
                <strong>{t(`barrierefreiheit.kontrastBeispiele.${k.schluessel}`)}</strong>
                <span>{t('barrierefreiheit.kontrastAngabe', { verhaeltnis: k.verhaeltnis, stufe: k.stufe })}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-24">{t('barrierefreiheit.fokusTitel')}</h3>
            <p>{t('barrierefreiheit.fokusText')}</p>
            <div className="flex flex-wrap items-center gap-4">
              <Button type="button">{t('barrierefreiheit.fokusKnopf')}</Button>
              <a href="#barrierefreiheit" className="inline-flex min-h-12 items-center font-bold">
                {t('barrierefreiheit.fokusLink')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </Abschnitt>
  );
}
