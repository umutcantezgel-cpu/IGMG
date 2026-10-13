# Einwilligungstexte der Gemeinde-Plattform (versioniert, de / tr / en)

> **ENTWURF – vor Veröffentlichung durch Datenschutz/Recht prüfen (MENSCHEN MN-11).** Diese Texte sind nicht in die Plattform eingebaut und nicht veröffentlicht. Dies ist keine Rechtsberatung. Der Wortlaut der bestehenden, veröffentlichten Einwilligungstexte (Veranstaltungsanmeldung, Voranmeldung, Push in `web/messages/bereiche/benachrichtigungen.json`) bleibt unverändert. Alles in eckigen Klammern `[ ]` ist offen; `[prüfen]` ist rechtlich zu klären. Die türkischen und englischen Fassungen sind sorgfältige Übersetzungen des deutschen Textes und von einer Person mit Sprachkenntnis gegenzulesen.

Stand: 13.10.2026 · Bezug: AUFTRAG §2.2 („Einwilligungen“), §3.6; ADR 0026; Art. 4 Nr. 11, Art. 6 Abs. 1 lit. a, Art. 7, Art. 8, Art. 9 Abs. 2 lit. a DSGVO.

## 1. Übersicht

| Nr. | Einwilligung | `konto_einwilligung.art` | Wer willigt ein | Besondere Kategorie (Art. 9) | Funktionsschalter |
| --- | --- | --- | --- | --- | --- |
| E1 | Lernplattform | `lernplattform` | Eltern für Kinder unter 16; Lernende ab 16 selbst | **ja**, ausdrücklich | `lernplattform` |
| E2 | Kinderkonto | `kinderkonto` | Eltern | nein (Bezug zu E1) | `konten`, `lernplattform` |
| E3 | Gruppenchat | `gruppenchat` | Eltern für Kinder unter 16; Lernende ab 16 selbst | möglich (Inhalt) | `chat` |
| E4 | Push für das Kind | `push_kind` | Eltern | nein | `push` |
| E5 | Personenfotos | `personenfotos` | abgebildete Person bzw. Eltern | möglich | – |

Die Einwilligungen für Push (`push`, Erwachsene), Newsletter (`newsletter`) und die Chat-Regeln (`chat_regeln`) haben eigene Texte: Push in `benachrichtigungen.json`, Newsletter beim Bau, Chat-Regeln in `chat.json` (`chatRegeln`).

## 2. Regeln für Einbau und Oberfläche

1. **Getrennt:** Jede Einwilligung hat ein eigenes, **nicht vorangekreuztes** Kontrollkästchen mit dem vollständigen Text davor. Es gibt kein „Alle akzeptieren“.
2. **Zusatz bei Kindern:** Das Kästchen „Ich bin sorgeberechtigt und handle im Einvernehmen mit der zweiten sorgeberechtigten Person.“ steht getrennt, ist Pflicht und wird in `einvernehmen_bestaetigt` gespeichert. Es erscheint bei E1 bis E4 und bei E5 für Kinder.
3. **Keine Kopplung (Art. 7 Abs. 4):** Die Teilnahme am Unterricht hängt nicht von E1, E3 oder E4 ab. Wie die Anwesenheit ohne E1 geführt wird, legt die Bildung fest [Entscheidung – Bildung].
4. **Sprache:** Die Person sieht den Text in ihrer Sprache (de, tr, en); gespeichert werden Sprache und Version.
5. **Nachweis (Art. 7 Abs. 1):** gespeichert werden Art, Textversion, Sprache, Haken „Einvernehmen“, erteilende Person (Konto), Zeitpunkt. Die Textversion hat die Form `<Version>+sha256:<Hash des angezeigten Wortlauts>` (`web/src/lib/konto/einwilligung.ts`, Version des Konten-Pakets `2026-10`). **Entwurfsversionen** tragen den Zusatz `-entwurf` und werden nie in der Produktion verwendet. Der Hash wird beim Einbau aus dem tatsächlich angezeigten Text berechnet; jede Änderung eines Zeichens ergibt eine neue Version.
6. **Widerruf:** an derselben Stelle wie die Einwilligung, so einfach wie sie (Art. 7 Abs. 3 Satz 4). Er wirkt **sofort**. Der Widerruf von E1 beendet die digitale Erfassung und die davon abhängigen Funktionen E2, E3, E4 [Entscheidung – DSB]; der Widerruf von E3 sperrt das Schreiben im Chat sofort (S-03).
7. **Neue Fassung:** Ändert sich der Wortlaut wesentlich, holt die Plattform eine neue Einwilligung ein; die alte bleibt als Nachweis [Frist – Löschkonzept L-15].
8. **16. Geburtstag:** Die Jugendliche bzw. der Jugendliche erteilt E1 und E3 binnen 30 Tagen selbst (Fassung ab 16 in §8). Bis dahin gelten die Einwilligungen der Eltern weiter [Folge bei Ausbleiben: Entscheidung D-11, `dsfa-lernplattform.md`].
9. **Barrierefreiheit:** Dialog und Kästchen sind per Tastatur und mit Bildschirmleser bedienbar; Klickziele mindestens 48 px; Text ohne Fachwort, möglichst kurze Sätze (Art. 12 Abs. 1 DSGVO).
10. **Kindgerechte Erklärung:** Für Kinder erscheint zusätzlich die Kurzfassung aus `datenschutz-v2-bausteine.md`, Baustein 13.

