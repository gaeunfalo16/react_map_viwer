import React, { useEffect, useRef, useState } from 'react';
import Draw from './Draw.js';
import TransPos from "./TransPos";
import TrackTransforms from "./TrackTransforms";

const Canvas = props => {
    const { mainFileHeader, mainFileRecord } = props;
    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    const [last, setLast] = useState({
        x: 0,
        y: 0
    })
    const [canvas, setCanvas] = useState(canvasRef.current);
    const [ctx, setCtx] = useState(null);

    let [transedXY, nextXY] = [];

    useEffect(() => {
        if(!canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        setCanvas(canvasRef.current);
        setLast({x: canvas.width / 2, y: canvas.height / 2});

        const context = canvas.getContext('2d');
        context.lineWidth = 0.5;
        contextRef.current = context;
        setCtx(context);
    }, [mainFileHeader, mainFileRecord]);

    let scaleFactor = 1.1;
    let dragStart, dragged;
    let ctrlOn;

    const onMouseDown = (evt) => {
        console.log("onMouseDown!");
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        last.x = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        last.y = evt.offsetY || (evt.pageY - canvas.offsetTop);
        dragStart = ctx.transformedPoint(last.x, last.y);
        dragged = false;
    }

    const onMouseMove = (evt) => {
        console.log("onMouseMove!");
        last.x = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        last.y = evt.offsetY || (evt.pageY - canvas.offsetTop);
        dragged = true;
        if (dragStart) {
            const pt = ctx.transformedPoint(last.x, last.y);
            ctx.translate(pt.x - dragStart.x, pt.y - dragStart.y);
            Draw(ctx, canvas, transedXY, nextXY, false, false);
        }
    }

    const onMouseUp = (evt) => {
        console.log("onMouseUp!");
        dragStart = null;
        if (!dragged) zoom(evt.shiftKey ? -1 : 1);
    }

    let zoom = function(clicks){
        console.log("zoom!");
        let pt = ctx.transformedPoint(last.x,last.y);
        ctx.translate(pt.x,pt.y);
        let factor = Math.pow(scaleFactor, clicks);
        ctx.scale(factor,factor);
        ctx.translate(-pt.x,-pt.y);
        Draw(ctx, canvas, transedXY, nextXY, false, false);
    };

    let handleScroll = function(evt){
        console.log("handleScroll!", evt);
        let delta = evt.nativeEvent.wheelDelta ? evt.nativeEvent.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
        if(delta) zoom(delta);
        return evt.stopPropagation() && false;
    };

    const onKeyDown = (evt) => {
        if(evt.ctrlKey) {
            ctrlOn = true;
        }
    }

    if(ctx) {
        TrackTransforms(ctx);
        [transedXY, nextXY] = TransPos(mainFileHeader, mainFileRecord, ctx);
        Draw(ctx, canvas, transedXY, nextXY, false, false);
    }

    const rightRotation = () => {
        Draw(ctx, canvas, transedXY, nextXY, true, false);
    }

    const leftRotation = () => {
        Draw(ctx, canvas, transedXY, nextXY, false, true);
    }

    return (
        <div>
            <div>
                <button onClick={rightRotation}>오른쪽으로 회전</button>
                <button onClick={leftRotation}>왼쪽으로 회전</button>
            </div>
            <canvas
                id="canvas"
                ref={canvasRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onWheel={handleScroll}
                onScroll={handleScroll}
            />
        </div>
    );
}

export default Canvas;