# MAUSAM (Powered by VayuSync Intelligence)
---

## 1. Product Architecture & Vision

```
                MAUSAM
                  │
        Official Weather Layer
                  │
                  ↓
        Weather Data / Telemetry
                  │
                  ↓
              VAYUSYNC
                  │
       Personalization Layer
                  │
                  ↓
        Decision Intelligence
                  │
                  ↓
     User-Specific Action Experience
```

- **MAUSAM Answers:** *"What is the weather?"*
- **VAYUSYNC Answers:** *"What does this weather mean for THIS USER?"* & *"What should THIS USER do about it?"*

### Two-Layer User Experience

1. **State 1: Standard Mausam (Default Platform)**
   - Authentic, complete national meteorological portal.
   - City search & GPS geolocation.
   - Comprehensive current conditions (Temp, Feels Like, High/Low, Humidity, Wind, Pressure, Visibility, UV, Sunrise/Sunset).
   - 24-Hour Hourly Forecast rail & 7-Day Outlook table.
   - Official IMD Weather Warning Bulletin (Green = No Warning, Yellow = Watch, Orange = Alert, Red = Warning).
   - Interactive Doppler Weather Radar & Satellite cloud view.
   - Non-intrusive invitation to personalize via VayuSync.

2. **State 2: VayuSync Personalized Mausam (Intelligence Layer)**
   - Activated seamlessly via the *"✨ Personalize Mausam"* onboarding modal.
   - User defines **Interests** (Multi-select: *Commute, Running, Travel, Events, Gardening, Beach, Health, Cycling*) and **Weather Priorities** (*Rain, Heat, AQI, UV, Wind*).
   - **Personalized Mausam Suitability Score (0–100)**: Dynamically calculated day score reflecting friction across the user's specific activities.
   - **Calendar & Schedule Conflict Detector**: Scans upcoming outdoor events (e.g. *"Outdoor Cricket at 5:00 PM: 70% Rain Alert"*) and recommends optimal alternate windows (e.g. *"Shift to 7:00 PM when rain probability drops to 20%"*).
   - **The "Should-I?" Decision Engine**: Evaluates questions like *"Should I carry an umbrella?"*, *"Can I wash my car?"*, *"Is it safe to ride my bike?"*.
   - **24-Hour Routine Synchronization**: Aligns the user's personal daily schedule with hourly weather shifts.
   - **VayuSync Sahayak (AI Assistant)**: Natural language conversational companion equipped with voice recognition (**Web Speech API**) and audio speech synthesis.

3. **Discreet Evaluator Controls (Judge Demo Drawer)**
   - Floating drawer accessible at the bottom-right for hackathon evaluation.
   - Simulates extreme meteorological edge cases (*Mumbai Monsoon Downpour*, *Delhi Winter Smog*, *Rajasthan Heatwave*, *Chennai Cyclone*).
   - One-click judge profile presets (*Commuter + Runner*, *Event Organizer + Travel*, *Krishi Mitra / Agriculture*).
   - 24-Hour timeline scrubber.

## 2. Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion, IndexedDB (`idb`), Web Speech API.
- **Backend**: Python 3.12, FastAPI, Pydantic v2, HTTPX, SQLAlchemy.
- **Data Providers**:
  - `BaseWeatherProvider` abstraction.
  - `IMDWeatherProvider` formatted to official Indian Meteorological Department specifications.
  - `OpenMeteoProvider` for live global and Indian telemetry without requiring API keys.
  - `MockWeatherProvider` for realistic Indian weather simulation scenarios.
- **Database**: PostgreSQL schema support with zero-setup automatic SQLite local fallback.