## 3. E1: Lernplattform (Eltern für ein Kind unter 16)

Version: `lernplattform/2026-10-entwurf` · Art: `lernplattform` · Zusatz Einvernehmen: **ja**

### Deutsch

Ich willige ein, dass die IGMG Wetzlar ([Name und Rechtsform – Vorstand]) die Angaben meines Kindes [Name des Kindes] in der Lernplattform verarbeitet: Name, Geburtsdatum und Anschrift (verschlüsselt gespeichert), Gruppe, Anwesenheit und Fehlmeldungen, Lernfortschritt sowie Hifz-Prüfungen mit Bewertung.

Die Teilnahme an religiöser Bildung und der Lernstand können Rückschlüsse auf die religiöse Überzeugung zulassen. Ich willige **ausdrücklich** auch in die Verarbeitung dieser Angaben ein.

Die Angaben sehen die Lehrkräfte der Gruppe, ich als Elternteil, mein Kind (nur die eigenen Angaben) und die Bildungsverwaltung der Gemeinde. Es gibt keine Rangliste und keine Weitergabe an Dritte. Die Angaben werden [Frist – Vorstand/DSB: Vorschlag 12 Monate] nach dem Austritt gelöscht, auf Wunsch früher.

Die Einwilligung ist freiwillig. [Bestätigen – Bildung: Mein Kind kann auch ohne Lernplattform am Unterricht teilnehmen; die Anwesenheit wird dann auf Papier geführt.]

☐ Ich bin sorgeberechtigt und handle im Einvernehmen mit der zweiten sorgeberechtigten Person.

*Widerruf:* Ich kann diese Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen: in „Mein Bereich“ unter „Meine Kinder“ und „Einwilligungen“ oder per E-Mail an [E-Mail-Adresse]. Bis zum Widerruf bleibt die Verarbeitung rechtmäßig.

### Türkçe

IGMG Wetzlar'ın ([Name und Rechtsform – Vorstand]), çocuğum [Name des Kindes] ile ilgili aşağıdaki bilgileri öğrenme platformunda işlemesine rıza veriyorum: ad-soyad, doğum tarihi ve adres (şifreli olarak saklanır), grup, devam durumu ve devamsızlık bildirimleri, öğrenme ilerlemesi ile puanlı hıfz sınavları.

Dini eğitime katılım ve öğrenme durumu, dini inanca dair çıkarımlara yol açabilir. Bu bilgilerin işlenmesine de **açıkça** rıza veriyorum.

Bilgileri grubun öğretmenleri, veli olarak ben, çocuğum (yalnızca kendi bilgilerini) ve cami'nin eğitim yönetimi görebilir. Sıralama listesi yoktur ve bilgiler üçüncü kişilere aktarılmaz. Bilgiler, çocuğun ayrılmasından [Frist – Vorstand/DSB: Vorschlag 12 Monate] sonra, istenirse daha erken silinir.

Rıza gönüllüdür. [Bestätigen – Bildung: Çocuğum öğrenme platformu olmadan da derse katılabilir; devam durumu bu durumda kâğıt üzerinde tutulur.]

☐ Velayet hakkına sahibim ve ikinci velayet hakkı sahibi kişiyle mutabık kalarak hareket ediyorum.

*Geri çekme:* Bu rızamı istediğim zaman, geleceğe etkili olacak şekilde geri çekebilirim: „Hesabım“ bölümünde „Çocuklarım“ ve „Onaylar“ altında ya da [E-Mail-Adresse] adresine e-posta göndererek. Geri çekmeye kadar yapılan işleme hukuka uygun kalır.

### English

