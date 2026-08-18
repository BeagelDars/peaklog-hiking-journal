import L from 'leaflet';

/**
 * Topographic 2D Map Synchronizer Component using Leaflet
 */
export class MapSynchronizer {
  constructor(containerEl, onWaypointClick) {
    this.container = containerEl;
    this.onWaypointClick = onWaypointClick;
    this.map = null;
    this.hike = null;
    this.trailPolyline = null;
    this.trailGlow = null;
    this.hikerMarker = null;
    this.waypointMarkers = [];
    this.currentIndex = 0;

    this.initMap();
  }

  initMap() {
    // Initialize map with neutral outdoor coordinates
    this.map = L.map(this.container, {
      zoomControl: false,
      attributionControl: false
    }).setView([46.0, 7.0], 12);

    L.control.zoom({ position: 'topright' }).addTo(this.map);

    // Beautiful light-mode topographic tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c']
    }).addTo(this.map);

    // Subtle attribution in bottom right
    L.control.attribution({ position: 'bottomright', prefix: false })
      .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors')
      .addTo(this.map);
  }

  setHike(hike) {
    this.hike = hike;
    this.currentIndex = 0;

    // Remove previous layers
    if (this.trailPolyline) this.map.removeLayer(this.trailPolyline);
    if (this.trailGlow) this.map.removeLayer(this.trailGlow);
    if (this.hikerMarker) this.map.removeLayer(this.hikerMarker);
    this.waypointMarkers.forEach(m => this.map.removeLayer(m));
    this.waypointMarkers = [];

    if (!this.hike || !this.hike.track || this.hike.track.length === 0) return;

    const latlngs = this.hike.track.map(p => [p.lat, p.lng]);

    // Outer glow polyline
    this.trailGlow = L.polyline(latlngs, {
      color: '#FDA4AF',
      weight: 8,
      opacity: 0.5,
      lineCap: 'round'
    }).addTo(this.map);

    // Main trail polyline
    this.trailPolyline = L.polyline(latlngs, {
      color: '#E11D48',
      weight: 3.5,
      opacity: 0.95,
      lineCap: 'round',
      dashArray: null
    }).addTo(this.map);

    // Fit map bounds
    this.map.fitBounds(this.trailPolyline.getBounds(), { padding: [40, 40] });

    // Add Waypoint pins
    if (this.hike.waypoints) {
      this.hike.waypoints.forEach((wp) => {
        const wpIdx = Math.min(this.hike.track.length - 1, wp.index);
        const pt = this.hike.track[wpIdx];
        if (!pt) return;

        const isSummit = wp.type === 'summit';
        const iconHtml = `
          <div class="map-wp-pin ${isSummit ? 'pin-summit' : ''}" title="${wp.name}">
            <div class="pin-inner">
              ${isSummit ? '🚩' : '📍'}
            </div>
            <div class="pin-pulse"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'leaflet-custom-pin-wrapper',
          iconSize: [28, 28],
          iconAnchor: [14, 28]
        });

        const marker = L.marker([pt.lat, pt.lng], { icon: customIcon }).addTo(this.map);
        marker.bindPopup(`
          <div class="map-popup-card">
            <div class="popup-type">${wp.type.toUpperCase()}</div>
            <strong class="popup-title">${wp.name}</strong>
            <div class="popup-meta">${wp.distKm} km · ${wp.elevationM}m · ${wp.time}</div>
            <p class="popup-note">${wp.note}</p>
          </div>
        `);

        marker.on('click', () => {
          if (this.onWaypointClick) {
            this.onWaypointClick(wp);
          }
        });

        this.waypointMarkers.push(marker);
      });
    }

    // Create Animated Hiker Marker
    const hikerIconHtml = `
      <div class="map-hiker-beacon">
        <div class="hiker-dot"></div>
        <div class="hiker-radar"></div>
      </div>
    `;

    const hikerIcon = L.divIcon({
      html: hikerIconHtml,
      className: 'leaflet-hiker-wrapper',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const startPt = this.hike.track[0];
    this.hikerMarker = L.marker([startPt.lat, startPt.lng], { icon: hikerIcon, zIndexOffset: 1000 }).addTo(this.map);
  }

  setCurrentIndex(index, autoPan = false) {
    if (!this.hike || !this.hike.track[index] || !this.hikerMarker) return;
    this.currentIndex = index;
    const pt = this.hike.track[index];
    const newPos = [pt.lat, pt.lng];

    this.hikerMarker.setLatLng(newPos);

    if (autoPan) {
      this.map.panTo(newPos, { animate: true, duration: 0.4 });
    }
  }

  invalidateSize() {
    if (this.map) {
      setTimeout(() => this.map.invalidateSize(), 150);
    }
  }
}
