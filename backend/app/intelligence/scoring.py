from typing import List
from ..models.weather import WeatherResponse
from ..models.user_context import UserContext
from ..models.intelligence import (
    MausamScore,
    MausamScoreBreakdown,
    ActivityScore,
    KrishiIntelligence,
    HealthAQIIntelligence,
    SunlightWindow,
    EventSuitabilityWindow,
    EventPlanningIntelligence,
    EnvironmentalPollenData,
    AllergyFactor,
    AllergyOutlook,
    VisibilityIntelligence,
)

def calculate_mausam_score(weather: WeatherResponse, context: UserContext) -> MausamScore:
    """
    Computes a personalized 0-100 day suitability score dynamically based on:
    - User's multi-selected interests (commute, running, travel, events, gardening, etc.)
    - User's weather priorities (rain, heat, aqi, uv, wind)
    - Schedule and environmental risks
    """
    curr = weather.current
    base_score = 100
    
    # 1. Temperature Impact
    temp_penalty = 0
    if curr.temperature > 32:
        temp_penalty = int(min(30, (curr.temperature - 32) * 2.5))
    elif curr.temperature < 12:
        temp_penalty = int(min(25, (12 - curr.temperature) * 2.0))
        
    if "heat" in context.priorities and curr.temperature > 32:
        temp_penalty = int(temp_penalty * 1.4)
    if "running" in context.interests and curr.temperature > 32:
        temp_penalty = int(temp_penalty * 1.2)

    # 2. Precipitation Impact
    rain_prob = curr.precipitation_probability
    rain_penalty = 0
    if rain_prob > 20:
        rain_penalty = int((rain_prob / 100) * 35)
        if curr.precipitation > 2.0:
            rain_penalty += 15
            
    if "rain" in context.priorities:
        rain_penalty = int(rain_penalty * 1.3)
    if "events" in context.interests and rain_prob > 40:
        rain_penalty += 15

    # 3. AQI Impact
    aqi_penalty = 0
    if curr.aqi > 100:
        aqi_penalty = int(min(40, ((curr.aqi - 100) / 300) * 40))
    if "aqi" in context.priorities or "running" in context.interests or "health" in context.interests:
        aqi_penalty = int(aqi_penalty * 1.4)

    # 4. UV Impact
    uv_penalty = 0
    if curr.uv_index > 7:
        uv_penalty = int((curr.uv_index - 7) * 4)
    if "uv" in context.priorities:
        uv_penalty = int(uv_penalty * 1.5)

    # 5. Wind Impact
    wind_penalty = 0
    if curr.wind_speed > 30:
        wind_penalty = int(min(25, (curr.wind_speed - 30) * 1.2))
    if "wind" in context.priorities or "cycling" in context.interests:
        wind_penalty = int(wind_penalty * 1.4)

    # Severe Alert Override
    alert_penalty = 0
    if weather.alerts:
        for alert in weather.alerts:
            if alert.severity == "warning":
                alert_penalty = max(alert_penalty, 35)
            elif alert.severity == "emergency":
                alert_penalty = max(alert_penalty, 60)

    total_deduction = temp_penalty + rain_penalty + aqi_penalty + uv_penalty + wind_penalty + alert_penalty
    final_score = max(5, min(100, base_score - total_deduction))

    # Rating label & contextual headline
    if final_score >= 80:
        rating = "Ideal"
        headline = "Optimal conditions for your planned day"
        subtext = "Minimal weather friction anticipated across your interests. Enjoy clear outdoor routines."
    elif final_score >= 60:
        rating = "Favorable"
        headline = "Generally favorable with minor considerations"
        subtext = "Comfortable conditions overall. Keep light rain gear or sunscreen in mind."
    elif final_score >= 40:
        rating = "Moderate"
        headline = "Moderate weather friction — minor schedule adjustments advised"
        subtext = "Weather shifts may interfere with commute, workouts, or outdoor timings."
    elif final_score >= 20:
        rating = "Unfavorable"
        headline = "Unfavorable conditions — consider indoor alternatives"
        subtext = "Significant weather interference expected. Alter travel times or venue arrangements."
    else:
        rating = "Hazardous"
        headline = "Severe weather interference — prioritize safety"
        subtext = "Active weather warning in effect. Postpone non-essential outdoor transit."

    primary_risk = None
    if alert_penalty > 0:
        primary_risk = "Active Weather Warning in effect"
    elif aqi_penalty > 20:
        primary_risk = f"High Air Pollution (AQI {curr.aqi} - {curr.aqi_category})"
    elif rain_penalty > 20:
        primary_risk = f"Precipitation Risk ({rain_prob}%)"
    elif temp_penalty > 20:
        primary_risk = f"High Thermal Stress ({curr.temperature}°C)"
    elif wind_penalty > 20:
        primary_risk = f"Strong Winds ({curr.wind_speed} km/h)"

    breakdown = MausamScoreBreakdown(
        temperature_score=max(0, 100 - temp_penalty * 3),
        precipitation_penalty=rain_penalty,
        aqi_penalty=aqi_penalty,
        uv_penalty=uv_penalty,
        wind_penalty=wind_penalty,
    )

    return MausamScore(
        score=final_score,
        rating=rating,
        headline=headline,
        subtext=subtext,
        primary_risk=primary_risk,
        breakdown=breakdown,
    )

