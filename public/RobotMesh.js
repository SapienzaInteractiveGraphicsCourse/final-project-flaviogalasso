import * as THREE from '/build/three.module.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
class RobotMesh{
    constructor(){
        
    }
async loadModel(){
    this.loader = new GLTFLoader();
    this.gltfModel = await this.loader.loadAsync("./models/droid.gltf");
    this.model = this.gltfModel;
    console.log(this.model)
}
}

export{RobotMesh};