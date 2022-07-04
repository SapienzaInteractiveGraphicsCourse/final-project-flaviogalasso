import * as THREE from '/build/three.module.js';
import {RobotBox} from './RobotBox.js'

class EnemyEntity{
    constructor(scene, position,RobotMesh){
        this.scene = scene;
        this.name = "Enemy";
        this.RobotMesh = RobotMesh

        this.commands = {forward:false, strafeLeft:false, strafeRight:false, rotate:false, backward:false, unrotate:false, jump:false, shift:false, shootPress:false};
        this.moveVelocity = 5.0;
        this.rotateVelocity = 5.0;
        this.gravityVelocity = 5.0;
        this.jumpOffset = 0.1;
        this.originPosition = position;
        this.RobotModel = new RobotBox(this.scene,   this.RobotMesh, this.originPosition, this.name);

    }

    init(){
        this.RobotModel.setVelocities(this.moveVelocity, this.rotateVelocity, this.gravityVelocity, this.jumpOffset);
        this.RobotModel.spawn();
    }

    reset(){
        this.RobotModel.reset();
        for (var property in this.commands) {
            this.commands[property] = false;
          }
        this.RobotModel = new RobotBox(this.scene, this.RobotMesh, this.originPosition, this.name);
    }

    update(PlayerHandler,clockDelta){
        this.commands = {forward:false, strafeLeft:false, strafeRight:false, rotate:false, backward:false, unrotate:false, jump:false, shift:false, shootPress:false};
        this.chasePlayer(PlayerHandler)
        this.RobotModel.update(this.commands,clockDelta);
    }

    chasePlayer(PlayerHandler){
        var currentPosition = this.getPosition();
        var targetPosition = PlayerHandler.getPosition();
       
        var playerDirection = new THREE.Vector3().subVectors(targetPosition,currentPosition).normalize();

        var dy = targetPosition.x - currentPosition.x;
        var dx = targetPosition.z - currentPosition.z;
        var distanceToTarget = Math.sqrt((dx*dx) + (dy*dy));
        var angleToTarget = Math.atan2(dy,dx);

        this.RobotModel.idealRotationAngle.y = angleToTarget;
        
        this.drawPointer({pointVector3D : playerDirection.clone()});
    }

    drawPointer(mouse){
        this.RobotModel.drawPointer(mouse);
    }

    getPosition(){
        return this.RobotModel.mesh.position.clone();
    }

    getQuaternion(){
        return this.RobotModel.mesh.quaternion.clone();
    }
}



class EnemyHandler{
    constructor(enemyList,ProjectileHandler,RobotMesh,scene){
        this.enemyList = enemyList;
        this.scene = scene;

        this.ProjectileHandler = ProjectileHandler;
        this.RobotMesh = RobotMesh;
    }

    spawnEnemy(){
        var NewEnemy = new EnemyEntity(this.scene,new THREE.Vector3(0,5,0), this.RobotMesh);
        NewEnemy.init();
        this.enemyList.push(NewEnemy);
    }

    updateLists(playerList, environmentList, projectileList){
        var i = this.enemyList.length;
        while (i--) {   
            var Enemy = this.enemyList[i];
            Enemy.RobotModel.updateLists(playerList,environmentList,projectileList);
        }
    }



    update(PlayerHandler, clockDelta){
        var i = this.enemyList.length;
        while (i--) {   
            var Enemy = this.enemyList[i];
            Enemy.update(PlayerHandler,clockDelta);
            /*
            if(Proj.mesh.hitSomething){
                console.log("hit something");
                Proj.removeFromScene(this.scene);
                this.projectileList.splice(i, 1);
                console.log("new projectile list", this.projectileList)
            }
            */
        }
    }

    reset(){

    }

}

export {EnemyHandler};