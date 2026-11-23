# ADR 0052: Vorführung mit Testzugang und eingebauter Datenbank

Datum: 23.11.2026 · Status: angenommen · Bezug: ADR 0017 (Bau mit PGlite), ADR 0019 (Beispielmodus ohne Datenbank),
ADR 0026 (Konten), ADR 0035 (Funktionsschalter), ADR 0051 (Rundgang)

## Anlass

Die Testadresse läuft auf Vercel ohne Datenbank. Der Rundgang mit Aufnahmen (ADR 0051) genügt dem Nutzer nicht: „Mach's
doch direkt live. Gib ein einfaches Login, dass man das eintragen kann und sich dann direkt einloggen kann. Das muss nicht
secure sein, das geht ja noch nicht auf die Live-Domain. Es muss einfach nur zugänglich sein, damit die Leute da drauf
gehen können, sich da alles angucken können.“ Eine Datenbank in Vercel einrichten will und soll er dafür nicht.

## Entscheidung

1. **Kennzeichen `VORFUEHRUNG`.** `scripts/vercel-bau.mjs` setzt es im Bau ohne `DATABASE_URL`; `next.config.ts` schreibt es
   fest in den Bau (`env`), weil sich auf Vercel zur Laufzeit nichts setzen lässt, ohne dass ein Mensch es einträgt.
   `vorfuehrung()` (`src/lib/vorfuehrung/modus.ts`) gilt nur ohne `DATABASE_URL` zur Laufzeit: **Eine echte Datenbank
   bekommt nie den Testzugang.** Mit dem Anschluss der Datenbank (Bau mit `DATABASE_URL`) endet die Vorführung von selbst.
2. **Eingebaute Datenbank.** Der Bau legt die Bau-Datenbank (ADR 0017: Migrationen, Seeds, Inhalte, Lern-App) samt
   Beispielkonten als Schnappschuss nach `.vorfuehrung/` (jede Datei einzeln gzip-gepackt, rund 100 MB) und nimmt ihn in
   jede Funktion mit (`outputFileTracingIncludes`). Beim ersten Datenzugriff entpackt eine Instanz ihn nach `/tmp` und
   öffnet ihn mit PGlite (gemessen: rund 2 s). `datenbankVerfuegbar()` ist dann wahr; die Anwendung verhält sich wie mit
   Datenbank.
3. **Änderungen bleiben nicht.** Jede Instanz hat ihre eigene Kopie. Was jemand ändert, sieht er, solange seine Anfragen
   dieselbe Instanz treffen; mit der Instanz ist es weg, und andere Instanzen haben es nie gesehen. Das steht als Band über
   der Verwaltung und über „Mein Bereich“ und auf der Anmeldeseite. Die öffentlichen Seiten bleiben auf dem Stand des Baus
   (Cache-Profile „dauerhaft“, ADR 0019).
4. **Ein Login-Fenster, je Benutzername eigener Bereich und eigene Rechte.** `/verwaltung/anmelden` zeigt Benutzername,
   Passwort und „Anmelden“ (`TestZugang.tsx`), daneben die Liste der Benutzernamen mit dem, was sie sehen und dürfen, und je
   einem Knopf zum direkten Anmelden; das Passwort ist für alle gleich und steht dabei. Neun Benutzernamen
   (`src/lib/vorfuehrung/konten.ts`): sechs Rollen der Verwaltung – `admin` (alles), `redaktion`, `bildung`, `vorstand`
   (Leitung, liest), `imam` (religiöse Prüfung), `mitglieder` (Mitgliederverwaltung) – und drei Kontoarten in „Mein
   Bereich“: `lehrkraft`, `eltern`, `kind`. Die Sitzung ist ein Cookie mit dem Schlüssel des Zugangs (`igmg-vorfuehrung`),
   kein Eintrag in der Datenbank (sonst gälte sie in der nächsten Instanz nicht). `holeSitzung()`
   (`src/lib/auth/sitzung.ts`) ist die eine Stelle, an der die Sitzung gelesen wird; in der Vorführung liefert sie das Konto
   des Zugangs mit erfülltem zweitem Faktor. Rollen und Rechte prüft danach unverändert `src/lib/rechte` – deshalb sieht
   jede Rolle nur ihre Module (Menü von 35 bis 7 Punkten) und wird auf fremden Seiten abgewiesen. Wer angemeldet ist, sieht
   das auf der Anmeldeseite und kann dort den Benutzer wechseln oder sich abmelden. Der Testzugang schützt nichts und soll
   nichts schützen: Die Vorführung enthält nur Beispieldaten.
   _Erste Fassung am selben Tag:_ vier Karten (Verwaltung, Eltern, Lehrkraft, Kind) mit einem einzigen Verwaltungskonto.
   Rückmeldung des Nutzers: „Ein Login-Fenster, mit je Benutzernamen bekommt man ein anderes Dashboard und Nutzungsrechte.“
   Außerdem kam, wer als Verwaltung angemeldet war, nicht mehr zur Anmeldeseite zurück. Der frühere Benutzername
   `verwaltung` gilt weiter als `admin`.
   _Zweite Rückmeldung:_ „Bei denen unter dem Anmeldeformular passiert nichts, wenn man auf Anmelden drückt.“ In
   Chromium ließ sich das nicht nachstellen (alle Knöpfe wirkten, mit und ohne JavaScript). Die Knöpfe waren Formulare mit
   Server Action; die Antwort einer Server Action bringt die Zielseite gleich mit – auf einer frischen Instanz lädt dabei
   erst die Datenbank, und so lange zeigt der Browser nichts. Seitdem die einfachste Technik: ein gewöhnliches Formular
   (POST) und gewöhnliche Links (GET `?als=<benutzername>`) auf `/api/vorfuehrung/anmelden`, Abmelden als Link auf
   `/api/vorfuehrung/abmelden`. Die Routen brauchen keine Datenbank, antworten sofort mit 303 und relativem Ziel, und der
   Browser zeigt den Seitenwechsel. Die Anmeldeseite kommt ganz ohne Client-JavaScript aus. Anmelden per Link ist hier
   vertretbar, weil Benutzernamen und Passwort ohnehin offen auf der Seite stehen.
