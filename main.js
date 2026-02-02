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
   BOOTSTRAP
   ============================================================ */
const engine = new Engine();
const input = new InputManager();
const sceneManager = new SceneManager();

const girl = new PlayerGirl(input);
const robo = new RoboBoy(girl);

sceneManager.scene.add(girl.mesh);
sceneManager.scene.add(robo.mesh);

engine.register(girl);
engine.register(robo);

engine.start(sceneManager);
