# Prayer Times & Adhan

A beautifully designed Islamic prayer times and adhan app that displays accurate prayer times for a given location, along with useful Islamic features — live countdowns, weekly schedules, adhan alerts, and a Qibla compass.

## Features

### Live prayer countdown
- Current prayer, next prayer, and the exact time remaining — updating every second.
- Animated countdown with progress ring through the current prayer's time window.
- Current local time for the selected location displayed alongside the countdown.

### Weekly schedule
- Today + next 7 days of prayer times, switchable between a **table view** and a **cards/day inspector view**.
- Day rail shows Gregorian date, Hijri date, and marks today.
- Fasting (sawm) window computed from Fajr to Maghrib for the selected day.
- Times respect the selected time format (12-hour / 24-hour).

### Adhan audio & notifications
- **Browser notifications** when it's time for (or shortly before) a prayer, with in-app active adhan alert showing the Arabic adhan text and translation.
- Per-prayer configuration for all five daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha):
  - Choose from multiple adhan sounds (Makkah adhan, Madinah call, Takbeer, spiritual chime, gentle beep) or silent alerts.
  - Set a reminder lead time (at prayer time, or 5 / 10 / 15 / 30 minutes before).
- Master switch to enable/disable all alerts, plus adjustable audio volume and quick mute.
- Preview any sound or run a **test adhan** from the notification settings.

### Qibla compass
- Direction and distance to the Kaaba (Bait al-Maqdis) from the active location, shown on an interactive compass.

### Prayer calculation settings
- Multiple calculation methods: Muslim World League, Umm Al-Qura, Egyptian, ISNA (North America), Karachi, Dubai, Kuwait, Qatar, Singapore, Tehran, Turkey, and Habous (Morocco).
- Asr calculation madhab: Shafi'i (standard) or Hanafi.
- High-latitude rule handling (Middle of the Night / Seventh of the Night / Twilight Angle).
- Manual minute adjustments for each prayer time (+/- minutes) to calibrate against a local mosque.
- Time format: 12-hour (AM/PM) or 24-hour.

### Locations & multi-city comparison
- Search cities worldwide (with region filters and popular-city catalog).
- Auto-detect your location via GPS.
- Save multiple locations and compare today's five prayer times across all saved cities.

### Language & theme
- Full English / Arabic (RTL) interface with localized prayer names, dates, and Hijri calendar.
- Light and dark themes, persisted and following system preference.

## Tech stack

- [React 19](https://react.dev/) + [Vite 8](https://vite.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/) + [lucide-react](https://lucide.dev/) icons
- [adhan](https://github.com/batoulapps/adhan) for astronomical prayer-time calculations
- Browser [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API) and Web Audio API for adhan sounds

## Getting started

### Prerequisites

- [Bun](https://bun.sh/) or Node.js (with your preferred package manager)
- A modern browser with support for the [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) and [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

### Installation

```bash
# install dependencies
bun install

# start the dev server (http://localhost:3000)
bun run dev
```

### Build & preview

```bash
# production build
bun run build

# preview the production build
bun run preview
```

### Lint

```bash
bun run lint
```

## Configuration (AI Studio)

The app is designed to run inside [Google AI Studio](https://aistudio.google.com/) as an app:

- `GEMINI_API_KEY` — required for Gemini AI API calls (configured via the AI Studio Secrets panel).
- `APP_URL` — the URL where the applet is hosted (auto-injected with the Cloud Run service URL; used for self-referential links and API endpoints).

See [`.env.example`](./.env.example) for reference. Without AI Studio, no extra configuration is required.

## Deployment notes

- Prayer times are computed locally via the `adhan` engine — no backend needed for scheduling.
- Adhan audio plays from files in [`public/`](./public) (e.g. `/adhan_aud.mp3`), with synthesized fallback audio if unavailable.
- Browser notification permission must be granted by the user for alerts to fire.

## Acknowledgements

- [Adhan](https://github.com/batoulapps/adhan) — Islamic prayer time calculation library.
- [Open-Meteo](https://open-meteo.com/) — free global geocoding API used for worldwide city search.
