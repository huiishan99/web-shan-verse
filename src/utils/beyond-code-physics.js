/**
 * Small position-based graph solver. Coordinates/velocities are world units and
 * seconds; radii/padding are screen pixels. This is damped graph physics, not a
 * fluid simulation. It owns no timer, DOM, random seed, or persistent state.
 *
 * Links preserve the relative vector between target anchors. A normal
 * length-only spring barely responds to sideways dragging of a long link;
 * displacement springs let connected works follow that gesture immediately.
 * Category cohesion is a separate, weaker layout force, never a semantic edge.
 */

/** @typedef {{id:string,x:number,y:number,vx:number,vy:number,targetX?:number,targetY?:number,radius?:number,screenRadius?:number,category?:string}} PhysicsNode */
/** @typedef {{source:string,target:string}} PhysicsLink */
/** @typedef {{
 * dt?:number, scale?:number, activeIds?:ReadonlySet<string>,
 * draggedId?:string|null, dragPoint?:{x:number,y:number}|null,
 * fixedIds?:ReadonlySet<string>, categoryFor?:(node:PhysicsNode)=>string|undefined,
 * radiusFor?:(node:PhysicsNode)=>number, padding?:number,
 * anchorOffsetFor?:(node:PhysicsNode)=>{x:number,y:number}|undefined,
 * anchorStrength?:number, linkStrength?:number, categoryStrength?:number,
 * repulsionStrength?:number, repulsionRange?:number, damping?:number,
 * maxSpeed?:number, maxAcceleration?:number, iterations?:number
 * }} PhysicsOptions */

const finite = (value, fallback) => Number.isFinite(value) ? value : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function limit(vector, maximum) {
  vector.x = finite(vector.x, vector.x === Infinity ? maximum : vector.x === -Infinity ? -maximum : 0);
  vector.y = finite(vector.y, vector.y === Infinity ? maximum : vector.y === -Infinity ? -maximum : 0);
  const length = Math.hypot(vector.x, vector.y);
  if (length > maximum) {
    const ratio = maximum / length;
    vector.x *= ratio;
    vector.y *= ratio;
  }
  return vector;
}

// The normal remains deterministic even when two circles start at one point.
function coincidentNormal(first, second) {
  const forward = first < second;
  const key = forward ? `${first}\u0000${second}` : `${second}\u0000${first}`;
  let hash = 2166136261;
  for (let index = 0; index < key.length; index++) {
    hash = Math.imul(hash ^ key.charCodeAt(index), 16777619);
  }
  const angle = (hash >>> 0) / 4294967296 * Math.PI * 2;
  const direction = forward ? 1 : -1;
  return { x: Math.cos(angle) * direction, y: Math.sin(angle) * direction };
}

function prepare(nodes, options) {
  const scale = clamp(finite(options.scale, 1), 0.05, 10);
  const padding = clamp(finite(options.padding, 8), 0, 100) / scale;
  const entries = nodes.filter((node) => !options.activeIds || options.activeIds.has(node.id))
    .map((node) => {
      node.x = finite(node.x, finite(node.targetX, 0));
      node.y = finite(node.y, finite(node.targetY, 0));
      node.vx = finite(node.vx, 0);
      node.vy = finite(node.vy, 0);
      const defaultRadius = finite(node.screenRadius, finite(node.radius, 20) * Math.sqrt(scale));
      const radius = clamp(finite(options.radiusFor?.(node), defaultRadius), 0.5, 300) / scale;
      return {
        node, radius,
        targetX: finite(node.targetX, node.x), targetY: finite(node.targetY, node.y),
        category: options.categoryFor?.(node) ?? node.category,
        fixed: node.id === options.draggedId || !!options.fixedIds?.has(node.id),
      };
    });
  const byId = new Map(entries.map((entry) => [entry.node.id, entry]));
  const dragged = options.draggedId ? byId.get(options.draggedId) : undefined;
  if (dragged && options.dragPoint && Number.isFinite(options.dragPoint.x) && Number.isFinite(options.dragPoint.y)) {
    dragged.node.x = options.dragPoint.x;
    dragged.node.y = options.dragPoint.y;
  }
  for (const entry of entries) {
    if (entry.fixed) { entry.node.vx = 0; entry.node.vy = 0; }
  }
  return { entries, byId, scale, padding };
}

