export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

export const calculateTripMetricsFromPoints = (points = []) => {
  if (!points || points.length < 2) {
    return { distanceKm: 0, avgSpeed: 0, maxSpeed: 0, idleMinutes: 0 };
  }

  let totalDistanceKm = 0;
  let maxSpeed = 0;
  let totalSpeed = 0;
  let idleCount = 0;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.speed > maxSpeed) maxSpeed = p.speed;
    totalSpeed += p.speed || 0;

    if (p.speed <= 5) {
      idleCount++;
    }

    if (i > 0) {
      const prev = points[i - 1];
      const dist = calculateHaversineDistance(prev.latitude, prev.longitude, p.latitude, p.longitude);
      totalDistanceKm += dist;
    }
  }

  const avgSpeed = Math.round(totalSpeed / points.length);
  // Estimate idle minutes (assuming ~1 point per 30 seconds)
  const idleMinutes = Math.round(idleCount * 0.5);

  return {
    distanceKm: parseFloat(totalDistanceKm.toFixed(2)),
    avgSpeed,
    maxSpeed,
    idleMinutes
  };
};
