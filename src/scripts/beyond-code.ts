import {
  clamp, clusterCenters, connectedIds, createGraphLayout,
  fitCamera, screenToWorld, worldToScreen, zoomAt,
} from '../utils/beyond-code-graph.js';
import { solveStatic, stepPhysics } from '../utils/beyond-code-physics.js';
import { createViewHistory } from '../utils/beyond-code-navigation.js';
import { segmentBetweenCircles } from '../utils/beyond-code-links.js';
import { createFrameProfile } from '../utils/beyond-code-profile.js';
import { createPhysicsNetwork } from '../utils/beyond-code-network.js';

interface GraphNode {
  id: string; category: string; type: string; title: string; subtitle: string;
  searchText: string; artwork: string; description: string; externalUrl: string; isContext: boolean;
}
interface GraphEdge { id: string; source: string; target: string; relationship: string; label: string }
interface GraphCategory { id: string; title: string }
interface Camera { x: number; y: number; scale: number }
interface Point { x: number; y: number }
interface GraphDrag {
  pointerId: number; start: Point; last: Point; node: string | null;
  moved: boolean; touch: boolean; world: Point | null;
  placements: Map<string, Point>; pointerOffset: Point;
}
interface LayoutNode {
  id: string; x: number; y: number; anchorX: number; anchorY: number;
  major: boolean; phase: number; radius: number; vx: number; vy: number;
  targetX: number; targetY: number; element: HTMLButtonElement;
}
interface GraphData { nodes: GraphNode[]; edges: GraphEdge[]; categories: GraphCategory[]; copy: Record<string,string>; lang: string }
interface GraphState { cleanup?: () => void; bootstrapped?: boolean }
interface ViewSnapshot {
  category: string; query: string; mode: string; selected: string | null;
  camera: Camera; userOffsets: [string, Point][]; positions: [string, Point][];
  layoutEpoch: number;
}
interface NodeView {
  label: HTMLElement | null; text: string; size?: number; minor?: boolean;
  labelVisible?: boolean; font?: string; labelHeight?: number;
}

const globalWindow = window as typeof window & { __shanBeyondCode?: GraphState };
const state = globalWindow.__shanBeyondCode ??= {};

