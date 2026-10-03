import os
import time
import pickle
import logging
import warnings
import httpx
from datetime import datetime, timezone
import numpy as np
from typing import Dict, Any, List, Tuple, Optional
from ..models.crops import (
    CropPredictionRequest, 
    CropPredictionResponse, 
    CropRecommendationItem,
    CropClimateResponse,
    FertilizerRecommendation,
    NPKStatus
)

logger = logging.getLogger("vayusync.crop_service")

# Suppress sklearn feature name warnings during scalar transformation
warnings.filterwarnings("ignore", category=UserWarning)

CROP_DICT: Dict[int, str] = {
    1: "Rice", 2: "Maize", 3: "Jute", 4: "Cotton", 5: "Coconut", 
    6: "Papaya", 7: "Orange", 8: "Apple", 9: "Muskmelon", 
    10: "Watermelon", 11: "Grapes", 12: "Mango", 13: "Banana",
    14: "Pomegranate", 15: "Lentil", 16: "Blackgram", 17: "Mungbean", 
    18: "Mothbeans", 19: "Pigeonpeas", 20: "Kidneybeans", 
    21: "Chickpea", 22: "Coffee"
}

CROP_IMAGE_MAP: Dict[str, str] = {
    "Rice": "/images/crops/rice.jpg",
    "Maize": "/images/crops/maize.jpg",
    "Jute": "/images/crops/Jute.jpg",
    "Cotton": "/images/crops/cotton.jpg",
    "Coconut": "/images/crops/coconut.jpg",
    "Papaya": "/images/crops/Papaya.jpg",
    "Orange": "/images/crops/orange.jpg",
    "Apple": "/images/crops/apple.jpg",
    "Muskmelon": "/images/crops/Muskmelon.jpg",
    "Watermelon": "/images/crops/watermelon.jpg",
    "Grapes": "/images/crops/grapes.jpg",
    "Mango": "/images/crops/mango.jpg",
    "Banana": "/images/crops/banana.jpg",
    "Pomegranate": "/images/crops/pomegrante.jpg",
    "Lentil": "/images/crops/lentil.jpg",
    "Blackgram": "/images/crops/blackgram.jpg",
    "Mungbean": "/images/crops/mungbean.jpg",
    "Mothbeans": "/images/crops/mothbeans.jpg",
    "Pigeonpeas": "/images/crops/pigeonbeans.jpg",
    "Kidneybeans": "/images/crops/kidneybeans.jpg",
    "Chickpea": "/images/crops/chickpea.jpg",
    "Coffee": "/images/crops/Coffee.jpeg",
}

