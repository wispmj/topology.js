function utils() {}
utils.multiplyMatrix = function(a, b) {
    // Matrix multiply a * b
    return [
        a[0] * b[0] + a[2] * b[1],
        a[1] * b[0] + a[3] * b[1],
        a[0] * b[2] + a[2] * b[3],
        a[1] * b[2] + a[3] * b[3],
        a[0] * b[4] + a[2] * b[5] + a[4],
        a[1] * b[4] + a[3] * b[5] + a[5]
    ];
}

utils.degreesToRadians = function(degrees) {
    return degrees * Math.PI / 180;
}

utils.radiansToDegrees = function(radians) {
    return radians / Math.PI * 180;
}

/**
 * Invert transformation t
 * @memberOf fabric.util
 * @param {Array} t The transform
 * @return {Array} The inverted transform
 */
utils.invertTransform = function(t) {
    var a = 1 / (t[0] * t[3] - t[1] * t[2]),
        r = [a * t[3], -a * t[1], -a * t[2], a * t[0]],
        o = fabric.util.transformPoint({ x: t[4], y: t[5] }, r, true);
    r[4] = -o.x;
    r[5] = -o.y;
    return r;
}