// Simple Three.js top-down demo with spawn zones derived from your uploaded map.png.
// Save map.png in the same folder. Open index.html to run.

(() => {
  // Basic scene setup
  const canvas = document.getElementById('glcanvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setClearColor(0x07121a);
  renderer.setSize(900, 600, false);

  // Use Orthographic camera for top-down arena view
  const viewWidth = 900, viewHeight = 600;
  const aspect = viewWidth / viewHeight;
  const camSize = 450; // world units half-size
  const camera = new THREE.OrthographicCamera(-camSize * aspect, camSize * aspect, camSize, -camSize, 0.1, 2000);
  camera.position.set(0, 900, 0);
  camera.up.set(0, 0, -1);
  camera.lookAt(0, 0, 0);

  const scene = new THREE.Scene();

  // Lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
  hemi.position.set(0, 200, 0);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(200, 400, 300);
  scene.add(dir);

  // Map texture as ground plane
  const loader = new THREE.TextureLoader();
  const mapTexture = loader.load('map.png', (t) => {
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    renderer.render(scene, camera);
  });

  // We'll use a ground plane whose world size matches 900x600 (matching earlier 2D layout).
  const worldW = 900, worldH = 600;
  const planeGeo = new THREE.PlaneGeometry(worldW, worldH);
  const planeMat = new THREE.MeshBasicMaterial({ map: mapTexture });
  const plane = new THREE.Mesh(planeGeo, planeMat);
  plane.rotation.x = -Math.PI / 2; // make it horizontal
  scene.add(plane);

  // spawn zones: coordinates correspond to 2D pixel-like positions in a 900x600 canvas; we convert to world (centered)
  // These were derived from your map preview and laid out to match the A..H + Center arrangement.
  // If you need exact locations, open mapper.html and adjust visually, then paste the exported JSON here.
  let spawnZones = [
    { name: 'A', px: 160, py: 90, r: 60 },
    { name: 'B', px: 460, py: 90, r: 60 },
    { name: 'C', px: 760, py: 120, r: 60 },
    { name: 'D', px: 760, py: 360, r: 60 },
    { name: 'E', px: 140, py: 360, r: 60 },
    { name: 'F', px: 760, py: 520, r: 60 },
    { name: 'G', px: 460, py: 520, r: 60 },
    { name: 'H', px: 140, py: 520, r: 60 },
    { name: 'Center', px: 460, py: 300, r: 90 }
  ];

  // Convert pixel-like coords (origin top-left) to world coords centered on plane:
  function pxToWorld(px, py) {
    // px range 0..900 left->right, py 0..600 top->bottom
    const wx = px - worldW / 2;
    const wz = -(py - worldH / 2); // invert Y to Z
    return { x: wx, y: 0.5, z: wz };
  }

  // Group to hold markers
  const markers = new THREE.Group();
  scene.add(markers);

  function drawZoneMarkers() {
    // clear markers
    while (markers.children.length) markers.remove(markers.children[0]);

    spawnZones.forEach(z => {
      const world = pxToWorld(z.px, z.py);
      // cylinder marker
      const geo = new THREE.CylinderGeometry(z.r * 0.12, z.r * 0.12, 8, 16);
      const mat = new THREE.MeshStandardMaterial({ color: 0xffcc33, transparent: true, opacity: 0.9 });
      const cyl = new THREE.Mesh(geo, mat);
      cyl.position.set(world.x, 4, world.z);
      cyl.rotation.x = Math.PI / 2;
      markers.add(cyl);

      // circle on plane (wire)
      const circleGeo = new THREE.RingGeometry(z.r * 0.9, z.r * 1.05, 32);
      const circleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.12 });
      const ring = new THREE.Mesh(circleGeo, circleMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(world.x, 0.2, world.z);
      markers.add(ring);

      // label (sprite)
      const canvasLabel = document.createElement('canvas');
      canvasLabel.width = 128; canvasLabel.height = 32;
      const ctx = canvasLabel.getContext('2d');
      ctx.fillStyle = 'rgba(255,204,51,0.95)';
      ctx.font = '18px sans-serif';
      ctx.fillText(z.name, 8, 20);
      const tex = new THREE.CanvasTexture(canvasLabel);
      const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
      const sp = new THREE.Sprite(spriteMat);
      sp.position.set(world.x, 14, world.z);
      sp.scale.set(40, 10, 1);
      markers.add(sp);
    });
  }
  drawZoneMarkers();

  // Simple enemy container and spawner
  const enemies = [];
  const enemyGroup = new THREE.Group(); scene.add(enemyGroup);
  const enemyMat = new THREE.MeshStandardMaterial({ color: 0xff6b6b });

  function spawnEnemyFromZone(zoneName) {
    let zone;
    if (zoneName) zone = spawnZones.find(z => z.name === zoneName);
    else zone = spawnZones[Math.floor(Math.random() * spawnZones.length)];
    // pick a random point in zone circle
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * zone.r * 0.9;
    const px = zone.px + Math.cos(a) * r;
    const py = zone.py + Math.sin(a) * r;
    const w = pxToWorld(px, py);
    const geo = new THREE.BoxGeometry(20, 36, 20);
    const mesh = new THREE.Mesh(geo, enemyMat.clone());
    mesh.position.set(w.x, 18, w.z);
    enemyGroup.add(mesh);

    enemies.push({
      mesh,
      target: { x: 0, z: 0 }, // will aim for player (0,0) in this demo
      hp: 100,
      zone: zone.name
    });

    document.getElementById('spawnCount').textContent = enemies.length;
  }

  // spawn controls
  document.getElementById('spawnNow').addEventListener('click', () => spawnEnemyFromZone());
  document.getElementById('openMapper').addEventListener('click', () => {
    window.open('mapper.html', '_blank');
    alert('Mapper opened in a new tab. Edit and export JSON, then replace spawnZones in app.js (or refresh this page after saving spawnZones.json).');
  });

  // Simple player marker (center)
  const playerGeo = new THREE.ConeGeometry(14, 28, 12);
  const playerMat = new THREE.MeshStandardMaterial({ color: 0x6cc3ff });
  const playerMesh = new THREE.Mesh(playerGeo, playerMat);
  playerMesh.rotation.x = Math.PI; // point down
  playerMesh.position.set(0, 14, 0);
  scene.add(playerMesh);

  // Basic enemy AI: move toward player on XZ plane
  function updateEnemies(dt) {
    enemies.forEach((e) => {
      const mx = playerMesh.position.x - e.mesh.position.x;
      const mz = playerMesh.position.z - e.mesh.position.z;
      const d = Math.hypot(mx, mz);
      if (d > 22) {
        const nx = mx / d, nz = mz / d;
        e.mesh.position.x += nx * 60 * dt;
        e.mesh.position.z += nz * 60 * dt;
      } else {
        // reached player: simple damage or pop
        // just change color briefly
        e.mesh.material.color.setHex(0xffee66);
      }
    });
  }

  // Animation loop
  let last = performance.now();
  function animate(ts) {
    requestAnimationFrame(animate);
    const now = performance.now();
    const dt = (now - last) / 1000;
    last = now;

    updateEnemies(dt);
    renderer.render(scene, camera);
  }
  animate();

  // Basic responsiveness
  function fitCanvas() {
    const wrap = document.getElementById('canvas-wrap');
    const rect = wrap.getBoundingClientRect();
    const w = Math.min(window.innerWidth - 24, 1100);
    const h = Math.min(window.innerHeight - 120, 740);
    renderer.setSize(w, h);
    // Update camera frustum to keep scale consistent:
    const aspect = w / h;
    camera.left = -camSize * aspect; camera.right = camSize * aspect;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', fitCanvas);
  fitCanvas();

  // If you want to auto-load spawnZones from a JSON file (mapper export), attempt to fetch spawnZones.json
  fetch('spawnZones.json').then(r => {
    if (!r.ok) throw new Error('no spawnZones.json');
    return r.json();
  }).then(data => {
    if (Array.isArray(data)) {
      spawnZones = data;
      drawZoneMarkers();
      console.log('Loaded spawnZones.json from map editor.');
    }
  }).catch(() => { /* ignore */ });

  // Expose spawn function for console testing
  window._SBG = { spawnEnemyFromZone, spawnZones, enemies, drawZoneMarkers };
})();
