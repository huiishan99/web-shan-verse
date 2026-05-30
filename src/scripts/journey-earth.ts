import {
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Raycaster,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Object3D,
  type Texture,
} from 'three';

interface JourneyPoint {
  id: string;
  name: string;
  note: string;
  lat: number;
  lon: number;
  year: number;
  period: string;
  kind: string;
  kindLabel: string;
}

type GestureZoomEvent = Event & { scale?: number };
type MarkerSprite = Sprite & {
  userData: {
    point: JourneyPoint;
    baseScale: number;
    phase: number;
  };
};
type MarkerHitTarget = Mesh & {
  userData: {
    point: JourneyPoint;
    marker: MarkerSprite;
  };
};

export function initJourneyEarthScenes() {
  document.querySelectorAll('[data-earth-scene]').forEach((rootElement) => {
    if (!(rootElement instanceof HTMLElement)) return;
    const root = rootElement;
    if (root.dataset.earthReady === 'true') return;

    const canvasElement = root.querySelector('[data-earth-canvas]');
    if (!(canvasElement instanceof HTMLCanvasElement)) return;
    const canvas = canvasElement;
    const placeCard = root.querySelector('[data-place-card]');
    const placeInitial = root.querySelector('[data-place-initial]');
    const placeKicker = root.querySelector('[data-place-kicker]');
    const placeName = root.querySelector('[data-place-name]');
    const placeNote = root.querySelector('[data-place-note]');

    root.dataset.earthReady = 'true';
    const points = JSON.parse(root.dataset.points || '[]') as JourneyPoint[];
    const initialMobileLayout = window.matchMedia('(max-width: 719px)').matches;
    const lowMemoryDevice = 'deviceMemory' in navigator
      && Number((navigator as Navigator & { deviceMemory?: number }).deviceMemory) <= 4;
    const mobilePerformanceMode = initialMobileLayout || lowMemoryDevice;
    root.dataset.performanceMode = mobilePerformanceMode ? 'mobile' : 'full';

    const renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !mobilePerformanceMode,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    renderer.outputColorSpace = SRGBColorSpace;

    const scene = new Scene();
    const camera = new PerspectiveCamera(38, 1, 0.1, 100);

    const ambient = new AmbientLight(0xb6c7e8, 0.82);
    const keyLight = new DirectionalLight(0xffdf9b, 1.75);
    keyLight.position.set(-3.2, 4.1, 5.2);
    const rimLight = new DirectionalLight(0x9bbcff, 1.75);
    rimLight.position.set(4.2, -1.4, 3.2);
    scene.add(ambient, keyLight, rimLight);

    const globe = new Group();
    scene.add(globe);

    function seededNoise(x: number, y: number) {
      return Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1;
    }

    function createFlareTexture() {
      const size = mobilePerformanceMode ? 128 : 256;
      const flareCanvas = document.createElement('canvas');
      flareCanvas.width = size;
      flareCanvas.height = size;
      const context = flareCanvas.getContext('2d');
      if (!context) return null;

      const center = size / 2;
      const glow = context.createRadialGradient(center, center, 0, center, center, center);
      glow.addColorStop(0, 'rgba(255, 235, 172, 1)');
      glow.addColorStop(0.22, 'rgba(255, 210, 92, 0.82)');
      glow.addColorStop(0.48, 'rgba(153, 113, 37, 0.26)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      context.fillStyle = glow;
      context.fillRect(0, 0, size, size);
      context.strokeStyle = 'rgba(255, 226, 139, 0.72)';
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(center, 22);
      context.lineTo(center, size - 22);
      context.moveTo(22, center);
      context.lineTo(size - 22, center);
      context.stroke();

      const texture = new CanvasTexture(flareCanvas);
      texture.colorSpace = SRGBColorSpace;
      return texture;
    }

    function createMarkerStarTexture() {
      const size = mobilePerformanceMode ? 128 : 256;
      const markerCanvas = document.createElement('canvas');
      markerCanvas.width = size;
      markerCanvas.height = size;
      const context = markerCanvas.getContext('2d');
      if (!context) return null;

      const center = size / 2;
      context.clearRect(0, 0, size, size);

      const glow = context.createRadialGradient(center, center, 0, center, center, 78);
      glow.addColorStop(0, 'rgba(255, 246, 205, 0.92)');
      glow.addColorStop(0.26, 'rgba(246, 202, 88, 0.24)');
      glow.addColorStop(0.72, 'rgba(156, 108, 28, 0.06)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context.fillStyle = glow;
      context.fillRect(0, 0, size, size);

      context.save();
      context.translate(center, center);
      context.globalCompositeOperation = 'screen';

      context.strokeStyle = 'rgba(255, 238, 176, 0.58)';
      context.lineWidth = 1.7;
      context.lineCap = 'round';
      context.beginPath();
      context.moveTo(-44, 0);
      context.lineTo(44, 0);
      context.moveTo(0, -38);
      context.lineTo(0, 38);
      context.stroke();

      context.strokeStyle = 'rgba(255, 214, 106, 0.28)';
      context.lineWidth = 1.1;
      context.beginPath();
      context.moveTo(-24, -24);
      context.lineTo(24, 24);
      context.moveTo(24, -24);
      context.lineTo(-24, 24);
      context.stroke();

      const halo = context.createRadialGradient(0, 0, 0, 0, 0, 34);
      halo.addColorStop(0, 'rgba(255, 248, 213, 0.92)');
      halo.addColorStop(0.44, 'rgba(255, 213, 100, 0.42)');
      halo.addColorStop(1, 'rgba(201, 162, 39, 0)');
      context.fillStyle = halo;
      context.beginPath();
      context.arc(0, 0, 34, 0, Math.PI * 2);
      context.fill();

      const core = context.createRadialGradient(0, 0, 0, 0, 0, 13);
      core.addColorStop(0, 'rgba(255, 255, 238, 1)');
      core.addColorStop(0.5, 'rgba(255, 230, 136, 0.96)');
      core.addColorStop(1, 'rgba(201, 162, 39, 0)');
      context.fillStyle = core;
      context.beginPath();
      context.arc(0, 0, 14, 0, Math.PI * 2);
      context.fill();
      context.restore();

      const texture = new CanvasTexture(markerCanvas);
      texture.colorSpace = SRGBColorSpace;
      return texture;
    }

    const flareTexture = createFlareTexture();
    const arrivalFlareMaterial = new SpriteMaterial({
      map: flareTexture || undefined,
      color: 0xffd66c,
      transparent: true,
      opacity: 0.95,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const arrivalFlare = new Sprite(arrivalFlareMaterial);
    scene.add(arrivalFlare);

    const sphereSegments = mobilePerformanceMode ? 40 : 96;
    const earthGeometry = new SphereGeometry(2, sphereSegments, sphereSegments);
    const textureLoader = new TextureLoader();
    const maxAnisotropy = mobilePerformanceMode
      ? 1
      : Math.min(16, renderer.capabilities.getMaxAnisotropy());
    function configureEarthTexture(texture: Texture) {
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = maxAnisotropy;
    }

    // Start with a lighter texture so the entrance animation can begin quickly,
    // then upgrade to the full atlas once the intro has settled.
    const baseTextureUrl = mobilePerformanceMode
      ? '/images/earth-natural-muted-2048.jpg'
      : '/images/earth-natural-muted-4096.jpg';
    const earthTexture = textureLoader.load(baseTextureUrl);
    configureEarthTexture(earthTexture);
    let highResEarthTexture: Texture | null = null;
    let highResEarthReady = false;
    let highResEarthSwapped = false;
    let sceneDisposed = false;
    root.dataset.earthTexture = mobilePerformanceMode ? '2048' : '4096';

    if (!mobilePerformanceMode && renderer.capabilities.maxTextureSize >= 8192) {
      highResEarthTexture = textureLoader.load(
        '/images/earth-natural-muted-8192.jpg',
        (loadedTexture: Texture) => {
          if (sceneDisposed) {
            loadedTexture.dispose();
            return;
          }
          configureEarthTexture(loadedTexture);
          highResEarthReady = true;
          root.dataset.earthTexture = '8192-ready';
        },
        undefined,
        () => {
          highResEarthTexture?.dispose();
          highResEarthTexture = null;
        }
      );
      configureEarthTexture(highResEarthTexture);
    }
    const earthMaterial = new MeshBasicMaterial({
      color: 0xffffff,
      map: earthTexture,
    });
    const earth = new Mesh(earthGeometry, earthMaterial);
    globe.add(earth);

    const earthRimMaterial = new ShaderMaterial({
      uniforms: {
        rimColor: { value: new Color(0x8fb6dd) },
        brassColor: { value: new Color(0xc9a227) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewPosition = normalize(-mvPosition.xyz);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 rimColor;
        uniform vec3 brassColor;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          float rim = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0), 2.35);
          vec3 color = mix(rimColor, brassColor, 0.22);
          gl_FragColor = vec4(color, rim * 0.26);
        }
      `,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const earthRim = new Mesh(new SphereGeometry(2.026, sphereSegments, sphereSegments), earthRimMaterial);
    globe.add(earthRim);

    const markerHitTargets: MarkerHitTarget[] = [];
    const markerSprites: MarkerSprite[] = [];
    const markerWorldPosition = new Vector3();
    const markerScreenPosition = new Vector3();
    const raycaster = new Raycaster();
    const pointer = new Vector2();
    let selectedMarker: Object3D | null = null;
    let activeMarkerTarget: MarkerHitTarget | null = null;

    function latLonToVector3(lat: number, lon: number, radius = 2.028) {
      const phi = MathUtils.degToRad(90 - lat);
      const theta = MathUtils.degToRad(lon + 180);

      return new Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }

    const markerHitGeometry = new SphereGeometry(
      mobilePerformanceMode ? 0.09 : 0.075,
      mobilePerformanceMode ? 8 : 16,
      mobilePerformanceMode ? 6 : 16
    );
    const markerTexture = createMarkerStarTexture();
    const markerMaterial = new SpriteMaterial({
      map: markerTexture || undefined,
      color: 0xf4c95e,
      transparent: true,
      opacity: 0.88,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const markerHitMaterial = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });

    points.forEach((point) => {
      const position = latLonToVector3(point.lat, point.lon);
      const normal = position.clone().normalize();
      const marker = new Sprite(markerMaterial.clone()) as MarkerSprite;
      marker.position.copy(normal.clone().multiplyScalar(2.012));
      marker.scale.setScalar(0.092);
      marker.userData.point = point;
      marker.userData.baseScale = 0.092;
      marker.userData.phase = seededNoise(point.lat, point.lon) * Math.PI * 2;
      globe.add(marker);
      markerSprites.push(marker);

      const hitTarget = new Mesh(markerHitGeometry, markerHitMaterial) as unknown as MarkerHitTarget;
      hitTarget.position.copy(normal.clone().multiplyScalar(2.018));
      hitTarget.userData.point = point;
      hitTarget.userData.marker = marker;
      globe.add(hitTarget);
      markerHitTargets.push(hitTarget);
    });

    const starGeometry = new BufferGeometry();
    const starCount = mobilePerformanceMode ? 96 : 260;
    const starPositions = new Float32Array(starCount * 3);
    for (let index = 0; index < starCount; index += 1) {
      const radius = 8 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[index * 3 + 1] = radius * Math.cos(phi);
      starPositions[index * 3 + 2] = -Math.abs(radius * Math.sin(phi) * Math.sin(theta)) - 2;
    }
    starGeometry.setAttribute('position', new BufferAttribute(starPositions, 3));
    const stars = new Points(
      starGeometry,
      new PointsMaterial({
        color: 0xd8e6ff,
        size: 0.035,
        transparent: true,
        opacity: 0.46,
        depthWrite: false,
      })
    );
    scene.add(stars);

    let targetRotationX = 0.18;
    let targetRotationY = 2.54;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let dragDistance = 0;
    let finalGlobeScale = 1;
    let userZoom = 1;
    let gestureStartZoom = 1;
    let isMobileLayout = false;
    let sceneStartTime = 0;
    let entranceReady = false;
    let entranceTimer = 0;
    const minZoom = 0.72;
    const maxZoom = 1.75;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const introDelay = 0;
    const introDuration = reducedMotion ? 1 : 2200;
    const finalGlobePosition = new Vector3();
    const introStartPosition = new Vector3();
    const introControlPosition = new Vector3();
    const currentGlobePosition = new Vector3();

    globe.rotation.x = targetRotationX;
    globe.rotation.y = targetRotationY;
    globe.rotation.z = 0.04;

    function easeOutCubic(progress: number) {
      return 1 - Math.pow(1 - progress, 3);
    }

    function startEntranceAfterPaint() {
      window.clearTimeout(entranceTimer);
      entranceTimer = window.setTimeout(() => {
        entranceReady = true;
      }, reducedMotion ? 0 : 40);
    }

    if (document.readyState === 'complete') {
      startEntranceAfterPaint();
    } else {
      window.addEventListener('load', startEntranceAfterPaint, { once: true });
    }

    function resize() {
      const width = Math.max(1, root.clientWidth);
      const height = Math.max(1, root.clientHeight);
      const isMobile = width < 720;
      isMobileLayout = isMobile;

      const pixelRatioCap = isMobile ? 1 : 2;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, pixelRatioCap);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      root.dataset.renderPixelRatio = pixelRatio.toFixed(2);
      camera.aspect = width / height;
      camera.position.set(isMobile ? 0.02 : 0.06, isMobile ? 0.46 : 0.16, isMobile ? 5.65 : 5.08);
      camera.lookAt(isMobile ? 0.02 : 0.02, isMobile ? -0.12 : -0.14, 0);
      camera.updateProjectionMatrix();

      finalGlobePosition.set(isMobile ? 0.02 : 0.04, isMobile ? -0.33 : -0.62, 0);
      finalGlobeScale = isMobile ? 0.98 : 1.1;

      if (reducedMotion) {
        globe.position.copy(finalGlobePosition);
        globe.scale.setScalar(getTargetGlobeScale());
        arrivalFlare.visible = false;
      }

      updatePlaceCardPosition();
    }

    function clamp(value: number, min: number, max: number) {
      return Math.min(Math.max(value, min), max);
    }

    function getTargetGlobeScale() {
      return finalGlobeScale * userZoom;
    }

    function setCardText(element: Element | null, value: string) {
      if (element instanceof HTMLElement) element.textContent = value;
    }

    function updatePlaceCardPosition() {
      if (!(placeCard instanceof HTMLElement) || placeCard.hidden || !selectedMarker) return;

      selectedMarker.getWorldPosition(markerWorldPosition);
      markerScreenPosition.copy(markerWorldPosition).project(camera);

      if (markerScreenPosition.z < -1 || markerScreenPosition.z > 1) {
        placeCard.classList.remove('is-visible');
        return;
      }

      const anchorX = (markerScreenPosition.x * 0.5 + 0.5) * root.clientWidth;
      const anchorY = (-markerScreenPosition.y * 0.5 + 0.5) * root.clientHeight;
      const cardWidth = placeCard.offsetWidth || 196;
      const cardHeight = placeCard.offsetHeight || 190;
      const left = anchorX - cardWidth / 2;
      const top = anchorY - cardHeight - 16;
      const pinX = cardWidth / 2;

      placeCard.style.left = `${left}px`;
      placeCard.style.top = `${top}px`;
      placeCard.style.setProperty('--pin-x', `${pinX}px`);
      placeCard.classList.add('is-visible');
    }

    function showPlaceCard(target: MarkerHitTarget) {
      if (!(placeCard instanceof HTMLElement)) return;

      const point = target.userData.point;
      activeMarkerTarget = target;
      selectedMarker = target.userData.marker || target;
      const pointDateLabel = point.period || point.year || '';
      const pointKindLabel = point.kindLabel || point.kind;
      const pointInitial = Array.from(String(point.name || '?').trim())[0] || '?';
      setCardText(placeInitial, pointInitial.toUpperCase());
      setCardText(placeKicker, pointDateLabel ? `${pointDateLabel} / ${pointKindLabel}` : pointKindLabel);
      setCardText(placeName, point.name);
      setCardText(placeNote, point.note);
      placeCard.hidden = false;
      root.dataset.selectedPlace = point.id;
      requestAnimationFrame(updatePlaceCardPosition);
    }

    function hidePlaceCard() {
      selectedMarker = null;
      activeMarkerTarget = null;
      delete root.dataset.selectedPlace;
      if (placeCard instanceof HTMLElement) {
        placeCard.classList.remove('is-visible');
        placeCard.hidden = true;
      }
    }

    function findMarkerFromPointer(event: PointerEvent): MarkerHitTarget | null {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(markerHitTargets, false);
      return (hits[0]?.object as MarkerHitTarget | undefined) || null;
    }

    function onPointerDown(event: PointerEvent) {
      isDragging = true;
      dragDistance = 0;
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    }

    function onPointerMove(event: PointerEvent) {
      if (!isDragging) {
        const target = findMarkerFromPointer(event);
        canvas.style.cursor = target ? 'pointer' : 'grab';
        if (target) {
          showPlaceCard(target);
        } else if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
          hidePlaceCard();
        }
        return;
      }
      const deltaX = event.clientX - lastX;
      const deltaY = event.clientY - lastY;
      dragDistance = Math.max(
        dragDistance,
        Math.hypot(event.clientX - pointerStartX, event.clientY - pointerStartY)
      );
      targetRotationY += deltaX * (isMobileLayout ? 0.007 : 0.004);
      targetRotationX = MathUtils.clamp(
        targetRotationX + deltaY * (isMobileLayout ? 0.0038 : 0.0022),
        -1.08,
        0.88
      );
      lastX = event.clientX;
      lastY = event.clientY;
    }

    function onPointerUp(event: PointerEvent) {
      const shouldSelect = dragDistance < 7;
      isDragging = false;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      if (!shouldSelect) {
        canvas.style.cursor = 'grab';
        return;
      }

      const target = findMarkerFromPointer(event);
      if (target) {
        canvas.style.cursor = 'pointer';
        showPlaceCard(target);
      } else {
        canvas.style.cursor = 'grab';
        hidePlaceCard();
      }
    }

    function onPointerLeave(event: PointerEvent) {
      canvas.style.cursor = 'grab';
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
        hidePlaceCard();
      }
    }

    function onWheelZoom(event: WheelEvent) {
      event.preventDefault();
      const zoomIntensity = event.ctrlKey ? 0.006 : 0.0014;
      userZoom = clamp(userZoom * Math.exp(-event.deltaY * zoomIntensity), minZoom, maxZoom);
      root.dataset.zoom = userZoom.toFixed(3);
      updatePlaceCardPosition();
    }

    function onGestureStart(event: GestureZoomEvent) {
      event.preventDefault();
      gestureStartZoom = userZoom;
    }

    function onGestureChange(event: GestureZoomEvent) {
      event.preventDefault();
      const gestureScale = Number(event.scale) || 1;
      userZoom = clamp(gestureStartZoom * gestureScale, minZoom, maxZoom);
      root.dataset.zoom = userZoom.toFixed(3);
      updatePlaceCardPosition();
    }

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('wheel', onWheelZoom, { passive: false });
    canvas.addEventListener('gesturestart', onGestureStart, { passive: false });
    canvas.addEventListener('gesturechange', onGestureChange, { passive: false });
    window.addEventListener('resize', resize);

    let animationFrame = 0;
    let lastCanvasSample = 0;

    function sampleCanvasPixels() {
      const sample = document.createElement('canvas');
      sample.width = 72;
      sample.height = 72;
      const context = sample.getContext('2d', { willReadFrequently: true });
      if (!context) return;

      context.drawImage(canvas, 0, 0, sample.width, sample.height);
      const data = context.getImageData(0, 0, sample.width, sample.height).data;
      let nonTransparent = 0;
      let bright = 0;

      for (let index = 0; index < data.length; index += 4) {
        const red = data[index];
        const green = data[index + 1];
        const blue = data[index + 2];
        const alpha = data[index + 3];

        if (alpha > 4) nonTransparent += 1;
        if (red + green + blue > 80) bright += 1;
      }

      root.dataset.canvasPixelSample = JSON.stringify({
        width: canvas.width,
        height: canvas.height,
        nonTransparent,
        bright,
        total: sample.width * sample.height,
      });
    }

    function animate(time = 0) {
      if (entranceReady && sceneStartTime === 0) sceneStartTime = time + introDelay;

      const introProgress = entranceReady
        ? MathUtils.clamp((time - sceneStartTime) / introDuration, 0, 1)
        : 0;
      const easedIntro = reducedMotion ? 1 : easeOutCubic(introProgress);
      if (highResEarthReady && highResEarthTexture && !highResEarthSwapped && introProgress >= 1 && !isDragging) {
        highResEarthSwapped = true;
        const previousTexture = earthMaterial.map;
        renderer.initTexture(highResEarthTexture);
        earthMaterial.map = highResEarthTexture;
        earthMaterial.needsUpdate = true;
        previousTexture?.dispose();
        root.dataset.earthTexture = '8192';
      }
      const startScale = isMobileLayout ? 0.13 : 0.16;
      const flarePulse = Math.sin(Math.min(1, introProgress) * Math.PI);
      introStartPosition.set(
        finalGlobePosition.x + (isMobileLayout ? 1.28 : 1.86),
        finalGlobePosition.y + (isMobileLayout ? 1.72 : 1.94),
        -4.15
      );
      introControlPosition.set(
        finalGlobePosition.x + (isMobileLayout ? 0.72 : 1.1),
        finalGlobePosition.y + (isMobileLayout ? 0.58 : 0.82),
        -1.35
      );
      const inverseIntro = 1 - easedIntro;
      currentGlobePosition
        .copy(introStartPosition)
        .multiplyScalar(inverseIntro * inverseIntro)
        .addScaledVector(introControlPosition, 2 * inverseIntro * easedIntro)
        .addScaledVector(finalGlobePosition, easedIntro * easedIntro);

      const settledMotion = reducedMotion ? 0 : Math.min(1, Math.max(0, introProgress - 0.72) / 0.28);
      currentGlobePosition.y += Math.sin(time * 0.00042) * 0.018 * settledMotion;
      currentGlobePosition.z += Math.sin(time * 0.00028) * 0.018 * settledMotion;
      globe.position.copy(currentGlobePosition);
      globe.scale.setScalar(
        MathUtils.lerp(startScale, getTargetGlobeScale(), easedIntro) * (1 + flarePulse * 0.035)
      );

      arrivalFlare.position.copy(currentGlobePosition);
      arrivalFlare.position.z += 0.08;
      arrivalFlare.scale.setScalar(MathUtils.lerp(0.22, isMobileLayout ? 0.82 : 1.08, flarePulse));
      arrivalFlareMaterial.opacity = reducedMotion ? 0 : Math.max(0, 1 - introProgress) * 0.88;
      arrivalFlare.visible = arrivalFlareMaterial.opacity > 0.02;

      const idleMotion = isDragging || reducedMotion ? 0 : settledMotion;
      const idleRotationX = Math.sin(time * 0.00019) * 0.012 * idleMotion;
      const idleRotationY = Math.sin(time * 0.00016) * 0.032 * idleMotion;
      const rotationEase = isDragging
        ? (isMobileLayout ? 0.28 : 0.16)
        : (isMobileLayout ? 0.09 : 0.055);
      globe.rotation.x += (targetRotationX + idleRotationX - globe.rotation.x) * rotationEase;
      globe.rotation.y += (targetRotationY + idleRotationY - globe.rotation.y) * rotationEase;
      stars.rotation.y += 0.00008;
      root.dataset.introProgress = introProgress.toFixed(3);
      markerSprites.forEach((marker) => {
        const isActive = activeMarkerTarget?.userData.marker === marker;
        const baseScale = marker.userData.baseScale || 0.11;
        const twinkle = reducedMotion ? 0 : Math.sin(time * 0.0034 + marker.userData.phase) * 0.08;
        const targetScale = baseScale * (isActive ? 1.48 : 1 + twinkle);
        const currentScale = marker.scale.x || baseScale;
        const nextScale = MathUtils.lerp(currentScale, targetScale, 0.18);
        marker.scale.setScalar(nextScale);
        marker.material.opacity = isActive ? 1 : 0.78 + Math.max(0, twinkle) * 0.32;
      });

      renderer.render(scene, camera);
      updatePlaceCardPosition();
      if (!mobilePerformanceMode && time - lastCanvasSample > 1200) {
        lastCanvasSample = time;
        sampleCanvasPixels();
      }

      animationFrame = requestAnimationFrame(animate);
    }

    function cleanup() {
      sceneDisposed = true;
      cancelAnimationFrame(animationFrame);
      window.clearTimeout(entranceTimer);
      window.removeEventListener('load', startEntranceAfterPaint);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('wheel', onWheelZoom);
      canvas.removeEventListener('gesturestart', onGestureStart);
      canvas.removeEventListener('gesturechange', onGestureChange);
      root.dataset.earthReady = 'false';
      renderer.dispose();
      earthGeometry.dispose();
      earthMaterial.map?.dispose();
      if (highResEarthTexture && highResEarthTexture !== earthMaterial.map) {
        highResEarthTexture.dispose();
      }
      earthRim.geometry.dispose();
      earthRimMaterial.dispose();
      flareTexture?.dispose();
      arrivalFlareMaterial.dispose();
      markerTexture?.dispose();
      markerHitGeometry.dispose();
      markerMaterial.dispose();
      markerHitMaterial.dispose();
      markerSprites.forEach((marker) => marker.material.dispose());
      starGeometry.dispose();
    }

    resize();
    animate();
    document.addEventListener('astro:before-swap', cleanup, { once: true });
  });
}
