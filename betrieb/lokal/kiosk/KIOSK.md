# Anzeige im Gebetsraum (Kiosk)

Ein Mini-PC oder Raspberry Pi 4/5 mit Bildschirm zeigt dauerhaft die Gebetszeiten-Anzeige der Website. Die Anzeige läuft
auch ohne Internet weiter (Service Worker hält die Seite und die Zeiten vor). Keine Anmeldung, keine Personendaten.

## Einrichtung (≈ 30 Minuten, Technik)
1. Raspberry Pi OS (64 Bit, „with desktop“) mit dem Raspberry Pi Imager auf eine SD-Karte schreiben; WLAN/LAN einrichten,
   Zeitzone „Europe/Berlin“, Benutzer `anzeige`.
2. Bildschirmschoner und Energiesparen ausschalten: `sudo raspi-config` → Display → Screen Blanking → Nein.
3. Datei `/home/anzeige/.config/labwc/autostart` (bzw. `~/.config/lxsession/LXDE-pi/autostart` bei älteren Versionen):
   ```
   chromium --kiosk --noerrdialogs --disable-infobars --check-for-update-interval=31536000 \
     --app=https://<domain der Gemeinde>/gebetszeiten/anzeige
   ```
   Türkisch: `…/tr/namaz-vakitleri/ekran`, Englisch: `…/en/prayer-times/display`.
4. Neu starten. Die Anzeige erscheint im Vollbild.

## Betrieb
- Iqama- und Freitagszeiten, Folien und Ruhephasen pflegt die Verwaltung unter „Anzeige“ (MENSCHEN MN-14).
- Im Gebetsfenster (Ezan bis Iqama + 15 Minuten) zeigt die Anzeige keine Folien (B-25).
- Fällt das Internet aus, laufen Uhr und Zeiten aus dem Vorrat weiter; nach der Rückkehr aktualisiert sich die Seite selbst.
