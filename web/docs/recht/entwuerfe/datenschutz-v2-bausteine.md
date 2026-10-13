# Datenschutzerklärung Version 2: Bausteine für Konten, Lernplattform, Chat, Push und mehr

> **ENTWURF – vor Veröffentlichung durch Datenschutz/Recht prüfen (MENSCHEN MN-11).** Nicht veröffentlicht, nicht in die Seeds (`web/drizzle/seeds/bereiche/rechtliches.ts`) und nicht in die Seite eingebaut. Dies ist keine Rechtsberatung. Der Wortlaut der bestehenden, veröffentlichten Rechtstexte bleibt unverändert (KERN 3.0, „Unantastbar“); diese Bausteine **ergänzen** sie und ersetzen sie erst nach der Freigabe durch die Gemeinde. Alles in eckigen Klammern `[ ]` ist offen. `[prüfen]` heißt: nicht belegt oder rechtlich zu bewerten.

Stand: 13.10.2026 · Bezug: AUFTRAG §2.2, §2.5, §2.7, §2.9, §3.5, §3.6, §5 · Stand des Codes: Branch `claude/trusting-lovelace-6nfolz`, Commit `bb8433d`.

## 0. Wie diese Datei zu lesen ist

- Jeder Baustein hat zwei Teile: **Text (Vorschlag)** steht so da, wie er in der Datenschutzerklärung erscheinen könnte (Anrede „Sie“; eine kindgerechte Fassung steht in Baustein 13). **Hinweise für die Prüfung** sind nicht zur Veröffentlichung bestimmt: Belege im Code, Annahmen, offene Rechtsfragen.
- Die Bausteine gelten erst, wenn der jeweilige Bereich eingeschaltet wird. Die Funktionsschalter (ADR 0035) sind in der Produktion aus: `konten`, `lernplattform`, `chat`, `echtzeit`, `push`, `push_gebet`, `newsletter`, `hatim`. **Ein Baustein wird erst mit dem Einschalten seines Schalters veröffentlicht.** Bis dahin bleibt Version 1 gültig.
- Zuordnung zu den bestehenden Abschnitten der Datenschutzerklärung Version 1 (Seed „datenschutz“): `daten` → Bausteine 2 bis 11; `zweck` → je Baustein „Zweck und Rechtsgrundlage“; `speicherung` → je Baustein „Speicherdauer“ (Gesamtübersicht: `loeschkonzept.md`); `sicherheit` → Baustein 1 und je Baustein „Schutz“; `empfaenger` → je Baustein „Empfänger“; `browser` → Baustein 12; `rechte` → Baustein 1.
- Das Hosting (Vercel, Neon, Blob) steht im Baustein `datenschutz-hosting-v2.md` (bereits als Entwurf vorhanden, unverändert).
- Gemeinsame Platzhalter: Verantwortlicher = **[Name und Rechtsform – Vorstand], [Anschrift], [E-Mail-Adresse], [Telefonnummer]**; Datenschutzbeauftragte/r = **[Datenschutzbeauftragte/r – Angaben von der Gemeinde]**; Aufsichtsbehörde = **[Aufsichtsbehörde – prüfen: voraussichtlich der Hessische Beauftragte für Datenschutz und Informationsfreiheit; bei einer Religionsgemeinschaft ist zu klären, ob eigene Regeln nach Art. 91 DSGVO gelten]**.

## 1. Allgemeine Angaben (Ergänzung zu Version 1)

### Text (Vorschlag)

**Verantwortlich** für die in diesen Abschnitten beschriebenen Verarbeitungen ist [Name und Rechtsform – Vorstand], [Anschrift], [E-Mail-Adresse]. Unsere Datenschutzbeauftragte bzw. unseren Datenschutzbeauftragten erreichen Sie unter [Datenschutzbeauftragte/r – Angaben von der Gemeinde].

**Ihre Rechte.** Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Mitteilung an Empfänger (Art. 19), Datenübertragbarkeit (Art. 20) und Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21). Eine erteilte Einwilligung können Sie **jederzeit mit Wirkung für die Zukunft widerrufen** (Art. 7 Abs. 3). Der Widerruf ist so einfach wie die Einwilligung: in „Mein Bereich“ unter den Einwilligungen oder durch eine Nachricht an uns. Die Rechtmäßigkeit der Verarbeitung bis zum Widerruf bleibt unberührt.

In „Mein Bereich“ können Sie Ihre Daten als Datei abrufen (Auskunft und Übertragbarkeit) und die Löschung Ihres Kontos beantragen. Sie können sich bei der Aufsichtsbehörde beschweren: [Aufsichtsbehörde – Name und Anschrift].

**Keine Tracker, keine Werbung, keine Profilbildung.** Diese Website setzt keine Analyse-, Mess- oder Werbedienste ein und lädt keine Inhalte von Dritten nach (Ausnahme: die Karte nach Klick, siehe Version 1). Es gibt keine automatisierten Entscheidungen im Sinne von Art. 22 DSGVO.

**Schutz.** Schutzbedürftige Angaben (Namen, Geburtsdaten und Anschriften von Lernenden, Chat-Nachrichten, Notizen) speichern wir nur verschlüsselt (AES-256-GCM). Wer was sehen darf, regeln Rollen und Gruppenrechte, die der Server bei jedem Zugriff prüft. Verwaltungs- und Lehrkraft-Konten sind durch einen zweiten Faktor geschützt.

### Hinweise für die Prüfung

- Belege: `web/src/lib/krypto/index.ts` (AES-256-GCM, Schlüssel aus `EINGANG_SCHLUESSEL`); `web/src/lib/rechte/{matrix,gruppen,gemeinde}.ts`; `web/src/lib/auth/optionen.ts` (`twoFactor`, `telemetry: false`, keine IP-Adressen in Sitzungen).
- „Datenexport und Löschantrag in Mein Bereich“ ist laut AUFTRAG §3.5 vorgesehen; der Löschantrag besteht im Konten-Paket (`meinBereich.konto.loeschen`, 30 Tage). Der Export war beim Schreiben dieses Entwurfs noch nicht belegt `[prüfen: Code]`.
- Datenschutzbeauftragte/r: `[prüfen: Benennungspflicht nach § 38 BDSG (in der Regel mindestens 20 Personen mit ständiger automatisierter Verarbeitung; ehrenamtlich Tätige können mitzählen)]`.

## 2. Konten: Gemeinde, Eltern, Lehrkräfte, Schüler

### Text (Vorschlag)

**Wofür.** Mit einem Konto können Sie „Mein Bereich“ nutzen: Lesezeichen, Benachrichtigungen, bei Eltern die Daten ihrer Kinder, bei Lehrkräften den Unterricht, bei Schülerinnen und Schülern den Lernweg.

**Kontoarten.** Gemeinde (selbst registriert), Eltern (per Einladung nach der Aufnahme einer Voranmeldung), Lehrkraft (per Einladung), Schüler ab 16 Jahren (per Einladung) und Kinder unter 16 Jahren (ein Zugang, den die Eltern anlegen).

