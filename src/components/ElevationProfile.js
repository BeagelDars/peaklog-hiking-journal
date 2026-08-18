/**
 * Interactive Elevation Profile Graph Component
 * Synchronized with 3D terrain replay and 2D map cursor.
 */

export class ElevationProfile {
  constructor(containerEl, onScrubCallback) {
    this.container = containerEl;
    this.onScrub = onScrubCallback;
    this.hike = null;
    this.currentIndex = 0;
    this.unit = "m"; // "m" or "ft"
    this.canvas = null;
    this.ctx = null;
    this.isDragging = false;
    this.hoverIndex = null;

    this.initDOM();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="elevation-profile-card">
        <div class="profile-header">
          <div class="profile-title-group">
            <span class="profile-label">ELEVATION TELEMETRY</span>
            <span class="profile-summary" id="profileSummaryText">--</span>
          </div>
          <div class="profile-legend">
            <span class="legend-item"><span class="legend-dot dot-gentle"></span> &lt;8% Gentle</span>
            <span class="legend-item"><span class="legend-dot dot-mod"></span> 8-16% Moderate</span>
            <span class="legend-item"><span class="legend-dot dot-steep"></span> 16-25% Steep</span>
            <span class="legend-item"><span class="legend-dot dot-extreme"></span> &gt;25% Alpine</span>
            <button class="unit-toggle-btn" id="unitToggleBtn">Meters (m)</button>
          </div>
        </div>
        <div class="canvas-wrapper" id="profileCanvasWrapper">
          <canvas id="elevationCanvas"></canvas>
          <div class="profile-tooltip" id="profileTooltip"></div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector("#elevationCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.tooltip = this.container.querySelector("#profileTooltip");
    this.wrapper = this.container.querySelector("#profileCanvasWrapper");
    this.summaryEl = this.container.querySelector("#profileSummaryText");
    this.unitBtn = this.container.querySelector("#unitToggleBtn");

    this.unitBtn.addEventListener("click", () => {
      this.unit = this.unit === "m" ? "ft" : "m";
      this.unitBtn.textContent = this.unit === "m" ? "Meters (m)" : "Feet (ft)";
      this.render();
    });

    this.setupEvents();
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  setupEvents() {
    const handleMove = (e) => {
      if (!this.hike || !this.hike.track) return;
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left;
      const paddingLeft = 45;
      const paddingRight = 20;
      const graphWidth = rect.width - paddingLeft - paddingRight;

      if (x >= paddingLeft && x <= rect.width - paddingRight) {
        const progress = Math.max(0, Math.min(1, (x - paddingLeft) / graphWidth));
        const index = Math.round(progress * (this.hike.track.length - 1));
        this.hoverIndex = index;

        if (this.isDragging && this.onScrub) {
          this.onScrub(index);
        }

        this.showTooltip(clientX, clientY, index, rect);
        this.render();
      }
    };

    this.canvas.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      handleMove(e);
    });

    window.addEventListener("mousemove", (e) => {
      if (this.isDragging) {
        handleMove(e);
      }
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener("mousemove", handleMove);

    this.canvas.addEventListener("mouseleave", () => {
      if (!this.isDragging) {
        this.hoverIndex = null;
        this.hideTooltip();
        this.render();
      }
    });

    // Touch support for mobile/tablets
    this.canvas.addEventListener("touchstart", (e) => {
      this.isDragging = true;
      handleMove(e);
    }, { passive: false });

    this.canvas.addEventListener("touchmove", (e) => {
      if (this.isDragging) {
        e.preventDefault();
        handleMove(e);
      }
    }, { passive: false });

    this.canvas.addEventListener("touchend", () => {
      this.isDragging = false;
      this.hoverIndex = null;
      this.hideTooltip();
      this.render();
    });
  }

  showTooltip(clientX, clientY, index, rect) {
    if (!this.hike || !this.hike.track[index]) return;
    const pt = this.hike.track[index];
    const totalDist = this.hike.distanceKm;
    const currentDist = (index / (this.hike.track.length - 1) * totalDist).toFixed(1);
    const eleVal = this.unit === "m" ? `${pt.ele} m` : `${Math.round(pt.ele * 3.28084)} ft`;
    const gradeVal = pt.grade !== undefined ? `${pt.grade > 0 ? "+" : ""}${pt.grade.toFixed(1)}%` : "0%";

    // Check if near a waypoint
    const nearWp = this.hike.waypoints.find(wp => Math.abs(wp.index - index) <= 2);

    this.tooltip.innerHTML = `
      <div class="tooltip-row"><strong>${currentDist} km</strong> · <span class="tooltip-ele">${eleVal}</span></div>
      <div class="tooltip-sub">Slope: <span class="${pt.grade > 15 ? 'text-amber' : ''}">${gradeVal}</span></div>
      ${nearWp ? `<div class="tooltip-wp">📍 ${nearWp.name}</div>` : ''}
    `;

    this.tooltip.style.display = "block";
    const tipRect = this.tooltip.getBoundingClientRect();
    let left = clientX - rect.left - tipRect.width / 2;
    let top = clientY - rect.top - tipRect.height - 12;

    if (left < 10) left = 10;
    if (left + tipRect.width > rect.width - 10) left = rect.width - tipRect.width - 10;
    if (top < 5) top = clientY - rect.top + 15;

    this.tooltip.style.left = `${left}px`;
    this.tooltip.style.top = `${top}px`;
  }

  hideTooltip() {
    this.tooltip.style.display = "none";
  }

  setHike(hike) {
    this.hike = hike;
    this.currentIndex = 0;
    this.hoverIndex = null;
    this.updateSummary();
    this.resizeCanvas();
  }

  setCurrentIndex(index) {
    this.currentIndex = Math.max(0, Math.min(this.hike ? this.hike.track.length - 1 : 0, index));
    this.render();
  }

  updateSummary() {
    if (!this.hike) return;
    const gain = this.unit === "m" ? `${this.hike.elevationGainM}m ▲` : `${Math.round(this.hike.elevationGainM * 3.28084)}ft ▲`;
    const maxE = this.unit === "m" ? `${this.hike.maxElevationM}m` : `${Math.round(this.hike.maxElevationM * 3.28084)}ft`;
    this.summaryEl.textContent = `Gain: ${gain} · Max: ${maxE} · Dist: ${this.hike.distanceKm} km`;
  }

  resizeCanvas() {
    if (!this.canvas || !this.wrapper) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = this.wrapper.getBoundingClientRect();
    if (rect.width === 0) return;

    this.canvas.width = rect.width * dpr;
    this.canvas.height = 140 * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `140px`;
    this.ctx.scale(dpr, dpr);

    this.render();
  }

  render() {
    if (!this.hike || !this.hike.track || !this.ctx) return;
    const track = this.hike.track;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = 140;

    const padL = 48;
    const padR = 20;
    const padT = 20;
    const padB = 26;

    const gW = width - padL - padR;
    const gH = height - padT - padB;

    this.ctx.clearRect(0, 0, width, height);

    // Elevation range
    let minEle = this.hike.minElevationM;
    let maxEle = this.hike.maxElevationM;
    // Add 10% breathing room
    const eleRange = (maxEle - minEle) || 1;
    minEle -= eleRange * 0.08;
    maxEle += eleRange * 0.08;

    const conv = (ele) => (this.unit === "m" ? ele : ele * 3.28084);

    // Draw horizontal grid lines & altitude markers
    this.ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
    this.ctx.lineWidth = 1;
    this.ctx.fillStyle = "#64748B";
    this.ctx.font = "10px 'JetBrains Mono', monospace";
    this.ctx.textAlign = "right";

    const steps = 3;
    for (let s = 0; s <= steps; s++) {
      const eleVal = minEle + (maxEle - minEle) * (s / steps);
      const y = padT + gH - (s / steps) * gH;

      this.ctx.beginPath();
      this.ctx.moveTo(padL, y);
      this.ctx.lineTo(width - padR, y);
      this.ctx.stroke();

      const label = `${Math.round(conv(eleVal))}${this.unit}`;
      this.ctx.fillText(label, padL - 6, y + 3);
    }

    // Prepare point coordinates
    const points = track.map((p, idx) => {
      const x = padL + (idx / (track.length - 1)) * gW;
      const y = padT + gH - ((p.ele - minEle) / (maxEle - minEle)) * gH;
      return { x, y, ele: p.ele, grade: p.grade || 0, idx };
    });

    // 1. Draw gradient area underneath curve
    const areaGrad = this.ctx.createLinearGradient(0, padT, 0, padT + gH);
    areaGrad.addColorStop(0, "rgba(225, 29, 72, 0.18)"); // Alpine crimson tint at top
    areaGrad.addColorStop(0.5, "rgba(217, 119, 6, 0.12)"); // Amber middle
    areaGrad.addColorStop(1, "rgba(244, 239, 234, 0.05)"); // Paper base

    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, padT + gH);
    points.forEach((pt, i) => {
      if (i === 0) this.ctx.lineTo(pt.x, pt.y);
      else {
        // Smooth bezier curve
        const prev = points[i - 1];
        const cx = (prev.x + pt.x) / 2;
        this.ctx.quadraticCurveTo(prev.x, prev.y, cx, (prev.y + pt.y) / 2);
      }
    });
    this.ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    this.ctx.lineTo(points[points.length - 1].x, padT + gH);
    this.ctx.closePath();
    this.ctx.fillStyle = areaGrad;
    this.ctx.fill();

    // 2. Draw colored gradient path segments based on slope grade
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const grade = Math.abs(track[i].grade || 0);

      let strokeColor = "#10B981"; // Gentle (<8%)
      if (grade >= 25) strokeColor = "#E11D48"; // Extreme (>25%)
      else if (grade >= 16) strokeColor = "#EA580C"; // Steep (16-25%)
      else if (grade >= 8) strokeColor = "#D97706"; // Moderate (8-16%)

      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.lineTo(p2.x, p2.y);
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = 2.6;
      this.ctx.lineCap = "round";
      this.ctx.stroke();
    }

    // 3. Draw Waypoint Flags / Markers
    if (this.hike.waypoints) {
      this.hike.waypoints.forEach((wp) => {
        const wpIdx = Math.min(track.length - 1, wp.index);
        const pt = points[wpIdx];
        if (!pt) return;

        // Flag stem
        this.ctx.beginPath();
        this.ctx.setLineDash([2, 2]);
        this.ctx.strokeStyle = "rgba(100, 116, 139, 0.5)";
        this.ctx.lineWidth = 1;
        this.ctx.moveTo(pt.x, pt.y);
        this.ctx.lineTo(pt.x, padT + 5);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Flag Pin
        const isSummit = wp.type === "summit";
        this.ctx.beginPath();
        this.ctx.arc(pt.x, padT + 5, isSummit ? 5.5 : 4, 0, Math.PI * 2);
        this.ctx.fillStyle = isSummit ? "#E11D48" : "#1E293B";
        this.ctx.fill();
        this.ctx.strokeStyle = "#FFFFFF";
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();

        // Pin label
        this.ctx.fillStyle = isSummit ? "#BE123C" : "#475569";
        this.ctx.font = isSummit ? "bold 9px 'Plus Jakarta Sans', sans-serif" : "9px 'Plus Jakarta Sans', sans-serif";
        this.ctx.textAlign = "center";
        const shortName = wp.name.length > 15 ? wp.name.substring(0, 13) + "…" : wp.name;
        this.ctx.fillText(shortName, pt.x, padT - 2);
      });
    }

    // 4. Draw Current Progress / Scrubber Needle
    const activePt = points[this.currentIndex];
    if (activePt) {
      // Vertical needle line
      this.ctx.beginPath();
      this.ctx.strokeStyle = "#E11D48";
      this.ctx.lineWidth = 1.8;
      this.ctx.moveTo(activePt.x, padT);
      this.ctx.lineTo(activePt.x, padT + gH);
      this.ctx.stroke();

      // Glowing hiker dot on profile curve
      this.ctx.beginPath();
      this.ctx.arc(activePt.x, activePt.y, 6.5, 0, Math.PI * 2);
      this.ctx.fillStyle = "#E11D48";
      this.ctx.fill();
      this.ctx.strokeStyle = "#FFFFFF";
      this.ctx.lineWidth = 2.5;
      this.ctx.stroke();
    }

    // 5. Draw Distance X-Axis markers at bottom
    this.ctx.fillStyle = "#94A3B8";
    this.ctx.font = "9px 'JetBrains Mono', monospace";
    this.ctx.textAlign = "center";
    const xIntervals = 5;
    for (let i = 0; i <= xIntervals; i++) {
      const dist = (this.hike.distanceKm * (i / xIntervals)).toFixed(1);
      const x = padL + (i / xIntervals) * gW;
      this.ctx.fillText(`${dist} km`, x, height - 8);
    }
  }
}
