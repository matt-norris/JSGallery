import * as THREE from './node_modules/three/build/three.module.js';
let scene, camera, renderer, raycaster;
const canvas = document.querySelector('#gallery-canvas');
const cameraRotation = new THREE.Euler(0, 0, 0, 'YXZ');
function init() {
    // Create the scene
    scene = new THREE.Scene();
    raycaster = new THREE.Raycaster();
    // Create ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Create point lights
    const pointLight1 = new THREE.PointLight(0xffffff, 0.8);
    pointLight1.position.set(0, 3, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.8);
    pointLight2.position.set(5, 3, 5);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffffff, 0.8);
    pointLight3.position.set(-5, 3, 5);
    scene.add(pointLight3);


    // Create the camera
    const aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .5, 500);
    camera.position.set(0, 1.5, 5);
  
    // Create the renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
  
    createGallery();

    addArtwork('/art.jpeg', 2, 1.5, new THREE.Vector3(0, 2, -9.75), new THREE.Euler(0, 0, 0));
    addArtwork('/art.jpeg', 1.5, 1, new THREE.Vector3(9.75, 2, -5), new THREE.Euler(0, -Math.PI / 2, 0));
    addArtwork('/art.jpeg', 1.5, 1, new THREE.Vector3(-9.75, 2, 5), new THREE.Euler(0, Math.PI / 2, 0));

    setupControls();
    setupMouseControls();
    
    // Add window resize listener
    window.addEventListener('resize', onWindowResize);
    const loadingScreen = document.getElementById('loading-screen');


    loadingScreen.style.display = 'none';
  }
  
function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

function animate() {
  requestAnimationFrame(animate);

  // Calculate the camera's forward direction
  const forwardDirection = new THREE.Vector3();
  camera.getWorldDirection(forwardDirection);
  forwardDirection.normalize();

  // Calculate the camera's right direction
  const rightDirection = new THREE.Vector3();
  rightDirection.crossVectors(forwardDirection, camera.up);
  rightDirection.normalize();

  // Handle user movement
  if (keysPressed['w'] || keysPressed['W'] || keysPressed['ArrowUp']) {
    camera.position.addScaledVector(forwardDirection, moveSpeed);
  }
  if (keysPressed['s'] || keysPressed['S'] || keysPressed['ArrowDown']) {
    camera.position.addScaledVector(forwardDirection, -moveSpeed);
  }

  // Handle keyboard-based camera rotation
  if (keysPressed['a'] || keysPressed['A'] || keysPressed['ArrowLeft']) {
    camera.rotation.y += moveSpeed;
  }
  if (keysPressed['d'] || keysPressed['D'] || keysPressed['ArrowRight']) {
    camera.rotation.y -= moveSpeed;
  }

  renderer.render(scene, camera);
}

  
function createGallery() {
    // Create the gallery walls, floor, and ceiling
    // Create the floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    scene.add(floor);

    // Create gallery walls
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const wallHeight = 4;

    const wall1Geometry = new THREE.BoxGeometry(20, wallHeight, 0.5);
    const wall1 = new THREE.Mesh(wall1Geometry, wallMaterial);
    wall1.position.set(0, wallHeight / 2, -10);
    scene.add(wall1);

    const wall2Geometry = new THREE.BoxGeometry(20, wallHeight, 0.5);
    const wall2 = new THREE.Mesh(wall2Geometry, wallMaterial);
    wall2.position.set(0, wallHeight / 2, 10);
    scene.add(wall2);

    const wall3Geometry = new THREE.BoxGeometry(0.5, wallHeight, 20);
    const wall3 = new THREE.Mesh(wall3Geometry, wallMaterial);
    wall3.position.set(-10, wallHeight / 2, 0);
    scene.add(wall3);

    const wall4Geometry = new THREE.BoxGeometry(0.5, wallHeight, 20);
    const wall4 = new THREE.Mesh(wall4Geometry, wallMaterial);
    wall4.position.set(10, wallHeight / 2, 0);
    scene.add(wall4);

    // Create the ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(20, 20);
    const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = wallHeight;
    scene.add(ceiling);
    }

  function addArtwork(imagePath, width, height, position, rotation) {
    // Load the texture and create the artwork mesh
    const loader = new THREE.TextureLoader();
    loader.load(imagePath, (texture) => {
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
    
      const artworkGeometry = new THREE.PlaneGeometry(width, height);
      const artworkMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
    const artwork = new THREE.Mesh(artworkGeometry, artworkMaterial);

    artwork.position.copy(position);
    artwork.rotation.copy(rotation);

    scene.add(artwork);
    });
  }

  function setupControls() {
    // Set up keyboard controls
    window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);
  }

  const moveSpeed = 0.1;
const keysPressed = {};
  function onKeyDown(event) {
    keysPressed[event.key] = true;
  }
  
  function onKeyUp(event) {
    keysPressed[event.key] = false;
  }

  
  
  function moveCamera(direction, speed) {
    const newPosition = camera.position.clone().addScaledVector(direction, speed);
  
    // Set the raycaster's origin and direction
    raycaster.set(newPosition, direction);
  
    // Check for intersections with objects in the scene
    const intersects = raycaster.intersectObjects(scene.children, true);
  
    // If no intersections are found, move the camera
    if (intersects.length === 0) {
      camera.position.copy(newPosition);
    }
    raycaster.set(newPosition, direction);
  }
  

  function setupMouseControls() {
    // Set up mouse controls
    window.addEventListener('mousemove', onMouseMove);
  }
  let mouseX = 0;
let mouseY = 0;
const mouseSensitivity = 0.005;

function onMouseMove(event) {
  mouseX = event.clientX - window.innerWidth / 2;
  mouseY = event.clientY - window.innerHeight / 2;
}

init();
animate();
