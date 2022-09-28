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