**Welche Daten.**

- Alle Konten: Name bzw. Anzeigename, Passwort (nur als nicht umkehrbarer Hash), Sprache, Kontoart und Rollen, Zeitpunkt der Anmeldung und Kennung des Browsers der Sitzung. Wir speichern **keine IP-Adressen** in Sitzungen und Zählern. Zum Schutz vor Missbrauch (zu viele Anmeldeversuche) verwenden wir nur einen nicht umkehrbaren Prüfwert.
- Gemeinde, Eltern, Lehrkräfte, Schüler ab 16: E-Mail-Adresse. Sie wird bestätigt (E-Mail mit Link), bevor das Konto freigeschaltet wird.
- Wenn Sie einen zweiten Faktor einrichten: das Geheimnis für Ihre Authentifizierungs-App und Ersatzcodes (verschlüsselt bzw. als Hash gespeichert) `[prüfen: Speicherform laut Better Auth]`.
- **Kinderzugänge** haben keine echte E-Mail-Adresse. Sie bestehen aus einem Benutzernamen und einem Passwort. Intern vergibt das System eine nie zustellbare Adresse (`k-…@konto.invalid`); an sie wird nie eine E-Mail gesendet.
- Im Chat erscheint jede Person nur mit Vorname und dem Anfangsbuchstaben des Nachnamens („Ayşe K.“).

**Zweck und Rechtsgrundlage.** Bereitstellung des Kontos und seiner Funktionen: Art. 6 Abs. 1 lit. b DSGVO (Nutzungsvertrag nach den Nutzungsbedingungen). Sicherheit des Systems (Anmeldebegrenzung, Sitzungsgrenzen, Protokollierung von Verwaltungszugriffen): Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem sicheren Betrieb). Lehrkräfte und Ehrenamtliche in der Verwaltung: [Rechtsgrundlage – prüfen: Art. 6 Abs. 1 lit. b oder f; § 26 BDSG gilt nur für Beschäftigte, nicht für Ehrenamtliche].

**Anmeldung und Sitzungen.** Eine Sitzung endet **absolut** nach einer Höchstdauer ab der Anmeldung, auch wenn Sie aktiv sind:

| Kontoart | Zweiter Faktor | Sitzung endet nach |
| --- | --- | --- |
| Verwaltung | Pflicht | 8 Stunden |
| Lehrkraft | Pflicht | 12 Stunden |
| Eltern | freiwillig | 30 Tagen |
| Gemeinde, Schüler ab 16 | freiwillig | 30 Tagen |
| Kind unter 16 | nicht vorgesehen | 12 Stunden; die Eltern können den Zugang zurücksetzen |

Wird ein Konto gesperrt, enden alle Sitzungen sofort.

**Cookies.** Im Anmeldebereich und in „Mein Bereich“ setzen wir technisch notwendige Cookies (Sitzung, Zwei-Faktor-Schritt; Namen mit dem Präfix `igmg`). Auf den öffentlichen Seiten setzen wir keine Cookies. Rechtsgrundlage: § 25 Abs. 2 Nr. 2 TDDDG (unbedingt erforderlich, damit wir den von Ihnen gewünschten Dienst erbringen) in Verbindung mit Art. 6 Abs. 1 lit. b und f DSGVO.

**Empfänger.** Technische Dienstleister, die wir als Auftragsverarbeiter einsetzen (Hosting, Datenbank, E-Mail-Versand; siehe Baustein Hosting und [SMTP-Anbieter – Angaben von der Gemeinde]). Keine Weitergabe an Dritte zu eigenen Zwecken.

**Speicherdauer.** Das Konto besteht, bis es gelöscht wird. Sie können die Löschung jederzeit beantragen; wir löschen **innerhalb von 30 Tagen**. Kinderzugänge löschen die Eltern über die Gemeinde. Ein Konto wird außerdem gelöscht, wenn [Regel für nicht genutzte Konten – Vorstand/DSB: Vorschlag 24 Monate ohne Anmeldung nach vorheriger E-Mail]. Einladungen werden 30 Tage nach Annahme, Widerruf oder Ablauf gelöscht, abgelaufene Passwort-Links sofort. Sitzungen enden nach den Grenzen oben.

**Pflicht zur Bereitstellung.** Die Registrierung ist freiwillig. Ohne Konto können Sie alle öffentlichen Seiten nutzen, aber nicht „Mein Bereich“.

### Hinweise für die Prüfung

- Belege: `web/src/lib/rechte/sitzung.ts` (8 h / 12 h / 12 h / 30 Tage, absolut ab `session.createdAt`); `web/src/lib/auth/optionen.ts` (Passwort mindestens 12 Zeichen; `ipAddress.disableIpTracking`; Plugin `username`; `twoFactor` mit 10 Ersatzcodes); `web/src/lib/db/schema/{auth,konten}.ts`; Löschfrist 30 Tage: `messages/bereiche/mein-bereich.json` (`meinBereich.konto.loeschen`); `web/src/lib/eingaenge/loeschlauf.ts` (Einladungen, Verifikationen).
- `session.userAgent` wird gespeichert (Spalte vorhanden). Wenn das nicht gewollt ist: Entscheidung Technik/DSB.
- Die **Löschung nach Löschantrag** hat in `konto_profil.loeschenAb` ein Feld, im Löschlauf dieses Standes aber noch keinen Code `[prüfen: Konten-Paket; vor Einschalten von `konten` belegen]`.
- § 25 TDDDG: Das Gesetz hieß bis Mai 2024 TTDSG. Die Einordnung „unbedingt erforderlich“ ist für die Sitzungscookies tragfähig; für Komfortspeicher siehe Baustein 12.

## 3. Lernplattform (Gruppen, Anwesenheit, Fortschritt, Hifz)

### Text (Vorschlag)

**Wofür.** Die Lernplattform unterstützt die Moscheekurse der Gemeinde: Gruppen mit Terminen, Anwesenheit, Lernfortschritt, Hifz-Prüfungen, Mitteilungen an Eltern.

**Wessen Daten.** Kinder und Jugendliche, die an Kursen teilnehmen („Lernende“), ihre Eltern bzw. Sorgeberechtigten, Lehrkräfte und Aufsichtspersonen.

**Welche Daten.**

- Lernende: Vorname, Nachname, Geburtsdatum und Anschrift (**verschlüsselt**, aus der Voranmeldung übernommen); im Klartext nur der Anzeigename (Vorname und Anfangsbuchstabe) und der Tag, an dem die Person 16 wird (für die Einwilligungsregeln). Status (aktiv, pausiert, beendet), Gruppenzugehörigkeit mit Datum.
- Eltern: Zuordnung zum Kind, Bestätigung der Sorgeberechtigung.
- Unterricht: Termine, **Anwesenheit** je Termin (anwesend, fehlt, entschuldigt, verspätet), optionale kurze Notiz der Lehrkraft (verschlüsselt), **Fehlmeldungen** der Eltern (Datum und Grund: krank, Familie, Schule, sonstiges).
- **Lernfortschritt** je Stufe des Lehrplans (begonnen, sicher, abgeschlossen) und **Hifz-Einträge** (Abschnitt, Bewertung 1 bis 5, Datum, Lehrkraft). Es gibt keine Ranglisten und keinen Punktevergleich.
- Hausaufgaben und Urkunden, soweit die Gemeinde sie nutzt `[prüfen: Kür K-B, noch nicht eingeschaltet]`.

