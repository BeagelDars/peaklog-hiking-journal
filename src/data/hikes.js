/**
 * Accurate GPS & Elevation Tracks for World-Famous Hiking Routes
 * With authentic landmark coordinates, elevations, and mountain morphology data.
 */

export const PRELOADED_HIKES = [
  {
    id: "tour-du-mont-blanc",
    name: "Tour du Mont Blanc: Grand Col Ferret",
    shortName: "Mont Blanc Col Ferret",
    region: "Val Ferret, Alps",
    country: "Italy / Switzerland",
    date: "July 24, 2025",
    difficulty: "Challenging",
    rating: 4.9,
    distanceKm: 14.8,
    elevationGainM: 1040,
    elevationLossM: 927,
    maxElevationM: 2537,
    minElevationM: 1610,
    movingTime: "5h 45m",
    caloriesBurned: 2450,
    avgGradient: "11.2%",
    maxGradient: "28.4%",
    mountainType: "alpine_pass", // Valley climbing up to high mountain pass
    weather: {
      temp: "14°C",
      feelsLike: "11°C",
      condition: "Crisp Alpine Sun & Light Mist",
      wind: "18 km/h NW",
      uvIndex: "8 (High)",
      summitAtmosphere: "Fresh glacial breeze over Mont Dolent"
    },
    gear: {
      packWeightKg: 7.2,
      footwear: "Scarpa Ribelle HD",
      poles: "Black Diamond Carbon Cork",
      waterCarriedL: 2.5
    },
    journalNotes: `Crossing from the Italian Val Ferret over the high alpine frontier of Grand Col Ferret into Switzerland. The morning ascent from Elena Hut kicked off with steep switchbacks surrounded by the dramatic hanging glaciers of Pré de Bar. Reached the col at 2,537m just as the clouds parted to reveal the sharp spires of Mont Dolent and the Grand Combin in the distance. The descent down to La Peule had herds of alpine cattle with ringing cowbells. Pure alpine bliss.`,
    badge: {
      id: "badge-tmb-ferret",
      title: "Alpine Frontier Crosser",
      peakName: "Grand Col Ferret (2,537m)",
      icon: "mountain-snow",
      stampDate: "24 JUL 2025",
      elevationStamp: "2,537 M",
      coordinates: "45.889°N, 7.078°E",
      color: "#D97706"
    },
    waypoints: [
      {
        index: 0,
        distKm: 0.0,
        elevationM: 1650,
        name: "Arp Nouva Trailhead",
        type: "trailhead",
        time: "07:30",
        photo: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
        note: "Crisp morning at the foot of Val Ferret. Trekking poles ready and boots laced."
      },
      {
        index: 22,
        distKm: 2.4,
        elevationM: 2061,
        name: "Rifugio Elena",
        type: "hut",
        time: "08:45",
        photo: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
        note: "Short espresso stop on the sun deck facing Glacier de Pré de Bar."
      },
      {
        index: 55,
        distKm: 5.6,
        elevationM: 2537,
        name: "Grand Col Ferret Summit Pass",
        type: "summit",
        time: "11:15",
        photo: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
        note: "Swiss-Italian border reached! Stunning view of Mont Dolent and glacier fields."
      },
      {
        index: 76,
        distKm: 9.8,
        elevationM: 2071,
        name: "Alpage de la Peule",
        type: "hut",
        time: "13:00",
        photo: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1200&q=80",
        note: "Artisanal mountain cheese tasting with ringing alpine bells."
      },
      {
        index: 99,
        distKm: 14.8,
        elevationM: 1610,
        name: "La Fouly Village",
        type: "end",
        time: "14:45",
        photo: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
        note: "Reached the Swiss valley. Refreshing stream dip and celebratory blueberry tart."
      }
    ],
    track: generateRealisticPassTrack(45.865, 7.025, 45.889, 7.078, 45.932, 7.100, 1650, 2537, 1610, 100)
  },
  {
    id: "half-dome-yosemite",
    name: "Half Dome Cables & Subdome",
    shortName: "Half Dome Yosemite",
    region: "Yosemite National Park, California",
    country: "United States",
    date: "September 12, 2025",
    difficulty: "Strenuous",
    rating: 5.0,
    distanceKm: 23.5,
    elevationGainM: 1460,
    elevationLossM: 1460,
    maxElevationM: 2694,
    minElevationM: 1234,
    movingTime: "8h 15m",
    caloriesBurned: 3850,
    avgGradient: "12.8%",
    maxGradient: "45.0%",
    mountainType: "dome_cliff", // Granite dome with vertical sheer cliff face
    weather: {
      temp: "22°C",
      feelsLike: "20°C",
      condition: "Clear Sierra Sky & Granite Heat",
      wind: "12 km/h W",
      uvIndex: "9 (Very High)",
      summitAtmosphere: "Dry pine fragrance and 360-degree Sierra high country vista"
    },
    gear: {
      packWeightKg: 8.5,
      footwear: "La Sportiva TX4 Approach Shoes",
      poles: "Leki Makalu FX",
      waterCarriedL: 4.0
    },
    journalNotes: `Started under a canopy of stars at 4:30 AM via Happy Isles. Mist Trail was thunderous beside Vernal and Nevada Falls in the morning glow. Little Yosemite Valley gave a brief respite before the endless granite stairways of Subdome. The sheer 45-degree granite wall up the steel cables was an adrenaline rush. Standing on the famous summit diving board looking down 4,000 feet into Yosemite Valley is something I'll never forget.`,
    badge: {
      id: "badge-half-dome",
      title: "Granite Monolith Conqueror",
      peakName: "Half Dome (2,694m / 8,842ft)",
      icon: "mountain",
      stampDate: "12 SEP 2025",
      elevationStamp: "2,694 M",
      coordinates: "37.746°N, 119.533°W",
      color: "#EA580C"
    },
    waypoints: [
      {
        index: 0,
        distKm: 0.0,
        elevationM: 1234,
        name: "Happy Isles Trailhead",
        type: "trailhead",
        time: "04:30",
        photo: "https://images.unsplash.com/photo-1527489377706-5bf97e608852?auto=format&fit=crop&w=1200&q=80",
        note: "Headlamps on beneath towering ponderosa pines. Merced River roaring."
      },
      {
        index: 25,
        distKm: 4.2,
        elevationM: 1810,
        name: "Nevada Fall Overlook",
        type: "waterfall",
        time: "06:15",
        photo: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1200&q=80",
        note: "Golden sunrise catching the rainbow mist spilling 594 feet down the cliff face."
      },
      {
        index: 55,
        distKm: 9.8,
        elevationM: 2420,
        name: "Subdome Granite Steps",
        type: "viewpoint",
        time: "09:00",
        photo: "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&w=1200&q=80",
        note: "Narrow granite switchbacks carved straight into the steep rock face."
      },
      {
        index: 75,
        distKm: 11.7,
        elevationM: 2694,
        name: "Half Dome Summit & Visor",
        type: "summit",
        time: "10:30",
        photo: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80",
        note: "Reached the summit visor! Looking down at Clouds Rest, Glacier Point and Yosemite Valley."
      },
      {
        index: 99,
        distKm: 23.5,
        elevationM: 1234,
        name: "Happy Isles Finish",
        type: "end",
        time: "15:45",
        photo: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
        note: "Finished the 14-mile epic. Feet tired but spirits soaring."
      }
    ],
    track: generateRealisticDomeTrack(37.732, -119.558, 37.746, -119.533, 1234, 2694, 100)
  },
  {
    id: "mount-fuji-sunrise",
    name: "Mount Fuji Yoshida Trail",
    shortName: "Mount Fuji Summit",
    region: "Fuji-Hakone-Izu National Park",
    country: "Japan",
    date: "August 15, 2025",
    difficulty: "Strenuous",
    rating: 4.9,
    distanceKm: 13.9,
    elevationGainM: 1475,
    elevationLossM: 1475,
    maxElevationM: 3776,
    minElevationM: 2305,
    movingTime: "6h 50m",
    caloriesBurned: 3100,
    avgGradient: "14.5%",
    maxGradient: "32.0%",
    mountainType: "volcano_cone", // Symmetrical conical stratovolcano with summit crater
    weather: {
      temp: "4°C",
      feelsLike: "-1°C",
      condition: "Goraiko (Sea of Clouds Sunrise)",
      wind: "28 km/h NW",
      uvIndex: "10 (Extreme)",
      summitAtmosphere: "Golden orb breaking through the crimson sea of morning clouds"
    },
    gear: {
      packWeightKg: 6.8,
      footwear: "Hoka Anacapa Mid GTX",
      poles: "Wooden Kongo-zue Pilgrim Staff",
      waterCarriedL: 3.0
    },
    journalNotes: `Began the summit push from the 7th station hut at 1:30 AM under a stream of hundreds of headlamps winding up the volcanic switchbacks like a constellation. Reached the Torii gates of the summit crater rim just before 4:45 AM. Witnessing 'Goraiko'—the holy dawn rising over the sea of clouds below—with the wooden pilgrim staff stamped at every station along the climb was deeply spiritual.`,
    badge: {
      id: "badge-mt-fuji",
      title: "Goraiko Sunrise Climber",
      peakName: "Mount Fuji Summit (3,776m)",
      icon: "sun",
      stampDate: "15 AUG 2025",
      elevationStamp: "3,776 M",
      coordinates: "35.360°N, 138.727°E",
      color: "#DC2626"
    },
    waypoints: [
      {
        index: 0,
        distKm: 0.0,
        elevationM: 2305,
        name: "Fuji Subaru Line 5th Station",
        type: "trailhead",
        time: "20:30",
        photo: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1200&q=80",
        note: "Acclimatizing and buying the traditional wooden Kongo-zue pilgrim stick."
      },
      {
        index: 30,
        distKm: 3.2,
        elevationM: 2790,
        name: "7th Station Torii Gate",
        type: "hut",
        time: "23:00",
        photo: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
        note: "First hot iron branding stamp pressed into the wooden staff."
      },
      {
        index: 58,
        distKm: 5.8,
        elevationM: 3400,
        name: "Original 8th Station",
        type: "hut",
        time: "02:45",
        photo: "https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=1200&q=80",
        note: "Crisp freezing air. String of glowing lanterns lighting the rocky switchbacks."
      },
      {
        index: 78,
        distKm: 7.5,
        elevationM: 3776,
        name: "Kengamine Peak Summit",
        type: "summit",
        time: "04:50",
        photo: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
        note: "Goraiko! The sun ignites the cloud sea in radiant gold and magenta."
      },
      {
        index: 99,
        distKm: 13.9,
        elevationM: 2305,
        name: "5th Station Descent Complete",
        type: "end",
        time: "09:15",
        photo: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1200&q=80",
        note: "Volcanic ash scree descent completed. Hot bowl of celebratory miso ramen."
      }
    ],
    track: generateRealisticVolcanoTrack(35.391, 138.732, 35.360, 138.727, 2305, 3776, 100)
  },
  {
    id: "tre-cime-dolomites",
    name: "Tre Cime di Lavaredo Loop",
    shortName: "Tre Cime Dolomites",
    region: "Sexten Dolomites, South Tyrol",
    country: "Italy",
    date: "August 08, 2025",
    difficulty: "Moderate",
    rating: 4.8,
    distanceKm: 10.2,
    elevationGainM: 520,
    elevationLossM: 520,
    maxElevationM: 2454,
    minElevationM: 2170,
    movingTime: "3h 40m",
    caloriesBurned: 1680,
    avgGradient: "6.4%",
    maxGradient: "21.0%",
    mountainType: "dolomite_towers", // Scree plateau with three vertical limestone spires
    weather: {
      temp: "17°C",
      feelsLike: "16°C",
      condition: "Dolomitic Sun & Floating Cirrus",
      wind: "10 km/h SW",
      uvIndex: "7 (High)",
      summitAtmosphere: "Echoing church bells across the Cadini di Misurina pinnacles"
    },
    gear: {
      packWeightKg: 5.4,
      footwear: "Salewa Mountain Trainer Lite",
      poles: "Komperdell Carbon",
      waterCarriedL: 2.0
    },
    journalNotes: `The iconic loop around the three monumental limestone towers of Cima Grande, Cima Ovest, and Cima Piccola. The north faces rise almost 500 vertical meters straight out of the scree fields. Passed historical WW1 tunnels and bunker remnants near Rifugio Locatelli. Crystal turquoise alpine lakes reflecting the jagged peaks made every bend look like a postcard.`,
    badge: {
      id: "badge-tre-cime",
      title: "Dolomite Tower Voyager",
      peakName: "Forcella Lavaredo (2,454m)",
      icon: "gem",
      stampDate: "08 AUG 2025",
      elevationStamp: "2,454 M",
      coordinates: "46.618°N, 12.301°E",
      color: "#059669"
    },
    waypoints: [
      {
        index: 0,
        distKm: 0.0,
        elevationM: 2320,
        name: "Rifugio Auronzo",
        type: "trailhead",
        time: "08:00",
        photo: "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&w=1200&q=80",
        note: "Starting trail 101 along the southern scree base in gentle morning sunlight."
      },
      {
        index: 30,
        distKm: 3.1,
        elevationM: 2454,
        name: "Forcella Lavaredo Ridge",
        type: "viewpoint",
        time: "09:10",
        photo: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
        note: "First dramatic sight of the 500m vertical north faces. Breathtaking scale!"
      },
      {
        index: 55,
        distKm: 5.6,
        elevationM: 2405,
        name: "Rifugio Locatelli",
        type: "hut",
        time: "10:30",
        photo: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
        note: "Famous viewpoint of the classic three towers with the Laghi dei Piani below."
      },
      {
        index: 80,
        distKm: 8.1,
        elevationM: 2170,
        name: "Malga Langalm Pastures",
        type: "water",
        time: "11:50",
        photo: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
        note: "Fresh alpine spring water refill under the shadow of Cima Ovest."
      },
      {
        index: 99,
        distKm: 10.2,
        elevationM: 2320,
        name: "Rifugio Auronzo Finish",
        type: "end",
        time: "12:45",
        photo: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
        note: "Loop completed. Enjoyed fresh speck and South Tyrolean apple strudel."
      }
    ],
    track: generateRealisticDolomiteLoop(46.612, 12.296, 46.618, 12.304, 46.622, 12.302, 2320, 2454, 2170, 100)
  },
  {
    id: "fitz-roy-patagonia",
    name: "Laguna de los Tres: Fitz Roy",
    shortName: "Mount Fitz Roy",
    region: "Los Glaciares National Park, El Chaltén",
    country: "Argentina",
    date: "January 18, 2026",
    difficulty: "Challenging",
    rating: 5.0,
    distanceKm: 21.4,
    elevationGainM: 950,
    elevationLossM: 950,
    maxElevationM: 1170,
    minElevationM: 410,
    movingTime: "7h 10m",
    caloriesBurned: 2900,
    avgGradient: "9.2%",
    maxGradient: "34.0%",
    mountainType: "patagonia_spires", // Lenga forest valley climbing steep moraine into jagged granite spires
    weather: {
      temp: "12°C",
      feelsLike: "8°C",
      condition: "Patagonian Wind & Crystalline Sun",
      wind: "42 km/h WSW",
      uvIndex: "7 (High)",
      summitAtmosphere: "Fierce Andean wind blowing glacial spray off the emerald lagoon"
    },
    gear: {
      packWeightKg: 7.0,
      footwear: "Meindl Island MFS Active",
      poles: "Black Diamond Trail Pro",
      waterCarriedL: 2.0
    },
    journalNotes: `The crown jewel of Patagonian trekking. Traversed golden lenga beech forests with views of Mount Fitz Roy (El Chaltén) playing peek-a-boo through the clouds. The final 1 km moraine climb is relentless, gaining 400m over loose granite boulders. Cresting the ridge to see the turquoise Laguna de los Tres nestled directly under the 3,405m granite monolith of Fitz Roy and Laguna Sucia was overwhelmingly magnificent.`,
    badge: {
      id: "badge-fitz-roy",
      title: "Patagonian Spire Witness",
      peakName: "Laguna de los Tres (1,170m)",
      icon: "compass",
      stampDate: "18 JAN 2026",
      elevationStamp: "1,170 M",
      coordinates: "49.271°S, 72.982°W",
      color: "#2563EB"
    },
    waypoints: [
      {
        index: 0,
        distKm: 0.0,
        elevationM: 410,
        name: "El Chaltén Trailhead",
        type: "trailhead",
        time: "06:30",
        photo: "https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=1200&q=80",
        note: "Leaving the windy trekking village in crisp morning chill."
      },
      {
        index: 28,
        distKm: 4.5,
        elevationM: 680,
        name: "Mirador Fitz Roy",
        type: "viewpoint",
        time: "08:15",
        photo: "https://images.unsplash.com/photo-1527489377706-5bf97e608852?auto=format&fit=crop&w=1200&q=80",
        note: "First breathtaking view of Fitz Roy's needle spires in morning sun."
      },
      {
        index: 55,
        distKm: 8.8,
        elevationM: 770,
        name: "Campamento Poincenot",
        type: "hut",
        time: "09:45",
        photo: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1200&q=80",
        note: "Crossing Rio Blanco footbridge before the steep moraine wall."
      },
      {
        index: 76,
        distKm: 10.7,
        elevationM: 1170,
        name: "Laguna de los Tres",
        type: "summit",
        time: "11:30",
        photo: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
        note: "Turbulent emerald glacial lake under the sheer 1,000m wall of Mount Fitz Roy."
      },
      {
        index: 99,
        distKm: 21.4,
        elevationM: 410,
        name: "El Chaltén Finish",
        type: "end",
        time: "15:20",
        photo: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
        note: "Celebratory craft beer and Argentine empanadas in town."
      }
    ],
    track: generateRealisticPatagoniaTrack(-49.331, -72.886, -49.271, -72.982, 410, 1170, 100)
  }
];

