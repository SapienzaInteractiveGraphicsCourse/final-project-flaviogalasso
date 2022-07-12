import * as THREE from '/build/three.module.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
class UfoMesh{
    constructor(){
        
    }
async loadModel(){
    this.loader = new GLTFLoader();
    this.gltfModel = await this.loader.loadAsync("./models/ufo.gltf");
    this.model = this.gltfModel;
    console.log(this.gltfModel);
    console.log(this.model)
    this.model.scene.traverse(function ( child ) {
        if ( child instanceof THREE.Mesh ) {
            child.castShadow = true;
            //child.receiveShadow = true;
        }
        if ( child instanceof THREE.SkinnedMesh ) {
            child.castShadow = true;
            //child.receiveShadow = true;
        }
    });
}
}

export{UfoMesh};