**Besondere Kategorien.** Die Teilnahme an religiöser Bildung, Fortschritt und Hifz-Prüfungen können Rückschlüsse auf die religiöse Überzeugung zulassen (Art. 9 Abs. 1 DSGVO). Wir behandeln diese Angaben deshalb als besondere Kategorien.

**Zweck und Rechtsgrundlage.**

- Durchführung der Kurse (Anmeldung, Gruppen, Termine, Anwesenheit): Art. 6 Abs. 1 lit. b DSGVO (Vereinbarung über die Teilnahme mit den Sorgeberechtigten; vorvertragliche Maßnahmen bei der Voranmeldung).
- Nutzung der Lernplattform mit Konto, Fortschritt und Hifz: **ausdrückliche Einwilligung** der Sorgeberechtigten bzw. der Lernenden ab 16 Jahren, Art. 6 Abs. 1 lit. a und Art. 9 Abs. 2 lit. a DSGVO.
- Ergänzend: Art. 9 Abs. 2 lit. d DSGVO (Verarbeitung durch eine religiös ausgerichtete Vereinigung im Rahmen ihrer rechtmäßigen Tätigkeit für Mitglieder und Personen mit regelmäßigem Kontakt, ohne Weitergabe nach außen) `[prüfen: Rechtsberatung; lit. d trägt nur, wenn die Voraussetzungen für alle Teilnehmenden erfüllt sind – deshalb bleibt die Einwilligung der Weg]`.
- Schutz der Kinder (Moderation, Meldungen): Art. 6 Abs. 1 lit. f DSGVO, siehe Baustein 4.

**Kinder (Art. 8 DSGVO).** Für Kinder unter 16 Jahren erteilen die Sorgeberechtigten die Einwilligung. Wir bitten darum, dass die Person, die einwilligt, dies im Einvernehmen mit der zweiten sorgeberechtigten Person tut, und lassen sie das ausdrücklich bestätigen. Die Einwilligungen sind **getrennt** und einzeln widerrufbar: Lernplattform, Kinderkonto, Gruppenchat, Push für das Kind. Die Teilnahme am Unterricht hängt **nicht** davon ab, ob die Plattform oder der Chat genutzt werden. Mit dem 16. Geburtstag holt das System eine eigene Einwilligung der Jugendlichen ein; sie hat dafür 30 Tage Zeit.

**Wer sieht was.** Schülerinnen und Schüler sehen nur sich selbst. Eltern sehen nur ihr Kind. Lehrkräfte sehen die Lernenden ihrer eigenen Gruppen; Fortschritt und Hifz tragen nur Lehrkräfte ein (nicht Aufsichtspersonen). Die Bildungsverwaltung der Gemeinde sieht die Stammdaten, um Gruppen zu bilden. Auswertungen für den Vorstand („Gemeinde im Blick“) enthalten nur Zahlen ohne Personenbezug; Werte unter 5 werden als „< 5“ gezeigt.

**Empfänger.** Lehrkräfte der Gruppe, Eltern des Kindes, Bildungsverwaltung; Auftragsverarbeiter wie in Baustein 2. Keine Weitergabe an Dritte. [Weitergabe an das Jugendamt oder andere Stellen nur bei Gefährdung des Kindeswohls und nach den gesetzlichen Vorgaben – prüfen, siehe Schutzkonzept.]

**Speicherdauer.** Stammdaten, Anwesenheit, Fortschritt und Hifz-Einträge löschen wir **[Frist – Vorstand/DSB: Vorschlag 12 Monate nach dem Austritt aus allen Gruppen]**; auf Wunsch der Eltern früher. Fehlmeldungen: [Frist – Vorschlag: bis zum Ende des Schuljahres plus 3 Monate]. Siehe Löschkonzept.

### Hinweise für die Prüfung

- Belege: `web/src/lib/db/schema/{lernen,konten}.ts`; `web/src/lib/lernen/dienst.ts`; Rechte: `web/src/lib/rechte/gruppen.ts` (Test `web/tests/unit/rechte/gruppen.test.ts`); Einwilligungsarten: `konto_einwilligung_art` (`lernplattform`, `kinderkonto`, `gruppenchat`, `push_kind`, `push`, `newsletter`, `personenfotos`, `chat_regeln`).
- Art. 8 DSGVO: Das Mindestalter für die Einwilligung in Dienste der Informationsgesellschaft ist in Deutschland 16 Jahre (keine Absenkung). Ob die Lernplattform ein „Dienst der Informationsgesellschaft“ im Sinn von Art. 8 ist, ist für die Teilnahme am Unterricht nicht entscheidend; die Gemeinde verfährt vorsorglich nach Art. 8.
- Art. 8 Abs. 2: angemessene Anstrengungen zur Überprüfung der Sorgeberechtigung. Das System lädt Eltern per Einladung aus der Voranmeldung ein; das Einvernehmen mit der zweiten sorgeberechtigten Person ist eine **Bestätigung per Haken**, kein Nachweis `[prüfen: ausreichend?]`.
- **Offener Befund:** Das Lesen im Gruppenkanal bleibt nach einem Widerruf der Chat-Einwilligung technisch erlaubt (nur das Schreiben wird gesperrt, Test `S-03`). Das ist als Entscheidung festzulegen (DSFA, Entscheidung D-01).

## 4. Gruppenchat und Elternkanal

### Text (Vorschlag)

**Was ist das.** Ein moderierter Textchat je Lerngruppe mit zwei Kanälen: dem **Gruppenkanal** (Lernende und Lehrkräfte) und dem **Elternkanal** (Eltern und Lehrkräfte). Es gibt keine Direktnachrichten, keine selbst angelegten Gruppen, keine Bilder und keine Dateien. Nachrichten bestehen nur aus Text bis 500 Zeichen; Links bleiben reiner Text.

**Wer darf mitmachen.** Kinder ab 10 Jahren; die Gruppe kann ein höheres Mindestalter festlegen. Kinder unter 16 Jahren nur mit Einwilligung der Sorgeberechtigten. Vor der ersten Nachricht bestätigen Lernende und Eltern die Chat-Regeln (für Kinder in kindgerechter Sprache); die Lehrkräfte sind an die Regeln des Verhaltenskodex gebunden. Ein Kanal ist nur aktiv, wenn die Gruppe **mindestens zwei erwachsene Leitungspersonen** hat.

**Öffnungszeiten und Grenzen.** Standardmäßig ist der Chat täglich von 08:00 bis 20:00 Uhr offen; außerhalb dieser Zeiten kann nur gelesen werden. Je Person sind höchstens 10 Nachrichten pro Minute und 200 pro Tag möglich. Es gibt keine Lesebestätigungen und keine Anzeige, wer gerade online ist.