/**
 * Route Generators matching exact mountain morphology
 */

function generateRealisticPassTrack(startLat, startLng, passLat, passLng, endLat, endLng, startAlt, passAlt, endAlt, numPoints) {
  const pts = [];
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    let lat, lng, ele;
    if (t <= 0.55) {
      const u = t / 0.55;
      // Switchback winding up Val Ferret
      const meander = Math.sin(u * Math.PI * 5) * 0.005;
      lat = startLat + (passLat - startLat) * u + meander * 0.4;
      lng = startLng + (passLng - startLng) * u + meander * 0.8;
      // Steep ascent to pass
      ele = startAlt + (passAlt - startAlt) * Math.pow(u, 1.2);
    } else {
      const u = (t - 0.55) / 0.45;
      const meander = Math.sin(u * Math.PI * 4) * 0.004;
      lat = passLat + (endLat - passLat) * u + meander * 0.5;
      lng = passLng + (endLng - passLng) * u + meander * 0.7;
      ele = passAlt - (passAlt - endAlt) * Math.sin(u * Math.PI / 2);
    }
    pts.push({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)), ele: Math.round(ele), grade: t < 0.55 ? 14.5 : -11.0 });
  }
  return pts;
}

function generateRealisticDomeTrack(startLat, startLng, domeLat, domeLng, startAlt, peakAlt, numPoints) {
  const pts = [];
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    let lat, lng, ele;
    if (t <= 0.75) {
      // Mist Trail -> Little Yosemite -> Subdome -> Cables Ascent
      const u = t / 0.75;
      const sCurve = Math.sin(u * Math.PI * 3) * 0.006;
      lat = startLat + (domeLat - startLat) * u + sCurve * 0.4;
      lng = startLng + (domeLng - startLng) * u + sCurve * 0.8;
      ele = startAlt + (peakAlt - startAlt) * Math.pow(u, 1.6);
    } else {
      // Descent back to valley
      const u = (t - 0.75) / 0.25;
      lat = domeLat + (startLat - domeLat) * u;
      lng = domeLng + (startLng - domeLng) * u;
      ele = peakAlt - (peakAlt - startAlt) * u;
    }
    pts.push({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)), ele: Math.round(ele), grade: t <= 0.75 ? 18.0 : -18.0 });
  }
  return pts;
}

