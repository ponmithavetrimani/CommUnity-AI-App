export type Coords = {
  latitude: number;
  longitude: number;
};

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Haversine distance between two points, in meters. */
export function distanceBetween(a: Coords, b: Coords): number {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  return R * c;
}

/**
 * Distance (meters) from point p to the segment a-b.
 * Projects onto a small local equirectangular plane — accurate enough
 * for short city-scale segments.
 */
function distanceToSegment(p: Coords, a: Coords, b: Coords): number {
  const latRef = toRad(a.latitude);
  const mPerDegLat = 111320;
  const mPerDegLon = 111320 * Math.cos(latRef);

  const toXY = (c: Coords) => ({
    x: (c.longitude - a.longitude) * mPerDegLon,
    y: (c.latitude - a.latitude) * mPerDegLat,
  });

  const A = { x: 0, y: 0 };
  const B = toXY(b);
  const P = toXY(p);

  const abx = B.x - A.x;
  const aby = B.y - A.y;
  const abLenSq = abx * abx + aby * aby;

  let t = abLenSq === 0 ? 0 : (P.x * abx + P.y * aby) / abLenSq;
  t = Math.max(0, Math.min(1, t));

  const closestX = A.x + t * abx;
  const closestY = A.y + t * aby;

  const dx = P.x - closestX;
  const dy = P.y - closestY;

  return Math.sqrt(dx * dx + dy * dy);
}

/** Minimum distance (meters) from a point to the whole route polyline. */
export function distanceToRoute(point: Coords, route: Coords[]): number {
  if (route.length === 0) return Infinity;
  if (route.length === 1) return distanceBetween(point, route[0]);

  let min = Infinity;
  for (let i = 0; i < route.length - 1; i++) {
    const d = distanceToSegment(point, route[i], route[i + 1]);
    if (d < min) min = d;
  }
  return min;
}

/**
 * MVP stand-in for a real road route: a straight line of interpolated
 * points between start and end. Swap this out for a Google Directions API
 * polyline later for road-accurate deviation detection.
 */
export function interpolateRoute(
  start: Coords,
  end: Coords,
  points = 25
): Coords[] {
  const route: Coords[] = [];
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    route.push({
      latitude: start.latitude + (end.latitude - start.latitude) * t,
      longitude: start.longitude + (end.longitude - start.longitude) * t,
    });
  }
  return route;
}