**Mitlesen und Moderation.** Die Lehrkräfte und Aufsichtspersonen der Gruppe lesen im Gruppenkanal mit und moderieren: Nachrichten entfernen, Personen stummschalten, den Kanal pausieren, Personen aus der Gruppe nehmen. Jede dieser Maßnahmen erfordert einen Grund und wird in einem **unveränderlichen Moderationsprotokoll** festgehalten (jede Zeile ist mit der vorherigen verkettet; eine nachträgliche Änderung fiele auf). Die Rolle „Kinderschutz“ der Gemeinde kann außerdem alle Chats sofort pausieren (Notfall-Pause).

**Melden.** Jede Person kann eine Nachricht in zwei Schritten melden. Dabei sichern wir die gemeldete Nachricht und bis zu zehn Nachrichten davor und danach **verschlüsselt** als Kontext. Gruppenleitung und die Rolle „Kinderschutz“ erhalten eine E-Mail **ohne Inhalt** und können den Kontext einsehen; jede Einsicht wird protokolliert.

**Wer kann nichts lesen.** Die Administration der Website, der Vorstand und die Technik lesen keine Chats im Rahmen ihrer Rolle. Das System verwehrt der Rolle „Administration“ den Zugriff auf Chat-Inhalte und Meldungen ausdrücklich.

**Verschlüsselung.** Der Text jeder Nachricht wird verschlüsselt gespeichert (AES-256-GCM); der Schlüssel liegt nicht in der Datenbank. Die Übertragung ist durch TLS geschützt. Das ist **keine Ende-zu-Ende-Verschlüsselung**: Die Anwendung entschlüsselt die Nachrichten, um sie den berechtigten Personen anzuzeigen.

**Benachrichtigungen.** Weder E-Mails noch Push-Nachrichten enthalten Chat-Inhalte oder Namen. Sie sagen höchstens, dass es etwas Neues gibt.

**Abruf und Echtzeit.** Ihr Browser fragt in Abständen nach neuen Nachrichten (nach Aktivität alle 4 Sekunden, danach seltener; nicht bei verborgenem Tab und nicht außerhalb der Öffnungszeiten). Optional meldet ein Server im Gemeindehaus nur „Kanal hat Neues“; Inhalte berühren ihn nie.

**Zweck und Rechtsgrundlage.** Kommunikation in der Gruppe: Einwilligung, Art. 6 Abs. 1 lit. a DSGVO (bei Kindern unter 16 Jahren durch die Sorgeberechtigten). Moderation, Meldungen und Protokoll zum Schutz der Kinder und zur Abwehr von Missbrauch: Art. 6 Abs. 1 lit. f DSGVO [Interessenabwägung: durch die Rechtsberatung zu bestätigen].

**Speicherdauer.** Nachrichten werden **90 Tage nach dem Senden** gelöscht, spätestens **30 Tage nach dem Ende der Gruppe**. Gemeldete Kontexte und Meldungen löschen wir **ein Jahr nach Abschluss** der Bearbeitung. Das Moderationsprotokoll enthält nur Zeitpunkt, Maßnahme, Kennungen und Begründung, keine Chat-Texte; Aufbewahrung: [Frist – Vorstand/DSB: Vorschlag 3 Jahre]. Entfernte Nachrichten sind für die Teilnehmenden nicht mehr sichtbar.

### Hinweise für die Prüfung

- Belege je Aussage: `web/src/lib/chat/regeln.ts` (500 Zeichen, 10/200 Nachrichten, 90/30/365 Tage, ±10 Kontext, Mindestalter 10, zwei Erwachsene); `web/src/lib/chat/dienst.ts` (Löschlauf, Meldung, Protokoll); `web/src/lib/chat/hashkette.ts`; `web/src/lib/rechte/matrix.ts` (`NIE_PER_ADMINISTRATION`); `web/src/server/actions/chat.ts` (Mail ohne Inhalt); `web/docs/adr/0026`, `0027`; Tests `web/tests/integration/chat.test.ts`, `web/tests/unit/chat-regeln.test.ts`.
- „Standardmäßig 08:00 bis 20:00“: Die Zeiten sind je Gruppe einstellbar (`gruppe.chat_von`, `chat_bis`, Standard `08:00`/`20:00`). Der Text „Chat täglich“ gilt für den Standard.
- **Ehrlichkeit zur Verschlüsselung:** Die Beschreibung „nur verschlüsselt gespeichert“ ist im Code belegt (Test „Text liegt nur verschlüsselt in der Datenbank“). Wer technischen Zugriff auf den Schlüssel in der Hosting-Umgebung hat, kann entschlüsseln; deshalb steht die Abgrenzung zu Ende-zu-Ende im Text. `[prüfen: Wer hat Zugriff auf die Umgebungsvariablen bei Vercel? Zugriff auf zwei Personen begrenzen (GO-LIVE A1).]`
- **Offene Befunde** (alle in `dsfa-lernplattform.md` §8 als Entscheidungen geführt): (a) entfernte Nachrichten bleiben verschlüsselt bis zum Löschlauf; (b) Meldungen ohne Abschluss haben keine Höchstfrist; (c) das Moderationsprotokoll hat keine Löschroutine (der Trigger erlaubt sie nur im Löschlauf); (d) eine Meldung erreicht alle Gruppenleitungen, auch die gemeldete Lehrkraft.
- JuSchG: `[prüfen: Anwendbarkeit von § 24a JuSchG (strukturelle Vorsorgemaßnahmen bei Diensten mit Interaktionsrisiken) auf eine nicht gewinnorientierte Gemeinde]`.

## 5. Web Push (Benachrichtigungen)

### Text (Vorschlag)

**Nur auf Wunsch.** Benachrichtigungen gibt es nur, wenn Sie sie selbst einschalten (Opt-in) und Ihr Browser zustimmt. Sie wählen die Themen: Gebetserinnerung (mit den Zeiten unserer Moschee in Wetzlar), wichtige Ankündigungen der Moschee, Neuigkeiten in Ihrer Gruppe (nur mit Konto), Neuigkeiten aus dem Unterricht (nur mit Konto). Für Kinder unter 16 Jahren ist das nur mit Einwilligung der Sorgeberechtigten möglich.

**Welche Daten wir speichern.** Die Adresse, die Ihr Browser für Benachrichtigungen vergibt (**verschlüsselt** gespeichert), die technischen Schlüssel Ihres Browsers für die Verschlüsselung, die gewählten Themen, Gebete, den Vorlauf in Minuten, die Sprache, die Version des Einwilligungstextes, den Zeitpunkt der letzten erfolgreichen Zustellung und einen Fehlerzähler. Wenn Sie angemeldet sind, verknüpfen wir das Abo mit Ihrem Konto, damit Hinweise zu Gruppe und Unterricht bei Ihnen ankommen. Ohne Anmeldung bleibt es anonym (nur Gebet und Ankündigungen).

