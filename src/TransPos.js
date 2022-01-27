// 좌표 데이터 -> 픽셀 데이터로 일괄 변환 및 저장
const TransPos = (mainFileHeader, mainFileRecord, ctx) => {
    const start_time = new Date().getTime();
    const shapeType={
        polygon: 5
    }

    const box = {
        xMin: mainFileHeader.xMin,
        xMax: mainFileHeader.xMax,
        yMin: mainFileHeader.yMin,
        yMax: mainFileHeader.yMax
    }
    const coordinateTransferX = (x) => (x - box.xMin) / (box.xMax - box.xMin) * ctx.canvas.height + (ctx.canvas.width - ctx.canvas.height) / 2;
    const coordinateTransferY = (y) => (ctx.canvas.height - (y - box.yMin) / (box.yMax - box.yMin) * ctx.canvas.height);

    let transedXY = [];
    let nextXY = [];
    let numPoints = 0;
    if (mainFileHeader.shapeType === shapeType.polygon) {
        mainFileRecord.forEach((record, idx) => {
            let curPosition = 0;
            const recordContent = record.recordContent;
            numPoints += recordContent.numPoints;
            transedXY[idx] = [];
            nextXY[idx] = [];
            for (let i = 0; i < recordContent.numParts; i++) {
                const nextPart = (recordContent.numParts - 1 - i === 0) ? recordContent.numPoints : recordContent.parts[i + 1];
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

export default TransPos;