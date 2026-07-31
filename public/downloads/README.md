# Desktop installer (not deployed via Vercel `public/`)
#
# Vercel cannot reliably host the ~150MB Electron NSIS `.exe` from `public/`,
# and `*.exe` is gitignored on purpose.
#
# Workflow:
# 1. npm run electron:build
# 2. Upload dist/desktop/Camino-Setup.exe to a GitHub Release
# 3. Set on Vercel:
#    NEXT_PUBLIC_DESKTOP_DOWNLOAD_URL=https://github.com/<user>/<repo>/releases/download/v0.1.0/Camino-Setup.exe
#
# Local path public/downloads/Camino-Setup.exe is only for local testing if you
# temporarily serve it yourself — do not commit the binary.