**Was in der Nachricht steht.** Die Nachricht wird auf dem Weg zu Ihrem Gerät verschlüsselt (RFC 8291). Sie enthält nur die Art (Gebet, Ankündigung, Gruppe, Unterricht), bei Gebeten das Gebet, die Uhrzeit und die Minuten, sonst einen internen Seitenpfad. **Nie** Namen oder Nachrichteninhalte. Den Text, den Sie sehen, baut Ihr Gerät aus festen Texten.

**Push-Dienste und Drittland.** Zugestellt wird über den Benachrichtigungsdienst Ihres Browsers: Google (Chrome, Android), Mozilla (Firefox), Apple (Safari, iPhone, iPad) oder Microsoft (Edge). Diesen Dienst bestimmt Ihr Browser; wir können ihn nicht wählen. Der Dienst erfährt die Adresse Ihres Browsers, den Zeitpunkt, die Größe der Nachricht, die IP-Adresse unseres Servers und die Kontaktadresse der Gemeinde ([Kontaktadresse für Push – MN-17]). Er kann den Inhalt **nicht lesen**. Die Anbieter haben ihren Sitz in den USA; eine Verarbeitung dort ist möglich. Grundlage der Übermittlung ist [prüfen: Angemessenheitsbeschluss (EU-US Data Privacy Framework) des jeweiligen Anbieters oder Standardvertragsklauseln] und Ihre ausdrückliche Einwilligung (Art. 49 Abs. 1 lit. a DSGVO). Auf die Verarbeitung durch diese Anbieter haben wir keinen Einfluss.

**Rechtsgrundlage.** Ihre Einwilligung, Art. 6 Abs. 1 lit. a DSGVO, und § 25 Abs. 1 TDDDG (Speichern des Abos in Ihrem Browser und Zugriff darauf). Die Einwilligung geben Sie mit dem Einschalten; sie wird mit Version und Zeitpunkt gespeichert.

**Speicherdauer.** Bis Sie die Benachrichtigungen abschalten (in der Seite oder in den Browser-Einstellungen). Abos, die **12 Monate** lang keine Nachricht erfolgreich zugestellt bekamen, löschen wir automatisch; ebenso Abos, bei denen der Push-Dienst die Adresse als ungültig meldet oder die Zustellung fünfmal scheitert. Die Schutzmarke gegen doppelten Versand löschen wir nach 3 Tagen.

**Rückfall.** Wenn Push nicht verfügbar ist, kann die Gemeinde stattdessen eine kurze E-Mail-Zusammenfassung ohne Inhalte senden oder Sie in der Seite erinnern.

**iPhone und iPad.** Dort funktioniert Push erst, wenn Sie die Seite zum Home-Bildschirm hinzufügen und von dort öffnen.

### Hinweise für die Prüfung

- Belege: `web/src/lib/push/{abo,senden,vapid,verschluesselung}.ts`; `web/src/app/api/push/abo/route.ts`; `web/src/lib/db/schema/push.ts`; `web/messages/bereiche/benachrichtigungen.json` (Einwilligungstext, bleibt unverändert); `public/sw.js`; `web/docs/adr/0034`; Tests `web/tests/unit/push.test.ts`, `web/tests/integration/push.test.ts`.
- Push-Dienste laut Code (`DIENSTE` in `senden.ts`): `fcm.googleapis.com`, `updates.push.services.mozilla.com`, `*.push.apple.com`, `*.notify.windows.com`. Der veröffentlichte Einwilligungstext nennt „Google, Mozilla oder Apple“; Microsoft (Edge) steht im Code, nicht im Text `[prüfen: Text ergänzen, ohne den Wortlaut ohne Freigabe zu ändern]`.
- **Befund 1:** Der Einwilligungstext sagt „…speichert die Moschee die Adresse … verschlüsselt und **ohne meinen Namen**“. Bei angemeldeten Konten wird das Abo mit dem Konto verknüpft (`push_abo.benutzer_id`). Das widerspricht dem Satz nicht im Wortlaut (kein Name gespeichert), ist aber für Konten klarer zu fassen `[prüfen]`.
- **Befund 2:** Die gespeicherte Einwilligungsversion wird in `speichereAbo` aus dem **deutschen** Text gebildet, auch wenn die Person Türkisch oder Englisch sah `[prüfen: Nachweis der Fassung je Sprache]`.
- **Befund 3:** „Push für das Kind nur mit Elternfreigabe“ (ADR 0034) ist im Abo-Weg dieses Standes nicht erzwungen: `route.ts` unterscheidet nur „mit/ohne Konto“, nicht „Kinderkonto“. Vor Einschalten von `push` zu ergänzen (DSFA D-07).
- Die Kontaktadresse (`VAPID_KONTAKT`) geht in jedem Aufruf an den Push-Dienst (Feld `sub` im VAPID-Token). Eine allgemeine Funktionsadresse verwenden, keine persönliche.
- Aufräumen der Abos läuft im Minutentakt (`/api/wartung/takt`), nicht im Löschlauf. Fällt der Takt aus, bleiben Abos länger.

## 6. Newsletter (Double-Opt-in)

### Text (Vorschlag)

Den Newsletter erhalten Sie nur, wenn Sie ihn bestellen **und** die Bestellung bestätigen (Double-Opt-in): Nach der Eintragung senden wir eine E-Mail mit einem Bestätigungslink. Erst nach dem Klick auf den Link sind Sie angemeldet. Jede Ausgabe enthält einen Link zum Abbestellen.

**Daten.** E-Mail-Adresse (verschlüsselt gespeichert, Vergleich über einen nicht umkehrbaren Prüfwert), Sprache, gewählte Themen, ein Prüfwert Ihres Bestätigungslinks, Version des Einwilligungstextes, Zeitpunkt von Eintragung, Bestätigung und Abbestellung.

**Zweck und Rechtsgrundlage.** Versand von Neuigkeiten der Gemeinde per E-Mail: Einwilligung, Art. 6 Abs. 1 lit. a DSGVO, und § 7 Abs. 2 Nr. 3 UWG [prüfen: Anwendbarkeit auf eine nicht gewerbliche Gemeinde]. Die Mails enthalten keine Messpixel und keine Klickverfolgung.

**Empfänger.** E-Mail-Dienstleister ([SMTP-Anbieter – Angaben von der Gemeinde]).

**Speicherdauer.** Bis Sie abbestellen. Unbestätigte Eintragungen löschen wir nach [Frist – Vorschlag: 7 Tagen]. Nach der Abbestellung bewahren wir den Nachweis von Einwilligung und Abbestellung (ohne Inhalte) bis zum Ablauf der Verjährung auf [Frist – Vorschlag: 3 Jahre ab Ende des Jahres der Abbestellung; prüfen], damit wir Sie nicht erneut anschreiben.

### Hinweise für die Prüfung

