export default function findSimplePoints( edge, pairInfo ){
    const rs = edge._private.rscratch;
    rs.edgeType = 'segments';
    rs.segpts = [
        pairInfo.tgtPos.x,
        (-pairInfo.srcH / 2) + pairInfo.srcPos.y,
    ];
}