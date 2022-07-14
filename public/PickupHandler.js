import * as THREE from '/build/three.module.js';


class PickUp{
    constructor(type,geometry,material,position){
        this.mesh = new THREE.Mesh( geometry, material);
        this.mesh.type = type;
        this.mesh.pickedUp = false;
        this.rotationSpeed = 2;
        this.originPosition = position.clone();
        this.mesh.position.copy(this.originPosition);

    }

    spawnToScene(scene){
        scene.add(this.mesh);
    }

    update(clockDelta){
        this.mesh.rotation.x += this.rotationSpeed * clockDelta;
        this.mesh.rotation.y += this.rotationSpeed * clockDelta;
    }

    removeFromScene(scene){
        scene.remove(this.mesh);
    }
}
class PickUpHandler {
    constructor(pickupList,scene){
        this.pickupList = pickupList;
        this.ammoTexturePath = './textures/bullets.png';
        this.healthTexturePath = './textures/health.png';
        this.probabilityOfNotSpawningAmmo = 0.998;
        this.probabilityOfNotSpawningHealth = 0.998;
        this.spawnRadius = 10.0;
        this.maxPickups = 3.0;
        this.scene = scene;

        this.noPicksTicks = 0.0;
        this.noPicksTicksMax = 200.0;
        this.noPicksTicksVelocity = 5;

        this.geometry = new THREE.BoxGeometry( 1.2, 1.2, 1.2 );
        this.ammoMaterial = new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load( this.ammoTexturePath ), transparent:true } );  
        this.healthMaterial = new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load( this.healthTexturePath ), transparent: true } );   
       
    }

    spawnPickup(type,scene,position){
        if(type == "Ammo") this.pickupList.push(new PickUp(type,this.geometry,this.ammoMaterial,position));
        else this.pickupList.push(new PickUp(type,this.geometry,this.healthMaterial,position));

        this.pickupList[this.pickupList.length-1].spawnToScene(scene);
        console.log("pickups:", this.pickupList)
    }

    update(PlayerHandler,clockDelta){
        this.noPicksTicks += this.noPicksTicksVelocity * clockDelta;
        if(this.noPicksTicks >= this.noPicksTicksMax){
            console.log("pickups despawned!")
            this.reset();

        }

        if( this.pickupList.length < this.maxPickups){
            if( Math.random() > this.probabilityOfNotSpawningHealth){
                var playerPos = PlayerHandler.getPosition();
                var newPos = new THREE.Vector3(playerPos.x + Math.random() * this.spawnRadius, playerPos.y+2, playerPos.z + Math.random() * this.spawnRadius);
                this.spawnPickup("Health",this.scene,newPos)
            }
            if ( Math.random() > this.probabilityOfNotSpawningAmmo){
                var playerPos = PlayerHandler.getPosition();
                var newPos = new THREE.Vector3(playerPos.x + Math.random() * this.spawnRadius, playerPos.y + 2, playerPos.z + Math.random() * this.spawnRadius);
                this.spawnPickup("Ammo",this.scene,newPos);
    
            }
    
    }
    var i = this.pickupList.length;
    while (i--) {   
        var PickUp = this.pickupList[i];
        PickUp.update(clockDelta);
        if(PickUp.mesh.pickedUp) {
            this.noPicksTicks = 0;
            //console.log("hit something");
            PickUp.removeFromScene(this.scene);
            this.pickupList.splice(i, 1);
            //console.log("new projectile list", this.projectileList)
        }
    }
}


    reset(){
        this.noPicksTicks = 0;
        var i = this.pickupList.length;
        while (i--) {   
                var PickUp = this.pickupList[i];
                PickUp.removeFromScene(this.scene);
                this.pickupList.splice(i, 1);
  
            }
            console.log("reset pickup list", this.pickupList)
        }

}

export {PickUpHandler};