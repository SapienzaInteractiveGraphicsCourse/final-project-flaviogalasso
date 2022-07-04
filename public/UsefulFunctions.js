import * as THREE from '/build/three.module.js';


const calculateDirectionBetweenVectors = (targetPosition,currentPosition) => {
    var resultDirection = new THREE.Vector3().subVectors(targetPosition,currentPosition).normalize();
    return resultDirection;
}

const calculateYAngleBetweenVectors = (targetPosition,currentPosition) => {
    var dy = targetPosition.x - currentPosition.x;
    var dx = targetPosition.z - currentPosition.z;
    var distanceToTarget = Math.sqrt((dx*dx) + (dy*dy));
    var angleToTarget = Math.atan2(dy,dx);
    return {distanceToTarget: distanceToTarget, angleToTarget:angleToTarget};
}

export {calculateYAngleBetweenVectors,calculateDirectionBetweenVectors};