I consent to IGMG Wetzlar ([Name und Rechtsform – Vorstand]) processing the following information about my child [Name des Kindes] in the learning platform: name, date of birth and address (stored encrypted), group, attendance and absence notices, learning progress, and Hifz assessments with ratings.

Taking part in religious education and the learning progress may allow conclusions about religious beliefs. I **explicitly** consent to this information being processed as well.

The information can be seen by the teachers of the group, by me as a parent, by my child (only their own information) and by the community's education administration. There is no ranking and no disclosure to third parties. The information is deleted [Frist – Vorstand/DSB: Vorschlag 12 Monate] after my child leaves, or earlier on request.

Consent is voluntary. [Bestätigen – Bildung: My child can also take part in classes without the learning platform; attendance is then kept on paper.]

☐ I have parental responsibility and act in agreement with the second person with parental responsibility.

*Withdrawal:* I can withdraw this consent at any time with effect for the future: in “My account” under “My children” and “Consents”, or by e-mail to [E-Mail-Adresse]. The processing remains lawful until I withdraw.

## 4. E2: Kinderkonto

Version: `kinderkonto/2026-10-entwurf` · Art: `kinderkonto` · Zusatz Einvernehmen: **ja**

### Deutsch

Ich willige ein, dass für mein Kind [Name des Kindes] ein Zugang (Kinderkonto) in „Mein Bereich“ angelegt wird. Der Zugang besteht aus einem Benutzernamen und einem Passwort; die E-Mail-Adresse meines Kindes wird nicht gespeichert. Gespeichert werden außerdem der Anzeigename (Vorname und Anfangsbuchstabe des Nachnamens) und die Zeiten der Anmeldung.

Mit dem Zugang sieht mein Kind seinen Lernweg, seine Gruppe und seine Termine. Die Anmeldung endet nach 12 Stunden automatisch. Ich kann das Passwort jederzeit zurücksetzen und den Zugang über die Gemeinde löschen lassen. Der Zugang wird gelöscht, wenn mein Kind aus allen Gruppen ausgetreten ist [Frist – siehe Löschkonzept L-11].

Die Einwilligung ist freiwillig.

☐ Ich bin sorgeberechtigt und handle im Einvernehmen mit der zweiten sorgeberechtigten Person.

*Widerruf:* Ich kann diese Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen: in „Mein Bereich“ unter „Meine Kinder“ und „Einwilligungen“ oder per E-Mail an [E-Mail-Adresse]. Dann wird der Zugang gesperrt und gelöscht.

### Türkçe

Çocuğum [Name des Kindes] için „Hesabım“ alanında bir erişim (çocuk hesabı) açılmasına rıza veriyorum. Erişim bir kullanıcı adı ve bir şifreden oluşur; çocuğumun e-posta adresi saklanmaz. Ayrıca görünen ad (ad ve soyadın ilk harfi) ile oturum açma zamanları saklanır.

Çocuğum bu erişimle öğrenme yolunu, grubunu ve derslerini görür. Oturum 12 saat sonra kendiliğinden sona erer. Şifreyi istediğim zaman sıfırlayabilirim ve erişimin cami yönetimi aracılığıyla silinmesini isteyebilirim. Çocuğum tüm gruplardan ayrıldığında erişim silinir [Frist – siehe Löschkonzept L-11].

Rıza gönüllüdür.

☐ Velayet hakkına sahibim ve ikinci velayet hakkı sahibi kişiyle mutabık kalarak hareket ediyorum.

*Geri çekme:* Bu rızamı istediğim zaman, geleceğe etkili olacak şekilde geri çekebilirim: „Hesabım“ bölümünde „Çocuklarım“ ve „Onaylar“ altında ya da [E-Mail-Adresse] adresine e-posta göndererek. Bu durumda erişim engellenir ve silinir.

### English

I consent to an access (child account) being created in “My account” for my child [Name des Kindes]. The access consists of a username and a password; my child’s e-mail address is not stored. Also stored are the display name (first name and the initial of the last name) and the times of sign-in.

With this access my child can see their learning path, their group and their dates. The sign-in ends automatically after 12 hours. I can reset the password at any time and have the access deleted through the community. The access is deleted once my child has left all groups [Frist – siehe Löschkonzept L-11].

Consent is voluntary.

☐ I have parental responsibility and act in agreement with the second person with parental responsibility.

*Withdrawal:* I can withdraw this consent at any time with effect for the future: in “My account” under “My children” and “Consents”, or by e-mail to [E-Mail-Adresse]. The access is then blocked and deleted.

## 5. E3: Gruppenchat (Eltern für ein Kind unter 16)

