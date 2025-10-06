// Crime heat map data for the United States
// This provides sample crime heat points and center coordinates for mapping

export interface CrimeHeatPoint {
  lat: number;
  lng: number;
  intensity: number;
}

export const US_CENTER = {
  lat: 39.8283,
  lng: -98.5795
};

// Sample crime heat points across major US cities
export const US_CRIME_HEAT_POINTS: CrimeHeatPoint[] = [
  // New York City area
  { lat: 40.7128, lng: -74.0060, intensity: 0.8 },
  { lat: 40.7589, lng: -73.9851, intensity: 0.7 },
  { lat: 40.6782, lng: -73.9442, intensity: 0.6 },
  
  // Los Angeles area
  { lat: 34.0522, lng: -118.2437, intensity: 0.9 },
  { lat: 34.0928, lng: -118.3287, intensity: 0.7 },
  { lat: 33.9425, lng: -118.4081, intensity: 0.6 },
  
  // Chicago area
  { lat: 41.8781, lng: -87.6298, intensity: 0.8 },
  { lat: 41.8369, lng: -87.6847, intensity: 0.7 },
  { lat: 41.9742, lng: -87.9073, intensity: 0.5 },
  
  // Houston area
  { lat: 29.7604, lng: -95.3698, intensity: 0.7 },
  { lat: 29.8174, lng: -95.6814, intensity: 0.6 },
  { lat: 29.5844, lng: -95.1108, intensity: 0.5 },
  
  // Phoenix area
  { lat: 33.4484, lng: -112.0740, intensity: 0.6 },
  { lat: 33.5722, lng: -112.0880, intensity: 0.5 },
  { lat: 33.3062, lng: -111.8413, intensity: 0.4 },
  
  // Philadelphia area
  { lat: 39.9526, lng: -75.1652, intensity: 0.7 },
  { lat: 40.0094, lng: -75.1333, intensity: 0.6 },
  { lat: 39.8744, lng: -75.2424, intensity: 0.5 },
  
  // San Antonio area
  { lat: 29.4241, lng: -98.4936, intensity: 0.6 },
  { lat: 29.5149, lng: -98.4916, intensity: 0.5 },
  { lat: 29.3013, lng: -98.5255, intensity: 0.4 },
  
  // San Diego area
  { lat: 32.7157, lng: -117.1611, intensity: 0.5 },
  { lat: 32.8328, lng: -117.2713, intensity: 0.4 },
  { lat: 32.6151, lng: -117.0364, intensity: 0.4 },
  
  // Dallas area
  { lat: 32.7767, lng: -96.7970, intensity: 0.7 },
  { lat: 32.8998, lng: -97.0403, intensity: 0.6 },
  { lat: 32.6203, lng: -96.7797, intensity: 0.5 },
  
  // San Jose area
  { lat: 37.3382, lng: -121.8863, intensity: 0.5 },
  { lat: 37.4419, lng: -122.1430, intensity: 0.4 },
  { lat: 37.2431, lng: -121.7915, intensity: 0.4 },
  
  // Austin area
  { lat: 30.2672, lng: -97.7431, intensity: 0.6 },
  { lat: 30.3072, lng: -97.7559, intensity: 0.5 },
  { lat: 30.2240, lng: -97.7948, intensity: 0.5 },
  
  // Jacksonville area
  { lat: 30.3322, lng: -81.6557, intensity: 0.6 },
  { lat: 30.4518, lng: -81.5158, intensity: 0.5 },
  { lat: 30.1588, lng: -81.6107, intensity: 0.4 },
  
  // San Francisco area
  { lat: 37.7749, lng: -122.4194, intensity: 0.8 },
  { lat: 37.8044, lng: -122.2712, intensity: 0.6 },
  { lat: 37.6879, lng: -122.4702, intensity: 0.7 },
  
  // Indianapolis area
  { lat: 39.7684, lng: -86.1581, intensity: 0.6 },
  { lat: 39.8061, lng: -86.1419, intensity: 0.5 },
  { lat: 39.7391, lng: -86.1684, intensity: 0.5 },
  
  // Columbus area
  { lat: 39.9612, lng: -82.9988, intensity: 0.6 },
  { lat: 40.0417, lng: -82.9988, intensity: 0.5 },
  { lat: 39.9028, lng: -83.0132, intensity: 0.5 },
  
  // Fort Worth area
  { lat: 32.7555, lng: -97.3308, intensity: 0.6 },
  { lat: 32.8207, lng: -97.3621, intensity: 0.5 },
  { lat: 32.6998, lng: -97.3355, intensity: 0.5 },
  
  // Charlotte area
  { lat: 35.2271, lng: -80.8431, intensity: 0.5 },
  { lat: 35.2821, lng: -80.8414, intensity: 0.4 },
  { lat: 35.1495, lng: -80.8526, intensity: 0.4 },
  
  // Detroit area
  { lat: 42.3314, lng: -83.0458, intensity: 0.8 },
  { lat: 42.3830, lng: -83.1022, intensity: 0.7 },
  { lat: 42.2808, lng: -83.7430, intensity: 0.6 },
  
  // El Paso area
  { lat: 31.7619, lng: -106.4850, intensity: 0.5 },
  { lat: 31.8457, lng: -106.4270, intensity: 0.4 },
  { lat: 31.6904, lng: -106.3431, intensity: 0.4 },
  
  // Memphis area
  { lat: 35.1495, lng: -90.0490, intensity: 0.7 },
  { lat: 35.2087, lng: -89.9710, intensity: 0.6 },
  { lat: 35.0928, lng: -90.0762, intensity: 0.6 },
  
  // Seattle area
  { lat: 47.6062, lng: -122.3321, intensity: 0.6 },
  { lat: 47.6587, lng: -122.3020, intensity: 0.5 },
  { lat: 47.5480, lng: -122.3355, intensity: 0.5 },
  
  // Denver area
  { lat: 39.7392, lng: -104.9903, intensity: 0.5 },
  { lat: 39.7817, lng: -105.0178, intensity: 0.4 },
  { lat: 39.6922, lng: -104.9619, intensity: 0.4 },
  
  // Washington DC area
  { lat: 38.9072, lng: -77.0369, intensity: 0.7 },
  { lat: 38.9597, lng: -77.0282, intensity: 0.6 },
  { lat: 38.8462, lng: -77.0467, intensity: 0.6 },
  
  // Boston area
  { lat: 42.3601, lng: -71.0589, intensity: 0.6 },
  { lat: 42.3736, lng: -71.1097, intensity: 0.5 },
  { lat: 42.3188, lng: -71.0846, intensity: 0.5 },
  
  // Nashville area
  { lat: 36.1627, lng: -86.7816, intensity: 0.6 },
  { lat: 36.2058, lng: -86.8147, intensity: 0.5 },
  { lat: 36.1141, lng: -86.7994, intensity: 0.5 }
];

export default {
  US_CRIME_HEAT_POINTS,
  US_CENTER
};
