import './style.css';
import { PRELOADED_HIKES } from './data/hikes.js';
import { TerrainViewer3D } from './components/TerrainViewer3D.js';
import { MapSynchronizer } from './components/MapSynchronizer.js';
import { ElevationProfile } from './components/ElevationProfile.js';
import { SummitPassport } from './components/SummitPassport.js';
import { parseGPX } from './utils/gpxParser.js';
import { audioEngine } from './utils/audioEngine.js';

class PeakLogApp {
  constructor() {
    this.hikes = [...PRELOADED_HIKES];
    this.loadCustomHikes();

    this.currentHike = this.hikes[0];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.playbackSpeed = 1;
    this.playInterval = null;
    this.activeTab = '3d'; // '3d', 'map', 'passport'

    this.viewer3D = null;
    this.mapSync = null;
    this.elevationProfile = null;
    this.passport = null;

    this.initElements();
    this.initComponents();
    this.renderHikePills();
    this.setupEventListeners();
    this.selectHike(this.currentHike);
  }

  loadCustomHikes() {
    try {
      const saved = localStorage.getItem('peaklog_custom_hikes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.hikes = [...PRELOADED_HIKES, ...parsed];
        }
      }
    } catch (e) {
      console.warn("Could not load custom hikes", e);
    }
  }

  saveCustomHikes() {
    try {
      const customOnly = this.hikes.filter(h => h.id.startsWith('custom-'));
      localStorage.setItem('peaklog_custom_hikes', JSON.stringify(customOnly));
    } catch (e) {}
  }

  initElements() {
    this.el = {
      brandLogoBtn: document.getElementById('brandLogoBtn'),
      tab3dReplay: document.getElementById('tab3dReplay'),
      tabTopoMap: document.getElementById('tabTopoMap'),
      tabPassport: document.getElementById('tabPassport'),
      audioToggleBtn: document.getElementById('audioToggleBtn'),
      audioIcon: document.getElementById('audioIcon'),

      hikePillsContainer: document.getElementById('hikePillsContainer'),
      stageViewWrapper: document.getElementById('stageViewWrapper'),
      passportViewWrapper: document.getElementById('passportViewWrapper'),

      threeContainer: document.getElementById('threeContainer'),
      mapContainer: document.getElementById('mapContainer'),

      // Hero Play Button & Quick Tip
      heroPlayBtn: document.getElementById('heroPlayBtn'),
      quickTipPill: document.getElementById('quickTipPill'),
      dismissTipBtn: document.getElementById('dismissTipBtn'),

      // HUD Telemetry
      hudElevation: document.getElementById('hudElevation'),
      hudDistance: document.getElementById('hudDistance'),
      hudGrade: document.getElementById('hudGrade'),

      // Floating Waypoint Card
      floatingWaypointCard: document.getElementById('floatingWaypointCard'),
      wpTypeBadge: document.getElementById('wpTypeBadge'),
      wpTimeStamp: document.getElementById('wpTimeStamp'),
      wpTitle: document.getElementById('wpTitle'),
      wpDescription: document.getElementById('wpDescription'),
      wpThumbnail: document.getElementById('wpThumbnail'),
      wpViewPhotoBtn: document.getElementById('wpViewPhotoBtn'),

      // Camera Dock
      camChaseBtn: document.getElementById('camChaseBtn'),
      camOrbitBtn: document.getElementById('camOrbitBtn'),
      camTopoBtn: document.getElementById('camTopoBtn'),

      // Replay Deck
      deckPlayPauseBtn: document.getElementById('deckPlayPauseBtn'),
      deckPlayIcon: document.getElementById('deckPlayIcon'),
      deckResetBtn: document.getElementById('deckResetBtn'),
      timelineSlider: document.getElementById('timelineSlider'),
      deckProgressText: document.getElementById('deckProgressText'),
      speedPills: document.querySelectorAll('.speed-pill'),

      // Journal Drawer
      openJournalDrawerBtn: document.getElementById('openJournalDrawerBtn'),
      journalDrawerBackdrop: document.getElementById('journalDrawerBackdrop'),
      journalDrawerContent: document.getElementById('journalDrawerContent'),
      closeJournalDrawerBtn: document.getElementById('closeJournalDrawerBtn'),

      // Modals
      openImportModalBtn: document.getElementById('openImportModalBtn'),
      importModalBackdrop: document.getElementById('importModalBackdrop'),
      closeImportModalBtn: document.getElementById('closeImportModalBtn'),
      cancelImportBtn: document.getElementById('cancelImportBtn'),
      gpxDropZone: document.getElementById('gpxDropZone'),
      gpxFileInput: document.getElementById('gpxFileInput'),

      photoModalBackdrop: document.getElementById('photoModalBackdrop'),
      photoModalTitle: document.getElementById('photoModalTitle'),
      photoModalImg: document.getElementById('photoModalImg'),
      photoModalCaption: document.getElementById('photoModalCaption'),
      closePhotoModalBtn: document.getElementById('closePhotoModalBtn')
    };
  }

  initComponents() {
    this.viewer3D = new TerrainViewer3D(this.el.threeContainer, (wp) => this.openPhotoModal(wp));
    this.mapSync = new MapSynchronizer(this.el.mapContainer, (wp) => this.openPhotoModal(wp));
    
    const profileContainer = document.getElementById('elevationProfileContainer');
    this.elevationProfile = new ElevationProfile(profileContainer, (idx) => {
      this.seekTo(idx);
    });

    this.passport = new SummitPassport(
      this.el.passportViewWrapper,
      this.hikes,
      (hike) => {
        this.switchTab('3d');
        this.selectHike(hike);
      },
      (newHike) => {
        this.hikes.push(newHike);
        this.saveCustomHikes();
        this.renderHikePills();
        this.selectHike(newHike);
      }
    );
  }

  renderHikePills() {
    this.el.hikePillsContainer.innerHTML = this.hikes.map(h => `
      <button class="hike-pill ${h.id === this.currentHike.id ? 'is-active' : ''}" data-hike-id="${h.id}">
        <span>${h.name.split(':')[0]}</span>
        <span class="pill-dist">${h.distanceKm}km</span>
      </button>
    `).join('');

    this.el.hikePillsContainer.querySelectorAll('.hike-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const h = this.hikes.find(x => x.id === pill.dataset.hikeId);
        if (h) this.selectHike(h);
      });
    });
  }

  setupEventListeners() {
    // Navigation Tabs
    this.el.tab3dReplay.addEventListener('click', () => this.switchTab('3d'));
    this.el.tabTopoMap.addEventListener('click', () => this.switchTab('map'));
    this.el.tabPassport.addEventListener('click', () => this.switchTab('passport'));

    this.el.brandLogoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.switchTab('3d');
      this.selectHike(this.hikes[0]);
    });

    // Sound toggle
    this.el.audioToggleBtn.addEventListener('click', () => {
      const isSoundOn = audioEngine.toggleSound();
      if (isSoundOn) {
        this.el.audioToggleBtn.classList.add('is-on');
        this.el.audioIcon.textContent = '🔊';
        this.el.audioToggleBtn.innerHTML = `<span>🔊</span> Sound: On`;
      } else {
        this.el.audioToggleBtn.classList.remove('is-on');
        this.el.audioIcon.textContent = '🔈';
        this.el.audioToggleBtn.innerHTML = `<span>🔈</span> Sound: Off`;
      }
    });

    // Quick Tip dismiss
    if (this.el.dismissTipBtn) {
      this.el.dismissTipBtn.addEventListener('click', () => {
        this.el.quickTipPill.style.display = 'none';
      });
    }

    // Hero Play Button
    this.el.heroPlayBtn.addEventListener('click', () => {
      this.play();
    });

    // Deck Play/Pause & Reset
    this.el.deckPlayPauseBtn.addEventListener('click', () => this.togglePlayPause());
    this.el.deckResetBtn.addEventListener('click', () => this.seekTo(0));

    this.el.timelineSlider.addEventListener('input', (e) => {
      this.seekTo(parseInt(e.target.value, 10));
    });

    // Speed Selector
    this.el.speedPills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.el.speedPills.forEach(p => p.classList.remove('is-active'));
        pill.classList.add('is-active');
        this.playbackSpeed = parseFloat(pill.dataset.speed);
        if (this.isPlaying) {
          this.pause();
          this.play();
        }
      });
    });

    // Camera Dock Buttons
    this.el.camChaseBtn.addEventListener('click', () => this.setCameraMode('chase'));
    this.el.camOrbitBtn.addEventListener('click', () => this.setCameraMode('orbit'));
    this.el.camTopoBtn.addEventListener('click', () => this.setCameraMode('topo'));

    // Floating Waypoint Card View Button
    this.el.wpViewPhotoBtn.addEventListener('click', () => {
      const wp = this.getNearestWaypoint();
      if (wp) this.openPhotoModal(wp);
    });
    this.el.wpThumbnail.addEventListener('click', () => {
      const wp = this.getNearestWaypoint();
      if (wp) this.openPhotoModal(wp);
    });

    // Journal Drawer
    this.el.openJournalDrawerBtn.addEventListener('click', () => {
      this.renderJournalDrawer();
      this.el.journalDrawerBackdrop.classList.add('is-open');
    });

    const closeDrawer = () => {
      this.el.journalDrawerBackdrop.classList.remove('is-open');
    };
    this.el.closeJournalDrawerBtn.addEventListener('click', closeDrawer);
    this.el.journalDrawerBackdrop.addEventListener('click', (e) => {
      if (e.target === this.el.journalDrawerBackdrop) closeDrawer();
    });

    // Import Modal
    this.el.openImportModalBtn.addEventListener('click', () => {
      this.el.importModalBackdrop.classList.add('is-open');
    });

    const closeImport = () => {
      this.el.importModalBackdrop.classList.remove('is-open');
    };
    this.el.closeImportModalBtn.addEventListener('click', closeImport);
    this.el.cancelImportBtn.addEventListener('click', closeImport);

    this.el.gpxDropZone.addEventListener('click', () => this.el.gpxFileInput.click());
    this.el.gpxDropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.el.gpxDropZone.classList.add('drag-over');
    });
    this.el.gpxDropZone.addEventListener('dragleave', () => {
      this.el.gpxDropZone.classList.remove('drag-over');
    });
    this.el.gpxDropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.el.gpxDropZone.classList.remove('drag-over');
      if (e.dataTransfer.files.length > 0) this.handleGPX(e.dataTransfer.files[0]);
    });
    this.el.gpxFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) this.handleGPX(e.target.files[0]);
    });

    // Photo Modal
    this.el.closePhotoModalBtn.addEventListener('click', () => {
      this.el.photoModalBackdrop.classList.remove('is-open');
    });
    this.el.photoModalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.el.photoModalBackdrop) {
        this.el.photoModalBackdrop.classList.remove('is-open');
      }
    });

    // Keyboard (Space = Play/Pause, Arrow Keys = Scrub)
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlayPause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        this.seekTo(this.currentIndex + 2);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.seekTo(this.currentIndex - 2);
      }
    });
  }

  switchTab(tab) {
    this.activeTab = tab;
    this.el.tab3dReplay.classList.toggle('is-active', tab === '3d');
    this.el.tabTopoMap.classList.toggle('is-active', tab === 'map');
    this.el.tabPassport.classList.toggle('is-active', tab === 'passport');

    if (tab === 'passport') {
      this.pause();
      this.el.stageViewWrapper.style.display = 'none';
      this.el.passportViewWrapper.style.display = 'block';
      this.passport.render();
    } else {
      this.el.passportViewWrapper.style.display = 'none';
      this.el.stageViewWrapper.style.display = 'flex';

      if (tab === '3d') {
        this.el.threeContainer.style.display = 'block';
        this.el.mapContainer.style.display = 'none';
        this.viewer3D.onResize();
      } else if (tab === 'map') {
        this.el.threeContainer.style.display = 'none';
        this.el.mapContainer.style.display = 'block';
        this.mapSync.invalidateSize();
      }
      this.elevationProfile.resizeCanvas();
    }
  }

  setCameraMode(mode) {
    this.el.camChaseBtn.classList.toggle('is-active', mode === 'chase');
    this.el.camOrbitBtn.classList.toggle('is-active', mode === 'orbit');
    this.el.camTopoBtn.classList.toggle('is-active', mode === 'topo');
    this.viewer3D.setCameraMode(mode);
  }

  selectHike(hike) {
    this.pause();
    this.currentHike = hike;
    this.currentIndex = 0;

    this.renderHikePills();

    const trackLength = hike.track ? hike.track.length : 100;
    this.el.timelineSlider.max = trackLength - 1;
    this.el.timelineSlider.value = 0;

    this.viewer3D.setHike(hike);
    this.mapSync.setHike(hike);
    this.elevationProfile.setHike(hike);

    this.el.heroPlayBtn.classList.remove('is-hidden');
    this.syncStep();
  }

  togglePlayPause() {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  play() {
    if (this.currentIndex >= this.currentHike.track.length - 1) {
      this.currentIndex = 0;
    }
    this.isPlaying = true;
    this.el.deckPlayIcon.textContent = '⏸';
    this.el.heroPlayBtn.classList.add('is-hidden');

    const intervalMs = Math.max(25, 200 / this.playbackSpeed);
    this.playInterval = setInterval(() => {
      if (this.currentIndex >= this.currentHike.track.length - 1) {
        this.pause();
        return;
      }
      this.currentIndex++;
      this.syncStep();
      audioEngine.playStepSound();
    }, intervalMs);
  }

  pause() {
    this.isPlaying = false;
    this.el.deckPlayIcon.textContent = '▶';
    if (this.currentIndex === 0) {
      this.el.heroPlayBtn.classList.remove('is-hidden');
    }
    if (this.playInterval) {
      clearInterval(this.playInterval);
      this.playInterval = null;
    }
  }

  seekTo(index) {
    const maxIdx = this.currentHike.track.length - 1;
    this.currentIndex = Math.max(0, Math.min(maxIdx, index));
    this.syncStep();
  }

  syncStep() {
    this.el.timelineSlider.value = this.currentIndex;
    this.viewer3D.setCurrentIndex(this.currentIndex);
    this.mapSync.setCurrentIndex(this.currentIndex, this.isPlaying);
    this.elevationProfile.setCurrentIndex(this.currentIndex);

    this.updateHUD();
    this.updateFloatingWaypoint();

    const pt = this.currentHike.track[this.currentIndex];
    if (pt) {
      const norm = (pt.ele - this.currentHike.minElevationM) / (this.currentHike.maxElevationM - this.currentHike.minElevationM || 1);
      audioEngine.setAltitudeWindScale(norm);
    }
  }

  updateHUD() {
    if (!this.currentHike || !this.currentHike.track[this.currentIndex]) return;
    const pt = this.currentHike.track[this.currentIndex];
    const totalDist = this.currentHike.distanceKm;
    const currentDist = (this.currentIndex / (this.currentHike.track.length - 1) * totalDist).toFixed(1);

    this.el.hudElevation.textContent = `${pt.ele} m`;
    this.el.hudDistance.textContent = `${currentDist} / ${totalDist} km`;

    const grade = pt.grade || 0;
    this.el.hudGrade.textContent = `${grade > 0 ? '+' : ''}${grade.toFixed(1)}%`;

    this.el.deckProgressText.textContent = `${currentDist} / ${totalDist} km`;
  }

  getNearestWaypoint() {
    if (!this.currentHike || !this.currentHike.waypoints) return null;
    // Find closest waypoint to currentIndex
    let closest = this.currentHike.waypoints[0];
    let minDiff = Infinity;
    this.currentHike.waypoints.forEach(wp => {
      const diff = Math.abs(wp.index - this.currentIndex);
      if (diff < minDiff) {
        minDiff = diff;
        closest = wp;
      }
    });
    return closest;
  }

  updateFloatingWaypoint() {
    const wp = this.getNearestWaypoint();
    if (!wp) return;

    this.el.wpTypeBadge.textContent = wp.type.toUpperCase();
    this.el.wpTimeStamp.textContent = wp.time;
    this.el.wpTitle.textContent = wp.name;
    this.el.wpDescription.textContent = wp.note;
    if (wp.photo) {
      this.el.wpThumbnail.src = wp.photo;
      this.el.wpThumbnail.style.display = 'block';
    } else {
      this.el.wpThumbnail.style.display = 'none';
    }
  }

  renderJournalDrawer() {
    const h = this.currentHike;
    this.el.journalDrawerContent.innerHTML = `
      <div class="drawer-summary-card">
        <span class="drawer-hike-kicker">${h.country} · ${h.difficulty}</span>
        <h3 class="drawer-hike-name">${h.name}</h3>

        <div class="drawer-stats-grid">
          <div class="drawer-stat-item">
            <span class="drawer-stat-lbl">Distance</span>
            <span class="drawer-stat-val">${h.distanceKm} km</span>
          </div>
          <div class="drawer-stat-item">
            <span class="drawer-stat-lbl">Ascent</span>
            <span class="drawer-stat-val">+${h.elevationGainM}m</span>
          </div>
          <div class="drawer-stat-item">
            <span class="drawer-stat-lbl">Moving Time</span>
            <span class="drawer-stat-val">${h.movingTime}</span>
          </div>
          <div class="drawer-stat-item">
            <span class="drawer-stat-lbl">Max Alt</span>
            <span class="drawer-stat-val">${h.maxElevationM}m</span>
          </div>
          <div class="drawer-stat-item">
            <span class="drawer-stat-lbl">Calories</span>
            <span class="drawer-stat-val">${h.caloriesBurned} kcal</span>
          </div>
          <div class="drawer-stat-item">
            <span class="drawer-stat-lbl">Avg Slope</span>
            <span class="drawer-stat-val">${h.avgGradient}</span>
          </div>
        </div>
      </div>

      <div>
        <h4 style="font-size: 0.82rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">
          Expedition Memories & Field Notes
        </h4>
        <p style="font-size: 0.88rem; color: var(--text-main); font-style: italic; line-height: 1.6; background: var(--bg-card-subtle); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
          "${h.journalNotes}"
        </p>
      </div>

      <div>
        <h4 style="font-size: 0.82rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">
          Waypoints & Milestones (${h.waypoints.length})
        </h4>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${h.waypoints.map(wp => `
            <div style="display: flex; gap: 10px; padding: 10px; border: 1px solid var(--border-light); border-radius: var(--radius-md); background: #FFFFFF; cursor: pointer;" class="drawer-wp-row" data-index="${wp.index}">
              <span style="font-size: 1.1rem;">${wp.type === 'summit' ? '🚩' : '📍'}</span>
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between;">
                  <strong style="font-size: 0.85rem;">${wp.name}</strong>
                  <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted);">${wp.distKm} km · ${wp.elevationM}m</span>
                </div>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${wp.note}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.el.journalDrawerContent.querySelectorAll('.drawer-wp-row').forEach(row => {
      row.addEventListener('click', () => {
        const idx = parseInt(row.dataset.index, 10);
        this.seekTo(idx);
        this.el.journalDrawerBackdrop.classList.remove('is-open');
      });
    });
  }

  openPhotoModal(wp) {
    if (!wp) return;
    this.el.photoModalTitle.textContent = wp.name;
    this.el.photoModalImg.src = wp.photo || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80';
    this.el.photoModalCaption.innerHTML = `
      <strong>${wp.distKm} km · ${wp.elevationM}m elevation · ${wp.time}</strong><br />
      ${wp.note}
    `;
    this.el.photoModalBackdrop.classList.add('is-open');
  }

  handleGPX(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const gpxText = e.target.result;
        const newHike = parseGPX(gpxText);
        this.hikes.push(newHike);
        this.saveCustomHikes();
        this.renderHikePills();
        this.selectHike(newHike);
        this.el.importModalBackdrop.classList.remove('is-open');
        this.passport.render();
      } catch (err) {
        alert("Could not load GPX file: " + err.message);
      }
    };
    reader.readAsText(file);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PeakLogApp();
});
