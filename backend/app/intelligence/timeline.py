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
    events = context.calendar_events if context.calendar_events else DEFAULT_SCHEDULE
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

        if max_rain_prob >= 75:
            risk = "red"
            title = f"Heavy Rain Hazard ({max_rain_prob}%)"
            details = f"Intense shower window projected between {ev.start_hour:02d}:00 and {ev.end_hour:02d}:00."
            action = "Carry sturdy rain gear or consider switching to Metro / indoor venue."
        elif max_rain_prob >= 40:
            risk = "amber"
            title = f"Moderate Shower Risk ({max_rain_prob}%)"
            details = f"Spot showers may intersect your schedule around {ev.start_hour:02d}:00."
            action = "Keep a compact umbrella handy; verify live radar before departing."
        elif max_aqi > 250:
            risk = "amber"
            title = f"Severe Air Pollution (AQI {max_aqi})"
            details = "Dense particulate concentration during peak atmospheric inversion."
            action = "Wear a well-fitted N95 respirator mask."
        elif max_temp > 38:
            risk = "amber"
            title = f"High Heat Stress ({max_temp}°C)"
            details = "Intense thermal radiation during midday."
            action = "Hydrate with electrolyte fluids; stay in shaded areas."
        elif max_uv > 8:
            risk = "yellow"
            title = f"Very High UV Index ({max_uv})"
            details = "Rapid sunburn risk under direct sun."
            action = "Apply SPF 50 sunscreen; wear UV sunglasses."
        else:
            risk = "green"
            title = "Optimal Weather Conditions"
            details = f"Comfortable temperature ({max_temp}°C) and clear skies."
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
