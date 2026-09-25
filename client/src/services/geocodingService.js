// Geocoding service resolving free-text user entered locations to real coordinates
// Uses local high-priority logistics dictionary + live OpenStreetMap Nominatim geocoding

const KNOWN_HUBS = {
  // Karnataka
  'bengaluru': [12.9716, 77.5946],
  'bangalore': [12.9716, 77.5946],
  'nelamangala': [13.0995, 77.3927],
  'whitefield': [12.9698, 77.7500],
  'mysuru': [12.2958, 76.6394],
  'mysore': [12.2958, 76.6394],
  'hubballi': [15.3647, 75.1240],
  'hubli': [15.3647, 75.1240],
  'mangaluru': [12.9141, 74.8560],
  'mangalore': [12.9141, 74.8560],
  'belagavi': [15.8497, 74.4977],

  // Tamil Nadu
  'chennai': [13.0827, 80.2707],
  'chennai port': [13.0827, 80.2707],
  'hosur': [12.7409, 77.8253],
  'coimbatore': [11.0168, 76.9558],
  'madurai': [9.9252, 78.1198],
  'salem': [11.6643, 78.1460],
  'tiruchirappalli': [10.7905, 78.7047],
  'trichy': [10.7905, 78.7047],
  'sriperumbudur': [12.9675, 79.9436],
  'ennore': [13.2141, 80.3235],

  // Maharashtra
  'mumbai': [19.0760, 72.8777],
  'navi mumbai': [18.9500, 72.9500],
  'jnpt': [18.9500, 72.9500],
  'thane': [19.2183, 72.9781],
  'pune': [18.5204, 73.8567],
  'chakan': [18.7600, 73.8500],
  'nagpur': [21.1458, 79.0882],
  'nashik': [19.9975, 73.7898],
  'aurangabad': [19.8762, 75.3433],
  'kolhapur': [16.7050, 74.2433],
  'solapur': [17.6599, 75.9064],
  'bhiwandi': [19.3002, 73.0583],

  // Delhi NCR / North
  'delhi': [28.6139, 77.2090],
  'new delhi': [28.6139, 77.2090],
  'gurugram': [28.4595, 77.0266],
  'gurgaon': [28.4595, 77.0266],
  'noida': [28.5355, 77.3910],
  'greater noida': [28.4744, 77.5040],
  'faridabad': [28.4089, 77.3178],
  'ghaziabad': [28.6692, 77.4538],
  'jaipur': [26.9124, 75.7873],
  'jodhpur': [26.2389, 73.0243],
  'kota': [25.2138, 75.8648],
  'chandigarh': [30.7333, 76.7794],
  'ludhiana': [30.9010, 75.8573],
  'amritsar': [31.6340, 74.8723],

  // Gujarat
  'ahmedabad': [23.0225, 72.5714],
  'surat': [21.1702, 72.8311],
  'vadodara': [22.3072, 73.1812],
  'baroda': [22.3072, 73.1812],
  'rajkot': [22.3039, 70.8022],
  'mundra': [22.8394, 69.7247],
  'kandla': [23.0135, 70.1337],
  'gandhidham': [23.0753, 70.1337],

  // Telangana & Andhra Pradesh
  'hyderabad': [17.3850, 78.4867],
  'secunderabad': [17.4399, 78.4983],
  'visakhapatnam': [17.6868, 83.2185],
  'vizag': [17.6868, 83.2185],
  'vijayawada': [16.5062, 80.6480],
  'guntur': [16.3067, 80.4365],

  // West Bengal & East
  'kolkata': [22.5726, 88.3639],
  'calcutta': [22.5726, 88.3639],
  'howrah': [22.5958, 88.2636],
  'haldia': [22.0667, 88.0698],
  'durgapur': [23.5204, 87.3119],
  'siliguri': [26.7271, 88.3953],
  'patna': [25.5941, 85.1376],
  'ranchi': [23.3441, 85.3096],
  'jamshedpur': [22.8046, 86.2029],
  'bhubaneswar': [20.2961, 85.8245],
  'cuttack': [20.4625, 85.8828],

  // Central India
  'lucknow': [26.8467, 80.9462],
  'kanpur': [26.4499, 80.3319],
  'agra': [27.1767, 78.0081],
  'varanasi': [25.3176, 82.9739],
  'prayagraj': [25.4358, 81.8463],
  'allahabad': [25.4358, 81.8463],
  'indore': [22.7196, 75.8577],
  'bhopal': [23.2599, 77.4126],
  'gwalior': [26.2183, 78.1828],
  'jabalpur': [23.1815, 79.9864],
  'raipur': [21.2514, 81.6296],

  // Kerala & Goa
  'kochi': [9.9312, 76.2673],
  'cochin': [9.9312, 76.2673],
  'thiruvananthapuram': [8.5241, 76.9366],
  'trivandrum': [8.5241, 76.9366],
  'kozhikode': [11.2588, 75.7804],
  'calicut': [11.2588, 75.7804],
  'goa': [15.4909, 73.8278],
  'panaji': [15.4909, 73.8278]
};