function setupBeyondCode() {
  state.cleanup?.();
  const root = document.querySelector<HTMLElement>('[data-beyond]');
  if (!root) return;
  const graph = root.querySelector<HTMLElement>('[data-beyond-graph]')!;
  const stage = root.querySelector<HTMLElement>('[data-beyond-stage]')!;
  const canvas = root.querySelector<HTMLCanvasElement>('[data-beyond-canvas]')!;
  const ctx = canvas.getContext('2d');
  const payload = root.querySelector('[data-beyond-data]');
  if (!ctx || !payload?.textContent) return;
  const data: GraphData = JSON.parse(payload.textContent);
  const profileLabel = import.meta.env.DEV ? new URLSearchParams(location.search).get('graph-profile') : null;
  const profile = profileLabel ? createFrameProfile(profileLabel) : null;
  const detail = root.querySelector<HTMLElement>('[data-beyond-detail]')!;
  const indexView = root.querySelector<HTMLElement>('[data-beyond-index]')!;
  const search = root.querySelector<HTMLInputElement>('[data-beyond-search]')!;
  const motionButton = root.querySelector<HTMLButtonElement>('[data-beyond-motion]')!;
  const backButton = root.querySelector<HTMLButtonElement>('[data-beyond-back]')!;
  const title = root.querySelector<HTMLElement>('[data-detail-title]')!;
  const media = root.querySelector<HTMLElement>('[data-detail-image]')!;
  const source = root.querySelector<HTMLAnchorElement>('[data-detail-source]')!;
  const description = root.querySelector<HTMLElement>('[data-detail-description]')!;
  const relatedList = root.querySelector<HTMLElement>('[data-detail-links]')!;
  const controller = new AbortController();
  const signal = controller.signal;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQuery = window.matchMedia('(max-width: 640px)');
  const nodeById = new Map(data.nodes.map((node) => [node.id, node]));
  const seriesNodes = data.nodes.filter((node) => node.type === 'series');
  const contentLayout: LayoutNode[] = createGraphLayout(data.nodes, data.edges).map((node: Omit<LayoutNode, 'vx' | 'vy' | 'targetX' | 'targetY' | 'element'>) => ({
    ...node, vx: 0, vy: 0, targetX: node.x, targetY: node.y,
    element: root.querySelector<HTMLButtonElement>(`[data-node="${node.id}"]`)!,
  }));
  // Categories remain filters. Only owner-approved content relationships have bodies/forces.
  const layout: LayoutNode[] = contentLayout;
  const fullNetwork = createPhysicsNetwork(layout, data.edges);
  const connectionCounts = new Map(layout.map((node) => [node.id, 0]));
  for (const edge of fullNetwork.links) {
    connectionCounts.set(edge.source, connectionCounts.get(edge.source)! + 1);
    connectionCounts.set(edge.target, connectionCounts.get(edge.target)! + 1);
  }
  const positions = new Map(layout.map((node) => [node.id, node]));
  const views = new Map<string, NodeView>(layout.map((node) => {
    const entry = nodeById.get(node.id);
    const duplicateName = entry && data.nodes.some((other) => other.id !== entry.id && other.title === entry.title);
    const text = entry ? duplicateName ? `${entry.title} · ${data.categories.find((item) => item.id === entry.category)?.title ?? ''}` : entry.title : '';
    const label = node.element.querySelector<HTMLElement>('.beyond-node-label');
    if (entry) node.element.dataset.category = entry.category;
    if (label) label.textContent = text;
    return [node.id, {label, text}];
  }));
  const history = createViewHistory();
  let restoringView = false;
  let editingSearch = false;
  let category = 'all';
  let query = '';
  let searchText = '';
  let selected: string | null = null;
  let hovered: string | null = null;
  let keyboardFocus: string | null = null;
  let visibleIds = new Set(data.nodes.map((node) => node.id));
  let physicsNetwork = createPhysicsNetwork(layout, data.edges, visibleIds);
  let neighbors = new Set<string>();
  let mode = 'graph';
  let width = 1000;
  let height = 650;
  let detailWidth = 340;
  let camera: Camera = { x: 800, y: 600, scale: 0.5 };
  let targetCamera: Camera = { ...camera };
  let frame = 0;
  let lastTime = 0;
  let alive = true;
  let inView = true;
  let motion = !reducedMotion.matches;
  let lastDrag = 0;
  let drag: GraphDrag | null = null;
  // Gesture positions live only in this scene; reset/filter/navigation restore its layout.
  const userOffsets = new Map<string, Point>();
  let initialized = false;
  let horizontalStretch = 1;
  let anchorModeMobile = mobileQuery.matches;
  let layoutEpoch = 0;
  const originalAnchors = new Map(layout.map((node) => [node.id, { x: node.anchorX, y: node.anchorY }]));
  const mobileCenters: Record<string, Point> = {
    games:{x:180,y:180},movies:{x:740,y:180},
    books:{x:180,y:620},drama:{x:740,y:620},
    music:{x:180,y:1060},topics:{x:740,y:1060},
    hobbies:{x:180,y:1500},foods:{x:740,y:1500},
  };
  function categoryCenter(id: string) {
    if (mobileQuery.matches) return mobileCenters[id];
    const center=clusterCenters[id as keyof typeof clusterCenters];
    return {x:center.x*horizontalStretch,y:center.y};
  }

  function isMajor(id: string) {
    return (connectionCounts.get(id) ?? 0) >= 2 || nodeById.get(id)!.type === 'series' || neighbors.has(id);
  }

  function nodeSize(node: { id: string }) {
    const entry = nodeById.get(node.id)!;
    if (entry.type === 'topic' && !entry.artwork) return 20;
    const degree = Math.min(connectionCounts.get(node.id) ?? 0, 4);
    const base = entry.type === 'series' ? 70 : 34 + degree * 8;
    return clamp((base + (selected === node.id ? 6 : 0)) * Math.sqrt(camera.scale), 24, 82);
  }

  function categoryOf(id: string) {
    return nodeById.get(id)!.category;
  }

  function physicsLinks() {
    return physicsNetwork.links;
  }

  function physicsOptions(dt = 1 / 60, idleTime?: number) {
    const dragging = !!drag?.node && drag.moved;
    const fixed = keyboardFocus ?? hovered;
    return {
      dt, scale: camera.scale, activeIds: visibleIds,
      draggedId: dragging ? drag!.node : null,
      dragPoint: dragging ? drag!.world : null,
      fixedIds: new Set(!dragging && fixed ? [fixed] : []),
      massFor: (node: { id: string }) => physicsNetwork.masses.get(node.id) ?? 1,
      linkAnchorFor: (node: { id: string }) => {
        const body = positions.get(node.id)!;
        return {x:body.anchorX,y:body.anchorY};
      },
      anchorStrength: 1.2, categoryStrength: 0,
      radiusFor: (node: { id: string }) => nodeSize(node) / 2 + 6,
      padding: 4,
      anchorOffsetFor: idleTime === undefined ? undefined : (node: { id: string }) => {
        const phase = positions.get(node.id)!.phase;
        return { x: Math.sin(idleTime * .00038 + phase) * 8, y: Math.cos(idleTime * .00031 + phase) * 10 };
      },
    };
  }

  function snapshot(): ViewSnapshot {
    return { category, query: searchText, mode, selected, camera: { ...targetCamera },
      userOffsets: [...userOffsets].map(([id, point]) => [id, { ...point }]),
      positions: layout.map((node) => [node.id, {x:node.x,y:node.y}]), layoutEpoch };
  }

  function rememberView() {
    if (restoringView) return;
    history.push(snapshot());
    backButton.disabled = !history.canGoBack();
  }

  function stepBack() {
    const previous = history.back() as ViewSnapshot | undefined;
    if (!previous) return;
    restoringView = true;
    editingSearch = false;
    search.value = previous.query;
    searchText = previous.query;
    query = previous.query.trim().toLocaleLowerCase();
    chooseCategory(previous.category);
    setView(previous.mode);
    const sameCoordinates = previous.layoutEpoch === layoutEpoch;
    if (sameCoordinates) for (const [id, point] of previous.userOffsets) userOffsets.set(id, { ...point });
    if (previous.selected) selectNode(previous.selected);
    else { updateTargets(); applyVisibility(false); }
    // Soft placement preferences and the currently deformed network are distinct.
    if (sameCoordinates) {
      for (const [id, point] of previous.positions) {
        const node = positions.get(id);
        if (node) { node.x=point.x; node.y=point.y; node.vx=0; node.vy=0; }
      }
      setCamera(previous.camera);
    } else if (!previous.selected) {
      fitVisible();
    }
    restoringView = false;
    backButton.disabled = !history.canGoBack();
    if (previous.selected) title.focus({ preventScroll: true });
    else if (previous.query) search.focus({ preventScroll: true });
    else root!.querySelector<HTMLButtonElement>(`[data-beyond-category="${previous.category}"]`)?.focus({ preventScroll: true });
    wake();
  }

  function updateMotionControl() {
    motionButton.setAttribute('aria-pressed', String(motion));
    motionButton.disabled = reducedMotion.matches;
    const label = reducedMotion.matches ? data.copy.reducedMotion : motion ? data.copy.pauseMotion : data.copy.resumeMotion;
    motionButton.setAttribute('aria-label', label);
    motionButton.title = label;
  }

  function navigate(action: () => void) {
    rememberView();
    restoringView = true;
    try { action(); } finally { restoringView = false; }
    editingSearch = false;
  }

  function resetTransientGesture() {
    const captured = drag;
    drag = null;
    if (captured) {
      const owner = captured.node ? positions.get(captured.node)!.element : graph;
      if (owner.hasPointerCapture(captured.pointerId)) owner.releasePointerCapture(captured.pointerId);
      if (captured.moved) lastDrag = performance.now();
    }
    hovered = null;
    graph.classList.remove('is-dragging');
    for (const node of layout) { node.vx = 0; node.vy = 0; }
  }

  function viewport() {
    if (!selected) return { width, height: height - 65 };
    if (mobileQuery.matches) return { width, height: Math.max(180, height - Math.max(260, height * 0.43) - 45) };
    return { width: Math.max(260, width - detailWidth), height: height - 65 };
  }

  function setCamera(next: Camera) {
    targetCamera = { ...next, scale: clamp(next.scale, 0.22, 2.4) };
    if (reducedMotion.matches || !motion) camera = { ...targetCamera };
    wake();
  }

  function fitVisible() {
    const points = layout.filter((node) => visibleIds.has(node.id)).map((node)=>({x:node.targetX,y:node.targetY}));
    const padding = mobileQuery.matches ? 42 : 85;
    const fitted = fitCamera(points, viewport(), padding);
    setCamera(fitted);
  }

  function applyVisibility(fit = true) {
    const matches = data.nodes.filter((node) =>
      (category === 'all' || node.category === category)
      && (!query || `${node.title} ${node.searchText} ${node.subtitle}`.toLocaleLowerCase().includes(query)),
    );
    visibleIds = new Set(matches.map((node) => node.id));
    // Actual neighbors stay reachable across categories; unrelated context is not a favorite.
    for (const node of matches) {
      for (const id of connectedIds(node.id, data.edges)) visibleIds.add(id);
    }
    if (selected) for (const id of connectedIds(selected, data.edges)) visibleIds.add(id);
    physicsNetwork = createPhysicsNetwork(layout, data.edges, visibleIds);
    updateTargets();
    for (const node of layout) {
      const visible = visibleIds.has(node.id);
      node.element.hidden = !visible;
      node.element.tabIndex = visible ? 0 : -1;
    }
    for (const button of root!.querySelectorAll<HTMLButtonElement>('[data-index-node]')) {
      button.hidden = !matches.some((node) => node.id === button.dataset.indexNode);
    }
    for (const section of root!.querySelectorAll<HTMLElement>('[data-index-category]')) {
      section.hidden = !section.querySelector('[data-index-node]:not([hidden])');
    }
    root!.querySelector<HTMLElement>('[data-beyond-empty]')!.hidden = matches.length > 0;
    if (fit && matches.length) fitVisible();
    wake();
  }

  function relationLabel(edge: GraphEdge, currentId: string) {
    const forward = currentId === edge.source;
    const labels: Record<string, Record<string, [string,string]>> = {
      en: {
        'performed-by': ['Performed by', 'Performs'], 'written-by': ['Written by', 'Written work'],
        'adapted-from': ['Based on', 'Adapted into'], 'produced-by': ['Produced by', 'Production'],
        'shared-universe': ['Shared universe', 'Shared universe'],
        'associated-with': ['Associated with', 'Associated with'],
        'part-of': ['Part of', 'Film in series'],
        'style-of': ['Style of', 'Style'],
        'ingredient-of': ['Ingredient for', 'Ingredient'],
      },
      zh: {
        'performed-by': ['演唱', '演唱的歌曲'], 'written-by': ['作者', '创作的作品'],
        'adapted-from': ['改编自', '改编作品'], 'produced-by': ['制作', '制作的作品'],
        'shared-universe': ['同一世界观', '同一世界观'],
        'associated-with': ['关联', '关联'],
        'part-of': ['所属系列', '系列作品'],
        'style-of': ['所属风格', '风格'],
        'ingredient-of': ['用于', '食材'],
      },
      ja: {
        'performed-by': ['アーティスト', '楽曲'], 'written-by': ['著者', '著作'],
        'adapted-from': ['原作', '映像化作品'], 'produced-by': ['制作', '制作作品'],
        'shared-universe': ['共通の世界観', '共通の世界観'],
        'associated-with': ['関連', '関連'],
        'part-of': ['シリーズ', 'シリーズ作品'],
        'style-of': ['スタイル', 'スタイル'],
        'ingredient-of': ['使う料理', '食材'],
      },
    };
    return labels[data.lang]?.[edge.relationship]?.[forward ? 0 : 1] ?? edge.label;
  }

  function updateTargets(syncStatic = true) {
    // Browsing never rearranges the graph. Relations influence the bounded base
    // anchors once; only an explicit drag adds a transient placement offset.
    for (const node of layout) { node.targetX = node.anchorX; node.targetY = node.anchorY; }
    for (const node of layout) {
      const offset = userOffsets.get(node.id);
      if (offset) { node.targetX += offset.x; node.targetY += offset.y; }
    }
    if (syncStatic && (reducedMotion.matches || !motion)) {
      for (const node of layout) { node.x = node.targetX; node.y = node.targetY; node.vx = 0; node.vy = 0; }
    }
  }

  function createRelatedButton(node: GraphNode, label: string) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.relatedNode = node.id;
    if (node.artwork) {
      const image = document.createElement('img');
      image.src = node.artwork; image.alt = ''; image.loading = 'lazy';
      button.append(image);
    }
    const text = document.createElement('span');
    const name = document.createElement('strong'); name.textContent = node.title;
    const relationship = document.createElement('small'); relationship.textContent = label;
    text.append(name, relationship); button.append(text);
    return button;
  }

  function selectNode(id: string) {
    const node = nodeById.get(id);
    if (!node || selected === id) return;
    rememberView();
    editingSearch = false;
    resetTransientGesture();
    selected = id;
    neighbors = connectedIds(id, data.edges);
    detail.hidden = false;
    detailWidth = detail.getBoundingClientRect().width;
    root!.classList.add('is-detail-open');
    title.textContent = node.title;
    root!.querySelector<HTMLElement>('[data-detail-category]')!.textContent = data.categories.find((entry) => entry.id === node.category)?.title ?? '';
    root!.querySelector<HTMLElement>('[data-detail-subtitle]')!.textContent = node.subtitle;
    description.textContent = node.description;
    description.hidden = !node.description;
    media.replaceChildren(); media.hidden = !node.artwork;
    if (node.artwork) { const image = document.createElement('img'); image.src = node.artwork; image.alt = node.title; media.append(image); }
    source.hidden = !node.externalUrl;
    if (node.externalUrl) source.href = node.externalUrl;
    else source.removeAttribute('href');
    const related = data.edges.filter((edge) => edge.source === id || edge.target === id);
    relatedList.replaceChildren();
    const heading = document.createElement('h3');
    heading.textContent = related.length ? data.copy.related : data.copy.nearby;
    relatedList.append(heading);
    if (related.length) {
      for (const edge of related) {
        const other = nodeById.get(edge.source === id ? edge.target : edge.source)!;
        relatedList.append(createRelatedButton(other, relationLabel(edge, id)));
      }
    } else {
      for (const other of data.nodes.filter((entry) => entry.category === node.category && entry.id !== id && !entry.isContext).slice(0, 3)) {
        relatedList.append(createRelatedButton(other, data.categories.find((entry) => entry.id === node.category)?.title ?? ''));
      }
    }
    updateTargets();
    applyVisibility(false);
    const focusPoints = [...neighbors].map((key) => {
      const position = positions.get(key)!; return { x: position.targetX, y: position.targetY };
    });
    const next = fitCamera(focusPoints, viewport(), mobileQuery.matches ? 72 : 125);
    next.scale = Math.min(next.scale, mobileQuery.matches ? 0.95 : 1.35);
    setCamera(next);
    for (const item of contentLayout) {
      item.element.setAttribute('aria-pressed', String(item.id === selected));
      item.element.classList.toggle('is-selected', item.id === selected);
      item.element.classList.toggle('is-neighbor', neighbors.has(item.id) && item.id !== selected);
      item.element.classList.toggle('is-muted', !neighbors.has(item.id));
    }
    detail.scrollTop = 0;
    title.focus({ preventScroll: true });
    if (mobileQuery.matches) stage.scrollIntoView({ block: 'start', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    wake();
  }

  function closeDetail(restoreFocus = false, refit = true, record = false) {
    if (record && selected) rememberView();
    resetTransientGesture();
    const previous = selected;
    selected = null; neighbors = new Set();
    detail.hidden = true;
    root!.classList.remove('is-detail-open');
    for (const node of contentLayout) {
      node.element.classList.remove('is-selected','is-neighbor','is-muted');
      node.element.setAttribute('aria-pressed','false');
    }
    updateTargets();
    applyVisibility(false);
    if (refit) fitVisible();
    if (restoreFocus && previous) {
      const button = positions.get(previous)?.element;
      if (button && !button.hidden) button.focus({ preventScroll: true });
      else search.focus({ preventScroll: true });
    }
  }

  function setView(next: string) {
    if (mode !== next || selected) rememberView();
    editingSearch = false;
    resetTransientGesture();
    mode = next;
    graph.hidden = next === 'index'; indexView.hidden = next !== 'index';
    root!.classList.toggle('is-index', next === 'index');
    for (const button of root!.querySelectorAll<HTMLButtonElement>('[data-beyond-view]')) {
      button.setAttribute('aria-pressed', String(button.dataset.beyondView === next));
    }
    if (selected) closeDetail(false, false);
    resize();
  }

  function chooseCategory(id: string) {
    if (category !== id || selected) rememberView();
    editingSearch = false;
    resetTransientGesture();
    userOffsets.clear();
    category = id;
    closeDetail(false, false);
    for (const button of root!.querySelectorAll<HTMLButtonElement>('[data-beyond-category]')) {
      const active = button.dataset.beyondCategory === id;
      button.setAttribute('aria-pressed', String(active)); button.classList.toggle('is-active', active);
    }
    applyVisibility();
  }

  function resize() {
    width = stage.clientWidth; height = stage.clientHeight;
    if (selected) detailWidth = detail.getBoundingClientRect().width;
    const nextStretch = mobileQuery.matches ? 1 : Math.max(1, width / Math.max(300,height-65) / 1.55);
    if (Math.abs(nextStretch-horizontalStretch)>.01 || !initialized || anchorModeMobile!==mobileQuery.matches) {
      resetTransientGesture();
      userOffsets.clear();
      horizontalStretch=nextStretch;
      anchorModeMobile=mobileQuery.matches;
      layoutEpoch++;
      for (const node of layout) {
        const anchor=originalAnchors.get(node.id)!;
        const nodeCategory=categoryOf(node.id);
        const originalCenter=clusterCenters[nodeCategory as keyof typeof clusterCenters];
        const center=categoryCenter(nodeCategory);
        node.anchorX=mobileQuery.matches?center.x+(anchor.x-originalCenter.x)*.85:anchor.x*horizontalStretch;
        node.anchorY=mobileQuery.matches?center.y+(anchor.y-originalCenter.y)*.85:anchor.y;
        node.x=node.anchorX; node.y=node.anchorY;
      }
      updateTargets();
    }
    applyVisibility(false);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (selected) {
      const points = [...neighbors].map((id) => { const node = positions.get(id)!; return { x: node.targetX, y: node.targetY }; });
      const next = fitCamera(points, viewport(), mobileQuery.matches ? 72 : 125);
      next.scale = Math.min(next.scale, mobileQuery.matches ? .95 : 1.35); setCamera(next);
    } else fitVisible();
    if (!initialized) { camera = { ...targetCamera }; initialized = true; }
    wake();
  }

  function render() {
    ctx!.clearRect(0, 0, width, height);
    const view = viewport();
    const screenPoints = new Map<string, Point>();
    const labelCandidates: { node: LayoutNode; point: Point; size: number }[] = [];
    const occupied: { x:number; y:number; w:number; h:number }[] = [];
    const needsCaptions = nodeById.has(hovered ?? '') || nodeById.has(keyboardFocus ?? '') || !!selected
      || seriesNodes.some((node) => visibleIds.has(node.id));
    for (const node of layout) {
      if (!visibleIds.has(node.id)) continue;
      const position = worldToScreen(node, camera, view);
      screenPoints.set(node.id, position);
      const size = nodeSize(node);
      const presentation = views.get(node.id)!;
      node.element.style.transform = `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`;
      if (needsCaptions) occupied.push({x:position.x-size/2-4,y:position.y-size/2-4,w:size+8,h:size+8});
      if (presentation.size !== size) node.element.style.setProperty('--node-size', `${size}px`);
      presentation.size = size;
      const minor = !isMajor(node.id);
      if (presentation.minor !== minor) node.element.classList.toggle('is-minor', minor);
      presentation.minor = minor;
      const showLabel = nodeById.get(node.id)!.type === 'series'
        || hovered === node.id || keyboardFocus === node.id || selected === node.id;
      if (presentation.labelVisible !== showLabel) presentation.label!.style.visibility = showLabel ? 'visible' : 'hidden';
      presentation.labelVisible = showLabel;
      if (showLabel) labelCandidates.push({node,point:position,size});
    }

    // One visual grammar: quiet straight threads, always outside image rings.
    const emphasis = drag?.node ?? hovered ?? keyboardFocus ?? selected;
    const drawLink = (edge: {source:string;target:string}) => {
      const from = screenPoints.get(edge.source); const to = screenPoints.get(edge.target);
      if (!from || !to) return;
      const radius = (id: string) => nodeSize({id}) / 2 + 6;
      const segment = segmentBetweenCircles(from, to, radius(edge.source), radius(edge.target), 3);
      if (!segment) return;
      const active = emphasis === edge.source || emphasis === edge.target;
      const opacity = active ? .65 : emphasis ? .065 : .28;
      ctx!.strokeStyle = `rgba(183,172,145,${opacity})`;
      ctx!.beginPath(); ctx!.moveTo(segment.from.x, segment.from.y);
      ctx!.lineTo(segment.to.x, segment.to.y); ctx!.stroke();
    };
    ctx!.save(); ctx!.lineWidth = .9; ctx!.lineCap = 'round'; ctx!.setLineDash([]);
    for (const edge of data.edges) drawLink(edge);
    ctx!.restore();

    // Place readable captions around the image, rather than letting long names collide.
    for (const {node,point,size} of labelCandidates) {
      const presentation=views.get(node.id)!;
      const label=presentation.label!;
      const labelWidth=125;
      const font=`${mobileQuery.matches?13:14}px "Crimson Pro", Georgia, serif`;
      if (presentation.font !== font) {
        ctx!.font=font;
        presentation.labelHeight=Math.min(4,Math.ceil(ctx!.measureText(presentation.text).width/labelWidth))*17;
        presentation.font=font;
      }
      const labelHeight=presentation.labelHeight!;
      const distance=size/2+12;
      const offsets=[
        {x:-labelWidth/2,y:distance}, {x:-labelWidth/2,y:-distance-labelHeight},
        {x:distance,y:-labelHeight/2}, {x:-distance-labelWidth,y:-labelHeight/2},
        {x:distance*.7,y:distance*.7}, {x:-distance*.7-labelWidth,y:-distance*.7-labelHeight},
        {x:distance*.7,y:-distance*.7-labelHeight}, {x:-distance*.7-labelWidth,y:distance*.7},
      ];
      let best=offsets[0]; let bestScore=Infinity;
      for (let index=0;index<offsets.length;index++) {
        const offset=offsets[index];
        const box={x:point.x+offset.x,y:point.y+offset.y,w:labelWidth,h:labelHeight};
        let score=index*.8;
        for(const other of occupied) {
          const overlapX=Math.max(0,Math.min(box.x+box.w,other.x+other.w)-Math.max(box.x,other.x));
          const overlapY=Math.max(0,Math.min(box.y+box.h,other.y+other.h)-Math.max(box.y,other.y));
          score+=overlapX*overlapY;
        }
        if(box.x<8||box.x+box.w>view.width-8||box.y<8||box.y+box.h>view.height-8)score+=10000;
        if(score<bestScore){bestScore=score;best=offset;}
      }
      label.style.transform=`translate(${best.x}px,${best.y}px)`;
      occupied.push({x:point.x+best.x-4,y:point.y+best.y-3,w:labelWidth+8,h:labelHeight+6});
    }

  }

  function tick(now: number) {
    frame = 0;
    if (!alive || document.hidden || !inView || mode !== 'graph') return;
    const dt = lastTime ? Math.min((now - lastTime) / 1000, .05) : 1 / 60;
    lastTime = now;
    const animate = motion && !reducedMotion.matches;
    const directDrag = !!(drag?.node && drag.moved);
    const cameraEase = animate ? 1 - Math.pow(1 - .12, dt * 30) : 1;
    camera.x += (targetCamera.x-camera.x)*cameraEase;
    camera.y += (targetCamera.y-camera.y)*cameraEase;
    camera.scale += (targetCamera.scale-camera.scale)*cameraEase;
    const physicsStarted = profile ? performance.now() : 0;
    if (animate || directDrag) {
      stepPhysics(layout, physicsLinks(), physicsOptions(dt, animate ? now : undefined));
    } else solveStatic(layout, physicsLinks(), physicsOptions());
    const renderStarted = profile ? performance.now() : 0;
    render();
    profile?.record(now, renderStarted - physicsStarted, performance.now() - renderStarted, visibleIds.size);
    if (animate || directDrag) frame = requestAnimationFrame(tick);
  }

  function wake() {
    if (!alive || frame || document.hidden || !inView || mode !== 'graph') return;
    frame = requestAnimationFrame(tick);
  }

  function pointerPoint(event: PointerEvent | WheelEvent) {
    const box = graph.getBoundingClientRect();
    return { x: event.clientX-box.left, y: event.clientY-box.top };
  }

  graph.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.isPrimary === false) return;
    const target = (event.target as Element).closest<HTMLButtonElement>('[data-node]');
    const point = pointerPoint(event);
    const nodeId = target?.dataset.node ?? null;
    const node = nodeId ? positions.get(nodeId)! : null;
    const world = screenToWorld(point, camera, viewport());
    targetCamera = { ...camera };
    lastTime = 0;
    drag = {
      pointerId:event.pointerId, start:point, last:point, node:node?.id ?? null,
      moved:false, touch:event.pointerType==='touch',
      world:node ? { x:node.x, y:node.y } : null,
      placements:new Map(layout.filter((body) => visibleIds.has(body.id)).map((body) => [body.id, {x:body.x,y:body.y}])),
      pointerOffset:node ? { x:world.x-node.x, y:world.y-node.y } : { x:0, y:0 },
    };
    (target || graph).setPointerCapture(event.pointerId);
  }, { signal });

  graph.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const point = pointerPoint(event);
    if (!drag.moved && Math.hypot(point.x-drag.start.x,point.y-drag.start.y)>6) { drag.moved = true; lastTime = 0; }
    if (!drag.moved) return;
    graph.classList.add('is-dragging');
    if (drag.node) {
      const node = positions.get(drag.node)!;
      const world = screenToWorld(point, camera, viewport());
      drag.world={x:world.x-drag.pointerOffset.x,y:world.y-drag.pointerOffset.y};
      node.x=drag.world.x; node.y=drag.world.y; node.vx=0; node.vy=0;
    } else {
      const dx=(point.x-drag.last.x)/camera.scale;
      const dy=drag.touch ? 0 : (point.y-drag.last.y)/camera.scale;
      camera.x-=dx; camera.y-=dy; targetCamera={ ...camera };
    }
    drag.last=point; wake();
  }, { signal });

  const endDrag = (event: PointerEvent) => {
    if (!drag || drag.pointerId!==event.pointerId) return;
    if (event.type !== 'pointerup') { resetTransientGesture(); wake(); return; }
    if (drag.moved) {
      lastDrag=performance.now();
      if (drag.node) {
        for (const [id, start] of drag.placements) {
          if (!visibleIds.has(id)) continue;
          const node=positions.get(id)!;
          const delta={x:node.x-start.x,y:node.y-start.y};
          if (Math.hypot(delta.x,delta.y)*camera.scale < .5) continue;
          const previous=userOffsets.get(id) ?? {x:0,y:0};
          userOffsets.set(id,{x:previous.x+delta.x,y:previous.y+delta.y});
        }
      }
    }
    drag=null; graph.classList.remove('is-dragging'); wake();
    updateTargets(false);
  };
  graph.addEventListener('pointerup',endDrag,{signal});
  graph.addEventListener('pointercancel',endDrag,{signal});
  graph.addEventListener('lostpointercapture',endDrag,{signal});
  graph.addEventListener('wheel',(event)=>{
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault(); setCamera(zoomAt(camera,pointerPoint(event),camera.scale*Math.exp(-event.deltaY*.004),viewport()));
  },{passive:false,signal});

  root.addEventListener('click',(event)=>{
    const target=event.target as Element;
    const intentionalClick = (event as MouseEvent).detail === 0 || performance.now()-lastDrag>250;
    const node=target.closest<HTMLElement>('[data-node]');
    if (node) { if (intentionalClick) selectNode(node.dataset.node!); return; }
    const related=target.closest<HTMLElement>('[data-related-node]');
    if (related) { selectNode(related.dataset.relatedNode!); return; }
    const item=target.closest<HTMLElement>('[data-index-node]');
    if (item) { navigate(() => { setView('graph'); selectNode(item.dataset.indexNode!); }); return; }
    const categoryButton=target.closest<HTMLElement>('[data-beyond-category]');
    if (categoryButton) { chooseCategory(categoryButton.dataset.beyondCategory!); return; }
    const viewButton=target.closest<HTMLElement>('[data-beyond-view]');
    if (viewButton) { setView(viewButton.dataset.beyondView!); return; }
    if (target.closest('[data-beyond-close]')) { closeDetail(true, true, true); return; }
    if (target.closest('[data-beyond-back]')) { stepBack(); return; }
    if (target.closest('[data-beyond-reset]')) {
      if (category === 'all' && !searchText && !selected && mode === 'graph') { chooseCategory('all'); return; }
      navigate(() => { search.value=''; searchText=''; query=''; chooseCategory('all'); }); return;
    }
    const zoom=target.closest<HTMLElement>('[data-beyond-zoom]');
    if (zoom) { const view=viewport(); setCamera(zoomAt(camera,{x:view.width/2,y:view.height/2},camera.scale*(zoom.dataset.beyondZoom==='in'?1.3:1/1.3),view)); return; }
    if (target.closest('[data-beyond-motion]')) { motion=!motion && !reducedMotion.matches; updateMotionControl(); wake(); }
  },{signal});

  graph.addEventListener('pointerover',(event)=>{
    const node=(event.target as Element).closest<HTMLElement>('[data-node]');
    hovered=node?.dataset.node ?? null; wake();
  },{signal});
  graph.addEventListener('pointerleave',()=>{hovered=null;wake();},{signal});
  graph.addEventListener('focusin',(event)=>{ keyboardFocus=(event.target as HTMLElement).closest<HTMLElement>('[data-node]')?.dataset.node ?? null; wake(); },{signal});
  graph.addEventListener('focusout',()=>{keyboardFocus=null;wake();},{signal});
  search.addEventListener('input',()=>{ if (!editingSearch) rememberView(); editingSearch=true; userOffsets.clear(); searchText=search.value; query=searchText.trim().toLocaleLowerCase(); closeDetail(false,false); applyVisibility(); },{signal});
  search.addEventListener('blur',()=>{editingSearch=false;},{signal});
  document.addEventListener('keydown',(event)=>{if(event.key==='Escape'&&selected)closeDetail(true,true,true);},{signal});
  document.addEventListener('visibilitychange',()=>{lastTime=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();},{signal});
  reducedMotion.addEventListener('change',()=>{motion=!reducedMotion.matches;updateMotionControl();camera={...targetCamera};updateTargets();wake();},{signal});
  mobileQuery.addEventListener('change',resize,{signal});
  const resizeObserver=new ResizeObserver(resize); resizeObserver.observe(stage);
  const intersection=new IntersectionObserver(([entry])=>{
    inView=entry.isIntersecting;
    if(!inView){cancelAnimationFrame(frame);frame=0;lastTime=0;}else wake();
  }); intersection.observe(stage);
  updateMotionControl();
  resize(); root.classList.add('is-ready');
  state.cleanup=()=>{
    alive=false; resetTransientGesture(); cancelAnimationFrame(frame); controller.abort();
    resizeObserver.disconnect(); intersection.disconnect();
  };
}

if (!state.bootstrapped) {
  state.bootstrapped=true;
  document.addEventListener('astro:page-load',setupBeyondCode);
  document.addEventListener('astro:before-swap',()=>state.cleanup?.());
  setupBeyondCode();
}
