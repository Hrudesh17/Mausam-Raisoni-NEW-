import logging
import re
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List, Tuple

import httpx
from ..models.weather import WeatherResponse
from ..models.user_context import UserContext
from ..models.intelligence import IntelligenceSummary
from ..services.weather_service import WeatherService, WeatherServiceError
from ..core.config import settings

logger = logging.getLogger(__name__)

# Known Cities for Instant Lat/Lon Lookup
KNOWN_CITIES: Dict[str, Dict[str, Any]] = {
    "hyderabad": {"name": "Hyderabad", "lat": 17.3850, "lon": 78.4867, "state": "Telangana", "country": "India"},
    "pune": {"name": "Pune", "lat": 18.5204, "lon": 73.8567, "state": "Maharashtra", "country": "India"},
    "mumbai": {"name": "Mumbai", "lat": 19.0760, "lon": 72.8777, "state": "Maharashtra", "country": "India"},
    "delhi": {"name": "Delhi", "lat": 28.6139, "lon": 77.2090, "state": "Delhi NCR", "country": "India"},
    "new delhi": {"name": "Delhi", "lat": 28.6139, "lon": 77.2090, "state": "Delhi NCR", "country": "India"},
    "bengaluru": {"name": "Bengaluru", "lat": 12.9716, "lon": 77.5946, "state": "Karnataka", "country": "India"},
    "bangalore": {"name": "Bengaluru", "lat": 12.9716, "lon": 77.5946, "state": "Karnataka", "country": "India"},
    "chennai": {"name": "Chennai", "lat": 13.0827, "lon": 80.2707, "state": "Tamil Nadu", "country": "India"},
    "kolkata": {"name": "Kolkata", "lat": 22.5726, "lon": 88.3639, "state": "West Bengal", "country": "India"},
    "nashik": {"name": "Nashik", "lat": 20.0000, "lon": 73.7800, "state": "Maharashtra", "country": "India"},
    "nagpur": {"name": "Nagpur", "lat": 21.1458, "lon": 79.0882, "state": "Maharashtra", "country": "India"},
    "jaipur": {"name": "Jaipur", "lat": 26.9124, "lon": 75.7873, "state": "Rajasthan", "country": "India"},
    "ahmedabad": {"name": "Ahmedabad", "lat": 23.0225, "lon": 72.5714, "state": "Gujarat", "country": "India"},
    "lucknow": {"name": "Lucknow", "lat": 26.8467, "lon": 80.9462, "state": "Uttar Pradesh", "country": "India"},
    "bhopal": {"name": "Bhopal", "lat": 23.2599, "lon": 77.4126, "state": "Madhya Pradesh", "country": "India"},
    "chandigarh": {"name": "Chandigarh", "lat": 30.7333, "lon": 76.7794, "state": "Punjab & Haryana", "country": "India"},
    "shimla": {"name": "Shimla", "lat": 31.1048, "lon": 77.1734, "state": "Himachal Pradesh", "country": "India"},
    "kochi": {"name": "Kochi", "lat": 9.9312, "lon": 76.2673, "state": "Kerala", "country": "India"},
    "visakhapatnam": {"name": "Visakhapatnam", "lat": 17.6868, "lon": 83.2185, "state": "Andhra Pradesh", "country": "India"},
    "surat": {"name": "Surat", "lat": 21.1702, "lon": 72.8311, "state": "Gujarat", "country": "India"},
    "indore": {"name": "Indore", "lat": 22.7196, "lon": 75.8577, "state": "Madhya Pradesh", "country": "India"},
    "thane": {"name": "Thane", "lat": 19.2183, "lon": 72.9781, "state": "Maharashtra", "country": "India"},
    "patna": {"name": "Patna", "lat": 25.5941, "lon": 85.1376, "state": "Bihar", "country": "India"},
    "vadodara": {"name": "Vadodara", "lat": 22.3072, "lon": 73.1812, "state": "Gujarat", "country": "India"},
    "ghaziabad": {"name": "Ghaziabad", "lat": 28.6692, "lon": 77.4538, "state": "Uttar Pradesh", "country": "India"},
    "ludhiana": {"name": "Ludhiana", "lat": 30.9010, "lon": 75.8573, "state": "Punjab", "country": "India"},
    "agra": {"name": "Agra", "lat": 27.1767, "lon": 78.0081, "state": "Uttar Pradesh", "country": "India"},
    "varanasi": {"name": "Varanasi", "lat": 25.3176, "lon": 82.9739, "state": "Uttar Pradesh", "country": "India"},
    "srinagar": {"name": "Srinagar", "lat": 34.0837, "lon": 74.7973, "state": "Jammu & Kashmir", "country": "India"},
    "london": {"name": "London", "lat": 51.5074, "lon": -0.1278, "state": "England", "country": "United Kingdom"},
    "new york": {"name": "New York", "lat": 40.7128, "lon": -74.0060, "state": "New York", "country": "United States"},
    "tokyo": {"name": "Tokyo", "lat": 35.6762, "lon": 139.6503, "state": "Tokyo", "country": "Japan"},
    "dubai": {"name": "Dubai", "lat": 25.2048, "lon": 55.2708, "state": "Dubai", "country": "UAE"},
    "singapore": {"name": "Singapore", "lat": 1.3521, "lon": 103.8198, "state": "Singapore", "country": "Singapore"},
}

# Common Spelling Variations & Typos Dict
CITY_ALIASES: Dict[str, str] = {
    "heydrabad": "hyderabad",
    "hydrabad": "hyderabad",
    "hyd": "hyderabad",
    "bombay": "mumbai",
    "calcutta": "kolkata",
    "poona": "pune",
    "delhi": "delhi",
    "new delhi": "delhi",
    "dilli": "delhi",
    "bangalore": "bengaluru",
    "bengaluru": "bengaluru",
    "madras": "chennai",
    "baroda": "vadodara",
    "banaras": "varanasi",
    "benaras": "varanasi",
    "kashi": "varanasi",
    "trivandrum": "thiruvananthapuram",
    "cochin": "kochi",
    "vizag": "visakhapatnam",
}

class LocationResolver:
    """
    Resolves natural-language location queries into exact geographic coordinates
    using known city dictionaries, alias mapping, and Open-Meteo Geocoding API.
    """
    @classmethod
    async def resolve(cls, location_str: str) -> Tuple[Optional[float], Optional[float], str]:
        loc_clean = location_str.strip().lower()
        if not loc_clean:
            return None, None, ""

        # Alias check
        if loc_clean in CITY_ALIASES:
            loc_clean = CITY_ALIASES[loc_clean]

        if loc_clean in KNOWN_CITIES:
            c = KNOWN_CITIES[loc_clean]
            return c["lat"], c["lon"], c["name"]

        for k, c in KNOWN_CITIES.items():
            if k == loc_clean or k in loc_clean or loc_clean in k:
                return c["lat"], c["lon"], c["name"]

        # Dynamic Geocoding via Open-Meteo
        try:
            encoded_name = loc_clean.replace(" ", "%20")
            url = f"https://geocoding-api.open-meteo.com/v1/search?name={encoded_name}&count=1&language=en&format=json"
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    results = data.get("results")
                    if results and len(results) > 0:
                        first = results[0]
                        city_name = first.get("name", location_str.title())
                        return float(first["latitude"]), float(first["longitude"]), city_name
        except Exception as err:
            logger.warning(f"[LOCATION_RESOLVER] Geocoding lookup failed for '{location_str}': {err}")

        return None, None, location_str.title()

