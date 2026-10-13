import { CircleAlert, MessageSquareOff, ShieldCheck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { chatLage, MIN_ERWACHSENE } from '@/lib/lernen/verwaltung';
import { cn } from '@/lib/utils';

/**
 * Lage des Gruppenchats (S-02, S-04, S-06) als Hinweis in der Verwaltung. Erzwungen wird die Regel im Chat-Dienst
 * (`schreibGrund` → „zuWenigeErwachsene“); hier steht nur, was gilt und was fehlt. Keine Chat-Inhalte (ADR 0026).
 */
export async function ChatLage({
  chatModus,
  erwachsene,
  chatFunktion,
  chatVon,
  chatBis,
  mindestalter,
}: {
  chatModus: 'aus' | 'nur_lehrkraft' | 'offen';
  erwachsene: number;
  chatFunktion: boolean;
  chatVon: string;
  chatBis: string;
  mindestalter: number;
}) {
  const t = await getTranslations('verwaltung.gruppen.chat');
  const { lage, fehlen } = chatLage(chatModus, erwachsene);
  const Icon = lage === 'bereit' ? ShieldCheck : lage === 'aus' ? MessageSquareOff : CircleAlert;
  return (
    <section
      aria-labelledby="gruppe-chat"
      className={cn(
        'flex min-w-0 flex-col gap-3 rounded-lg border p-5 md:flex-row md:items-start md:gap-4 md:p-6',
        lage === 'bereit' && 'border-gruen-700 bg-gruen-50',
        lage === 'zuWenigeErwachsene' && 'border-warnung bg-warnung-toenung',
        lage === 'aus' && 'border-linie bg-weiss',
      )}
    >
      <Icon
        aria-hidden
        className={cn('size-8 shrink-0', lage === 'bereit' ? 'text-gruen-800' : lage === 'aus' ? 'text-tinte-2' : 'text-warnung')}
      />
      <div className="flex min-w-0 flex-col gap-1.5">
        <h2 id="gruppe-chat" className="font-text text-20 font-bold tracking-normal">
          {t(`titel.${lage}`)}
        </h2>
        <p className="max-w-text">
          {lage === 'zuWenigeErwachsene'
            ? t('zuWenige', { erwachsene, mindestens: MIN_ERWACHSENE, fehlen })
            : lage === 'bereit'
              ? t('bereit', { erwachsene, von: chatVon, bis: chatBis, alter: mindestalter })
              : t('aus')}
        </p>
        {lage !== 'aus' && !chatFunktion ? <p className="text-16 font-bold">{t('funktionAus')}</p> : null}
        <p className="text-16 text-tinte-2">{t('regel')}</p>
      </div>
    </section>
  );
}
