from ..models.weather import WeatherResponse
from ..models.user_context import UserContext
from ..models.intelligence import ShouldIResponse

def evaluate_should_i(query: str, weather: WeatherResponse, context: UserContext) -> ShouldIResponse:
    q = query.lower()
    curr = weather.current
    rain_prob = curr.precipitation_probability
    temp = curr.temperature
    aqi = curr.aqi

    # Umbrella query
    if any(w in q for w in ["umbrella", "raincoat", "rain gear", "chhaata"]) or ("rain" in q and any(w in q for w in ["carry", "take", "need"])):
        if rain_prob >= 60 or curr.precipitation > 1.0:
            return ShouldIResponse(
                query=query,
                verdict="YES",
                headline="Carry an umbrella or rain gear.",
                reason=f"Rain probability is high at {rain_prob}%, with active precipitation potential ({curr.precipitation} mm).",
                tip="Keep a compact umbrella in your daily bag and protect electronic devices in water-resistant sleeves.",
                confidence=0.95,
                data_points={"Precipitation Probability": f"{rain_prob}%", "Current Condition": curr.condition_text},
            )
        elif rain_prob >= 30:
            return ShouldIResponse(
                query=query,
                verdict="CONDITIONAL",
                headline="Keep a light umbrella handy as a precaution.",
                reason=f"There is a {rain_prob}% chance of spot showers later in the day.",
                tip="Check the hourly timeline before leaving your venue in the afternoon.",
                confidence=0.85,
                data_points={"Precipitation Probability": f"{rain_prob}%", "Humidity": f"{curr.humidity}%"},
            )
        else:
            return ShouldIResponse(
                query=query,
                verdict="NO",
                headline="No umbrella needed today.",
                reason=f"Rain probability is minimal ({rain_prob}%), with clear/dry conditions prevailing.",
                tip="Enjoy unencumbered travel under clear skies!",
                confidence=0.92,
                data_points={"Precipitation Probability": f"{rain_prob}%", "Condition": curr.condition_text},
            )

    # Car wash query
    if ("wash" in q and "car" in q) or ("car" in q and "clean" in q) or ("vehicle" in q and "wash" in q):
        # Look at next 48h rain
        next_day_rain = weather.daily[1].precipitation_probability if len(weather.daily) > 1 else 0
        if rain_prob > 35 or next_day_rain > 40:
            return ShouldIResponse(
                query=query,
                verdict="NO",
                headline="Hold off on washing your vehicle today.",
                reason=f"Rain is forecast within the next 24-48 hours ({max(rain_prob, next_day_rain)}% chance), which will spoil freshly cleaned paint.",
                tip="Wait for the dry front approaching in 2-3 days before deep exterior detailing.",
                confidence=0.88,
                data_points={"Today's Rain Risk": f"{rain_prob}%", "Tomorrow's Rain Risk": f"{next_day_rain}%"},
            )
        elif aqi > 250:
            return ShouldIResponse(
                query=query,
                verdict="CAUTION",
                headline="Quick rinse only; avoid expensive detailing.",
                reason=f"High particulate matter (AQI {aqi}) will leave a visible layer of settling dust within 12 hours.",
                tip="A quick microfiber dust-off is more economical today than a full water wash.",
                confidence=0.82,
                data_points={"AQI": str(aqi), "PM2.5": f"{curr.pm2_5} µg/m³"},
            )
        else:
            return ShouldIResponse(
                query=query,
                verdict="YES",
                headline="Ideal day for washing your car!",
                reason="Dry skies and low rain probability over the next 48 hours ensure your vehicle stays clean.",
                tip="Wash in early morning or shaded areas to prevent water spotting under sunlight.",
                confidence=0.94,
                data_points={"Rain Probability": f"{rain_prob}%", "UV Index": str(curr.uv_index)},
            )


    # Running / Outdoor workout query
    if any(w in q for w in ["run", "workout", "exercise", "jog", "walk", "marathon"]):
        if aqi > 250:
            return ShouldIResponse(
                query=query,
                verdict="NO",
                headline="Strictly avoid outdoor cardiovascular running.",
                reason=f"Severe air quality index of {aqi} ({curr.aqi_category}) causes heavy deep-lung particulate inhalation during exertion.",
                tip="Switch to an indoor treadmill, yoga, or home resistance training session.",
                confidence=0.96,
                data_points={"AQI": str(aqi), "PM2.5": f"{curr.pm2_5} µg/m³"},
            )
        elif temp > 36:
            return ShouldIResponse(
                query=query,
                verdict="CONDITIONAL",
                headline="Only run before 06:45 AM or indoors.",
                reason=f"Surface temperature of {temp}°C (feels like {curr.feels_like}°C) poses rapid dehydration and heat exhaustion risk.",
                tip="Hydrate with electrolyte fluids before stepping out and wear breathable light fabrics.",
                confidence=0.90,
                data_points={"Temperature": f"{temp}°C", "Feels Like": f"{curr.feels_like}°C"},
            )
        else:
            return ShouldIResponse(
                query=query,
                verdict="YES",
                headline="Great time for your outdoor run!",
                reason=f"Optimal conditions: temperature {temp}°C, AQI {aqi}, and comfortable humidity.",
                tip="Best window is within the next 2 hours while solar UV radiation is low.",
                confidence=0.93,
                data_points={"Temperature": f"{temp}°C", "AQI": str(aqi)},
            )

    # Crop irrigation / Farming query
    if any(w in q for w in ["water crops", "irrigate", "irrigation", "khet", "crop", "spray"]):
        if "spray" in q:
            if curr.wind_speed > 15 or rain_prob > 35:
                return ShouldIResponse(
                    query=query,
                    verdict="NO",
                    headline="Postpone pesticide / fungicide spraying.",
                    reason=f"Wind speed ({curr.wind_speed} km/h) exceeds chemical drift threshold or rain risk ({rain_prob}%) causes foliar runoff.",
                    tip="Plan spraying for early morning calm hours when wind drops below 12 km/h.",
                    confidence=0.91,
                    data_points={"Wind Speed": f"{curr.wind_speed} km/h", "Rain Risk": f"{rain_prob}%"},
                )
            else:
                return ShouldIResponse(
                    query=query,
                    verdict="YES",
                    headline="Optimal window for crop spraying.",
                    reason="Calm air and zero rain ensures 100% active ingredient absorption on plant foliage.",
                    tip="Complete spraying between 06:30 AM and 09:30 AM before temperatures rise.",
                    confidence=0.94,
                    data_points={"Wind Speed": f"{curr.wind_speed} km/h", "Rain Risk": f"{rain_prob}%"},
                )
        else:
            if rain_prob > 60:
                return ShouldIResponse(
                    query=query,
                    verdict="NO",
                    headline="Do not irrigate fields today.",
                    reason=f"Natural rainfall ({rain_prob}% chance) will supply sufficient soil moisture, preventing root rot and electricity wastage.",
                    tip="Save tube-well electricity and diesel pumping costs.",
                    confidence=0.90,
                    data_points={"Rain Probability": f"{rain_prob}%", "Soil Moisture": "High"},
                )
            else:
                return ShouldIResponse(
                    query=query,
                    verdict="YES",
                    headline="Schedule evening canal or drip irrigation.",
                    reason="Low soil moisture replenishment and dry atmospheric front.",
                    tip="Irrigate during evening hours to minimize solar evaporation loss.",
                    confidence=0.88,
                    data_points={"Temperature": f"{temp}°C", "Humidity": f"{curr.humidity}%"},
                )

    # Outdoor Event / Wedding query
    if any(w in q for w in ["event", "wedding", "party", "reception", "function", "outdoor"]):
        if rain_prob > 45 or curr.wind_speed > 30:
            return ShouldIResponse(
                query=query,
                verdict="CAUTION",
                headline="Ensure waterproof canopies and wind anchors.",
                reason=f"Rain threat ({rain_prob}%) or wind gusts ({curr.wind_speed} km/h) could disrupt open-sky banquet arrangements.",
                tip="Have an indoor banquet hall or waterproof marquee standby ready.",
                confidence=0.89,
                data_points={"Rain Risk": f"{rain_prob}%", "Wind Speed": f"{curr.wind_speed} km/h"},
            )
        else:
            return ShouldIResponse(
                query=query,
                verdict="YES",
                headline="Wonderful weather for your outdoor event.",
                reason=f"Pleasant evening conditions with negligible rain risk ({rain_prob}%) and gentle breeze.",
                tip="Outdoor lighting and open lawns will perform splendidly.",
                confidence=0.93,
                data_points={"Rain Risk": f"{rain_prob}%", "Temperature": f"{temp}°C"},
            )

    # General / Fallback evaluation
    verdict = "YES" if (rain_prob < 30 and aqi < 150 and temp < 35) else "CAUTION"
    return ShouldIResponse(
        query=query,
        verdict=verdict,
        headline=f"Weather favors this with mild precautions." if verdict == "YES" else "Exercise moderate weather awareness.",
        reason=f"Current conditions at {weather.location.name}: {temp}°C, {curr.condition_text}, AQI {aqi}, Rain risk {rain_prob}%.",
        tip="Review the 24-hour timeline to identify the calmest window for this activity.",
        confidence=0.80,
        data_points={"Temperature": f"{temp}°C", "Condition": curr.condition_text, "AQI": str(aqi)},
    )
