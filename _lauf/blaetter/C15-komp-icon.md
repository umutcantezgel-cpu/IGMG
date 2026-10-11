# Komponentenblatt C15 · Icon (Lucide-Pfade, stern8)

C15 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Umfang: ein Komponentenblatt „Icon (Lucide-Pfade, stern8)“ · Schwierigkeit 1

## SEITE
Komponente „Icon“ (Icon.dc.html). Keine eigene Seite.

## ROUTE
überall (Komponente, keine eigene Route).

## QUELLEN
- Design, vollständig gelesen: Icon.dc.html (93 Zeilen).
- Hilfen, nur gelesen: readme.md (Ikonografie); 01 Grundlagen.dc.html Zeilen 47, 136–144, 175; Styleguide.dc.html Zeile 91.
- Bestand, nur gelesen: uploads/igmg-wetzlar-website/src/app/components (68 Dateien mit lucide-react-Import, davon 18 ui-Bausteine mit Pin lucide-react@0.487.0).
- Abgleich, nur gelesen: web/node_modules/lucide-react 1.54.0.
- Bestand-Angaben (z. B. Header.tsx:537) relativ zum Bestand-Komponentenordner; Design-Angaben relativ zum Designordner.

## ZWECK
Zeichnet ein Icon als einzelnes SVG. Props: n (Schlüssel) und size (Größe).

## ABSCHNITTE
**Aufbau** (Icon.dc.html:10): svg, viewBox 0 0 24 24, fill none, stroke currentColor, stroke-width 2, runde Enden und Ecken, aria-hidden="true", focusable="false"; darin ein path d="{{ d }}".

**Logik** (Icon.dc.html:86–90): size = props.size ?? 20; d = I[props.n] || I['info'].

**Texte**: – (entfällt, kein sichtbarer Text im SVG).

**Icon-Regeln des Designs** (A2):

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| icon.regel | Lucide-Pfade, Strich 2 px, runde Enden; 20 px Standard, 24 px in Navigation und Kerninfos, nie unter 16 px. Farbe erbt vom Text; Icons sind nie alleiniger Bedeutungsträger, reine Icon-Buttons tragen aria-label. | – (nur DE in Quelle) | – (nur DE in Quelle) | 01 Grundlagen.dc.html:140 |
| icon.kontrast | Ränder von Bedienelementen, Fokusring, Icons 3:1 | – (nur DE in Quelle) | – (nur DE in Quelle) | 01 Grundlagen.dc.html:47 (Ausschnitt) |
| icon.stern | Achtzackiger Stern als Zeichen | – (nur DE in Quelle) | – (nur DE in Quelle) | 01 Grundlagen.dc.html:144 |
| status.regel | Status immer mit Icon und Klartext, nie nur über Farbe. | – (nur DE in Quelle) | – (nur DE in Quelle) | 01 Grundlagen.dc.html:175 |

**Status-Texte zu den Zuständen** (A2; das Icon wechselt mit):

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| status.offen | Geöffnet / Geschlossen | – (nur DE in Quelle) | – (nur DE in Quelle) | Footer.dc.html:81 |
| status.erledigt | Abgeschlossen / Geplant | – (nur DE in Quelle) | – (nur DE in Quelle) | Projects.dc.html:93 |

**Aria-Labels** (nicht sichtbar): Teilen (BaseComponents.dc.html:26; tr Paylaş, en Share; Bestand News.tsx:98, :139). Audio abspielen / Audio pausieren (Quran.dc.html:59, :102; tr Ses çal / Sesi duraklat, en Play audio / Pause audio; Quran.tsx:48–49, :73–74). Nur DE in Quelle: Passwort anzeigen / verbergen (LoginDialog.dc.html:80), Schließen (BaseComponents.dc.html:58), Menü öffnen (Header.dc.html:82). Sprache ändern - Change Language (Header.dc.html:45) mischt de und en in einem Wert.

