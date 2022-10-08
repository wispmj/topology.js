/**
 * 操作状态
 */
class CanvasState {
    static originalMatrix = [1, 0, 0, 1, 0, 0];

    /**
     * 图元对象
     *  @property {CanvasObject} target
     */
    target;

    /**  
     * @param  {CanvasObject} canvasObject cavas对象
     */
    constructor(canvasObject) {
        this.translateX = 0;
        this.translateY = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.flipX = false;
        this.flipY = false;
        this.angle = 0;

        this.originalX = 0;
        this.originalY = 0;

        this.currentMatrix = [1, 0, 0, 1, 0, 0];
        this.currentAngle = 0;
        this.hasMirror = false;
        this.hasMirrorX = false;
        this.hasMirrorY = false;
        if (canvasObject != null) {
            this.target = canvasObject;
            this.id = canvasObject.id;
        }

        this.operation = new BasicOperation();
    }

    toMatrix() {
        return this.currentMatrix;
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
        var op = this.operation;
        op.angle = radian / Math.PI * 180;
        op.scaleX = scaleX;
        op.scaleY = scaleY;
        op.skewX = skewX / Math.PI * 180;
        op.skewY = 0;
        op.translateX = a[4];
        op.translateY = a[5];

        this.hasMirrorX = (a[0] + a[4]) < 0; //x轴已翻转
        this.hasMirrorY = (a[1] + a[3] + a[5]) < 0;
    }

    addMatrix(matrix) {
        var curMatrix = this.currentMatrix;
        this.currentMatrix = utils.multiplyMatrix(curMatrix, matrix);
        this.toOperation(this.currentMatrix);
    }

    setContext(ctx) {
        var matrix = this.toMatrix();
        ctx.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
    }

    addTranslate(translateX, translateY) {
        var translateMatrix = [1, 0, 0, 1, translateX, translateY];
        this.addMatrix(translateMatrix);
    }

    addRotate(deltaAngle) {
        if (!deltaAngle) {
            return;
        }

        //如果翻转后导致相对坐标系手性与实际坐标系不一致
        if (this.hasMirror) {
            deltaAngle = -deltaAngle;
        }

        this.currentAngle += deltaAngle;
        if (this.currentAngle < 0) {
            this.currentAngle += 360;
        }
        this.currentAngle %= 360;

        if (this.scaleX != 1 || this.scaleY != 1) {
            this.addMatrix([1 / this.scaleX, 0, 0, 1 / this.scaleY, 0, 0]);
        }
        this.rotateAngle(deltaAngle);
        if (this.scaleX != 1 || this.scaleY != 1) {
            this.addMatrix([this.scaleX, 0, 0, this.scaleY, 0, 0]);
        }
    }

    rotateAngle(deltaAngle) {
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

        if (flipAxis == "x") {
            this.flipX = !this.flipX;
            this.hasMirror = !this.hasMirror;
        } else if (flipAxis == "y") {
            this.flipY = !this.flipY;
            this.hasMirror = !this.hasMirror;
        }
        //if has rotate，revert rotate by rotate current angle
        if (this.currentAngle) {
            this.rotateAngle(-this.currentAngle);
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
        //rotate back
        if (this.currentAngle) {
            this.rotateAngle(this.currentAngle);
        }
    }

    addScale(scaleX, scaleY) {
        if (scaleX == 0 || scaleY == 0) {
            return;
        }

        this.scaleX *= scaleX;
        this.scaleY *= scaleY;
        var scaleMatrix = [
            scaleX,
            0,
            0,
            scaleY,
            0,
            0
        ];
        this.addMatrix(scaleMatrix);
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
                opr.flipY ? -scaleY : scaleY,
                0,
                0
            ];
        if (opr.skewX) {
            scaleMatrix = utils.multiplyMatrix(
                scaleMatrix, [1, 0, Math.tan(utils.degreesToRadians(opr.skewX)), 1],
                true);
        }
        if (opr.skewY) {
            scaleMatrix = utils.multiplyMatrix(
                scaleMatrix, [1, Math.tan(utils.degreesToRadians(opr.skewY)), 0, 1],
                true);
        }
        return scaleMatrix;
    }
}

class BasicOperation {

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