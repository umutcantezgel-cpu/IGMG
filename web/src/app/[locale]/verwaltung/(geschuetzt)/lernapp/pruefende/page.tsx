import { getTranslations } from 'next-intl/server';
import { PruefsprachenFormular } from '@/components/verwaltung/lernapp/Formulare';
import { LernappNavigation } from '@/components/verwaltung/lernapp/Navigation';
import { ListenLeer } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { SPRACHEN } from '@/lib/lernapp/kurse';
import { verlangeLernappSeite } from '@/lib/lernapp/verwaltung/seite';
import { pruefsprachenSetzen } from '@/server/actions/lernapp-sprachpruefung';
import { ladePruefende } from '@/server/queries/lernapp/verwaltung';

/**
 * Verwaltung › Lern-App › Prüfende (L3-06, ADR 0041 Nr. 1): Prüfsprachen der Personen mit dem Recht `lernapp.sprache.pruefen`
 * (Rolle „Sprachprüfung“, Administration). Das Recht gilt nur für diese Sprachen. Pflege mit `lernapp.bearbeiten`; Rollen
 * vergibt die Benutzerverwaltung.
 */
export default async function Pruefende() {
  const a = await verlangeLernappSeite('lernapp.bearbeiten');
  const [t, tv, tg, personen] = await Promise.all([
    getTranslations('verwaltung.lernapp.pruefende'),
    getTranslations('verwaltung'),
    getTranslations('verwaltung.shell'),
    ladePruefende(),
  ]);
  return (
    <>
      <VerwaltungsKopf kennung={tg('gruppe.inhalte')} titel={t('titel')} einleitung={t('einleitung')} />
      <LernappNavigation aktiv="pruefende" rollen={a.rollen} />
      {personen.length === 0 ? (
        <ListenLeer text={t('leer')} />
      ) : (
        <ul className="flex flex-col gap-4">
          {personen.map((p) => (
            <li key={p.id} className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-4 md:p-6">
              <h2 className="font-text text-20 font-bold tracking-normal">{p.name}</h2>
              <p className="text-16 text-tinte-2">
                {p.email} · {t('rollen', { rollen: p.rollen.map((r) => tv(`rollen.${r}` as never)).join(', ') })}
              </p>
              <PruefsprachenFormular aktion={pruefsprachenSetzen} benutzerId={p.id} name={p.name} sprachen={SPRACHEN} werte={p.sprachen} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