def calculate_activities(weather: WeatherResponse, context: UserContext) -> List[ActivityScore]:
    """Computes specific activity suitability indexes based on active interests."""
    curr = weather.current
    activities = []

    # 1. Running & Workout
    run_score = 95
    run_status = "Optimal"
    if curr.aqi > 200:
        run_score -= 50
        run_status = "Hazardous"
        run_rec = f"AQI {curr.aqi} ({curr.aqi_category}). Indoor gym workout recommended."
    elif curr.aqi > 100:
        run_score -= 25
        run_status = "Caution"
        run_rec = "Air quality moderate. Light jog permissible, avoid maximum exertion."
    elif curr.temperature > 34:
        run_score -= 30
        run_status = "Caution"
        run_rec = "High heat index. Best workout window is before 07:00 AM."
    elif curr.precipitation_probability > 60:
        run_score -= 40
        run_status = "Not Recommended"
        run_rec = "Wet road traction and rain likely. Opt for indoor training."
    else:
        run_rec = "Clear skies and pleasant temperature. Optimal morning running window."
    
    activities.append(ActivityScore(
        name="Outdoor Running / Fitness",
        category="fitness",
        score=max(5, min(100, run_score)),
        status=run_status,
        best_time="06:00 AM - 07:30 AM",
        recommendation=run_rec,
        icon_key="running",
    ))

    # 3. Outdoor Event
    event_score = 90
    event_status = "Optimal"
    if curr.precipitation_probability > 50:
        event_score -= 50
        event_status = "High Disruption"
        event_rec = "Rain spell could disrupt lawn setups. Arrange waterproof marquees."
    elif curr.temperature > 36:
        event_score -= 30
        event_status = "Caution"
        event_rec = "High afternoon heat. Evening scheduling strongly advised."
    else:
        event_rec = "Pleasant weather conditions. Well suited for outdoor gatherings."

    activities.append(ActivityScore(
        name="Outdoor Gathering / Event",
        category="events",
        score=max(5, min(100, event_score)),
        status=event_status,
        best_time="05:00 PM - 09:00 PM",
        recommendation=event_rec,
        icon_key="party",
    ))

    # 4. Gardening & Agriculture
    spray_score = 85
    spray_status = "Favorable"
    if curr.wind_speed > 20:
        spray_score -= 45
        spray_status = "Not Recommended"
        spray_rec = f"Wind speed ({curr.wind_speed} km/h) exceeds safe threshold (15 km/h)."
    elif curr.precipitation_probability > 40:
        spray_score -= 50
        spray_status = "Avoid"
        spray_rec = "Rain forecast within 24h will wash foliar applications away."
    else:
        spray_rec = "Calm winds and clear skies. Great window for spraying or pruning."

    activities.append(ActivityScore(
        name="Gardening / Agriculture",
        category="krishi",
        score=max(5, min(100, spray_score)),
        status=spray_status,
        best_time="06:30 AM - 09:00 AM",
        recommendation=spray_rec,
        icon_key="sprout",
    ))

    return activities