CROP_METADATA: Dict[str, Dict[str, str]] = {
    "Rice": {"category": "Cereal / Food Grain", "ideal_season": "Kharif (Monsoon)", "fertilizer": "NPK 100:40:40 kg/ha", "sowing": "June - July"},
    "Maize": {"category": "Coarse Cereal", "ideal_season": "Kharif / Rabi", "fertilizer": "NPK 120:60:40 kg/ha", "sowing": "June - July / Oct - Nov"},
    "Jute": {"category": "Cash / Fiber Crop", "ideal_season": "Warm Humid Monsoon", "fertilizer": "NPK 60:30:30 kg/ha", "sowing": "March - May"},
    "Cotton": {"category": "Fiber / Cash Crop", "ideal_season": "Kharif", "fertilizer": "NPK 100:50:50 kg/ha", "sowing": "April - June"},
    "Coconut": {"category": "Plantation Crop", "ideal_season": "Perennial Tropical", "fertilizer": "NPK 500:320:1200 g/palm/year", "sowing": "May - June"},
    "Papaya": {"category": "Horticulture / Fruit", "ideal_season": "Tropical / Subtropical", "fertilizer": "NPK 200:200:250 g/plant/year", "sowing": "June - Sept"},
    "Orange": {"category": "Citrus Fruit", "ideal_season": "Subtropical Winter/Spring", "fertilizer": "NPK 400:200:400 g/tree", "sowing": "July - Aug"},
    "Apple": {"category": "Temperate Fruit", "ideal_season": "Cool Temperate", "fertilizer": "NPK 350:175:350 g/tree", "sowing": "Dec - Feb"},
    "Muskmelon": {"category": "Cucurbit / Zaid Crop", "ideal_season": "Zaid (Summer)", "fertilizer": "NPK 80:40:40 kg/ha", "sowing": "Feb - March"},
    "Watermelon": {"category": "Cucurbit / Zaid Crop", "ideal_season": "Zaid (Summer)", "fertilizer": "NPK 100:50:50 kg/ha", "sowing": "Jan - March"},
    "Grapes": {"category": "Horticulture / Vine", "ideal_season": "Subtropical / Mild Winter", "fertilizer": "NPK 300:200:300 kg/ha", "sowing": "Oct - Nov"},
    "Mango": {"category": "Tropical Fruit", "ideal_season": "Tropical / Subtropical", "fertilizer": "NPK 500:250:500 g/tree", "sowing": "July - Aug"},
    "Banana": {"category": "Fruit / Commercial", "ideal_season": "Humid Tropical", "fertilizer": "NPK 200:40:200 g/plant", "sowing": "June - Aug"},
    "Pomegranate": {"category": "Arid / Semi-Arid Fruit", "ideal_season": "Mridag / Hasta Bahar", "fertilizer": "NPK 250:125:125 g/plant", "sowing": "Dec - Jan / June - July"},
    "Lentil": {"category": "Pulse / Legume", "ideal_season": "Rabi (Winter)", "fertilizer": "NPK 20:40:20 kg/ha", "sowing": "Oct - Nov"},
    "Blackgram": {"category": "Pulse / Legume", "ideal_season": "Kharif / Summer", "fertilizer": "NPK 20:40:20 kg/ha", "sowing": "June - July"},
    "Mungbean": {"category": "Pulse / Short Duration", "ideal_season": "Zaid / Kharif", "fertilizer": "NPK 20:40:20 kg/ha", "sowing": "March - April / June - July"},
    "Mothbeans": {"category": "Arid Pulse / Drought Hardy", "ideal_season": "Kharif (Dryland)", "fertilizer": "NPK 10:20:0 kg/ha", "sowing": "July - Aug"},
    "Pigeonpeas": {"category": "Pulse / Arhar", "ideal_season": "Kharif Long Duration", "fertilizer": "NPK 25:50:25 kg/ha", "sowing": "June - July"},
    "Kidneybeans": {"category": "Pulse / Rajma", "ideal_season": "Rabi / Mild Hills", "fertilizer": "NPK 40:60:30 kg/ha", "sowing": "Oct - Nov"},
    "Chickpea": {"category": "Pulse / Gram", "ideal_season": "Rabi (Post-Monsoon)", "fertilizer": "NPK 20:40:20 kg/ha", "sowing": "Oct - Nov"},
    "Coffee": {"category": "Plantation Beverage", "ideal_season": "Highland Tropical Shade", "fertilizer": "NPK 120:90:120 kg/ha", "sowing": "June - Sept"},
}

