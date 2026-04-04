# Git for Windows / minimal environments: hooks often lack the user's PATH, so `pnpm`
# is missing even when Node is installed. Add Node dir (includes corepack), npm global, pnpm.
if command -v node >/dev/null 2>&1; then
  export PATH="$(dirname "$(command -v node)"):$PATH"
fi
[ -n "${APPDATA:-}" ] && [ -d "$APPDATA/npm" ] && export PATH="$APPDATA/npm:$PATH"
[ -n "${LOCALAPPDATA:-}" ] && [ -d "$LOCALAPPDATA/pnpm" ] && export PATH="$LOCALAPPDATA/pnpm:$PATH"
[ -n "${HOME:-}" ] && [ -d "$HOME/.local/share/pnpm" ] && export PATH="$HOME/.local/share/pnpm:$PATH"
[ -n "${PNPM_HOME:-}" ] && [ -d "$PNPM_HOME" ] && export PATH="$PNPM_HOME:$PATH"

# Prefer standalone pnpm; otherwise use Corepack (official Node install has no pnpm.exe on PATH).
pnpm_cmd() {
  if command -v pnpm >/dev/null 2>&1; then
    pnpm "$@"
  elif command -v corepack >/dev/null 2>&1; then
    corepack pnpm "$@"
  else
    echo "husky: neither pnpm nor corepack found; extend .husky/path.sh" >&2
    exit 127
  fi
}
