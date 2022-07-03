import * as THREE from '/build/three.module.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';

class MapMesh{
    constructor(){
        
    }
async loadModel(){
    this.loader = new GLTFLoader();
    this.data = await this.loader.loadAsync("./models/mars_tower.glb");
    this.mesh = this.data.scene;
    this.mesh.scale.copy(new THREE.Vector3(0.3,0.3,0.3))
    this.mesh.traverse(function ( child ) {
        if ( child instanceof THREE.Mesh ) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    console.log(this.mesh)
}

}

export{MapMesh};