const geocodeCache = new Map();

/**
 * Searches local dictionary for instant match or partial city match
 */
function searchLocalHubs(text) {
  if (!text || typeof text !== 'string') return null;
  const clean = text.toLowerCase().trim();

  // 1. Direct match
  if (KNOWN_HUBS[clean]) {
    return {
      lat: KNOWN_HUBS[clean][0],
      lng: KNOWN_HUBS[clean][1],
      displayName: text,
      source: 'Local Logistics Hub Registry'
    };
  }

  // 2. Fuzzy substring check (e.g. "Nelamangala Hub" or "Chakan Industrial Zone Pune")
  const words = clean.split(/[\s,/-]+/);
  // Check longer keys first
  const keys = Object.keys(KNOWN_HUBS).sort((a, b) => b.length - a.length);

  for (const k of keys) {
    if (clean.includes(k)) {
      return {
        lat: KNOWN_HUBS[k][0],
        lng: KNOWN_HUBS[k][1],
        displayName: `${text} (Matched: ${k.toUpperCase()})`,
        source: 'Logistics Corridor Match'
      };
    }
  }

  // 3. Word token match
  for (const word of words) {
    if (word.length >= 4 && KNOWN_HUBS[word]) {
      return {
        lat: KNOWN_HUBS[word][0],
        lng: KNOWN_HUBS[word][1],
        displayName: `${text} (${word.toUpperCase()})`,
        source: 'City Token Match'
      };
    }
  }

  return null;
}

/**
 * Parses raw GPS coordinate string like "19.0760, 72.8777"
 */
function parseCoordinateString(text) {
  if (!text) return null;
  const match = text.match(/^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[3]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return {
        lat,
        lng,
        displayName: `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
        source: 'GPS Coordinates'
      };
    }
  }
  return null;
}

/**
 * Geocodes any user-entered location (city, hub, address) into exact latitude & longitude.
 * Fast, multi-tiered resolution: Cache -> Coordinate Parser -> Local Logistics Index -> Nominatim API
 */
export async function geocodeLocation(locationText, fallbackCoords = null) {
  if (!locationText || !locationText.trim()) {
    if (fallbackCoords) {
      return {
        lat: fallbackCoords[0],
        lng: fallbackCoords[1],
        displayName: 'Default Hub',
        source: 'Fallback'
      };
    }
    return null;
  }

  const query = locationText.trim();
  const cacheKey = query.toLowerCase();

  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  // 1. Check if raw coordinates
  const rawCoord = parseCoordinateString(query);
  if (rawCoord) {
    geocodeCache.set(cacheKey, rawCoord);
    return rawCoord;
  }

  // 2. Check local fast-path dictionary
  const localMatch = searchLocalHubs(query);
  if (localMatch) {
    geocodeCache.set(cacheKey, localMatch);
    return localMatch;
  }

  // 3. Query OpenStreetMap Nominatim forward geocoding API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&limit=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SmartFleetAI-Dispatcher/1.0'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        if (!isNaN(lat) && !isNaN(lng)) {
          const result = {
            lat: Number(lat.toFixed(5)),
            lng: Number(lng.toFixed(5)),
            displayName: item.display_name,
            source: 'OpenStreetMap Nominatim'
          };
          geocodeCache.set(cacheKey, result);
          return result;
        }
      }
    }
  } catch (err) {
    console.warn(`Online geocoding timed out or unavailable for "${query}":`, err);
  }

  // 4. If all else fails, use provided fallback coordinates or central default
  if (fallbackCoords && Array.isArray(fallbackCoords) && fallbackCoords.length === 2) {
    const fallback = {
      lat: fallbackCoords[0],
      lng: fallbackCoords[1],
      displayName: query,
      source: 'Fallback Coords'
    };
    geocodeCache.set(cacheKey, fallback);
    return fallback;
  }

  return null;
}

export default {
  geocodeLocation
};
