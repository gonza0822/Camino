# App installers are NOT hosted on Vercel `public/`.
#
# Desktop (Electron): GitHub Releases + NEXT_PUBLIC_DESKTOP_DOWNLOAD_URL
# Android (Capacitor): Play Store / APK release + NEXT_PUBLIC_ANDROID_DOWNLOAD_URL
# iOS (Capacitor): App Store / TestFlight + NEXT_PUBLIC_IOS_DOWNLOAD_URL
#
# Sync native projects:
#   $env:CAMINO_APP_URL="https://tu-app.vercel.app"
#   npm run cap:sync
#   npm run cap:open:android   # or cap:open:ios on macOS
