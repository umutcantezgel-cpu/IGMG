import { getTranslations } from 'next-intl/server';
import { NeueUnterhaltungFormular, type EmpfaengerAuswahl } from '@/components/verwaltung/postfach/NeueUnterhaltungFormular';
import { PostfachRahmen } from '@/components/verwaltung/postfach/PostfachRahmen';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { neueUnterhaltung } from '@/server/actions/postfach';
import { ladeEmpfaenger, ladeUnterhaltungen } from '@/server/queries/verwaltung/postfach';

/**
 * Verwaltung › Nachrichten › Neue Unterhaltung (V09): Betreff, Empfänger aus den Konten mit Verwaltungszugang
 * (Name und Rolle, ohne die eigene Person) und die erste Nachricht. Rechts im Verlaufsbereich.
 */
export default async function NeueUnterhaltungSeite() {
  const a = await verlangeSeitenRecht('postfach.nutzen');
  const [t, tv, liste, empfaenger] = await Promise.all([
    getTranslations('verwaltung.postfach'),
    getTranslations('verwaltung'),
    ladeUnterhaltungen(a.benutzerId),
    ladeEmpfaenger(a.benutzerId),
  ]);
  const auswahl: EmpfaengerAuswahl[] = empfaenger.map((e) => ({
    id: e.id,
    label: `${e.name} – ${e.rollen.map((r) => tv(`rollen.${r.rolle}`) + (r.organisation ? ` (${r.organisation.toUpperCase()})` : '')).join(', ')}`,
  }));
  return (
    <PostfachRahmen liste={liste}>
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-24">{t('neuTitel')}</h2>
          <p className="text-tinte-2">{t('neuEinleitung')}</p>
        </div>
        <NeueUnterhaltungFormular aktion={neueUnterhaltung} empfaenger={auswahl} />
      </div>
    </PostfachRahmen>
  );
}
