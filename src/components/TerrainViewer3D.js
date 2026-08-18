import * as THREE from 'three';

/**
 * High-Precision 3D Mountain Massif & Trail Replay Component
 * Features authentic peak morphology shaders, zero-clipping surface alignment,
 * anti-collision chase cameras, and dynamic alpine lighting.
 */
export class TerrainViewer3D {
  constructor(containerEl, onWaypointClick) {
    this.container = containerEl;
    this.onWaypointClick = onWaypointClick;
    this.hike = null;
    this.currentIndex = 0;
    this.cameraMode = "chase"; // "chase", "orbit", "topo"

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.terrainMesh = null;
    this.trailTube = null;
    this.hikerMarker = null;
    this.waypointMarkers = [];
    this.splinePoints = [];
    this.curve = null;

    // Mouse / Touch rotation control state
    this.isMouseDown = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotationY = 0.5;
    this.targetRotationX = 0.55;
    this.currentRotationY = 0.5;
    this.currentRotationX = 0.55;
    this.zoomLevel = 1.0;
    this.targetZoom = 1.0;

    this.animId = null;
    this.initThree();
    this.setupInteractions();
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xF5F2EC); // Crisp alpine paper background

    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 500;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 35, 55);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // Warm natural mountain sunlight
    const ambientLight = new THREE.AmbientLight(0xFFFBEB, 0.9);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xFFEDD5, 1.4);
    sunLight.position.set(45, 90, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    this.scene.add(sunLight);

    const skyFillLight = new THREE.DirectionalLight(0xE0F2FE, 0.5);
    skyFillLight.position.set(-45, 40, -40);
    this.scene.add(skyFillLight);

    // Clean subtle base grid
    const grid = new THREE.GridHelper(90, 30, 0xCBD5E1, 0xE2E8F0);
    grid.position.y = -0.5;
    this.scene.add(grid);

    window.addEventListener("resize", () => this.onResize());
    this.animate();
  }

  setupInteractions() {
    const el = this.renderer.domElement;

    el.addEventListener("mousedown", (e) => {
      this.isMouseDown = true;
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isMouseDown) return;
      const deltaX = e.clientX - this.mouseX;
      const deltaY = e.clientY - this.mouseY;
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      if (this.cameraMode === "orbit") {
        this.targetRotationY += deltaX * 0.007;
        this.targetRotationX = Math.max(0.12, Math.min(Math.PI / 2.1, this.targetRotationX + deltaY * 0.007));
      }
    });

    window.addEventListener("mouseup", () => {
      this.isMouseDown = false;
    });

    el.addEventListener("wheel", (e) => {
      e.preventDefault();
      this.targetZoom = Math.max(0.45, Math.min(2.2, this.targetZoom + e.deltaY * 0.0012));
    }, { passive: false });

    // Touch handlers
    let touchStartDist = 0;
    el.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        this.isMouseDown = true;
        this.mouseX = e.touches[0].clientX;
        this.mouseY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });

    el.addEventListener("touchmove", (e) => {
      if (e.touches.length === 1 && this.isMouseDown) {
        const deltaX = e.touches[0].clientX - this.mouseX;
        const deltaY = e.touches[0].clientY - this.mouseY;
        this.mouseX = e.touches[0].clientX;
        this.mouseY = e.touches[0].clientY;
        if (this.cameraMode === "orbit") {
          this.targetRotationY += deltaX * 0.008;
          this.targetRotationX = Math.max(0.12, Math.min(Math.PI / 2.1, this.targetRotationX + deltaY * 0.008));
        }
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const diff = dist - touchStartDist;
        this.targetZoom = Math.max(0.45, Math.min(2.2, this.targetZoom - diff * 0.005));
        touchStartDist = dist;
      }
    }, { passive: true });

    el.addEventListener("touchend", () => {
      this.isMouseDown = false;
    });
  }

  setHike(hike) {
    this.hike = hike;
    this.currentIndex = 0;
    this.buildTerrainAndTrail();
  }

  /**
   * Terrain height calculation matching the actual mountain morphology
   */
  getMountainHeight(x, z, hike) {
    const type = hike.mountainType || "alpine_pass";
    const distFromCenter = Math.hypot(x, z);

    let height = 0;

    switch (type) {
      case "volcano_cone": {
        // Mount Fuji: Symmetrical stratovolcano with steep cone and summit crater
        const coneRadius = 26;
        if (distFromCenter < coneRadius) {
          const u = distFromCenter / coneRadius;
          height = 18 * Math.pow(1 - u, 1.4);
          // Summit crater depression
          if (distFromCenter < 3.2) {
            height -= (3.2 - distFromCenter) * 1.6;
          }
        }
        // Micro-relief volcanic gullies
        height += Math.sin(Math.atan2(z, x) * 12) * Math.min(1.2, height * 0.1);
        break;
      }

      case "dome_cliff": {
        // Half Dome: High rounded granite dome with vertical sheer cliff on NW
        const domeCenter = new THREE.Vector2(4, -4);
        const d = domeCenter.distanceTo(new THREE.Vector2(x, z));
        if (d < 24) {
          const u = d / 24;
          height = 19 * Math.cos((u * Math.PI) / 2);
          // Sheer vertical northwest cliff drop
          if (x < 3 && z < -3) {
            height *= Math.max(0.1, 1 - (3 - x) * 0.5);
          }
        }
        // Little Yosemite valley & Subdome ridge
        height += Math.sin(x * 0.15) * Math.cos(z * 0.15) * 1.5;
        break;
      }

      case "dolomite_towers": {
        // Tre Cime di Lavaredo: High scree plateau + 3 giant limestone monoliths
        const plateauBase = 6.5;
        // Tower 1 (Cima Grande): Center
        const t1Dist = Math.hypot(x - 2, z - 2);
        const t1 = Math.max(0, 15 - t1Dist * 3.8);

        // Tower 2 (Cima Ovest): West
        const t2Dist = Math.hypot(x + 7, z - 1);
        const t2 = Math.max(0, 13.5 - t2Dist * 3.6);

        // Tower 3 (Cima Piccola): East
        const t3Dist = Math.hypot(x - 9, z - 3);
        const t3 = Math.max(0, 11 - t3Dist * 3.5);

        // Scree skirts & base terrain
        const scree = Math.max(0, 4 - distFromCenter * 0.15);
        height = plateauBase + Math.max(t1, t2, t3) + scree;
        break;
      }

      case "patagonia_spires": {
        // Fitz Roy: River valley rising to steep moraine and jagged granite needles
        const valleyProgress = Math.max(0, (z + 20) / 40);
        const moraine = Math.pow(valleyProgress, 2.2) * 12;

        // Needle spires behind lagoon (NW corner)
        const spireDist = Math.hypot(x + 10, z + 12);
        const spire = Math.max(0, 20 - spireDist * 2.2);

        height = moraine + spire + Math.sin(x * 0.2) * Math.cos(z * 0.2) * 1.2;
        break;
      }

      case "alpine_pass":
      default: {
        // Grand Col Ferret / Alpine Pass: Deep U-shaped glacial valley between high massif walls
        const wallLateral = Math.abs(x) * 0.45;
        const passAscent = Math.max(0, (z + 18) / 36) * 13;
        const valleyFloor = passAscent + wallLateral;
        height = valleyFloor + Math.sin(x * 0.18 + 0.5) * Math.cos(z * 0.18) * 1.8;
        break;
      }
    }

    return Math.max(0, height);
  }

  buildTerrainAndTrail() {
    if (!this.hike || !this.hike.track) return;

    // Clean previous scene objects
    if (this.terrainMesh) this.scene.remove(this.terrainMesh);
    if (this.trailTube) this.scene.remove(this.trailTube);
    if (this.hikerMarker) this.scene.remove(this.hikerMarker);
    this.waypointMarkers.forEach(m => this.scene.remove(m));
    this.waypointMarkers = [];

    const track = this.hike.track;

    // 1. Determine geographic bounds
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    track.forEach(p => {
      minLat = Math.min(minLat, p.lat);
      maxLat = Math.max(maxLat, p.lat);
      minLng = Math.min(minLng, p.lng);
      maxLng = Math.max(maxLng, p.lng);
    });

    const spanLat = (maxLat - minLat) || 0.01;
    const spanLng = (maxLng - minLng) || 0.01;

    const mapX = (lng) => ((lng - minLng) / spanLng - 0.5) * 44;
    const mapZ = (lat) => -((lat - minLat) / spanLat - 0.5) * 44;

    // 2. Build 3D Mountain Mesh using morphology formula
    const gridRes = 72;
    const planeGeo = new THREE.PlaneGeometry(64, 64, gridRes, gridRes);
    planeGeo.rotateX(-Math.PI / 2);

    const pos = planeGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const h = this.getMountainHeight(vx, vz, this.hike);
      pos.setY(i, h);
    }
    planeGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0xE5DFD5,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true
    });

    this.terrainMesh = new THREE.Mesh(planeGeo, terrainMat);
    this.terrainMesh.receiveShadow = true;
    this.scene.add(this.terrainMesh);

    // 3. Build Trail Spline strictly floating cleanly on the mountain surface (+0.42m clearance)
    this.splinePoints = track.map(p => {
      const x = mapX(p.lng);
      const z = mapZ(p.lat);
      const surfaceY = this.getMountainHeight(x, z, this.hike);
      return new THREE.Vector3(x, surfaceY + 0.42, z);
    });

    this.curve = new THREE.CatmullRomCurve3(this.splinePoints);

    // Build glowing 3D trail tube
    const tubeGeo = new THREE.TubeGeometry(this.curve, 120, 0.38, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0xE11D48,
      emissive: 0xBE123C,
      emissiveIntensity: 0.55,
      roughness: 0.25,
      metalness: 0.1
    });

    this.trailTube = new THREE.Mesh(tubeGeo, tubeMat);
    this.trailTube.castShadow = true;
    this.scene.add(this.trailTube);

    // 4. Create Hiker Beacon (Pulsing halo & beacon sphere)
    const beaconGroup = new THREE.Group();

    const coreGeo = new THREE.SphereGeometry(0.85, 16, 16);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xE11D48,
      emissive: 0xFF0033,
      emissiveIntensity: 0.9
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    beaconGroup.add(coreMesh);

    const ringGeo = new THREE.RingGeometry(0.9, 1.4, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xE11D48,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.name = "haloRing";
    beaconGroup.add(ringMesh);

    const beaconLight = new THREE.PointLight(0xFF2255, 2.0, 14);
    beaconLight.position.y = 1.8;
    beaconGroup.add(beaconLight);

    this.hikerMarker = beaconGroup;
    this.scene.add(this.hikerMarker);

    // 5. Waypoint 3D Flag Pins
    if (this.hike.waypoints) {
      this.hike.waypoints.forEach((wp) => {
        const wpIdx = Math.min(this.splinePoints.length - 1, wp.index);
        const pt = this.splinePoints[wpIdx];
        if (!pt) return;

        const wpGroup = new THREE.Group();
        wpGroup.position.set(pt.x, pt.y, pt.z);

        const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.8, 8);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 1.9;
        wpGroup.add(pole);

        const isSummit = wp.type === "summit";
        const pinGeo = isSummit ? new THREE.ConeGeometry(1.1, 1.5, 6) : new THREE.SphereGeometry(0.65, 12, 12);
        const pinMat = new THREE.MeshStandardMaterial({
          color: isSummit ? 0xE11D48 : 0xD97706,
          emissive: isSummit ? 0xBE123C : 0x92400E,
          emissiveIntensity: 0.5
        });
        const pin = new THREE.Mesh(pinGeo, pinMat);
        pin.position.y = 3.8;
        if (isSummit) pin.rotateZ(Math.PI);
        wpGroup.add(pin);

        this.waypointMarkers.push(wpGroup);
        this.scene.add(wpGroup);
      });
    }

    this.updateHikerPosition(0);
  }

  setCameraMode(mode) {
    this.cameraMode = mode;
    if (mode === "topo") {
      this.targetRotationX = Math.PI / 2.05;
      this.targetRotationY = 0;
    } else if (mode === "orbit") {
      this.targetRotationX = 0.55;
      this.targetRotationY = 0.5;
    }
  }

  setCurrentIndex(index) {
    this.currentIndex = Math.max(0, Math.min(this.splinePoints.length - 1, index));
    this.updateHikerPosition(this.currentIndex);
  }

  updateHikerPosition(index) {
    if (!this.hikerMarker || !this.splinePoints[index]) return;
    const pt = this.splinePoints[index];
    this.hikerMarker.position.set(pt.x, pt.y + 0.5, pt.z);
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    this.animId = requestAnimationFrame(() => this.animate());

    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.08;
    this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.08;
    this.zoomLevel += (this.targetZoom - this.zoomLevel) * 0.08;

    const time = performance.now() * 0.003;

    // Animate beacon pulse
    if (this.hikerMarker) {
      const halo = this.hikerMarker.getObjectByName("haloRing");
      if (halo) {
        const scale = 1 + Math.sin(time * 3.5) * 0.25;
        halo.scale.set(scale, scale, scale);
      }
    }

    // Camera Positioning with Anti-Clipping Surface Check
    if (this.cameraMode === "chase" && this.splinePoints[this.currentIndex]) {
      const currentPt = this.splinePoints[this.currentIndex];
      const nextIdx = Math.min(this.splinePoints.length - 1, this.currentIndex + 2);
      const forwardPt = this.splinePoints[nextIdx];
      
      let dir = new THREE.Vector3().subVectors(forwardPt, currentPt).normalize();
      if (dir.length() < 0.01) dir.set(0, 0, 1);

      // Desired camera position behind & above hiker
      const targetCamPos = new THREE.Vector3()
        .copy(currentPt)
        .sub(dir.clone().multiplyScalar(15 * this.zoomLevel))
        .add(new THREE.Vector3(0, 8.5 * this.zoomLevel, 0));

      // Surface Clearance: never let camera drop below the mountain terrain
      if (this.hike) {
        const minSafeY = this.getMountainHeight(targetCamPos.x, targetCamPos.z, this.hike) + 3.8;
        if (targetCamPos.y < minSafeY) {
          targetCamPos.y = minSafeY;
        }
      }

      this.camera.position.lerp(targetCamPos, 0.06);
      this.camera.lookAt(currentPt.x, currentPt.y + 1.5, currentPt.z);
    } else {
      // Orbit / Topo mode
      const radius = 58 * this.zoomLevel;
      const camY = Math.sin(this.currentRotationX) * radius;
      const horizontalDist = Math.cos(this.currentRotationX) * radius;
      const camX = Math.sin(this.currentRotationY) * horizontalDist;
      const camZ = Math.cos(this.currentRotationY) * horizontalDist;

      this.camera.position.set(camX, Math.max(6, camY + 6), camZ);
      this.camera.lookAt(0, 6, 0);
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
  }
}
