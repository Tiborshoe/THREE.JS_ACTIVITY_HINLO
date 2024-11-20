import './style.css'; 
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import gsap from 'gsap';
import * as dat from 'lil-gui';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// Initialize fontLoader
const fontLoader = new FontLoader();

// Texture Loader
const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);

// Text geometry
fontLoader.load('./fonts/Montserrat_Regular.json', function (font) {
    const textGeometry = new TextGeometry('EARTH!!!', {
        font: font,
        size: 2,
        height: 2,
    });

    const textMaterial = new THREE.MeshStandardMaterial({ map: texture});
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    const boundingBox = new THREE.Box3().setFromObject(textMesh)
    const textWidth = boundingBox.max.x - boundingBox.min.x

    
    textMesh.position.set( -textWidth / 5, torus.position.y + 3, torus.position.z);


    textMesh.position.y += 2;
    textMesh.position.z -= 12;
    textMesh.position.x = -5;

    scene.add(textMesh);
});

// Textures
const texture = textureLoader.load('/TEXTURE/earth.png');
const waterBaseColor = textureLoader.load('./TEXTURE/Water_002_COLOR.jpg');
const waterNormalMap = textureLoader.load('./TEXTURE/Water_002_NORM.jpg');
const waterHeightMap = textureLoader.load('./TEXTURE/Water_002_DISP.png');
const waterRoughness = textureLoader.load('./TEXTURE/Water_002_ROUGH.jpg');
const waterAmbientOcclusion = textureLoader.load('./TEXTURE/Water_002_OCC.jpg');

// Debug GUI
const gui = new dat.GUI();

// Colors and Parameters
const parameters = {
    color: 0xdda0dd,
    spin: () => {
        gsap.to(meshGroup.rotation, { duration: 1, y: meshGroup.rotation.y + Math.PI * 2 });
    },
    wireframe: false,
    visible: true,
    animateObjects: () => {
        gsap.to(torus.rotation, { duration: 2, y: torus.rotation.y + Math.PI });
        gsap.to(sphere.position, { duration: 2, y: Math.random() * 2 - 1 });
    },
    switchCamera: () => {
        activeCamera = activeCamera === perspectiveCamera ? orthographicCamera : perspectiveCamera;
    },
};

// Canvas and Scene
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

// Background Texture
const spaceTexture = textureLoader.load('TEXTURE/space.jpg');
scene.background = spaceTexture;

// Create a group for objects
const meshGroup = new THREE.Group();
scene.add(meshGroup);

// Torus Object
const torusGeometry = new THREE.TorusGeometry(2, 0.2, 8, 50); 
const material = new THREE.MeshStandardMaterial({
    color: parameters.color,
    map: waterBaseColor,
    normalMap: waterNormalMap,
    displacementMap: waterHeightMap,
    displacementScale: 0.01,
    roughnessMap: waterRoughness,
    roughness: 0.5,
    aoMap: waterAmbientOcclusion,
});
const torus = new THREE.Mesh(torusGeometry, material);
meshGroup.add(torus);

// Sphere Object
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 16, 16),
    new THREE.MeshStandardMaterial({ map: texture, roughness: 0.5 })
);
sphere.position.x = 0; 
meshGroup.add(sphere);

// Lights
const pointLight = new THREE.PointLight(0xffffff, 1.2, 50);
pointLight.position.set(5, 5, 5);
const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
scene.add(pointLight, ambientLight);

// Random Stars
function addStar() {
    const geometry = new THREE.SphereGeometry(0.25, 2, 20);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const star = new THREE.Mesh(geometry, material);
    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
    star.position.set(x, y, z);
    scene.add(star);
}
Array(200).fill().forEach(addStar); 

// GUI Controls
gui.add(meshGroup.position, 'y').min(-3).max(3).step(0.01).name('Elevation');
gui.add(parameters, 'visible').onChange(() => {
    meshGroup.children.forEach((child) => {
        child.visible = parameters.visible;
    });
});
gui.add(parameters, 'wireframe').onChange(() => {
    meshGroup.children.forEach((child) => {
        child.material.wireframe = parameters.wireframe;
    });
});
gui.addColor(parameters, 'color').onChange(() => {
    meshGroup.children.forEach((child) => {
        child.material.color.set(parameters.color);
    });
});
gui.add(parameters, 'spin').name('Spin');
gui.add(parameters, 'animateObjects').name('Animate Objects');

// Add GUI Controls for Transformations
gui.add(torus.position, 'x').min(-5).max(5).step(0.1).name('Torus Position X');
gui.add(sphere.scale, 'x').min(0.1).max(3).step(0.1).name('Sphere Scale X');
gui.add(sphere.scale, 'y').min(0.1).max(3).step(0.1).name('Sphere Scale Y');

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

// Resize Handling
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    activeCamera.aspect = sizes.width / sizes.height;
    activeCamera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Fullscreen Handling
window.addEventListener('dblclick', () => {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
    if (!fullscreenElement) {
        canvas.requestFullscreen ? canvas.requestFullscreen() : canvas.webkitRequestFullscreen();
    } else {
        document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen();
    }
});

// Cameras
const perspectiveCamera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
perspectiveCamera.position.z = 5;

const orthographicCamera = new THREE.OrthographicCamera(
    -sizes.width / 200, sizes.width / 200,
    sizes.height / 200, -sizes.height / 200,
    0.1, 100
);
orthographicCamera.position.z = 5;

let activeCamera = perspectiveCamera;
scene.add(activeCamera);

// Controls
const controls = new OrbitControls(activeCamera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Animation Loop
const clock = new THREE.Clock();
const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    
    // Update objects
    sphere.rotation.y = 0.1 * elapsedTime; 
    torus.rotation.y = -0.1 * elapsedTime;
    sphere.rotation.x = 0.15 * elapsedTime;
    torus.rotation.x = -0.1 * elapsedTime;

    controls.update();

    renderer.render(scene, activeCamera);

    requestAnimationFrame(tick);
};
tick();