- Belege: `web/src/lib/db/schema/gemeinde.ts` (`newsletter_abo`, `newsletter_ausgabe`). Der Newsletter ist Kür; die Oberfläche war beim Schreiben noch nicht gebaut.
- **Löschroutine fehlt** für unbestätigte und abbestellte Einträge (`loeschkonzept.md` Z-14). Vor Einschalten von `newsletter` einbauen.
- „Keine Messpixel“ ist eine Zusage an die Mail-Vorlage `newsletter`; beim Bau gegenprüfen.

## 7. Standort „Mein Ort“ (nur im Gerät)

### Text (Vorschlag)

Auf den Seiten der Gebetszeiten können Sie die Zeiten für Ihren Ort berechnen lassen. Dafür fragt Ihr Browser Sie, ob die Seite Ihren Standort verwenden darf. Nur wenn Sie zustimmen, wird er ermittelt.

- Der Standort wird **sofort auf zwei Nachkommastellen gerundet** (etwa 1 Kilometer) und **nur in Ihrem Gerät** verwendet: für die Gebetszeiten, die Qibla-Richtung und die Wahl des nächsten Ortes aus einer Liste, die in der Seite enthalten ist.
- Er wird **nie an uns oder an Dritte übertragen**, nicht gespeichert und nicht protokolliert. Es gibt keine Geokodierung durch einen Fremddienst.
- Die Berechnung läuft in Ihrem Gerät mit den Einstellungen der Moschee und der Zeitzone Ihres Geräts. Die Zeiten der Moschee gelten für Wetzlar.
- Ohne Standort können Sie einen Ort aus der Liste wählen.
- **Ort merken** ist freiwillig. Dann speichert Ihr Gerät (nicht wir) Ortsname, gerundete Koordinaten und Zeitzone unter dem Schlüssel `igmg.gebetszeiten.ort`. Mit „Vergessen“ löschen Sie das wieder.
- Die Erlaubnis für den Standort gilt technisch nur auf den Seiten der Gebetszeiten.

Wie Ihr Gerät den Standort bestimmt (GPS, WLAN, Mobilfunk), regelt Ihr Browser bzw. Betriebssystem. Dabei können deren Anbieter Daten verarbeiten; das liegt außerhalb dieser Website.

**Rechtsgrundlage.** Da wir die Daten nicht erhalten, verarbeiten wir sie nicht als Verantwortliche [prüfen: Einordnung nach Art. 4 Nr. 2 DSGVO]. Der Zugriff auf den Standort Ihres Geräts erfolgt nur nach Ihrer Zustimmung im Browser (§ 25 Abs. 1 TDDDG); das Merken des Ortes nur nach Ihrem ausdrücklichen Haken (§ 25 Abs. 2 Nr. 2 TDDDG: von Ihnen ausdrücklich gewünschte Funktion).

### Hinweise für die Prüfung

- Belege: `web/src/components/website/gebetszeiten/MeinOrtRechner.tsx` (Rundung über `gerundet`, `getCurrentPosition`, Speicherung nur nach Haken), `web/src/lib/gebetszeiten/ort.ts` (`ORT_SPEICHER = 'igmg.gebetszeiten.ort'`), ADR 0028, Test `web/tests/unit/kopfzeilen-pfade.test.ts` (`geolocation=(self)` nur auf Gebetszeiten-Pfaden), E2E `web/tests/e2e/gebetszeiten-mein-ort.spec.ts` (Netz-Abhörung: keine Koordinaten im Netz).
- Der Qibla-Kompass (Lage- und Bewegungssensoren, nach Einschalten) ist in Version 1 bereits beschrieben und bleibt unverändert.

## 8. Audio und Rezitationen

### Text (Vorschlag)

**Hören.** Rezitationen und Hörbeispiele spielt Ihr Browser von unserer Website ab (Pfad `/audio/…`). Beim Abruf entstehen die üblichen Verbindungsdaten (siehe Baustein Hosting). Wir erfassen nicht, wer welche Rezitation hört, und setzen dafür keine Cookies und keine Messdienste ein. Wer „Offline speichern“ wählt, speichert Dateien in seinem Gerät; sie verlassen es nicht.

**Aufnahmen in der Verwaltung.** Das Mikrofon wird nur in der Verwaltung und nur nach einem Klick benutzt. Eine Aufnahme bleibt im Browser, bis sie hochgeladen wird. Hochgeladene Dateien liegen im Medienspeicher in Frankfurt unter einem Namen, der aus dem Inhalt gebildet wird.

**Die Stimme der Rezitierenden.** Die Stimme ist ein personenbezogenes Datum. Wir veröffentlichen Aufnahmen **nur** auf Grundlage einer schriftlichen Vereinbarung mit der rezitierenden Person über Rechte und Stimme (Entwurf: `vereinbarung-rezitation.md`). Das System lässt eine Rezitation erst zu, wenn diese Vereinbarung hinterlegt ist. Die Person wird im Player mit Namen genannt, wie vereinbart. Sie kann ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen; wir entfernen die Aufnahmen dann binnen [Frist – Vorschlag 14 Tage] aus der Website und aus unseren Kopien. Sicherungskopien rotieren nach 30 Tagen. Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO bzw. lit. b (Vereinbarung) [prüfen: je nach Ausgestaltung].

**Keine künstliche Sprachausgabe.** Wir erzeugen keine Stimmen mit KI und verwenden keine Aufnahmen zum Training von Systemen.

### Hinweise für die Prüfung

- Belege: ADR 0029; `web/src/lib/db/schema/quran.ts` (`quran_rezitation`: Prüfung `quran_rezitation_vereinbarung`, nicht aktiv ohne `vereinbarung_medium_id`); `web/src/lib/storage`; `kopfzeilen-pfade.test.ts` (Mikrofon nur Verwaltung).
- Sicherungen rotieren nach 30 Tagen (`betrieb/lokal/sicherung/sichern.sh`). **Der Medienspiegel löscht nie** (`betrieb/lokal/spiegel/spiegel.mjs`, Kommentar im Kopf). Für einen Widerruf der Rezitierenden oder einer Fotoeinwilligung muss die Datei im Spiegel von Hand entfernt werden `[Verfahren – Technik/DSB; siehe Löschkonzept Z-22]`.
- Offline-Kopien in Geräten Dritter können wir nicht zurückholen; die Vereinbarung sagt das ausdrücklich.
- Die Rezitation **fremder** Rezitatoren (MN-03b) braucht eigene Lizenztexte; hier nicht geregelt.

## 9. Lokaler Server der Gemeinde

### Text (Vorschlag)

Die Gemeinde betreibt im Gemeindehaus [Ort und Raum – Vorstand] einen eigenen Server, der der Website hilft. Er ersetzt die Website nicht; ohne ihn läuft alles Wichtige weiter.

