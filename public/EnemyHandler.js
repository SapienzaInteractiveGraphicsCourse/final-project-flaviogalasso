import * as THREE from '/build/three.module.js';
import {RobotBox} from './RobotBox.js'
import {calculateYAngleBetweenVectors,calculateDirectionBetweenVectors} from './UsefulFunctions.js'

class EnemyEntity{
    constructor(scene, position, RobotMesh){
        this.scene = scene;
        this.name = "Enemy";
        this.RobotMesh = RobotMesh

        this.commands = {forward:false, strafeLeft:false, strafeRight:false, rotate:false, backward:false, unrotate:false, jump:false, shift:false, shootPress:false};
        this.moveVelocity = 2.0;
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
    }

    update(PlayerHandler,clockDelta){
        this.commands = {forward:false, strafeLeft:false, strafeRight:false, rotate:false, backward:false, unrotate:false, jump:false, shift:false, shootPress:false};
        this.chasePlayer(PlayerHandler)
        this.RobotModel.update(this.commands,clockDelta);
    }

    chasePlayer(PlayerHandler){
        var currentPosition = this.getPosition();
        var targetPosition = PlayerHandler.getPosition();
        var targetMesh = PlayerHandler.getMesh();

        var result = calculateYAngleBetweenVectors(targetPosition,currentPosition);
        this.RobotModel.aimAt(targetMesh);

        if (result.distanceToTarget < 999){
            this.RobotModel.idealRotationAngle.y = result.angleToTarget;
            if(Math.random() > 0.995){
                this.commands.shoot = true;
            }
            //this.commands.forward = true;
        }
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

        this.spawnRadius = 10;
        this.currentWave = 0;
    }

    spawnEnemy(position){
        var NewEnemy = new EnemyEntity(this.scene,position, this.RobotMesh);
        NewEnemy.init();
        NewEnemy.RobotModel.setProjectileHandler(this.ProjectileHandler);
        this.enemyList.push(NewEnemy);
    }

    spawnWave(PlayerHandler){
        console.log("NEW WAVE: ", this.currentWave);
        var PlayerPosition = PlayerHandler.getPosition();
        for(var i=0; i < this.currentWave; i++){
            var enemyPos = new THREE.Vector3(PlayerPosition.x + Math.random() * this.spawnRadius, PlayerPosition.y + 10.0, PlayerPosition.z + Math.random() * this.spawnRadius);
            this.spawnEnemy(enemyPos);
        }
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
            if(Enemy.RobotModel.health <= 0){
                Enemy.reset();
                this.enemyList.splice(i, 1);
                console.log("new enemy list", this.enemyList)
            }

        }
        if(this.enemyList.length == 0){
            console.log("ALL ENEMIES CLEARED! NEW WAVE")
            this.currentWave += 1;
            this.spawnWave(PlayerHandler);
        }
    }

    reset(){

        var i = this.enemyList.length;
        while (i--) {   
            var Enemy = this.enemyList[i];
            Enemy.reset();
            this.enemyList.splice(i, 1);
        }
        this.currentWave = 0;
    }

}

export {EnemyHandler};