**Verwendung je Datei** (289 Aufrufe in 36 Dateien, davon 26 dynamisch in Klammern; Fundstelle: dc-import name="Icon", Attribut n):
```
01 Grundlagen: book-open calendar clock compass mail map-pin phone stern8 users
AboutUs (+2): arrow-right clock mail map-pin users
BaseComponents: arrow-right circle-alert share-2 trash-2 x
BoardMembers: arrow-right heart stern8
Breadcrumbs: chevron-right house
Contact (+1): arrow-right book-open calendar check clock external-link heart mail map-pin phone users
CourseCard (+1): arrow-right circle-x clock info log-in user
Dashboard (+2): menu message-square pencil plus search send ticket trash-2 x
DisclaimerDialog: circle-alert info
EventCard: arrow-right calendar clock map-pin star users
EventDetails: arrow-left bookmark calendar check circle-alert circle-check clock external-link mail map-pin phone share-2 user users
Events: calendar check funnel
Footer (+1): building-2 facebook instagram mail map-pin phone stern8 youtube
FormWizard (+1): arrow-left circle-alert circle-check
FullscreenPrayerTimes: sun x
Header (+4): check globe menu user x
Home: arrow-right calendar users
IGMGInfo (+1): calendar compass external-link mail map-pin phone user
IslamicKnowledge (+1): book-open check clock info play search user x
JoinUs (+1): arrow-left clock heart info mail message-square phone
LoginDialog (+1): circle-alert key-round lock log-in mail
MosqueRequest: arrow-left
News: check funnel message-square
NewsCard (+1): arrow-right calendar clock share-2 star
NewsDetails: arrow-left bookmark calendar clock external-link eye heart mail message-square share-2 user
OrgCard: arrow-right
OrganizationPage (+1): arrow-right award calendar clock mail newspaper phone star target
PageHeader: stern8
PersonCard (+1): calendar mail phone
PrayerTimes (+2): calendar check chevron-down chevron-left chevron-right clock compass download globe info map-pin maximize refresh-cw search settings target
PrayerTimesBar (+2): arrow-right clock info map-pin
Projects (+1): banknote building-2 calendar check clock heart house target users
Quran (+1): book-open download heart search settings share-2 volume-2
QuranCourses: arrow-right check circle-check graduation-cap heart info log-in mail phone
Styleguide (+1): circle-alert circle-check info
TicketDialog: circle-alert circle-check message-square send x
```

**Bundle** (86 Schlüssel, Icon.dc.html:16–84). Lucide-Name = Schlüssel; Export = PascalCase (arrow-right = ArrowRight):
calendar, clock, map-pin, users, user, arrow-right, arrow-left, arrow-up-right, chevron-down, chevron-up, chevron-right, chevron-left, menu, x, globe, log-in, log-out, key-round, settings, layout-dashboard, message-square, mail, lock, eye, eye-off, phone, search, house, check, circle-check, circle-alert, info, circle-x, share-2, bookmark, play, pause, skip-back, skip-forward, volume-2, headphones, external-link, plus, minus, pencil, trash-2, funnel, book-open, graduation-cap, heart, building-2, maximize, minimize, compass, sunrise, sunset, sun, moon, facebook, instagram, youtube, copy, download, upload, printer, list, layout-grid, send, file-text, megaphone, bell, navigation, map, landmark, target, award, newspaper, monitor, banknote, refresh-cw, ellipsis, ticket, inbox, car, star, stern8.
Ohne jeden Treffer im Design (13): skip-back, skip-forward, headphones, minus, minimize, copy, upload, printer, layout-grid, bell, landmark, ellipsis, inbox.
Ausnahmen (abgeleitet, 1.54.0): stern8 hat keinen Lucide-Namen (Icon.dc.html:84); facebook, instagram und youtube fehlen (keine Datei, kein Export); der Bestand importiert sie (Footer.tsx:1).

**Bestand-Abgleich** (0.487.0; 160 Importnamen in 68 Dateien; gegen 1.54.0 geprüft): 79 Namen oder Aliase entsprechen einem Bundle-Schlüssel (z. B. Home = house, Filter = funnel). 77 liegen außerhalb des Bundles: Activity, AlertTriangle, ArrowUpDown, Baby, BookMarked, BookmarkPlus, Briefcase, Building, Building2, CalendarDays, Camera, CheckCheck, CheckCircle, ChevronsUpDown, Circle, CircleIcon, Cloud, CloudRain, Coffee, Computer, Contrast, Crosshair, Crown, DoorOpen, Droplets, Edit, Euro, Folder, Gamepad2, Grid3x3, GripVerticalIcon, Hammer, HandHeart, Handshake, Hash, HeartHandshake, HelpCircle, Image, Languages, Lightbulb, Maximize2, MessageCircle, Mic, MousePointer, MousePointer2, Music, Network, Palette, PanelLeftIcon, Paperclip, Reply, RotateCcw, Scissors, Share, Shield, ShieldCheckIcon, Smartphone, Smile, Snowflake, Sparkles, Square, Table, Tablet, Tag, Thermometer, ThumbsUp, Timer, Trash2, TrendingUp, Type, UserCheck, UserPlus, Video, VolumeX, Wind, Zap, ZoomIn. 4 fehlen in 1.54.0: Facebook, Instagram, Rounded, Youtube.

