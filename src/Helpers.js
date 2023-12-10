function easeInOutQuad(t) {
    // Ensure t is in the range [0, 1]
    t = Math.max(0, Math.min(1, t));
    
    // Apply the ease-in-out equation
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function easeInOutCubic(t) {
    // Ensure t is in the range [0, 1]
    t = Math.max(0, Math.min(1, t));

    // Apply the cubic ease-in-out equation
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}


export { easeInOutQuad, easeInOutCubic, degToRad };