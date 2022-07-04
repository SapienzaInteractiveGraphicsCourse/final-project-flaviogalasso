import { Camera } from 'three';
import * as THREE from '/build/three.module.js';

class ProjectileHandler{
    constructor(projectileList,scene){
        this.projectileList = projectileList;
    }

    reset(){

    }


}

class PickUpHandler {
    constructor(pickupList,scene){
        this.pickupList = pickupList;
    }

    reset(){

    }


}

class EnemyHandler{
    constructor(enemyList){
        this.enemyList = enemyList;
    }

    reset(){

    }

}

class GameHandler {
    constructor(PlayerHandler,MapEntity,Controls,scene){
        this.gameState = "Setup";
        this.scene = scene;
        this.MapEntity = MapEntity;
        this.PlayerHandler = PlayerHandler;

        this.Controls = Controls;
        this.playerList = [];
        this.environmentList = [];
        this.projectileList = [];
        this.pickupList = [];

        this.ProjectileHandler = new ProjectileHandler(this.projectileList);
        this.PickUpHandler = new PickUpHandler(this.pickupList);
        this.EnemyHandler = new EnemyHandler(this.enemyList);

        this.cameraLookAt = new THREE.Vector3(0,4,10);
        this.cameraOffset = new THREE.Vector3(-3,7,-10);

        this.mouse = {
            x:0, y:0, 
            pointVector2D: new THREE.Vector2(), 
            pointVector3D: new THREE.Vector3()};

        document.addEventListener("mousemove", (e) => this.mouseMoveEvent(e), false);
    }

    resetEntities(){
        this.PlayerHandler.reset();
        this.ProjectileHandler.reset();
        this.PickUpHandler.reset();
        this.EnemyHandler.reset();
    }

    startIntro(){
        this.resetEntities();
        this.PlayerHandler.init();
        this.MapEntity.spawnMap();
        this.gameState = "Intro";
        this.Controls.object.position.set( 0, 20, 5 );
        this.Controls.autoRotate = true;
        this.Controls.target = this.PlayerHandler.RobotModel.mesh.position;
        console.log(this.Controls)

    }

    startGame(){
        this.resetEntities();
        this.PlayerHandler.init();
        this.MapEntity.spawnMap();
        this.gameState = "Game";
        this.Controls.autoRotate = false;
  

    }

    update(clockDelta){

        if(this.gameState == "Game"){
            this.updateGame(clockDelta);
        }
        else if(this.gameState == "Intro"){
            this.Controls.update();
        }
        
    }

    updateGame(clockDelta){
        this.environmentList = [this.MapEntity.mesh];

        this.updateTPSCamera(clockDelta);

        this.PlayerHandler.RobotModel.updateLists(this.playerList,this.environmentList,this.projectileList);
        this.PlayerHandler.drawPointer(this.mouse);
        this.PlayerHandler.update(clockDelta);
    }

    updateTPSCamera(clockDelta) {
      
        const PlayerPosition = this.PlayerHandler.getPosition();
        const PlayerOrientation = this.PlayerHandler.getQuaternion();

   
        //console.log(PlayerPosition,PlayerOrientation)

        var CameraPosition = this.cameraOffset.clone();
        CameraPosition.applyQuaternion(PlayerOrientation);
        CameraPosition.add(PlayerPosition);
    

        var CameraTarget = this.cameraLookAt.clone();
        CameraTarget.applyQuaternion(PlayerOrientation);
        CameraTarget.add(PlayerPosition);

        //console.log(CameraTarget,CameraPosition)


        
        this.Controls.object.position.copy(CameraPosition);
        this.Controls.object.lookAt(CameraTarget);

        this.mouse.pointVector3D.set(this.mouse.pointVector2D.x, this.mouse.pointVector2D.y, 1.0);
        this.mouse.pointVector3D.unproject(this.Controls.object);

        this.mouse.pointVector3D.sub(this.Controls.object.position).normalize();
    



        //console.log(this.Controls)
    }

    
    mouseMoveEvent(e){
        this.mouse.pointVector2D.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.pointVector2D.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    }

    spawnProjectile(){

    }


}

export {GameHandler};