## DATEN
– (entfällt, Icon-Namen sind fest im Code.) Vorschlag bei Seiteninhalten mit Icon-Feld (Zeitleiste AboutUs.dc.html:92–96): Feld icon, Text mit Auswahl aus den 86 Schlüsseln, mehrsprachig nein (abgeleitet).

## FORMULARFELDER
– (entfällt; Props siehe ZUSTAENDE.)

## INTERAKTIONEN
– (entfällt, rein darstellend.)

## ZUSTAENDE
**Eigenschaften** (data-props, Icon.dc.html:12). n: Editor text, Default calendar, tsType string; freie Eingabe, unbekannter Wert wird info (Icon.dc.html:88). size: Editor int, Default 20, tsType number, ohne Grenzen; Einsätze 20 (153), 16 (45), 24 (44), 28 (24), 18 (8), 14 (6), 32 (5), 48 (2), 36 (1), 22 (1). $preview: 48 × 48, nur Editor.

**Zustände aus dem Design** (Icon wechselt): aufgeklappt chevron-up / chevron-down (PrayerTimesBar.dc.html:109); Passwort sichtbar eye-off / eye (LoginDialog.dc.html:79); Audio spielt pause / play (Quran.dc.html:102); geöffnet circle-check / geschlossen circle-x (Footer.dc.html:81); leer calendar, message-square, ticket (Events.dc.html:39; Dashboard.dc.html:66, 78); Erfolg circle-check 36 px (FormWizard.dc.html:18).

**Zustände aus dem Bestand**: Passwort EyeOff bei showPassword (Header.tsx:537); Audio Pause bei isPlaying (Quran.tsx:214); Globus-Icon dreht rotate-180 bei isOpen (EnhancedLanguageSwitcher.tsx:94); Standort laden (isLoadingLocation): Target mit animate-spin (PrayerTimes.tsx:303), im Design kein Gegenstück; Laden: CSS-Spinner statt Icon (Header.tsx:554).

## BILDER
– (entfällt; Zeichnungen sind Pfadzeichenfolgen in Icon.dc.html:16–84.)

## AUFFAELLIGKEITEN
1. stern8 mit 14 px (Footer.dc.html:27, :35, :43, :51; PageHeader.dc.html:22; BoardMembers.dc.html:30) verletzt „nie unter 16 px“ (01 Grundlagen.dc.html:140).
2. stroke-width 2 bei viewBox 24 ergibt 2 × size / 24 px (abgeleitet): 20 px = 1,67 px. Die Regel „Strich 2 px“ gilt nur bei 24 px.
3. Unbekannter Name fällt still auf info (Icon.dc.html:88); der Editor-Default calendar (Icon.dc.html:12) ist im Code nicht als Fallback hinterlegt (abgeleitet).
4. Gleicher Name, anderes Motiv in 1.54.0: CheckCircle (Dashboard.tsx:15) wird zu circle-check-big, Bundle hat circle-check (Icon.dc.html:37); Edit wird zu square-pen, Bundle hat pencil (Icon.dc.html:45).
5. Building (Bestand, AboutUs.tsx:7) fehlt im Bundle; das Design nutzt building-2 (AboutUs.dc.html:93). Das Design gilt für Gestalt.
6. Versionen widersprechen sich: Bestand 0.487.0 (uploads/igmg-wetzlar-website/package.json:43), web 1.54.0 (web/package.json:49), ADR 1.55.x (web/docs/adr/0001-versionen.md:41).
7. Erfolgs-Icon 36 px (FormWizard.dc.html:18) gegen 80 px im Bestand (MosqueRequest.tsx:298). Passwort-Umschalter 44 × 44 px (LoginDialog.dc.html:36) liegt unter der readme-Regel 48 px.

## OFFENE FRAGEN
1. Welche Lucide-Version gilt für die Umsetzung?
2. Wie werden die Markenicons umgesetzt, da lucide-react 1.54.0 sie nicht führt?
3. Bleibt Icon ein Wrapper mit Bundle-Pfaden, oder importiert der Code lucide-react direkt?
4. Strichstärke fest 2 oder skaliert (stroke-width = 48 / size, abgeleitet)?
5. Welche der 77 Bestandsnamen werden gebraucht, und ist ein Ladezustand gewollt?
6. Darf stern8 bei 14 px stehen?

=== ENDE C15 · BEREIT ZUR RÜCKGABE ===