- **Sicherung.** Täglich wird die Datenbank gesichert, mit einem Schlüssel verschlüsselt und 30 Tage aufbewahrt. Der private Schlüssel liegt beim Vorstand [Verwahrung – Vorstand]. Die Sicherung enthält alle Daten der Website; ohne den Schlüssel ist sie unlesbar. Einmal im Monat wird eine Sicherung zur Probe in einer Wegwerf-Datenbank wiederhergestellt und danach gelöscht.
- **Medienspiegel.** Bilder, PDF-Dateien und Audio werden täglich als Kopie auf den Server geladen und mit Prüfsummen auf Unversehrtheit geprüft.
- **Takt.** Der Server ruft jede Minute einen Dienst der Website auf, der Gebetserinnerungen auslöst, E-Mails versendet und Löschfristen anstößt. Dabei werden keine Personendaten übertragen.
- **Überwachung.** Der Server prüft alle fünf Minuten, ob die Website antwortet, und schickt der Technik bei einem Ausfall eine E-Mail ohne Personendaten.
- **Echtzeit (optional).** Für den Gruppenchat kann der Server das Signal „Kanal hat Neues“ weitergeben. Nachrichten laufen nie über ihn.
- **Anzeige im Gebetsraum.** Ein Bildschirm zeigt die öffentliche Seite der Gebetszeiten. Keine Anmeldung, keine Personendaten.

Zugriff haben nur [Personen der Technik – Vorstand]. Der Server steht in einem [abgeschlossenen Raum – Vorstand]. **Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO (Verfügbarkeit und Sicherheit der Daten, Art. 32 DSGVO). Speicherdauer: Sicherungen 30 Tage, Medienkopien [Frist – siehe Löschkonzept].

### Hinweise für die Prüfung

- Belege: `betrieb/lokal/LIESMICH.md`, `docker-compose.yml`, `sicherung/{sichern,probe}.sh`, `spiegel/spiegel.mjs`, `takt/takt.sh`, `ueberwachung/ueberwachen.sh`, `kiosk/KIOSK.md`; ADR 0036.
- Die Sicherung ist **doppelt geschützt**: Das Dump enthält die Spalten, die die Anwendung zusätzlich verschlüsselt (Chat-Text, Stammdaten der Lernenden, Eingänge), nur als Chiffrat; der Anwendungsschlüssel `EINGANG_SCHLUESSEL` liegt nicht auf dem lokalen Server. Folge: Ohne diesen Schlüssel sind diese Daten auch aus einer Wiederherstellung **nicht** lesbar. Der Schlüssel muss getrennt und mehrfach verwahrt werden (`web/docs/BETRIEB.md`).
- **Befund:** Liegt `schluessel/probe.key` (privater age-Schlüssel) auf dem Server, kann dort jede Sicherung entschlüsselt werden. Der Schutz gegen Diebstahl des Servers ist dann schwächer. Entscheidung Vorstand/Technik: Probe nur manuell mit dem Schlüssel vom Vorstand (DSFA D-08).
- Der Medienspiegel nutzt `BLOB_READ_WRITE_TOKEN` (laut Vorlage ein „Lesetoken“, de facto Lese- und Schreibtoken bei Vercel Blob) `[prüfen]`.

## 10. Hatim und weitere Funktionen mit Konto

### Text (Vorschlag)

- **Gemeinsame Hatim (nur mit Konto).** Wer einen Abschnitt (Cüz) übernimmt, wird mit dem Konto verknüpft. Öffentlich sichtbar sind nur Zahlen und der Ring, keine Namen. Diese Angabe kann eine religiöse Praxis erkennen lassen (Art. 9); die Teilnahme ist freiwillig und beruht auf Ihrer ausdrücklichen Einwilligung (Art. 9 Abs. 2 lit. a, Art. 6 Abs. 1 lit. a DSGVO). Löschung: mit dem Konto, die Verknüpfung wird beim Löschen aufgelöst; Aufbewahrung der Hatim: [Frist – Vorstand].
- **Lesezeichen und „Weiterlesen“ im Koran-Leser** liegen im Gerät (Baustein 12). Nur wenn Sie in „Mein Bereich“ die Synchronisierung einschalten, speichert die Gemeinde Ihre Lesezeichen mit dem Konto.
- **Ehrenamt-Dienstplan, QR-Check-in, Hausaufgaben und Urkunden** sind spätere Funktionen. Für jede ergänzt die Gemeinde vor dem Einschalten einen eigenen Baustein.

### Hinweise für die Prüfung

- `web/src/lib/db/schema/gemeinde.ts` (`hatim_teil.benutzer_id`, `dienst_eintrag`); `web/src/lib/konto/lesezeichen.ts` (Mein-Bereich-Paket).
- Weitere Funktionen nur aufnehmen, wenn sie eingeschaltet werden. Der Baustein ist ein Platzhalter für die Prüfung vor dem Schalter `hatim`.

## 11. Personenfotos

### Text (Vorschlag)

Fotos, auf denen Personen erkennbar sind, veröffentlichen wir nur mit deren Einwilligung, bei Kindern unter 16 Jahren mit Einwilligung der Sorgeberechtigten. Beim Hochladen eines Fotos hält die Verwaltung fest, dass die Einwilligung vorliegt. Sie können die Einwilligung jederzeit widerrufen; dann entfernen wir das Foto aus der Website, den Vorschaubildern und unseren Kopien [Frist – Vorschlag 14 Tage]. Bereits an Dritte gelangte Kopien können wir nicht zurückholen. Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO; zum Recht am eigenen Bild §§ 22, 23 KUG [prüfen: Rechtsberatung].

### Hinweise für die Prüfung

- Der Haken für Personenfotos (K-29, `web/src/server/actions/medien.ts`) ist ein Paket des Plans (Bestandslücke), dessen Bau noch aussteht; Einwilligungsart `personenfotos` existiert im Schema.
- Der Medienspiegel hält gelöschte Fotos weiter (siehe Baustein 8, Befund).

## 12. Gerätespeicher und Cookies (Ergänzung zu „Browser“ in Version 1)

### Text (Vorschlag)

Die öffentlichen Seiten setzen **keine Cookies**. Zur Bedienung speichert die Website einige Einträge im **lokalen Speicher Ihres Geräts**. Sie werden **nicht an den Server gesendet**; Sie können sie jederzeit über die Browser-Einstellungen („Websitedaten löschen“) entfernen.

| Schlüssel | Inhalt | Wann gesetzt | Zweck |
| --- | --- | --- | --- |
| `igmg-konzepthinweis-gesehen` | `1` | wenn Sie den Konzept-Hinweis schließen | Hinweis nur einmal zeigen (bereits in Version 1) |
| `igmg.gebetszeiten.ort` | Ortsname, gerundete Koordinaten, Zeitzone | nur nach „Ort merken“ | gemerkter Ort für die Gebetszeiten |
| `igmg.push.auswahl` | gewählte Themen, Gebete, Vorlauf in Minuten | beim Einschalten der Benachrichtigungen | Auswahl vorbelegen |
| `igmg.quran.lesezeichen` | Lesezeichen (Sure, Vers) | wenn Sie ein Lesezeichen setzen | Lesezeichen im Koran-Leser |
| Leser-Einstellungen | Lesemodus, Schriftgröße, Tajwid an/aus, gewählte Ausgabe, zuletzt gelesene Stelle | wenn Sie sie ändern bzw. lesen | Einstellungen und „Weiterlesen“ |
| Übungsstand (Elifbe) | geübte Buchstaben | beim Üben | Fortschritt auf diesem Gerät |

