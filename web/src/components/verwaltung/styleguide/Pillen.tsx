import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/utils';
import { Abschnitt } from './Abschnitt';

const PILLE = 'inline-flex items-center rounded-pill px-3 py-0.5 text-16 font-bold whitespace-nowrap';

/** Status-Pillen wie in der Veranstaltungsliste der Verwaltung. */
const STATUS = [
  { schluessel: 'veroeffentlicht', klasse: 'bg-gruen-50 text-gruen-800' },
  { schluessel: 'entwurf', klasse: 'bg-sand text-tinte-2' },
  { schluessel: 'kommend', klasse: 'bg-info-toenung text-info' },
  { schluessel: 'vergangen', klasse: 'bg-sand text-tinte-2' },
  { schluessel: 'beispiel', klasse: 'bg-warnung-toenung text-warnung' },
] as const;

/** Kategorie-Pillen: Text und Tönung aus den Tag-Tokens. */
const KATEGORIEN = [
  { schluessel: 'bildung', klasse: 'bg-tag-bildung-bg text-tag-bildung' },
  { schluessel: 'veranstaltung', klasse: 'bg-tag-veranstaltung-bg text-tag-veranstaltung' },
  { schluessel: 'jugend', klasse: 'bg-tag-jugend-bg text-tag-jugend' },
  { schluessel: 'wichtig', klasse: 'bg-tag-wichtig-bg text-tag-wichtig' },
  { schluessel: 'neuigkeiten', klasse: 'bg-tag-neuigkeiten-bg text-tag-neuigkeiten' },
  { schluessel: 'gemeinde', klasse: 'bg-tag-gemeinde-bg text-tag-gemeinde' },
] as const;

/** Pillen (V14): Status und Kategorie, nicht interaktiv. */
export async function Pillen() {
  const t = await getTranslations('verwaltung.styleguide');
  return (
    <Abschnitt id="pillen" titel={t('pillen.titel')} einleitung={t('pillen.einleitung')}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h3 className="text-24">{t('pillen.statusTitel')}</h3>
          <ul className="flex flex-wrap gap-2">
            {STATUS.map((s) => (
              <li key={s.schluessel}>
                <span className={cn(PILLE, s.klasse)}>{t(`pillen.status.${s.schluessel}`)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-24">{t('pillen.kategorieTitel')}</h3>
          <ul className="flex flex-wrap gap-2">
            {KATEGORIEN.map((k) => (
              <li key={k.schluessel}>
                <span className={cn(PILLE, k.klasse)}>{t(`pillen.kategorie.${k.schluessel}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Abschnitt>
  );
}
