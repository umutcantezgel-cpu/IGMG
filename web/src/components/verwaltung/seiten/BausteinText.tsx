'use client';

import type { JSONContent } from '@tiptap/core';
import { CircleAlert } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import type { BildAuswahl } from '@/components/verwaltung/richtext/typen';
import { cn } from '@/lib/utils';

/**
 * Rich-Text im Baustein „Text“ (ADR 0006): derselbe Editor wie in Neuigkeiten (`RichTextEditorKern`, erst im Browser
 * geladen), aber gesteuert – jede Änderung geht an den Seiten-Editor, der alle Bausteine als JSON absendet.
 */
const Kern = dynamic(() => import('@/components/verwaltung/richtext/RichTextEditorKern').then((m) => m.RichTextEditorKern), {
  ssr: false,
  loading: () => <Ladeflaeche />,
});

function Ladeflaeche() {
  const t = useTranslations('verwaltung.editor');
  return (
    <div aria-busy="true">
      <div className="min-h-16 rounded-t-md border-b border-linie bg-papier sm:min-h-28" />
      <p className="min-h-48 px-4 py-3 text-16 text-tinte-2">{t('laedt')}</p>
    </div>
  );
}

export function BausteinText({
  id,
  label,
  hinweis,
  fehler,
  startwert,
  aendern,
  bildAuswahl,
}: {
  id: string;
  label: ReactNode;
  hinweis?: ReactNode;
  fehler?: string;
  startwert: JSONContent | null;
  aendern: (doc: JSONContent) => void;
  bildAuswahl?: BildAuswahl;
}) {
  const labelId = `${id}-label`;
  const hinweisId = hinweis ? `${id}-hinweis` : undefined;
  const fehlerId = fehler ? `${id}-fehler` : undefined;
  return (
    <div id={id} tabIndex={-1} className="flex min-w-0 flex-col gap-1.5 outline-none">
      <span id={labelId} className="font-bold">
        {label}
      </span>
      {hinweis ? (
        <p id={hinweisId} className="text-16 text-tinte-2">
          {hinweis}
        </p>
      ) : null}
      <div className={cn('flex flex-col rounded-md border bg-weiss', fehler ? 'border-2 border-fehler' : 'border-rand')}>
        <Kern
          id={`${id}-editor`}
          labelId={labelId}
          hinweisId={hinweisId}
          fehlerId={fehlerId}
          hatFehler={Boolean(fehler)}
          startwert={startwert}
          onAendern={aendern}
          bildAuswahl={bildAuswahl}
        />
      </div>
      {fehler ? (
        <p id={fehlerId} className="flex items-start gap-1.5 text-16 font-bold text-fehler">
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
          <span>{fehler}</span>
        </p>
      ) : null}
    </div>
  );
}