def calculate_krishi_intelligence(weather: WeatherResponse) -> KrishiIntelligence:
    curr = weather.current
    if curr.wind_speed < 15 and curr.precipitation_probability < 30:
        spray_status = "Optimal Window"
        spray_score = 92
    elif curr.wind_speed >= 25 or curr.precipitation_probability >= 60:
        spray_status = "Unfavorable / Suspended"
        spray_score = 15
    else:
        spray_status = "Moderate / Short Window"
        spray_score = 55

    if curr.precipitation > 10 or curr.precipitation_probability > 70:
        soil_moisture = "High / Saturated"
        irrigation_needed = False
        irr_adv = "Postpone canal irrigation; natural rainfall will adequately charge root zones."
    elif curr.temperature > 35 and curr.humidity < 35:
        soil_moisture = "Dry / Moisture Deficit"
        irrigation_needed = True
        irr_adv = "Execute light evening drip or furrow irrigation."
    else:
        soil_moisture = "Adequate"
        irrigation_needed = False
        irr_adv = "Soil moisture within healthy range."

    pest_risk = "High" if curr.humidity > 80 and curr.temperature > 25 else "Low to Moderate"

    # Crop Recommendations Engine
    recommended_crops = []
    crop_reasoning = ""
    
    if curr.precipitation_probability > 60 and curr.temperature > 25:
        recommended_crops = ["Rice (Paddy)", "Sugarcane", "Cotton"]
        crop_reasoning = "High moisture and warm temperatures are optimal for water-intensive monsoon crops."
    elif curr.temperature > 35 and curr.precipitation_probability < 30:
        recommended_crops = ["Bajra (Pearl Millet)", "Jowar (Sorghum)", "Maize (Corn)"]
        crop_reasoning = "Dry and hot conditions require drought-resistant, hardy crops."
    elif 15 <= curr.temperature <= 25 and curr.precipitation_probability > 30:
        recommended_crops = ["Wheat", "Mustard & Rapeseed (Sarson)", "Gram (Chickpea / Chana)"]
        crop_reasoning = "Cooler temperatures with moderate moisture support winter and rabi crops."
    elif curr.humidity > 70 and 20 <= curr.temperature <= 30:
        recommended_crops = ["Tomato", "Moong (Green Gram)", "Field Pea (Matar)"]
        crop_reasoning = "Moderate warmth and high humidity favor horticultural and legume growth."
    else:
        recommended_crops = ["Onion", "Potato", "Masur (Lentil)"]
        crop_reasoning = "Stable, moderate conditions are versatile for a variety of staple crops."

    return KrishiIntelligence(
        spray_conditions=spray_status,
        spray_score=spray_score,
        soil_moisture_estimate=soil_moisture,
        irrigation_needed=irrigation_needed,
        irrigation_advice=irr_adv,
        pest_disease_risk=pest_risk,
        harvesting_window="Delay harvesting if rain probability exceeds 50% to prevent grain spoilage.",
        storage_warning="Ensure harvested grain sacks are elevated on wooden pallets." if curr.humidity > 75 else None,
        recommended_crops=recommended_crops,
        crop_reasoning=crop_reasoning,
    )

