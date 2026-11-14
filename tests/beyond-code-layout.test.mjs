import assert from 'node:assert/strict';
import test from 'node:test';
import { nodes, edges } from '../src/data/beyond-code.ts';
import { categoryRegions, createGraphLayout, fitCamera, worldToScreen } from '../src/utils/beyond-code-graph.js';
import { createPhysicsNetwork } from '../src/utils/beyond-code-network.js';
import { stepPhysics } from '../src/utils/beyond-code-physics.js';
import { baseNodeDiameter, screenNodeDiameter } from '../src/utils/beyond-code-sizing.js';

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const byId = (layout) => new Map(layout.map((node) => [node.id, node]));
const positions = (layout) => [...layout].sort((first, second) => first.id < second.id ? -1 : 1);
const body = (id, category, type = 'work') => ({ id, category, type, isContext: false });

function assertRegionsSeparate(regions, minimumGap = 220) {
  for (let first = 0; first < regions.length; first++) {
    for (let second = first + 1; second < regions.length; second++) {
      const a = regions[first], b = regions[second];
      const gap = Math.max(b.minX - a.maxX, a.minX - b.maxX,
        b.minY - a.maxY, a.minY - b.maxY);
      assert.ok(gap >= minimumGap - 1e-7, `Category gutter lost: ${a.id}/${b.id} (${gap})`);
    }
  }
}

for (const mobile of [false, true]) {
  test(`${mobile ? 'mobile' : 'desktop'} categories have measured, disjoint regions and caption clearance`, () => {
    const layout = createGraphLayout(nodes, edges, { mobile });
    const regions = categoryRegions(layout, nodes);
    assert.equal(regions.length, new Set(nodes.map((node) => node.category)).size);
    assertRegionsSeparate(regions, mobile ? 640 : 220);
    const points = byId(layout);
    for (const region of regions) {
      const members = nodes.filter((node) => node.category === region.id).map((node) => points.get(node.id));
      assert.ok(members.length);
      assert.equal(region.labelX, (region.minX + region.maxX) / 2);
      assert.equal(region.labelY, region.minY + 45);
      for (const point of members) {
        assert.ok(point.x - 140 >= region.minX - 1e-7 && point.x + 140 <= region.maxX + 1e-7);
        assert.ok(point.y - 140 >= region.minY + 90 - 1e-7 && point.y + 140 <= region.maxY + 1e-7);
      }
    }
  });

  test(`${mobile ? 'mobile' : 'desktop'} retains every node with finite canonical anchors and collision room`, () => {
    const layout = createGraphLayout(nodes, edges, { mobile });
    assert.deepEqual(layout.map((node) => node.id), nodes.map((node) => node.id));
    assert.equal(layout.length, nodes.length);
    for (const node of layout) {
      for (const key of ['x', 'y', 'anchorX', 'anchorY', 'phase', 'radius']) assert.ok(Number.isFinite(node[key]));
      assert.equal(node.anchorX, node.x); assert.equal(node.anchorY, node.y);
      assert.ok(node.radius > 0);
    }
    for (let first = 0; first < layout.length; first++) {
      for (let second = first + 1; second < layout.length; second++) {
        assert.ok(distance(layout[first], layout[second]) >= 220 - 1e-7,
          `Initial pile: ${layout[first].id}/${layout[second].id}`);
      }
    }
  });

  test(`${mobile ? 'mobile' : 'desktop'} positions ignore metadata-array order and duplicate relationship order`, () => {
    const baseline = positions(createGraphLayout(nodes, edges, { mobile }));
    assert.deepEqual(positions(createGraphLayout([...nodes].reverse(), edges, { mobile })), baseline);
    assert.deepEqual(positions(createGraphLayout([...nodes.slice(31), ...nodes.slice(0, 31)], edges, { mobile })), baseline);
    assert.deepEqual(positions(createGraphLayout(nodes, [...edges].reverse(), { mobile })), baseline);
    assert.deepEqual(positions(createGraphLayout(nodes, [...edges, edges[0],
      { source: edges[0].target, target: edges[0].source }], { mobile })), baseline);
  });
}

test('series stay compact inside their own category without picking an unrelated favorite as the center', () => {
  for (const mobile of [false, true]) {
    const layout = byId(createGraphLayout(nodes, edges, { mobile }));
    for (const parent of nodes.filter((node) => node.type === 'series')) {
      const children = edges.filter((edge) => edge.relationship === 'part-of' && edge.target === parent.id)
        .map((edge) => layout.get(edge.source));
      assert.ok(children.length);
      const center = layout.get(parent.id);
      for (const child of children) {
        assert.ok(distance(center, child) >= 220 - 1e-7 && distance(center, child) <= 330,
          `Series scattered: ${parent.id}/${child.id}`);
      }
      for (const child of children) {
        for (const other of children) assert.ok(distance(child, other) <= 600 + 1e-7);
      }
      const mean = children.reduce((point, child) => ({ x: point.x + child.x / children.length,
        y: point.y + child.y / children.length }), { x: 0, y: 0 });
      assert.ok(distance(mean, center) < 1e-7, `Parent is not a structural junction: ${parent.id}`);
    }
  }
});