# Crop-to-fertilizer mapping — agronomically justified by NPK ratios in CROP_METADATA
# Keys: "Urea", "DAP", "MOP", "SSP", "17-17-17", "28-28", "10-26-26", "14-35-14", "20-20"
CROP_FERTILIZER_MAP: Dict[str, Dict[str, str]] = {
    "Rice":        {"primary": "Urea",     "secondary": "DAP",  "reasoning": "High nitrogen demand for vegetative growth. DAP provides phosphorus for root establishment."},
    "Maize":       {"primary": "Urea",     "secondary": "DAP",  "reasoning": "Heavy nitrogen feeder; DAP at basal dose covers N+P. MOP top-dress at tasseling if K is low."},
    "Jute":        {"primary": "17-17-17", "secondary": "SSP",  "reasoning": "Balanced NPK with SSP for sulphur — improves fibre quality and uniform development."},
    "Cotton":      {"primary": "DAP",      "secondary": "MOP",  "reasoning": "High phosphorus for boll formation; MOP (Muriate of Potash) improves fibre strength and boll weight."},
    "Coconut":     {"primary": "MOP",      "secondary": "SSP",  "reasoning": "Coconut is a high-potassium crop. MOP (KCl) for trunk strength and copra yield; SSP supplies phosphorus and sulphur."},
    "Papaya":      {"primary": "17-17-17", "secondary": "MOP",  "reasoning": "Balanced NPK base; MOP top-dress improves fruit sweetness, shelf life and disease resistance."},
    "Orange":      {"primary": "17-17-17", "secondary": "MOP",  "reasoning": "Balanced NPK; MOP at fruit fill stage improves rind quality, juice content and colour."},
    "Apple":       {"primary": "17-17-17", "secondary": "MOP",  "reasoning": "Balanced nutrition; MOP application enhances fruit colour, firmness and cold-storage life."},
    "Muskmelon":   {"primary": "Urea",     "secondary": "SSP",  "reasoning": "Urea for vine vigour; SSP provides phosphorus + sulphur for fruit set in short-season crop."},
    "Watermelon":  {"primary": "17-17-17", "secondary": "MOP",  "reasoning": "Balanced NPK base; MOP at fruiting stage boosts sugar content and rind thickness."},
    "Grapes":      {"primary": "17-17-17", "secondary": "MOP",  "reasoning": "Balanced NPK; MOP (Muriate of Potash) improves berry sugar content, colour and shelf life."},
    "Mango":       {"primary": "17-17-17", "secondary": "MOP",  "reasoning": "Balanced NPK with MOP emphasis at fruit development for sweetness, colour and pulp quality."},
    "Banana":      {"primary": "Urea",     "secondary": "MOP",  "reasoning": "High nitrogen (Urea) for pseudostem and leaf production; MOP for bunch weight, peel strength and quality."},
    "Pomegranate": {"primary": "DAP",      "secondary": "MOP",  "reasoning": "DAP triggers flowering and fruit set; MOP post-anthesis for arils, juice content and post-harvest quality."},
    "Lentil":      {"primary": "DAP",      "secondary": "SSP",  "reasoning": "DAP + SSP at sowing — phosphorus stimulates Rhizobium nodulation. SSP adds sulphur for pulse protein. Avoid excess N."},
    "Blackgram":   {"primary": "DAP",      "secondary": "SSP",  "reasoning": "DAP + SSP starter dose for nodulation. Sulphur from SSP improves amino acid profile. Legume fixes atmospheric nitrogen."},
    "Mungbean":    {"primary": "DAP",      "secondary": "SSP",  "reasoning": "DAP + SSP at sowing: phosphorus for root development, sulphur for nodulation and pulse quality."},
    "Mothbeans":   {"primary": "SSP",      "secondary": "DAP",  "reasoning": "SSP as primary for dryland phosphorus + sulphur; minimal fertilizer input for this drought-hardy pulse."},
    "Pigeonpeas":  {"primary": "DAP",      "secondary": "SSP",  "reasoning": "DAP + SSP boosts Rhizobium nodulation in long-duration kharif pulse. Sulphur improves grain protein content."},
    "Kidneybeans": {"primary": "DAP",      "secondary": "SSP",  "reasoning": "High phosphorus (DAP) for pod set; SSP provides sulphur for amino acid synthesis in kidney bean grain."},
    "Chickpea":    {"primary": "DAP",      "secondary": "SSP",  "reasoning": "DAP + SSP at sowing — phosphorus + sulphur for nodulation and seed protein. Legume fixes own nitrogen."},
    "Coffee":      {"primary": "17-17-17", "secondary": "MOP",  "reasoning": "Balanced NPK base; MOP (Muriate of Potash) for bean development, cup quality and resistance to stem borer."},
}


