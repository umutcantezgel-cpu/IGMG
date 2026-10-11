'use client';

import type { JSONContent } from '@tiptap/core';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { istErlaubterLink } from '@/lib/inhalt/links';
import { richtextSchema } from '@/lib/validierung/richtext';
import { richtextErweiterungen } from './erweiterungen';
import { LinkFeld } from './LinkFeld';
import { Werkzeugleiste, type WerkzeugAktion, type WerkzeugZustand } from './Werkzeugleiste';
import type { BildAuswahl } from './typen';

/** Leeres Dokument als Startwert: ohne Inhalt kein HTML-Parsen nötig. */
const LEER: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };

export type KernProps = {
  /** Basis der Element-IDs (Link-Eingabe, Statuszeile). */
  id: string;
  labelId: string;
  hinweisId?: string;
  fehlerId?: string;
  hatFehler: boolean;
  startwert: JSONContent | null | undefined;
  /** Meldet jedes geänderte Dokument (Tiptap-JSON) an das Formularfeld. */
  onAendern: (dokument: JSONContent) => void;
  bildAuswahl?: BildAuswahl;
};

/** Auswahl beim Öffnen der Linkeingabe: Bereich im Dokument und ob er schon einen Link trägt. */
type VerweisBereich = { von: number; bis: number; hatVerweis: boolean };

/** Nur Dateien ohne Text oder HTML (Bild aus Ablage oder Zwischenablage): der Editor fügt so etwas nicht ein. */
function nurDateien(daten: DataTransfer | null | undefined) {
  return Boolean(daten?.files.length) && !daten?.getData('text/html') && !daten?.getData('text/plain');
}

/**
 * Editierfläche des Rich-Text-Felds (ADR 0006, C15): Tiptap 3 mit den Erweiterungen aus `erweiterungen.ts`. Nur im
 * Browser geladen (über `RichTextEditor`). Alles, was der Editor erzeugt, prüft `richtextSchema` ebenso wie der Server.
 */