function separation(first, second, padding) {
  const dx = second.node.x - first.node.x;
  const dy = second.node.y - first.node.y;
  const distance = Math.hypot(dx, dy);
  const normal = distance > 1e-8
    ? { x: dx / distance, y: dy / distance }
    : coincidentNormal(first.node.id, second.node.id);
  return { distance, normal, minimum: first.radius + second.radius + padding };
}

function maxOverlap(entries, padding) {
  let maximum = 0;
  for (let first = 0; first < entries.length; first++) {
    for (let second = first + 1; second < entries.length; second++) {
      const pair = separation(entries[first], entries[second], padding);
      maximum = Math.max(maximum, pair.minimum - pair.distance);
    }
  }
  return maximum;
}

function projectCollisions(entries, padding, iterations) {
  for (let iteration = 0; iteration < iterations; iteration++) {
    let maximum = 0;
    for (let first = 0; first < entries.length; first++) {
      for (let second = first + 1; second < entries.length; second++) {
        const a = entries[first]; const b = entries[second];
        const aWeight = a.fixed ? 0 : 1;
        const bWeight = b.fixed ? 0 : 1;
        const weight = aWeight + bWeight;
        if (!weight) continue;
        const { distance, minimum, normal } = separation(a, b, padding);
        const overlap = minimum - distance;
        if (overlap <= 0) continue;
        maximum = Math.max(maximum, overlap);
        const correction = (overlap + 1e-7) / weight;
        a.node.x -= normal.x * correction * aWeight;
        a.node.y -= normal.y * correction * aWeight;
        b.node.x += normal.x * correction * bWeight;
        b.node.y += normal.y * correction * bWeight;
        // Inelastic contact removes approaching velocity, never adds a bounce.
        const approaching = (b.node.vx - a.node.vx) * normal.x + (b.node.vy - a.node.vy) * normal.y;
        if (approaching < 0) {
          const impulse = -approaching / weight;
          a.node.vx -= normal.x * impulse * aWeight;
          a.node.vy -= normal.y * impulse * aWeight;
          b.node.vx += normal.x * impulse * bWeight;
          b.node.vy += normal.y * impulse * bWeight;
        }
      }
    }
    if (maximum < 1e-4) break;
  }
}

function diagnostics(entries, padding) {
  let maximum = 0;
  for (const { node } of entries) maximum = Math.max(maximum, Math.hypot(node.vx, node.vy));
  const overlap = maxOverlap(entries, padding);
  return { maxSpeed: maximum, maxOverlap: overlap, settled: maximum < 0.05 && overlap < 0.01 };
}

/**
 * Mutates only x/y/vx/vy of active input nodes; target anchors stay untouched.
 * dt is seconds. Long gaps are clamped, not caught up after a hidden tab resumes.
 * maxSpeed/maxAcceleration/repulsionRange are screen units per second/per second²/pixels.
 * @param {PhysicsNode[]} nodes
 * @param {PhysicsLink[]} links
 * @param {PhysicsOptions} [options]
 */
