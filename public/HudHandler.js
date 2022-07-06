import * as THREE from '/build/three.module.js';

class HudHandler{

    constructor(){
        this.height = window.innerHeight;
        this.width = window.innerWidth;
        // We will use 2D canvas element to render our HUD.  
        this.hudCanvas = document.createElement('canvas');
          // Again, set dimensions to fit the screen.
          this.hudCanvas.width = this.width;
          this.hudCanvas.height = this.height;

        // Get 2D context and draw something supercool.
        this.hudBitmap = this.hudCanvas.getContext('2d');
        this.hudBitmap.font = "Normal 30px BankGothic Md BT";
        this.hudBitmap.textAlign = 'center';
        this.hudBitmap.strokeStyle = 'red';
        this.hudBitmap.fillStyle = 'white';
        this.hudBitmap.lineWidth = 4;
   
         
        // Create the camera and set the viewport to match the screen dimensions.
        this.cameraHUD = new THREE.OrthographicCamera(-this.width/2, this.width/2, this.height/2, -this.height/2, 0, 30 );

        // Create also a custom scene for HUD.
        this.sceneHUD = new THREE.Scene();
 
        // Create texture from rendered graphics.
        this.hudTexture = new THREE.Texture(this.hudCanvas) 
        this.hudTexture.needsUpdate = true;
            
        // Create HUD material.
        this.material = new THREE.MeshBasicMaterial( {map: this.hudTexture} );
        this.material.transparent = true;

        // Create plane to render the HUD. This plane fill the whole screen.
        this.planeGeometry = new THREE.PlaneGeometry( this.width, this.height );
        this.plane = new THREE.Mesh( this.planeGeometry, this.material );
        this.sceneHUD.add( this.plane );
    }

    renderHUD(renderer){
        renderer.render(this.sceneHUD, this.cameraHUD);
    }

    reloadDimensions(width, height){
        this.width=width;
        this.height=height;
    }

    introductionScene(difficulty){
        this.hudBitmap.clearRect(0, 0, this.width, this.height);
        this.hudBitmap.strokeText('Planet Invasion', this.width/2, 40);
        this.hudBitmap.fillText('Planet Invasion', this.width/2, 40);
        this.hudBitmap.strokeText('Flavio Galasso', this.width/2, 80);
        this.hudBitmap.fillText('Flavio Galasso', this.width/2, 80);
        this.hudBitmap.fillText('Select 1-2-3 for difficulty:', 300, this.height/2 + 160 );
        this.hudBitmap.fillText('Selected difficulty:'+difficulty, 300, this.height/2 + 160 +40 );
        this.hudBitmap.fillText('Click mouse to play:', this.width-300, this.height/2 + 160 );
        this.hudTexture.needsUpdate = true;

    }

    updateInformations(PlayerEntity, enemyList, currentWave){
        this.hudBitmap.clearRect(0, 0, this.width, this.height);
             
        this.hudBitmap.strokeText('Planet Invasion', this.width/2, 40);
        this.hudBitmap.fillText('Planet Invasion', this.width/2, 40);
   
        this.hudBitmap.fillText("Health:" + PlayerEntity.RobotModel.health, this.width-100, this.height-40);
        this.hudBitmap.fillText("Ammo:" + PlayerEntity.RobotModel.ammo, 100, this.height-40);
        this.hudBitmap.fillText("Aliens Alive:" +enemyList.length, this.width-200, 40);
        this.hudBitmap.fillText("Current Wave:" +currentWave, this.width-200, 80);
        this.hudTexture.needsUpdate = true;
    }

  


    
}

export {HudHandler};