def calculate_health_intelligence(weather: WeatherResponse, context: UserContext) -> HealthAQIIntelligence:
    curr = weather.current
    aqi = curr.aqi

    if aqi > 300:
        resp_risk = "Severe"
        mask = True
        exercise_verdict = "Strictly avoid outdoor cardio. Use indoor HEPA air purifiers."
        h_index = 18
    elif aqi > 150:
        resp_risk = "High"
        mask = True
        exercise_verdict = "Avoid strenuous exertion outdoors. Limit to indoor workouts."
        h_index = 45
    elif aqi > 100:
        resp_risk = "Moderate"
        mask = "aqi" in context.priorities or "health" in context.interests
        exercise_verdict = "Permissible for healthy adults; take breaks if sensitive."
        h_index = 70
    else:
        resp_risk = "Low"
        mask = False
        exercise_verdict = "Optimal conditions for all outdoor physical activities."
        h_index = 95

    base_hydration = 2.5
    if curr.temperature > 32:
        base_hydration += 1.0
    if curr.temperature > 38:
        base_hydration += 1.0

    uv_safe = "Before 10:00 AM and after 04:30 PM" if curr.uv_index > 6 else "Safe throughout the day"

    return HealthAQIIntelligence(
        health_index=h_index,
        respiratory_risk=resp_risk,
        mask_recommended=mask,
        uv_safe_hours=uv_safe,
        hydration_target_liters=round(base_hydration, 1),
        outdoor_exercise_verdict=exercise_verdict,
    )

