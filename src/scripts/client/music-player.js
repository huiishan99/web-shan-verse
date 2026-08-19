(() => {
  if (window.__shanMusicPlayerReady) return;
  window.__shanMusicPlayerReady = true;

  const STORAGE_KEY = 'shan-verse:bgm';
  const AUDIO_STATE_EVENT = 'shan-verse:audio-state';
  const MOBILE_QUERY = '(max-width: 640px)';
  const LONG_PRESS_DELAY = 320;
  const DEFAULT_LABELS = {
    play: 'Play background music',
    pause: 'Pause background music',
    mute: 'Mute background music',
    unmute: 'Unmute background music',
  };

  function closeCurrentPanel() {
    const player = document.querySelector('.music-player.is-panel-open');
    if (!(player instanceof HTMLElement)) return;

    const panel = player.querySelector('[data-music-panel]');
    const toggle = player.querySelector('[data-music-toggle]');
    player.classList.remove('is-panel-open');
    if (panel instanceof HTMLElement) {
      panel.classList.remove('is-open');
      panel.style.opacity = '';
      panel.style.pointerEvents = '';
      panel.style.transform = '';
      panel.setAttribute('aria-hidden', 'true');
    }
    if (toggle instanceof HTMLButtonElement) toggle.setAttribute('aria-expanded', 'false');
  }

  function clampVolume(value) {
    return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0.35));
  }

  function publishAudioState(audio) {
    const detail = {
      volume: audio.volume,
      muted: audio.muted,
    };
    window.__shanAudioState = detail;
    window.dispatchEvent(new CustomEvent(AUDIO_STATE_EVENT, { detail }));
  }

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function writeState(audio, extra = {}) {
    const previous = readState();
    const next = {
      ...previous,
      currentTime: audio.currentTime || 0,
      volume: audio.volume,
      muted: audio.muted,
      playing: !audio.paused,
      ...extra,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function setupMusicPlayer() {
    const player = document.querySelector('[data-music-audio]')?.closest('.music-player');
    if (!player || player.dataset.ready === 'true') return;

    const audio = player.querySelector('[data-music-audio]');
    const toggle = player.querySelector('[data-music-toggle]');
    const panel = player.querySelector('[data-music-panel]');
    const volumeInputs = [
      ...player.querySelectorAll('[data-music-volume]'),
    ].filter((input) => input instanceof HTMLInputElement);
    const actionButtons = [
      ...player.querySelectorAll('[data-music-action]'),
    ].filter((button) => button instanceof HTMLButtonElement);
    const mute = player.querySelector('[data-music-action="mute"]');
    if (
      !(audio instanceof HTMLAudioElement) ||
      !(toggle instanceof HTMLButtonElement) ||
      !(panel instanceof HTMLElement) ||
      !(mute instanceof HTMLButtonElement) ||
      volumeInputs.length === 0 ||
      actionButtons.length === 0
    ) return;

    player.dataset.ready = 'true';
    const labels = {
      ...DEFAULT_LABELS,
      ...JSON.parse(player.dataset.musicLabels || '{}'),
    };

    const saved = readState();
    const savedVolume = typeof saved.volume === 'number' ? saved.volume : 0.35;
    audio.volume = clampVolume(savedVolume);
    audio.muted = saved.muted === true;
    publishAudioState(audio);
    let longPressTimer = 0;
    let longPressActive = false;
    let suppressNextClick = false;
    let selectedAction = '';

    function isMobilePlayer() {
      return window.matchMedia(MOBILE_QUERY).matches;
    }

    function syncVolumeInputs() {
      volumeInputs.forEach((input) => {
        input.value = String(audio.volume);
      });
    }

    function syncMuteButton() {
      mute.classList.toggle('is-muted', audio.muted);
      mute.setAttribute('aria-pressed', String(audio.muted));
      mute.setAttribute('aria-label', audio.muted ? labels.unmute : labels.mute);
    }

    function setPanelOpen(isOpen) {
      player.classList.toggle('is-panel-open', isOpen);
      panel.classList.toggle('is-open', isOpen);
      panel.style.opacity = isOpen ? '1' : '';
      panel.style.pointerEvents = isOpen ? 'auto' : '';
      panel.style.transform = isOpen ? 'translateY(0) scale(1)' : '';
      panel.setAttribute('aria-hidden', String(!isOpen));
      toggle.setAttribute('aria-expanded', String(isOpen));

      if (!isOpen) setSelectedAction('');
    }

    function showMobilePanel() {
      if (!isMobilePlayer()) return;
      setPanelOpen(true);
    }

    function setSelectedAction(action) {
      selectedAction = action || '';
      actionButtons.forEach((button) => {
        button.classList.toggle('is-selected', button.dataset.musicAction === selectedAction);
      });
    }

    function getActionFromPoint(event) {
      if (!event || typeof event.clientX !== 'number' || typeof event.clientY !== 'number') {
        return selectedAction;
      }

      const targetButton = actionButtons.find((button) => {
        const rect = button.getBoundingClientRect();
        return (
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        );
      });

      return targetButton?.dataset.musicAction || '';
    }

    function updateLongPressSelection(event) {
      if (!longPressActive) return;
      setSelectedAction(getActionFromPoint(event));
    }

    async function restartMusic() {
      audio.currentTime = 0;
      if (audio.paused) {
        try {
          await audio.play();
        } catch {
          toggle.classList.add('has-error');
          window.setTimeout(() => toggle.classList.remove('has-error'), 900);
        }
      }
      writeState(audio, { playing: !audio.paused });
    }

    function updateVolume(delta) {
      audio.volume = clampVolume(audio.volume + delta);
      if (audio.volume > 0) audio.muted = false;
      syncVolumeInputs();
      syncMuteButton();
      writeState(audio);
      publishAudioState(audio);
    }

    function performPanelAction(action) {
      if (action === 'volume-down') {
        updateVolume(-0.12);
      } else if (action === 'volume-up') {
        updateVolume(0.12);
      } else if (action === 'mute') {
        audio.muted = !audio.muted;
        syncMuteButton();
        writeState(audio);
        publishAudioState(audio);
      } else if (action === 'restart') {
        void restartMusic();
      }
    }

    async function togglePlayback() {
      if (audio.paused) {
        try {
          await audio.play();
          writeState(audio, { playing: true });
        } catch {
          toggle.classList.add('has-error');
          window.setTimeout(() => toggle.classList.remove('has-error'), 900);
        }
      } else {
        audio.pause();
        writeState(audio, { playing: false });
      }
      syncButton();
    }

    function clearLongPressTimer() {
      window.clearTimeout(longPressTimer);
      longPressTimer = 0;
    }

    function startLongPress(event) {
      if (!isMobilePlayer() || event.button > 0) return;

      event.preventDefault();
      clearLongPressTimer();
      longPressActive = false;

      if ('pointerId' in event && typeof toggle.setPointerCapture === 'function') {
        try {
          toggle.setPointerCapture(event.pointerId);
        } catch {
          // Pointer capture is a small enhancement; the release handlers still work without it.
        }
      }

      longPressTimer = window.setTimeout(() => {
        longPressActive = true;
        suppressNextClick = true;
        setSelectedAction('');
        showMobilePanel();
      }, LONG_PRESS_DELAY);
    }

    function endLongPress(event) {
      const isMobile = isMobilePlayer();
      if (isMobile) event.preventDefault();

      clearLongPressTimer();

      if (!longPressActive) {
        if (isMobile) {
          suppressNextClick = true;
          void togglePlayback();
          window.setTimeout(() => {
            suppressNextClick = false;
          }, 350);
        }
        return;
      }

      const action = getActionFromPoint(event);
      longPressActive = false;
      setPanelOpen(false);
      performPanelAction(action);
      window.setTimeout(() => {
        suppressNextClick = false;
      }, 350);
    }

    function syncButton() {
      const isPlaying = !audio.paused;
      player.classList.toggle('is-playing', isPlaying);
      toggle.classList.toggle('is-playing', isPlaying);
      toggle.setAttribute('aria-pressed', String(isPlaying));
      toggle.setAttribute('aria-label', isPlaying ? labels.pause : labels.play);
      syncMuteButton();
    }

    audio.addEventListener('loadedmetadata', () => {
      if (typeof saved.currentTime === 'number' && Number.isFinite(saved.currentTime)) {
        audio.currentTime = Math.min(saved.currentTime, Math.max(0, audio.duration - 0.5));
      }
    }, { once: true });

    toggle.addEventListener('pointerdown', startLongPress);
    toggle.addEventListener('pointermove', (event) => {
      if (longPressActive) event.preventDefault();
      updateLongPressSelection(event);
    });
    toggle.addEventListener('pointerup', endLongPress);
    toggle.addEventListener('pointercancel', (event) => {
      clearLongPressTimer();
      if (longPressActive) {
        event.preventDefault();
        longPressActive = false;
        setPanelOpen(false);
      }
    });
    toggle.addEventListener('pointerleave', () => {
      if (!longPressActive) clearLongPressTimer();
    });

    toggle.addEventListener('click', async (event) => {
      if (suppressNextClick) {
        event.preventDefault();
        suppressNextClick = false;
        return;
      }

      await togglePlayback();
    });

    volumeInputs.forEach((input) => {
      input.addEventListener('input', () => {
        audio.volume = Number(input.value);
        if (audio.volume > 0) audio.muted = false;
        syncVolumeInputs();
        syncMuteButton();
        writeState(audio);
        publishAudioState(audio);
      });
    });

    actionButtons.forEach((button) => {
      button.addEventListener('click', () => {
        performPanelAction(button.dataset.musicAction || '');
        if (isMobilePlayer()) setPanelOpen(false);
      });
    });

    player.addEventListener('contextmenu', (event) => {
      if (isMobilePlayer()) event.preventDefault();
    });

    player.addEventListener('selectstart', (event) => {
      if (isMobilePlayer()) event.preventDefault();
    });

    audio.addEventListener('play', syncButton);
    audio.addEventListener('pause', syncButton);
    audio.addEventListener('timeupdate', () => {
      if (!audio.paused) writeState(audio);
    });

    syncVolumeInputs();
    syncMuteButton();
    syncButton();
  }

  document.addEventListener('click', (event) => {
    if (!window.matchMedia(MOBILE_QUERY).matches) return;
    const player = document.querySelector('.music-player.is-panel-open');
    if (!(player instanceof HTMLElement)) return;
    if (event.target instanceof Node && player.contains(event.target)) return;
    closeCurrentPanel();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeCurrentPanel();
  });

  setupMusicPlayer();
  document.addEventListener('astro:page-load', setupMusicPlayer);
})();
