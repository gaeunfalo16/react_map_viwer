import TrackTransforms from "./TrackTransforms";

const Draw = (ctx, canvas, transedXY, nextXY, right, left) => {
    let realPointNum = 0;
    const p1 = ctx.transformedPoint(0, 0);
    const p2 = ctx.transformedPoint(canvas.width, canvas.height);
    ctx.clearRect(p1.x - 1, p1.y - 1, p2.x - p1.x + 2, p2.y - p1.y + 2);
    if(right) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(30 * Math.PI / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

    }
    else if(left) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-30 * Math.PI / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }
    const start_time = new Date().getTime();

    transedXY.forEach((record, idx) => {
        for (let i = 0; i < transedXY[idx].length; i++) {
            ctx.beginPath();
            ctx.moveTo(transedXY[idx][i][0], transedXY[idx][i][1]);
            for (let j = 0; j < nextXY[idx][i].length; j++) {
                ctx.lineTo(nextXY[idx][i][j][0], nextXY[idx][i][j][1]);
                realPointNum++;
            }
            ctx.stroke();
            ctx.closePath();
        }
    });
    const draw_time = new Date().getTime();
    console.log("진짜 찍히는 포인트 개수: ", realPointNum);
    console.log("소요 시간:ㅠ ", (draw_time - start_time) / 1000);
}

export default Draw;