test('cross-category facts retain endpoints without pulling category regions into one component', () => {
  const cross = edges.filter((edge) => nodes.find((node) => node.id === edge.source).category
    !== nodes.find((node) => node.id === edge.target).category);
  assert.ok(cross.length);
  const local = edges.filter((edge) => !cross.includes(edge));
  for (const mobile of [false, true]) {
    const baseline = createGraphLayout(nodes, local, { mobile });
    const related = createGraphLayout(nodes, edges, { mobile });
    assert.deepEqual(related.map(({ id, x, y }) => ({ id, x, y })), baseline.map(({ id, x, y }) => ({ id, x, y })));
    assertRegionsSeparate(categoryRegions(related, nodes), mobile ? 640 : 220);
  }
});

test('unknown preferences and first-item positions never determine structural prominence', () => {
  const fixture = [body('z-first', 'games', 'person'), body('a-second', 'games'), body('m-third', 'games')];
  const layout = createGraphLayout(fixture);
  assert.ok(layout.every((node) => node.major === false && node.radius === 19));
  assert.deepEqual(positions(layout), positions(createGraphLayout([...fixture].reverse())));
  const changedPreference = fixture.map((node, index) => ({ ...node, sizeBoost: index }));
  assert.deepEqual(createGraphLayout(changedPreference), layout, 'Layout must not turn preference metadata into a central position');
});

test('same-category tied works orbit empty component space rather than appointing one protagonist', () => {
  const fixture = [body('a', 'movies'), body('b', 'movies')];
  const layout = createGraphLayout(fixture, [{ source: 'a', target: 'b' }]);
  assert.equal(layout[0].major, false); assert.equal(layout[1].major, false);
  assert.ok(Math.abs(distance(layout[0], layout[1]) - 220) < 1e-7);
  const center = { x: (layout[0].x + layout[1].x) / 2, y: (layout[0].y + layout[1].y) / 2 };
  assert.ok(distance(layout[0], center) >= 110 - 1e-7);
  assert.ok(distance(layout[1], center) >= 110 - 1e-7);
});

test('mobile categories form a horizontal strip reachable by the existing horizontal pan gesture', () => {
  const desktop = categoryRegions(createGraphLayout(nodes, edges), nodes);
  const mobile = categoryRegions(createGraphLayout(nodes, edges, { mobile: true }), nodes);
  assert.deepEqual(mobile.map((region) => region.id), desktop.map((region) => region.id));
  for (let index = 1; index < mobile.length; index++) {
    assert.ok(mobile[index].minX - mobile[index - 1].maxX >= 640 - 1e-7);
  }
  for (const region of mobile) assert.ok(Math.abs(region.minY - mobile[0].minY) < 1e-7);
  const movieRegion = mobile.find((region) => region.id === 'movies');
  assert.ok(movieRegion.maxX - movieRegion.minX < 2100);
  assert.ok(movieRegion.maxY - movieRegion.minY < 2800);
});

test('a series with only one child keeps an actual edge instead of collapsing both circles', () => {
  const fixture = [body('series', 'movies', 'series'), body('only-film', 'movies')];
  for (const mobile of [false, true]) {
    const layout = createGraphLayout(fixture, [{ source: 'only-film', target: 'series' }], { mobile });
    assert.ok(Math.abs(distance(layout[0], layout[1]) - 220) < 1e-7);
  }
});

test('caption bounds use canonical anchors, remaining stable during an explicit manual drag', () => {
  const fixture = [body('a', 'books')];
  const layout = createGraphLayout(fixture);
  const regions = categoryRegions(layout, fixture);
  layout[0].x += 5000; layout[0].y -= 1000;
  assert.deepEqual(categoryRegions(layout, fixture), regions);
  assert.deepEqual(categoryRegions([{ id: 'a', x: 10, y: 20 }], fixture), [
    { id: 'books', minX: -130, minY: -210, maxX: 150, maxY: 160, labelX: 10, labelY: -165 },
  ]);
});

test('invalid edge endpoints cannot perturb valid components and frozen source data remains unchanged', () => {
  const fixture = [body('a', 'games'), body('b', 'games'), body('c', 'topics')];
  const valid = [{ source: 'a', target: 'b' }];
  const invalid = [null, {}, { source: 'missing', target: 'a' }, { source: 'a', target: 'missing' }, { source: 'a', target: 'a' }];
  const snapshot = structuredClone({ fixture, valid });
  fixture.forEach(Object.freeze); valid.forEach(Object.freeze); Object.freeze(fixture); Object.freeze(valid);
  assert.deepEqual(createGraphLayout(fixture, [...invalid, ...valid]), createGraphLayout(fixture, valid));
  assert.deepEqual({ fixture, valid }, snapshot);
  assert.deepEqual(createGraphLayout([], valid), []);
  assert.deepEqual(categoryRegions([], fixture), []);
});

