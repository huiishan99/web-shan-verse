(() => {
  if (window.__shanInterestAudioReady) return;
  window.__shanInterestAudioReady = true;

  const STORAGE_KEY = 'shan-verse:bgm';
  const AUDIO_STATE_EVENT = 'shan-verse:audio-state';

  let activeButton = null;

  function clampVolume(value) {
    return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0.35));
  }

  function readSharedAudioState() {
    if (window.__shanAudioState) return window.__shanAudioState;

    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function applySharedAudioState(audio, state = readSharedAudioState()) {
    if (!(audio instanceof HTMLAudioElement)) return;

    const volume = typeof state.volume === 'number' ? state.volume : 0.35;
    audio.volume = clampVolume(volume);
    audio.muted = state.muted === true;
  }

  function getAudioPlayer() {
    const audio = document.querySelector('[data-interest-audio-player]');
    return audio instanceof HTMLAudioElement ? audio : null;
  }

  function setButtonState(button, state) {
    if (!(button instanceof HTMLElement)) return;

    const title = button.dataset.audioTitle || button.textContent?.trim() || 'music';
    const isPlaying = state === 'playing';
    const isLoading = state === 'loading';
    const isFailed = state === 'failed';

    button.classList.toggle('is-playing', isPlaying);
    button.classList.toggle('is-loading', isLoading);
    button.classList.toggle('has-error', isFailed);
    button.setAttribute('aria-pressed', String(isPlaying));
    button.setAttribute('aria-label', isPlaying ? `Pause ${title}` : `Play ${title}`);
  }

  function resetActiveButton() {
    if (activeButton instanceof HTMLElement) {
      setButtonState(activeButton, 'idle');
    }
    activeButton = null;
  }

  function pauseSiteMusic() {
    const siteMusic = document.querySelector('[data-music-audio]');
    if (siteMusic instanceof HTMLAudioElement && !siteMusic.paused) {
      siteMusic.pause();
    }
  }

  async function resolveAudioSource(button) {
    if (!(button instanceof HTMLElement)) return '';
    if (button.dataset.audioSrc) return button.dataset.audioSrc;

    if (
      button.hasAttribute('data-itunes-preview') &&
      typeof window.__shanLoadItunesPreview === 'function'
    ) {
      return await window.__shanLoadItunesPreview(button);
    }

    return '';
  }

  function bindAudioPlayer(audio) {
    if (!audio || audio.dataset.interestAudioReady === 'true') return;
    audio.dataset.interestAudioReady = 'true';
    applySharedAudioState(audio);
    audio.addEventListener('ended', resetActiveButton);
    audio.addEventListener('pause', resetActiveButton);
  }

  document.addEventListener('click', async (event) => {
    const button = event.target instanceof Element
      ? event.target.closest('[data-interest-audio]')
      : null;
    if (!(button instanceof HTMLElement)) return;

    event.preventDefault();

    const audio = getAudioPlayer();
    if (!audio) return;

    bindAudioPlayer(audio);
    applySharedAudioState(audio);

    if (activeButton === button && !audio.paused) {
      audio.pause();
      return;
    }

    audio.pause();
    resetActiveButton();
    pauseSiteMusic();

    activeButton = button;
    setButtonState(button, 'loading');

    const src = await resolveAudioSource(button);
    if (!src) {
      setButtonState(button, 'failed');
      window.setTimeout(() => {
        setButtonState(button, 'idle');
        if (activeButton === button) activeButton = null;
      }, 900);
      return;
    }

    const nextSrc = new URL(src, window.location.href).href;
    if (audio.currentSrc !== nextSrc) {
      audio.src = src;
    } else {
      audio.currentTime = 0;
    }

    try {
      await audio.play();
      setButtonState(button, 'playing');
    } catch {
      setButtonState(button, 'failed');
      window.setTimeout(() => {
        setButtonState(button, 'idle');
        if (activeButton === button) activeButton = null;
      }, 900);
    }
  });

  document.addEventListener('play', (event) => {
    if (!(event.target instanceof HTMLAudioElement)) return;
    if (!event.target.matches('[data-music-audio]')) return;

    const audio = getAudioPlayer();
    if (audio && !audio.paused) {
      audio.pause();
    }
  }, true);

  window.addEventListener(AUDIO_STATE_EVENT, (event) => {
    const audio = getAudioPlayer();
    if (!audio) return;

    applySharedAudioState(audio, event.detail || readSharedAudioState());
  });

  bindAudioPlayer(getAudioPlayer());
  document.addEventListener('astro:page-load', () => bindAudioPlayer(getAudioPlayer()));
})();
