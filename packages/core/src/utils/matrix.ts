
class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * Adds another point to this one
     * @param ·{fabric.Point} that
     * @return {fabric.Point} thisArg
     * @chainable
     */
    addEquals(that) {
        this.x += that.x;
        this.y += that.y;
        return this;
    };
}

class Vector {
    x: number;
    y: number;
}

interface Operation {
    name: string;
}

class Rotation implements Operation {
    name: string = "rotate";

    origin: Point;
    radians: Number;
}

class Translation extends Vector implements Operation {
    name: string = "traslate";
    x: number;
    y: number;
}

class Flip implements Operation {
    name: string = "flip";
    x: number;
    y: number;
}

class Scale extends Vector implements Operation {
    name: string = "scale";
    x: number;
    y: number;
}

/**
 * Transforms degrees to radians.
 * @param  degrees value in degrees
 * @return  value in radians
 */
export function degreesToRadians(degrees: number) {
    return degrees * Math.PI / 180;
}

/**
 * Transforms radians to degrees.
 * @param {Number} radians  value in radians
 * @return {Number} value in degrees
 */
export function radiansToDegrees(radians: number) {
    return radians / Math.PI * 180;
}

/**
     * Calculate the cos of an angle, avoiding returning floats for known results
     * @param {Number} angle the angle in radians or in degree
     * @return {Number}
     */
export function cos(angle): number {
    if (angle === 0) { return 1; }
    if (angle < 0) {
        // cos(a) = cos(-a)
        angle = -angle;
    }
    var angleSlice = angle / Math.PI * 2;
    switch (angleSlice) {
        case 1: case 3: return 0;
        case 2: return -1;
    }
    return Math.cos(angle);
}

/**
 * Calculate the sin of an angle, avoiding returning floats for known results
 * @param {Number} angle the angle in radians or in degree
 * @return {Number}
 */
export function sin(angle): number {
    if (angle === 0) { return 0; }
    var angleSlice = angle / Math.PI * 2, sign = 1;
    if (angle < 0) {
        // sin(-a) = -sin(a)
        sign = -1;
    }
    switch (angleSlice) {
        case 1: return sign;
        case 2: return 0;
        case 3: return -sign;
    }
    return Math.sin(angle);
}

/**
 * Rotates `point` around `origin` with `radians`
 * @param {Point} point The point to rotate
 * @param {Point} origin The origin of the rotation
 * @param {Number} radians The radians of the angle for the rotation
 * @return {Point} The new rotated point
 */
export function rotatePoint(point: Point, origin: Point, radians: number) {
    var newPoint = new Point(point.x - origin.x, point.y - origin.y);
    var v = rotateVector(newPoint, radians);
    return v.addEquals(origin);
}

/**
 * Rotates `vector` with `radians`
 * @param {Object} vector The vector to rotate (x and y)
 * @param {Number} radians The radians of the angle for the rotation
 * @return {Point} The new rotated point
 */
export function rotateVector(vector, radians: number): Point {
    var sin = Math.sin(radians),
        cos = Math.cos(radians),
        rx = vector.x * cos - vector.y * sin,
        ry = vector.x * sin + vector.y * cos;
    return new Point(rx, ry);
}


/**
* Apply transform t to point p
* @param  {Point} p The point to transform
* @param  {Array} t The transform
* @param  {Boolean} [ignoreOffset] Indicates that the offset should not be applied
* @return {Point} The transformed point
*/
export function transformPoint(p: Point, t: number[], ignoreOffset: boolean): Point {
    if (ignoreOffset) {
        return new Point(
            t[0] * p.x + t[2] * p.y,
            t[1] * p.x + t[3] * p.y
        );
    }
    return new Point(
        t[0] * p.x + t[2] * p.y + t[4],
        t[1] * p.x + t[3] * p.y + t[5]
    );
}

/**
   * Multiply matrix A by matrix B to nest transformations
   * @param  {Array} a First transformMatrix
   * @param  {Array} b Second transformMatrix
   * @param  {Boolean} is2x2 flag to multiply matrices as 2x2 matrices
   * @return {Array} The product of the two transform matrices
   */
export function multiplyTransformMatrices(a: number[], b: number[], is2x2: boolean = false) {
    // Matrix multiply a * b
    return [
        a[0] * b[0] + a[2] * b[1],
        a[1] * b[0] + a[3] * b[1],
        a[0] * b[2] + a[2] * b[3],
        a[1] * b[2] + a[3] * b[3],
        is2x2 ? 0 : a[0] * b[4] + a[2] * b[5] + a[4],
        is2x2 ? 0 : a[1] * b[4] + a[3] * b[5] + a[5]
    ];
}

/**
 * Decomposes standard 2x3 matrix into transform components
 * @param  {Array} a transformMatrix
 * @return {Object} Components of transform
 */
