/**
 * Frame the selected work with its direct local connections. A factual link to
 * another category remains part of the graph, but cannot pull the camera across
 * distant category regions. The selected work is always a framing point.
 * @param {string} selectedId
 * @param {Map<string,{category:string}>} nodesById
 * @param {Iterable<string>} neighbors
 */
export function selectionFocusIds(selectedId, nodesById, neighbors) {
  const selected = nodesById.get(selectedId);
  if (!selected) return [];
  const ids = new Set([selectedId]);
  for (const id of neighbors) {
    if (nodesById.get(id)?.category === selected.category) ids.add(id);
  }
  return [...ids];
}