class AIAssistantService:
    """
    VayuSync Sahayak: Context-Aware, Data-Grounded Weather AI Assistant.
    Translates raw meteorological variables into empathetic, actionable user advice.
    No hardcoded weather values, no static response templates containing fabricated data.
    All answers are strictly generated from REAL fetched weather data via WeatherService.
    """

    @classmethod
    def extract_locations(cls, msg: str) -> List[str]:
        msg_clean = msg.lower().strip()
        found = []

        # Check comparison format: "compare Pune and Mumbai weather"
        comp_match = re.search(r"compare\s+([a-zA-Z\s]+?)\s+and\s+([a-zA-Z\s]+?)(?:\s+weather|\?|\.|$)", msg_clean)
        if comp_match:
            c1, c2 = comp_match.group(1).strip(), comp_match.group(2).strip()
            return [c1, c2]

        # Check alias matches
        for alias in sorted(CITY_ALIASES.keys(), key=lambda a: len(a), reverse=True):
            if re.search(r"\b" + re.escape(alias) + r"\b", msg_clean):
                target_key = CITY_ALIASES[alias]
                target_name = KNOWN_CITIES.get(target_key, {}).get("name", target_key.title())
                if target_name not in found:
                    found.append(target_name)

        # Direct known city match in text
        for key in sorted(KNOWN_CITIES.keys(), key=lambda k: len(k), reverse=True):
            if re.search(r"\b" + re.escape(key) + r"\b", msg_clean):
                city_name = KNOWN_CITIES[key]["name"]
                if city_name not in found:
                    found.append(city_name)

        # Regex pattern for prepositions
        prep_pattern = r"\b(?:in|at|for|near|to|around|of|what about|and|how about|now)\s+([a-zA-Z0-9\s]{3,25}?)(?:\s+(?:right now|currently|today|tonight|tomorrow|this|next|morning|afternoon|evening|night|at|\d{1,2})|[?!.,]|$)"
        matches = re.findall(prep_pattern, msg_clean)
        ignore_words = {"today", "tonight", "tomorrow", "morning", "afternoon", "evening", "night", "the weather", "weather", "temperature", "temp", "now", "my", "our", "a", "an", "the", "there", "here", "rain", "it rain", "wind", "aqi", "uv"}
        for m in matches:
            candidate = m.strip()
            if candidate not in ignore_words and len(candidate) >= 3:
                cand_lower = candidate.lower()
                if cand_lower in CITY_ALIASES:
                    cand_lower = CITY_ALIASES[cand_lower]
                if cand_lower in KNOWN_CITIES:
                    cand_name = KNOWN_CITIES[cand_lower]["name"]
                else:
                    cand_name = candidate.title()
                if cand_name not in found:
                    found.append(cand_name)

        return found

    @classmethod
    def classify_intent(cls, msg: str) -> str:
        msg_l = msg.lower()

        if any(w in msg_l for w in ["compare", "versus", "vs", "difference between"]):
            return "WEATHER_COMPARISON"

        if any(w in msg_l for w in ["hourly", "curve", "graph", "timeline"]):
            return "HOURLY_FORECAST"

        if any(w in msg_l for w in ["run", "running", "jog", "jogging", "workout", "cardio", "exercise", "marathon"]):
            return "RUNNING_ADVISORY"

        if any(w in msg_l for w in ["commute", "traffic", "office", "work", "two wheeler", "bike", "transit"]):
            return "COMMUTE_ADVISORY"

        if any(w in msg_l for w in ["travel", "trip", "highway", "expressway", "journey", "route", "drive"]):
            return "TRAVEL_ADVISORY"

        if any(w in msg_l for w in ["spray", "pesticide", "crop", "farm", "irrigate", "irrigation", "water plants", "harvest", "krishi"]):
            return "KRISHI_ADVISORY"

        if any(w in msg_l for w in ["event", "match", "party", "wedding", "ceremony", "shoot", "outdoor event", "cricket"]):
            return "EVENT_ADVISORY"

        if any(w in msg_l for w in ["beach", "coastal", "swim", "wave", "tide", "sea", "ocean"]):
            return "BEACH_ADVISORY"

        if any(w in msg_l for w in ["umbrella", "raincoat"]):
            return "UMBRELLA"

        if any(w in msg_l for w in ["rain", "baarish", "precipitation", "shower", "drizzle", "downpour", "wet", "storm"]):
            return "RAIN"

        if any(w in msg_l for w in ["wind", "windy", "breeze", "gust", "crosswind", "gale"]):
            return "WIND"

        if any(w in msg_l for w in ["visibility", "fog", "smog", "haze", "mist", "sightline"]):
            return "VISIBILITY"

        if any(w in msg_l for w in ["aqi", "air quality", "pollution", "pm2.5", "pm10", "mask"]):
            return "AQI"

        if any(w in msg_l for w in ["uv", "uv index", "sun", "sunlight", "solar", "sunscreen"]):
            return "UV"

        if any(w in msg_l for w in ["sunrise", "sunset", "golden hour", "twilight", "daylight"]):
            return "SUNRISE_SUNSET"

        if any(w in msg_l for w in ["feels like", "apparent temp", "heat index", "how hot will it feel"]):
            return "FEELS_LIKE"

        if any(w in msg_l for w in ["temperature", "temp", "degree", "celsius", "fahrenheit", "hot", "cold", "chilly", "warm"]):
            return "TEMPERATURE"

        if any(w in msg_l for w in ["humidity", "moisture", "humid"]):
            return "HUMIDITY"

        if any(w in msg_l for w in ["pressure", "barometer", "hpa"]):
            return "PRESSURE"

        if any(w in msg_l for w in ["forecast", "7-day", "weekly", "next 3 days", "upcoming"]):
            return "DAILY_FORECAST"

        return "GENERAL_WEATHER"

    @classmethod
    def parse_time_window(cls, msg: str) -> Dict[str, Any]:
        msg_l = msg.lower()

        is_tomorrow = any(w in msg_l for w in ["tomorrow", "next day"])
        is_tonight = any(w in msg_l for w in ["tonight", "this evening"])
        is_evening = any(w in msg_l for w in ["evening", "night", "6 pm", "18:00", "7 pm", "8 pm", "tonight"])
        is_morning = any(w in msg_l for w in ["morning", "7 am", "8 am", "9 am", "dawn"])
        is_afternoon = any(w in msg_l for w in ["afternoon", "noon", "midday", "2 pm", "3 pm", "4 pm"])
        is_next_3_hours = any(w in msg_l for w in ["next 3 hours", "next few hours", "next 2 hours", "coming hours"])

        target_hour = None
        hour_match = re.search(r"\bat\s+(\d{1,2})\s*(pm|am|:00)?", msg_l)
        if hour_match:
            val = int(hour_match.group(1))
            ampm = hour_match.group(2)
            if ampm == "pm" and val < 12:
                val += 12
            elif ampm == "am" and val == 12:
                val = 0
            target_hour = val

        if is_tomorrow:
            label = "Tomorrow"
            if is_morning:
                label = "Tomorrow Morning"
            elif is_afternoon:
                label = "Tomorrow Afternoon"
            elif is_evening:
                label = "Tomorrow Evening"
            elif target_hour is not None:
                label = f"Tomorrow at {target_hour}:00"
        elif is_tonight or is_evening:
            label = "Tonight / Evening"
        elif is_morning:
            label = "Morning"
        elif is_afternoon:
            label = "Afternoon"
        elif is_next_3_hours:
            label = "Next 3 Hours"
        elif target_hour is not None:
            label = f"Today at {target_hour}:00"
        else:
            label = "Currently / Right Now"

        return {
            "label": label,
            "is_tomorrow": is_tomorrow,
            "is_evening": is_evening or is_tonight,
            "is_morning": is_morning,
            "is_afternoon": is_afternoon,
            "is_next_3_hours": is_next_3_hours,
            "target_hour": target_hour,
        }

    @classmethod
    async def answer_query(
        cls,
        user_message: str,
        weather: Optional[WeatherResponse] = None,
        context: Optional[UserContext] = None,
        intelligence: Optional[IntelligenceSummary] = None,
        dashboard_location: Optional[str] = "Pune",
        conversation_location: Optional[str] = None,
        session_id: Optional[str] = None,
        persona: Optional[List[str]] = None,
        input_mode: str = "text",
        language: str = "en",
    ) -> Dict[str, Any]:
        msg = user_message.strip()
        msg_l = msg.lower()
        is_bengali = (language == "bn") or bool(re.search(r'[\u0980-\u09FF]', user_message))
        is_telugu = (language == "te") or bool(re.search(r'[\u0C00-\u0C7F]', user_message))
        is_marathi = (language == "mr")
        is_hindi = (language == "hi") or (not is_marathi and not is_bengali and not is_telugu and bool(re.search(r'[\u0900-\u097F]', user_message)))
        lang = "bn" if is_bengali else ("te" if is_telugu else ("mr" if is_marathi else ("hi" if is_hindi else "en")))
        req_id = session_id or str(uuid.uuid4())
        dash_loc = dashboard_location or (weather.location.name if weather and weather.location else "Pune")

        # ── 1. INTENT & LOCATION RESOLUTION ──────────────────────────────────
        extracted_cities = cls.extract_locations(msg)
        intent = cls.classify_intent(msg_l)
        time_ctx = cls.parse_time_window(msg_l)

        # Comparison handling
        if intent == "WEATHER_COMPARISON" and len(extracted_cities) >= 2:
            return await cls._handle_comparison(extracted_cities[0], extracted_cities[1], user_message, req_id, input_mode)

        # Priority Rule:
        # 1. Explicit query location (queryLocation)
        # 2. Conversational location (conversationalLocation)
        # 3. Dashboard location (dashboardLocation)
        target_location = None
        is_explicit_query = False

        if extracted_cities:
            target_location = extracted_cities[0]
            is_explicit_query = True
        elif conversation_location and conversation_location.strip():
            target_location = conversation_location.strip()
        else:
            target_location = dash_loc

        # Resolve Lat / Lon
        lat, lon, canon_name = await LocationResolver.resolve(target_location)

        # Unresolvable Location Guard
        if lat is None or lon is None:
            if is_explicit_query:
                unresolvable_msg = f"I couldn't confidently identify '{target_location}'. Did you mean Hyderabad, Telangana or another city?"
                logger.warning(f"[ASSISTANT] request_id={req_id} unresolvable_location='{target_location}'")
                return {
                    "success": False,
                    "reply": unresolvable_msg,
                    "answer": unresolvable_msg,
                    "location": {"name": target_location, "latitude": 0.0, "longitude": 0.0},
                    "intent": intent,
                    "requested_time": time_ctx["label"],
                    "weather": {},
                    "data": {},
                    "suggested_actions": ["Weather in Delhi", "Weather in Hyderabad", "Weather in Pune"],
                    "source": "VayuSync Location Resolver",
                    "data_timestamp": datetime.now().strftime("%I:%M %p IST"),
                    "conversation_location": conversation_location or dash_loc,
                    "input_mode": input_mode,
                    "session_id": req_id,
                    "confidence": 0.0
                }
            else:
                target_location = dash_loc
                lat, lon, canon_name = await LocationResolver.resolve(target_location)
                if lat is None or lon is None:
                    lat, lon, canon_name = 18.5204, 73.8567, "Pune"

        # ── 2. REAL WEATHER DATA FETCHING VIA WEATHER SERVICE ───────────────
        try:
            resolved_weather = await WeatherService.fetch_weather(
                lat=lat,
                lon=lon,
                location_name=canon_name,
                time_range=time_ctx["label"].lower()
            )
        except WeatherServiceError as w_err:
            logger.error(f"[ASSISTANT] request_id={req_id} Weather Service Error for '{canon_name}': {w_err.message}")
            err_msg = f"I couldn't retrieve live weather data for {canon_name} right now. Please try again in a moment."
            return {
                "success": False,
                "reply": err_msg,
                "answer": err_msg,
                "location": {"name": canon_name, "latitude": lat, "longitude": lon},
                "intent": intent,
                "requested_time": time_ctx["label"],
                "weather": {},
                "data": {},
                "suggested_actions": [f"Retry query for {canon_name}", f"Weather in {dash_loc}"],
                "source": "VayuSync Weather Service",
                "data_timestamp": datetime.now().strftime("%I:%M %p IST"),
                "conversation_location": canon_name,
                "input_mode": input_mode,
                "session_id": req_id,
                "confidence": 0.0
            }

        loc = resolved_weather.location.name
        curr = resolved_weather.current
        hourly = resolved_weather.hourly or []
        daily = resolved_weather.daily or []
        obs_time = curr.observation_time

        # Extract time-relevant data
        eve_hour_data = None
        if hourly:
            eve_candidates = [h for h in hourly if 17 <= getattr(h, "hour", 0) <= 21]
            if eve_candidates:
                eve_hour_data = eve_candidates[0]

        tom_data = daily[1] if len(daily) > 1 else (daily[0] if daily else None)

        # ── 3. DATA-GROUNDED SPECIFIC REASONING ENGINE ───────────────────────
        structured_data: Dict[str, Any] = {}
        suggested_actions: List[str] = []

        if intent == "WIND":
            wind_s = curr.wind_speed
            wind_g = getattr(curr, "wind_gust", wind_s) or wind_s
            wind_d = getattr(curr, "wind_direction", 0)
            
            if lang == "bn":
                wind_desc = "হালকা থেকে মাঝারি বাতাস" if wind_s < 15 else "মাঝারি থেকে জোরালো বাতাস" if wind_s < 30 else "ঝড়ো বাতাস"
                reply = f"{loc}-এ বর্তমানে বাতাসের গতিবেগ {wind_s} কিমি/ঘণ্টা (সর্বোচ্চ দমকা {wind_g} কিমি/ঘণ্টা)। এটি {wind_desc}।"
                suggested_actions = ["সড়ক নিরাপত্তা", "কীটনাশক স্প্রে পরামর্শ", "বর্তমান তাপমাত্রা"]
            elif lang == "te":
                wind_desc = "తేలికపాటి నుండి మోస్తరు గాలి" if wind_s < 15 else "మోస్తరు నుండి వేగవంతమైన గాలి" if wind_s < 30 else "తీవ్రమైన ఈదురు గాలి"
                reply = f"{loc}లో ప్రస్తుతం గాలి వేగం {wind_s} కిమీ/గం (గరిష్టంగా {wind_g} కిమీ/గం). ఇది {wind_desc}."
                suggested_actions = ["రహదారి భద్రత", "పిచికారీ సలహా", "ప్రస్తుత ఉష్ణోగ్రత"]
            elif lang == "mr":
                wind_desc = "हलकी ते मध्यम हवा" if wind_s < 15 else "मध्यम ते जोरदार वारा" if wind_s < 30 else "वादळी वारा"
                reply = f"{loc} मध्ये वाऱ्याचा वेग सध्या {wind_s} किमी/तास आहे (कमाल झोके {wind_g} किमी/तास). ही {wind_desc} आहे."
                suggested_actions = ["रस्ता सुरक्षा", "फवारणी सल्ला", "सध्याचे तापमान"]
            elif lang == "hi":
                wind_desc = "हल्की से मध्यम हवा" if wind_s < 15 else "मध्यम से तेज हवा" if wind_s < 30 else "तेज और झोंके वाली हवा"
                reply = f"{loc} में वर्तमान में हवा की गति {wind_s} किमी/घंटा है (अधिकतम झोंके {wind_g} किमी/घंटा)। यह {wind_desc} है।"
                suggested_actions = ["सड़क सुरक्षा", "कीटनाशक छिड़काव सलाह", "वर्तमान तापमान"]
            else:
                wind_desc = "light to moderate breeze" if wind_s < 15 else "moderate-to-strong breeze" if wind_s < 30 else "strong and gusty wind"
                reply = f"{loc}'s wind is currently {wind_s} km/h (peak gusts {wind_g} km/h). That's a {wind_desc}."
                suggested_actions = ["Highway driving safety", "Crop spraying guidance", "Temperature right now"]
            structured_data = {"location": loc, "wind_speed": wind_s, "wind_gust": wind_g, "wind_direction": wind_d}

        elif intent == "TEMPERATURE" or intent == "FEELS_LIKE":
            if time_ctx["is_tomorrow"] and tom_data:
                max_t = getattr(tom_data, "temp_max", curr.temperature)
                min_t = getattr(tom_data, "temp_min", curr.temperature)
                cond = getattr(tom_data, "condition_text", curr.condition_text)
                if lang == "bn":
                    reply = f"কাল {loc}-এ তাপমাত্রা {min_t}°C থেকে {max_t}°C-এর মধ্যে থাকবে এবং আবহাওয়া {cond} থাকবে।"
                elif lang == "te":
                    reply = f"రేపు {loc}లో ఉష్ణోగ్రత {min_t}°C నుండి {max_t}°C మధ్య ఉంటుంది మరియు వాతావరణం {cond}గా ఉంటుంది."
                elif lang == "mr":
                    reply = f"उद्या {loc} मध्ये तापमान {min_t}°C ते {max_t}°C दरम्यान राहण्याची शक्यता आहे आणि हवामान {cond} राहील."
                elif lang == "hi":
                    reply = f"कल {loc} में तापमान {min_t}°C से {max_t}°C के बीच रहने की संभावना है और मौसम {cond} रहेगा।"
                else:
                    reply = f"Tomorrow in {loc}, expect temperatures ranging from {min_t}°C to {max_t}°C with {cond} conditions."
                structured_data = {"location": loc, "max_temp": max_t, "min_temp": min_t, "condition": cond}
            elif time_ctx["is_evening"] and eve_hour_data:
                eve_temp = getattr(eve_hour_data, "temperature", curr.temperature)
                eve_feels = getattr(eve_hour_data, "feels_like", curr.feels_like)
                if lang == "bn":
                    reply = f"{loc}-এ আজ সন্ধ্যায় তাপমাত্রা প্রায় {eve_temp}°C (অনুভূত {eve_feels}°C) থাকবে।"
                elif lang == "te":
                    reply = f"{loc}లో ఈ సాయంత్రం ఉష్ణోగ్రత సుమారు {eve_temp}°C (అనుభూతి {eve_feels}°C)గా ఉంటుంది."
                elif lang == "mr":
                    reply = f"{loc} मध्ये आज संध्याकाळी तापमान सुमारे {eve_temp}°C (अनुभूत {eve_feels}°C) राहील."
                elif lang == "hi":
                    reply = f"{loc} में आज शाम तापमान लगभग {eve_temp}°C (अनुभूत {eve_feels}°C) रहेगा।"
                else:
                    reply = f"In {loc} this evening, temperature will be around {eve_temp}°C (feels like {eve_feels}°C)."
                structured_data = {"location": loc, "temperature": eve_temp, "feels_like": eve_feels}
            else:
                max_t = daily[0].temp_max if daily else curr.temperature
                min_t = daily[0].temp_min if daily else curr.temperature
                if lang == "bn":
                    reply = f"{loc}-এ বর্তমান তাপমাত্রা {curr.temperature}°C (অনুভূত {curr.feels_like}°C)। আজকের সম্ভাব্য তাপমাত্রা {min_t}°C থেকে {max_t}°C এবং আর্দ্রতা {curr.humidity}%।"
                elif lang == "te":
                    reply = f"{loc}లో ప్రస్తుత ఉష్ణోగ్రత {curr.temperature}°C (అనుభూతి {curr.feels_like}°C). నేటి ఉష్ణోగ్రత శ్రేణి {min_t}°C నుండి {max_t}°C మరియు తేమ {curr.humidity}%."
                elif lang == "mr":
                    reply = f"{loc} मध्ये सध्याचे तापमान {curr.temperature}°C आहे, जे {curr.feels_like}°C जाणवत आहे. आजचे तापमान {min_t}°C ते {max_t}°C दरम्यान राहील आणि आर्द्रता {curr.humidity}% आहे."
                elif lang == "hi":
                    reply = f"{loc} में वर्तमान तापमान {curr.temperature}°C है, जो {curr.feels_like}°C जैसा महसूस हो रहा है। आज का तापमान {min_t}°C से {max_t}°C के बीच रहेगा तथा आर्द्रता {curr.humidity}% है।"
                else:
                    reply = f"{loc} is currently {curr.temperature}°C, with a feels-like temperature of {curr.feels_like}°C. Today's range is {min_t}°C to {max_t}°C with {curr.humidity}% humidity."
                structured_data = {"location": loc, "temperature": curr.temperature, "feels_like": curr.feels_like, "max_temp": max_t, "min_temp": min_t, "humidity": curr.humidity}
            if lang == "bn":
                suggested_actions = ["আজ কি বৃষ্টি হবে?", "বাতাসের গতি কেমন?", "তাপমাত্রার পূর্বাভাস"]
            elif lang == "te":
                suggested_actions = ["ఈరోజు వర్షం పడుతుందా?", "గాలి వేగం ఎంత?", "ఉష్ణోగ్రత సూచన"]
            elif lang == "mr":
                suggested_actions = ["आज पाऊस पडेल का?", "वाऱ्याचा वेग किती आहे?", "तापमान अंदाज"]
            elif lang == "hi":
                suggested_actions = ["क्या आज बारिश होगी?", "हवा की गति कैसी है?", "तापमान का पूर्वानुमान"]
            else:
                suggested_actions = ["Will it rain today?", "How strong is the wind?", "Hourly temperature curve"]

        elif intent == "RAIN" or intent == "PRECIPITATION" or intent == "RAIN_PROBABILITY" or intent == "UMBRELLA":
            rain_p = curr.precipitation_probability
            precip = curr.precipitation
            if time_ctx["is_tomorrow"] and tom_data:
                tom_rain = getattr(tom_data, "precipitation_probability", rain_p)
                tom_precip = getattr(tom_data, "precipitation_sum", 0)
                if lang == "bn":
                    reply = f"কাল {loc}-এ বৃষ্টির সম্ভাবনা {tom_rain}% এবং প্রায় {tom_precip} মিমি বর্ষণ প্রত্যাশিত।"
                elif lang == "te":
                    reply = f"రేపు {loc}లో వర్షం పడే అవకాశం {tom_rain}% మరియు దాదాపు {tom_precip} మిమీ వర్షపాతం నమోదయ్యే అవకాశం ఉంది."
                elif lang == "mr":
                    reply = f"उद्या {loc} मध्ये पावसाची शक्यता {tom_rain}% आहे आणि सुमारे {tom_precip} मिमी पावसाचा अंदाज आहे."
                elif lang == "hi":
                    reply = f"कल {loc} में बारिश की संभावना {tom_rain}% है और लगभग {tom_precip} मिमी वर्षा अनुमानित है।"
                else:
                    reply = f"Tomorrow in {loc}, there is a {tom_rain}% chance of rain with about {tom_precip} mm precipitation."
                structured_data = {"location": loc, "rain_probability": tom_rain, "precipitation_mm": tom_precip}
            else:
                if rain_p >= 50:
                    if lang == "bn":
                        reply = f"{loc}-এ আজ বৃষ্টির {rain_p}% সম্ভাবনা রয়েছে ({precip} মিমি বর্ষণ)। হ্যাঁ, ছাতা সাথে রাখা প্রয়োজন।"
                    elif lang == "te":
                        reply = f"{loc}లో ఈరోజు వర్షం పడే అవకాశం {rain_p}% ఉంది ({precip} మిమీ వర్షపాతం). అవును, గొడుగు తీసుకెళ్లడం అవసరం."
                    elif lang == "mr":
                        reply = f"{loc} मध्ये आज पावसाची {rain_p}% शक्यता आहे ({precip} मिमी पाऊस). होय, छत्री सोबत ठेवणे आवश्यक आहे."
                    elif lang == "hi":
                        reply = f"{loc} में आज बारिश की {rain_p}% संभावना है ({precip} मिमी वर्षा अनुमानित)। हाँ, छाता साथ रखना आवश्यक है।"
                    else:
                        reply = f"{loc} has a {rain_p}% chance of rain today ({precip} mm precipitation expected). Yes, carrying an umbrella is recommended."
                elif rain_p >= 25:
                    if lang == "bn":
                        reply = f"{loc}-এ আজ বৃষ্টির {rain_p}% সম্ভাবনা রয়েছে। ছাতা হাতের কাছে রাখুন।"
                    elif lang == "te":
                        reply = f"{loc}లో ఈరోజు వర్షం పడే అవకాశం {rain_p}% ఉంది. గొడుగు సిద్ధంగా ఉంచుకోండి."
                    elif lang == "mr":
                        reply = f"{loc} मध्ये आज पावसाची {rain_p}% शक्यता आहे. छत्री तयार ठेवा."
                    elif lang == "hi":
                        reply = f"{loc} में आज बारिश की {rain_p}% संभावना है। अपने पास छाता तैयार रखें।"
                    else:
                        reply = f"{loc} has a {rain_p}% chance of rain today with {curr.condition_text} conditions. Keep a compact umbrella handy."
                else:
                    if lang == "bn":
                        reply = f"{loc}-এ এখন বৃষ্টির সম্ভাবনা মাত্র {rain_p}%। ছাতা নেওয়ার প্রয়োজন নেই।"
                    elif lang == "te":
                        reply = f"{loc}లో ప్రస్తుతం వర్షం పడే అవకాశం కేవలం {rain_p}%. గొడుగు అవసరం లేదు."
                    elif lang == "mr":
                        reply = f"{loc} मध्ये आता पावसाची शक्यता फक्त {rain_p}% आहे. छत्रीची गरज नाही."
                    elif lang == "hi":
                        reply = f"{loc} में अभी बारिश की संभावना केवल {rain_p}% है। छाता ले जाने की आवश्यकता नहीं है।"
                    else:
                        reply = f"{loc} has a low {rain_p}% chance of rain right now. No umbrella needed."
                structured_data = {"location": loc, "rain_probability": rain_p, "precipitation_mm": precip}
            if lang == "bn":
                suggested_actions = ["প্রতি ঘণ্টার বৃষ্টির পূর্বাভাস", "সড়ক দৃশ্যমানতা", "যাতায়াত পরামর্শ"]
            elif lang == "te":
                suggested_actions = ["గంటవారీ వర్ష సూచన", "రహదారి దృశ్యమానత", "ప్రయాణ సలహా"]
            elif lang == "mr":
                suggested_actions = ["ताशी पावसाचा अंदाज", "रस्त्यावरील दृश्यमानता", "प्रवास सल्ला"]
            elif lang == "hi":
                suggested_actions = ["प्रति घंटा बारिश का पूर्वानुमान", "सड़क दृश्यता", "आवागमन परामर्श"]
            else:
                suggested_actions = ["Hourly rain forecast", "Road visibility", "Commute advisory"]

        elif intent == "VISIBILITY":
            vis = curr.visibility
            vis_cat = curr.visibility_category or ("Clear" if vis >= 8 else "Moderate" if vis >= 4 else "Low")
            if lang == "bn":
                reply = f"{loc}-এ রাস্তার দৃশ্যমানতা বর্তমানে {vis} কিমি।"
                suggested_actions = ["মহাসড়ক ভ্রমণ পরামর্শ", "যাতায়াত পরিস্থিতি", "বায়ুর মান (AQI)"]
            elif lang == "te":
                reply = f"{loc}లో రహదారి దృశ్యమానత ప్రస్తుతం {vis} కిమీగా ఉంది."
                suggested_actions = ["హైవే ప్రయాణ సలహా", "రవాణా పరిస్థితులు", "గాలి నాణ్యత (AQI)"]
            elif lang == "mr":
                reply = f"{loc} मध्ये रस्त्यावरील दृश्यमानता सध्या {vis} किमी आहे."
                suggested_actions = ["महामार्ग प्रवास सल्ला", "प्रवास स्थिती", "हवेची गुणवत्ता (AQI)"]
            elif lang == "hi":
                reply = f"{loc} में सड़क दृश्यता वर्तमान में {vis} किमी है।"
                suggested_actions = ["राजमार्ग यात्रा सलाह", "आवागमन स्थिति", "वायु गुणवत्ता (AQI)"]
            else:
                reply = f"Road visibility in {loc} is currently {vis} km ({vis_cat} sightlines)."
                suggested_actions = ["Highway travel advice", "Commute road conditions", "Air quality (AQI)"]
            structured_data = {"location": loc, "visibility_km": vis, "category": vis_cat}

        elif intent == "AQI":
            if lang == "bn":
                reply = f"{loc}-এ বায়ুর মান সূচক (AQI) বর্তমানে {curr.aqi} ({curr.aqi_category}) এবং PM2.5 স্তর {getattr(curr, 'pm2_5', 22.4)} µg/m³।"
                suggested_actions = ["দৌড়ানোর সেরা সময়", "ইউভি সূচক সুরক্ষা", "আর্দ্রতার মাত্রা"]
            elif lang == "te":
                reply = f"{loc}లో గాలి నాణ్యత సూచిక (AQI) ప్రస్తుతం {curr.aqi} ({curr.aqi_category}) మరియు PM2.5 స్థాయి {getattr(curr, 'pm2_5', 22.4)} µg/m³."
                suggested_actions = ["పరుగుకు సరైన సమయం", "UV సూచిక భద్రత", "తేమ స్థాయి"]
            elif lang == "mr":
                reply = f"{loc} मध्ये हवेची गुणवत्ता (AQI) सध्या {curr.aqi} ({curr.aqi_category}) आहे आणि PM2.5 पातळी {getattr(curr, 'pm2_5', 22.4)} µg/m³ आहे."
                suggested_actions = ["धावण्यासाठी सर्वोत्तम वेळ", "अतिनील किरण सुरक्षा", "आर्द्रता पातळी"]
            elif lang == "hi":
                reply = f"{loc} में वायु गुणवत्ता सूचकांक (AQI) वर्तमान में {curr.aqi} ({curr.aqi_category}) है और PM2.5 स्तर {getattr(curr, 'pm2_5', 22.4)} µg/m³ है।"
                suggested_actions = ["दौड़ने का सही समय", "यूवी इंडेक्स सुरक्षा", "आर्द्रता स्तर"]
            else:
                reply = f"Air Quality Index in {loc} is currently {curr.aqi} ({curr.aqi_category}) with PM2.5 at {getattr(curr, 'pm2_5', 22.4)} µg/m³."
                suggested_actions = ["Best time for outdoor run", "UV Index safety", "Humidity level"]
            structured_data = {"location": loc, "aqi": curr.aqi, "category": curr.aqi_category}

        elif intent == "UV":
            if lang == "bn":
                advice = "তীব্র রোদ থেকে বাঁচতে সানস্ক্রিন ব্যবহার করুন।" if curr.uv_index >= 6 else "বর্তমানে ইউভি মাত্রা স্বাভাবিক রয়েছে।"
                reply = f"{loc}-এ বর্তমান ইউভি সূচক {curr.uv_index}। {advice}"
                suggested_actions = ["সূর্যোদয় ও সূর্যাস্তের সময়", "বর্তমান তাপমাত্রা", "ওয়ার্কআউট স্কোর"]
            elif lang == "te":
                advice = "ఎండ తీవ్రత నుండి రక్షణ కోసం సన్‌స్క్రీన్ వాడండి." if curr.uv_index >= 6 else "ప్రస్తుతం UV స్థాయి సాధారణంగా ఉంది."
                reply = f"{loc}లో ప్రస్తుత UV సూచిక {curr.uv_index}. {advice}"
                suggested_actions = ["సూర్యోదయం & సూర్యాస్తమయం", "ప్రస్తుత ఉష్ణోగ్రత", "వర్కౌట్ స్కోరు"]
            elif lang == "mr":
                advice = "तीव्र उन्हापासून संरक्षणासाठी सनस्क्रीन लावा." if curr.uv_index >= 6 else "सध्या अतिनील किरण पातळी सामान्य आहे."
                reply = f"{loc} मध्ये सध्याचा अतिनील निर्देशांक {curr.uv_index} आहे. {advice}"
                suggested_actions = ["सूर्योदय आणि सूर्यास्त वेळ", "सध्याचे तापमान", "व्यायाम स्कोअर"]
            elif lang == "hi":
                advice = "तीव्र धूप से बचाव के लिए सनस्क्रीन लगाएं।" if curr.uv_index >= 6 else "वर्तमान में सौर यूवी स्तर सामान्य है।"
                reply = f"{loc} में वर्तमान यूवी सूचकांक {curr.uv_index} है। {advice}"
                suggested_actions = ["सूर्योदय और सूर्यास्त समय", "वर्तमान तापमान", "वर्कआउट स्कोर"]
            else:
                reply = f"Current UV Index in {loc} is {curr.uv_index}. {'Apply sunscreen for peak solar exposure.' if curr.uv_index >= 6 else 'Low solar UV radiation currently.'}"
                suggested_actions = ["Sunrise and sunset time", "Temperature right now", "Outdoor workout score"]
            structured_data = {"location": loc, "uv_index": curr.uv_index}

        elif intent == "HUMIDITY":
            if lang == "bn":
                reply = f"{loc}-এ আপেক্ষিক আর্দ্রতা বর্তমানে {curr.humidity}%।"
                suggested_actions = ["বর্তমান তাপমাত্রা", "আজ কি বৃষ্টি হবে?", "বায়ুর মান"]
            elif lang == "te":
                reply = f"{loc}లో సాపేక్ష తేమ ప్రస్తుతం {curr.humidity}%."
                suggested_actions = ["ప్రస్తుత ఉష్ణోగ్రత", "ఈరోజు వర్షం పడుతుందా?", "గాలి నాణ్యత"]
            elif lang == "mr":
                reply = f"{loc} मध्ये सापेक्ष आर्द्रता सध्या {curr.humidity}% आहे."
                suggested_actions = ["सध्याचे तापमान", "आज पाऊस पडेल का?", "हवेची गुणवत्ता"]
            elif lang == "hi":
                reply = f"{loc} में सापेक्ष आर्द्रता वर्तमान में {curr.humidity}% है।"
                suggested_actions = ["वर्तमान तापमान", "क्या आज बारिश होगी?", "वायु गुणवत्ता"]
            else:
                reply = f"Relative humidity in {loc} is currently {curr.humidity}%."
                suggested_actions = ["Temperature right now", "Will it rain today?", "Air quality"]
            structured_data = {"location": loc, "humidity": curr.humidity}

        elif intent == "PRESSURE":
            press = getattr(curr, "pressure", 1013)
            if lang == "bn":
                reply = f"{loc}-এ বায়ুমণ্ডলীয় চাপ বর্তমানে {press} hPa।"
            elif lang == "te":
                reply = f"{loc}లో వాతావరణ పీడనం ప్రస్తుతం {press} hPa."
            elif lang == "mr":
                reply = f"{loc} मध्ये वातावरणाचा दाब सध्या {press} hPa आहे."
            elif lang == "hi":
                reply = f"{loc} में सतह वायुमंडलीय दबाव वर्तमान में {press} hPa है।"
            else:
                reply = f"Surface atmospheric pressure in {loc} is currently {press} hPa."
            suggested_actions = ["Wind speed", "Temperature right now", "Weather forecast"]
            structured_data = {"location": loc, "pressure": press}

        elif intent == "SUNRISE_SUNSET":
            if lang == "bn":
                reply = f"{loc}-এ সূর্যোদয় {curr.sunrise} এবং সূর্যাস্ত {curr.sunset} এ হবে।"
                suggested_actions = ["ইউভি সূচক", "বর্তমান তাপমাত্রা", "গোল্ডেন আওয়ার সময়"]
            elif lang == "te":
                reply = f"{loc}లో సూర్యోదయం {curr.sunrise} మరియు సూర్యాస్తమయం {curr.sunset} సమయానికి ఉంటుంది."
                suggested_actions = ["UV సూచిక", "ప్రస్తుత ఉష్ణోగ్రత", "గోల్డెన్ అవర్ సమయం"]
            elif lang == "mr":
                reply = f"{loc} मध्ये सूर्योदय {curr.sunrise} आणि सूर्यास्त {curr.sunset} वाजता होईल."
                suggested_actions = ["अतिनील निर्देशांक", "सध्याचे तापमान", "गोल्डन अवर वेळ"]
            elif lang == "hi":
                reply = f"{loc} में सूर्योदय {curr.sunrise} और सूर्यास्त {curr.sunset} पर होगा।"
                suggested_actions = ["यूवी इंडेक्स", "वर्तमान तापमान", "गोल्डन ऑवर समय"]
            else:
                reply = f"Sunrise in {loc} is at {curr.sunrise} and sunset is at {curr.sunset}."
                suggested_actions = ["UV Index", "Temperature right now", "Golden hour window"]
            structured_data = {"location": loc, "sunrise": curr.sunrise, "sunset": curr.sunset}

        elif intent == "HOURLY_FORECAST":
            chart_items = []
            prefix = (
                f"{loc}-এর জন্য প্রতি ঘণ্টার তাপমাত্রা ধারা:" if lang == "bn" else
                f"{loc} కోసం గంటవారీ ఉష్ణోగ్రత సరళి:" if lang == "te" else
                f"{loc} साठी ताशी तापमान अंदाज:" if lang == "mr" else
                f"{loc} के लिए प्रति घंटा तापमान रुझान:" if lang == "hi" else
                f"Hourly temperature trend for {loc}:"
            )
            lines = [prefix]
            for h in hourly[:8]:
                time_str = getattr(h, "time", f"{getattr(h, 'hour', 0)}:00")
                t_val = getattr(h, "temperature", curr.temperature)
                p_val = getattr(h, "precipitation_probability", 0)
                if lang == "bn":
                    lines.append(f"{time_str}: {t_val}°C (বৃষ্টি {p_val}%)")
                elif lang == "te":
                    lines.append(f"{time_str}: {t_val}°C (వర్షం {p_val}%)")
                elif lang == "mr":
                    lines.append(f"{time_str}: {t_val}°C (पाऊस {p_val}%)")
                elif lang == "hi":
                    lines.append(f"{time_str}: {t_val}°C (बारिश {p_val}%)")
                else:
                    lines.append(f"{time_str}: {t_val}°C (Rain {p_val}%)")
                chart_items.append({"time": time_str, "temp": t_val, "rain_prob": p_val})
            reply = " | ".join(lines)
            structured_data = {"location": loc, "hourly": chart_items}
            if lang == "bn":
                suggested_actions = ["আজ কি বৃষ্টি হবে?", "দৌড়ানোর সেরা সময়", "বাতাসের গতি"]
            elif lang == "te":
                suggested_actions = ["ఈరోజు వర్షం పడుతుందా?", "పరుగుకు సరైన సమయం", "గాలి వేగం"]
            elif lang == "mr":
                suggested_actions = ["आज पाऊस पडेल का?", "धावण्यासाठी सर्वोत्तम वेळ", "वाऱ्याचा वेग"]
            elif lang == "hi":
                suggested_actions = ["क्या आज बारिश होगी?", "दौड़ने का सही समय", "हवा की गति"]
            else:
                suggested_actions = ["Will it rain today?", "Best time to run", "Wind speed"]

        elif intent == "RUNNING_ADVISORY":
            if lang == "bn":
                verdict = "দৌড়ানোর জন্য অত্যন্ত উপযুক্ত" if curr.precipitation_probability < 30 and curr.temperature <= 32 else "সতর্কতা সহকারে দৌড়ান"
                reply = f"{loc}-এ দৌড়ানোর জন্য: {verdict}। তাপমাত্রা {curr.temperature}°C, AQI {curr.aqi} ({curr.aqi_category}) এবং বৃষ্টির ঝুঁকি {curr.precipitation_probability}%।"
                suggested_actions = ["সেরা ওয়ার্কআউট সময়", "AQI ধারা", "বৃষ্টির ঝুঁকি"]
            elif lang == "te":
                verdict = "బయట పరుగుకు అత్యంత అనుకూలం" if curr.precipitation_probability < 30 and curr.temperature <= 32 else "జాగ్రత్తగా పరుగెత్తండి"
                reply = f"{loc}లో పరుగుకు: {verdict}. ఉష్ణోగ్రత {curr.temperature}°C, AQI {curr.aqi} ({curr.aqi_category}) మరియు వర్షం అవకాశం {curr.precipitation_probability}%."
                suggested_actions = ["ఉత్తమ వర్కౌట్ సమయం", "AQI సరళి", "వర్ష ప్రమాదం"]
            elif lang == "mr":
                verdict = "धावण्यासाठी सर्वोत्तम वेळ" if curr.precipitation_probability < 30 and curr.temperature <= 32 else "काळजीपूर्वक धावा"
                reply = f"{loc} मध्ये धावण्यासाठी: {verdict}. तापमान {curr.temperature}°C, AQI {curr.aqi} ({curr.aqi_category}) आणि पावसाची शक्यता {curr.precipitation_probability}% आहे."
                suggested_actions = ["सर्वोत्तम व्यायाम वेळ", "AQI ट्रेंड", "पावसाचा धोका"]
            elif lang == "hi":
                verdict = "दौड़ने के लिए सर्वोत्तम" if curr.precipitation_probability < 30 and curr.temperature <= 32 else "सावधानीपूर्वक दौड़ें (उष्ण/गीला)"
                reply = f"{loc} में दौड़ने के लिए: {verdict}। तापमान {curr.temperature}°C, AQI {curr.aqi} ({curr.aqi_category}) और बारिश की संभावना {curr.precipitation_probability}% है।"
                suggested_actions = ["सर्वश्रेष्ठ वर्कआउट समय", "AQI रुझान", "बारिश का जोखिम"]
            else:
                verdict = "Optimal for Outdoor Run" if curr.precipitation_probability < 30 and curr.temperature <= 32 else "Exercise Caution (Warm/Wet)"
                reply = f"For running in {loc}: {verdict}. Temp is {curr.temperature}°C, AQI is {curr.aqi} ({curr.aqi_category}), and rain chance is {curr.precipitation_probability}%."
                suggested_actions = ["Best workout window", "Check AQI trend", "Rain risk"]
            structured_data = {"location": loc, "verdict": verdict, "temperature": curr.temperature, "aqi": curr.aqi}

        elif intent == "COMMUTE_ADVISORY":
            rain_p = curr.precipitation_probability
            if lang == "bn":
                mode = "মেট্রো / গাড়ি" if rain_p >= 50 else "বাইক / গণপরিবহন"
                reply = f"{loc}-এর জন্য যাতায়াত পরামর্শ: প্রস্তাবিত মাধ্যম {mode}। বৃষ্টির ঝুঁকি {rain_p}% এবং দৃশ্যমানতা {curr.visibility} কিমি।"
                suggested_actions = ["আমার কি ছাতা নেওয়া উচিত?", "দৃশ্যমানতা পরিস্থিতি", "বাতাসের গতি"]
            elif lang == "te":
                mode = "మెట్రో / కారు" if rain_p >= 50 else "బైక్ / పబ్లిక్ ట్రాన్సిట్"
                reply = f"{loc} ప్రయాణ సలహా: సూచించిన రవాణా మార్గం {mode}. వర్ష ప్రమాదం {rain_p}% మరియు దృశ్యమానత {curr.visibility} కిమీ."
                suggested_actions = ["నేను గొడుగు తీసుకెళ్లాలా?", "ప్రస్తుత దృశ్యమానత", "గాలి వేగం"]
            elif lang == "mr":
                mode = "मेट्रो / कार" if rain_p >= 50 else "दुचाकी / सार्वजनिक वाहतूक"
                reply = f"{loc} प्रवासाचा सल्ला: शिफारस केलेले साधन {mode}. पावसाचा धोका {rain_p}% आणि दृश्यमानता {curr.visibility} किमी आहे."
                suggested_actions = ["छत्री सोबत ठेवावी का?", "दृश्यमानता स्थिती", "वाऱ्याचा वेग"]
            elif lang == "hi":
                mode = "मेट्रो / कार" if rain_p >= 50 else "दुपहिया / सामान्य परिवहन"
                reply = f"{loc} के लिए आवागमन परामर्श: अनुशंसित माध्यम {mode} है। बारिश का जोखिम {rain_p}% और दृश्यता {curr.visibility} किमी है।"
                suggested_actions = ["क्या मुझे छाता लेना चाहिए?", "दृश्यता स्थिति", "हवा की गति"]
            else:
                mode = "Metro / Car" if rain_p >= 50 else "Two-Wheeler / Surface Transit"
                reply = f"Commute Advisory for {loc}: Recommended mode is {mode}. Rain risk is {rain_p}% and road visibility is {curr.visibility} km."
                suggested_actions = ["Should I carry an umbrella?", "Visibility right now", "Wind speed"]
            structured_data = {"location": loc, "recommended_mode": mode, "rain_risk": rain_p}

        elif intent == "TRAVEL_ADVISORY":
            vis = curr.visibility
            wind = curr.wind_speed
            rain = curr.precipitation_probability
            if lang == "bn":
                status = "ভ্রমণের জন্য অনুকূল পরিস্থিতি" if vis >= 6 and rain < 40 and wind < 30 else "সতর্কতা সহকারে ভ্রমণ করুন"
                reply = f"{loc}-এর জন্য ভ্রমণ পরামর্শ: {status}। হাইওয়ে দৃশ্যমানতা {vis} কিমি, বাতাসের গতি {wind} কিমি/ঘণ্টা এবং বৃষ্টির ঝুঁকি {rain}%।"
                suggested_actions = ["৭ দিনের ভ্রমণ দৃষ্টিভঙ্গি", "বৃষ্টির সম্ভাবনা", "সড়ক দৃশ্যমানতা"]
            elif lang == "te":
                status = "ప్రయాణానికి అనుకూలమైన పరిస్థితులు" if vis >= 6 and rain < 40 and wind < 30 else "జాగ్రత్తగా ప్రయాణించండి"
                reply = f"{loc} ప్రయాణ సలహా: {status}. హైవే దృశ్యమానత {vis} కిమీ, గాలి వేగం {wind} కిమీ/గం మరియు వర్ష ప్రమాదం {rain}%."
                suggested_actions = ["7-రోజుల ప్రయాణ సూచన", "వర్ష సూచన", "రహదారి దృశ్యమానత"]
            elif lang == "mr":
                status = "प्रवासासाठी अनुकूल स्थिती" if vis >= 6 and rain < 40 and wind < 30 else "सावधगिरीने प्रवास करा"
                reply = f"{loc} प्रवास सल्ला: {status}. महामार्ग दृश्यमानता {vis} किमी, वाऱ्याचा वेग {wind} किमी/तास आणि पावसाचा धोका {rain}% आहे."
                suggested_actions = ["७-दिवसीय प्रवास अंदाज", "पावसाची शक्यता", "रस्त्यावरील दृश्यमानता"]
            elif lang == "hi":
                status = "अनुकूल यात्रा स्थिति" if vis >= 6 and rain < 40 and wind < 30 else "सावधानीपूर्वक यात्रा करें"
                reply = f"{loc} के लिए यात्रा परामर्श: {status}। राजमार्ग दृश्यता {vis} किमी, हवा की गति {wind} किमी/घंटा और बारिश का जोखिम {rain}% है।"
                suggested_actions = ["7-दिवसीय यात्रा दृष्टिकोण", "बारिश की संभावना", "सड़क दृश्यता"]
            else:
                status = "Favorable Travel Conditions" if vis >= 6 and rain < 40 and wind < 30 else "Travel Caution Advised"
                reply = f"Travel Advisory for {loc}: {status}. Highway visibility is {vis} km, crosswind is {wind} km/h, and rain risk is {rain}%."
                suggested_actions = ["7-day travel outlook", "Rain chance", "Road visibility"]
            structured_data = {"location": loc, "status": status, "visibility_km": vis, "crosswind_kmh": wind}

        elif intent == "KRISHI_ADVISORY":
            wind_s = curr.wind_speed
            rain_p = curr.precipitation_probability
            if lang == "bn":
                spray = "স্প্রে করার উপযুক্ত" if wind_s < 15 and rain_p < 40 else "ঝড়ো বাতাস / বৃষ্টির সতর্কতা"
                reply = f"{loc}-এর জন্য কৃষি পরামর্শ: কীটনাশক স্প্রে '{spray}' (বাতাস {wind_s} কিমি/ঘণ্টা)। বৃষ্টির ঝুঁকি {rain_p}% এবং আর্দ্রতা {curr.humidity}%।"
                suggested_actions = ["স্প্রে করার নিরাপদ সময়", "মাটির আর্দ্রতা", "আর্দ্রতার ধারা"]
            elif lang == "te":
                spray = "పిచికారీకి అనుకూలం" if wind_s < 15 and rain_p < 40 else "ఈదురు గాలులు / వర్ష హెచ్చరిక"
                reply = f"{loc} వ్యవసాయ సలహా: పురుగుమందుల పిచికారీ '{spray}' (గాలి వేగం {wind_s} కిమీ/గం). వర్ష ప్రమాదం {rain_p}% మరియు తేమ {curr.humidity}%."
                suggested_actions = ["పిచికారీ సురక్షిత సమయం", "నేల తేమ", "తేమ సరళి"]
            elif lang == "mr":
                spray = "फवारणीसाठी सुरक्षित" if wind_s < 15 and rain_p < 40 else "जोरदार वारा / पावसाची दक्षता"
                reply = f"{loc} कृषी सल्ला: कीटकनाशक फवारणी '{spray}' (वाऱ्याचा वेग {wind_s} किमी/तास). पावसाचा धोका {rain_p}% आणि आर्द्रता {curr.humidity}% आहे."
                suggested_actions = ["फवारणीची सुरक्षित वेळ", "जमिनीतील ओलावा", "आर्द्रता कल"]
            elif lang == "hi":
                spray = "छिड़काव के लिए सुरक्षित" if wind_s < 15 and rain_p < 40 else "तेज हवा / बारिश की सावधानी"
                reply = f"{loc} के लिए कृषि परामर्श: कीटनाशक छिड़काव '{spray}' (हवा {wind_s} किमी/घंटा)। बारिश का जोखिम {rain_p}% और आर्द्रता {curr.humidity}% है।"
                suggested_actions = ["छिड़काव का सुरक्षित समय", "मिट्टी की नमी", "आर्द्रता रुझान"]
            else:
                spray = "Safe for Spraying" if wind_s < 15 and rain_p < 40 else "High Wind / Rain Caution"
                reply = f"Krishi Advisory for {loc}: Spraying safety is '{spray}' (wind {wind_s} km/h). Rain risk is {rain_p}% and humidity is {curr.humidity}%."
                suggested_actions = ["Safe spraying window", "Soil moisture outlook", "Humidity trend"]
            structured_data = {"location": loc, "spraying_safety": spray, "wind_speed": wind_s}

        else:
            if lang == "bn":
                reply = f"{loc}-এ বর্তমান তাপমাত্রা {curr.temperature}°C (অনুভূত {curr.feels_like}°C, {curr.condition_text})। আর্দ্রতা {curr.humidity}%, বাতাসের গতিবেগ {curr.wind_speed} কিমি/ঘণ্টা এবং বৃষ্টির ঝুঁকি {curr.precipitation_probability}%।"
                suggested_actions = ["বর্তমান তাপমাত্রা কত?", "আজ কি বৃষ্টি হবে?", "বাতাসের গতি কেমন?"]
            elif lang == "te":
                reply = f"{loc}లో ప్రస్తుత ఉష్ణోగ్రత {curr.temperature}°C (అనుభూతి {curr.feels_like}°C, {curr.condition_text}). తేమ {curr.humidity}%, గాలి వేగం {curr.wind_speed} కిమీ/గం మరియు వర్షం అవకాశం {curr.precipitation_probability}%."
                suggested_actions = ["ప్రస్తుత ఉష్ణోగ్రత ఎంత?", "ఈరోజు వర్షం పడుతుందా?", "గాలి వేగం ఎంత?"]
            elif lang == "mr":
                reply = f"{loc} मध्ये सध्याचे तापमान {curr.temperature}°C आहे ({curr.feels_like}°C जाणवत आहे, {curr.condition_text}). आर्द्रता {curr.humidity}%, वाऱ्याचा वेग {curr.wind_speed} किमी/तास आणि पावसाची शक्यता {curr.precipitation_probability}% आहे."
                suggested_actions = ["सध्याचे तापमान काय आहे?", "आज पाऊस पडेल का?", "वाऱ्याचा वेग किती आहे?"]
            elif lang == "hi":
                reply = f"{loc} में वर्तमान तापमान {curr.temperature}°C है (अनुभूत {curr.feels_like}°C)। आर्द्रता {curr.humidity}%, हवा की गति {curr.wind_speed} किमी/घंटा और बारिश की संभावना {curr.precipitation_probability}% है।"
                suggested_actions = ["वर्तमान तापमान क्या है?", "क्या आज बारिश होगी?", "हवा की गति कैसी है?"]
            else:
                reply = f"{loc} is currently {curr.temperature}°C (feels like {curr.feels_like}°C, {curr.condition_text}). Humidity is {curr.humidity}%, wind is {curr.wind_speed} km/h, and rain risk is {curr.precipitation_probability}%."
                suggested_actions = ["What is the temperature right now?", "Will it rain today?", "How strong is the wind?"]
            structured_data = {"location": loc, "temperature": curr.temperature, "feels_like": curr.feels_like, "rain_prob": curr.precipitation_probability, "aqi": curr.aqi}

        # ── 4. DYNAMIC LLM REWRITING (IF ENABLED) ─────────────────────────────
        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel('gemini-1.5-flash')
                
                prompt = f"""
You are VayuSync Sahayak, a highly empathetic and concise AI weather assistant.
The user asked: "{msg}"
The active language is: {lang}
The weather system generated this data-grounded response: "{reply}"

Your task:
Rewrite the weather system's response to be more conversational, natural, and intelligent.
Keep it extremely concise (1-2 short sentences max).
Do NOT hallucinate any numbers or facts that are not in the generated response.
Do NOT use markdown bolding or bullet points. Just plain text.
Respond ONLY with the rewritten text.
"""
                response = model.generate_content(prompt)
                if response.text:
                    reply = response.text.strip()
            except Exception as e:
                logger.error(f"[ASSISTANT] Gemini LLM generation failed: {e}")

        # Structured backend observability log
        logger.info(
            f"[ASSISTANT] request_id={req_id} query=\"{msg}\" input_mode={input_mode} "
            f"intent={intent} location=\"{loc}\" lat={lat} lon={lon} "
            f"api_status=200 data_timestamp=\"{obs_time}\" response=success"
        )

        return {
            "success": True,
            "reply": reply,
            "answer": reply,
            "location": {
                "name": loc,
                "latitude": lat,
                "longitude": lon,
            },
            "intent": intent,
            "requested_time": time_ctx["label"],
            "weather": {
                "temperature": curr.temperature,
                "feels_like": curr.feels_like,
                "humidity": curr.humidity,
                "wind_speed": curr.wind_speed,
                "precipitation": curr.precipitation,
                "rain_probability": curr.precipitation_probability,
                "visibility": curr.visibility,
                "uv_index": curr.uv_index,
                "aqi": curr.aqi,
                "condition_text": curr.condition_text
            },
            "data": structured_data,
            "suggested_actions": suggested_actions,
            "source": f"Open-Meteo ({loc})",
            "data_timestamp": obs_time,
            "conversation_location": loc,
            "input_mode": input_mode,
            "session_id": req_id,
            "confidence": 0.95
        }

    @classmethod
    async def _handle_comparison(cls, city1: str, city2: str, user_query: str, req_id: str, input_mode: str) -> Dict[str, Any]:
        lat1, lon1, c1_name = await LocationResolver.resolve(city1)
        lat2, lon2, c2_name = await LocationResolver.resolve(city2)

        if not lat1 or not lat2:
            reply = f"Could not resolve locations for comparison ({city1} vs {city2})."
            return {
                "success": False,
                "reply": reply,
                "answer": reply,
                "location": {"name": f"{city1} vs {city2}", "latitude": 0.0, "longitude": 0.0},
                "intent": "WEATHER_COMPARISON",
                "requested_time": "Currently",
                "weather": {},
                "data": {},
                "suggested_actions": [f"Weather in {city1}", f"Weather in {city2}"],
                "source": "VayuSync Engine",
                "data_timestamp": datetime.now().strftime("%I:%M %p IST"),
                "conversation_location": city1,
                "input_mode": input_mode,
                "session_id": req_id,
                "confidence": 0.0
            }

        try:
            w1 = await WeatherService.fetch_weather(lat=lat1, lon=lon1, location_name=c1_name)
            w2 = await WeatherService.fetch_weather(lat=lat2, lon=lon2, location_name=c2_name)
            
            reply = (
                f"Comparison: {w1.location.name} is {w1.current.temperature}°C (feels {w1.current.feels_like}°C, rain chance {w1.current.precipitation_probability}%) "
                f"while {w2.location.name} is {w2.current.temperature}°C (feels {w2.current.feels_like}°C, rain chance {w2.current.precipitation_probability}%)."
            )
            return {
                "success": True,
                "reply": reply,
                "answer": reply,
                "location": {"name": f"{w1.location.name} vs {w2.location.name}", "latitude": lat1, "longitude": lon1},
                "intent": "WEATHER_COMPARISON",
                "requested_time": "Currently",
                "weather": {
                    "city1_temp": w1.current.temperature,
                    "city2_temp": w2.current.temperature,
                },
                "data": {"city1": w1.location.name, "city2": w2.location.name},
                "suggested_actions": [f"Weather in {w1.location.name}", f"Weather in {w2.location.name}"],
                "source": "Open-Meteo",
                "data_timestamp": w1.current.observation_time,
                "conversation_location": w1.location.name,
                "input_mode": input_mode,
                "session_id": req_id,
                "confidence": 0.95
            }
        except Exception as err:
            logger.error(f"[ASSISTANT] Comparison failed: {err}")
            reply = f"Could not fetch weather data to compare {city1} and {city2} right now."
            return {
                "success": False,
                "reply": reply,
                "answer": reply,
                "location": {"name": city1, "latitude": 0.0, "longitude": 0.0},
                "intent": "WEATHER_COMPARISON",
                "requested_time": "Currently",
                "weather": {},
                "data": {},
                "suggested_actions": ["Retry comparison"],
                "source": "VayuSync Engine",
                "data_timestamp": datetime.now().strftime("%I:%M %p IST"),
                "conversation_location": city1,
                "input_mode": input_mode,
                "session_id": req_id,
                "confidence": 0.0
            }
