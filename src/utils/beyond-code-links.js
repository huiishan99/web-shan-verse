/** @typedef {{x:number,y:number}} LinkPoint */

/**
 * A screen-space straight segment outside two visible circular orbits.
 * Gap is clearance beyond each radius. Suppress overlapping/zero-length or
 * invalid geometry rather than drawing a reversed segment through the bubbles.
 * @param {LinkPoint} from
 * @param {LinkPoint} to
 * @param {number} fromRadius
 * @param {number} toRadius
 * @param {number} [gap]
 * @returns {{from:LinkPoint,to:LinkPoint}|null}
 */
export function segmentBetweenCircles(from, to, fromRadius, toRadius, gap = 4) {
  if (![from?.x, from?.y, to?.x, to?.y, fromRadius, toRadius, gap].every(Number.isFinite)
    || fromRadius < 0 || toRadius < 0 || gap < 0) return null;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  const start = fromRadius + gap;
  const end = toRadius + gap;
  if (!Number.isFinite(distance) || distance <= start + end) return null;

  const unitX = dx / distance;
  const unitY = dy / distance;
  return {
    from: { x: from.x + unitX * start, y: from.y + unitY * start },
    to: { x: to.x - unitX * end, y: to.y - unitY * end },
  };
}
