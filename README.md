# Studio Tool

A Notion-inspired study planner that automatically schedules your exam preparation based on your books, reading speed (pages/hour), exam dates, and daily availability.

## Features

- **Today Dashboard (`☀️ Oggi`)**: Focus on today's study blocks, track daily progress, and use the built-in Pomodoro timer (`25m` / `50m` / `5m`).
- **Adaptive Study Calendar (`🗓️ Calendario`)**: Weekly and monthly views with color-coded study blocks, exam countdown milestones, and one-click day blocking with automatic rescheduling.
- **Exams & Books Database (`🎯 Esami e Libri`)**: Manage multiple exams, set priorities, configure final review buffer days, and track reading progress and pages/hour per book.
- **Flexible Availability (`⏱️ Disponibilità`)**: Configure available study hours for each day of the week, max block duration per subject, and blocked dates/holidays.
- **Automatic Rescheduling**: Keeps completed blocks intact and redistributes remaining pages across available days before each exam, alerting you if the workload exceeds your available hours.
- **Local Persistence**: All data is saved automatically in `localStorage` with instant demo data to get started.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **Lucide React**

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```text
src/
├── components/
│   ├── AvailabilityView.tsx   # Weekly hours & blocked dates configuration
│   ├── CalendarView.tsx       # Weekly/monthly study calendar
│   ├── ExamsView.tsx          # Exams & books management
│   ├── PomodoroWidget.tsx     # Focus timer widget
│   ├── Sidebar.tsx            # Notion-style navigation sidebar
│   └── TodayView.tsx          # Daily focus dashboard
├── data/
│   └── defaultData.ts         # Initial demo exams and settings
├── utils/
│   ├── colors.ts              # Notion-inspired color palette
│   ├── dateUtils.ts           # Date formatting and helpers
│   └── scheduler.ts           # Adaptive multi-exam scheduling engine
├── App.tsx                    # Main application state and persistence
└── types.ts                   # TypeScript interfaces
```

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)** — see the [LICENSE](LICENSE) file for details.

