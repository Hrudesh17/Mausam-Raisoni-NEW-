import { openDB, IDBPDatabase } from 'idb';
import { WeatherResponse, IntelligenceSummary, UserContext } from './types';

const DB_NAME = 'vayusync_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('weather')) {
          db.createObjectStore('weather');
        }
        if (!db.objectStoreNames.contains('user_context')) {
          db.createObjectStore('user_context');
        }
        if (!db.objectStoreNames.contains('intelligence')) {
          db.createObjectStore('intelligence');
        }
      },
    });
  }
  return dbPromise;
}

export async function saveCachedWeather(weather: WeatherResponse): Promise<void> {
  try {
    const db = await getDB();
    if (db && weather?.location) {
      const key = `weather_${weather.location.lat.toFixed(2)}_${weather.location.lon.toFixed(2)}`;
      await db.put('weather', weather, key);
      await db.put('weather', weather, 'latest_weather');
    }
  } catch (err) {
    console.warn('IndexedDB write failed:', err);
  }
}

export async function getCachedWeather(lat?: number, lon?: number): Promise<WeatherResponse | null> {
  try {
    const db = await getDB();
    if (!db) return null;
    if (lat !== undefined && lon !== undefined) {
      const key = `weather_${lat.toFixed(2)}_${lon.toFixed(2)}`;
      const hit = await db.get('weather', key);
      if (hit) return hit;
      
      const latest: WeatherResponse | null = (await db.get('weather', 'latest_weather')) || null;
      if (latest && latest.location) {
        const matches = Math.abs(latest.location.lat - lat) < 0.25 && Math.abs(latest.location.lon - lon) < 0.25;
        if (matches) return latest;
      }
      return null;
    }
    return (await db.get('weather', 'latest_weather')) || null;
  } catch (err) {
    console.warn('IndexedDB read failed:', err);
    return null;
  }
}

export async function saveCachedIntelligence(intel: IntelligenceSummary): Promise<void> {
  try {
    const db = await getDB();
    if (db) {
      await db.put('intelligence', intel, 'latest_intelligence');
    }
  } catch (err) {
    console.warn('IndexedDB write failed:', err);
  }
}

export async function getCachedIntelligence(): Promise<IntelligenceSummary | null> {
  try {
    const db = await getDB();
    if (!db) return null;
    return (await db.get('intelligence', 'latest_intelligence')) || null;
  } catch (err) {
    console.warn('IndexedDB read failed:', err);
    return null;
  }
}
