import * as THREE from '/build/three.module.js';


class Projectile{

    constructor(aimData,name){
        this.projectileScale = new THREE.Vector3(1,5,5);
        this.origin = aimData.positionVector.clone();
        this.direction = aimData.directionVector.clone();

        this.geometry = new THREE.SphereGeometry( this.projectileScale[0], this.projectileScale[1], this.projectileScale[2]);
        this.material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.mesh.position.copy(this.origin);

        this.name = name;
        this.mesh.hitSomething = false;

        this.speedFactor = 30.0;

        this.stepsTaken = 0.0;
        this.stepsThreshold = 50.0;
        this.stepsIncrement = 50.0;
    }

    addToScene(scene){
        scene.add(this.mesh);
    }

    removeFromScene(scene){
        scene.remove(this.mesh);
    }

    update(clockDelta){
        var newStepVector = this.direction.clone();

        this.mesh.position.add(newStepVector.multiplyScalar(this.speedFactor * clockDelta));
        this.stepsTaken += this.stepsIncrement * clockDelta;
        
        if(this.stepsTaken >= this.stepsThreshold) this.mesh.hitSomething = true;
        
    }

}


class ProjectileHandler{

    constructor(projectileList,scene){
        this.projectileList = projectileList;
        this.scene = scene;
    }

    requestShoot(aimData,name){
        //console.log("shoot!",aimData,name)
        var NewProj = new Projectile(aimData,name);
        NewProj.addToScene(this.scene);
        this.projectileList.push(NewProj);
        //console.log("new projectile list", this.projectileList)
    }

    update(clockDelta){
        var i = this.projectileList.length;
        while (i--) {   
            var Proj = this.projectileList[i];
            Proj.update(clockDelta);
            if(Proj.mesh.hitSomething){
                //console.log("hit something");
                Proj.removeFromScene(this.scene);
                this.projectileList.splice(i, 1);
                //console.log("new projectile list", this.projectileList)
            }
        }
    }

    reset(){
        var i = this.projectileList.length;
        while (i--) {   
                var Proj = this.projectileList[i];
                Proj.removeFromScene(this.scene);
                this.projectileList.splice(i, 1);
                //console.log("new projectile list", this.projectileList)
            }
        }


}

export {ProjectileHandler};