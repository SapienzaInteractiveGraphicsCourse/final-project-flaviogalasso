import * as THREE from '/build/three.module.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
class AlienMesh{
    constructor(){
        
    }
async loadModel(){
    this.loader = new GLTFLoader();
    this.gltfModel = await this.loader.loadAsync("./models/alien_box.gltf");
    this.model = this.gltfModel;
    this.model.scene.getObjectByName("HITBOX").visible = false;
    console.log(this.gltfModel);
    console.log(this.model)
}
}

export{AlienMesh};