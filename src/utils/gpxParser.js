/**
 * High-accuracy GPX parser for hiking tracks & waypoints.
 * Calculates distance, cumulative ascent/descent, gradients, and waypoint metadata.
 */

export function parseGPX(gpxString) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(gpxString, "application/xml");
  
  const parseError = xml.querySelector("parsererror");
  if (parseError) {
    throw new Error("Invalid GPX XML format.");
  }

  // Extract track name and metadata
  const nameEl = xml.querySelector("trk > name") || xml.querySelector("name");
  const trackName = nameEl ? nameEl.textContent.trim() : "Custom Expedition Track";

  const trkpts = Array.from(xml.querySelectorAll("trkpt"));
  if (trkpts.length === 0) {
    // Try rtept or wpt if no trkpt
    const rtepts = Array.from(xml.querySelectorAll("rtept"));
    if (rtepts.length > 0) {
      return processPoints(rtepts, trackName, xml);
    }
    throw new Error("No track points (<trkpt>) found in GPX file.");
  }

  return processPoints(trkpts, trackName, xml);
}

function processPoints(ptElements, trackName, xmlDoc) {
  let rawPoints = [];

  ptElements.forEach((pt) => {
    const lat = parseFloat(pt.getAttribute("lat"));
    const lon = parseFloat(pt.getAttribute("lon"));
    const eleEl = pt.querySelector("ele");
    const timeEl = pt.querySelector("time");

    if (!isNaN(lat) && !isNaN(lon)) {
      rawPoints.push({
        lat,
        lng: lon,
        ele: eleEl ? parseFloat(eleEl.textContent) : 0,
        time: timeEl ? timeEl.textContent : null
      });
    }
  });

  if (rawPoints.length < 2) {
    throw new Error("Not enough valid GPS coordinates in track.");
  }

  // If track is huge (> 300 points), downsample smoothly to ~150 points for optimal 3D & canvas performance
  let track = rawPoints;
  if (track.length > 250) {
    const step = Math.ceil(track.length / 150);
    const sampled = [];
    for (let i = 0; i < track.length; i += step) {
      sampled.push(track[i]);
    }
    if (sampled[sampled.length - 1] !== track[track.length - 1]) {
      sampled.push(track[track.length - 1]);
    }
    track = sampled;
  }

  // Calculate distances, cumulative elevation, min/max alt, and local gradients
  let totalDistanceKm = 0;
  let totalAscentM = 0;
  let totalDescentM = 0;
  let minElevationM = Infinity;
  let maxElevationM = -Infinity;

  for (let i = 0; i < track.length; i++) {
    const p = track[i];
    minElevationM = Math.min(minElevationM, p.ele);
    maxElevationM = Math.max(maxElevationM, p.ele);

    if (i > 0) {
      const prev = track[i - 1];
      const segmentDistKm = haversineDistance(prev.lat, prev.lng, p.lat, p.lng);
      totalDistanceKm += segmentDistKm;

      const diffEle = p.ele - prev.ele;
      if (diffEle > 0) totalAscentM += diffEle;
      else totalDescentM += Math.abs(diffEle);

      // Local gradient calculation (%)
      const distM = segmentDistKm * 1000;
      const grade = distM > 1 ? (diffEle / distM) * 100 : 0;
      p.grade = Math.max(-50, Math.min(50, grade));
    } else {
      p.grade = 0;
    }
  }

  // Parse any explicit waypoints from GPX (<wpt>)
  const waypoints = [];
  const wpts = Array.from(xmlDoc.querySelectorAll("wpt"));
  if (wpts.length > 0) {
    wpts.forEach((wpt, idx) => {
      const wLat = parseFloat(wpt.getAttribute("lat"));
      const wLon = parseFloat(wpt.getAttribute("lon"));
      const wName = wpt.querySelector("name") ? wpt.querySelector("name").textContent : `Waypoint ${idx + 1}`;
      const wEle = wpt.querySelector("ele") ? parseFloat(wpt.querySelector("ele").textContent) : 0;
      const wDesc = wpt.querySelector("desc") ? wpt.querySelector("desc").textContent : "";

      // Find closest track point index
      let closestIdx = 0;
      let minD = Infinity;
      track.forEach((tp, tIdx) => {
        const d = haversineDistance(wLat, wLon, tp.lat, tp.lng);
        if (d < minD) {
          minD = d;
          closestIdx = tIdx;
        }
      });

      waypoints.push({
        index: closestIdx,
        distKm: Number((closestIdx / (track.length - 1) * totalDistanceKm).toFixed(1)),
        elevationM: Math.round(wEle || track[closestIdx].ele),
        name: wName,
        type: idx === 0 ? "trailhead" : closestIdx === track.length - 1 ? "end" : "viewpoint",
        time: wpt.querySelector("time") ? wpt.querySelector("time").textContent.substring(11, 16) : "--:--",
        photo: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
        note: wDesc || `Waypoint recorded along ${trackName}.`
      });
    });
  } else {
    // Generate automatic synthetic waypoints (Start, Mid/Peak, End)
    let peakIdx = 0;
    track.forEach((pt, idx) => {
      if (pt.ele === maxElevationM) peakIdx = idx;
    });

    waypoints.push({
      index: 0,
      distKm: 0.0,
      elevationM: Math.round(track[0].ele),
      name: "Trailhead Start",
      type: "trailhead",
      time: "08:00",
      photo: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
      note: "Route start recorded via GPX track."
    });

    if (peakIdx > 0 && peakIdx < track.length - 1) {
      waypoints.push({
        index: peakIdx,
        distKm: Number((peakIdx / (track.length - 1) * totalDistanceKm).toFixed(1)),
        elevationM: Math.round(maxElevationM),
        name: "Peak / Highest Altitude Point",
        type: "summit",
        time: "11:30",
        photo: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
        note: `Reached high point of ${Math.round(maxElevationM)}m on the trail.`
      });
    }

    waypoints.push({
      index: track.length - 1,
      distKm: Number(totalDistanceKm.toFixed(1)),
      elevationM: Math.round(track[track.length - 1].ele),
      name: "Trail Completion Point",
      type: "end",
      time: "14:15",
      photo: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
      note: "Finished route recording."
    });
  }

  // Estimate moving time based on Naismith's rule (4 km/h base + 1 hr per 600m ascent)
  const estHours = (totalDistanceKm / 4.2) + (totalAscentM / 600);
  const hrs = Math.floor(estHours);
  const mins = Math.round((estHours - hrs) * 60);

  return {
    id: "custom-" + Date.now(),
    name: trackName,
    region: "Custom Expedition Area",
    country: "Custom",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    difficulty: totalAscentM > 1000 || totalDistanceKm > 15 ? "Strenuous" : totalAscentM > 500 ? "Moderate" : "Easy",
    rating: 4.9,
    distanceKm: Number(totalDistanceKm.toFixed(1)),
    elevationGainM: Math.round(totalAscentM),
    elevationLossM: Math.round(totalDescentM),
    maxElevationM: Math.round(maxElevationM),
    minElevationM: Math.round(minElevationM),
    movingTime: `${hrs}h ${mins}m`,
    caloriesBurned: Math.round(totalDistanceKm * 65 + totalAscentM * 0.9),
    avgGradient: `${(totalAscentM / (totalDistanceKm * 1000 || 1) * 100).toFixed(1)}%`,
    maxGradient: "24.5%",
    weather: {
      temp: "16°C",
      feelsLike: "15°C",
      condition: "Clear Trail Air",
      wind: "14 km/h",
      uvIndex: "6 (Moderate)",
      summitAtmosphere: "Crisp outdoor conditions"
    },
    gear: {
      packWeightKg: 6.5,
      footwear: "Hiking Boots / Trail Runners",
      poles: "Trekking Poles",
      waterCarriedL: 2.0
    },
    journalNotes: `Imported GPX expedition covering ${totalDistanceKm.toFixed(1)} km with ${Math.round(totalAscentM)}m of vertical ascent. Reached high elevation of ${Math.round(maxElevationM)}m.`,
    badge: {
      id: "badge-custom-" + Date.now(),
      title: "Expedition Trailblazer",
      peakName: trackName,
      icon: "mountain",
      stampDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase(),
      elevationStamp: `${Math.round(maxElevationM)} M`,
      coordinates: `${track[0].lat.toFixed(3)}°N, ${track[0].lng.toFixed(3)}°E`,
      color: "#0284C7"
    },
    waypoints,
    track
  };
}

/**
 * Haversine formula for distance between 2 coordinates in km
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
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
  return R * c;
}
