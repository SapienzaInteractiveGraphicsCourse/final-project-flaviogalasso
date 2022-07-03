import * as THREE from '/build/three.module.js';
import {RobotBox} from './RobotBox.js'

class PlayerHandler{
    constructor(scene, position,RobotMesh){
        this.scene = scene;
        this.name = "Player";

        this.commands = {forward:false, strafeLeft:false, strafeRight:false, rotate:false, backward:false, unrotate:false, jump:false, shift:false, shootPress:false};
        this.moveVelocity = 5.0;
        this.rotateVelocity = 5.0;
        this.gravityVelocity = 5.0;
        this.jumpOffset = 0.1;
        this.originPosition = position;
        this.RobotModel = new RobotBox(this.scene, RobotMesh, this.originPosition, this.name);
    }

    init(){
        this.RobotModel.setVelocities(this.moveVelocity, this.rotateVelocity, this.gravityVelocity, this.jumpOffset);
        this.RobotModel.spawn();
        document.addEventListener('keydown', (e) => this.keyDownEvent(e),false);
        document.addEventListener('keyup', (e) => this.keyUpEvent(e),false);
        //document.addEventListener('mouseup', (e) => this.mouseUpEvent(e),false);
        //document.addEventListener('mousedown', (e) => this.mouseDownEvent(e),false);
        //document.addEventListener("mousemove", (e) => this.mouseMoveEvent(e), false);
    }

    update(clockDelta){
        this.RobotModel.update(this.commands,clockDelta);
    }

    keyDownEvent(event) {
        switch (event.keyCode){
            case 87: //w
            this.commands.forward = true;
            break;
            case 65: //a
            this.commands.rotate = true;
            break;
            case 83: //s
            this.commands.backward = true;
            break;
            case 68: //d
            this.commands.unrotate = true;
            break;
            case 32: //space
            this.commands.jump = true;
            break;
            case 16: //shift
            this.commands.shift = true;
            break;
            case 67: //c
            //this.commands.shoot = true;
            break;
            case 81: //q
            this.commands.strafeLeft = true;
            break;
            case 69: //e
            this.commands.strafeRight = true;
            break;
            
            }
        }
    
        keyUpEvent(event){
        switch (event.keyCode){
            case 87: //w
            this.commands.forward = false;
            break;
            case 65: //a
            this.commands.rotate = false;
            break;
            case 83: //s
            this.commands.backward = false;
            break;
            case 68: //d
            this.commands.unrotate = false;
            break;
            case 32: //space
            this.commands.jump = false;
            break;
            case 16: //shift
            this.commands.shift = false;
            break;
            case 67: //c
            //this.commands.shoot = false;
            break;
            case 81: //q
            this.commands.strafeLeft = false;
            break;
            case 69: //e
            this.commands.strafeRight = false;
            break;
        }
        }

        mouseDownEvent(e){
            switch (e.which){
                case 1:
                    this.commands.shoot = true;
                    break;
            }
}
}

export {PlayerHandler};