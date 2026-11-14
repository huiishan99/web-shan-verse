import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import { createFrameProfile } from '../src/utils/beyond-code-profile.js';

// Execute the component's actual client script, with only browser APIs replaced.
// This catches a duplicate mount even if setup internals are later rearranged.
const component = readFileSync(new URL('../src/components/StarField.astro', import.meta.url), 'utf8');
const script = component.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, 'StarField must provide a client script');
const executable = ts.transpileModule(script.replaceAll('import.meta.env.DEV', 'false'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;

class Surface {
  listeners = new Map();

  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
  }

  removeEventListener(type, listener) {
    this.listeners.get(type)?.delete(listener);
  }

  emit(type) {
    for (const listener of [...(this.listeners.get(type) || [])]) listener({ type });
  }

  count(type) {
    return this.listeners.get(type)?.size || 0;
  }
}

function canvasFixture({ available = true } = {}) {
  const calls = { contexts: 0, draws: 0, resizes: 0 };
  const context = {
    clearRect() { calls.draws++; },
    setTransform() { calls.resizes++; },
    createRadialGradient() { return { addColorStop() {} }; },
    beginPath() {}, arc() {}, fill() {}, moveTo() {}, lineTo() {}, stroke() {},
  };
  const canvas = {
    dataset: {}, width: 0, height: 0,
    getContext() { calls.contexts++; return available ? context : null; },
  };
  return { canvas, calls };
}

function boot(initialCanvas) {
  let currentCanvas = initialCanvas;
  let nextFrame = 0;
  const frames = new Map();
  const document = new Surface();
  document.visibilityState = 'visible';
  document.getElementById = (id) => id === 'starCanvas' ? currentCanvas : null;
  const window = new Surface();
  window.innerWidth = 1280;
  window.innerHeight = 720;
  window.matchMedia = () => ({ matches: false });
  vm.runInNewContext(executable, {
    window, document,
    exports: {},
    require(path) {
      assert.equal(path, '../utils/beyond-code-profile.js');
      return { createFrameProfile };
    },
    requestAnimationFrame(callback) { const id = ++nextFrame; frames.set(id, callback); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
  });
  return {
    window, document,
    replaceCanvas(canvas) { currentCanvas = canvas; },
    frame(timestamp = 1000) {
      const pending = [...frames.values()];
      frames.clear();
      for (const callback of pending) callback(timestamp);
    },
  };
}

test('first page-load and repeated same-DOM events keep one initialized starfield', () => {
  const { canvas, calls } = canvasFixture();
  const app = boot(canvas);
  assert.equal(calls.contexts, 1);
  assert.equal(calls.draws, 1);
  app.document.emit('astro:page-load');
  app.document.emit('astro:page-load');
  assert.equal(calls.contexts, 1, 'same canvas must not be reacquired and reset');
  assert.equal(calls.draws, 1, 'page-load must not synchronously draw another randomized scene');
  assert.equal(app.document.count('mousemove'), 1);
  assert.equal(app.window.count('resize'), 1);
  app.frame();
  assert.equal(calls.draws, 2, 'existing animation must remain live');
});

test('Astro canvas replacement tears down the old renderer and mounts the new one once', () => {
  const old = canvasFixture();
  const app = boot(old.canvas);
  const replacement = canvasFixture();
  app.replaceCanvas(replacement.canvas);
  app.document.emit('astro:page-load');
  app.document.emit('astro:page-load');
  assert.equal(replacement.calls.contexts, 1);
  assert.equal(replacement.calls.draws, 1);
  app.frame();
  assert.equal(old.calls.draws, 1, 'removed canvas must not keep rendering');
  assert.equal(replacement.calls.draws, 2);
  assert.equal(app.document.count('mousemove'), 1);
  assert.equal(app.document.count('visibilitychange'), 1);
  assert.equal(app.window.count('resize'), 1);
});

test('cleanup allows the same canvas to mount again and missing canvases remain retryable', () => {
  const first = canvasFixture();
  const app = boot(first.canvas);
  app.window.__shanStarField.cleanup();
  assert.equal(app.document.count('mousemove'), 0);
  assert.equal(app.window.count('resize'), 0);
  app.frame();
  assert.equal(first.calls.draws, 1);
  app.document.emit('astro:page-load');
  assert.equal(first.calls.contexts, 2, 'cleanup must clear initialized identity');
  app.replaceCanvas(null);
  app.document.emit('astro:page-load');
  assert.equal(app.document.count('mousemove'), 0);
  const next = canvasFixture();
  app.replaceCanvas(next.canvas);
  app.document.emit('astro:page-load');
  assert.equal(next.calls.draws, 1);
  assert.equal(app.document.count('mousemove'), 1);
});

test('a missing drawing context does not poison initialization for a later replacement', () => {
  const app = boot(canvasFixture({ available: false }).canvas);
  assert.equal(app.document.count('mousemove'), 0);
  const next = canvasFixture();
  app.replaceCanvas(next.canvas);
  app.document.emit('astro:page-load');
  assert.equal(next.calls.draws, 1);
});

test('initialized renderer keeps existing visibility and viewport resize behavior', () => {
  const { canvas, calls } = canvasFixture();
  const app = boot(canvas);
  app.document.emit('astro:page-load');
  const before = calls.draws;
  app.document.visibilityState = 'hidden';
  app.document.emit('visibilitychange');
  app.frame();
  assert.equal(calls.draws, before);
  app.document.visibilityState = 'visible';
  app.document.emit('visibilitychange');
  app.frame();
  assert.equal(calls.draws, before + 1);
  const resizes = calls.resizes;
  app.window.innerWidth = 375;
  app.window.innerHeight = 800;
  app.window.emit('resize');
  assert.equal(calls.resizes, resizes + 1);
  assert.equal(canvas.width, 315);
  assert.equal(canvas.height, 672);
  assert.equal(canvas.dataset.starCount, '68');
});
