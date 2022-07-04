import * as THREE from '/build/three.module.js';
import {ProjectileHandler} from './ProjectileHandler.js'
import {PickUpHandler} from './PickUpHandler.js'
import {EnemyHandler} from './EnemyHandler.js'
import {PlayerHandler} from './PlayerHandler.js'
import {calculateYAngleBetweenVectors,calculateDirectionBetweenVectors} from './UsefulFunctions.js'



class GameHandler {
    constructor(RobotMesh,MapEntity,Controls,scene){
        this.gameState = "Setup";
        this.scene = scene;
        this.MapEntity = MapEntity;
        this.RobotMesh = RobotMesh;

        this.Controls = Controls;
        this.playerList = [];
        this.environmentList = [];
        this.projectileList = [];
        this.pickupList = [];
        this.enemyList = [];

        this.ProjectileHandler = new ProjectileHandler(this.projectileList,this.scene);
        this.PickUpHandler = new PickUpHandler(this.pickupList);
       
        this.playerPosition = new THREE.Vector3( 0, 5, 0 );
        this.PlayerHandler = new PlayerHandler(this.scene,this.playerPosition,this.RobotMesh);

        this.EnemyHandler = new EnemyHandler(this.enemyList, this.ProjectileHandler, this.RobotMesh, this.scene);


        this.cameraLookAt = new THREE.Vector3(0,4,10);
        this.cameraOffset = new THREE.Vector3(-3,7,-10);

        this.rayCastAim = new THREE.Raycaster();
        this.rayCastAimHelper = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0),
            this.rayCastUpLength, 0xffffff,
          );

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
        this.scene.remove(this.rayCastAimHelper);
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
        this.scene.add(this.rayCastAimHelper)
        this.PlayerHandler.init();
        this.MapEntity.spawnMap();
        this.PlayerHandler.RobotModel.setProjectileHandler(this.ProjectileHandler);
        this.gameState = "Game";
        this.Controls.autoRotate = false;
        this.EnemyHandler.spawnEnemy();
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
        this.environmentList = [this.MapEntity];
        this.playerList = [this.PlayerHandler];

        this.updateTPSCamera(clockDelta);


        this.PlayerHandler.RobotModel.updateLists(this.enemyList,this.environmentList,this.projectileList);
        this.PlayerHandler.RobotModel.drawPointer(this.mouse);
        this.PlayerHandler.update(clockDelta);

        this.EnemyHandler.update(this.PlayerHandler,clockDelta);
        this.EnemyHandler.updateLists(this.playerList,this.environmentList,this.projectileList);



        this.ProjectileHandler.update(clockDelta);
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
        /*

        this.mouse.pointVector3D.set(this.mouse.pointVector2D.x, this.mouse.pointVector2D.y, 1.0);
        this.mouse.pointVector3D.unproject(this.Controls.object);

        this.mouse.pointVector3D.sub(this.Controls.object.position).normalize();
        */

        // SHOOT HELPER
        
        this.rayCastAim.setFromCamera(this.mouse.pointVector2D,this.Controls.object)
        this.rayCastAim.near = 0.0;
        this.rayCastAim.far = 2000;
        var enemyListMeshes = [];
        for (var elm of this.enemyList) enemyListMeshes.push(elm.RobotModel.mesh)

        var intersections = this.rayCastAim.intersectObjects( enemyListMeshes, true );
        this.rayCastAimHelper.position.copy(this.rayCastAim.ray.origin);
        this.rayCastAimHelper.setDirection(this.rayCastAim.ray.direction);


        if(intersections.length > 0){
            var target = intersections[0].point.clone();
            var origin = this.rayCastAim.ray.origin.clone();

            var direction = calculateDirectionBetweenVectors(target,origin);

            console.log(intersections[0])
            this.mouse.pointVector3D.copy(direction)
            
        }
        
    



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