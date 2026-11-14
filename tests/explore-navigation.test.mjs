import assert from 'node:assert/strict';
import test from 'node:test';
import { setupExploreNavigation } from '../src/scripts/client/explore-navigation.js';

class Disclosure {
  nodeType = 1;
  open = false;
  focusCalls = [];

  constructor() {
    this.toggle = { nodeType: 1, owner: this, focus: (options) => this.focusCalls.push(options) };
    this.link = { nodeType: 1, owner: this };
  }

  contains(node) { return node === this || node?.owner === this; }
  querySelector(selector) {
    assert.equal(selector, '[data-site-explore-toggle]');
    return this.toggle;
  }
}

class DocumentSurface {
  disclosures = [];
  listeners = [];
  nodeType = 9;
  activeElement = null;

  querySelectorAll(selector) {
    assert.equal(selector, '[data-site-explore][open]');
    return this.disclosures.filter((disclosure) => disclosure.open);
  }

  addEventListener(type, callback, options = {}) {
    const listener = { type, callback, capture: options.capture === true };
    this.listeners.push(listener);
    options.signal?.addEventListener('abort', () => {
      this.listeners = this.listeners.filter((entry) => entry !== listener);
    }, { once: true });
  }

  emit(type, properties = {}) {
    const event = { target: this, prevented: false, stopped: false,
      preventDefault() { this.prevented = true; },
      stopImmediatePropagation() { this.stopped = true; },
      ...properties };
    // Document capture precedes scene/document bubble listeners, regardless of
    // registration order. Actual DOM ordering is independently exercised in E2E.
    const listeners = this.listeners.filter((listener) => listener.type === type)
      .sort((first, second) => Number(second.capture) - Number(first.capture));
    for (const { callback } of listeners) {
      callback(event);
      if (event.stopped) break;
    }
    return event;
  }
}

function fixture() {
  const document = new DocumentSurface();
  const disclosure = new Disclosure();
  document.disclosures.push(disclosure);
  const cleanup = setupExploreNavigation(document);
  return { document, disclosure, cleanup };
}

test('an open disclosure owns Escape before a selected scene and returns focus to its summary', () => {
  const document = new DocumentSurface();
  const disclosure = new Disclosure();
  document.disclosures.push(disclosure);
  let sceneEscapes = 0;
  document.addEventListener('keydown', () => sceneEscapes++);
  setupExploreNavigation(document);
  disclosure.open = true;
  document.activeElement = disclosure.link;
  const event = document.emit('keydown', { key: 'Escape', target: disclosure.link });
  assert.equal(disclosure.open, false);
  assert.equal(event.prevented, true);
  assert.equal(sceneEscapes, 0);
  assert.deepEqual(disclosure.focusCalls, [{ preventScroll: true }]);
});

test('Escape with an open disclosure does not steal external focus', () => {
  const { document, disclosure } = fixture();
  const externalInput = { nodeType: 1 };
  document.activeElement = externalInput;
  disclosure.open = true;
  const event = document.emit('keydown', { key: 'Escape', target: externalInput });
  assert.equal(disclosure.open, false);
  assert.equal(event.prevented, true);
  assert.deepEqual(disclosure.focusCalls, []);
});

test('a closed disclosure leaves scene Escape and ordinary native link activation untouched', () => {
  const { document, disclosure } = fixture();
  let sceneEscapes = 0;
  document.addEventListener('keydown', () => sceneEscapes++);
  const escape = document.emit('keydown', { key: 'Escape' });
  assert.equal(escape.prevented, false);
  assert.equal(sceneEscapes, 1);
  disclosure.open = true;
  const click = document.emit('click', { target: disclosure.link, ctrlKey: true });
  assert.equal(click.prevented, false);
  assert.equal(click.stopped, false);
  assert.equal(disclosure.open, true, 'native navigation is completed by the browser, not intercepted here');
  assert.deepEqual(disclosure.focusCalls, []);
});

test('outside pointer/click dismissal does not focus a control or change in-panel interaction', () => {
  const { document, disclosure } = fixture();
  const outside = { nodeType: 1 };
  for (const type of ['pointerdown', 'click']) {
    disclosure.open = true;
    document.emit(type, { target: disclosure.link });
    assert.equal(disclosure.open, true);
    const event = document.emit(type, { target: outside });
    assert.equal(disclosure.open, false);
    assert.equal(event.prevented, false);
    assert.deepEqual(disclosure.focusCalls, []);
  }
});

test('keyboard focus can move within the disclosure and leaving closes it without a focus trap', () => {
  const { document, disclosure } = fixture();
  disclosure.open = true;
  document.emit('focusout', { target: disclosure.toggle, relatedTarget: disclosure.link });
  assert.equal(disclosure.open, true);
  document.emit('focusout', { target: disclosure.link, relatedTarget: { nodeType: 1 } });
  assert.equal(disclosure.open, false);
  assert.deepEqual(disclosure.focusCalls, []);
});

test('Astro swaps close the old DOM without focus restoration and the replacement header still works', () => {
  const { document, disclosure } = fixture();
  disclosure.open = true;
  document.emit('astro:before-swap');
  assert.equal(disclosure.open, false);
  assert.deepEqual(disclosure.focusCalls, []);
  const replacement = new Disclosure();
  document.disclosures = [replacement];
  replacement.open = true;
  document.activeElement = replacement.link;
  document.emit('keydown', { key: 'Escape', target: replacement.link });
  assert.equal(replacement.open, false);
  assert.deepEqual(replacement.focusCalls, [{ preventScroll: true }]);
});

test('cleanup removes the delegated handlers', () => {
  const { document, disclosure, cleanup } = fixture();
  cleanup();
  assert.equal(document.listeners.length, 0);
  disclosure.open = true;
  const event = document.emit('keydown', { key: 'Escape', target: disclosure.link });
  assert.equal(disclosure.open, true);
  assert.equal(event.prevented, false);
});
