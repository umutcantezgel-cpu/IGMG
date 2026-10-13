# ADR 0026 – Kontoarten, Gemeinde-Rollen, Gruppenrechte und Admin-Ausschluss für Chat-Inhalte

- Status: angenommen (umgesetzt 13.10.2026) (Lauf Gemeinde-Plattform) · Bezug: Plan „Gemeinde-Plattform“ §2.2, §3.5, §3.6 (S-01…S-18), §7 (Z-13, Z-14) · baut auf dem bestehenden Rechte-Modell auf (ADR 0003)

## Kontext

- Bestand: Die Verwaltung hat fünf Personal-Rollen (`rolle_zuweisung`, `darf()` in `src/lib/rechte/matrix.ts`). Es gibt keine Konten für Gemeinde, Eltern, Lehrkräfte oder Schüler, keine Gruppen und keinen Chat.
- Der Plan führt Schülerkonten mit Gruppen und einen moderierten Gruppen- und Elternkanal ein. Kinder unter 16 Jahren sind betroffen (Art. 8 und 9 DSGVO).
- Nach Bestand darf die Rolle Administration „alles“. Für Chat-Inhalte darf das nicht gelten (Kinderschutz).

## Entscheidung

**Verwaltungsebene**
- Neue Rollen: `leitung` (Cockpit, nur lesen), `religioese_pruefung` (Imam und Hoca: verfassen und freigeben), `kinderschutz` (Meldungen, Protokoll, Notfall-Pause).
- Rund 30 neue Aktionen, u. a. `gruppe.*`, `lernende.*`, `seite.*`, `menue.bearbeiten`, `quran.*`, `hadith.*`, `elifbe.*`, `rezitation.bearbeiten`, `religioes.freigeben`, `anzeige.*`, `hatim.*`, `newsletter.*`, `meldung.chat.*`, `chat.notfallpause`, `leitung.lesen`, `funktion.schalten`.
- Admin-Ausschluss (ADR 0026 im Plan): Chat-Inhalte sind nie über „Administration darf alles“ erreichbar. Umsetzung über die Ausschlussliste `NIE_PER_ADMINISTRATION` und einen Negativtest.
- S-11: Die Administration liest keine Chats. Die Rolle `kinderschutz` sieht nur den Meldekontext (± 10 Nachrichten), mit Protokoll.

**Gemeinde-Ebene**
- Neu: `gemeinde_rolle` mit `gemeinde`, `eltern`, `lehrkraft`, `schueler`.
- Prüfung über `verlangeKonto(rolle?)` in `src/lib/rechte/gemeinde.ts`.

**Gruppen-Ebene**
- Gruppenrollen: `gruppen_leitung` (lehrkraft oder aufsicht), `gruppen_mitglied`, `eltern_kind`.
- Reine Funktion `darfInGruppe()` und `verlangeGruppenRecht` in `src/lib/rechte/gruppen.ts`.
- Schüler sehen nur sich selbst, Eltern nur ihr Kind, Lehrkräfte nur die eigene Gruppe.
- Ein Kanal ist nur mit mindestens zwei Erwachsenen aktiv (S-02). Gruppen brauchen mindestens zwei Erwachsene (Bildung).

**Sitzung und zweiter Faktor** (absolut ab `session.createdAt` in `ladeAngemeldet`, `src/lib/rechte/pruefe.ts`):

| Konto | Zweiter Faktor | Sitzung |
|---|---|---|
| Verwaltung | TOTP Pflicht | 8 h |
| Lehrkraft | TOTP Pflicht | 12 h |
| Eltern | Opt-in | 30 Tage |
| Gemeinde, Schüler ab 16 | optional | 30 Tage |
| Kind unter 16 | – | 12 h, Eltern setzen zurück |

**Kinderkonten ohne E-Mail**
- Better-Auth-Plugin `username`.
- Synthetische Adresse `k-<zufall>@konto.invalid`. Der Mail-Ausgang weist `.invalid` hart ab (Test).
- Anmeldung nur über eine Server Action, mit Rate je Konto und je IP.

**Registrierung**
- Gemeinde: selbst, mit ALTCHA und Honigtopf (`pruefeEinsendung` aus `src/lib/formulare/verarbeiten.ts`) und E-Mail-Bestätigung.
- Eltern: Einladung aus der Aufnahme einer Voranmeldung.
- Lehrkraft und Schüler ab 16: bestehendes Einladungssystem, erweitert um `gemeindeRollen`.

**Einwilligungen** (Prüfung MN-11)
- Getrennt und einzeln widerrufbar: Lernplattform, Kinderkonto, Gruppenchat, Push für das Kind. Der Widerruf wirkt sofort (S-03).
- Jede Einwilligung mit Textversion (SHA-256), Zeit und erteilender Person.
- Zusatzhaken „sorgeberechtigt, im Einvernehmen“.
- Am 16. Geburtstag holt das Konto binnen 30 Tagen eine eigene Einwilligung ein (Cron `loeschfristen` erweitert).

## Alternativen

- Administration darf Chat-Inhalte lesen: verworfen (S-11, Kinderschutz).
- Kinder mit eigener E-Mail-Adresse: verworfen. Der Plan setzt auf Benutzername und synthetische Adresse.
- Direktnachrichten oder eigene Gruppen im Kinderchat: ausgeschlossen (S-01, „bewusst abgelehnt“).
- Ein gemeinsames Konto für Eltern und Kind: nicht vorgesehen. Der Plan trennt Eltern- und Schülerkonten.
- Eigenes Einladungssystem für Lehrkräfte und Schüler: nicht gewählt. Das bestehende System wird erweitert.

## Folgen

- Schema: `gemeinde_rolle`, `konto_profil`, `konto_einwilligung`; Lernen: `lernende`, `eltern_kind`, `gruppe`, `gruppen_leitung`, `gruppen_mitglied`; Chat: `chat_kanal`, `chat_nachricht` (verschlüsselt), `chat_meldung`, `moderationsprotokoll` (mit Hash-Kette).
- Tests: generierte Gruppen-Matrix; Negativtest für den Admin-Ausschluss; Sitzungsgrenzen; Alter und Einwilligung am 16. Geburtstag; `.invalid`-Mail; Gruppenisolation.
- Z-13: 100 % generierte Matrix einschließlich Gruppen; 0 offene hohe oder kritische Befunde aus S1 bis S3.
- Die neuen Rollen `leitung`, `religioese_pruefung` und `kinderschutz` brauchen eine Zuweisung. Das Imam-Konto mit 2FA ist MN-20.
- Das Daten- und Rechtemodell ist ausdrücklich erweiterbar (Plan §0, Punkt 3).
