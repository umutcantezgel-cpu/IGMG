# ADR 0030 – Religiöse Freigabe und KI-Regel

- Status: angenommen (umgesetzt 13.10.2026) (Lauf Gemeinde-Plattform) · Bezug: Plan „Gemeinde-Plattform“ §5 (Religiöse Freigabe, KI-Regel), §1 („bewusst abgelehnt“), §7 (Z-15, Risiko „Religiöser Fehler“), MN-06, MN-20

## Kontext

- Die Moschee verlangt, dass religiöse Inhalte von Menschen geprüft werden. Fehler bei Versen, Hadithen, Wortbedeutungen, Tajwid-Regeln oder Gebetszeiten wiegen schwer.
- KI-Werkzeuge erzeugen Text schnell. Sie können Verse, Übersetzungen oder arabische Texte falsch wiedergeben.
- Die Regel gilt für die gesamte Arbeit am Projekt und steht in jedem Briefing.

## Entscheidung

1. **Pflicht zur religiösen Freigabe** für: Wortbedeutungen, Tajwid-Texte, Hadith-Übersetzungen, Elifbe-Lektionen, Wissensthemen, besondere Tage, Vers- und Hadith-Listen sowie Anzeige-Folien mit Vers oder Hadith.
2. **Status:** Entwurf, dann zur Prüfung, dann geprüft. Die Rolle `religioese_pruefung` (Imam und Hoca, ADR 0026) prüft. Jede Änderung setzt auf „zur Prüfung“ zurück. Öffentlich ist nur der Status „geprüft“.
3. **Unverändert importierte Ausgaben** werden je Ausgabe einmal freigegeben.
4. **KI-Regel** (in jedem Briefing):
   - Kein Agent schreibt Verse, Hadithe, Bittgebete, religiöse arabische Texte, Übersetzungen, Wortbedeutungen oder Tajwid- und Fiqh-Erklärungen.
   - Arabischer Text stammt nur aus importierten Dateien oder aus den Codepunkten des Alphabets.
   - Prüfwerkzeug `_gemeinde/werkzeuge/religion-pruefung.mjs`: Arabische Schrift außerhalb von `web/daten/**` und der Alphabetdatei ergibt Rot in Prüfstufe A.
5. **Bausteine:** Die Blöcke `vers` und `hadith` (ADR 0032) sind nur Verweise auf freigegebene Datenbankinhalte.
6. **Hadith-Volltext** wird erst nach der Rechtsfreigabe öffentlich (MN-06). Bis dahin gilt die kuratierte Auswahl.
7. **Imam-Konto mit 2FA** (MN-20). Ohne dieses Konto stauen sich die Freigaben.
8. **Abgelehnt:** KI-erzeugte Übersetzungen, Wortbedeutungen und Tajwid-Erklärungen; ein „Frag-den-Imam“-Bot; Sprachausgabe für Koran oder Hadith.

## Alternativen

- KI-Übersetzung mit nachträglicher Prüfung: verworfen („bewusst abgelehnt“).
- Freigabe durch die allgemeine Redaktion statt durch die eigene Rolle: nicht gewählt. Der Plan legt die Freigabe in `religioese_pruefung`.
- Stichprobenhafte Freigabe: nicht vorgesehen. Die Pflicht gilt für alle genannten Inhalte.
- Platzhalter statt Freigabe: ist der Rückfall. Platzhalter wie „noch nicht erfasst“ oder „in Arbeit“ bleiben sichtbar, bis die Freigabe vorliegt.

## Folgen

- Freigaben können Inhalte verzögern. Der Standard bis zur Freigabe ist der Platzhalter.
- Tests: Das Prüfwerkzeug läuft in Prüfstufe A. Ein Statustest zeigt, dass jede Änderung zurücksetzt. Öffentlich wird nur „geprüft“ gelesen.
- Z-15: 0 ungeprüfte religiöse Inhalte öffentlich; `religion-pruefung` meldet 0.
- Schnittstellen: ADR 0032 (CMS-Blöcke) und ADR 0026 (Rolle `religioese_pruefung`).
