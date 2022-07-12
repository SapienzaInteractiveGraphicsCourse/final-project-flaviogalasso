import * as THREE from '/build/three.module.js';
import Stats from './jsm/libs/stats.module.js';

import { OrbitControls } from './jsm/controls/OrbitControls.js';

import {RobotMesh} from './RobotMesh.js';
import {AlienMesh} from './AlienMesh.js';
import {UfoMesh} from './UfoMesh.js';

import {MapMesh} from './MapMesh.js';
import {MapHandler} from './MapHandler.js';
import { SkyBox } from './SkyBox.js'
import {GameHandler} from './GameHandler.js';

import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { GlitchPass } from './jsm/postprocessing/GlitchPass.js';
import {FilmPass} from './jsm/postprocessing/FilmPass.js';

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

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.6 );
directionalLight.position.set(40,40,0);
directionalLight.castShadow = true; 
console.log(directionalLight);
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
directionalLight.shadow.bias = -0.005;

directionalLight.shadow.mapSize.width = 3000; // default
directionalLight.shadow.mapSize.height = 3000; // default
directionalLight.shadow.camera.near = 0.5; // default
directionalLight.shadow.camera.far = 500; // default

const lightZeroObject = new THREE.Object3D()
lightZeroObject.position.set(0,0,1);
directionalLight.target = lightZeroObject;
scene.add(lightZeroObject)

scene.add( directionalLight );
const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
//scene.add( helper );


let SkyBoxEntity = new SkyBox("sky_sp_arcadia");
scene.background = SkyBoxEntity.skyboxTexture;

const axesHelper = new THREE.AxesHelper( 5 );
//scene.add( axesHelper );

let Robot3DModel = new RobotMesh();
await Robot3DModel.loadModel();

let Alien3DModel = new AlienMesh();
await Alien3DModel.loadModel();

let Ufo3DModel = new UfoMesh();
await Ufo3DModel.loadModel();

let Map3DModel = new MapMesh();
await Map3DModel.loadModel();

let MapEntity = new MapHandler(Map3DModel,scene);


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
renderer.shadowMap.enabled = true
console.log(renderer);

const composer = new EffectComposer( renderer );


// Adding orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

// Starting Game Handler

const GameEntity = new GameHandler(Robot3DModel,Alien3DModel,Ufo3DModel,MapEntity,controls,composer,scene)
GameEntity.startIntro();

renderer.domElement.addEventListener("click", function(event){
    if(GameEntity.gameState == "Intro"){
        GameEntity.startGame();
    }
}, true);


const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );

const glitchPass = new FilmPass();
composer.addPass( glitchPass );


composer.passes[0].renderToScreen = true;
composer.passes[1].enabled = false;

// render function to render the scene
const render = ()=>{

    composer.render();
    //renderer.render(scene, camera);
}


// Recursion function for animation
const animate = ()=>{
    var clockDelta = clock.getDelta();
    requestAnimationFrame(animate);
    TWEEN.update();
    GameEntity.update(clockDelta);
    render();
    GameEntity.HudHandler.renderHUD(renderer);
    stats.update();
}
animate();


// Resizing window to make responsive
const windowResize = ()=>{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    GameEntity.HudHandler.reloadDimensions(window.innerWidth, window.innerHeight);
    render();
}

window.addEventListener('resize', windowResize, false);