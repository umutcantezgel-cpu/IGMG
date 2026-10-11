'use client';

import { Bookmark, Heart } from 'lucide-react';
import { useState } from 'react';
import { klassen } from '@/lib/klassen';

/**
 * Umschalter „Speichern“ und „Gefällt mir“ (design/NewsDetails.dc.html, Zustände saved und liked).
 * Der Zustand gilt nur für diese Ansicht; nichts wird gespeichert oder gezählt (Bestand ohne Handler, OFFENE FRAGE).
 * Texte kommen als Prop, weil Client-Komponenten kein next-intl nutzen (K-12).
 */
export function MerkKnopf({ art, texte }: { art: 'speichern' | 'gefallt'; texte: string }) {
  const [an, setAn] = useState(false);
  const Icon = art === 'speichern' ? Bookmark : Heart;
  return (
    <button
      type="button"
      aria-pressed={an}
      onClick={() => setAn((v) => !v)}
      className={klassen(
        'inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md border border-rand px-4 font-bold text-tinte hover:border-gruen-700 hover:bg-gruen-50',
        an ? 'bg-gruen-50' : 'bg-weiss',
      )}
    >
      <Icon aria-hidden className="size-5" />
      {texte}
    </button>
  );
}