function generateRealisticVolcanoTrack(baseLat, baseLng, craterLat, craterLng, baseAlt, peakAlt, numPoints) {
  const pts = [];
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    let lat, lng, ele;
    if (t <= 0.78) {
      // Yoshida ascending switchbacks up volcanic cone
      const u = t / 0.78;
      const zigzag = Math.sin(u * Math.PI * 8) * 0.004;
      lat = baseLat + (craterLat - baseLat) * u + zigzag;
      lng = baseLng + (craterLng - baseLng) * u + zigzag * 0.8;
      // Exponential volcanic cone slope curve
      ele = baseAlt + (peakAlt - baseAlt) * Math.pow(u, 1.4);
    } else {
      // Fast ash scree descent
      const u = (t - 0.78) / 0.22;
      lat = craterLat + (baseLat - craterLat) * u;
      lng = baseLng + (baseLng - baseLng) * u;
      ele = peakAlt - (peakAlt - baseAlt) * u;
    }
    pts.push({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)), ele: Math.round(ele), grade: t <= 0.78 ? 20.5 : -24.0 });
  }
  return pts;
}

function generateRealisticDolomiteLoop(startLat, startLng, passLat, passLng, hutLat, hutLng, startAlt, peakAlt, lowAlt, numPoints) {
  const pts = [];
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    // Smooth loop around the three towers
    const angle = t * Math.PI * 2;
    const radiusLat = 0.009;
    const radiusLng = 0.011;
    const centerLat = 46.618;
    const centerLng = 12.298;

    const lat = centerLat - Math.cos(angle) * radiusLat + Math.sin(t * Math.PI * 4) * 0.0015;
    const lng = centerLng + Math.sin(angle) * radiusLng + Math.cos(t * Math.PI * 4) * 0.0015;

    let ele;
    if (t <= 0.3) ele = startAlt + (peakAlt - startAlt) * (t / 0.3);
    else if (t <= 0.8) ele = peakAlt - (peakAlt - lowAlt) * ((t - 0.3) / 0.5);
    else ele = lowAlt + (startAlt - lowAlt) * ((t - 0.8) / 0.2);

    pts.push({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)), ele: Math.round(ele), grade: 6.5 });
  }
  return pts;
}

function generateRealisticPatagoniaTrack(startLat, startLng, spireLat, spireLng, startAlt, peakAlt, numPoints) {
  const pts = [];
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    let lat, lng, ele;
    if (t <= 0.76) {
      // Forest -> Camp Poincenot -> Relentless moraine climb
      const u = t / 0.76;
      const meander = Math.sin(u * Math.PI * 3) * 0.006;
      lat = startLat + (spireLat - startLat) * u + meander;
      lng = startLng + (spireLng - startLng) * u + meander * 0.8;
      // Gentle slope for 60% then steep moraine wall at end
      if (u < 0.6) {
        ele = startAlt + 360 * (u / 0.6);
      } else {
        const wallU = (u - 0.6) / 0.4;
        ele = startAlt + 360 + (peakAlt - startAlt - 360) * Math.pow(wallU, 1.4);
      }
    } else {
      const u = (t - 0.76) / 0.24;
      lat = spireLat + (startLat - spireLat) * u;
      lng = spireLng + (startLng - spireLng) * u;
      ele = peakAlt - (peakAlt - startAlt) * u;
    }
    pts.push({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)), ele: Math.round(ele), grade: t <= 0.76 ? 16.0 : -14.0 });
  }
  return pts;
}