Version: `gruppenchat/2026-10-entwurf` · Art: `gruppenchat` · Zusatz Einvernehmen: **ja**

### Deutsch

Ich willige ein, dass mein Kind [Name des Kindes] am moderierten Gruppenchat seiner Gruppe teilnehmen darf. Im Gruppenchat schreiben die Kinder der Gruppe und ihre Lehrkräfte. Es gibt keine Direktnachrichten, keine Bilder und keine Dateien, nur Text bis 500 Zeichen. Der Chat ist nur zu festgelegten Zeiten offen (Standard: 08 bis 20 Uhr).

Die Lehrkräfte der Gruppe lesen mit und moderieren. Meldet jemand eine Nachricht, sehen die Lehrkräfte und die Ansprechperson Kinderschutz der Gemeinde die gemeldete Nachricht und die Nachrichten davor und danach. Jede solche Einsicht wird protokolliert. Die Verwaltung der Website liest keine Chats.

Nachrichten werden verschlüsselt gespeichert und nach 90 Tagen gelöscht, spätestens 30 Tage nach dem Ende der Gruppe. Meldungen werden ein Jahr nach Abschluss gelöscht. Mein Kind bestätigt vor der ersten Nachricht kindgerechte Chat-Regeln.

Die Einwilligung ist freiwillig. Mein Kind kann auch ohne Chat am Unterricht teilnehmen.

☐ Ich bin sorgeberechtigt und handle im Einvernehmen mit der zweiten sorgeberechtigten Person.

*Widerruf:* Ich kann diese Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen: in „Mein Bereich“ unter „Meine Kinder“ und „Einwilligungen“ oder per E-Mail an [E-Mail-Adresse]. Der Widerruf wirkt **sofort**: Mein Kind kann danach nicht mehr schreiben.

### Türkçe

Çocuğum [Name des Kindes] grubunun denetimli grup sohbetine katılabilsin diye rıza veriyorum. Grup sohbetinde grubun çocukları ve öğretmenleri yazar. Doğrudan mesaj, fotoğraf ve dosya yoktur; yalnızca en fazla 500 karakterlik yazı vardır. Sohbet yalnızca belirlenen saatlerde açıktır (standart: 08.00–20.00).

Grubun öğretmenleri sohbeti okur ve denetler. Biri bir mesajı bildirirse, öğretmenler ve cami'nin çocuk koruma sorumlusu bildirilen mesajı ve öncesindeki ile sonrasındaki mesajları görür. Böyle her inceleme kayda geçirilir. Web sitesinin yönetimi sohbetleri okumaz.

Mesajlar şifreli olarak saklanır ve 90 gün sonra, en geç grubun bitiminden 30 gün sonra silinir. Bildirimler, sonuçlandırıldıktan bir yıl sonra silinir. Çocuğum ilk mesajdan önce çocuklara uygun sohbet kurallarını onaylar.

Rıza gönüllüdür. Çocuğum sohbet olmadan da derse katılabilir.

☐ Velayet hakkına sahibim ve ikinci velayet hakkı sahibi kişiyle mutabık kalarak hareket ediyorum.

*Geri çekme:* Bu rızamı istediğim zaman, geleceğe etkili olacak şekilde geri çekebilirim: „Hesabım“ bölümünde „Çocuklarım“ ve „Onaylar“ altında ya da [E-Mail-Adresse] adresine e-posta göndererek. Geri çekme **hemen** etkili olur: Çocuğum bundan sonra yazamaz.

### English

I consent to my child [Name des Kindes] taking part in the moderated group chat of their group. In the group chat the children of the group and their teachers write to each other. There are no direct messages, no pictures and no files, only text of up to 500 characters. The chat is only open at set times (default: 8 a.m. to 8 p.m.).

The teachers of the group read along and moderate. If someone reports a message, the teachers and the community’s child protection contact person can see the reported message and the messages before and after it. Every such access is logged. The website administration does not read chats.

Messages are stored encrypted and deleted after 90 days, at the latest 30 days after the group ends. Reports are deleted one year after they are closed. Before the first message, my child confirms child-friendly chat rules.

Consent is voluntary. My child can also take part in classes without the chat.

☐ I have parental responsibility and act in agreement with the second person with parental responsibility.

*Withdrawal:* I can withdraw this consent at any time with effect for the future: in “My account” under “My children” and “Consents”, or by e-mail to [E-Mail-Adresse]. The withdrawal takes effect **immediately**: my child can no longer write afterwards.

## 6. E4: Push für das Kind

