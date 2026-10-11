# ABNAHME – Z-01 bis Z-12

Abhaken erst, wenn der Beleg vorhanden und aktuell ist, vom zuständigen Prüfer bestätigt wurde und nichts abgesenkt ist. Kriterien sinken nur mit ausdrücklicher Zustimmung des Nutzers.
Zielsatz: Alle Kriterien Z-01 bis Z-12 in `_lauf/ABNAHME.md` sind mit Beleg abgehakt.

| Z | Kriterium | Methode | Schwelle | Beleg (Fundort) | Prüfer | Status |
|---|---|---|---|---|---|---|
| Z-01 | Seiten: alle 21 öffentlichen Design-Seiten plus Impressum, Datenschutz, „Seite nicht gefunden“ und Offline-Seite in drei Sprachen erreichbar | T4-Routenlauf | 100 % | `_lauf/belege/Z-01-routenlauf.md` | Testläufer | ☐ offen |
| Z-02 | Design-Treue: jede Seite bei 390 und 1440 px ohne Abweichung der Stufe hoch; mittel begründet in ABWEICHUNGEN.md | T6 | 0 hoch | `_lauf/belege/Z-02-darstellung.md` (+ Bilder lokal) | Darstellungsprüfer | ☐ offen |
| Z-03 | Sprachen: alle UI-Texte in drei Sprachen aus messages, kein fester Text im Code, Bestandsübersetzungen übernommen, neue markiert | Schlüsselabgleich per Skript und Suchlauf | 100 % | `_lauf/belege/Z-03-sprachen.md` | Testläufer | ☐ offen |
| Z-04 | Verwaltung: 14 von 14 Modulen voll nutzbar; jede Änderung ohne Neustart öffentlich sichtbar | T4 je Modul | 100 % | `_lauf/belege/Z-04-verwaltung.md` | Testläufer, Probeläufer | ☐ offen |
| Z-05 | Formulare und E-Mails: 5 von 5 öffentlichen Formularen plus Tickets mit Erfolg, Fehler, Spam-Schutz, Ratenbegrenzung, Einwilligungsprotokoll und beiden E-Mails im Mail-Fänger | T4 | 100 % | `_lauf/belege/Z-05-formulare.md` | Testläufer | ☐ offen |
| Z-06 | Rechte und Sicherheit: jede Server Action mit Rollenprüfung, 2FA Pflicht, Sicherheits-Header gesetzt, audit ohne kritische/hohe Befunde, kein offener Befund „hoch“ aus Sicherheitsprüfung und unabhängiger Prüfung | T3, T9, Prüfberichte | 0 Lücken | `_lauf/belege/Z-06-sicherheit.md` | Sicherheitsprüfer, unabhängige Prüfung | ☐ offen |
| Z-07 | Datenschutz: nur eigene Herkunft bei allen Seitenaufrufen, nur nötige Cookies, Export, Löschung und Löschfristen funktionieren, Audit-Log vollständig | T8, T4 | 0 Verstöße | `_lauf/belege/Z-07-datenschutz.md` | Testläufer | ☐ offen |
| Z-08 | Barrierefreiheit: 0 axe-Verstöße über alle Kombinationen aus T5; Kernabläufe allein mit der Tastatur bedienbar | T5, T4 | 0 | `_lauf/belege/Z-08-barrierefreiheit.md` | Testläufer | ☐ offen |
| Z-09 | Leistung: K-12 auf allen sechs Messrouten erfüllt | T7 | alle Werte | `_lauf/belege/Z-09-leistung.md` (+ Lighthouse-Berichte) | Testläufer | ☐ offen |
| Z-10 | Codequalität: T1 bis T4 grün, Abdeckung src/lib ≥ 80 %, next build fehlerfrei | Testläufer | alles grün | `_lauf/belege/Z-10-code.md` | Testläufer | ☐ offen |
| Z-11 | Betrieb und Übergabe: docker compose läuft, Health-Check grün; README, BETRIEB.md, HANDBUCH-VERWALTUNG.md, LIZENZEN.md, .env.example vollständig | T9, Durchsicht | vollständig | `_lauf/belege/Z-11-betrieb.md` | Testläufer, Orchestrator | ☐ offen |
| Z-12 | Grenzen und offene Punkte: kein Deployment, keine Schreibzugriffe außerhalb web/ und _lauf/; Push nur nach E-004 (main, kein Force-Push); MENSCHEN.md vollständig (Hosting, Domain, E-Mail-Versand, Rechtstexte, Gebetszeiten-Quelle, Quran-Lizenzen, Logos, Löschfristen, Kontaktdaten, alle Platzhalter) | git log, Durchsicht | 0 Verstöße, vollständig | `_lauf/SCHLUSSBERICHT.md` | Orchestrator | ☐ offen |

Hinweis zu Z-12: Die Nutzerfestlegung E-004 („arbeite immer nur im Main und push immer alles“) ersetzt „kein Push“; geprüft wird stattdessen: nur `main`, kein Force-Push, keine umgeschriebene Geschichte, nur `web/` und `_lauf/` versioniert (E-009).
