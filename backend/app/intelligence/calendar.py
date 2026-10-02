from typing import List, Optional
from ..models.weather import WeatherResponse, HourlyForecast
from ..models.user_context import UserContext, CalendarEvent
from ..models.intelligence import CalendarConflict

def detect_calendar_conflicts(weather: WeatherResponse, context: UserContext) -> List[CalendarConflict]:
    """
    Examines the user's scheduled calendar events against the hourly weather forecast.
    Detects rain, heat, and severe weather clashes and suggests optimal alternate windows.
    """
    conflicts: List[CalendarConflict] = []
    hourly_map = {h.hour: h for h in weather.hourly}
    events = context.calendar_events or []

    for ev in events:
        if not ev.is_outdoor:
            continue

        date_prefix = f"{ev.date} • " if ev.date else ""
        scheduled_label = f"{date_prefix}{ev.start_hour:02d}:00 - {ev.end_hour:02d}:00"

        # Check if ev.date matches a future forecast day in weather.daily
        matched_daily = None
        if ev.date and weather.daily:
            matched_daily = next((d for d in weather.daily if d.date == ev.date), None)

        if matched_daily:
            max_rain_prob = matched_daily.precipitation_probability
            max_temp = matched_daily.temp_max
            max_aqi = 50
        else:
            hours_in_event = [hourly_map.get(h) for h in range(ev.start_hour, ev.end_hour) if h in hourly_map]
            if not hours_in_event:
                continue
            max_rain_prob = max([h.precipitation_probability for h in hours_in_event], default=0)
            max_temp = max([h.temperature for h in hours_in_event], default=25.0)
            max_aqi = max([h.aqi for h in hours_in_event], default=50)

        # 1. Rain Conflict
        if max_rain_prob >= 60:
            # Find an alternate window later or earlier
            alt_window = None
            for h in range(ev.start_hour + 1, min(24, ev.start_hour + 6)):
                alt_h = hourly_map.get(h)
                if alt_h and alt_h.precipitation_probability < 30:
                    alt_window = f"{h:02d}:00 - {h + (ev.end_hour - ev.start_hour):02d}:00"
                    break

            conflicts.append(
                CalendarConflict(
                    event_id=ev.id,
                    event_title=ev.title,
                    scheduled_time=scheduled_label,
                    risk_type="rain",
                    severity="high" if max_rain_prob >= 75 else "moderate",
                    conflict_summary=f"High precipitation risk ({max_rain_prob}%) will directly impact outdoor activity on {ev.date or 'scheduled date'}.",
                    suggested_alternate_time=alt_window,
                    suggested_action=(
                        f"Consider moving '{ev.title}' to {alt_window} when rain risk drops to &lt;30%."
                        if alt_window
                        else "Arrange a covered or indoor venue standby."
                    ),
                )
            )
        # 2. Extreme Heat Conflict
        elif max_temp >= 40:
            conflicts.append(
                CalendarConflict(
                    event_id=ev.id,
                    event_title=ev.title,
                    scheduled_time=scheduled_label,
                    risk_type="heat",
                    severity="high",
                    conflict_summary=f"Extreme solar heat ({max_temp}°C) creates severe dehydration risk.",
                    suggested_alternate_time="06:30 - 08:00 (Morning)",
                    suggested_action="Reschedule to early morning or after sunset; ensure hydration stations.",
                )
            )
        # 3. Severe Smog / AQI Conflict
        elif max_aqi >= 300:
            conflicts.append(
                CalendarConflict(
                    event_id=ev.id,
                    event_title=ev.title,
                    scheduled_time=f"{ev.start_hour:02d}:00 - {ev.end_hour:02d}:00",
                    risk_type="air_quality",
                    severity="high",
                    conflict_summary=f"Severe AQI ({max_aqi}) poses heavy pulmonary strain during exertion.",
                    suggested_alternate_time="Postpone until ventilation improves",
                    suggested_action="Move activity indoors to a filtered environment.",
                )
            )

    return conflicts
