import { HourlyForecast, CurrentWeather } from './types';

export type WateringWindowType = 'Early Morning' | 'Afternoon' | 'Late Evening' | 'Twice Daily' | 'afternoon' | 'early_morning' | 'late_evening' | 'twice_daily';

export interface WateringWindowEvaluation {
  schedule: string;
  normalizedWindow: 'Early Morning' | 'Afternoon' | 'Late Evening' | 'Twice Daily';
  hoursRange: [number, number]; // [startHour, endHour] inclusive/exclusive
  hoursLabel: string;
  status: 'Optimal' | 'Caution' | 'Avoid';
  score: number; // 0 - 100
  reason: string;
  action: string;
  bestAlternativeWindow: string | null;
  metrics: {
    avgTemp: number;
    maxTemp: number;
    maxRainProb: number;
    totalPrecipMm: number;
    maxUV: number;
    avgWindSpeed: number;
    avgHumidity: number;
  };
}

export const WATERING_WINDOWS = {
  EARLY_MORNING: {
    name: 'Early Morning',
    startHour: 5,
    endHour: 8,
    label: '05:00 – 08:00',
    fullLabel: 'Early Morning (5 AM – 8 AM)',
  },
  AFTERNOON: {
    name: 'Afternoon',
    startHour: 12,
    endHour: 16,
    label: '12:00 – 16:00',
    fullLabel: 'Afternoon (12 PM – 4 PM)',
  },
  LATE_EVENING: {
    name: 'Late Evening',
    startHour: 17,
    endHour: 20,
    label: '17:00 – 20:00',
    fullLabel: 'Late Evening (5 PM – 8 PM)',
  },
  TWICE_DAILY: {
    name: 'Twice Daily',
    startHour: 5,
    endHour: 20,
    label: '05:00–08:00 & 17:00–20:00',
    fullLabel: 'Twice Daily (Morning & Evening)',
  },
} as const;

export function normalizeWateringSchedule(scheduleStr?: string | null): 'Early Morning' | 'Afternoon' | 'Late Evening' | 'Twice Daily' {
  if (!scheduleStr) return 'Early Morning';
  const s = scheduleStr.toLowerCase().trim();
  if (s.includes('afternoon') || s.includes('दोपहर') || s.includes('दुपारी') || s.includes('দুপুর') || s.includes('మధ్యాహ్నం')) {
    return 'Afternoon';
  }
  if (s.includes('twice') || s.includes('दो बार') || s.includes('दोनदा') || s.includes('দুইবার') || s.includes('రెండుసార్లు')) {
    return 'Twice Daily';
  }
  if (s.includes('late') || s.includes('evening') || s.includes('शाम') || s.includes('संध्या') || s.includes('రాత్రి')) {
    return 'Late Evening';
  }
  return 'Early Morning';
}

