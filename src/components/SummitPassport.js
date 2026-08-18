import confetti from 'canvas-confetti';
import { audioEngine } from '../utils/audioEngine.js';

/**
 * Alpine Summit Passport & Stamp Book Component
 */
export class SummitPassport {
  constructor(containerEl, hikes, onSelectHike, onAddHike) {
    this.container = containerEl;
    this.hikes = hikes;
    this.onSelectHike = onSelectHike;
    this.onAddHike = onAddHike;
    this.collectedBadges = new Set(['badge-tmb-ferret', 'badge-half-dome', 'badge-tre-cime', 'badge-mt-fuji', 'badge-fitz-roy']);
    
    // Load persisted badges if available
    try {
      const saved = localStorage.getItem('peaklog_badges');
      if (saved) {
        this.collectedBadges = new Set(JSON.parse(saved));
      }
    } catch (e) {}

    this.render();
  }

  saveBadges() {
    try {
      localStorage.setItem('peaklog_badges', JSON.stringify(Array.from(this.collectedBadges)));
    } catch (e) {}
  }

  triggerStampCelebration(badge) {
    this.collectedBadges.add(badge.id);
    this.saveBadges();
    audioEngine.playSummitChime();

    // High-energy mountain confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#E11D48', '#D97706', '#059669', '#2563EB', '#F59E0B']
    });

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="passport-book-wrapper">
        <div class="passport-header">
          <div class="passport-title-section">
            <span class="passport-kicker">OFFICIAL EXPEDITION RECORD</span>
            <h2 class="passport-title">Alpine Summit Passport</h2>
            <p class="passport-subtitle">Certified mountaineering stamps & high-altitude milestone collection.</p>
          </div>
          <div class="passport-stats-chips">
            <div class="stat-badge-chip">
              <span class="stat-val">${this.collectedBadges.size} / ${this.hikes.length}</span>
              <span class="stat-lbl">Summits Stamped</span>
            </div>
            <div class="stat-badge-chip">
              <span class="stat-val">${this.calculateTotalElevation().toLocaleString()} m</span>
              <span class="stat-lbl">Vertical Conquered</span>
            </div>
          </div>
        </div>

        <div class="passport-stamp-grid">
          ${this.hikes.map(hike => this.renderStampCard(hike)).join('')}
        </div>
      </div>
    `;

    // Attach event listeners
    this.container.querySelectorAll('.stamp-card-interactive').forEach(card => {
      card.addEventListener('click', (e) => {
        const hikeId = card.dataset.hikeId;
        const hike = this.hikes.find(h => h.id === hikeId);
        if (hike && !e.target.closest('.stamp-action-btn')) {
          if (this.onSelectHike) this.onSelectHike(hike);
        }
      });
    });

    this.container.querySelectorAll('.stamp-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const hikeId = btn.dataset.hikeId;
        const hike = this.hikes.find(h => h.id === hikeId);
        if (hike && hike.badge) {
          this.triggerStampCelebration(hike.badge);
        }
      });
    });
  }

  calculateTotalElevation() {
    return this.hikes
      .filter(h => this.collectedBadges.has(h.badge?.id))
      .reduce((sum, h) => sum + (h.elevationGainM || 0), 0);
  }

  renderStampCard(hike) {
    const isStamped = this.collectedBadges.has(hike.badge?.id);
    const b = hike.badge || {
      title: 'Peak Ascent',
      peakName: hike.name,
      elevationStamp: `${hike.maxElevationM} M`,
      stampDate: hike.date,
      coordinates: 'Alpine High Point',
      color: '#E11D48'
    };

    return `
      <div class="stamp-card stamp-card-interactive ${isStamped ? 'is-stamped' : 'is-pending'}" data-hike-id="${hike.id}">
        <div class="stamp-seal-badge" style="--stamp-accent: ${b.color};">
          <div class="seal-inner">
            <div class="seal-header">PEAKLOG · CERTIFIED</div>
            <div class="seal-icon">▲</div>
            <div class="seal-peak">${b.peakName}</div>
            <div class="seal-elevation">${b.elevationStamp}</div>
            <div class="seal-coords">${b.coordinates}</div>
            <div class="seal-date">${b.stampDate}</div>
            ${isStamped ? '<div class="seal-ink-stamp">VERIFIED SUMMIT</div>' : ''}
          </div>
        </div>

        <div class="stamp-card-details">
          <div class="stamp-hike-header">
            <span class="stamp-region">${hike.country} · ${hike.difficulty}</span>
            <h3 class="stamp-hike-title">${hike.name}</h3>
          </div>
          <div class="stamp-telemetry-row">
            <span><strong>${hike.distanceKm}</strong> km dist</span>
            <span>·</span>
            <span><strong>+${hike.elevationGainM}m</strong> gain</span>
            <span>·</span>
            <span><strong>${hike.movingTime}</strong> pace</span>
          </div>

          <div class="stamp-footer">
            ${isStamped ? `
              <span class="stamped-check-label">✓ Inscribed in Logbook</span>
              <button class="view-hike-btn" data-hike-id="${hike.id}">Relive 3D Hike →</button>
            ` : `
              <button class="stamp-action-btn" data-hike-id="${hike.id}">Stamp Passport 🏔️</button>
            `}
          </div>
        </div>
      </div>
    `;
  }
}