Version: `push_kind/2026-10-entwurf` · Art: `push_kind` · Zusatz Einvernehmen: **ja**

### Deutsch

Ich willige ein, dass auf dem Gerät meines Kindes [Name des Kindes] Benachrichtigungen (Web Push) eingeschaltet werden dürfen. Mein Kind kann dann Hinweise zu Neuigkeiten in seiner Gruppe und aus dem Unterricht erhalten [und zu Gebetszeiten und Ankündigungen der Moschee].

Dafür speichert die Gemeinde die Adresse, die der Browser für Benachrichtigungen vergibt, verschlüsselt und verknüpft sie mit dem Konto meines Kindes. Zugestellt wird über den Benachrichtigungsdienst des Browsers (zum Beispiel Google, Mozilla, Apple oder Microsoft; Sitz in den USA). Dieser Dienst sieht nur, dass eine verschlüsselte Nachricht kommt, nicht ihren Inhalt. Die Nachrichten enthalten nie Namen und nie Chat-Inhalte. Ein Abo ohne erfolgreiche Zustellung wird nach 12 Monaten gelöscht.

Die Einwilligung ist freiwillig.

☐ Ich bin sorgeberechtigt und handle im Einvernehmen mit der zweiten sorgeberechtigten Person.

*Widerruf:* Ich kann diese Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen: in „Mein Bereich“ unter „Meine Kinder“ und „Einwilligungen“, durch Abschalten der Benachrichtigungen auf dem Gerät oder per E-Mail an [E-Mail-Adresse].

### Türkçe

Çocuğum [Name des Kindes] adlı çocuğun cihazında bildirimlerin (Web Push) açılmasına rıza veriyorum. Çocuğum bu durumda grubundaki yeniliklere ve dersten haberlere dair bildirimler alabilir [ve caminin namaz vakitleri ile duyurularına dair bildirimler].

