const TrackTransforms = (ctx) => {
    console.log("trackTransforms");
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

export default TrackTransforms;