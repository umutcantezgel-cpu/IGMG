import { getTranslations } from 'next-intl/server';
import { PostfachRahmen } from '@/components/verwaltung/postfach/PostfachRahmen';
import { Zustandsgrafik } from '@/components/website/Zustandsgrafik';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { ladeUnterhaltungen } from '@/server/queries/verwaltung/postfach';

/**
 * Verwaltung › Nachrichten (internes Postfach, V09): Liste der eigenen Unterhaltungen, rechts der Leerzustand.
 * Ohne Unterhaltungen zeigt der Rahmen eine Karte mit dem Weg zur ersten Unterhaltung (H-B06); der Auswahlhinweis
 * ist auf dem Telefon ausgeblendet, weil die Liste dort darüber steht.
 */
export default async function PostfachStart() {
  const a = await verlangeSeitenRecht('postfach.nutzen');
  const [t, liste] = await Promise.all([getTranslations('verwaltung.postfach'), ladeUnterhaltungen(a.benutzerId)]);
  return (
    <PostfachRahmen liste={liste} startseite>
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center max-verwaltung:hidden">
        <Zustandsgrafik art="leer" groesse={72} />
        <h2 className="text-24">{t('leerVerlaufTitel')}</h2>
        <p className="text-tinte-2">{t('leerVerlaufText')}</p>
      </div>
    </PostfachRahmen>
  );
}
