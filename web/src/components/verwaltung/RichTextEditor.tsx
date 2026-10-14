'use client';

import type { JSONContent } from '@tiptap/core';
import { CircleAlert } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useCallback, useId, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { BildAuswahl } from './richtext/typen';

/**
 * Rich-Text-Feld der Verwaltung (ADR 0006, C15). Beschriftung, Hinweis und Fehler wie bei den übrigen Feldern.
 * Der Editor (Tiptap) wird erst im Browser geladen (`ssr: false`); bis dahin steht ein Platzhalter gleicher Höhe.
 * Das Dokument liegt als Tiptap-JSON in einem verborgenen Feld `name`; der Server prüft es mit `richtextFeld`.
 */
const RichTextEditorKern = dynamic(() => import('./richtext/RichTextEditorKern').then((modul) => modul.RichTextEditorKern), {
  ssr: false,
  loading: () => <Ladeflaeche />,
});

/** Platzhalter gleicher Höhe wie Werkzeugleiste und Editierfläche (kein Springen nach dem Laden). */
function Ladeflaeche() {
  const t = useTranslations('verwaltung.editor');
  return (
    <div aria-busy="true">
      <div className="min-h-16 rounded-t-md border-b border-linie bg-papier sm:min-h-28" />
      <p className="min-h-64 px-4 py-3 text-16 text-tinte-2">{t('laedt')}</p>
    </div>
  );
}

export type RichTextEditorProps = {
  /** Name des verborgenen Feldes. Der Wert ist das Tiptap-JSON als Text; leer heißt: kein Inhalt. */
  name: string;
  /** Tiptap-JSON aus der Datenbank oder `null` für ein neues Feld. */
  startwert?: JSONContent | null;
  label: ReactNode;
  hinweis?: ReactNode;
  fehler?: ReactNode;
  /** Öffnet die Mediathek und liefert die gewählte Medien-ID. Ohne diese Funktion gibt es keinen Bild-Knopf. */
  bildAuswahl?: BildAuswahl;
};

export function RichTextEditor({ name, startwert, label, hinweis, fehler, bildAuswahl }: RichTextEditorProps) {
  const basis = useId();
  const labelId = `${basis}-label`;
  const hinweisId = hinweis ? `${basis}-hinweis` : undefined;
  const fehlerId = fehler ? `${basis}-fehler` : undefined;
  const [json, setJson] = useState(() => (startwert ? JSON.stringify(startwert) : ''));
  const aendern = useCallback((dokument: JSONContent) => setJson(JSON.stringify(dokument)), []);

  return (
    <div className="flex flex-col gap-1.5">
      <span id={labelId} className="text-16 leading-normal font-bold text-tinte">
        {label}
      </span>
      {hinweis ? (
        <p id={hinweisId} className="text-16 text-tinte-2">
          {hinweis}
        </p>
      ) : null}
      <div className={cn('flex flex-col rounded-md border bg-weiss', fehler ? 'border-2 border-fehler' : 'border-rand')}>
        <RichTextEditorKern
          id={basis}
          labelId={labelId}
          hinweisId={hinweisId}
          fehlerId={fehlerId}
          hatFehler={Boolean(fehler)}
          startwert={startwert}
          onAendern={aendern}
          bildAuswahl={bildAuswahl}
        />
      </div>
      <input type="hidden" name={name} value={json} />
      {fehler ? (
        <p id={fehlerId} className="flex items-start gap-1.5 text-16 font-bold text-fehler">
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
          <span>{fehler}</span>
        </p>
      ) : null}
    </div>
  );
}
