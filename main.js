/* ============================================================
   VALENTINE: NEON SKIES
   Phase 1 – Core Engine & Characters
   ============================================================ */

/* ============================================================
   CORE: ENGINE
   ============================================================ */
class Engine {
  constructor() {
    this.clock = new THREE.Clock();
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.updateables = [];
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x05010a);

    document.body.appendChild(this.renderer.domElement);
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.camera.position.set(0, 4, 8);
  }

  start(sceneManager) {
    this.scene = sceneManager.scene;
    this.initRenderer();
    this.initCamera();

    window.addEventListener("resize", () => this.onResize());

    this.animate();
  }

  register(updateable) {
    this.updateables.push(updateable);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    this.updateables.forEach(obj => obj.update(delta));

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

/* ============================================================
   CORE: INPUT MANAGER
   ============================================================ */
class InputManager {
  constructor() {
    this.keys = {};
    window.addEventListener("keydown", e => this.keys[e.key.toLowerCase()] = true);
    window.addEventListener("keyup", e => this.keys[e.key.toLowerCase()] = false);
  }

  isDown(key) {
    return this.keys[key.toLowerCase()] === true;
  }
}

/* ============================================================
   CORE: SCENE MANAGER
   ============================================================ */
class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x120014, 10, 120);
    this.setupLighting();
    this.setupEnvironment();
  }

  setupLighting() {
    const ambient = new THREE.AmbientLight(0xffc0cb, 0.4);
    this.scene.add(ambient);

    const neonSun = new THREE.DirectionalLight(0xff66cc, 1.2);
    neonSun.position.set(10, 20, 10);
    this.scene.add(neonSun);
  }

  setupEnvironment() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 500),
      new THREE.MeshStandardMaterial({
        color: 0x0a0014,
        metalness: 0.6,
        roughness: 0.3
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -200;
    this.scene.add(ground);
  }
}

/* ============================================================
   ENTITY: PLAYER GIRL
   ============================================================ */
class PlayerGirl {
  constructor(input) {
    this.input = input;
    this.speed = 6;

    this.mesh = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.4, 1.2, 4, 8),
      new THREE.MeshStandardMaterial({
        color: 0xff4fa3,
        emissive: 0x330011,
        emissiveIntensity: 0.8
      })
    );

    body.position.y = 1;
    this.mesh.add(body);
  }

  update(delta) {
    if (this.input.isDown("a")) this.mesh.position.x -= this.speed * delta;
    if (this.input.isDown("d")) this.mesh.position.x += this.speed * delta;
    if (this.input.isDown("w")) this.mesh.position.z -= this.speed * delta;

    this.mesh.position.x = THREE.MathUtils.clamp(this.mesh.position.x, -5, 5);
  }
}

/* ============================================================
   ENTITY: ROBO BOY (COMPANION AI)
   ============================================================ */
class RoboBoy {
  constructor(target) {
    this.target = target;

    this.mesh = new THREE.Group();

    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 1.4, 16),
      new THREE.MeshStandardMaterial({
        color: 0x66ffff,
        emissive: 0x003333,
        emissiveIntensity: 0.9
      })
    );

    core.position.y = 1;
    this.mesh.add(core);
  }

  update(delta) {
    const desired = this.target.mesh.position.clone();
    desired.z += 2;
    desired.x += 1.2;

    this.mesh.position.lerp(desired, 0.05);
  }
}
/* ============================================================
   ENVIRONMENT: FUTURISTIC CITY SYSTEM
   ============================================================ */
class NeonCity {
  constructor(scene) {
    this.scene = scene;
    this.buildings = [];
    this.spawnDistance = 400;
    this.buildCity();
  }

  buildCity() {
    for (let i = 0; i < 120; i++) {
      this.spawnBuilding(-8, -i * 8);
      this.spawnBuilding(8, -i * 8);
    }
  }

  spawnBuilding(x, z) {
    const height = THREE.MathUtils.randFloat(4, 16);

    const material = new THREE.MeshStandardMaterial({
      color: 0x110022,
      emissive: new THREE.Color(
        Math.random() * 0.5,
        Math.random() * 0.2,
        Math.random()
      ),
      emissiveIntensity: 1.5,
      metalness: 0.8,
      roughness: 0.2
    });

    const building = new THREE.Mesh(
      new THREE.BoxGeometry(4, height, 4),
      material
    );

    building.position.set(x, height / 2, z);
    this.scene.add(building);

    this.buildings.push({
      mesh: building,
      baseHeight: height,
      pulseOffset: Math.random() * Math.PI * 2
    });
  }

  update(delta) {
    this.buildings.forEach(b => {
      b.pulseOffset += delta;
      b.mesh.material.emissiveIntensity =
        1.2 + Math.sin(b.pulseOffset * 2) * 0.5;

      if (b.mesh.position.z > 10) {
        b.mesh.position.z -= this.spawnDistance;
      }
    });
  }
}
/* ============================================================
   ENVIRONMENT: WEATHER SYSTEM (PIXEL RAIN)
   ============================================================ */
class WeatherSystem {
  constructor(scene) {
    this.scene = scene;
    this.drops = [];
    this.maxDrops = 1200;
    this.initRain();
  }

  initRain() {
    const geometry = new THREE.BoxGeometry(0.05, 0.35, 0.05);
    const material = new THREE.MeshBasicMaterial({
      color: 0x88ccff
    });

    for (let i = 0; i < this.maxDrops; i++) {
      const drop = new THREE.Mesh(geometry, material);
      drop.position.set(
        (Math.random() - 0.5) * 60,
        Math.random() * 40 + 5,
        -Math.random() * 400
      );

      this.scene.add(drop);
      this.drops.push(drop);
    }
  }

  update(delta) {
    this.drops.forEach(d => {
      d.position.y -= delta * 30;
      d.position.z += delta * 40;

      if (d.position.y < 0) {
        d.position.y = Math.random() * 40 + 20;
        d.position.z -= 400;
      }
    });
  }
}
/* ============================================================
   ENVIRONMENT: SKY SYSTEM
   ============================================================ */
class SkySystem {
  constructor(scene) {
    this.scene = scene;

    const geometry = new THREE.SphereGeometry(300, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x090014,
      side: THREE.BackSide
    });

    this.sky = new THREE.Mesh(geometry, material);
    this.scene.add(this.sky);
  }

  update(delta) {
    // Subtle sky breathing
    const t = Date.now() * 0.0001;
    this.sky.material.color.setHSL(0.78, 0.4, 0.05 + Math.sin(t) * 0.01);
  }
}
/* ============================================================
   BOOTSTRAP
   ============================================================ */
const engine = new Engine();
const input = new InputManager();
const sceneManager = new SceneManager();

// Systems
const city = new NeonCity(sceneManager.scene);
const weather = new WeatherSystem(sceneManager.scene);
const sky = new SkySystem(sceneManager.scene);

// Characters
const girl = new PlayerGirl(input);
const robo = new RoboBoy(girl);

sceneManager.scene.add(girl.mesh);
sceneManager.scene.add(robo.mesh);

// Register updates
engine.register(girl);
engine.register(robo);
engine.register(city);
engine.register(weather);
engine.register(sky);

// Start
engine.start(sceneManager);