export function stepPhysics(nodes, links, options = {}) {
  const { entries, byId, scale, padding } = prepare(nodes, options);
  const requestedDt = options.dt === undefined ? 1 / 60 : finite(options.dt, 0);
  const duration = clamp(requestedDt, 0, 0.05);
  // Zero elapsed time never integrates or resolves contacts. An explicit drag
  // pin and invalid-state normalization in prepare still take effect.
  if (duration === 0) return diagnostics(entries, padding);
  const steps = Math.max(1, Math.ceil(duration / (1 / 120)));
  const dt = duration / steps;
  const anchorStrength = clamp(finite(options.anchorStrength, 4.8), 0, 100);
  const linkStrength = clamp(finite(options.linkStrength, 11), 0, 100);
  const categoryStrength = clamp(finite(options.categoryStrength, 0.65), 0, 20);
  const repulsionStrength = clamp(finite(options.repulsionStrength, 28), 0, 200);
  const repulsionRange = clamp(finite(options.repulsionRange, 18), 0, 200) / scale;
  const damping = Math.exp(-clamp(finite(options.damping, 4.7), 0.1, 50) * dt);
  const maximumSpeed = clamp(finite(options.maxSpeed, 480), 1, 3000) / scale;
  const maximumAcceleration = clamp(finite(options.maxAcceleration, 2600), 1, 20000) / scale;
  const pairs = links.flatMap((link) => {
    const source = byId.get(link.source); const target = byId.get(link.target);
    return source && target && source !== target ? [{ source, target }] : [];
  });

  for (let step = 0; step < steps; step++) {
    const forces = new Map(entries.map((entry) => [entry.node.id, { x: 0, y: 0 }]));
    const groups = new Map();
    for (const entry of entries) {
      const { node } = entry;
      if (entry.category) {
        const group = groups.get(entry.category) ?? { x: 0, y: 0, count: 0 };
        group.x += node.x - entry.targetX;
        group.y += node.y - entry.targetY;
        group.count++;
        groups.set(entry.category, group);
      }
      const force = forces.get(node.id);
      const offset = options.anchorOffsetFor?.(node);
      force.x += (entry.targetX + finite(offset?.x, 0) - node.x) * anchorStrength;
      force.y += (entry.targetY + finite(offset?.y, 0) - node.y) * anchorStrength;
    }

    for (const entry of entries) {
      const group = groups.get(entry.category);
      if (!group || group.count < 2) continue;
      const force = forces.get(entry.node.id);
      force.x += (group.x / group.count - (entry.node.x - entry.targetX)) * categoryStrength;
      force.y += (group.y / group.count - (entry.node.y - entry.targetY)) * categoryStrength;
    }

    for (const { source, target } of pairs) {
      const a = source.node; const b = target.node;
      const x = ((b.x - target.targetX) - (a.x - source.targetX)) * linkStrength;
      const y = ((b.y - target.targetY) - (a.y - source.targetY)) * linkStrength;
      forces.get(a.id).x += x; forces.get(a.id).y += y;
      forces.get(b.id).x -= x; forces.get(b.id).y -= y;
    }

    if (repulsionRange > 0) {
      for (let first = 0; first < entries.length; first++) {
        for (let second = first + 1; second < entries.length; second++) {
          const a = entries[first]; const b = entries[second];
          const { distance, minimum, normal } = separation(a, b, padding);
          const penetration = minimum + repulsionRange - distance;
          if (penetration <= 0) continue;
          const strength = penetration * repulsionStrength;
          forces.get(a.node.id).x -= normal.x * strength;
          forces.get(a.node.id).y -= normal.y * strength;
          forces.get(b.node.id).x += normal.x * strength;
          forces.get(b.node.id).y += normal.y * strength;
        }
      }
    }

    for (const entry of entries) {
      if (entry.fixed) continue;
      const { node } = entry;
      const acceleration = limit(forces.get(node.id), maximumAcceleration);
      const velocity = limit({ x: (node.vx + acceleration.x * dt) * damping,
        y: (node.vy + acceleration.y * dt) * damping }, maximumSpeed);
      node.vx = velocity.x; node.vy = velocity.y;
      node.x += node.vx * dt; node.y += node.vy * dt;
    }
    projectCollisions(entries, padding, 4);
  }
  projectCollisions(entries, padding, clamp(Math.floor(finite(options.iterations, 64)), 1, 240));
  for (const { node } of entries) {
    const velocity = limit({ x: node.vx, y: node.vy }, maximumSpeed);
    node.vx = velocity.x; node.vy = velocity.y;
  }
  return diagnostics(entries, padding);
}

/**
 * For an explicit user gesture/layout change when animation is disabled: no
 * spring integration or idle motion, just circle separation and zero velocity.
 * links is accepted for the same call signature, but creates no static force.
 * @param {PhysicsNode[]} nodes
 * @param {PhysicsLink[]} [links]
 * @param {PhysicsOptions} [options]
 */
export function solveStatic(nodes, links = [], options = {}) {
  void links;
  const { entries, padding } = prepare(nodes, options);
  for (const { node } of entries) { node.vx = 0; node.vy = 0; }
  projectCollisions(entries, padding, clamp(Math.floor(finite(options.iterations, 160)), 1, 500));
  return diagnostics(entries, padding);
}