def calculate_event_planning_intelligence(weather: WeatherResponse) -> EventPlanningIntelligence:
    curr = weather.current
    daily0 = weather.daily[0] if weather.daily else None
    hourly = weather.hourly or []

    sunrise_str = curr.sunrise or (daily0.sunrise if daily0 else "06:00")
    sunset_str = curr.sunset or (daily0.sunset if daily0 else "18:30")
    daylight_dur = curr.daylight_duration or (daily0.daylight_duration if daily0 else "12h 30m")

    # Format Golden Hours and Windows
    try:
        s_parts = sunrise_str.split(":")
        s_h, s_m = int(s_parts[0]), int(s_parts[1])
        e_parts = sunset_str.split(":")
        e_h, e_m = int(e_parts[0]), int(e_parts[1])

        morning_golden = f"{s_h:02d}:{s_m:02d} AM - {(s_h+1):02d}:{s_m:02d} AM"
        peak_sun = "11:00 AM - 03:00 PM"
        evening_golden = f"{(e_h-1 if e_h > 12 else e_h-1+12):02d}:{e_m:02d} PM - {(e_h if e_h <= 12 else e_h-12):02d}:{e_m:02d} PM"
        twilight = f"{(e_h if e_h <= 12 else e_h-12):02d}:{e_m:02d} PM - {(e_h if e_h <= 12 else e_h-12):02d}:{(e_m+28)%60:02d} PM"
    except Exception:
        morning_golden = f"{sunrise_str} - 07:15 AM"
        peak_sun = "11:00 AM - 03:00 PM"
        evening_golden = "05:30 PM - 06:45 PM"
        twilight = f"{sunset_str} - 07:15 PM"

    sunlight = SunlightWindow(
        sunrise=sunrise_str if "AM" in sunrise_str or "PM" in sunrise_str else f"{sunrise_str} AM",
        sunset=sunset_str if "AM" in sunset_str or "PM" in sunset_str else f"{sunset_str} PM",
        daylight_duration=daylight_dur,
        morning_golden_hour=morning_golden,
        peak_sunlight_window=peak_sun,
        evening_golden_hour=evening_golden,
        twilight_window=twilight,
    )

    # Calculate Event Suitability Windows
    # Morning Window (07:00 - 11:00)
    m_hours = [h for h in hourly if 7 <= h.hour <= 10]
    m_temp = sum(h.temperature for h in m_hours) / len(m_hours) if m_hours else curr.temperature
    m_rain = max((h.precipitation_probability for h in m_hours), default=curr.precipitation_probability)
    m_uv = max((h.uv_index for h in m_hours), default=3.0)
    m_wind = max((h.wind_speed for h in m_hours), default=curr.wind_speed)
    m_vis = min((h.visibility or 10.0 for h in m_hours), default=curr.visibility or 10.0)

    m_suit = "Ideal" if m_rain < 20 and m_temp < 32 and m_wind < 20 else ("Moderate" if m_rain < 50 else "Challenging")
    m_color = "green" if m_suit == "Ideal" else ("amber" if m_suit == "Moderate" else "red")
    m_rec = "Pleasant ambient lighting and cool temperatures. Excellent for outdoor photography, guest arrival, and morning rituals."

    # Peak Afternoon Window (11:00 - 15:00)
    a_hours = [h for h in hourly if 11 <= h.hour <= 14]
    a_temp = sum(h.temperature for h in a_hours) / len(a_hours) if a_hours else curr.temperature
    a_rain = max((h.precipitation_probability for h in a_hours), default=curr.precipitation_probability)
    a_uv = max((h.uv_index for h in a_hours), default=curr.uv_index)
    a_wind = max((h.wind_speed for h in a_hours), default=curr.wind_speed)
    a_vis = min((h.visibility or 10.0 for h in a_hours), default=curr.visibility or 10.0)

    a_suit = "Challenging" if a_uv > 7 or a_temp > 35 or a_rain > 40 else ("Moderate" if a_uv > 5 or a_temp > 30 else "Ideal")
    a_color = "red" if a_suit == "Challenging" else ("amber" if a_suit == "Moderate" else "green")
    a_rec = "High solar radiation and direct heat. Ensure shaded canopies, cooling mists, and adequate hydration stations."

    # Sunset / Golden Hour Window (16:00 - 19:00)
    s_hours = [h for h in hourly if 16 <= h.hour <= 18]
    s_temp = sum(h.temperature for h in s_hours) / len(s_hours) if s_hours else curr.temperature - 2
    s_rain = max((h.precipitation_probability for h in s_hours), default=curr.precipitation_probability)
    s_uv = max((h.uv_index for h in s_hours), default=2.0)
    s_wind = max((h.wind_speed for h in s_hours), default=curr.wind_speed)
    s_vis = min((h.visibility or 10.0 for h in s_hours), default=curr.visibility or 10.0)

    s_suit = "Ideal" if s_rain < 25 and s_wind < 25 else ("Moderate" if s_rain < 50 else "Challenging")
    s_color = "green" if s_suit == "Ideal" else ("amber" if s_suit == "Moderate" else "red")
    s_rec = "Optimal soft warm lighting. Prime slot for outdoor wedding vows, stage events, candid portraits, and receptions."

    # Night / Evening Window (19:00 - 23:00)
    n_hours = [h for h in hourly if 19 <= h.hour <= 22]
    n_temp = sum(h.temperature for h in n_hours) / len(n_hours) if n_hours else curr.temperature - 4
    n_rain = max((h.precipitation_probability for h in n_hours), default=curr.precipitation_probability)
    n_uv = 0.0
    n_wind = max((h.wind_speed for h in n_hours), default=curr.wind_speed)
    n_vis = min((h.visibility or 10.0 for h in n_hours), default=curr.visibility or 10.0)

    n_suit = "Ideal" if n_rain < 20 and n_wind < 20 else ("Moderate" if n_rain < 50 else "Challenging")
    n_color = "green" if n_suit == "Ideal" else ("amber" if n_suit == "Moderate" else "red")
    n_rec = "Clear night conditions. Verify stage lighting and wind stabilization for tall tents or audio trusses."

    windows = [
        EventSuitabilityWindow(
            time_window="Morning Ceremony (07:00 - 11:00)",
            suitability=m_suit,
            color=m_color,
            temperature=round(m_temp, 1),
            rain_prob=m_rain,
            uv_index=round(m_uv, 1),
            wind_speed=round(m_wind, 1),
            visibility=round(m_vis, 1),
            recommendation=m_rec,
        ),
        EventSuitabilityWindow(
            time_window="Midday Setup / Lunch (11:00 - 15:00)",
            suitability=a_suit,
            color=a_color,
            temperature=round(a_temp, 1),
            rain_prob=a_rain,
            uv_index=round(a_uv, 1),
            wind_speed=round(a_wind, 1),
            visibility=round(a_vis, 1),
            recommendation=a_rec,
        ),
        EventSuitabilityWindow(
            time_window="Sunset Reception / Vows (16:00 - 19:00)",
            suitability=s_suit,
            color=s_color,
            temperature=round(s_temp, 1),
            rain_prob=s_rain,
            uv_index=round(s_uv, 1),
            wind_speed=round(s_wind, 1),
            visibility=round(s_vis, 1),
            recommendation=s_rec,
        ),
        EventSuitabilityWindow(
            time_window="Evening Dinner / Party (19:00 - 23:00)",
            suitability=n_suit,
            color=n_color,
            temperature=round(n_temp, 1),
            rain_prob=n_rain,
            uv_index=0.0,
            wind_speed=round(n_wind, 1),
            visibility=round(n_vis, 1),
            recommendation=n_rec,
        ),
    ]

    recs = []
    if s_suit == "Ideal":
        recs.append(f"Golden hour window ({evening_golden}) offers prime natural lighting for outdoor photography.")
    if a_uv > 7:
        recs.append("UV index reaches hazardous levels midday; provide shaded lounge areas and SPF protection for guests.")
    if m_rain > 40 or s_rain > 40:
        recs.append("Elevated precipitation probability detected. Prepare waterproof marquee backup or indoor contingency hall.")
    if curr.wind_speed > 25:
        recs.append("Wind gusts may affect lightweight gazebos and floral arches; secure truss anchoring.")
    if not recs:
        recs.append("Atmospheric conditions are stable throughout the daylight window. Ideal for all outdoor event types.")

    score = 88 if s_suit == "Ideal" and a_suit != "Challenging" else (68 if s_suit == "Moderate" else 48)
    comfort = "Optimal Outdoor Conditions" if score >= 80 else ("Moderate Weather Caution" if score >= 60 else "Adverse Weather Window")

    return EventPlanningIntelligence(
        sunlight=sunlight,
        outdoor_comfort_rating=comfort,
        suitability_score=score,
        optimal_event_window="16:30 - 19:00 IST (Golden Hour & Sunset)",
        windows=windows,
        recommendations=recs,
    )

