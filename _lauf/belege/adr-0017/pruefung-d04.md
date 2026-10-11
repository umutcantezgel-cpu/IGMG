# ADR 0017 – Prüfauftrag D04 · 2026-10-11 03:35 · Build 2J6_RhudHG_9sBvkbgw_a

1. Vor der Änderung, Detail-h1: `Arabisch Sprachkurs`
2. Titel nur in der DB geändert, ohne Erneuerung – Detail-h1: `Arabisch Sprachkurs` · Treffer in Liste: 0
3. Wartungsroute ohne Token: HTTP 401
4. Wartungsroute mit falschem Token: HTTP 401
5. Wartungsroute mit Token: HTTP 200
6. Danach Detail-h1 (de): `Arabisch Sprachkurs (DB geändert)`
7. Danach Detail-h1 (tr, Rückfall de): `Arabisch Sprachkurs (DB geändert)`
8. Danach Treffer in Liste: 1
9. Danach iCal-Feed: `SUMMARY:[Beispielinhalt] Arabisch Sprachkurs (DB geändert)`
10. Zurückgesetzt und erneuert – Detail-h1: `Arabisch Sprachkurs` · Treffer in Liste: 0
