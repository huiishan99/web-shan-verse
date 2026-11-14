/**
 * Degree describes confirmed connections in the full graph, never the current
 * filter. Optional owner-specified preference levels add at most six pixels.
 * @param {number} degree
 * @param {number} [sizeBoost]
 */
export function baseNodeDiameter(degree, sizeBoost = 0) {
  const connections = Number.isFinite(degree) ? Math.max(0, degree) : 0;
  const boost = Number.isInteger(sizeBoost) ? Math.max(0, Math.min(3, sizeBoost)) : 0;
  return Math.min(76, 34 + 12 * Math.log2(connections + 1)) + boost * 2;
}

/**
 * Selection is temporary emphasis; it does not record a favorite preference.
 * Keep every visible circle within a bounded screen-space diameter when zooming.
 * @param {number} base
 * @param {number} scale
 * @param {boolean} [selected]
 */
export function screenNodeDiameter(base, scale, selected = false) {
  const diameter = Number.isFinite(base) && base > 0 ? base : 34;
  const zoom = Number.isFinite(scale) && scale > 0 ? scale : 1;
  return Math.max(24, Math.min(82, (diameter + (selected ? 6 : 0)) * Math.sqrt(zoom)));
}
