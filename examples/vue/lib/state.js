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


class CanvasState {
    constructor() {

    }




}

class StandardOperation {
    constructor() {
        this.translateX = 0;
        this.translateY = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.flipX = false;
        this.flipY = false;
        this.angle = 0;

        this.originalX = 0;
        this.originalY = 0;
        this.currentMatrix = [];
    }

    static originalMatrix = [1, 0, 0, 1, 0, 0];

    toMatrix() {
        var matrix = [1, 0, 0, 1, this.translateX || 0, this.translateY || 0];
        if (this.angle) {
            matrix = utils.multiplyMatrix(matrix, this.calcRotateMatrix(this));
        }
        if (this.scaleX !== 1 || this.scaleY !== 1 ||
            this.skewX || this.skewY || this.flipX || this.flipY) {
            matrix = utils.multiplyMatrix(matrix, this.calcDimensionsMatrix(this));
        }
        return matrix;
    }

    toOperation(matrix) {
        let a = matrix;
        var radian = Math.atan2(a[1], a[0]),
            denom = Math.pow(a[0], 2) + Math.pow(a[1], 2),
            scaleX = Math.sqrt(denom),
            scaleY = (a[0] * a[3] - a[2] * a[1]) / scaleX,
            skewX = Math.atan2(a[0] * a[2] + a[1] * a[3], denom);
        var op = this;
        op.angle = radian / Math.PI * 180;
        op.scaleX = scaleX;
        op.scaleY = scaleY;
        op.skewX = skewX / Math.PI * 180;
        op.skewY = 0;
        op.translateX = a[4];
        op.translateY = a[5];
    }

    addMatrix(matrix) {
        var curMatrix = this.toMatrix(); //maybe convert twice  to matrix,need fix
        this.currentMatrix = utils.multiplyMatrix(curMatrix, matrix);
        this.toOperation(this.currentMatrix);
    }

    addTranslate(translateX, translateY) {
        var translateMatrix = [1, 0, 0, 1, translateX, translateY];
        this.addMatrix(translateMatrix);
    }

    addRotate(deltaAngle) {
        if (!deltaAngle) {
            return;
        }

        //如果已翻转，再旋转
        if (this.flipX != this.flipY) {
            deltaAngle = -deltaAngle;
        }

        var radian = utils.degreesToRadians(deltaAngle),
            cos = Math.cos(radian),
            sin = Math.sin(radian);
        var rotateMatrix = [cos, sin, -sin, cos, 0, 0];
        this.addMatrix(rotateMatrix);
    }

    addFlip(flipAxis) {
        if (!flipAxis) {
            return;
        }

        //if has rotate，revert rotate by rotate current angle
        var currentAngle = this.angle;
        if (currentAngle) {
            var deltaAngle = -currentAngle;
            var radian = utils.degreesToRadians(deltaAngle),
                cos = Math.cos(radian),
                sin = Math.sin(radian);
            var rotateMatrix = [cos, sin, -sin, cos, 0, 0];
            this.addMatrix(rotateMatrix);
        }
        //then flip on current axis
        flipAxis = flipAxis.toLowerCase();
        var scaleMatrix = [
            flipAxis == "x" ? -1 : 1,
            0,
            0,
            flipAxis == "y" ? -1 : 1,
            0,
            0
        ];
        this.addMatrix(scaleMatrix);

        if (currentAngle) {
            var deltaAngle = currentAngle;
            var radian = utils.degreesToRadians(deltaAngle),
                cos = Math.cos(radian),
                sin = Math.sin(radian);
            var rotateMatrix = [cos, sin, -sin, cos, 0, 0];
            this.addMatrix(rotateMatrix);
        }
    }

    addScale(scaleX, scaleY) {

    }

    calcRotateMatrix(opr) {
        if (!opr.angle) {
            return originalMatrix;
        }
        var radiian = utils.degreesToRadians(opr.angle),
            cos = Math.cos(radiian),
            sin = Math.sin(radiian);
        return [cos, sin, -sin, cos, 0, 0];
    }

    calcDimensionsMatrix(opr) {
        var scaleX = typeof opr.scaleX === 'undefined' ? 1 : opr.scaleX,
            scaleY = typeof opr.scaleY === 'undefined' ? 1 : opr.scaleY,
            scaleMatrix = [
                opr.flipX ? -scaleX : scaleX,
                0,
                0,
                opr.flipY ? -opr : scaleY,
                0,
                0
            ];
        if (opr.skewX) {
            scaleMatrix = utils.multiplyMatrix(
                scaleMatrix, [1, 0, Math.tan(degreesToRadians(opr.skewX)), 1],
                true);
        }
        if (opr.skewY) {
            scaleMatrix = utils.multiplyMatrix(
                scaleMatrix, [1, Math.tan(degreesToRadians(opr.skewY)), 0, 1],
                true);
        }
        return scaleMatrix;
    }
}

class TransformMatrix {
    constructor(arr) {
        this.matrix = arr;
        this.a = arr[0];
        this.b = arr[1];
        this.c = arr[2];
        this.d = arr[3];
        this.e = arr[4];
        this.f = arr[5];
    }



    toOperation() {
        let a = [a, b, c, d, e, f];
        var radian = atan2(a[1], a[0]),
            denom = pow(a[0], 2) + pow(a[1], 2),
            scaleX = sqrt(denom),
            scaleY = (a[0] * a[3] - a[2] * a[1]) / scaleX,
            skewX = atan2(a[0] * a[2] + a[1] * a[3], denom);
        var op = new StandardOperation();
        op.angle = radian / Math.PI * 180;
        op.scaleX = scaleX;
        op.scaleY = scaleY;
        op.skewX = skewX / PiBy180;
        op.skewY = 0;
        op.translateX = a[4];
        op.translateY = a[5];

        return op;
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

}

class Action {
    constructor() {

    }

    name;
    original;
    x;
    y;

}