function trackTransforms(ctx) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    // let element = document.createElementNS(namespaceURI, qualifiedName[, options]);
    // 지정된 네임 스페이스 URI와 이름으로 엘리먼트를 만든다.
    let xform = svg.createSVGMatrix(); // create SVGMatrix

    const scale = ctx.scale;
    ctx.scale = function(sx,sy){
        xform = xform.scaleNonUniform(sx,sy);
        // Post-multiplies a non-uniform scale transformation on the current matrix and returns the resulting matrix as SVGMatrix.
        return scale.call(ctx,sx,sy); // ??
    };

    const rotate = ctx.rotate;
    ctx.rotate = function(radians){
        xform = xform.rotate(radians*180/Math.PI);
        return rotate.call(ctx,radians);
    };
    const translate = ctx.translate;
    ctx.translate = function(dx,dy){
        xform = xform.translate(dx,dy);
        return translate.call(ctx,dx,dy);
    };
    const transform = ctx.transform;
    ctx.transform = function(a,b,c,d,e,f){
        let m2 = svg.createSVGMatrix();
        m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
        xform = xform.multiply(m2);
        return transform.call(ctx,a,b,c,d,e,f);
    };

    let pt = svg.createSVGPoint();
    ctx.transformedPoint = function(x,y){
        pt.x=x; pt.y=y;
        return pt.matrixTransform(xform.inverse());
    }
}

const getTransPos = (MainFileHeader, MainFileRecord, ctx) => {
    const start_time = new Date().getTime();
    const shapeType={
        polygon: 5
    }

    const box = {
        xMin: MainFileHeader.xMin,
        xMax: MainFileHeader.xMax,
        yMin: MainFileHeader.yMin,
        yMax: MainFileHeader.yMax
    }
    const coordinateTransferX = (x) => (x - box.xMin) / (box.xMax - box.xMin) * ctx.canvas.height;
    const coordinateTransferY = (y) => (ctx.canvas.height - (y - box.yMin) / (box.yMax - box.yMin) * ctx.canvas.height);

    let transedXY = [];
    let nextXY = [];
    let numPoints = 0;
    if (MainFileHeader.shapeType === shapeType.polygon) {
        /*ctx.translate((window.innerWidth - coordinateTransferX(box.xMax) + coordinateTransferX(box.xMin))/2,
            (window.innerHeight - coordinateTransferX(box.yMax) + coordinateTransferX(box.yMin))/2)*/
        MainFileRecord.forEach((record, idx) => {
            let curPosition = 0;
            const recordContent = record.recordContent;
            numPoints += recordContent.numPoints;
            transedXY[idx] = [];
            nextXY[idx] = [];
            for (let i = 0; i < recordContent.numParts; i++) {
                const nextPart = (recordContent.numParts - 1 - i === 0) ? recordContent.numPoints : recordContent.parts[i + 1];
                // console.log(recordContent.points[curPosition]);
                transedXY[idx].push([coordinateTransferX(recordContent.points[curPosition].x), coordinateTransferY(recordContent.points[curPosition].y)]);
                curPosition += 1;
                nextXY[idx][i] = [];
                for (let j = curPosition; j < nextPart; j++) {
                    nextXY[idx][i].push([coordinateTransferX(recordContent.points[j].x), coordinateTransferY(recordContent.points[j].y)]);
                }
                curPosition = nextPart;
            }
        });

        console.log("포인트의 개수: ", numPoints);
    }
    const trans_time = new Date().getTime();
    console.log("Trans 시간: ", (trans_time - start_time)/1000);
    return [transedXY, nextXY];
}

const draw = (ctx,canvas, MainFileHeader,MainFileRecord) => {
    const [transedXY, nextXY] = getTransPos(MainFileHeader, MainFileRecord, ctx);
    let realPointNum = 0;
    const p1 = ctx.transformedPoint(0, 0);
    const p2 = ctx.transformedPoint(canvas.width, canvas.height);
    ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    const start_time = new Date().getTime();
    ctx.lineWidth = 0.5;
    MainFileRecord.forEach((record, idx) => {
        for (let i = 0; i < transedXY[idx].length; i++) {
            ctx.beginPath();
            ctx.moveTo(transedXY[idx][i][0], transedXY[idx][i][1]);
            for (let j = 0; j < nextXY[idx][i].length; j+=100) {
                ctx.lineTo(nextXY[idx][i][j][0], nextXY[idx][i][j][1]);
                realPointNum++;
            }
            // ctx.fill();
            ctx.stroke();
            ctx.closePath();
        }
    });
    const draw_time = new Date().getTime();
    console.log("진짜 찍히는 포인트 개수: ", realPointNum);
    console.log("소요 시간:ㅠ ", (draw_time - start_time) / 1000);

    // }
}

const zooming = (ctx, canvas, MainFileHeader, MainFileRecord) => {
    trackTransforms(ctx);
    const [transedXY, nextXY] = getTransPos(MainFileHeader, MainFileRecord, ctx);

    function redraw() {
        let realPointNum = 0;
        const p1 = ctx.transformedPoint(0, 0);
        const p2 = ctx.transformedPoint(canvas.width, canvas.height);
        ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
        const start_time = new Date().getTime();
        ctx.lineWidth = 0.5;
        MainFileRecord.forEach((record, idx) => {
            for (let i = 0; i < transedXY[idx].length; i++) {
                ctx.beginPath();
                ctx.moveTo(transedXY[idx][i][0], transedXY[idx][i][1]);
                for (let j = 0; j < nextXY[idx][i].length; j+=100) {
                    ctx.lineTo(nextXY[idx][i][j][0], nextXY[idx][i][j][1]);
                    realPointNum++;
                }
                // ctx.fill();
                ctx.stroke();
                ctx.closePath();
            }
        });
        const draw_time = new Date().getTime();
        console.log("진짜 찍히는 포인트 개수: ", realPointNum);
        console.log("소요 시간:ㅠ ", (draw_time - start_time) / 1000);

    }

    redraw();

    let lastX = canvas.width / 2, lastY = canvas.height / 2;
    let dragStart, dragged;
    canvas.addEventListener('mousedown', function (evt) {
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        dragStart = ctx.transformedPoint(lastX, lastY);
        dragged = false;
    }, false);
    canvas.addEventListener('mousemove', function (evt) {
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        dragged = true;
        if (dragStart) {
            const pt = ctx.transformedPoint(lastX, lastY);
            ctx.translate(pt.x - dragStart.x, pt.y - dragStart.y);
            redraw();
        }
    }, false);
    canvas.addEventListener('mouseup', function (evt) {
        dragStart = null;
        if (!dragged) zoom(evt.shiftKey ? -1 : 1);
    }, false);

    let scaleFactor = 1.1;
    let zoom = function(clicks){
        let pt = ctx.transformedPoint(lastX,lastY);
        ctx.translate(pt.x,pt.y);
        let factor = Math.pow(scaleFactor,clicks);
        ctx.scale(factor,factor);
        ctx.translate(-pt.x,-pt.y);
        redraw();
    }

    let handleScroll = function(evt){
        let delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
        if (delta) zoom(delta);
        return evt.preventDefault() && false;
    };
    canvas.addEventListener('DOMMouseScroll',handleScroll,false);
    canvas.addEventListener('mousewheel',handleScroll,false);

}

export default zooming;