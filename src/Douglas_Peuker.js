const simplifyPath = function( points, tolerance ) {
    // helper classes
    const Vector = function( x, y ) {
        this.x = x;
        this.y = y;

    };

    const Line = function( p1, p2 ) {
        this.p1 = p1;
        this.p2 = p2;

        this.distanceToPoint = function( point ) {
            // slope
            let m = ( this.p2.y - this.p1.y ) / ( this.p2.x - this.p1.x ),
                // y offset
                b = this.p1.y - ( m * this.p1.x ),
                d = [];
            // distance to the linear equation
            d.push( Math.abs( point.y - ( m * point.x ) - b ) / Math.sqrt( Math.pow( m, 2 ) + 1 ) );
            // distance to p1
            d.push( Math.sqrt( Math.pow( ( point.x - this.p1.x ), 2 ) + Math.pow( ( point.y - this.p1.y ), 2 ) ) );
            // distance to p2
            d.push( Math.sqrt( Math.pow( ( point.x - this.p2.x ), 2 ) + Math.pow( ( point.y - this.p2.y ), 2 ) ) );
            // return the smallest distance
            return d.sort( function( a, b ) {
                return ( a - b ); //causes an array to be sorted numerically and ascending
            } )[0];
        };
    };

    const douglasPeucker = function( points, tolerance ) {
        if ( points.length <= 2 ) {
            return [points[0]];
        }
        let returnPoints = [],
            // make line from start to end
            line = new Line( points[0], points[points.length - 1] ),
            // find the largest distance from intermediate points to this line
            maxDistance = 0,
            maxDistanceIndex = 0,
            p;
        for( let i = 1; i <= points.length - 2; i++ ) {
            let distance = line.distanceToPoint( points[i] );
            if( distance > maxDistance ) {
                maxDistance = distance;
                maxDistanceIndex = i;
            }
        }
        // check if the max distance is greater than our tolerance allows
        if ( maxDistance >= tolerance ) {
            p = points[maxDistanceIndex];
            line.distanceToPoint( p, true );
            // include this point in the output
            returnPoints = returnPoints.concat( douglasPeucker( points.slice( 0, maxDistanceIndex + 1 ), tolerance ) );
            // returnPoints.push( points[maxDistanceIndex] );
            returnPoints = returnPoints.concat( douglasPeucker( points.slice( maxDistanceIndex, points.length ), tolerance ) );
        } else {
            // ditching this point
            p = points[maxDistanceIndex];
            line.distanceToPoint( p, true );
            returnPoints = [points[0]];
        }
        return returnPoints;
    };

    let arr = douglasPeucker( points, tolerance );
    // always have to push the very last point on so it doesn't get left off
    arr.push( points[points.length - 1 ] );
    // console.log(arr);
    return arr;
};

export default simplifyPath;