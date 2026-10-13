# Überwachung (ADR 0036): prüft /api/health alle 5 Minuten; nach drei Fehlschlägen Mail an die Technik.
FROM alpine:3.22
RUN apk add --no-cache curl msmtp tzdata
ENV TZ=Europe/Berlin
CMD ["/bin/sh", "/ueberwachung/ueberwachen.sh"]
