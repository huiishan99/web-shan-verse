/** Camera geometry is shared by mouse, touch, keyboard, and category navigation. */
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
// Presentation range for the larger classified overview; force units/limits
// remain owned by the independent physics helper.
export const minCameraScale = 0.16;

export function worldToScreen(point, camera, viewport) {
  return {
    x: (point.x - camera.x) * camera.scale + viewport.width / 2,
    y: (point.y - camera.y) * camera.scale + viewport.height / 2,
  };
}

export function screenToWorld(point, camera, viewport) {
  return {
    x: (point.x - viewport.width / 2) / camera.scale + camera.x,
    y: (point.y - viewport.height / 2) / camera.scale + camera.y,
  };
}

export function fitCamera(points, viewport, padding = 85) {
  if (!points.length) return { x: 800, y: 520, scale: 0.65 };
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
    scale: clamp(Math.min(
      Math.max(60, viewport.width - padding * 2) / Math.max(240, maxX - minX),
      Math.max(60, viewport.height - padding * 2) / Math.max(240, maxY - minY),
    ), minCameraScale, 1.5),
  };
}

export function connectedIds(id, edges) {
  const connected = new Set([id]);
  for (const edge of edges) {
    if (edge.source === id) connected.add(edge.target);
    if (edge.target === id) connected.add(edge.source);
  }
  return connected;
}

export function zoomAt(camera, point, scale, viewport) {
  const world = screenToWorld(point, camera, viewport);
  const nextScale = clamp(scale, minCameraScale, 2.4);
  return {
    x: world.x - (point.x - viewport.width / 2) / nextScale,
    y: world.y - (point.y - viewport.height / 2) / nextScale,
    scale: nextScale,
  };
}

// Legacy category coordinates remain available to callers that use the camera
// helpers. The current layout packs measured category regions independently.
export const clusterCenters = {
  games: { x: 365, y: 270 },
  movies: { x: 960, y: 260 },
  drama: { x: 1310, y: 620 },
  books: { x: 900, y: 960 },
  music: { x: 375, y: 910 },
  foods: { x: 1450, y: 1030 },
  hobbies: { x: 70, y: 610 },
  topics: { x: 1510, y: 200 },
};

const nodeSpacing = 220;
const moduleGap = 40;
const regionMargin = 140;
const captionHeight = 90;
const categoryGap = 220;
const mobileCategoryGap = 640;
const categoryOrder = Object.keys(clusterCenters);
const compareIds = (first, second) => first < second ? -1 : first > second ? 1 : 0;

function phaseFor(id) {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index++) hash = Math.imul(hash ^ id.charCodeAt(index), 16777619);
  return (hash >>> 0) / 4294967296 * Math.PI * 2;
}

function validLinks(nodes, edges) {
  const ids = new Set(nodes.map((node) => node.id));
  const pairs = new Map();
  for (const edge of Array.isArray(edges) ? edges : []) {
    if (!ids.has(edge?.source) || !ids.has(edge?.target) || edge.source === edge.target) continue;
    const pair = [edge.source, edge.target].sort(compareIds);
    pairs.set(JSON.stringify(pair), { source: pair[0], target: pair[1] });
  }
  return [...pairs].sort(([first], [second]) => compareIds(first, second)).map(([, edge]) => edge);
}

function boundsOf(points) {
  return { minX: Math.min(...points.map((point) => point.x)), maxX: Math.max(...points.map((point) => point.x)),
    minY: Math.min(...points.map((point) => point.y)), maxY: Math.max(...points.map((point) => point.y)) };
}

function overlaps(first, second, gap) {
  return first.x < second.x + second.width + gap && first.x + first.width + gap > second.x
    && first.y < second.y + second.height + gap && first.y + first.height + gap > second.y;
}

