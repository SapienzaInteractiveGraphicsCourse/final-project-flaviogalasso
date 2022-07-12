import * as THREE from '/build/three.module.js';
import { cloneGltf } from './cloneGltf.js';


class UfoEntity{
    constructor(position, UfoMesh){
        this.UfoModel = cloneGltf(UfoMesh.gltfModel);
        this.UfoModel.mesh = this.UfoModel.scene;
        this.originPosition = position.clone();
        this.UfoModel.mesh.position.copy(this.originPosition);
        this.probabilityOfNotGoingForward = 0.50;
        this.spotLight = new THREE.SpotLight(0xffffff);
        this.coordForWrap = 50;
        this.movementSpeed = 10;
        this.ticksForChangingDirection = 0;
        this.maxTicksForChangingDirection = 10;
        this.actualXDirection = 1;
        this.actualZDirection = 1;
        this.targetDummy =  new THREE.Object3D();

    }

    spawnToScene(scene){
        scene.add(this.UfoModel.mesh);
        scene.add(this.spotLight);
        scene.add(this.targetDummy);
    }

    update(clockDelta){

        if(this.ticksForChangingDirection >= this.maxTicksForChangingDirection){
            if(Math.random() > this.probabilityOfNotGoingForward){
                this.actualXDirection = (-1)* this.actualXDirection;
            }
            if(Math.random() > this.probabilityOfNotGoingForward){
                this.actualZDirection = (-1)* this.actualZDirection;
            }
            this.ticksForChangingDirection = 0;
        }
        this.ticksForChangingDirection += 10*clockDelta;
        this.UfoModel.mesh.position.x += this.actualXDirection*this.movementSpeed * clockDelta;
        this.UfoModel.mesh.position.z += this.actualZDirection*this.movementSpeed * clockDelta;

        this.UfoModel.mesh.position.x = this.UfoModel.mesh.position.x % this.coordForWrap;
        this.UfoModel.mesh.position.z = this.UfoModel.mesh.position.z % this.coordForWrap;



        this.spotLight.position.copy(this.UfoModel.mesh.position);

      
        this.targetDummy.position.copy(this.spotLight.position);
        this.targetDummy.position.y = 0;

        this.spotLight.target = this.targetDummy;
        this.spotLight.angle = Math.PI/15;
    }
    removeFromScene(scene){
        scene.remove(this.UfoModel.mesh);
        scene.remove(this.spotLight);
        scene.remove(this.targetDummy);
    }
}

class UfoSpawner {
    constructor(UfoMesh,scene){
        this.ufoList = [];
        this.spawnRadius = 10.0;
        this.ufoQuantity = 5;
        this.scene = scene;
        this.UfoMesh = UfoMesh;
        this.ufoSpawnHeight = 15;
    }

    spawnUfo(position){
        for (var i = 0; i < this.ufoQuantity; i++){
            var newPos = new THREE.Vector3(Math.random() * this.spawnRadius, this.ufoSpawnHeight, Math.random() * this.spawnRadius);
            this.ufoList.push(new UfoEntity(newPos,this.UfoMesh));
            this.ufoList[this.ufoList.length-1].spawnToScene(this.scene);
        }
        console.log("ufos:", this.ufoList);
    }

    update(clockDelta){
        for (var i = 0; i < this.ufoQuantity; i++){
            var Ufo = this.ufoList[i];
            Ufo.update(clockDelta);
        }
    }


    reset(){
        var i = this.ufoList.length;
        while (i--) {   
                var Ufo = this.ufoList[i];
                Ufo.removeFromScene(this.scene);
                this.ufoList.splice(i, 1);
  
            }
            console.log("reset ufo list", this.ufoList)
        }

}

export {UfoSpawner};