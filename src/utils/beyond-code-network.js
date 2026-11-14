/** @typedef {{id:string}} NetworkNode */
/** @typedef {{source:string,target:string}} NetworkLink */

/**
 * Build the currently visible physical network, without changing collection
 * relationships. Membership and semantic links may both be supplied: a pair
 * contributes one reciprocal spring and one degree to each endpoint.
 * Rebuild on visibility changes rather than during animation frames.
 * @param {NetworkNode[]} nodes
 * @param {NetworkLink[]} links
 * @param {ReadonlySet<string>} [activeIds] Omit to include every valid node.
 * @returns {{links:NetworkLink[],masses:Map<string,number>}}
 */
export function createPhysicsNetwork(nodes, links, activeIds) {
  const degrees = new Map();
  for (const node of nodes) {
    const id = node?.id;
    if (typeof id !== 'string' || !id || (activeIds && !activeIds.has(id))) continue;
    if (!degrees.has(id)) degrees.set(id, 0);
  }

  /** @type {NetworkLink[]} */
  const activeLinks = [];
  const pairs = new Set();
  for (const link of links) {
    const source = link?.source;
    const target = link?.target;
    if (source === target || !degrees.has(source) || !degrees.has(target)) continue;
    const pair = JSON.stringify(source < target ? [source, target] : [target, source]);
    if (pairs.has(pair)) continue;
    pairs.add(pair);
    activeLinks.push({ source, target });
    degrees.set(source, degrees.get(source) + 1);
    degrees.set(target, degrees.get(target) + 1);
  }

  const masses = new Map([...degrees].map(([id, degree]) => [id,
    Math.max(0.25, Math.min(16, 1 + 0.18 * degree))]));
  return { links: activeLinks, masses };
}
