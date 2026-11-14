/**
 * Return points within the constellation, separate from browser navigation.
 * Call push before a meaningful view change; pan/zoom and search-input batching
 * are owned by the caller. Camera/placement belong to the saved context, but do
 * not make a second logical view of the same category, query, mode and selection.
 */

/** @typedef {{x:number,y:number}} ViewPoint */
/** @typedef {{
 * category:string, query:string, mode:string, selected:string|null,
 * camera:{x:number,y:number,scale:number},
 * userOffsets:Array<[string,ViewPoint]>, positions?:Array<[string,ViewPoint]>, layoutEpoch?:number
 * }} ViewSnapshot */

/** @param {ViewSnapshot} first @param {ViewSnapshot} second */
function sameView(first, second) {
  return first.category === second.category && first.query === second.query
    && first.mode === second.mode && first.selected === second.selected;
}

/** @param {number} [limit] */
export function createViewHistory(limit = 32) {
  if (!Number.isSafeInteger(limit) || limit < 1) {
    throw new RangeError('View history limit must be a positive safe integer');
  }
  /** @type {ViewSnapshot[]} */
  const entries = [];

  return {
    /**
     * Preserve the first departure context when a no-op repeats the same view.
     * @param {ViewSnapshot} snapshot
     */
    push(snapshot) {
      const previous = entries.at(-1);
      if (previous && sameView(previous, snapshot)) return false;
      entries.push(structuredClone(snapshot));
      if (entries.length > limit) entries.shift();
      return true;
    },

    /** @returns {ViewSnapshot|undefined} */
    back() {
      const snapshot = entries.pop();
      return snapshot ? structuredClone(snapshot) : undefined;
    },

    canGoBack() { return entries.length > 0; },
    clear() { entries.length = 0; },
  };
}