export function evaluateWateringWindow(
  rawSchedule: string | undefined | null,
  hourly: HourlyForecast[] = [],
  current?: Partial<CurrentWeather>
): WateringWindowEvaluation {
  const norm = normalizeWateringSchedule(rawSchedule);

  let targetHours: number[] = [];
  let hoursLabel = '';
  let hoursRange: [number, number] = [5, 8];

  if (norm === 'Afternoon') {
    targetHours = [12, 13, 14, 15];
    hoursLabel = WATERING_WINDOWS.AFTERNOON.label;
    hoursRange = [12, 16];
  } else if (norm === 'Late Evening') {
    targetHours = [17, 18, 19];
    hoursLabel = WATERING_WINDOWS.LATE_EVENING.label;
    hoursRange = [17, 20];
  } else if (norm === 'Twice Daily') {
    targetHours = [5, 6, 7, 17, 18, 19];
    hoursLabel = WATERING_WINDOWS.TWICE_DAILY.label;
    hoursRange = [5, 20];
  } else {
    targetHours = [5, 6, 7];
    hoursLabel = WATERING_WINDOWS.EARLY_MORNING.label;
    hoursRange = [5, 8];
  }

  // Extract relevant hourly slots from forecast
  const windowHourly = hourly.filter((h) => {
    const hNum = typeof h.hour === 'number' ? h.hour : parseInt(h.time.split('T')[1]?.split(':')[0] || '0', 10);
    return targetHours.includes(hNum);
  });

  const fallbackTemp = current?.temperature ?? 26;
  const fallbackRainProb = current?.precipitation_probability ?? 0;
  const fallbackPrecip = current?.precipitation ?? 0;
  const fallbackUV = current?.uv_index ?? (norm === 'Afternoon' ? 7 : norm === 'Early Morning' ? 1 : 0);
  const fallbackWind = current?.wind_speed ?? 10;
  const fallbackHumidity = current?.humidity ?? 60;

  const temps = windowHourly.length > 0 ? windowHourly.map((h) => h.temperature) : [fallbackTemp];
  const rainProbs = windowHourly.length > 0 ? windowHourly.map((h) => h.precipitation_probability) : [fallbackRainProb];
  const precips = windowHourly.length > 0 ? windowHourly.map((h) => h.precipitation ?? 0) : [fallbackPrecip];
  const uvs = windowHourly.length > 0 ? windowHourly.map((h) => h.uv_index ?? 0) : [fallbackUV];
  const winds = windowHourly.length > 0 ? windowHourly.map((h) => h.wind_speed) : [fallbackWind];
  const humidities = windowHourly.length > 0 ? windowHourly.map((h) => h.humidity) : [fallbackHumidity];

  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
  const maxTemp = Math.max(...temps);
  const maxRainProb = Math.max(...rainProbs);
  const totalPrecipMm = precips.reduce((a, b) => a + b, 0);
  const maxUV = Math.max(...uvs);
  const avgWindSpeed = winds.reduce((a, b) => a + b, 0) / winds.length;
  const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;

  const metrics = {
    avgTemp: Math.round(avgTemp * 10) / 10,
    maxTemp: Math.round(maxTemp * 10) / 10,
    maxRainProb: Math.round(maxRainProb),
    totalPrecipMm: Math.round(totalPrecipMm * 10) / 10,
    maxUV: Math.round(maxUV * 10) / 10,
    avgWindSpeed: Math.round(avgWindSpeed * 10) / 10,
    avgHumidity: Math.round(avgHumidity),
  };

  // ── AGRONOMY DECISION TREE ──────────────────────────────────────────────────

  // Rule 1: Rain forecast in or around window -> HOLD IRRIGATION
  if (maxRainProb >= 50 || totalPrecipMm >= 2.0) {
    return {
      schedule: rawSchedule || norm,
      normalizedWindow: norm,
      hoursRange,
      hoursLabel,
      status: 'Avoid',
      score: 20,
      reason: `Rain expected during ${norm.toLowerCase()} window (${maxRainProb}% chance, ${totalPrecipMm > 0 ? totalPrecipMm + ' mm' : 'showers forecast'}). Natural rainfall adequately charges soil root zones.`,
      action: 'Hold canal/overhead irrigation to prevent waterlogging and root rot.',
      bestAlternativeWindow: null,
      metrics,
    };
  }

  // Rule 2: Afternoon Window Agronomy
  if (norm === 'Afternoon') {
    // Heatwave / High Heat / High UV / High Wind & Low Humidity -> Severe evaporation penalty & leaf scorch risk
    if (maxTemp >= 33 || maxUV >= 6 || (avgWindSpeed >= 18 && avgHumidity < 50)) {
      const heatPoints = maxTemp >= 38 ? 35 : maxTemp >= 34 ? 25 : 15;
      const uvPoints = maxUV >= 8 ? 25 : maxUV >= 6 ? 15 : 5;
      const windPoints = avgWindSpeed >= 18 ? 15 : 5;
      const calculatedScore = Math.max(15, 100 - (heatPoints + uvPoints + windPoints));

      return {
        schedule: rawSchedule || norm,
        normalizedWindow: norm,
        hoursRange,
        hoursLabel,
        status: 'Avoid',
        score: calculatedScore,
        reason: `Afternoon watering under current telemetry (${maxTemp}°C, UV Index ${maxUV}, Wind ${avgWindSpeed} km/h) loses up to 40% water to rapid evapotranspiration and risks thermal leaf scorch.`,
        action: 'Shift watering to Early Morning (5 AM – 8 AM) or Late Evening (5 PM – 8 PM) to conserve moisture and protect crop foliage.',
        bestAlternativeWindow: 'Early Morning',
        metrics,
      };
    }

    // Cool / Cloudy / Overcast afternoon conditions (mild temp, low UV, good humidity)
    if (maxTemp <= 28 && maxUV <= 4 && avgHumidity >= 45) {
      return {
        schedule: rawSchedule || norm,
        normalizedWindow: norm,
        hoursRange,
        hoursLabel,
        status: 'Optimal',
        score: 88,
        reason: `Cool, overcast afternoon conditions (${maxTemp}°C, UV ${maxUV}) significantly reduce solar evaporation losses.`,
        action: 'Safe for targeted ground-level drip or furrow irrigation.',
        bestAlternativeWindow: null,
        metrics,
      };
    }

    // Moderate afternoon
    return {
      schedule: rawSchedule || norm,
      normalizedWindow: norm,
      hoursRange,
      hoursLabel,
      status: 'Caution',
      score: 55,
      reason: `Moderate midday heat (${maxTemp}°C) causes moderate evaporation loss.`,
      action: 'Apply water directly to soil base with drip lines; avoid overhead sprinkler wetting of canopy.',
      bestAlternativeWindow: 'Late Evening',
      metrics,
    };
  }

  // Rule 3: Early Morning Window Agronomy
  if (norm === 'Early Morning') {
    // In heatwave conditions, Early Morning is the gold standard (high score, optimal)
    if (avgWindSpeed < 18 && maxRainProb < 40) {
      const morningScore = Math.min(96, Math.max(80, 100 - (avgWindSpeed > 12 ? 8 : 0)));
      return {
        schedule: rawSchedule || norm,
        normalizedWindow: norm,
        hoursRange,
        hoursLabel,
        status: 'Optimal',
        score: morningScore,
        reason: `Cool morning soil and calm winds (${avgWindSpeed} km/h) maximize root-zone moisture uptake with zero thermal shock.`,
        action: 'Ideal window for comprehensive irrigation and foliar nutrient application.',
        bestAlternativeWindow: null,
        metrics,
      };
    }

    return {
      schedule: rawSchedule || norm,
      normalizedWindow: norm,
      hoursRange,
      hoursLabel,
      status: 'Caution',
      score: 65,
      reason: `Moderate morning winds (${avgWindSpeed} km/h) or localized moisture fluctuations.`,
      action: 'Focus water delivery at ground level to minimize wind drift.',
      bestAlternativeWindow: 'Late Evening',
      metrics,
    };
  }

  // Rule 4: Late Evening Window Agronomy
  if (norm === 'Late Evening') {
    if (avgHumidity > 85) {
      return {
        schedule: rawSchedule || norm,
        normalizedWindow: norm,
        hoursRange,
        hoursLabel,
        status: 'Caution',
        score: 62,
        reason: `High nighttime humidity (${avgHumidity}%) with wet foliage creates prolonged dampness that encourages fungal spore propagation.`,
        action: 'Irrigate soil base carefully; do not wet plant leaves before overnight cooling.',
        bestAlternativeWindow: 'Early Morning',
        metrics,
      };
    }

    return {
      schedule: rawSchedule || norm,
      normalizedWindow: norm,
      hoursRange,
      hoursLabel,
      status: 'Optimal',
      score: 90,
      reason: `Sunset cooling (${avgTemp}°C) minimizes evaporation loss throughout the night.`,
      action: 'Optimal window for basal root watering.',
      bestAlternativeWindow: null,
      metrics,
    };
  }

  // Rule 5: Twice Daily
  const isHighHeatMidday = maxTemp >= 35;
  return {
    schedule: rawSchedule || norm,
    normalizedWindow: norm,
    hoursRange,
    hoursLabel,
    status: isHighHeatMidday ? 'Caution' : 'Optimal',
    score: isHighHeatMidday ? 70 : 92,
    reason: `Dual split application provides steady hydration. Early morning session handles daytime transpiration; evening session replenishes root reserves.`,
    action: isHighHeatMidday
      ? 'Perform early morning (6 AM) deep irrigation and light evening top-up.'
      : 'Execute split watering sessions as planned.',
    bestAlternativeWindow: null,
    metrics,
  };
}