// Bottom-left packing tries only corners of already placed rectangles.
function packRectangles(items, width, gap) {
  const placed = [];
  for (const item of items) {
    const xs = [...new Set([0, ...placed.map((other) => other.x + other.width + gap)])].sort((a, b) => a - b);
    const ys = [...new Set([0, ...placed.map((other) => other.y + other.height + gap)])].sort((a, b) => a - b);
    let position;
    for (const y of ys) {
      for (const x of xs) {
        const candidate = { ...item, x, y };
        if (x + item.width > width + 1e-7 || placed.some((other) => overlaps(candidate, other, gap))) continue;
        position = candidate; break;
      }
      if (position) break;
    }
    placed.push(position ?? { ...item, x: 0,
      y: Math.max(0, ...placed.map((other) => other.y + other.height + gap)) });
  }
  return { placed, width: Math.max(0, ...placed.map((item) => item.x + item.width)),
    height: Math.max(0, ...placed.map((item) => item.y + item.height)) };
}

function compactPacking(items, aspect, gap) {
  // Geometry determines packing efficiency; stable identity breaks ties. This
  // sorting owns no personal-content order or preference metadata.
  const ordered = [...items].sort((first, second) => second.height - first.height
    || second.width - first.width || compareIds(first.id, second.id));
  const widest = Math.max(...items.map((item) => item.width));
  const area = items.reduce((sum, item) => sum + (item.width + gap) * (item.height + gap), 0);
  let best;
  let score = Infinity;
  for (const factor of [.8, .9, 1, 1.1, 1.2, 1.3, 1.4]) {
    const packing = packRectangles(ordered, Math.max(widest, Math.sqrt(area * aspect) * factor), gap);
    const candidateScore = Math.max(packing.width / aspect, packing.height)
      + Math.sqrt(packing.width * packing.height) * .01;
    if (candidateScore < score) { best = packing; score = candidateScore; }
  }
  return best;
}