export function RichTextEditorKern({ id, labelId, hinweisId, fehlerId, hatFehler, startwert, onAendern, bildAuswahl }: KernProps) {
  const t = useTranslations('verwaltung.editor');
  const [erweiterungen] = useState(() => richtextErweiterungen({ bildPlatzhalter: t('bildPlatzhalter') }));
  // Ein gespeicherter Text, der nicht mehr dem Schema entspricht, wird gleich gemeldet, bevor er erneut gespeichert wird.
  const [ungueltig, setUngueltig] = useState(() => Boolean(startwert) && !richtextSchema.safeParse(startwert).success);
  const [meldung, setMeldung] = useState<string | null>(null);
  const [verweisBereich, setVerweisBereich] = useState<VerweisBereich | null>(null);
  const [verweisWert, setVerweisWert] = useState('');
  const [verweisFehler, setVerweisFehler] = useState<string | null>(null);
  const bildRef = useRef(bildAuswahl);

  useEffect(() => {
    bildRef.current = bildAuswahl;
  }, [bildAuswahl]);

  const editor = useEditor({
    extensions: erweiterungen,
    content: startwert?.content?.length ? startwert : LEER,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        'aria-multiline': 'true',
        'aria-labelledby': labelId,
        class: 'fliesstext min-h-64 px-4 py-3',
      },
      // Reine Dateien werden nie eingefügt; Bilder kommen nur über die Mediathek. Text mit eingebetteten Bildern bleibt erlaubt.
      handlePaste: (_ansicht, ereignis) => nurDateien(ereignis.clipboardData),
      handleDrop: (_ansicht, ereignis) => nurDateien(ereignis.dataTransfer),
    },
    onUpdate: ({ editor: aktuell }) => {
      const dokument = aktuell.getJSON();
      onAendern(dokument);
      setUngueltig(!richtextSchema.safeParse(dokument).success);
      setMeldung(null);
    },
  });

  // Beschreibung und Fehler gehören zur Editierfläche (role="textbox"); Tiptap setzt diese Attribute nur beim Anlegen.
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const dom = editor.view.dom;
    const beschrieben = [hinweisId, fehlerId].filter(Boolean).join(' ');
    if (beschrieben) dom.setAttribute('aria-describedby', beschrieben);
    else dom.removeAttribute('aria-describedby');
    if (hatFehler) dom.setAttribute('aria-invalid', 'true');
    else dom.removeAttribute('aria-invalid');
  }, [editor, hinweisId, fehlerId, hatFehler]);

  // Knopfzustand folgt der Auswahl; `shouldRerenderOnTransaction` ist aus, deshalb diese Abfrage.
  const zustand = useEditorState({
    editor,
    selector: ({ editor: aktuell }): WerkzeugZustand | null =>
      aktuell
        ? {
            absatz:
              !aktuell.isActive('heading') &&
              !aktuell.isActive('blockquote') &&
              !aktuell.isActive('bulletList') &&
              !aktuell.isActive('orderedList'),
            ueberschrift2: aktuell.isActive('heading', { level: 2 }),
            ueberschrift3: aktuell.isActive('heading', { level: 3 }),
            fett: aktuell.isActive('bold'),
            kursiv: aktuell.isActive('italic'),
            aufzaehlung: aktuell.isActive('bulletList'),
            nummerierung: aktuell.isActive('orderedList'),
            zitat: aktuell.isActive('blockquote'),
            link: aktuell.isActive('link'),
            bild: aktuell.isActive('image'),
            rueckgaengig: aktuell.can().undo(),
            wiederholen: aktuell.can().redo(),
          }
        : null,
  });

  function verweisOeffnen() {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const bisher = editor.getAttributes('link').href as string | undefined;
    // Ein markiertes Bild trägt keinen Text: wie ohne Auswahl behandeln, damit der Hinweis erscheint.
    const bereich = editor.isActive('image')
      ? { von: from, bis: from, hatVerweis: false }
      : { von: from, bis: to, hatVerweis: Boolean(bisher) };
    setVerweisBereich(bereich);
    setVerweisWert(bisher ?? '');
    setVerweisFehler(null);
  }

  function verweisSchliessen() {
    setVerweisBereich(null);
    setVerweisFehler(null);
    editor?.commands.focus();
  }

  function verweisUebernehmen() {
    if (!editor || !verweisBereich) return;
    const adresse = verweisWert.trim();
    if (!istErlaubterLink(adresse) || adresse.length > 2000) {
      setVerweisFehler(t('linkFehler'));
      return;
    }
    const { von, bis, hatVerweis } = verweisBereich;
    if (von === bis && !hatVerweis) {
      setVerweisFehler(t('linkKeineAuswahl'));
      return;
    }
    const kette = editor.chain().focus().setTextSelection({ from: von, to: bis });
    if (von === bis) kette.extendMarkRange('link');
    if (!kette.setLink({ href: adresse }).run()) {
      setVerweisFehler(t('linkFehler'));
      return;
    }
    verweisSchliessen();
  }

  async function bildEinfuegen() {
    const wahl = await bildRef.current?.();
    if (!wahl || !editor || editor.isDestroyed) return;
    if (!editor.chain().focus().setBild(wahl.mediumId).run()) setMeldung(t('bildFehler'));
  }

  function ausfuehren(aktion: WerkzeugAktion) {
    if (!editor || editor.isDestroyed) return;
    setMeldung(null);
    switch (aktion) {
      case 'absatz':
        editor.chain().focus().setParagraph().run();
        return;
      case 'ueberschrift2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        return;
      case 'ueberschrift3':
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        return;
      case 'fett':
        editor.chain().focus().toggleBold().run();
        return;
      case 'kursiv':
        editor.chain().focus().toggleItalic().run();
        return;
      case 'aufzaehlung':
        editor.chain().focus().toggleBulletList().run();
        return;
      case 'nummerierung':
        editor.chain().focus().toggleOrderedList().run();
        return;
      case 'zitat':
        editor.chain().focus().toggleBlockquote().run();
        return;
      case 'linkSetzen':
        verweisOeffnen();
        return;
      case 'linkEntfernen':
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        return;
      case 'bildEinfuegen':
        void bildEinfuegen();
        return;
      case 'bildEntfernen':
        editor.chain().focus().deleteSelection().run();
        return;
      case 'rueckgaengig':
        editor.chain().focus().undo().run();
        return;
      case 'wiederholen':
        editor.chain().focus().redo().run();
        return;
    }
  }

  const hinweisText = meldung ?? (ungueltig ? t('ungueltig') : null);

  return (
    <>
      <Werkzeugleiste zustand={zustand} bildMoeglich={Boolean(bildAuswahl)} onAktion={ausfuehren} />
      {verweisBereich ? (
        <LinkFeld
          id={id}
          wert={verweisWert}
          onWert={setVerweisWert}
          hinweis={verweisBereich.von === verweisBereich.bis && !verweisBereich.hatVerweis ? t('linkKeineAuswahl') : t('linkHinweis')}
          fehler={verweisFehler}
          onUebernehmen={verweisUebernehmen}
          onAbbrechen={verweisSchliessen}
        />
      ) : null}
      {editor ? <EditorContent editor={editor} /> : <div className="min-h-64" />}
      <p id={`${id}-status`} role="status" className="px-4 pb-3 text-16 font-bold text-fehler empty:hidden">
        {hinweisText}
      </p>
    </>
  );
}