for (const mobile of [false, true]) test(`${mobile ? 'compact' : 'desktop'} overview preserves outer-orbit gutters and captions through thirty seconds of real physics`, () => {
  // Match the actual overview camera: the 780/580px stages reserve 65px,
  // fit category corners, and align the pannable compact strip at its left edge.
  const viewport = { width: mobile ? 390 : 1028, height: mobile ? 515 : 715 };
  const stretch = mobile ? 1 : Math.max(1, viewport.width / viewport.height / 1.55);
  const layout = createGraphLayout(nodes, edges, { mobile }).map((node) => ({ ...node,
    x: node.x * stretch, anchorX: node.anchorX * stretch,
    targetX: node.x * stretch, targetY: node.y, vx: 0, vy: 0 }));
  const regions = categoryRegions(layout, nodes);
  const camera = fitCamera([...layout, ...regions.flatMap((region) => [
    { x: region.minX, y: region.minY }, { x: region.maxX, y: region.maxY },
  ])], viewport, 28);
  if (mobile) {
    const left = Math.min(...regions.map((region) => region.minX));
    camera.x = left + (viewport.width / 2 - 28) / camera.scale;
    camera.y -= 12 / camera.scale;
  }
  if (mobile) assert.equal(camera.scale, .16);
  else assert.ok(camera.scale >= .182, 'Overview became too small for unchanged collision clearances');
  const network = createPhysicsNetwork(layout, edges);
  const degree = new Map(nodes.map((node) => [node.id, 0]));
  for (const edge of network.links) {
    degree.set(edge.source, degree.get(edge.source) + 1);
    degree.set(edge.target, degree.get(edge.target) + 1);
  }
  const diameter = (node) => screenNodeDiameter(baseNodeDiameter(degree.get(node.id)), camera.scale);
  const nodeCategory = new Map(nodes.map((node) => [node.id, node.category]));
  for (let frame = 0; frame < 1800; frame++) {
    const now = frame * 1000 / 60;
    const diagnostics = stepPhysics(layout, network.links, { dt: 1 / 60, scale: camera.scale,
      anchorStrength: 1.2, categoryStrength: 0, massFor: (node) => network.masses.get(node.id),
      radiusFor: (node) => diameter(node) / 2 + 6, padding: 4,
      linkAnchorFor: (node) => ({ x: node.anchorX, y: node.anchorY }),
      anchorOffsetFor: (node) => ({ x: Math.sin(now * .00038 + node.phase) * 8,
        y: Math.cos(now * .00031 + node.phase) * 10 }) });
    if (frame % 60 !== 59) continue;
    assert.ok(diagnostics.maxOverlap < .01, `Contact residual at frame ${frame + 1}`);
    const circles = layout.map((node) => ({ id: node.id, category: nodeCategory.get(node.id),
      ...worldToScreen(node, camera, viewport), radius: diameter(node) / 2 + 6 }));
    assert.equal(circles.length, nodes.length, 'Do not achieve whitespace by pruning content');
    for (const circle of circles) {
      assert.ok(circle.y - circle.radius >= 0 && circle.y + circle.radius <= viewport.height,
        `Overview vertically clips ${circle.id} at frame ${frame + 1}`);
      if (!mobile) assert.ok(circle.x - circle.radius >= 0 && circle.x + circle.radius <= viewport.width,
        `Desktop overview horizontally clips ${circle.id} at frame ${frame + 1}`);
    }
    const actual = regions.map((region) => {
      const members = circles.filter((circle) => circle.category === region.id);
      const canonical = worldToScreen({ x: region.labelX, y: region.labelY }, camera, viewport);
      const top = Math.min(...members.map((circle) => circle.y - circle.radius));
      // The DOM label is 20px high and follows actual outer orbits, rather than
      // trusting the canonical caption band after screen-space contacts expand.
      const labelY = Math.min(canonical.y - 8, top - 18);
      assert.ok(top - (labelY + 10) >= 8 - 1e-7, `Caption overlaps ${region.id}'s orbit`);
      assert.ok(labelY - 10 >= 0 && labelY + 10 <= viewport.height,
        `Caption clips vertically in ${region.id} at frame ${frame + 1}`);
      return { id: region.id, minX: Math.min(...members.map((circle) => circle.x - circle.radius)),
        maxX: Math.max(...members.map((circle) => circle.x + circle.radius)),
        minY: top, maxY: Math.max(...members.map((circle) => circle.y + circle.radius)) };
    });
    for (let first = 0; first < actual.length; first++) {
      for (let second = first + 1; second < actual.length; second++) {
        const a = actual[first], b = actual[second];
        const gap = Math.max(a.minX - b.maxX, b.minX - a.maxX, a.minY - b.maxY, b.minY - a.maxY);
        assert.ok(gap >= (mobile ? 35 : 40),
          `Idle physics merges outer orbits ${a.id}/${b.id}: ${gap}px at frame ${frame + 1}`);
      }
    }
  }
});