Außerdem hält der **Service Worker** (`/sw.js`) öffentliche Seiten der Gebetszeiten und der Anzeige sowie statische Dateien im Zwischenspeicher Ihres Browsers, damit sie ohne Netz funktionieren. Er speichert keine Personendaten und nie Seiten der Verwaltung, API-Antworten oder Anmeldeseiten.

**Rechtsgrundlage.** Einträge, die eine von Ihnen ausdrücklich gewünschte Funktion bereitstellen (Ort merken, Lesezeichen, Einstellungen, Offline-Zeiten), sind nach § 25 Abs. 2 Nr. 2 TDDDG ohne Einwilligung zulässig; der Konzept-Hinweis-Merker ist eine Komfortangabe ohne Personenbezug [prüfen: Einordnung]. Es gibt **keine Tracker, keine Reichweitenmessung, keine Drittanbieter-Cookies**.

### Hinweise für die Prüfung

- **Schlüsselnamen sind nicht einheitlich.** Der Stand dieses Branches kennt `igmg-konzepthinweis-gesehen` (`KonzeptHinweis.tsx`), `igmg.gebetszeiten.ort` (`ort.ts`), `igmg.push.auswahl` (`PushEinstellungen.tsx`). In den noch nicht zusammengeführten Paketen stehen außerdem `igmg-quran-einstellungen`, `igmg-quran-weiterlesen`, `igmg-quran-lesezeichen` (Koran-Leser), `igmg.quran.lesezeichen` (Mein Bereich, `LesezeichenListe`) und `elifbe-fortschritt` (Elifbe-Übungen). **Der Koran-Leser schreibt also `igmg-quran-lesezeichen`, Mein Bereich liest `igmg.quran.lesezeichen`.** Vor der Veröffentlichung die Namen vereinheitlichen und die Tabelle gegen den zusammengeführten Code prüfen.
- Cookies der Anmeldung: siehe Baustein 2.
- Service Worker: `web/public/sw.js` (Kopfkommentar: nie vorhalten: Verwaltung, API, Medien-Uploads, Server Actions).

## 13. Kindgerechte Kurzfassung (de, tr, en)

Diese Kurzfassung steht in der Plattform bei der Anmeldung eines Kinderzugangs und erklärt in einfacher Sprache, was mit den Daten passiert (Art. 12 Abs. 1 DSGVO: klare und einfache Sprache, besonders gegenüber Kindern). Sie ersetzt die Datenschutzerklärung nicht. Die Chat-Regeln selbst stehen in `web/messages/bereiche/chat.json` (`chatRegeln`).

### Deutsch

Hallo! Hier steht, was mit deinen Daten passiert.

- Wir speichern deinen Vornamen, den ersten Buchstaben deines Nachnamens und was du im Kurs machst: ob du da warst und was du schon gelernt hast. Das sehen deine Eltern und deine Lehrkräfte – sonst niemand.
- Deine Nachrichten im Chat sind geheim gespeichert. Deine Lehrkräfte lesen im Gruppenchat mit, damit niemand gemein ist. Nach einiger Zeit löschen wir die Nachrichten von selbst.
- Wir wollen nie dein Foto, deine Adresse oder deine Telefonnummer im Chat sehen. Schreib sie nicht hin.
- Dein Zugang ist von deinen Eltern. Sie können ihn jederzeit ändern oder löschen.
- Wenn dir etwas komisch vorkommt, drück auf „Melden“ oder sprich mit deinen Eltern. Auch die „Nummer gegen Kummer“ hilft: 116 111, kostenlos.
- Wir benutzen keine Werbung und keine Spiele-Punkte, die dich vergleichen.

### Türkçe

Merhaba! Burada verilerine ne olduğunu okuyabilirsin.

- Adını, soyadının ilk harfini ve kursta ne yaptığını saklarız: derste olup olmadığını ve neleri öğrendiğini. Bunu sadece anne baban ve öğretmenlerin görür.
- Sohbetteki mesajların gizli olarak saklanır. Öğretmenlerin, kimse kötü davranmasın diye grup sohbetini okur. Bir süre sonra mesajları kendiliğinden sileriz.
- Sohbette fotoğrafını, adresini veya telefon numaranı görmek istemeyiz. Onları yazma.
- Erişimin anne babandan gelir. Onu istedikleri zaman değiştirebilir ya da silebilirler.
- Sana tuhaf gelen bir şey olursa „Bildir“ düğmesine bas veya anne babanla konuş. „Nummer gegen Kummer“ (Almanya'da çocuklar ve gençler için yardım hattı) de yardım eder: 116 111, ücretsiz.
- Reklam kullanmayız ve seni başkalarıyla kıyaslayan oyun puanları yoktur.

### English

Hi! Here you can read what happens with your data.

- We save your first name, the first letter of your last name and what you do in the course: whether you were there and what you have learned. Only your parents and your teachers can see this.
- Your messages in the chat are stored in secret. Your teachers read along in the group chat so that nobody is unkind. After a while we delete the messages automatically.
- We never want to see your photo, your address or your phone number in the chat. Don’t write them.
- Your access comes from your parents. They can change or delete it at any time.
- If something feels odd, press “Report” or talk to your parents. The “Nummer gegen Kummer” (a helpline for children and young people in Germany) can help too: 116 111, free of charge.
- We use no advertising and no game points that compare you with others.

### Hinweise für die Prüfung

- „Wir wollen nie dein Foto … sehen“: gemeint ist, dass der Chat nur Text zulässt (S-05); der Satz ist eine Bitte, keine Zusicherung.
- „Geheim gespeichert“ meint die Verschlüsselung in der Datenbank (Baustein 4); in der Kinderfassung bewusst nicht „Ende-zu-Ende“.
- Die türkische und die englische Fassung sind natürliche Übersetzungen des deutschen Textes und durch eine Person mit Sprachkenntnis gegenzulesen (MN-11).

## Platzhalter in diesen Bausteinen

| Platzhalter | Wer liefert |
| --- | --- |
| Verantwortlicher, Anschrift, E-Mail, Telefon | Vorstand |
| Datenschutzbeauftragte/r, Aufsichtsbehörde | Gemeinde, DSB |
| Rechtsgrundlagen mit `[prüfen]`, Interessenabwägungen | Rechtsberatung, DSB |
| Löschfristen (Lernende, Fehlmeldungen, Protokoll, Newsletter, Medienspiegel) | Vorstand, DSB (Vorschläge sind markiert) |
| Push-Dienste: Grundlage der Drittlandübermittlung, Kontaktadresse | DSB, Technik (MN-17) |
| SMTP-Anbieter | Vorstand (ML-10) |
| Ort und Zugang des lokalen Servers, Verwahrung des Schlüssels | Vorstand, Technik (MN-12) |