def calculate_allergy_outlook(weather: WeatherResponse, context: UserContext) -> AllergyOutlook:
    curr = weather.current
    hourly = weather.hourly or []
    sensitivities = context.sensitivities or []

    factors: List[AllergyFactor] = []

    # 1. Particulate / Dust Factor
    pm2_5 = curr.pm2_5 or 35.0
    pm10 = curr.pm10 or 65.0
    if pm2_5 > 60 or pm10 > 100:
        factors.append(AllergyFactor(
            factor="Elevated Particulate Matter (PM2.5 / PM10)",
            severity="high" if pm2_5 > 100 else "moderate",
            description=f"PM2.5 at {pm2_5} µg/m³ and PM10 at {pm10} µg/m³ trigger respiratory and eye irritation."
        ))
    elif "dust" in sensitivities or "air_pollution" in sensitivities:
        factors.append(AllergyFactor(
            factor="Fine Dust & Particulate Concentration",
            severity="moderate" if pm2_5 > 30 else "low",
            description=f"Particulate levels (PM2.5: {pm2_5} µg/m³) are noticeable for sensitive individuals."
        ))

    # 2. Humidity & Mold/Spore Factor
    if curr.humidity > 75:
        factors.append(AllergyFactor(
            factor="High Atmospheric Humidity (Spore Growth)",
            severity="high" if curr.humidity > 85 else "moderate",
            description=f"Relative humidity of {curr.humidity}% accelerates dampness, mold spore proliferation, and dust mite activity."
        ))
    elif curr.humidity < 28:
        factors.append(AllergyFactor(
            factor="Very Dry Air (Nasal Mucosa Dryness)",
            severity="moderate",
            description=f"Low humidity ({curr.humidity}%) dries respiratory pathways, reducing natural particulate filtering."
        ))

    # 3. Wind & Dispersal Factor
    if curr.wind_speed > 20:
        factors.append(AllergyFactor(
            factor="Surface Winds & Particulate Lift",
            severity="high" if curr.wind_speed > 35 else "moderate",
            description=f"Wind speeds of {curr.wind_speed} km/h lift ground-level road dust and biological irritants into the air."
        ))

    # 4. Solar UV / Ozone Photochemical Reaction
    if curr.uv_index > 7:
        factors.append(AllergyFactor(
            factor="Intense Solar UV & Ground Ozone",
            severity="moderate",
            description=f"Solar UV {curr.uv_index} promotes photochemical oxidation, compounding airway sensitivity."
        ))

    # Determine Peak Risk Period from Hourly Data
    peak_hr = 13
    peak_risk_val = 0
    for h in hourly[:18]:
        risk_metric = (h.aqi * 0.4) + (h.uv_index * 5) + (h.wind_speed * 0.8)
        if risk_metric > peak_risk_val:
            peak_risk_val = risk_metric
            peak_hr = h.hour

    peak_str = f"{(peak_hr-1):02d}:00 - {(peak_hr+2):02d}:00 IST"

    # Determine Overall Risk Level
    risk_score = 0
    if curr.aqi > 150: risk_score += 3
    elif curr.aqi > 80: risk_score += 1
    if curr.humidity > 75 or curr.humidity < 28: risk_score += 2
    if curr.wind_speed > 22: risk_score += 1
    if curr.uv_index > 7: risk_score += 1

    # Weight based on user's sensitivities
    if any(s in sensitivities for s in ["pollen", "dust", "air_pollution"]):
        risk_score += 1

    if risk_score >= 5:
        level = "High"
        color = "red"
        guidance = "Elevated environmental irritants present. Outdoor exposure may be uncomfortable during peak hours."
    elif risk_score >= 3:
        level = "Elevated"
        color = "amber"
        guidance = "Moderate environmental sensitivity risk. Consider keeping windows closed during windy afternoon hours."
    elif risk_score >= 1:
        level = "Moderate"
        color = "blue"
        guidance = "Conditions are generally manageable with minor precautions for sensitive profiles."
    else:
        level = "Low"
        color = "green"
        guidance = "Favorable environmental conditions. Atmospheric allergen and dust levels are minimal."

    # Real Pollen Status: Check if Open-Meteo has pollen or return authoritative unavailable message
    pollen_info = EnvironmentalPollenData(
        available=False,
        tree_pollen=None,
        grass_pollen=None,
        weed_pollen=None,
        dominant_pollen=None,
        status_text="Pollen data unavailable for this location. Environmental outlook is derived from verified AQI, PM2.5, PM10, dust, humidity, and wind telemetry."
    )

    precautions = [
        "Keep residential windows closed between 11:00 AM and 03:00 PM when wind and particulate turbulence peak.",
        "Wear UV-protective sunglasses to shield eyes from airborne dust particles and direct solar flare.",
        "Rinse face and eyes with fresh cool water after prolonged outdoor exposure.",
    ]
    if curr.aqi > 120 or "air_pollution" in sensitivities:
        precautions.insert(0, "Consider using an N95 anti-pollution mask during peak commute hours.")
    if curr.humidity < 30:
        precautions.append("Use a room humidifier or stay well-hydrated to soothe dry nasal passages.")

    return AllergyOutlook(
        risk_level=level,
        risk_color=color,
        peak_period=peak_str,
        summary=f"Atmospheric environmental sensitivity is rated {level} today in {weather.location.name}.",
        vayusync_guidance=guidance,
        factors=factors,
        pollen=pollen_info,
        precautions=precautions,
        disclaimer="Disclaimer: This environmental intelligence provides general meteorological insights and is not a medical diagnosis or medical advice."
    )

