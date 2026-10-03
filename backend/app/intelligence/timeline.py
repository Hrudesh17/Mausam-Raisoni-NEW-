from typing import List
from ..models.weather import WeatherResponse
from ..models.user_context import UserContext, CalendarEvent
from ..models.intelligence import RoutineWeatherImpact

DEFAULT_SCHEDULE = [
    CalendarEvent(id="c1", title="Morning Run / Walk", start_hour=6, end_hour=7, is_outdoor=True),
    CalendarEvent(id="c3", title="Work / Study (Indoor)", start_hour=10, end_hour=17, is_outdoor=False),
    CalendarEvent(id="c5", title="Evening Outdoor Recreation", start_hour=19, end_hour=21, is_outdoor=True),
]

def analyze_routine_impacts(weather: WeatherResponse, context: UserContext) -> List[RoutineWeatherImpact]:
    role_det = context.role_details or {}
    gardening_det = role_det.get("gardening", {}) if isinstance(role_det, dict) else {}
    raw_watering = str(gardening_det.get("watering_schedule", "Early Morning")).lower()

    if "gardening" in context.interests or context.persona == "farmer":
        events: List[CalendarEvent] = [
            CalendarEvent(id="g-1", title="Field Inspection & Crop Health Check", start_hour=6, end_hour=8, is_outdoor=True),
        ]
        if "afternoon" in raw_watering or "दोपहर" in raw_watering or "दुपारी" in raw_watering or "দুপুর" in raw_watering:
            events.append(CalendarEvent(id="g-water-noon", title="Afternoon Crop Irrigation Window", start_hour=12, end_hour=16, is_outdoor=True))
        elif "evening" in raw_watering or "शाम" in raw_watering or "संध्या" in raw_watering:
            events.append(CalendarEvent(id="g-water-eve", title="Late Evening Root Irrigation Window", start_hour=17, end_hour=20, is_outdoor=True))
        elif "twice" in raw_watering or "दो बार" in raw_watering or "दोनदा" in raw_watering:
            events.append(CalendarEvent(id="g-water-am", title="Morning Split Irrigation Slot", start_hour=6, end_hour=8, is_outdoor=True))
            events.append(CalendarEvent(id="g-water-pm", title="Evening Split Irrigation Slot", start_hour=17, end_hour=19, is_outdoor=True))
        else:
            events.append(CalendarEvent(id="g-water-morn", title="Early Morning Deep Irrigation Window", start_hour=5, end_hour=8, is_outdoor=True))

        events.append(CalendarEvent(id="g-3", title="Crop Spraying & Foliar Treatment", start_hour=8, end_hour=10, is_outdoor=True))
        events.append(CalendarEvent(id="g-4", title="Harvesting & Produce Handling", start_hour=16, end_hour=18, is_outdoor=True))
    elif context.calendar_events:
        events = context.calendar_events
    else:
        events = DEFAULT_SCHEDULE

    impacts: List[RoutineWeatherImpact] = []
    hourly_map = {h.hour: h for h in weather.hourly}

    for ev in events:
        if not ev.is_outdoor:
            impacts.append(
                RoutineWeatherImpact(
                    event_id=ev.id,
                    event_title=ev.title,
                    time_window=f"{ev.start_hour:02d}:00 - {ev.end_hour:02d}:00",
                    is_outdoor=False,
                    risk_level="green",
                    impact_title="Indoor Environment",
                    impact_details="Weather variations will not directly interfere with indoor activities.",
                    proactive_action="Keep ambient ventilation balanced.",
                )
            )
            continue

        hours_in_event = [hourly_map.get(h) for h in range(ev.start_hour, ev.end_hour) if h in hourly_map]
        max_rain_prob = max([h.precipitation_probability for h in hours_in_event], default=0)
        max_temp = max([h.temperature for h in hours_in_event], default=25.0)
        max_uv = max([h.uv_index for h in hours_in_event], default=0.0)
        max_aqi = max([h.aqi for h in hours_in_event], default=50)
        avg_wind = sum([h.wind_speed for h in hours_in_event]) / len(hours_in_event) if hours_in_event else 10.0

        is_afternoon_watering = "afternoon" in ev.title.lower() or "irrigation" in ev.title.lower() and ev.start_hour >= 12 and ev.end_hour <= 16

        if max_rain_prob >= 50:
            risk = "amber" if max_rain_prob < 75 else "red"
            title = f"Rain Expected ({max_rain_prob}%) — Hold Irrigation" if "irrigation" in ev.title.lower() else f"Rain Risk ({max_rain_prob}%)"
            details = f"Precipitation forecast during {ev.start_hour:02d}:00 - {ev.end_hour:02d}:00."
            action = "Hold artificial irrigation and allow natural rainfall to recharge soil." if "irrigation" in ev.title.lower() else "Delay spraying and outdoor field operations."
        elif is_afternoon_watering and (max_temp >= 33 or max_uv >= 6):
            risk = "amber"
            title = f"Midday Heat Stress & Evaporation ({max_temp}°C, UV {max_uv})"
            details = "Solar radiation drives 40%+ moisture evaporation loss and foliar leaf scorch."
            action = "Shift watering to Early Morning (5 AM – 8 AM) or Late Evening (5 PM – 8 PM) to conserve water."
        elif "spraying" in ev.title.lower() and avg_wind >= 18:
            risk = "amber"
            title = f"High Wind Spray Drift ({avg_wind:.1f} km/h)"
            details = "Strong crosswinds disperse chemicals away from crop canopy."
            action = "Postpone pesticide application until winds calm below 15 km/h."
        elif max_aqi > 250:
            risk = "amber"
            title = f"Severe Air Pollution (AQI {max_aqi})"
            details = "Dense particulate concentration during atmospheric inversion."
            action = "Wear a well-fitted N95 respirator mask during outdoor field work."
        elif max_temp > 38:
            risk = "amber"
            title = f"High Heat Stress ({max_temp}°C)"
            details = "Intense thermal radiation during midday."
            action = "Hydrate frequently; schedule heavy field tasks for early morning."
        elif max_uv > 8:
            risk = "yellow"
            title = f"Very High UV Index ({max_uv})"
            details = "Rapid sunburn risk under direct sun."
            action = "Apply SPF 50 sunscreen; wear wide-brim hat."
        else:
            risk = "green"
            title = "Optimal Weather Window"
            details = f"Comfortable temperature ({max_temp}°C) and favorable field conditions."
            action = "Proceed as scheduled with no weather interference."

        impacts.append(
            RoutineWeatherImpact(
                event_id=ev.id,
                event_title=ev.title,
                time_window=f"{ev.start_hour:02d}:00 - {ev.end_hour:02d}:00",
                is_outdoor=True,
                risk_level=risk,
                impact_title=title,
                impact_details=details,
                proactive_action=action,
            )
        )

    return impacts