function componentModule(ids, byId, adjacency) {
  const members = ids.map((id) => byId.get(id));
  const series = members.filter((node) => node.type === 'series');
  const degrees = ids.map((id) => adjacency.get(id).size);
  const maximum = Math.max(...degrees);
  const centers = ids.filter((id) => adjacency.get(id).size === maximum);
  // Only an explicit series parent or unique graph junction receives a central
  // structural position. Tied works form a ring around empty space.
  const center = series.length === 1 ? series[0].id : centers.length === 1 && maximum > 1 ? centers[0] : null;
  const ring = ids.filter((id) => id !== center);
  const count = ring.length;
  const radius = count === 1 ? center ? nodeSpacing : 0
    : count > 1 ? Math.max(center ? nodeSpacing : 0, nodeSpacing / (2 * Math.sin(Math.PI / count))) : 0;
  const rotation = (phaseFor(ids[0]) - Math.PI) * .18;
  const points = ids.map((id) => {
    if (id === center || (!center && count === 1)) return { id, x: 0, y: 0 };
    const angle = -Math.PI / 2 + rotation + ring.indexOf(id) / count * Math.PI * 2;
    return { id, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  });
  const bounds = boundsOf(points);
  return { id: ids[0], width: bounds.maxX - bounds.minX + nodeSpacing,
    height: bounds.maxY - bounds.minY + nodeSpacing,
    points: points.map((point) => ({ ...point, x: point.x - bounds.minX + nodeSpacing / 2,
      y: point.y - bounds.minY + nodeSpacing / 2 })) };
}

/** Derived category bounds include circular artwork clearance and a caption band.
 * Prefer canonical anchors: explicit gestures may temporarily cross a region.
 * @param {Array<{id:string,x:number,y:number,anchorX?:number,anchorY?:number}>} layout
 * @param {Array<{id:string,category:string}>} nodes
 */
export function categoryRegions(layout, nodes) {
  const positions = new Map(layout.map((node) => [node.id, node]));
  const groups = new Map();
  for (const node of nodes) {
    const point = positions.get(node.id);
    if (!point) continue;
    const points = groups.get(node.category) ?? [];
    points.push({ x: Number.isFinite(point.anchorX) ? point.anchorX : point.x,
      y: Number.isFinite(point.anchorY) ? point.anchorY : point.y });
    groups.set(node.category, points);
  }
  return [...groups].sort(([first], [second]) => {
    const a = categoryOrder.indexOf(first), b = categoryOrder.indexOf(second);
    return (a < 0 ? categoryOrder.length : a) - (b < 0 ? categoryOrder.length : b) || compareIds(first, second);
  }).map(([id, points]) => {
    const raw = boundsOf(points);
    const minX = raw.minX - regionMargin, maxX = raw.maxX + regionMargin;
    const minY = raw.minY - regionMargin - captionHeight, maxY = raw.maxY + regionMargin;
    return { id, minX, minY, maxX, maxY, labelX: (minX + maxX) / 2, labelY: minY + captionHeight / 2 };
  });
}

/** Two levels preserve classification without a synthetic category body/force.
 * Same-category components pack locally; cross-category facts do not merge regions.
 * Positions depend on stable IDs and graph structure, never metadata array rank.
 * @param {Array<{id:string,category:string,type?:string,isContext?:boolean}>} nodes
 * @param {Array<{source:string,target:string}>} [edges]
 * @param {{mobile?:boolean}} [options]
 */
export function createGraphLayout(nodes, edges = [], options = {}) {
  if (!nodes.length) return [];
  const ordered = [...nodes].sort((first, second) => compareIds(first.id, second.id));
  const byId = new Map(ordered.map((node) => [node.id, node]));
  const links = validLinks(nodes, edges);
  const adjacency = new Map(ordered.map((node) => [node.id, new Set()]));
  const degrees = new Map(ordered.map((node) => [node.id, 0]));
  for (const { source, target } of links) {
    degrees.set(source, degrees.get(source) + 1); degrees.set(target, degrees.get(target) + 1);
    if (byId.get(source).category !== byId.get(target).category) continue;
    adjacency.get(source).add(target); adjacency.get(target).add(source);
  }
  const seen = new Set();
  const categories = new Map();
  for (const node of ordered) {
    if (seen.has(node.id)) continue;
    const ids = [], queue = [node.id]; seen.add(node.id);
    while (queue.length) {
      const id = queue.shift(); ids.push(id);
      for (const next of [...adjacency.get(id)].sort(compareIds)) {
        if (!seen.has(next)) { seen.add(next); queue.push(next); }
      }
    }
    ids.sort(compareIds);
    const modules = categories.get(node.category) ?? [];
    modules.push(componentModule(ids, byId, adjacency)); categories.set(node.category, modules);
  }
  const localPoints = [];
  for (const [category, modules] of categories) {
    const packing = compactPacking(modules, options.mobile ? .8 : 1.45, moduleGap);
    for (const item of packing.placed) {
      const jitterX = Math.sin(phaseFor(`${item.id}:module-x`)) * 15;
      const jitterY = Math.sin(phaseFor(`${item.id}:module-y`)) * 15;
      for (const point of item.points) localPoints.push({ id: point.id, category,
        x: point.x + item.x + jitterX, y: point.y + item.y + jitterY });
    }
  }
  const regions = categoryRegions(localPoints, ordered);
  const boxes = regions.map((region) => ({ id: region.id,
    width: region.maxX - region.minX, height: region.maxY - region.minY }));
  const macro = options.mobile ? { placed: [], width: 0, height: Math.max(...boxes.map((box) => box.height)) }
    : compactPacking(boxes, 1.55, categoryGap);
  if (options.mobile) {
    for (const box of boxes) {
      macro.placed.push({ ...box, x: macro.width, y: 0 });
      macro.width += box.width + mobileCategoryGap;
    }
    macro.width -= mobileCategoryGap;
  }
  const translations = new Map(macro.placed.map((box) => {
    const region = regions.find((region) => region.id === box.id);
    return [box.id, { x: box.x - region.minX - macro.width / 2,
      y: box.y - region.minY - macro.height / 2 }];
  }));
  const finalPositions = new Map(localPoints.map((point) => {
    const shift = translations.get(point.category);
    return [point.id, { x: point.x + shift.x, y: point.y + shift.y }];
  }));
  return nodes.map((node) => {
    const point = finalPositions.get(node.id);
    const major = degrees.get(node.id) >= 2;
    return { id: node.id, x: point.x, y: point.y, anchorX: point.x, anchorY: point.y,
      major, phase: phaseFor(node.id), radius: major ? 34 : 19 };
  });
}