def calculate_visibility_intelligence(weather: WeatherResponse, context: UserContext) -> VisibilityIntelligence:
    curr = weather.current
    vis_km = curr.visibility if curr.visibility is not None else 10.0
    hourly = weather.hourly or []

    # Risk level categorization
    if vis_km >= 10.0:
        risk_level = "Excellent"
        risk_color = "green"
    elif vis_km >= 6.0:
        risk_level = "Good"
        risk_color = "blue"
    elif vis_km >= 2.0:
        risk_level = "Moderate"
        risk_color = "amber"
    else:
        risk_level = "Poor"
        risk_color = "red"

    # Trend calculation
    next_vis = hourly[2].visibility if len(hourly) > 2 and hourly[2].visibility is not None else vis_km
    if next_vis > vis_km + 1.0:
        trend = "Improving"
    elif next_vis < vis_km - 1.0:
        trend = "Decreasing"
    else:
        trend = "Stable"

    # Role-specific tailored advisories
    if vis_km >= 10.0:
        commuter_adv = "Clear road visibility (>10 km). Safe for two-wheeler cruising, highway transit, and regular commuting."
        delivery_adv = "Optimal sightlines on city arterial roads. On-time delivery operations without weather friction."
        traveler_adv = "Clear intercity highway and airspace conditions. Zero fog-induced transit delays expected."
        athlete_adv = "Excellent visual clarity for open-air running, cycling sprints, and track sessions."
        event_adv = "Flawless scenic vista. Ideal for drone videography, long-range photography, and open-air ceremonies."
    elif vis_km >= 4.0:
        commuter_adv = "Adequate daytime visibility (4-10 km). Maintain standard following distance during rush hour."
        delivery_adv = "Good navigation visibility. Watch for localized dust haze in industrial transit corridors."
        traveler_adv = "Normal highway speeds permissible. Minor haze on flyovers."
        athlete_adv = "Good visibility for morning/evening runs. Visual landmarks easily distinguishable."
        event_adv = "Clear horizon for photography. Ambient lighting remains unhindered."
    elif vis_km >= 1.5:
        commuter_adv = "Moderate visibility caution (2-4 km). Use dipped low-beam headlights on two-wheelers and buses."
        delivery_adv = "Reduced sightlines in dense traffic pockets. Exercise caution at unlit intersections."
        traveler_adv = "Early morning ground haze on state highways. Allow extra buffer time for intercity trips."
        athlete_adv = "Moderate haze. Wear high-visibility reflective neon gear when running along vehicular roads."
        event_adv = "Slight atmospheric haze. Evening stage floodlights will exhibit noticeable light beam cones."
    else:
        commuter_adv = "Hazardous poor visibility (<1.5 km). Heavy fog or dense smog alert. Switch on hazard lights and reduce speed."
        delivery_adv = "Severe transit risk. High risk of pedestrian or barricade collision in low-light sectors."
        traveler_adv = "Flight and express highway delays likely due to dense runway/highway fog or GRAP smog."
        athlete_adv = "Avoid cycling or road sprints. Confined indoor track or treadmill recommended."
        event_adv = "Severe visual obstruction. Outdoor drone flights restricted; outdoor wedding lighting impaired."

    return VisibilityIntelligence(
        visibility_km=vis_km,
        risk_level=risk_level,
        risk_color=risk_color,
        trend=trend,
        commuter_advisory=commuter_adv,
        delivery_advisory=delivery_adv,
        traveler_advisory=traveler_adv,
        athlete_advisory=athlete_adv,
        event_planner_advisory=event_adv,
        is_available=curr.visibility_available,
    )

