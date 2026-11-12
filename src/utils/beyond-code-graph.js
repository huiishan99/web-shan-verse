/** Camera geometry is shared by mouse, touch, keyboard, and category navigation. */
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

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
    ), 0.22, 1.5),
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
  const nextScale = clamp(scale, 0.22, 2.4);
  return {
    x: world.x - (point.x - viewport.width / 2) / nextScale,
    y: world.y - (point.y - viewport.height / 2) / nextScale,
    scale: nextScale,
  };
}

// Category regions stay stable while related works may meet between regions.
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

function boundedPosition(point, original, maximum) {
  const dx = point.x - original.x; const dy = point.y - original.y;
  const distance = Math.hypot(dx, dy);
  if (distance > maximum) {
    point.x = original.x + dx / distance * maximum;
    point.y = original.y + dy / distance * maximum;
  }
}

function pairDirection(first, second) {
  const dx = second.x - first.x; const dy = second.y - first.y;
  const distance = Math.hypot(dx, dy);
  if (distance > 1e-8) return { x: dx / distance, y: dy / distance, distance };
  // No randomness or timer: coincident fixtures always choose the same normal.
  const key = [first.id, second.id].sort().join('\u0000');
  let hash = 2166136261;
  for (let index = 0; index < key.length; index++) hash = Math.imul(hash ^ key.charCodeAt(index), 16777619);
  const angle = (hash >>> 0) / 4294967296 * Math.PI * 2;
  const direction = first.id < second.id ? 1 : -1;
  return { x: Math.cos(angle) * direction, y: Math.sin(angle) * direction, distance: 0 };
}

/**
 * This bounded, one-time relaxation sets base anchors, not animation state.
 * Only supplied semantic edges attract. Unrelated nodes can yield to prevent
 * piles, but weak original-anchor restoration preserves category geography.
 * Context entities have less anchor resistance than collection items.
 */
function relateBaseAnchors(layout, nodes, edges) {
  const byId = new Map(layout.map((node, index) => [node.id, index]));
  const distinct = new Map();
  for (const edge of Array.isArray(edges) ? edges : []) {
    const source = byId.get(edge?.source); const target = byId.get(edge?.target);
    if (source === undefined || target === undefined || source === target) continue;
    const key = [edge.source, edge.target].sort().join('\u0000');
    if (!distinct.has(key)) distinct.set(key, { source: Math.min(source, target), target: Math.max(source, target) });
  }
  const links = [...distinct].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    .map(([, link]) => ({ ...link,
      ideal: clamp(Math.hypot(layout[link.source].x - layout[link.target].x,
        layout[link.source].y - layout[link.target].y), 180, 240),
    }));
  if (!links.length) return layout;

  const originals = layout.map((node) => ({ x: node.x, y: node.y }));
  const maximumDisplacement = 520;
  const minimumSeparation = 100;
  const constrain = (index) => boundedPosition(layout[index], originals[index], maximumDisplacement);

  function separate(iterations) {
    for (let iteration = 0; iteration < iterations; iteration++) {
      let maximumOverlap = 0;
      for (let first = 0; first < layout.length; first++) {
        for (let second = first + 1; second < layout.length; second++) {
          const a = layout[first]; const b = layout[second];
          const normal = pairDirection(a, b);
          const overlap = minimumSeparation - normal.distance;
          if (overlap <= 0) continue;
          maximumOverlap = Math.max(maximumOverlap, overlap);
          const aWeight = nodes[first].isContext ? 1 : 0.65;
          const bWeight = nodes[second].isContext ? 1 : 0.65;
          const correction = (overlap + 1e-5) / (aWeight + bWeight);
          a.x -= normal.x * correction * aWeight; a.y -= normal.y * correction * aWeight;
          b.x += normal.x * correction * bWeight; b.y += normal.y * correction * bWeight;
          constrain(first); constrain(second);
        }
      }
      if (maximumOverlap < 1e-4) break;
    }
  }

  for (let iteration = 0; iteration < 420; iteration++) {
    const forces = layout.map((node, index) => {
      const strength = nodes[index].isContext ? 0.025 : 0.055;
      return { x: (originals[index].x - node.x) * strength, y: (originals[index].y - node.y) * strength };
    });
    for (const { source, target, ideal } of links) {
      const normal = pairDirection(layout[source], layout[target]);
      const strength = (normal.distance - ideal) * 0.24;
      forces[source].x += normal.x * strength; forces[source].y += normal.y * strength;
      forces[target].x -= normal.x * strength; forces[target].y -= normal.y * strength;
    }
    for (let index = 0; index < layout.length; index++) {
      const force = forces[index];
      const length = Math.hypot(force.x, force.y);
      const amount = length > 18 ? 18 / length : 1;
      layout[index].x += force.x * amount * 0.65;
      layout[index].y += force.y * amount * 0.65;
      constrain(index);
    }
    separate(2);
  }
  separate(180);
  for (const node of layout) { node.anchorX = node.x; node.anchorY = node.y; }
  return layout;
}

export function createGraphLayout(nodes, edges = []) {
  const counts = new Map();
  const layout = nodes.map((node) => {
    const index = counts.get(node.category) ?? 0;
    counts.set(node.category, index + 1);
    const center = clusterCenters[node.category] ?? { x: 800, y: 600 };
    const major = index < 3 || node.type === 'group' || node.type === 'person';
    const angle = index * 2.39996323 - Math.PI / 2;
    const distance = index === 0 ? 35 : 110 + Math.sqrt(index) * 42;
    const x = center.x + Math.cos(angle) * distance * 1.28;
    const y = center.y + Math.sin(angle) * distance * 0.87;
    return { id: node.id, x, y, anchorX: x, anchorY: y, major, phase: index * 1.7, radius: major ? 34 : 19 };
  });
  return relateBaseAnchors(layout, nodes, edges);
}
