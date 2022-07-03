import * as THREE from '/build/three.module.js';
import Stats from './jsm/libs/stats.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';

const canvas = document.querySelector('.web-gl');

// showing fps
const stats = new Stats();
document.body.appendChild(stats.domElement);

// Scene Setup
const scene = new THREE.Scene();
console.log(scene);

// Camera Setup
const fov = 45;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 1000;

const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 0, 25);
scene.add(camera);
console.log(camera);

//Light Setup
const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( directionalLight );

// Render Setup
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas,
    outputEncoding: THREE.sRGBEncoding
});


renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
renderer.autoClear = false;
renderer.setClearColor = (0x000000, 0.0);
renderer.outputEncoding = THREE.sRGBEncoding;
console.log(renderer);

// Adding orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

const loader = new GLTFLoader();
var droid_loaded = false;
var droid_model = null;

loader.load( './models/droid.gltf', function ( gltf ) {
    droid_loaded = true;
    droid_model = gltf.scene;
	scene.add( gltf.scene );
    console.log(gltf)

}, undefined, function ( error ) {
	console.error( error );
} );




// render function to render the scene
const render = ()=>{
    renderer.render(scene, camera);
}

// Recursion function for animation
const animate = ()=>{
    requestAnimationFrame(animate);
    if(droid_loaded){
        droid_model.getObjectByName("base_1").rotation.z += 0.1;
    }
    render();
    stats.update();
}
animate();

// Resizing window to make responsive
const windowResize = ()=>{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

window.addEventListener('resize', windowResize, false);