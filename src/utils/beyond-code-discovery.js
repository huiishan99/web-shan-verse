/**
 * The caller passes direct category/query matches, not the graph's expanded
 * neighbor set. Discovery never adds contextual entries or infers a favorite.
 * @param {Array<{id:string,isContext:boolean}>} matches
 * @param {string|null} [selectedId]
 */
export function discoveryCandidateIds(matches, selectedId = null) {
  return matches.filter((node) => !node.isContext && node.id !== selectedId).map((node) => node.id);
}

/**
 * Each distinct eligible node owns an equal interval of the random sample.
 * Graph IDs are unique; the caller owns the current eligible collection.
 * @param {string[]} candidateIds
 * @param {()=>number} [random]
 * @returns {string|null}
 */
export function chooseDiscoveryId(candidateIds, random = Math.random) {
  if (!candidateIds.length) return null;
  const sample = random();
  if (!Number.isFinite(sample) || sample < 0 || sample >= 1) {
    throw new RangeError('Discovery random sample must be in [0, 1)');
  }
  return candidateIds[Math.floor(sample * candidateIds.length)];
}
