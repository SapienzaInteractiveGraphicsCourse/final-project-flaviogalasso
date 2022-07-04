import * as THREE from '/build/three.module.js';
import Stats from './jsm/libs/stats.module.js';

import { OrbitControls } from './jsm/controls/OrbitControls.js';

import {RobotMesh} from './RobotMesh.js';
import {MapMesh} from './MapMesh.js';
import {MapHandler} from './MapHandler.js';
import { SkyBox } from './SkyBox.js'
import { PlayerHandler } from './PlayerHandler.js';
import {GameHandler} from './GameHandler.js';

const canvas = document.querySelector('.web-gl');

// showing fps
const stats = new Stats();
document.body.appendChild(stats.domElement);

//clock for physics
const clock = new THREE.Clock();

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


let SkyBoxEntity = new SkyBox("sky_sp_arcadia");
scene.background = SkyBoxEntity.skyboxTexture;

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

let Robot3DModel = new RobotMesh();
await Robot3DModel.loadModel();

let Map3DModel = new MapMesh();
await Map3DModel.loadModel();

let MapEntity = new MapHandler(Map3DModel,scene);

let playerPosition = new THREE.Vector3( 0, 5, 0 );
let PlayerRobot = new PlayerHandler(scene,playerPosition,Robot3DModel);



// Render Setup
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas,
});


renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
renderer.autoClear = false;
renderer.setClearColor = (0x000000, 0.0);
renderer.outputEncoding = THREE.sRGBEncoding;
console.log(renderer);

// Adding orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

// Starting Game Handler

const GameEntity = new GameHandler(PlayerRobot,MapEntity,controls,scene)
GameEntity.startIntro();

renderer.domElement.addEventListener("click", function(event){
    if(GameEntity.gameState == "Intro"){
        GameEntity.startGame();
    }
}, true);




// render function to render the scene
const render = ()=>{
    renderer.render(scene, camera);
}

// Recursion function for animation
const animate = ()=>{
    var clockDelta = clock.getDelta();
    requestAnimationFrame(animate);
    GameEntity.update(clockDelta);
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