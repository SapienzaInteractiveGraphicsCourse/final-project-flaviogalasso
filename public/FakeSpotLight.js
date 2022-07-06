import * as THREE from '/build/three.module.js';

class FakeSpotLight{
    constructor(){
        this.radiusTop = 2;
        this.radiusBot = this.radiusTop;
        this.height = 200;

        this.geometry = new THREE.CylinderGeometry( this.radiusTop, this.radiusBot,this.height );
        this.material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        this.material.transparent = true;
        this.material.opacity= 0.2;
   
        this.mesh = new THREE.Mesh( this.geometry, this.material );
    }

    update(position){
        this.mesh.position.copy(position.clone());

    }

    spawnToScene(scene){
        scene.add( this.mesh );
    }

    removeFromScene(scene){
        scene.remove( this.mesh );
    }

}

export{FakeSpotLight};