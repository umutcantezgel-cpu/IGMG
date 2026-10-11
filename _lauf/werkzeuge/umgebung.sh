# Gemeinsame Umgebung für alle Befehle des Laufs: `source _lauf/werkzeuge/umgebung.sh`
export PATH="$HOME/.local/bin:/Applications/Docker.app/Contents/Resources/bin:$PATH"
export NEXT_TELEMETRY_DISABLED=1
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# Docker ohne Keychain-Credential-Helper (der Helper blockiert ohne Bildschirm-Bestätigung; anonyme Pulls genügen)
export DOCKER_CONFIG="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)/docker-config"
