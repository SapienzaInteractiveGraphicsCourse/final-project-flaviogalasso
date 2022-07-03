import * as THREE from '/build/three.module.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
class RobotMesh{
    constructor(){
        
    }
async loadModel(){
    this.loader = new GLTFLoader();
    this.data = await this.loader.loadAsync("./models/droid.gltf");
    this.model = this.data.scene;

    
    this.model.traverse(function ( child ) {
        if ( child instanceof THREE.Mesh ) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    console.log(this.model)
}
}

export{RobotMesh};