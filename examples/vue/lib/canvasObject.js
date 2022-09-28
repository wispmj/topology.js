/**
 * 基础canvas对象
 */
class CanvasObject {
    /**
     * canvas对象的操作状态
     */
    canvasState;


    /**
     * @property {Rect} 边框矩形
     */
    borderRect;

    /**
     * CanvasObject的构造方法
     * @param {string} id 对象的ID
     * @param {{x:number,y:number,width:number,height:number}} rect 对象边框
     */
    constructor(id, rect) {
        this.id = id;
        this.x = rect.x;
        this.y = rect.y;
        this.top = this.y;
        this.left = this.x;
        this.width = rect.width;
        this.height = rect.height;

        this.caclRect();

        this.canvasState = new CanvasState(this);
    }

    caclRect() {

        this.cx = this.x + this.width / 2;
        this.cy = this.y + this.height / 2;
        this.ex = this.x + this.width;
        this.ey = this.y + this.height;

        this.borderRect = {
            x: this.x,
            y: this.y,
            ex: this.ex,
            ey: this.ey,
            width: this.width,
            height: this.height,
            cx: this.cx,
            cy: this.cy,
        };
    }

    /**
     * canvas对象的边界矩形
     * @returns {Rect} border rect
     */
    getBBox() {
        // return new {
        //     x: this.x,
        //     y: this.y,
        //     width: this.width,
        //     height: this.height,
        //     cx: this.x + this.width / 2,
        //     cy: this.y + this.height / 2,
        //     ex: this.x + this.width,
        //     ey: this.y + this.height,
        // }
    }

    translate(tx, ty) {
        console.log(this.id + ",translate==>  tx:" + tx + ",ty:" + ty);

        var state = this.canvasState;
        state.addTranslate(tx, ty);
    }

    translateForProperty(tx, ty) {
        this.x += tx;
        this.y += ty;
    }

    rotateByPoint(angle, point) {
        console.log(this.id + ",rotate==>  angle:" + angle);

        var state = this.canvasState;

        state.addTranslate(point.x, point.y);
        state.addRotate(angle);
        state.addTranslate(-point.x, -point.y);
    }

    rotate(angle) {
        console.log(this.id + ",rotate==>  angle:" + angle);

        var state = this.canvasState;
        state.addTranslate(this.cx, this.cy);
        state.addRotate(angle);
        state.addTranslate(-this.cx, -this.cy);
    }

    flip(flipDir) {
        console.log(this.id + ",flip==>  dir:" + flipDir);

        var state = this.canvasState;
        state.addTranslate(this.cx, this.cy);
        state.addFlip(flipDir);
        state.addTranslate(-this.cx, -this.cy);
    }

    scale(sx, sy) {
        console.log(this.id + ",scale==>  sx:" + sx + ",sy:" + sy);

        var state = this.canvasState;
        state.addTranslate(this.x, this.y);
        state.addScale(sx, sy);
        state.addTranslate(-this.x, -this.y);
    }

    setContext(ctx) {
        var matrix = this.canvasState.toMatrix();
        ctx.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
    }
}

/**
 * 矩形
 */
class Rect extends CanvasObject {
    constructor(id, rect) {
        super(id, rect);
    }

}

/**
 * 组合
 */
class Group extends CanvasObject {
    /**
     * 
     * @param {string} id 
     * @param {CanvasObject[]} children 
     */
    constructor(id, children) {
        this.id = id;
        this.children = children;
        //TODO rect
    }
}