export function qrDecompose(a) {
    // var angle = atan2(a[1], a[0]),
    //     denom = pow(a[0], 2) + pow(a[1], 2),
    //     scaleX = sqrt(denom),
    //     scaleY = (a[0] * a[3] - a[2] * a[1]) / scaleX,
    //     skewX = atan2(a[0] * a[2] + a[1] * a [3], denom);
    // return {
    //   angle: angle / PiBy180,
    //   scaleX: scaleX,
    //   scaleY: scaleY,
    //   skewX: skewX / PiBy180,
    //   skewY: 0,
    //   translateX: a[4],
    //   translateY: a[5]
    // };
}

/**
 * Returns a transform matrix starting from an object of the same kind of
 * the one returned from qrDecompose, useful also if you want to calculate some
 * transformations from an object that is not enlived yet
 * @param  {Object} options
 * @param  {Number} [options.angle] angle in degrees
 * @return {Number[]} transform matrix
 */
export function calcRotateMatrix(options): number[] {
    var iMatrix = [1, 0, 0, 1, 0, 0];
    if (!options.angle) {
        return iMatrix;
    }
    var theta = degreesToRadians(options.angle),
        cos = cos(theta),
        sin = sin(theta);
    return [cos, sin, -sin, cos, 0, 0];
}

/**
 * Returns a transform matrix starting from an object of the same kind of
 * the one returned from qrDecompose, useful also if you want to calculate some
 * transformations from an object that is not enlived yet.
 * is called DimensionsTransformMatrix because those properties are the one that influence
 * the size of the resulting box of the object.
 * @param  {Object} options
 * @param  {Number} [options.scaleX]
 * @param  {Number} [options.scaleY]
 * @param  {Boolean} [options.flipX]
 * @param  {Boolean} [options.flipY]
 * @param  {Number} [options.skewX]
 * @param  {Number} [options.skewY]
 * @return {Number[]} transform matrix
 */
export function calcDimensionsMatrix(options): number[] {
    var scaleX = typeof options.scaleX === 'undefined' ? 1 : options.scaleX,
        scaleY = typeof options.scaleY === 'undefined' ? 1 : options.scaleY,
        scaleMatrix = [
            options.flipX ? -scaleX : scaleX,
            0,
            0,
            options.flipY ? -scaleY : scaleY,
            0,
            0],
        multiply = multiplyTransformMatrices,
        degreesToRadians = degreesToRadians;
    if (options.skewX) {
        scaleMatrix = multiply(
            scaleMatrix,
            [1, 0, Math.tan(degreesToRadians(options.skewX)), 1],
            true);
    }
    if (options.skewY) {
        scaleMatrix = multiply(
            scaleMatrix,
            [1, Math.tan(degreesToRadians(options.skewY)), 0, 1],
            true);
    }
    return scaleMatrix;
}

/**
 * Returns a transform matrix starting from an object of the same kind of
 * the one returned from qrDecompose, useful also if you want to calculate some
 * transformations from an object that is not enlived yet
 * @param  {Object} options
 * @param  {Number} [options.angle]
 * @param  {Number} [options.scaleX]
 * @param  {Number} [options.scaleY]
 * @param  {Boolean} [options.flipX]
 * @param  {Boolean} [options.flipY]
 * @param  {Number} [options.skewX]
 * @param  {Number} [options.skewX]
 * @param  {Number} [options.translateX]
 * @param  {Number} [options.translateY]
 * @return {Number[]} transform matrix
 */
export function composeMatrix(options): number[] {
    var matrix = [1, 0, 0, 1, options.translateX || 0, options.translateY || 0],
        multiply = multiplyTransformMatrices;
    if (options.angle) {
        matrix = multiply(matrix, calcRotateMatrix(options));
    }
    if (options.scaleX !== 1 || options.scaleY !== 1 ||
        options.skewX || options.skewY || options.flipX || options.flipY) {
        matrix = multiply(matrix, calcDimensionsMatrix(options));
    }
    return matrix;
}

/**
 * reset an object transform state to neutral. Top and left are not accounted for
 * @param  {fabric.Object} target object to transform
 */
export function resetObjectTransform(target) {
    // target.scaleX = 1;
    // target.scaleY = 1;
    // target.skewX = 0;
    // target.skewY = 0;
    // target.flipX = false;
    // target.flipY = false;
    // target.rotate(0);
}

/**
 * Extract Object transform values
 * @param  {fabric.Object} target object to read from
 * @return {Object} Components of transform
 */
export function saveObjectTransform(target) {
    return {
        scaleX: target.scaleX,
        scaleY: target.scaleY,
        skewX: target.skewX,
        skewY: target.skewY,
        angle: target.angle,
        left: target.left,
        flipX: target.flipX,
        flipY: target.flipY,
        top: target.top
    };
}