// =====================
// BASIC SETUP
// =====================
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xffb6c1, 20, 200);

const camera = new THREE.PerspectiveCamera(
  70, window.innerWidth / window.innerHeight, 0.1, 500
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffb6c1);
document.body.appendChild(renderer.domElement);

// =====================
// LIGHTS
// =====================
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(10, 20, 10);
scene.add(sun);

// =====================
// PLAYER (Girl)
// =====================
const girl = new THREE.Mesh(
  new THREE.BoxGeometry(0.8, 1.6, 0.8),
  new THREE.MeshStandardMaterial({ color: 0xff69b4 })
);
girl.position.set(0, 0.8, 2);
scene.add(girl);

// =====================
// ROBO BOY
// =====================
const robo = new THREE.Mesh(
  new THREE.BoxGeometry(0.8, 1.6, 0.8),
  new THREE.MeshStandardMaterial({ color: 0x87cefa })
);
robo.position.set(1.5, 0.8, 4);
scene.add(robo);

// =====================
// ROAD
// =====================
const road = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 400),
  new THREE.MeshStandardMaterial({ color: 0x444444 })
);
road.rotation.x = -Math.PI / 2;
road.position.z = -200;
scene.add(road);

// =====================
// LEVEL SYSTEM
// =====================
let level = 1;
let score = 0;
let target = 10;

// =====================
// HEARTS (Shiny)
// =====================
let hearts = [];

function spawnHeart() {
  const heart = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff69b4,
      emissiveIntensity: 0.8
    })
  );
  heart.position.set((Math.random() - 0.5) * 6, 1, -120);
  scene.add(heart);
  hearts.push(heart);
}

// =====================
// CONTROLS (WASD)
// =====================
const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// =====================
// CAMERA
// =====================
camera.position.set(0, 5, 8);
camera.lookAt(0, 1, -20);

// =====================
// REWARDS
// =====================
const messageBox = document.getElementById("message");

function showMessage(text) {
  messageBox.innerHTML = text;
  messageBox.style.display = "block";
  setTimeout(() => messageBox.style.display = "none", 4000);
}

// Roses (Level 1)
const roses = [];
function spawnRoses() {
  for (let i = 0; i < 60; i++) {
    const rose = new THREE.Mesh(
      new THREE.SphereGeometry(0.2),
      new THREE.MeshStandardMaterial({ color: 0xff1493 })
    );
    rose.position.set(
      (Math.random() - 0.5) * 20,
      Math.random() * 10 + 5,
      Math.random() * -50
    );
    scene.add(rose);
    roses.push(rose);
  }
}

// Cats (Level 2)
const cats = [];
function spawnCats() {
  for (let i = 0; i < 6; i++) {
    const cat = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.5, 1),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    cat.position.set((Math.random() - 0.5) * 6, 0.3, -20 * i);
    scene.add(cat);
    cats.push(cat);
  }
}

// Lanterns (Finale)
const lanterns = [];
function spawnLanterns() {
  for (let i = 0; i < 200; i++) {
    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.25),
      new THREE.MeshStandardMaterial({ color: 0xffd700 })
    );
    lantern.position.set(
      (Math.random() - 0.5) * 80,
      Math.random() * 10,
      (Math.random() - 0.5) * 80
    );
    scene.add(lantern);
    lanterns.push(lantern);
  }
}

// =====================
// GAME LOOP
// =====================
function animate() {
  requestAnimationFrame(animate);

  // Movement
  if (keys["a"]) girl.position.x -= 0.08;
  if (keys["d"]) girl.position.x += 0.08;
  if (keys["w"]) girl.position.z -= 0.1;

  girl.position.x = THREE.MathUtils.clamp(girl.position.x, -3, 3);

  // Robo follows
  robo.position.x += (girl.position.x - robo.position.x) * 0.03;
  robo.position.z = girl.position.z + 2;

  // Hearts
  if (Math.random() < 0.03) spawnHeart();

  hearts.forEach((h, i) => {
    h.position.z += 0.4;
    h.rotation.y += 0.1;

    if (h.position.distanceTo(girl.position) < 1) {
      score++;
      document.getElementById("score").textContent = score;
      scene.remove(h);
      hearts.splice(i, 1);
    }
  });

  // LEVEL CHECKS
  if (level === 1 && score >= 10) {
    level = 2;
    target = 12;
    spawnRoses();
    showMessage("🌹 Congratulations 💖<br>I loveee you my tanuuuu…");
    document.getElementById("level").textContent = level;
  }

  if (level === 2 && score >= 22) {
    level = 3;
    target = 20;
    spawnCats();
    showMessage("🐱 Love multiplied with cats!");
    document.getElementById("level").textContent = level;
  }

  if (level === 3 && score >= 42 && lanterns.length === 0) {
    renderer.setClearColor(0xff9966); // sunset
    scene.fog.color.set(0xff9966);
    spawnLanterns();
    showMessage("💖 Valentine’s Finale 💖");
  }

  // Lantern rise
  lanterns.forEach(l => l.position.y += 0.02);

  renderer.render(scene, camera);
}

animate();

// =====================
// RESIZE
// =====================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
