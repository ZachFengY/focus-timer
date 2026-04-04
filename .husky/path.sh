# Git for Windows / minimal environments: hooks often lack the user's PATH, so `pnpm`
# is missing even when Node is installed. Prepend locations where `pnpm` usually lives.
#
# IMPORTANT (Git Bash): Windows paths like ...\Roaming\npm must use forward slashes;
# otherwise `\n` in `\npm` is parsed as a newline and breaks PATH.

# Convert Windows backslashes to / so `\n` in `\npm` cannot break PATH (Git Bash).
_msys_path() {
  printf '%s' "$1" | tr '\\' '/'
}

# Node (includes corepack); must be first so npm works.
if command -v node >/dev/null 2>&1; then
  export PATH="$(_msys_path "$(dirname "$(command -v node)")"):$PATH"
fi

# npm global bin (pnpm from `npm install -g pnpm`: .../Roaming/npm/pnpm.cmd)
if [ -n "${APPDATA:-}" ]; then
  _ad="$(_msys_path "$APPDATA")"
  [ -d "$_ad/npm" ] && export PATH="$_ad/npm:$PATH"
fi
if [ -n "${USERPROFILE:-}" ]; then
  _up="$(_msys_path "$USERPROFILE")"
  [ -d "$_up/AppData/Roaming/npm" ] && export PATH="$_up/AppData/Roaming/npm:$PATH"
fi

# pnpm standalone / `pnpm setup` (append so it does not shadow npm global pnpm in Roaming/npm)
if [ -n "${LOCALAPPDATA:-}" ]; then
  _la="$(_msys_path "$LOCALAPPDATA")"
  [ -d "$_la/pnpm" ] && export PATH="$PATH:$_la/pnpm"
fi
if [ -n "${USERPROFILE:-}" ]; then
  _up="$(_msys_path "$USERPROFILE")"
  [ -d "$_up/AppData/Local/pnpm" ] && export PATH="$PATH:$_up/AppData/Local/pnpm"
fi

# Linux/macOS
[ -n "${HOME:-}" ] && [ -d "$HOME/.local/share/pnpm" ] && export PATH="$HOME/.local/share/pnpm:$PATH"

# User-configured (Windows Environment variables)
if [ -n "${PNPM_HOME:-}" ]; then
  _ph="$(_msys_path "$PNPM_HOME")"
  [ -d "$_ph" ] && export PATH="$_ph:$PATH"
fi

# npm prefix (global root)
if command -v npm >/dev/null 2>&1; then
  NPM_PREFIX="$(npm config get prefix 2>/dev/null | tr -d '\r')"
  if [ -n "$NPM_PREFIX" ]; then
    NPM_PREFIX="$(_msys_path "$NPM_PREFIX")"
    if [ -d "$NPM_PREFIX" ]; then
      export PATH="$NPM_PREFIX:$PATH"
      if [ -d "$NPM_PREFIX/bin" ]; then
        export PATH="$NPM_PREFIX/bin:$PATH"
      fi
    fi
  fi
fi