Bunun için cami, tarayıcının bildirimler için verdiği adresi şifreli olarak saklar ve çocuğumun hesabıyla ilişkilendirir. İletim, tarayıcının bildirim hizmeti üzerinden yapılır (örneğin Google, Mozilla, Apple veya Microsoft; merkezi ABD'dedir). Bu hizmet yalnızca şifreli bir mesajın geldiğini görür, içeriğini görmez. Mesajlar hiçbir zaman ad veya sohbet içeriği taşımaz. Başarılı bir iletim olmayan abonelik 12 ay sonra silinir.

Rıza gönüllüdür.

☐ Velayet hakkına sahibim ve ikinci velayet hakkı sahibi kişiyle mutabık kalarak hareket ediyorum.

*Geri çekme:* Bu rızamı istediğim zaman, geleceğe etkili olacak şekilde geri çekebilirim: „Hesabım“ bölümünde „Çocuklarım“ ve „Onaylar“ altında, cihazda bildirimleri kapatarak ya da [E-Mail-Adresse] adresine e-posta göndererek.

### English

I consent to notifications (web push) being switched on on the device of my child [Name des Kindes]. My child can then receive notifications about news in their group and from class [and about prayer times and announcements of the mosque].

For this, the community stores the address that the browser assigns for notifications, encrypted, and links it to my child’s account. Delivery runs through the browser’s notification service (for example Google, Mozilla, Apple or Microsoft; based in the USA). That service only sees that an encrypted message is arriving, not its content. The messages never contain names and never contain chat content. A subscription without successful delivery is deleted after 12 months.

Consent is voluntary.

☐ I have parental responsibility and act in agreement with the second person with parental responsibility.

*Withdrawal:* I can withdraw this consent at any time with effect for the future: in “My account” under “My children” and “Consents”, by switching off notifications on the device, or by e-mail to [E-Mail-Adresse].

Hinweis zu E4 (nicht Teil des Texts): Der Abo-Weg erzwingt die Einwilligung `push_kind` für Kinderkonten in diesem Stand noch nicht (DSFA D-07). Der Hinweis „höchstens eine Meldung je 10 Minuten für den Chat“ aus ADR 0034 steht bewusst nicht im Text, solange der Chat-Push nicht gebaut ist.

## 7. E5: Personenfotos

Zwei Fassungen: **E5a** für eine erwachsene Person oder eine Jugendliche bzw. einen Jugendlichen ab 16 (eigenes Bild), **E5b** für ein Kind unter 16 (Eltern). Version: `personenfotos/2026-10-entwurf`, Art: `personenfotos`. Zusatz Einvernehmen: nur **E5b**.

### E5a: eigenes Bild (Deutsch)

Ich willige ein, dass die IGMG Wetzlar ([Name und Rechtsform – Vorstand]) Fotos, auf denen ich erkennbar bin, aufgenommen bei [Anlass und Datum], auf ihrer Website [und in: Aushang, Newsletter – Auswahl Vorstand] veröffentlicht. Fotos im Netz sind weltweit abrufbar und können von Dritten kopiert werden; bereits kopierte Fotos kann die Gemeinde nicht zurückholen. Die Einwilligung gilt, bis ich sie widerrufe. Sie ist freiwillig.

*Widerruf:* Ich kann sie jederzeit mit Wirkung für die Zukunft widerrufen: per E-Mail an [E-Mail-Adresse]. Die Gemeinde entfernt die Fotos dann binnen [Frist – Vorschlag 14 Tage] aus der Website und aus den eigenen Kopien; Sicherungskopien laufen nach 30 Tagen aus.

### E5a: own picture (English)

I consent to IGMG Wetzlar ([Name und Rechtsform – Vorstand]) publishing photos in which I can be recognised, taken at [Anlass und Datum], on its website [and in: notice board, newsletter – Auswahl Vorstand]. Photos on the internet can be viewed worldwide and can be copied by third parties; the community cannot retrieve copies that already exist. The consent applies until I withdraw it. It is voluntary.

*Withdrawal:* I can withdraw it at any time with effect for the future: by e-mail to [E-Mail-Adresse]. The community then removes the photos within [Frist – Vorschlag 14 Tage] from the website and from its own copies; backup copies expire after 30 days.

### E5a: kendi görüntüm (Türkçe)

IGMG Wetzlar'ın ([Name und Rechtsform – Vorstand]), [Anlass und Datum] tarihinde çekilen ve üzerinde tanınabilir olduğum fotoğrafları web sitesinde [ve şu yerlerde: ilan panosu, bülten – Auswahl Vorstand] yayımlamasına rıza veriyorum. İnternetteki fotoğraflara dünya çapında erişilebilir ve üçüncü kişiler onları kopyalayabilir; zaten kopyalanmış fotoğrafları cami geri alamaz. Rıza, ben geri çekene kadar geçerlidir. Rıza gönüllüdür.

*Geri çekme:* Rızamı istediğim zaman, geleceğe etkili olacak şekilde geri çekebilirim: [E-Mail-Adresse] adresine e-posta göndererek. Cami, fotoğrafları [Frist – Vorschlag 14 Tage] içinde web sitesinden ve kendi kopyalarından kaldırır; yedek kopyalar 30 gün sonra sona erer.

### E5b: Foto meines Kindes (Deutsch)

Ich willige ein, dass die IGMG Wetzlar ([Name und Rechtsform – Vorstand]) Fotos meines Kindes [Name des Kindes], aufgenommen bei [Anlass und Datum], auf ihrer Website [und in: Aushang, Newsletter – Auswahl Vorstand] veröffentlicht. [Entscheidung Vorstand: Die Bildunterschrift enthält keinen Namen des Kindes.] Fotos im Netz sind weltweit abrufbar und können von Dritten kopiert werden; bereits kopierte Fotos kann die Gemeinde nicht zurückholen. Die Einwilligung gilt, bis ich sie widerrufe oder mein Kind sie nach dem 16. Geburtstag selbst widerruft. Sie ist freiwillig; die Teilnahme meines Kindes am Unterricht hängt nicht davon ab.

☐ Ich bin sorgeberechtigt und handle im Einvernehmen mit der zweiten sorgeberechtigten Person.

*Widerruf:* Ich kann sie jederzeit mit Wirkung für die Zukunft widerrufen: in „Mein Bereich“ unter „Meine Kinder“ und „Einwilligungen“ oder per E-Mail an [E-Mail-Adresse]. Die Gemeinde entfernt die Fotos dann binnen [Frist – Vorschlag 14 Tage] aus der Website und aus den eigenen Kopien; Sicherungskopien laufen nach 30 Tagen aus.

### E5b: Photo of my child (English)

I consent to IGMG Wetzlar ([Name und Rechtsform – Vorstand]) publishing photos of my child [Name des Kindes], taken at [Anlass und Datum], on its website [and in: notice board, newsletter – Auswahl Vorstand]. [Entscheidung Vorstand: The caption does not contain the child’s name.] Photos on the internet can be viewed worldwide and can be copied by third parties; the community cannot retrieve copies that already exist. The consent applies until I withdraw it or my child withdraws it themselves after turning 16. It is voluntary; my child’s participation in classes does not depend on it.

☐ I have parental responsibility and act in agreement with the second person with parental responsibility.

*Withdrawal:* I can withdraw it at any time with effect for the future: in “My account” under “My children” and “Consents”, or by e-mail to [E-Mail-Adresse]. The community then removes the photos within [Frist – Vorschlag 14 Tage] from the website and from its own copies; backup copies expire after 30 days.

### E5b: çocuğumun fotoğrafı (Türkçe)

IGMG Wetzlar'ın ([Name und Rechtsform – Vorstand]), çocuğum [Name des Kindes] ile ilgili [Anlass und Datum] tarihinde çekilen fotoğrafları web sitesinde [ve şu yerlerde: ilan panosu, bülten – Auswahl Vorstand] yayımlamasına rıza veriyorum. [Entscheidung Vorstand: Fotoğraf altı yazısında çocuğun adı yer almaz.] İnternetteki fotoğraflara dünya çapında erişilebilir ve üçüncü kişiler onları kopyalayabilir; zaten kopyalanmış fotoğrafları cami geri alamaz. Rıza, ben geri çekene kadar ya da çocuğum 16 yaşını doldurduktan sonra kendisi geri çekene kadar geçerlidir. Rıza gönüllüdür; çocuğumun derse katılımı buna bağlı değildir.

☐ Velayet hakkına sahibim ve ikinci velayet hakkı sahibi kişiyle mutabık kalarak hareket ediyorum.

*Geri çekme:* Rızamı istediğim zaman, geleceğe etkili olacak şekilde geri çekebilirim: „Hesabım“ bölümünde „Çocuklarım“ ve „Onaylar“ altında ya da [E-Mail-Adresse] adresine e-posta göndererek. Cami, fotoğrafları [Frist – Vorschlag 14 Tage] içinde web sitesinden ve kendi kopyalarından kaldırır; yedek kopyalar 30 gün sonra sona erer.

## 8. Fassung ab 16: eigene Einwilligung der Jugendlichen

Am 16. Geburtstag holt die Plattform die Einwilligung der Jugendlichen bzw. des Jugendlichen selbst ein (binnen 30 Tagen). Es gibt **keinen** Zusatz „Einvernehmen“. Versionen: `lernplattform-ab16/2026-10-entwurf`, `gruppenchat-ab16/2026-10-entwurf`, `push-ab16/2026-10-entwurf` (Art: `lernplattform`, `gruppenchat`, `push`).

### Lernplattform (ab 16)

**Deutsch:** Ich willige ein, dass die IGMG Wetzlar meine Angaben in der Lernplattform verarbeitet: Name, Geburtsdatum und Anschrift (verschlüsselt gespeichert), Gruppe, Anwesenheit, Lernfortschritt und Hifz-Prüfungen mit Bewertung. Die Teilnahme an religiöser Bildung kann Rückschlüsse auf meine religiöse Überzeugung zulassen; ich willige **ausdrücklich** auch hierin ein. Die Angaben sehen die Lehrkräfte meiner Gruppe, ich selbst, meine Eltern [wenn ich es erlaube – Entscheidung Bildung] und die Bildungsverwaltung. Ich kann meine Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen, in „Mein Bereich“ oder per E-Mail an [E-Mail-Adresse]. Sie ist freiwillig.

**Türkçe:** IGMG Wetzlar'ın bilgilerimi öğrenme platformunda işlemesine rıza veriyorum: ad-soyad, doğum tarihi ve adres (şifreli saklanır), grup, devam durumu, öğrenme ilerlemesi ve puanlı hıfz sınavları. Dini eğitime katılım, dini inancıma dair çıkarımlara yol açabilir; buna da **açıkça** rıza veriyorum. Bilgileri grubumun öğretmenleri, ben, ailem [izin verirsem – Entscheidung Bildung] ve eğitim yönetimi görebilir. Rızamı istediğim zaman, geleceğe etkili olacak şekilde „Hesabım“ bölümünden ya da [E-Mail-Adresse] adresine e-posta göndererek geri çekebilirim. Rıza gönüllüdür.

**English:** I consent to IGMG Wetzlar processing my information in the learning platform: name, date of birth and address (stored encrypted), group, attendance, learning progress and Hifz assessments with ratings. Taking part in religious education may allow conclusions about my religious beliefs; I **explicitly** consent to this as well. The information can be seen by the teachers of my group, by myself, by my parents [if I allow it – Entscheidung Bildung] and by the education administration. I can withdraw my consent at any time with effect for the future, in “My account” or by e-mail to [E-Mail-Adresse]. It is voluntary.

### Gruppenchat (ab 16)

**Deutsch:** Ich willige ein, am moderierten Gruppenchat meiner Gruppe teilzunehmen. Es gibt nur Text bis 500 Zeichen, keine Bilder, keine Dateien und keine Direktnachrichten. Die Lehrkräfte lesen mit und moderieren; bei einer Meldung sehen sie und die Ansprechperson Kinderschutz die gemeldete Nachricht und die Nachrichten davor und danach, jeweils protokolliert. Nachrichten werden verschlüsselt gespeichert und nach 90 Tagen gelöscht, spätestens 30 Tage nach dem Ende der Gruppe. Ich kann meine Einwilligung jederzeit widerrufen; dann kann ich nicht mehr schreiben. Sie ist freiwillig.

**Türkçe:** Grubumun denetimli grup sohbetine katılmaya rıza veriyorum. Yalnızca en fazla 500 karakterlik yazı vardır; fotoğraf, dosya ve doğrudan mesaj yoktur. Öğretmenler sohbeti okur ve denetler; bir bildirim olduğunda onlar ve çocuk koruma sorumlusu, bildirilen mesajı ile öncesindeki ve sonrasındaki mesajları görür; her inceleme kayda geçirilir. Mesajlar şifreli saklanır ve 90 gün sonra, en geç grubun bitiminden 30 gün sonra silinir. Rızamı istediğim zaman geri çekebilirim; o zaman artık yazamam. Rıza gönüllüdür.

**English:** I consent to taking part in the moderated group chat of my group. There is only text of up to 500 characters, no pictures, no files and no direct messages. The teachers read along and moderate; if there is a report, they and the child protection contact person can see the reported message and the messages before and after it, each access being logged. Messages are stored encrypted and deleted after 90 days, at the latest 30 days after the group ends. I can withdraw my consent at any time; then I can no longer write. It is voluntary.

### Push (ab 16)

**Deutsch:** Ich willige ein, dass auf meinem Gerät Benachrichtigungen (Web Push) eingeschaltet werden. Die Gemeinde speichert die Adresse, die mein Browser dafür vergibt, verschlüsselt und verknüpft sie mit meinem Konto. Zugestellt wird über den Benachrichtigungsdienst meines Browsers (zum Beispiel Google, Mozilla, Apple oder Microsoft; Sitz in den USA), der nur sieht, dass eine verschlüsselte Nachricht kommt. Die Nachrichten enthalten nie Namen oder Chat-Inhalte. Ich kann die Benachrichtigungen jederzeit abschalten. Sie sind freiwillig.

**Türkçe:** Cihazımda bildirimlerin (Web Push) açılmasına rıza veriyorum. Cami, tarayıcımın bunun için verdiği adresi şifreli olarak saklar ve hesabımla ilişkilendirir. İletim, tarayıcımın bildirim hizmeti üzerinden yapılır (örneğin Google, Mozilla, Apple veya Microsoft; merkezi ABD'dedir); bu hizmet yalnızca şifreli bir mesajın geldiğini görür. Mesajlar hiçbir zaman ad veya sohbet içeriği taşımaz. Bildirimleri istediğim zaman kapatabilirim. Rıza gönüllüdür.

**English:** I consent to notifications (web push) being switched on on my device. The community stores the address my browser assigns for this, encrypted, and links it to my account. Delivery runs through my browser’s notification service (for example Google, Mozilla, Apple or Microsoft; based in the USA), which only sees that an encrypted message is arriving. The messages never contain names or chat content. I can switch the notifications off at any time. They are voluntary.

## 9. Offene Punkte

1. Fristen in eckigen Klammern beschließen (Austritt, Zugang, Fotos); sie stehen im Löschkonzept.
2. Bildung bestätigt, dass die Teilnahme am Unterricht auch ohne E1, E3 und E4 möglich ist und wie die Anwesenheit dann geführt wird (Art. 7 Abs. 4).
3. Abhängigkeiten: Beendet der Widerruf von E1 die Einwilligungen E2 bis E4? (DSB)
4. Rechtliche Prüfung der Formulierung zu Art. 9 (ausdrücklich) und zum Drittland der Push-Dienste (Art. 49 Abs. 1 lit. a; Data Privacy Framework).
5. Der Nachweis des „Einvernehmens“ bleibt ein Haken (DSFA D-12).
6. Fassung ab 16: Dürfen die Eltern weiter Anwesenheit und Fortschritt sehen? [Entscheidung Bildung/DSB].
7. Gegenlesen der türkischen und englischen Fassung; danach Berechnung der Hashes beim Einbau.