class CropPredictionService:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.is_model_available = False
        self._climate_cache: Dict[str, Tuple[CropClimateResponse, float]] = {}
        self._load_models()

    def _compute_fertilizer_recommendation(self, crop: str, n: float, p: float, k: float) -> FertilizerRecommendation:
        """Agronomic fertilizer recommendation via crop-keyed lookup + NPK gap analysis."""
        base = CROP_FERTILIZER_MAP.get(crop, {
            "primary": "17-17-17",
            "secondary": "DAP",
            "reasoning": "Balanced NPK maintenance fertilizer recommended."
        })
        primary = base["primary"]
        gap_note = ""

        # NPK deficiency override — critical deficiency takes priority over crop default
        if n < 30 and p < 20 and k < 20:
            primary = "17-17-17"
            gap_note = f"Multi-nutrient deficiency (N:{n}, P:{p}, K:{k} kg/ha) detected — balanced 17-17-17 prioritised. "
        elif n < 30:
            primary = "Urea"
            gap_note = f"Low soil nitrogen ({n} kg/ha) — nitrogen supplementation prioritised. "
        elif p < 15:
            primary = "DAP"
            gap_note = f"Low soil phosphorus ({p} kg/ha) — DAP application recommended. "
        elif k < 15:
            primary = "MOP"
            gap_note = f"Low soil potassium ({k} kg/ha) — MOP (Muriate of Potash) application recommended. "

        dose = CROP_METADATA.get(crop, {}).get("fertilizer", "Consult local Krishi Vigyan Kendra (KVK)")

        npk_status = NPKStatus(
            nitrogen_status="Low" if n < 30 else ("Adequate" if n < 80 else "High"),
            phosphorus_status="Low" if p < 15 else ("Adequate" if p < 60 else "High"),
            potassium_status="Low" if k < 15 else ("Adequate" if k < 60 else "High"),
        )

        # Human-readable product name for display
        _name_map = {
            "Urea":     "Urea (46-0-0)",
            "DAP":      "DAP (Diammonium Phosphate 18-46-0)",
            "MOP":      "MOP (Muriate of Potash / KCl)",
            "SSP":      "SSP (Single Super Phosphate)",
            "17-17-17": "NPK 17-17-17",
            "28-28":    "NPK 28-28-0",
            "10-26-26": "NPK 10-26-26",
            "14-35-14": "NPK 14-35-14",
            "20-20":    "NPK 20-20-0",
        }
        secondary = base["secondary"]
        fertilizer_name = _name_map.get(primary, f"NPK {primary}")
        if secondary and secondary != primary:
            fertilizer_name += f" + {_name_map.get(secondary, secondary)}"

        return FertilizerRecommendation(
            fertilizer_name=fertilizer_name,
            primary_fertilizer=primary,
            secondary_fertilizer=secondary,
            dose_guidance=dose,
            reasoning=(gap_note + base["reasoning"]).strip(),
            npk_gap=npk_status,
        )


    def _load_models(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(base_dir, "ml", "model.pkl")
        scaler_path = os.path.join(base_dir, "ml", "minmaxscaler.pkl")

        # Fallback check in project root crop_prediction_feature folder
        if not os.path.exists(model_path):
            root_dir = os.path.dirname(base_dir)
            model_path = os.path.join(root_dir, "crop_prediction_feature", "model.pkl")
            scaler_path = os.path.join(root_dir, "crop_prediction_feature", "minmaxscaler.pkl")

        try:
            if os.path.exists(model_path) and os.path.exists(scaler_path):
                with open(model_path, "rb") as mf:
                    self.model = pickle.load(mf)
                with open(scaler_path, "rb") as sf:
                    self.scaler = pickle.load(sf)
                self.is_model_available = True
                logger.info("Successfully loaded Crop Recommendation Random Forest model and scaler.")
            else:
                logger.warning(f"Crop model files not found at {model_path}. Using rule-based agronomy fallback.")
                self.is_model_available = False
        except Exception as e:
            logger.error(f"Error loading crop ML model: {e}. Defaulting to rule-based fallback.", exc_info=True)
            self.is_model_available = False

    async def fetch_climate_telemetry(
        self, 
        lat: float, 
        lon: float, 
        location_name: Optional[str] = None
    ) -> CropClimateResponse:
        """
        Fetches official 30-day agro-climatic telemetry (past 23 days + 7-day forecast)
        from Open-Meteo Forecast API with 1-hour in-memory response caching.

        Agro-climatic computation formula:
          - temperature: Arithmetic mean of daily temperature_2m_mean over 30 days (°C)
          - humidity: Arithmetic mean of daily relative_humidity_2m_mean over 30 days (%)
          - rainfall: Cumulative sum of daily precipitation_sum over 30 days (mm)
        """
        cache_key = f"{round(lat, 2)},{round(lon, 2)}"
        now = time.time()

        # Check cache (1 hour TTL = 3600s)
        if cache_key in self._climate_cache:
            cached_resp, cached_time = self._climate_cache[cache_key]
            if now - cached_time < 3600:
                logger.info(f"Returning cached climate telemetry for {cache_key} ({location_name})")
                return cached_resp

        # Fetch from Open-Meteo
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            f"&daily=temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum"
            f"&past_days=23&forecast_days=7&timezone=auto"
        )

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url)
                res.raise_for_status()
                data = res.json()

            daily = data.get("daily", {})
            raw_temps = daily.get("temperature_2m_mean", [])
            raw_hums = daily.get("relative_humidity_2m_mean", [])
            raw_precips = daily.get("precipitation_sum", [])

            valid_temps = [float(t) for t in raw_temps if t is not None]
            valid_hums = [float(h) for h in raw_hums if h is not None]
            valid_precips = [float(p) for p in raw_precips if p is not None]

            if not valid_temps or not valid_hums:
                raise ValueError("Incomplete daily climate telemetry returned from Open-Meteo")

            # 30-day agro-climatic aggregations
            mean_temp = round(sum(valid_temps) / len(valid_temps), 1)
            mean_hum = round(sum(valid_hums) / len(valid_hums), 1)
            sum_rain = round(sum(valid_precips), 1)

            # Model boundary sanity checks
            if not (-10.0 <= mean_temp <= 50.0) or not (0.0 <= mean_hum <= 100.0) or not (0.0 <= sum_rain <= 3000.0):
                raise ValueError(f"Telemetry out of bounds: temp={mean_temp}, hum={mean_hum}, rain={sum_rain}")

            fetched_at = datetime.now(timezone.utc).isoformat()
            response = CropClimateResponse(
                temperature=mean_temp,
                humidity=mean_hum,
                rainfall=sum_rain,
                basis="30-day agro-climatic average",
                window="23 past days + 7-day forecast",
                source="Open-Meteo API",
                fetched_at=fetched_at,
                location_name=location_name,
                is_available=True,
                error_message=None,
            )

            # Store in cache
            self._climate_cache[cache_key] = (response, now)
            return response

        except Exception as e:
            logger.warning(f"Failed to fetch Open-Meteo 30-day climate for {lat},{lon}: {e}")
            # If expired cache available, serve stale cache with notice
            if cache_key in self._climate_cache:
                stale_resp, _ = self._climate_cache[cache_key]
                logger.info(f"Serving stale cached climate for {cache_key}")
                return stale_resp

            # No cache available — do NOT fabricate mock data as live
            return CropClimateResponse(
                temperature=None,
                humidity=None,
                rainfall=None,
                basis="30-day agro-climatic average",
                window="23 past days + 7-day forecast",
                source="Open-Meteo API (Unavailable)",
                fetched_at=datetime.now(timezone.utc).isoformat(),
                location_name=location_name,
                is_available=False,
                error_message="Couldn't fetch live data - enter manually",
            )


    def predict(self, req: CropPredictionRequest) -> CropPredictionResponse:
        inputs_echo = {
            "nitrogen": req.nitrogen,
            "phosphorus": req.phosphorus,
            "potassium": req.potassium,
            "temperature": req.temperature,
            "humidity": req.humidity,
            "ph": req.ph,
            "rainfall": req.rainfall,
        }

        if self.is_model_available and self.model is not None and self.scaler is not None:
            try:
                # 1. Feature normalization via MinMaxScaler
                features = np.array([[req.nitrogen, req.phosphorus, req.potassium, req.temperature, req.humidity, req.ph, req.rainfall]])
                scaled_features = self.scaler.transform(features)

                # 2. Predict class probabilities
                probs = self.model.predict_proba(scaled_features)[0]
                classes = self.model.classes_

                # Sort classes by descending probability
                sorted_idx = np.argsort(probs)[::-1]
                top_class_id = int(classes[sorted_idx[0]])
                primary_crop = CROP_DICT.get(top_class_id, "Rice")
                primary_conf = float(probs[sorted_idx[0]])

                # Top alternatives (ranks 2 and 3)
                top_alternatives: List[CropRecommendationItem] = []
                for idx in sorted_idx[1:4]:
                    cid = int(classes[idx])
                    cname = CROP_DICT.get(cid)
                    cprob = float(probs[idx])
                    if cname and cprob > 0.005:
                        meta = CROP_METADATA.get(cname, {})
                        top_alternatives.append(
                            CropRecommendationItem(
                                crop=cname,
                                confidence=round(cprob, 3),
                                image_url=CROP_IMAGE_MAP.get(cname, "/images/crops/rice.jpg"),
                                category=meta.get("category"),
                                ideal_season=meta.get("ideal_season"),
                            )
                        )

                meta_primary = CROP_METADATA.get(primary_crop, {})
                reasoning = (
                    f"Optimally aligned for {req.location_name or 'the region'} based on temperature of {req.temperature}°C, "
                    f"relative humidity of {req.humidity}%, rainfall of {req.rainfall} mm, and soil nutrient ratio "
                    f"(N:{req.nitrogen}, P:{req.phosphorus}, K:{req.potassium}, pH:{req.ph})."
                )

                growth_hints = {
                    "Ideal Sowing Window": meta_primary.get("sowing", "Seasonal onset"),
                    "Recommended Fertilizer Ratio": meta_primary.get("fertilizer", "Consult local soil testing"),
                    "Crop Classification": meta_primary.get("category", "General Agriculture"),
                    "Preferred Season": meta_primary.get("ideal_season", "Kharif / Rabi"),
                }

                fert_rec = self._compute_fertilizer_recommendation(primary_crop, req.nitrogen, req.phosphorus, req.potassium)

                return CropPredictionResponse(
                    recommended_crop=primary_crop,
                    confidence=round(primary_conf, 3),
                    primary_image_url=CROP_IMAGE_MAP.get(primary_crop, "/images/crops/rice.jpg"),
                    top_alternatives=top_alternatives,
                    source="ml_model",
                    reasoning=reasoning,
                    growth_hints=growth_hints,
                    advisory_note="Advisory only — consult your local Krishi Vigyan Kendra (KVK) for certified seed varieties, local pest resistance, and soil-specific fertilization.",
                    inputs_echo=inputs_echo,
                    fertilizer_recommendation=fert_rec,
                )
            except Exception as e:
                logger.error(f"ML inference error: {e}. Engaging rule-based agronomy fallback.", exc_info=True)

        # Rule-based fallback
        return self._rule_based_prediction(req, inputs_echo)

    def _rule_based_prediction(self, req: CropPredictionRequest, inputs_echo: Dict[str, float]) -> CropPredictionResponse:
        # Agronomic rules based on moisture and temperature
        if req.rainfall > 180 and req.temperature >= 20:
            rec = "Rice"
            alt = ["Jute", "Coconut"]
        elif req.temperature > 35 and req.rainfall < 80:
            rec = "Mothbeans"
            alt = ["Mungbean", "Muskmelon"]
        elif req.temperature < 22 and req.rainfall < 120:
            rec = "Chickpea"
            alt = ["Lentil", "Maize"]
        elif req.humidity > 80 and req.temperature > 25:
            rec = "Papaya"
            alt = ["Banana", "Cotton"]
        else:
            rec = "Maize"
            alt = ["Pigeonpeas", "Cotton"]

        meta = CROP_METADATA.get(rec, {})
        alternatives = [
            CropRecommendationItem(
                crop=a,
                confidence=0.75,
                image_url=CROP_IMAGE_MAP.get(a, "/images/crops/rice.jpg"),
                category=CROP_METADATA.get(a, {}).get("category"),
                ideal_season=CROP_METADATA.get(a, {}).get("ideal_season"),
            )
            for a in alt
        ]

        fert_rec = self._compute_fertilizer_recommendation(rec, req.nitrogen, req.phosphorus, req.potassium)

        return CropPredictionResponse(
            recommended_crop=rec,
            confidence=0.85,
            primary_image_url=CROP_IMAGE_MAP.get(rec, "/images/crops/rice.jpg"),
            top_alternatives=alternatives,
            source="rule_based",
            reasoning=f"Selected {rec} via agronomy decision matrix for {req.temperature}°C, {req.humidity}% humidity, and {req.rainfall} mm rainfall.",
            growth_hints={
                "Ideal Sowing Window": meta.get("sowing", "Seasonal onset"),
                "Recommended Fertilizer Ratio": meta.get("fertilizer", "Consult soil health card"),
            },
            advisory_note="Advisory only — consult your local Krishi Vigyan Kendra (KVK) for certified seed varieties.",
            inputs_echo=inputs_echo,
            fertilizer_recommendation=fert_rec,
        )

crop_service = CropPredictionService()