5. **Konten des Testzugangs.** `scripts/beispielkonten.ts` (Eltern, Lehrkraft, Aufsicht, drei Kinder, Beispielgruppe mit
   Terminen, Anwesenheit, Fortschritt und Chat) und `scripts/vorfuehrung-vorbereiten.ts` (sechs Verwaltungskonten mit genau
   den Rollen ihres Zugangs; `admin` trägt zusätzlich die Schutzrollen, damit ein Zugang jeden Bereich zeigt).
6. **Schalter.** In der Vorführung sind zusätzlich an: Konten, Lernplattform, Chat, Hatim, Newsletter und der Abgleich der
   Lern-App mit Gruppen und Bestenliste (`IN_VORFUEHRUNG_AN`) – derselbe Satz wie im E2E-Lauf. Echtzeit und Push bleiben
   aus (fremde Dienste, eigene Schlüssel).
7. **Geheimnisse.** Fehlen `EINGANG_SCHLUESSEL` und `RATE_GEHEIMNIS`, gilt in der Vorführung ein fester, öffentlicher
   Schlüssel (Bau und Laufzeit brauchen denselben); `BETTER_AUTH_SECRET` darf fehlen (Better Auth führt dort keine
   Sitzungen).
8. **Rundgang auf eigener Adresse.** `/verwaltung/rundgang` zeigt die Aufnahmen (ADR 0051) zum Ansehen ohne Anmeldung; die
   Anmeldeseite verweist darauf. „Anmelden“ im Kopf der Website und der Lern-App führt in der Vorführung direkt zum
   Testzugang.

## Grenzen

- Was Post, Speicher oder fremde Dienste braucht, läuft nicht: Mails (Einladung, Bestätigung, Passwort), Hochladen von
  Medien, Push, Echtzeit. Registrieren und „Passwort vergessen“ sind zu sehen, führen aber nicht zum Ziel.
- Mehrere Instanzen sehen die Änderungen der anderen nicht (Nr. 3). Für eine Vorstellung genügt das; für den Betrieb nicht.
- Erster Zugriff einer Instanz: rund 2 s zusätzlich und bis zu einigen hundert MB Arbeitsspeicher.
- Die Bau-Protokolle zeigen die zufälligen Passwörter der Beispielkonten – ohne Belang, der Testzugang öffnet dieselben
  Konten ohne Passwort.

## Vor dem echten Betrieb

Nichts zurückbauen: Mit `DATABASE_URL` im Vercel-Projekt (`docs/deploy/VERCEL.md`) baut `scripts/vercel-bau.mjs` gegen
die Datenbank, das Kennzeichen fehlt, und Anmeldung, Schalter und Geheimnisse gelten wie zuvor. Wer die Vorführung nicht
mehr braucht, entfernt `src/lib/vorfuehrung/`, `src/components/vorfuehrung/`, `scripts/vorfuehrung-vorbereiten.ts` und die
Stellen, die `vorfuehrung()` lesen.

## Prüfung

- `tests/unit/vorfuehrung.test.ts`: Kennzeichen (nie mit `DATABASE_URL`), Testzugänge, Schalter, Schnappschuss packen und
  entpacken, Pfade außerhalb des Ziels. `tests/unit/vorfuehrung-anmelden.test.ts`: die Aktion setzt außerhalb der
  Vorführung und mit `DATABASE_URL` kein Cookie.
- Unit 4217 Tests und Integration 4041 Tests grün (Integration: die Anmeldung mit Better Auth über `holeSitzung()`).
- Lokal wie auf Vercel gebaut (ohne `.env`, `VERCEL=1`, ohne Datenbank, 2505 Seiten) und ohne Datenbank und Geheimnisse
  gestartet: zwei Klick-Durchläufe ohne Befund, Fehlerprotokoll leer; erster Datenzugriff rund 1,5 s, der ganze Server
  0,7–1,2 GB Arbeitsspeicher.
- **Auf der Testadresse (23.11.2026, Bau 5c1c6bd):** falsches Passwort mit Hinweis; Anmeldung von Hand als Verwaltung;
  40 Seiten der Verwaltung; Nachricht bearbeiten; Abmelden; Eltern, Lehrkraft und Kind in „Mein Bereich“ und im Unterricht;
  öffentliche Seiten und Rundgang – alles mit Status 200 und Überschrift, kein Seitenfehler. Ohne Anmeldung führen
  `/verwaltung/…` und `/mein-bereich` zum Testzugang. Warme Seiten 0,6–1,3 s; der erste Zugriff einer frischen Instanz
  dauerte einmal 4 s, einmal 7 s und einmal 24 s (Unterricht › Lern-App).
