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

// Deliberately stable regions; the simulation adds only small, damped movement.
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

export function createGraphLayout(nodes) {
  const counts = new Map();
  return nodes.map((node) => {
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
}
