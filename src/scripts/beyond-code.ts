import {
  clamp, clusterCenters, connectedIds, createGraphLayout,
  fitCamera, screenToWorld, worldToScreen, zoomAt,
} from '../utils/beyond-code-graph.js';
import { solveStatic, stepPhysics } from '../utils/beyond-code-physics.js';

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
  origin: Point | null; pointerOffset: Point;
}
interface LayoutNode {
  id: string; x: number; y: number; anchorX: number; anchorY: number;
  major: boolean; phase: number; radius: number; vx: number; vy: number;
  targetX: number; targetY: number; element: HTMLButtonElement;
}
interface GraphData { nodes: GraphNode[]; edges: GraphEdge[]; categories: GraphCategory[]; copy: Record<string,string>; lang: string }
interface GraphState { cleanup?: () => void; bootstrapped?: boolean }

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
  const detail = root.querySelector<HTMLElement>('[data-beyond-detail]')!;
  const indexView = root.querySelector<HTMLElement>('[data-beyond-index]')!;
  const search = root.querySelector<HTMLInputElement>('[data-beyond-search]')!;
  const motionButton = root.querySelector<HTMLButtonElement>('[data-beyond-motion]')!;
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
  const primaryIds = new Set(data.categories.flatMap((entry) =>
    data.nodes.filter((node) => node.category === entry.id && !node.isContext).slice(0, 2).map((node) => node.id),
  ));
  const layout: LayoutNode[] = createGraphLayout(data.nodes).map((node: Omit<LayoutNode, 'vx' | 'vy' | 'targetX' | 'targetY' | 'element'>) => ({
    ...node, vx: 0, vy: 0, targetX: node.x, targetY: node.y,
    element: root.querySelector<HTMLButtonElement>(`[data-node="${node.id}"]`)!,
  }));
  const positions = new Map(layout.map((node) => [node.id, node]));
  const clusterElements = [...root.querySelectorAll<HTMLElement>('[data-cluster]')];
  let category = 'all';
  let query = '';
  let selected: string | null = null;
  let hovered: string | null = null;
  let keyboardFocus: string | null = null;
  let visibleIds = new Set(data.nodes.map((node) => node.id));
  let neighbors = new Set<string>();
  let mode = 'graph';
  let width = 1000;
  let height = 650;
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
    return primaryIds.has(id) || category !== 'all' || !!query || neighbors.has(id);
  }

  function nodeSize(node: { id: string }) {
    const entry = nodeById.get(node.id)!;
    if (entry.type === 'topic' && !entry.artwork) return 20;
    return clamp((isMajor(node.id) ? 59 : 32) * Math.sqrt(camera.scale), 23, 82);
  }

  function physicsOptions(dt = 1 / 30, idleTime?: number) {
    const dragging = !!drag?.node && drag.moved;
    const fixed = keyboardFocus ?? hovered;
    return {
      dt, scale: camera.scale, activeIds: visibleIds,
      draggedId: dragging ? drag!.node : null,
      dragPoint: dragging ? drag!.world : null,
      fixedIds: new Set(!dragging && fixed ? [fixed] : []),
      categoryFor: (node: { id: string }) => nodeById.get(node.id)?.category,
      // Both solver and DOM use the exact same screen-space size; the ring adds 6px.
      radiusFor: (node: { id: string }) => nodeSize(node) / 2 + 6,
      padding: 4,
      anchorOffsetFor: idleTime === undefined ? undefined : (node: { id: string }) => {
        const phase = positions.get(node.id)!.phase;
        return { x: Math.sin(idleTime * .00038 + phase) * 8, y: Math.cos(idleTime * .00031 + phase) * 10 };
      },
    };
  }

  function linkedComponent(id: string) {
    const component = new Set([id]);
    const queue = [id];
    while (queue.length) {
      const current = queue.shift()!;
      for (const next of connectedIds(current, data.edges)) {
        if (!component.has(next)) { component.add(next); queue.push(next); }
      }
    }
    return component;
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
    return { width: Math.max(260, width - detail.getBoundingClientRect().width), height: height - 65 };
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
    if (mobileQuery.matches && category==='all' && !query && !selected && mode==='graph') {
      visibleIds=new Set(data.categories.flatMap((entry)=>
        data.nodes.filter((node)=>node.category===entry.id&&!node.isContext).slice(0,3).map((node)=>node.id),
      ));
    }
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
      },
      zh: {
        'performed-by': ['演唱', '演唱的歌曲'], 'written-by': ['作者', '创作的作品'],
        'adapted-from': ['改编自', '改编作品'], 'produced-by': ['制作', '制作的作品'],
        'shared-universe': ['同一世界观', '同一世界观'],
      },
      ja: {
        'performed-by': ['アーティスト', '楽曲'], 'written-by': ['著者', '著作'],
        'adapted-from': ['原作', '映像化作品'], 'produced-by': ['制作', '制作作品'],
        'shared-universe': ['共通の世界観', '共通の世界観'],
      },
    };
    return labels[data.lang]?.[edge.relationship]?.[forward ? 0 : 1] ?? edge.label;
  }

  function updateTargets(syncStatic = true) {
    for (const node of layout) { node.targetX = node.anchorX; node.targetY = node.anchorY; }
    if (!selected && category !== 'all') {
      const center=categoryCenter(category);
      const external=layout.filter((node)=>visibleIds.has(node.id)&&nodeById.get(node.id)!.category!==category);
      external.forEach((node,index)=>{
        node.targetX=center.x+Math.cos(index*2.4+2.3)*340;
        node.targetY=center.y+Math.sin(index*2.4+2.3)*250;
      });
    }
    if (selected) {
      const center = positions.get(selected)!;
      const others = [...neighbors].filter((id) => id !== selected);
      const spread = others.length <= 2 ? Math.PI * 0.8 : Math.PI * 2;
      others.forEach((id, index) => {
        const node = positions.get(id)!;
        const angle = -Math.PI / 2 + (index + 0.5) * spread / Math.max(1, others.length);
        node.targetX = center.anchorX + Math.cos(angle) * 195;
        node.targetY = center.anchorY + Math.sin(angle) * 165;
      });
    }
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
    if (!node) return;
    resetTransientGesture();
    selected = id;
    neighbors = connectedIds(id, data.edges);
    detail.hidden = false;
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
    for (const item of layout) {
      item.element.setAttribute('aria-pressed', String(item.id === selected));
      item.element.classList.toggle('is-selected', item.id === selected);
      item.element.classList.toggle('is-neighbor', neighbors.has(item.id) && item.id !== selected);
      item.element.classList.toggle('is-muted', !neighbors.has(item.id));
    }
    title.focus({ preventScroll: true });
    if (mobileQuery.matches) stage.scrollIntoView({ block: 'start', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    wake();
  }

  function closeDetail(restoreFocus = false, refit = true) {
    resetTransientGesture();
    const previous = selected;
    selected = null; neighbors = new Set();
    detail.hidden = true;
    root!.classList.remove('is-detail-open');
    for (const node of layout) {
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
    const nextStretch = mobileQuery.matches ? 1 : Math.max(1, width / Math.max(300,height-65) / 1.55);
    if (Math.abs(nextStretch-horizontalStretch)>.01 || !initialized || mobileQuery.matches || anchorModeMobile!==mobileQuery.matches) {
      resetTransientGesture();
      userOffsets.clear();
      horizontalStretch=nextStretch;
      anchorModeMobile=mobileQuery.matches;
      for (const node of layout) {
        const anchor=originalAnchors.get(node.id)!;
        const entry=nodeById.get(node.id)!;
        const originalCenter=clusterCenters[entry.category as keyof typeof clusterCenters];
        const center=categoryCenter(entry.category);
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

  function render(now: number) {
    ctx!.clearRect(0, 0, width, height);
    const view = viewport();
    const mobileOverview = mobileQuery.matches && category === 'all' && !query && !selected;
    const screenPoints = new Map<string, Point>();
    const labelCandidates: { node: LayoutNode; point: Point; size: number }[] = [];
    const occupied: { x:number; y:number; w:number; h:number }[] = [];
    for (const node of layout) {
      if (!visibleIds.has(node.id)) continue;
      const position = worldToScreen(node, camera, view);
      screenPoints.set(node.id, position);
      const major = isMajor(node.id);
      const size = nodeSize(node);
      node.element.style.setProperty('--node-size', `${size}px`);
      const minor = (!major || mobileOverview) && hovered !== node.id && keyboardFocus !== node.id && !neighbors.has(node.id);
      node.element.classList.toggle('is-minor', minor);
      node.element.style.transform = `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`;
      node.element.dataset.category = nodeById.get(node.id)!.category;
      occupied.push({x:position.x-size/2-4,y:position.y-size/2-4,w:size+8,h:size+8});
      if ((!minor || hovered===node.id || keyboardFocus===node.id) && (!selected || neighbors.has(node.id))) labelCandidates.push({node,point:position,size});
    }

    for (const element of clusterElements) {
      const id = element.dataset.cluster!;
      const center = categoryCenter(id);
      const point = worldToScreen({ x: center.x, y: center.y - (mobileOverview ? 180 : 245) }, camera, view);
      element.style.transform = `translate(${point.x}px, ${point.y}px) translate(-50%, -50%)`;
      element.hidden = category === 'all' || !!query || category !== id;
      element.classList.toggle('is-muted', !!selected);
      if (element.hidden || selected) continue;
      occupied.push({x:point.x-65,y:point.y-12,w:130,h:30});
      // Open arcs mark category regions, not semantic relationships.
      const origin = worldToScreen(center, camera, view);
      ctx!.save(); ctx!.strokeStyle = 'rgba(177,151,86,.065)'; ctx!.lineWidth = 1;
      ctx!.setLineDash([2, 12]); ctx!.beginPath();
      ctx!.ellipse(origin.x, origin.y, 280 * camera.scale, 220 * camera.scale, -.12, .2, Math.PI * 1.9);
      ctx!.stroke(); ctx!.restore();
    }

    // Place readable captions around the image, rather than letting long names collide.
    for (const {node,point,size} of labelCandidates) {
      const label=node.element.querySelector<HTMLElement>('.beyond-node-label')!;
      const entry=nodeById.get(node.id)!;
      const sameName=data.nodes.filter((item)=>item.title===entry.title).length>1;
      const text=sameName?`${entry.title} · ${data.categories.find((item)=>item.id===entry.category)?.title??''}`:entry.title;
      if(label.textContent!==text)label.textContent=text;
      const labelWidth=125;
      ctx!.font=`${mobileQuery.matches?13:14}px "Crimson Pro", Georgia, serif`;
      const labelHeight=Math.min(4,Math.ceil(ctx!.measureText(text).width/labelWidth))*17;
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
      const canShow=bestScore<90||node.id===hovered||node.id===keyboardFocus||neighbors.has(node.id);
      label.style.visibility=canShow?'':'hidden';
      label.style.transform=`translate(${best.x}px,${best.y}px)`;
      if(canShow)occupied.push({x:point.x+best.x-4,y:point.y+best.y-3,w:labelWidth+8,h:labelHeight+6});
    }

    for (const edge of data.edges) {
      const from = screenPoints.get(edge.source); const to = screenPoints.get(edge.target);
      if (!from || !to) continue;
      const active = selected === edge.source || selected === edge.target;
      const opacity = selected ? (active ? .62 : .035) : .15;
      ctx!.save(); ctx!.strokeStyle = `rgba(203,173,99,${opacity})`; ctx!.lineWidth = active ? 1.15 : .7;
      if (edge.relationship === 'shared-universe') ctx!.setLineDash([3,5]);
      const bend = Math.min(65, Math.hypot(to.x-from.x,to.y-from.y) * .1);
      const middle = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 - bend };
      ctx!.beginPath(); ctx!.moveTo(from.x,from.y); ctx!.quadraticCurveTo(middle.x,middle.y,to.x,to.y); ctx!.stroke();
      if (active) {
        ctx!.font = '12px "Crimson Pro", Georgia, serif'; ctx!.textAlign = 'center';
        const textWidth = ctx!.measureText(edge.label).width;
        const length=Math.max(1,Math.hypot(to.x-from.x,to.y-from.y));
        const normal={x:-(to.y-from.y)/length,y:(to.x-from.x)/length};
        let caption={x:(from.x+to.x)/2,y:(from.y+to.y)/2-bend/2};
        let score=Infinity;
        for(const t of [.5,.4,.6,.3,.7])for(const offset of [15,-15,29,-29]) {
          const point={
            x:(1-t)**2*from.x+2*(1-t)*t*middle.x+t*t*to.x+normal.x*offset,
            y:(1-t)**2*from.y+2*(1-t)*t*middle.y+t*t*to.y+normal.y*offset,
          };
          const box={x:point.x-textWidth/2-6,y:point.y-9,w:textWidth+12,h:17};
          let overlap=0;
          for(const other of occupied)overlap+=Math.max(0,Math.min(box.x+box.w,other.x+other.w)-Math.max(box.x,other.x))*Math.max(0,Math.min(box.y+box.h,other.y+other.h)-Math.max(box.y,other.y));
          if(overlap<score){score=overlap;caption=point;}
        }
        if(score<5) {
          ctx!.fillStyle = 'rgba(10,10,15,.92)'; ctx!.fillRect(caption.x-textWidth/2-6,caption.y-9,textWidth+12,17);
          ctx!.fillStyle = '#b8a16d'; ctx!.fillText(edge.label,caption.x,caption.y+3);
          occupied.push({x:caption.x-textWidth/2-6,y:caption.y-9,w:textWidth+12,h:17});
        }
        if (motion && !reducedMotion.matches) {
          const t = (now * .00006) % 1;
          const x = (1-t)**2*from.x+2*(1-t)*t*middle.x+t*t*to.x;
          const y = (1-t)**2*from.y+2*(1-t)*t*middle.y+t*t*to.y;
          ctx!.fillStyle = 'rgba(237,209,135,.8)'; ctx!.beginPath(); ctx!.arc(x,y,1.5,0,Math.PI*2); ctx!.fill();
        }
      }
      ctx!.restore();
    }
  }

  function tick(now: number) {
    frame = 0;
    if (!alive || document.hidden || !inView || mode !== 'graph') return;
    if (now - lastTime < 1000 / 30) { frame = requestAnimationFrame(tick); return; }
    const dt = lastTime ? Math.min((now - lastTime) / 1000, .05) : 1 / 30;
    lastTime = now;
    const animate = motion && !reducedMotion.matches;
    const cameraEase = animate ? .12 : 1;
    camera.x += (targetCamera.x-camera.x)*cameraEase;
    camera.y += (targetCamera.y-camera.y)*cameraEase;
    camera.scale += (targetCamera.scale-camera.scale)*cameraEase;
    if (animate) {
      stepPhysics(layout, data.edges, physicsOptions(dt, now));
    } else solveStatic(layout, data.edges, physicsOptions());
    render(now);
    if (animate) frame = requestAnimationFrame(tick);
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
    if ((event.target as Element).closest('[data-cluster]')) return;
    const point = pointerPoint(event);
    const node = target?.dataset.node ? positions.get(target.dataset.node)! : null;
    const world = screenToWorld(point, camera, viewport());
    targetCamera = { ...camera };
    drag = {
      pointerId:event.pointerId, start:point, last:point, node:node?.id ?? null,
      moved:false, touch:event.pointerType==='touch',
      world:node ? { x:node.x, y:node.y } : null,
      origin:node ? { x:node.x, y:node.y } : null,
      pointerOffset:node ? { x:world.x-node.x, y:world.y-node.y } : { x:0, y:0 },
    };
    (target || graph).setPointerCapture(event.pointerId);
  }, { signal });

  graph.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const point = pointerPoint(event);
    if (Math.hypot(point.x-drag.start.x,point.y-drag.start.y)>6) drag.moved = true;
    if (!drag.moved) return;
    graph.classList.add('is-dragging');
    if (drag.node) {
      const node = positions.get(drag.node)!;
      const world = screenToWorld(point, camera, viewport());
      drag.world={x:world.x-drag.pointerOffset.x,y:world.y-drag.pointerOffset.y};
      node.x=drag.world.x; node.y=drag.world.y; node.vx=0; node.vy=0;
      if (!motion || reducedMotion.matches) {
        // User-driven updates still propagate; no timer continues the motion afterward.
        stepPhysics(layout, data.edges, physicsOptions());
      }
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
      if (drag.node && drag.world && drag.origin) {
        const delta={x:drag.world.x-drag.origin.x,y:drag.world.y-drag.origin.y};
        for (const id of linkedComponent(drag.node)) {
          if (!visibleIds.has(id)) continue;
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
    const node=target.closest<HTMLElement>('[data-node]');
    if (node) { if (performance.now()-lastDrag>250) selectNode(node.dataset.node!); return; }
    const related=target.closest<HTMLElement>('[data-related-node]');
    if (related) { selectNode(related.dataset.relatedNode!); return; }
    const item=target.closest<HTMLElement>('[data-index-node]');
    if (item) { setView('graph'); selectNode(item.dataset.indexNode!); return; }
    const categoryButton=target.closest<HTMLElement>('[data-beyond-category],[data-cluster]');
    if (categoryButton) { chooseCategory(categoryButton.dataset.beyondCategory ?? categoryButton.dataset.cluster!); return; }
    const viewButton=target.closest<HTMLElement>('[data-beyond-view]');
    if (viewButton) { setView(viewButton.dataset.beyondView!); return; }
    if (target.closest('[data-beyond-close]')) { closeDetail(true); return; }
    if (target.closest('[data-beyond-reset]')) {
      search.value=''; query=''; chooseCategory('all'); return;
    }
    const zoom=target.closest<HTMLElement>('[data-beyond-zoom]');
    if (zoom) { const view=viewport(); setCamera(zoomAt(camera,{x:view.width/2,y:view.height/2},camera.scale*(zoom.dataset.beyondZoom==='in'?1.3:1/1.3),view)); return; }
    if (target.closest('[data-beyond-motion]')) { motion=!motion && !reducedMotion.matches; motionButton.setAttribute('aria-pressed',String(motion)); wake(); }
  },{signal});

  graph.addEventListener('pointerover',(event)=>{
    const node=(event.target as Element).closest<HTMLElement>('[data-node]');
    hovered=node?.dataset.node??null; wake();
  },{signal});
  graph.addEventListener('pointerleave',()=>{hovered=null;wake();},{signal});
  graph.addEventListener('focusin',(event)=>{ keyboardFocus=(event.target as HTMLElement).closest<HTMLElement>('[data-node]')?.dataset.node??null; wake(); },{signal});
  graph.addEventListener('focusout',()=>{keyboardFocus=null;wake();},{signal});
  search.addEventListener('input',()=>{ userOffsets.clear(); query=search.value.trim().toLocaleLowerCase(); closeDetail(false,false); applyVisibility(); },{signal});
  document.addEventListener('keydown',(event)=>{if(event.key==='Escape'&&selected)closeDetail(true);},{signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();},{signal});
  reducedMotion.addEventListener('change',()=>{motion=!reducedMotion.matches;motionButton.setAttribute('aria-pressed',String(motion));camera={...targetCamera};updateTargets();wake();},{signal});
  mobileQuery.addEventListener('change',resize,{signal});
  const resizeObserver=new ResizeObserver(resize); resizeObserver.observe(stage);
  const intersection=new IntersectionObserver(([entry])=>{
    inView=entry.isIntersecting;
    if(!inView){cancelAnimationFrame(frame);frame=0;}else wake();
  }); intersection.observe(stage);
  motionButton.setAttribute('aria-pressed',String(motion));
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
