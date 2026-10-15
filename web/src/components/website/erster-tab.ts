/**
 * Erster Tab auf den Leseseiten (Z-08): Koran-Leser (LeserRahmen) sowie Buch- und Teilseiten der Hadith-Sammlung
 * (BuchAnsicht). Jeder Vers (quran.css) und jede Hadith-Karte (HadithListe) trägt `content-visibility: auto`, damit lange
 * Suren und Bücher schnell zeichnen. Ohne Startpunkt der Fokus-Navigation (noch kein Fokus, kein Klick, kein Anker in der
 * Adresse) sucht Chromium beim ersten Tab das ganze Dokument nach dem nächsten Ziel ab und erzwingt dabei für jeden nicht
 * gezeichneten Vers bzw. jede Karte Stil und Layout einzeln: Al-Baqara (286 Verse) stand so bei CPU 4× rund 6–7 s still,
 * eine Hadith-Seite mit 100 Karten rund 1 s (Endprüfung Stufe C). Gemessen in N1: Ohne `tabindex` an den Versen bleibt es
 * gleich teuer, ohne `content-visibility` fällt es weg, kostet dann aber beim Laden Sekunden an langen Aufgaben.
 *
 * Deshalb übernimmt dieses Skript nur genau diesen ersten Tab: Es fokussiert das erste (mit Umschalt das letzte)
 * erreichbare Element in Dokumentreihenfolge – dasselbe Ziel wie der Browser (das erste ist der Sprunglink) – und
 * prüft dabei nur die Kandidaten bis zum Treffer. Sobald es einen Startpunkt gibt (Fokus, Zeiger, Anker), entfernt es
 * sich und der Browser navigiert wie immer. Bei offenem modalem Dialog greift es nicht. Inline, damit es schon vor der
 * Hydrierung wirkt; öffentliche CSP erlaubt Inline-Skripte (ADR 0012).
 */
export const ERSTER_TAB = `(function(){var d=document,Z='a[href],area[href],button,input,select,textarea,summary,iframe,[tabindex],[contenteditable]';if(location.hash)return;function f(){d.removeEventListener('keydown',k,true);d.removeEventListener('pointerdown',f,true);d.removeEventListener('focusin',f,true)}function k(e){if(e.key!=='Tab'||e.altKey||e.ctrlKey||e.metaKey||e.defaultPrevented)return;var a=d.activeElement;if(a&&a!==d.body){f();return}if(d.querySelector(':modal'))return;var l=[].slice.call(d.querySelectorAll(Z));if(e.shiftKey)l.reverse();for(var i=0;i<l.length;i++){var x=l[i];if(x.tabIndex>=0&&!x.matches(':disabled')&&!x.closest('[inert]')&&(!x.checkVisibility||x.checkVisibility({visibilityProperty:true}))){e.preventDefault();f();x.focus();return}}}d.addEventListener('keydown',k,true);d.addEventListener('pointerdown',f,true);d.addEventListener('focusin',f,true)})()`;
