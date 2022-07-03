import * as THREE from '/build/three.module.js';

class RobotBox{
    constructor(scene, robotmesh, position, name, clock){
        this.scene = scene;
        console.log(robotmesh);
        this.model = robotmesh.model.clone();
        this.originPosition = position;
        this.name = name;

        this.moveVelocity = 0.0;
        this.rotateVelocity = 0.0;
        this.jumpVelocity = 0.1;

        this.lerpTime = 10;
        this.idealRotationAngle =  new THREE.Vector3();
        this.rotationAngle =  new THREE.Vector3();

        this.aimMesh = new THREE.ArrowHelper(this.pointingDirection, this.pointingPosition);
        this.aimMesh.setColor(0xff0000)
        this.aimMesh.setLength (1000, 1, 1) 

        this.clock = clock;
        this.lastRayCastTime = 0;
        this.rayCastTime = 50;
        this.frontBlock = false;
        this.rightBlock = false;
        this.leftBlock = false;
        this.backBlock = false;
        this.rayCastDown = new THREE.Raycaster();
        this.rayCastUp = new THREE.Raycaster();
        this.rayCastFront = new THREE.Raycaster();
        this.rayCastRight = new THREE.Raycaster();
        this.rayCastLeft = new THREE.Raycaster();
        this.rayCastBack = new THREE.Raycaster();

        this.state = 'Idle';
        this.stateChanged = true;
        this.collisionGroundHappened = false;
        this.bumpUp = false;


        this.jumpAvailable = true;
        this.jumpTicks = 0;
        this.jumpAnimationEnded = false;

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
    
  
    spawn(){
        //this.mesh.scale.set(1, 1, 1);
        //this.mesh.position.set(this.originPosition.x, this.originPosition.y, this.originPosition.z);
        this.scene.add(this.model);
 
        //this.initCollider();
        //this.initAnimations();

    }


    initCollider(){
            this.mesh.traverse(function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.geometry.computeBoundingBox();
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            this.collider = new THREE.Box3()
            this.colliderHelper = new THREE.Box3Helper( this.collider, 0xff0000 );
            this.scene.add(this.colliderHelper);
        }

       setVelocities(moveVelocity,rotateVelocity,gravityVelocity,jumpVelocity) {
           this.moveVelocity = moveVelocity;
           this.rotateVelocity = rotateVelocity;
           this.gravityVelocity = gravityVelocity;
           this.jumpVelocity = jumpVelocity;
       }

        update(commands, otherEntities, clockDelta){
            this.updateAnimation(commands);
            this.updateCollisions(otherEntities);
            this.updateMovement(commands,clockDelta);
            this.shoot(commands);
        }

 

        updateMovement(commands,clockDelta) {
        
            if (commands.rotate)  
                this.idealRotationAngle.y += this.rotateVelocity * clockDelta;  
            if (commands.unrotate)  
                this.idealRotationAngle.y -= this.rotateVelocity*clockDelta;
            
            this.rotationAngle.lerp(this.idealRotationAngle, this.lerpTime * clockDelta);
            this.mesh.rotation.y = this.rotationAngle.y;

            if(commands.forward){
                this.mesh.position.z += Math.cos(this.rotationAngle.y) * this.moveVelocity * clockDelta;
                this.mesh.position.x += Math.sin(this.rotationAngle.y) * this.moveVelocity * clockDelta;
            }
            if(commands.backward){
                this.mesh.position.z -= Math.cos(this.rotationAngle.y) * this.moveVelocity * clockDelta;
                this.mesh.position.x -= Math.sin(this.rotationAngle.y) * this.moveVelocity * clockDelta;
            }

            this.pointingPosition.copy(this.mesh.position);
            this.pointingPosition.y += 0.5;

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
                this.mesh.position.y += this.moveVelocity * clockDelta;
            }
        }

        shoot(commands){
        }

        updateCollisions(mapMesh){
            //console.log(this.clock)
            if(this.clock.elapsedTime*1000 - this.lastRayCastTime > this.rayCastTime){
                this.lastRayCastTime = this.clock.elapsedTime*1000;
                const meshPosition = this.mesh.position.clone();
                const meshRotation = this.mesh.rotation.clone();
                const down = new THREE.Vector3( 0, - 1, 0 );
                const up= new THREE.Vector3( 0, 1, 0 );

                //var left = new THREE.Vector3( 1, 0, 0 );
                //var right = new THREE.Vector3( -1, 0, 0 );
                var front = new THREE.Vector3( 0, 0, 1 );
                var back = new THREE.Vector3( 0, 0, -1 );

                var far = 1;

                //left.applyEuler(meshRotation);
                //right.applyEuler(meshRotation);
                front.applyEuler(meshRotation);
                back.applyEuler(meshRotation);

                this.collider.setFromObject( this.mesh );

                // DOWN
                    this.rayCastDown.set(meshPosition, down );
                    this.rayCastDown.far = far;
                    var intersections = this.rayCastDown.intersectObject( mapMesh.mesh, true );

                    if(intersections.length > 0){
                        if(intersections[0].distance <= 0.7) this.bumpUp = true;
                        else this.bumpUp = false;
                        this.collisionGroundHappened = true;
                    }
                    else{
                        this.collisionGroundHappened = false;
                        this.bumpUp = false;
                    }
                /*
                // UP
                    this.rayCastUp.set(meshPosition, up );
                    this.rayCastUp.near = far;
                    var intersections = this.rayCastUp.intersectObject( mapMesh.mesh, true );

                    if(intersections.length > 0){
                        this.bumpUp = true;
                    }
                    else{
                        this.bumpUp = false;
                    }
                    */

        

                    //console.log(intersections)

                
                // FRONT
                    this.rayCastFront.set(meshPosition, front)
                    this.rayCastFront.near = 0.0;
                    this.rayCastFront.far = far;

                    intersections = this.rayCastFront.intersectObject( mapMesh.mesh, true );

                    if(intersections.length > 0) this.frontBlock = true;
                    else this.frontBlock = false;

                // BACK
                    this.rayCastBack.set(meshPosition, back)
                    this.rayCastBack.near = 0.0;
                    this.rayCastBack.far = far;

                    intersections = this.rayCastBack.intersectObject( mapMesh.mesh, true );

                    if(intersections.length > 0) this.backBlock = true;
                    else this.backBlock = false;

                    /*
                // RIGHT

                    this.rayCastRight.set(meshPosition, right)
                    this.rayCastRight.near = 0.0;
                    this.rayCastRight.far = far;

                    intersections = this.rayCastRight.intersectObject( mapMesh.mesh, true );

                    if(intersections.length > 0) this.rightBlock = true;
                    else this.rightBlock = false;


                // LEFT
                    this.rayCastLeft.set(meshPosition, left)
                    this.rayCastLeft.near = 0.0;
                    this.rayCastLeft.far = far;

                    intersections = this.rayCastLeft.intersectObject( mapMesh.mesh, true );

                    if(intersections.length > 0) this.leftBlock = true;
                    else this.leftBlock = false;
                    */

                /*
                this.collisionGroundHappened = false;
                for (const box of boxesArray){

                    if (this.collider.intersectsBox( box.collider)){
                        console.log(this.mesh.position.angleTo(box.mesh.position) * 180 / Math.PI)
                        this.collisionGroundHappened = true;
                    }
                }
                */
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
