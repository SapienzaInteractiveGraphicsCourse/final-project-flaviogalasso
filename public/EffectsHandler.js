import * as THREE from '/build/three.module.js';
import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { GlitchPass } from './jsm/postprocessing/GlitchPass.js';

class EffectsHandler{

    constructor(composer){
        this.composer = composer;
        this.clock = new THREE.Clock();
        this.clock.getElapsedTime();
        this.lowHealthThreshold = 10;
        this.lowAmmoThreshold = 5;
        this.glitchStarted = false;
        this.glitchDuration = 1;
    }

    update(hp,ammo){
    
            if (hp < this.lowHealthThreshold || ammo < this.lowAmmoThreshold){
                this.composer.passes[1].enabled = true;
                this.composer.passes[0].renderToScreen = false;
            }
            else{
                this.composer.passes[1].enabled = false;
                this.composer.passes[0].renderToScreen = true;
            }
        }

}

export {EffectsHandler};