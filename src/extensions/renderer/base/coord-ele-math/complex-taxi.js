import * as math from '../../../../math';
import { lineIntersectsPolygon } from 'geometric';

function simplifyPath(segments){
    const simplified = [];
    segments.forEach(({x1, y1, x2, y2}, i) => {
        if(!segments[i - 1]){
            simplified.push({x1, y1, x2, y2});
        } else {
            if(simplified[i - 1] && segments[i].x1 === segments[i].x2 && simplified[i - 1].x2 === segments[i].x1 && simplified[i - 1].x1 === segments[i].x1){
                if(simplified[i - 1]){
                    simplified[i - 1].y2 = segments[i].y2;
                }

            }
            // else if(segments[i].y1 === segments[i].y2 && simplified[i - 1].y2 === segments[i].y1 && simplified[i - 1].y1 === segments[i].y1){
            //     simplified[i - 1].x2 = segments[i].x2;
            // }
            else {
                simplified.push({x1, y1, x2, y2});
            }
        }
    });
    // console.log(simplified);
    return simplified;
}

export default function findComplexTaxiPoints(edge, pairInfo){
    // Taxicab geometry with two turns maximum

    const rs = edge._private.rscratch;

    rs.edgeType = 'segments';

    const VERTICAL = 'vertical';
    const HORIZONTAL = 'horizontal';
    const LEFTWARD = 'leftward';
    const RIGHTWARD = 'rightward';
    const DOWNWARD = 'downward';
    const UPWARD = 'upward';
    const AUTO = 'auto';

    const { posPts, srcW, srcH, tgtW, tgtH } = pairInfo;
    const edgeDistances = edge.pstyle('edge-distances').value;
    const dIncludesNodeBody = edgeDistances !== 'node-position';
    let taxiDir = edge.pstyle('taxi-direction').value;
    let verticalPadding = edge.pstyle('complex-taxi-vertical-padding').value;
    let horizontalPadding = edge.pstyle('complex-taxi-horizontal-padding').value;

    let rawTaxiDir = taxiDir; // unprocessed value
    const taxiTurn = edge.pstyle('taxi-turn');
    const turnIsPercent = taxiTurn.units === '%';
    const taxiTurnPfVal = taxiTurn.pfValue;
    const turnIsNegative = taxiTurnPfVal < 0; // i.e. from target side
    // let minD = edge.pstyle('taxi-turn-min-distance').pfValue;
    const dw = (dIncludesNodeBody ? (srcW + tgtW)/2 : 0);
    const dh = (dIncludesNodeBody ? (srcH + tgtH)/2 : 0);
    const pdx = posPts.x2 - posPts.x1;
    const pdy = posPts.y2 - posPts.y1;

    // take away the effective w/h from the magnitude of the delta value
    const subDWH = (dxy, dwh) => {
        if( dxy > 0 ){
            return Math.max(dxy - dwh, 0);
        } else {
            return Math.min(dxy + dwh, 0);
        }
    };

    const dx = subDWH(pdx, dw);
    const dy = subDWH(pdy, dh);

    let isExplicitDir = false;

    if( rawTaxiDir === AUTO ){
        taxiDir = Math.abs(dx) > Math.abs(dy) ? HORIZONTAL : VERTICAL;
    } else if( rawTaxiDir === UPWARD || rawTaxiDir === DOWNWARD ){
        taxiDir = VERTICAL;
        isExplicitDir = true;
    } else if( rawTaxiDir === LEFTWARD || rawTaxiDir === RIGHTWARD ){
        taxiDir = HORIZONTAL;
        isExplicitDir = true;
    }

    const isVert = taxiDir === VERTICAL;
    let l = isVert ? dy : dx;
    let pl = isVert ? pdy : pdx;
    let sgnL = math.signum(pl);


    if(
        !(isExplicitDir && (turnIsPercent || turnIsNegative)) // forcing in this case would cause weird growing in the opposite direction
        && (
            (rawTaxiDir === DOWNWARD && pl < 0)
            || (rawTaxiDir === UPWARD && pl > 0)
            || (rawTaxiDir === LEFTWARD && pl > 0)
            || (rawTaxiDir === RIGHTWARD && pl < 0)
        )
    ){
        sgnL *= -1;
        l = sgnL * Math.abs(l);
    }

    let d;

    if( turnIsPercent ){
        const p = taxiTurnPfVal < 0 ? (1 + taxiTurnPfVal) : (taxiTurnPfVal);

        d = p * l;
    } else {
        const k = taxiTurnPfVal < 0 ? (l) : (0);

        d = k + taxiTurnPfVal * sgnL;
    }

    const nodes = this.cy.nodes(`[id!="${edge.data('source')}"][id!="${edge.data('target')}"]`);
    // console.log(edge.id(), pairInfo);
    const sourceEndPoint = pairInfo.srcPos;
    const targetEndPoint = pairInfo.tgtPos;

    if( isVert ){
        console.warn('complex-taxi vertical not supported');
        let y = posPts.y1 + d + (dIncludesNodeBody ? srcH/2 * sgnL : 0);
        let { x1, x2 } = posPts;

        rs.segpts = [
            x1, y,
            x2, y
        ];
    } else { // horizontal
        let x = posPts.x1 + d + (dIncludesNodeBody ? srcW/2 * sgnL : 0);
        let { y1, y2 } = posPts;
        let allSegments = [
            {
                x1: sourceEndPoint.x,
                y1: sourceEndPoint.y,
                x2: x,
                y2: y1
            },
            {
                x1: x,
                y1: y1,
                x2: x,
                y2: y2
            },
            {
                x1: x,
                y1: y2,
                x2: targetEndPoint.x,
                y2: targetEndPoint.y
            }
        ];
        let newSegments = JSON.parse(JSON.stringify(allSegments));
        // const _d = 10;
        // console.clear();
        nodes.forEach((node, k) => {
            // console.log('start node', node.id());
            const bb = node.bb();
            // console.log({sourceEndPoint, targetEndPoint, bb});
            if((bb.x1 >= sourceEndPoint.x && bb.x1 <= targetEndPoint.x) || (bb.x2 >= sourceEndPoint.x && bb.x2 <= targetEndPoint.x)){ // preliminary exclusion
                for(const [i, segment] of allSegments.entries()){
                    const intersect = lineIntersectsPolygon([[segment.x1, segment.y1], [segment.x2, segment.y2]],
                        [[bb.x1, bb.y1], [bb.x2, bb.y1], [bb.x2, bb.y2], [bb.x1, bb.y2]]);
                    if(intersect){
                        // console.log(i, intersect, segment, bb);
                        if(segment.x1 === segment.x2){ // segment is vertical
                            console.warn('complex-taxi vertical segment not supported');
                        } else if(segment.y1 === segment.y2){ // segment is horizontal
                            if(bb.x1 - segment.x1 <= horizontalPadding && bb.x2 - segment.x2 <= horizontalPadding){ // segment is already too close to the intersected node
                                // console.log('close detour!');
                                if(newSegments[i-1]){
                                    newSegments[i-1].y2 = bb.y2 + verticalPadding;
                                }

                                newSegments[i].y1 = bb.y2 + verticalPadding;
                                newSegments[i].y2 = bb.y2 + verticalPadding;
                            } else {
                                // console.log('adding segments');
                                newSegments.splice(i + 1, 0, {
                                    x1: bb.x1 - horizontalPadding,
                                    y1: segment.y1,
                                    x2: bb.x1 - horizontalPadding,
                                    y2: bb.y2 + verticalPadding
                                },
                                {
                                    x1: bb.x1 - horizontalPadding,
                                    y1: bb.y2 + verticalPadding,
                                    x2: x, // bb.x2 + horizontalPadding,
                                    y2: bb.y2 + verticalPadding
                                },
                                {
                                    x1: x, // bb.x2 + horizontalPadding,
                                    y1: bb.y2 + verticalPadding,
                                    x2: x, // bb.x2 + horizontalPadding,
                                    y2: segment.y2
                                });

                                newSegments[i].x2 = bb.x1 - horizontalPadding;
                            }
                        }
                    }
                }
            }
            allSegments = JSON.parse(JSON.stringify(newSegments));
            // console.log('end node', node.id());
            // console.log(JSON.parse(JSON.stringify(newSegments)));
        });
        newSegments = simplifyPath(JSON.parse(JSON.stringify(newSegments)));
        // console.log(newSegments, newSegments.map(({ x2, y2 }) => [x2, y2]).slice(0, -1).flat());
        const segments = newSegments.map(({ x2, y2 }) => [x2, y2]).slice(0, -1).flat();
        // console.log(segments, rs, rs.endY)
        segments[segments.length - 1] = rs.endY || targetEndPoint.y
        rs.segpts = segments
        // rs.segpts = [
        //     x, y1,
        //     x, y2
        // ];
    }

}