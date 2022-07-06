import * as THREE from '/build/three.module.js';
import {RobotBox} from './RobotBox.js'
import { cloneGltf } from './cloneGltf.js';
import {FakeSpotLight} from './FakeSpotLight.js';
import {calculateYAngleBetweenVectors,calculateDirectionBetweenVectors} from './UsefulFunctions.js'



class EnemyEntity{
    constructor(scene, position, RobotMesh, UfoMesh){
        this.scene = scene;
        this.name = "Enemy";
        this.RobotMesh = RobotMesh
        this.UfoMesh = UfoMesh;

        this.commands = {forward:false, strafeLeft:false, strafeRight:false, rotate:false, backward:false, unrotate:false, jump:false, shift:false, shootPress:false};
        this.moveVelocity = 2.0;
        this.rotateVelocity = 5.0;
        this.gravityVelocity = 5.0;
        this.jumpOffset = 0.1;
        this.originPosition = position;
        this.RobotModel = new RobotBox(this.scene,   this.RobotMesh, this.originPosition, this.name);

        
        this.UfoModel = cloneGltf(UfoMesh.gltfModel);
        this.UfoModel.mesh = this.UfoModel.scene;
        

        this.ufoTicks = 0;
        this.ufoTicksMax = 30;
        this.ufoEnabled = true;
        this.spotLight = new FakeSpotLight();

    }

    init(){
        this.RobotModel.setVelocities(this.moveVelocity, this.rotateVelocity, this.gravityVelocity, this.jumpOffset);
        this.RobotModel.spawn();
        this.spawnUfo();
    }

    spawnUfo(){
        /*
        this.spotLight.position.copy(this.UfoModel.mesh.position);
        this.spotLight.target = this.RobotModel.mesh;
        this.spotLight.angle = Math.PI/15;
        */
        this.spotLight.spawnToScene(this.scene);
        this.scene.add(this.UfoModel.mesh);
    }

    updateUfo(clockDelta){
        //console.log(this.ufoTicks)
        this.UfoModel.mesh.position.copy(this.RobotModel.mesh.position);
        this.UfoModel.mesh.position.add(new THREE.Vector3(0,10,0));
        this.spotLight.update(this.UfoModel.mesh.position);

        if(this.ufoTicks < this.ufoTicksMax) this.ufoTicks += 10 * clockDelta;
        else{
            this.spotLight.removeFromScene(this.scene);
            this.scene.remove(this.UfoModel.mesh);
            this.ufoEnabled = false;
        }

    }

    reset(){
        this.RobotModel.reset();
        this.spotLight.removeFromScene(this.scene);
        this.scene.remove(this.UfoModel.mesh);
        for (var property in this.commands) {
            this.commands[property] = false;
          }
    }

    update(PlayerHandler,clockDelta){
        this.commands = {forward:false, strafeLeft:false, strafeRight:false, rotate:false, backward:false, unrotate:false, jump:false, shift:false, shootPress:false};
        this.chasePlayer(PlayerHandler)
        this.RobotModel.update(this.commands,clockDelta);
        if(this.ufoEnabled) this.updateUfo(clockDelta);
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
            if(result.distanceToTarget > 10){
                this.commands.forward = true;
            }
            
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
    constructor(enemyList,ProjectileHandler,RobotMesh,UfoMesh,scene){
        this.enemyList = enemyList;
        this.scene = scene;

        this.ProjectileHandler = ProjectileHandler;
        this.RobotMesh = RobotMesh;
        this.UfoMesh = UfoMesh;

        this.spawnRadius = 10;
        this.currentWave = 0;
        this.difficulty = "Easy";
    }

    spawnEnemy(position){
        var NewEnemy = new EnemyEntity(this.scene,position, this.RobotMesh, this.UfoMesh);
        NewEnemy.init();
        NewEnemy.RobotModel.setProjectileHandler(this.ProjectileHandler);
        NewEnemy.RobotModel.setDifficulty(this.difficulty);
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

    setDifficulty(difficulty){
        this.difficulty = difficulty;
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