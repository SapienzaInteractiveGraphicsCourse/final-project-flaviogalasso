import * as THREE from '/build/three.module.js';
import { cloneGltf } from './cloneGltf.js';
import {calculateYAngleBetweenVectors,calculateDirectionBetweenVectors} from './UsefulFunctions.js'


class RobotBox{
    constructor(scene, RobotMesh, position, name){
        this.debug = true;
        this.scene = scene;
        this.enemyList = [];
        this.environmentList = [];
        this.projectileList = [];
        this.pickupList = [];
        
        this.gltfModel = cloneGltf(RobotMesh.gltfModel);
        this.mesh = this.gltfModel.scene;
        


        this.originPosition = position;
        this.name = name;

        this.moveVelocity = 1.0;
        this.rotateVelocity = 1.0;
        this.jumpVelocity = 0.1;
        this.gravityVelocity = 0.1;
        this.health = 100;
        this.ammo = 10;
        this.playerHitDamage = 20;
        this.enemyHitDamage = 50;
        this.hasBeenHit = false;
        this.playerDifficultyModifier = 1.0;
        this.enemyDifficultyModifier = 1.0;
        this.healthIncrement = 20;
        this.ammoIncrement = 5;


        this.lerpTime = 10;
        this.idealRotationAngle =  new THREE.Vector3();
        this.idealRotationAngle.set(0,0,0);
        this.rotationAngle =  new THREE.Vector3();
        this.rotationAngle.set(0,0,0);

        this.aimLine = new THREE.ArrowHelper(new THREE.Vector3(),new THREE.Vector3());
        this.aimLine.setColor(0xff0000)
        this.aimLine.setLength (1000, 1, 1) 
        this.aimData = {positionVector: new THREE.Vector3(), directionVector: new THREE.Vector3()};

        this.rayCastClock = new THREE.Clock();
        this.rayCastClock.getDelta();
        this.lastRayCastTime = 0;
        this.rayCastTime = 50;
        this.frontBlock = false;
        this.rightBlock = false;
        this.leftBlock = false;
        this.backBlock = false;

        this.rayCastHorizontalHeight = 3.0;
        this.rayCastMinimumDistanceForBump = 0.5;
        this.rayCastLenght=1.5;
        this.rayCastDownLength = 0.5;
        this.rayCastUpLength = 2;
        this.rayCastUpShootLength = 6;
        
        this.rayCastDown = new THREE.Raycaster();
        this.rayCastUp = new THREE.Raycaster();
        this.rayCastUpShoot = new THREE.Raycaster();
        this.rayCastFront = new THREE.Raycaster();
        this.rayCastBack = new THREE.Raycaster();

        this.rayCastFrontHelper = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1),new THREE.Vector3(0, 0, 0),
            this.rayCastLenght,0xff0000,
          );
        this.rayCastBackHelper = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0),
            this.rayCastLenght, 0x00ff00,
          );
        this.rayCastDownHelper = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0),
            this.rayCastDownLength, 0x0000ff,
          );
          this.rayCastUpHelper = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0),
            this.rayCastUpLength, 0xff00ff,
          );
          this.rayCastUpShootHelper = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0),
            this.rayCastUpLength, 0xffffff,
          );
  



        this.state = 'Idle';
        this.stateChanged = true;
        this.collisionGroundHappened = false;
        this.bumpUp = false;


        this.jumpAvailable = true;
        this.jumpTicks = 0;
        this.jumpAnimationEnded = false;

        this.shootOffset = new THREE.Vector3(-1, 2,2);
        this.shootTargetOffset = new THREE.Vector3(0,3,0);
        this.shootAvailable = true;
        this.shootAnimationEnded = false;

        this.thetaIdle =           {ArmShoulderDx:90,       ArmShoulderSx:90,       ArmElboxSx:90,       ArmElboxDx:90,       LegHipDx:90,       LegHipSx:90,     LegKneeDx:0,     LegKneeSx:0, Head:0};
        this.thetaWalkingLegSpread = {ArmShoulderDx:45,       ArmShoulderSx:180-45,   ArmElboxSx:90,       ArmElboxDx:90,     LegHipDx:90+10,       LegHipSx:90-20,      LegKneeDx:0,     LegKneeSx:-20, Head:0};
        this.thetaWalkingLegSpreadRev= {ArmShoulderDx:180-45,   ArmShoulderSx:45,       ArmElboxSx:90,       ArmElboxDx:90,   LegHipDx:90-20,       LegHipSx:90+20,    LegKneeDx:-20,     LegKneeSx:0, Head:0};
        this.thetaIdleRotation =           {ArmShoulderDx:90,       ArmShoulderSx:90,       ArmElboxSx:90,       ArmElboxDx:90,       LegHipDx:90,       LegHipSx:90,     LegKneeDx:0,     LegKneeSx:0,  Head:90};
        this.thetaIdleRotation2 =           {ArmShoulderDx:90,       ArmShoulderSx:90,       ArmElboxSx:90,       ArmElboxDx:90,       LegHipDx:90,       LegHipSx:90,     LegKneeDx:0,     LegKneeSx:0, Head:-90};
        this.thetaJumpUp =           {ArmShoulderDx:-90,       ArmShoulderSx:-90,       ArmElboxSx:0,       ArmElboxDx:0,       LegHipDx:90,       LegHipSx:90,     LegKneeDx:0,     LegKneeSx:0, Head:0};
        this.currentTheta =        {ArmShoulderDx:0,        ArmShoulderSx:0,        ArmElboxSx:0,        ArmElboxDx:0,        LegHipDx:0,        LegHipSx:0,      LegKneeDx:0,     LegKneeSx:0, Head:0};
        this.thetaShoot =           {ArmShoulderDx:0,       ArmShoulderSx:90,       ArmElboxSx:90,       ArmElboxDx:0,       LegHipDx:90,       LegHipSx:90,     LegKneeDx:0,     LegKneeSx:0, Head:0};
    }
    
    updateLists(enemyList,environmentList,projectileList,pickupList){
        this.enemyList = [];
        this.environmentList = [];
        this.projectileList = [];
        this.pickupList = [];
        for (var elm of enemyList) this.enemyList.push(elm.RobotModel.mesh);
        for (var elm of environmentList) this.environmentList.push(elm.mesh);
        for (var elm of projectileList) this.projectileList.push(elm.mesh);
        if(pickupList != null){
        for (var elm of pickupList) this.pickupList.push(elm.mesh);
        }
        
        
    }

    setProjectileHandler(ProjectileHandler){
        this.ProjectileHandler = ProjectileHandler;
    }

 
  
    spawn(){
        this.mesh.scale.set(1, 1, 1);
        this.mesh.position.set(this.originPosition.x, this.originPosition.y, this.originPosition.z);
        this.mesh.traverse(function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
                //child.geometry.computeBoundingBox();
            }
   
        });
        /*
        this.collider = new THREE.Box3()
        this.colliderHelper = new THREE.Box3Helper( this.collider, 0xff0000 );
        this.scene.add(this.colliderHelper);
        */

        this.initAnimations();

        this.scene.add(this.mesh);
        this.scene.add(this.aimLine);
        this.scene.add(this.rayCastBackHelper);
        this.scene.add(this.rayCastFrontHelper)
        this.scene.add(this.rayCastDownHelper);
        this.scene.add(this.rayCastUpHelper);
        this.scene.add(this.rayCastUpShootHelper);

    }

    reset(){
        this.scene.remove(this.mesh);
        this.scene.remove(this.aimLine);
        this.scene.remove(this.rayCastBackHelper);
        this.scene.remove(this.rayCastFrontHelper)
        this.scene.remove(this.rayCastDownHelper);
        this.scene.remove(this.rayCastUpHelper);
        this.scene.remove(this.rayCastUpShootHelper);
    }

       setVelocities(moveVelocity,rotateVelocity,gravityVelocity,jumpVelocity) {
           this.moveVelocity = moveVelocity;
           this.rotateVelocity = rotateVelocity;
           this.gravityVelocity = gravityVelocity;
           this.jumpVelocity = jumpVelocity;
       }

        update(commands, clockDelta){
            this.updateAnimation(commands);
            this.updateCollisions();
            this.updateHealth();
            this.updateMovement(commands,clockDelta);
            this.shoot(commands);
            //this.collider.setFromObject( this.mesh );
        }

        setDifficulty(difficulty){
            if(difficulty == "Easy"){
                this.playerDifficultyModifier = 0.1;
                this.enemyDifficultyModifier = 2.0;
            }
            else if(difficulty == "Medium"){
                this.playerDifficultyModifier = 0.3;
                this.enemyDifficultyModifier = 1.0;
            }
            else if(difficulty == "Hard"){
                this.playerDifficultyModifier = 2.0;
                this.enemyDifficultyModifier = 1.0;
            }
        }

        updateHealth(){
            if(this.hasBeenHit && this.health >= 0){
                console.log(this.name + "has been hit, hp before hit:", this.health);
                if(this.name == "Player") this.health -= this.playerHitDamage * this.playerDifficultyModifier;
                else this.health -= this.enemyHitDamage * this.enemyDifficultyModifier;
                console.log(this.name + "has been hit, hp after hit:", this.health);
                this.hasBeenHit = false;
            }
        }

        updateAmmo(){
            if(this.name == "Player"){
                this.ammo -= 1;
            }
        }

        applyHealthPickup(){
            this.health += this.healthIncrement;
        }

        applyAmmoPickup(){
            this.ammo += this.ammoIncrement;
        }

        shoot(commands){
            if(commands.shoot && this.shootAvailable && this.ammo > 0){
                
                this.shootAvailable = false;
            }

            if( !this.shootAvailable && this.shootAnimationEnded){
                this.ProjectileHandler.requestShoot(this.aimData,this.name);
                this.updateAmmo();
                this.shootAvailable = true;
            }
           

        }

        updateMovement(commands,clockDelta) {
            //console.log(this.mesh)
        
            
            if (commands.rotate)  
                this.idealRotationAngle.y += this.rotateVelocity * clockDelta;  
            if (commands.unrotate)  
                this.idealRotationAngle.y -= this.rotateVelocity*clockDelta;
            
            
            this.rotationAngle.lerp(this.idealRotationAngle, this.lerpTime * clockDelta);
            this.mesh.rotation.y = this.rotationAngle.y;

            if(commands.forward && !this.frontBlock){
                this.mesh.position.z += Math.cos(this.rotationAngle.y) * this.moveVelocity * clockDelta;
                this.mesh.position.x += Math.sin(this.rotationAngle.y) * this.moveVelocity * clockDelta;
            }
            if(commands.backward && !this.backBlock){
                this.mesh.position.z -= Math.cos(this.rotationAngle.y) * this.moveVelocity * clockDelta;
                this.mesh.position.x -= Math.sin(this.rotationAngle.y) * this.moveVelocity * clockDelta;
            }

              if(commands.jump && this.jumpAvailable){
                  this.jumpAvailable = false;
                  this.jumpTicks = 0;
              }

              if(!this.jumpAvailable){
                  this.jumpTicks += 0.1;
                  this.mesh.position.y += Math.sin(this.jumpTicks) * this.jumpVelocity;
                  if(this.jumpTicks >= 2*Math.PI){
                      this.jumpAvailable = true;
                  }
              }

            if(this.collisionGroundHappened && this.jumpAvailable){
                //console.log("collision stop")
            }
            else if(this.jumpAvailable){
                this.mesh.position.y -= this.gravityVelocity * clockDelta;
            }

            if(this.bumpUp){
                this.mesh.position.y += 2*this.gravityVelocity * clockDelta;
            }
        }

        drawPointer(mouse){
            var shootingOrigin = this.shootOffset.clone();
            shootingOrigin.applyQuaternion(this.mesh.quaternion);
            shootingOrigin.add(this.mesh.position);

            this.aimData.directionVector.copy(mouse.pointVector3D);
            this.aimData.positionVector.copy(shootingOrigin);
            


            this.aimLine.position.copy( this.aimData.positionVector);
            this.aimLine.setDirection( this.aimData.directionVector);
            this.aimLine.setColor(0xffffff);
        }

        
        aimAt(object,mouse){
            if(object == null){
                if(this.name == "Player"){
                    this.drawPointer(mouse);
                }
                return;
            }
            var shootingOrigin = this.shootOffset.clone();
            shootingOrigin.applyQuaternion(this.mesh.quaternion);
            shootingOrigin.add(this.mesh.position);

            var traversedChild = object;
            while(traversedChild.name != "Scene"){
                traversedChild = traversedChild.parent
            }

            var targetOrigin = traversedChild.position.clone().add(this.shootTargetOffset);

            var targetDirection = calculateDirectionBetweenVectors(targetOrigin,shootingOrigin);

            this.aimData.directionVector.copy(targetDirection);
            this.aimData.positionVector.copy(shootingOrigin);

            this.aimLine.position.copy( this.aimData.positionVector);
            this.aimLine.setDirection( this.aimData.directionVector);
            this.aimLine.setColor(0xff0000);
        }

        updateCollisions(){
            var elapsedTime = this.rayCastClock.getElapsedTime();
            if(elapsedTime*1000 - this.lastRayCastTime > this.rayCastTime){
                this.lastRayCastTime = elapsedTime*1000;

                const meshPosition = this.mesh.position.clone();
                const meshRotation = this.mesh.quaternion.clone();
                var meshPositionShifted = meshPosition.clone();
                meshPositionShifted.y += this.rayCastHorizontalHeight;
                //console.log(meshPositionShifted);
                const down = new THREE.Vector3( 0, - 1, 0 );
                const up = new THREE.Vector3( 0, 1, 0 );
                var front = new THREE.Vector3( 0, 0, 1 );
                var back = new THREE.Vector3( 0, 0, -1 );


                front.applyQuaternion(meshRotation);
                back.applyQuaternion(meshRotation);


                
                // DOWN
                    this.rayCastDown.set(meshPosition, down );
                    this.rayCastDown.far = this.rayCastDownLength;
                    this.rayCastDownHelper.position.copy(this.rayCastDown.ray.origin);
                    this.rayCastDownHelper.setDirection(this.rayCastDown.ray.direction);
                    var intersections = this.rayCastDown.intersectObjects( this.environmentList, true );
                    

                    if(intersections.length > 0){
                        this.collisionGroundHappened = true;
                    }
                    else{
                        this.collisionGroundHappened = false;
                    }
                
                // UP
                    this.rayCastUp.set(meshPosition, up );
                    this.rayCastUp.far = this.rayCastUpLength;
                    this.rayCastUpHelper.position.copy(this.rayCastUp.ray.origin);
                    this.rayCastUpHelper.setDirection(this.rayCastUp.ray.direction);
                    var intersections = this.rayCastUp.intersectObjects( this.environmentList, true );
                    //console.log(intersections)

                    if(intersections.length > 0){
                        this.bumpUp = true;
                    }
                    else{
                        this.bumpUp = false;
                    }

                    this.rayCastUpShoot.set(meshPosition, up );
                    this.rayCastUpShoot.far = this.rayCastUpShootLength;
                    this.rayCastUpShootHelper.position.copy(this.rayCastUpShoot.ray.origin);
                    this.rayCastUpShootHelper.setDirection(this.rayCastUpShoot.ray.direction);
                    this.rayCastUpShootHelper.setLength (this.rayCastUpShootLength, 1, 1) 
                    var projectile_intersections = this.rayCastUpShoot.intersectObjects( this.projectileList, true );
                    //console.log(projectile_intersections);
                    if(projectile_intersections.length > 0){
                        this.hasBeenHit = true;
                        console.log("HIT")
                        projectile_intersections[0].hitSomething=true;
                    } 
                    else this.hasBeenHit = false;

                    // PICKUP CHECK
                    if(this.name == "Player"){
                    var pickup_intersections = this.rayCastUpShoot.intersectObjects( this.pickupList, true );
                    //console.log(projectile_intersections);
                    if(pickup_intersections.length > 0){
                        console.log(pickup_intersections)
                        var pickedupobject = pickup_intersections[0].object;
                        console.log("PICKED UP SOMETHING:" +  pickedupobject.type);
                        if(pickedupobject.type == "Health"){
                            this.applyHealthPickup();
                        }
                        if(pickedupobject.type == "Ammo"){
                            this.applyAmmoPickup();
                        }
                        pickedupobject.pickedUp=true;
                    } 
                }


                    


                
                // FRONT
                    this.rayCastFront.set(meshPositionShifted, front)
                    this.rayCastFront.near = 0.0;
                    this.rayCastFront.far = this.rayCastLenght;

                    intersections = this.rayCastFront.intersectObjects( this.environmentList, true );
                    this.rayCastFrontHelper.position.copy(this.rayCastFront.ray.origin);
                    this.rayCastFrontHelper.setDirection(this.rayCastFront.ray.direction);

                    if(intersections.length > 0) this.frontBlock = true;
                    else this.frontBlock = false;

      



  

                // BACK
                    this.rayCastBack.set(meshPositionShifted, back)
                    this.rayCastBack.near = 0.0;
                    this.rayCastBack.far = this.rayCastLenght;

                    intersections = this.rayCastBack.intersectObjects( this.environmentList, true );
                    this.rayCastBackHelper.position.copy(this.rayCastBack.ray.origin);
                    this.rayCastBackHelper.setDirection(this.rayCastBack.ray.direction);

                    if(intersections.length > 0) this.backBlock = true;
                    else this.backBlock = false;

            }

        }

        initWalkingAnimation(){
            
            this.walkingTweenReset = new TWEEN.Tween(this.currentTheta)
            .to(this.thetaIdle,200)
            .easing(TWEEN.Easing.Quadratic.InOut);

            this.walkingTween1 = new TWEEN.Tween(this.currentTheta)
            .to( this.thetaWalkingLegSpread, 200)
            .easing(TWEEN.Easing.Quadratic.InOut)

            this.walkingTweenReset2 = new TWEEN.Tween(this.currentTheta)
            .to(this.thetaIdle,200)
            .easing(TWEEN.Easing.Quadratic.InOut);

            this.walkingTween2 = new TWEEN.Tween(this.currentTheta)
            .to( this.thetaWalkingLegSpreadRev, 200)
            .easing(TWEEN.Easing.Quadratic.InOut)

            this.walkingTweenReset.chain(this.walkingTween1);

            this.walkingTween1.chain(this.walkingTweenReset2);

            this.walkingTweenReset2.chain(this.walkingTween2);

            this.walkingTween2.chain(this.walkingTweenReset);

        }

        initIdleAnimation(){
            this.idleTween = new TWEEN.Tween(this.currentTheta)
            .to(this.thetaIdle,1000)
            .easing(TWEEN.Easing.Quadratic.InOut);

            this.idleTweenRotate = new TWEEN.Tween(this.currentTheta)
            .to(this.thetaIdleRotation,1000)
            .easing(TWEEN.Easing.Quadratic.InOut);

            this.idleTween2 = new TWEEN.Tween(this.currentTheta)
            .to(this.thetaIdle,1000)
            .easing(TWEEN.Easing.Quadratic.InOut);

            this.idleTweenRotate2 = new TWEEN.Tween(this.currentTheta)
            .to(this.thetaIdleRotation2,1000)
            .easing(TWEEN.Easing.Quadratic.InOut);

            this.idleTween.chain(this.idleTweenRotate);
            this.idleTweenRotate.chain(this.idleTween2);
            this.idleTween2.chain(this.idleTweenRotate2);
            this.idleTweenRotate2.chain(this.idleTween);
        }


        initJumpUpAnimation(){
            this.jumpUpTween = new TWEEN.Tween(this.currentTheta)
            .to(this.thetaJumpUp,200)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete(function(){
                this.jumpAnimationEnded = true;
            }.bind(this));
        }


        initShootAnimation(){
            this.shootTween = new TWEEN.Tween(this.currentTheta)
            .to(this.thetaShoot,500)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete(function() {
                this.shootAnimationEnded = true;
            }.bind(this));

        }


        initAnimations(){
            this.initIdleAnimation();
            this.initWalkingAnimation();
            this.initJumpUpAnimation();
            this.initShootAnimation();
        }

        updateAnimation(commands){
        //console.log(this.state)
        switch(this.state){

            case 'Idle': 
            if(this.stateChanged){
                this.stateChanged = false;
                this.idleTween.start();
            }
            if(commands.forward || commands.backward){
                this.state = 'Walk';
                this.stateChanged = true;
                this.idleTween.stop();
            }
            if(!this.jumpAvailable){
                this.state = 'Jump';
                this.stateChanged = true;
                this.walkingTweenReset.stop();
            }
            if(!this.shootAvailable){
                this.state = 'Shoot';
                this.stateChanged=true;
                this.idleTween.stop();
            }

            break;
            case 'Walk': 
            if(this.stateChanged){
                this.stateChanged = false;
                this.walkingTweenReset.start();
            }
            if(!commands.forward && !commands.backward){
                this.state = 'Idle';
                this.stateChanged = true;
                this.walkingTweenReset.stop();
            }
            if(!this.jumpAvailable){
                this.state = 'Jump';
                this.stateChanged = true;
                this.walkingTweenReset.stop();
            }
            if(!this.shootAvailable){
                this.state = 'Shoot';
                this.stateChanged = true;
                this.walkingTweenReset.stop();
            }
            break;
            case 'Jump':
                if(this.stateChanged){
                    this.stateChanged = false;
                    this.jumpUpTween.start();
                }
                if( this.jumpAnimationEnded && this.jumpAvailable){
                    this.jumpAnimationEnded = false;
                    this.state = 'Idle';
                    this.stateChanged = true;
                    this.jumpUpTween.stop();
                }
            break;
            case 'Shoot':
                if(this.stateChanged){
                    this.stateChanged = false;
                    this.shootTween.start();
                }
                if(this.shootAnimationEnded && this.shootAvailable){
                    this.shootAnimationEnded = false;
                    this.state = 'Idle';
                    this.stateChanged = true;
                    this.shootTween.stop();
                }
            break;

        }
        /*
        this.mesh.getObjectByName("ShoulderDx").rotation.x =  this.currentTheta.ArmShoulderDx * Math.PI / 180.0;
        this.mesh.getObjectByName("ShoulderSx").rotation.x =  this.currentTheta.ArmShoulderSx * Math.PI / 180.0;
        this.mesh.getObjectByName("JointLowerSx").rotation.y =  this.currentTheta.ArmElboxSx * Math.PI / 180.0;
        this.mesh.getObjectByName("JointLowerDx").rotation.y =  this.currentTheta.ArmElboxDx * Math.PI / 180.0;
        this.mesh.getObjectByName("HipDx").rotation.x =  this.currentTheta.LegHipDx * Math.PI / 180.0;
        this.mesh.getObjectByName("HipSx").rotation.x =  this.currentTheta.LegHipSx * Math.PI / 180.0;
        this.mesh.getObjectByName("JointLegLowerSx").rotation.y =  this.currentTheta.LegKneeSx * Math.PI / 180.0;
        this.mesh.getObjectByName("JointLegLowerDx").rotation.y =  this.currentTheta.LegKneeDx * Math.PI / 180.0;
        
        this.mesh.getObjectByName("body").rotation.y =  this.currentTheta.Head * Math.PI / 180.0;
        //this.mesh.getObjectByName("chest").rotation.y =  this.directionAngle;
        */
        }



}


export { RobotBox };
