(() => {
  if (window.__shanInterestPreviewReady) return;
  window.__shanInterestPreviewReady = true;

  const summaryCache = new Map();
  const itunesCache = new Map();
  const ITUNES_API_ROOT = 'https://itunes.apple.com/search';
  const WIKIPEDIA_LANGUAGES = new Set(['en', 'zh', 'ja']);

  function findPreviewLink(target) {
    return target instanceof Element ? target.closest('[data-wiki-preview], [data-itunes-preview]') : null;
  }

  function getWikipediaLanguage(link) {
    const language = link.dataset.wikiLanguage || 'en';
    return WIKIPEDIA_LANGUAGES.has(language) ? language : 'en';
  }

  function getWikipediaApiRoot(language) {
    return `https://${language}.wikipedia.org/api/rest_v1/page/summary/`;
  }

  function getWikipediaArticleUrl(language, page) {
    return `https://${language}.wikipedia.org/wiki/${encodeURIComponent(page).replace(/%20/g, '_')}`;
  }

  async function getWikipediaSummary(language, page) {
    const cacheKey = `${language}:${page}`;

    if (!summaryCache.has(cacheKey)) {
      summaryCache.set(cacheKey, fetch(`${getWikipediaApiRoot(language)}${encodeURIComponent(page)}`).then((response) => {
        if (!response.ok) throw new Error(`Wikipedia returned ${response.status}`);
        return response.json();
      }));
    }

    return summaryCache.get(cacheKey);
  }

  function setExtract(link, text) {
    const extract = link.querySelector('[data-wiki-extract]');
    if (extract) extract.textContent = text;
  }

  function setTitle(link, text) {
    const title = link.querySelector('[data-wiki-title]');
    if (title) title.textContent = text;
  }

  function setKicker(link, text) {
    const kicker = link.querySelector('[data-preview-kicker]');
    if (kicker) kicker.textContent = text;
  }

  function setImage(link, source) {
    const media = link.querySelector('[data-wiki-media]');
    if (!media || !source || media.dataset.ready === 'true') return;

    const image = document.createElement('img');
    image.src = source;
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    media.replaceChildren(image);
    media.dataset.ready = 'true';
  }

  function getItunesSearchUrl(term, country) {
    const params = new URLSearchParams({
      term,
      country,
      media: 'music',
      entity: 'song',
      limit: '1',
    });

    return `${ITUNES_API_ROOT}?${params.toString()}`;
  }

  async function getItunesTrack(link) {
    const term = link.dataset.itunesTerm || link.dataset.audioTitle || '';
    const country = link.dataset.itunesCountry || 'JP';
    if (!term) return null;

    const cacheKey = `${country}:${term}`;
    if (!itunesCache.has(cacheKey)) {
      const response = await fetch(getItunesSearchUrl(term, country));
      if (!response.ok) throw new Error(`iTunes returned ${response.status}`);

      itunesCache.set(cacheKey, response.json().then((data) => {
        const results = Array.isArray(data?.results) ? data.results : [];
        return results.find((track) => track?.previewUrl) || results[0] || null;
      }));
    }

    return itunesCache.get(cacheKey);
  }

  async function loadItunesPreview(link) {
    if (!(link instanceof HTMLElement)) return null;
    if (link.dataset.previewLoaded === 'true') return link.dataset.audioSrc || null;

    link.dataset.previewLoaded = 'true';
    setKicker(link, 'iTunes Preview');
    setExtract(link, 'Loading iTunes preview...');

    try {
      const data = await getItunesTrack(link);
      if (!data) throw new Error('No iTunes result');

      const title = [
        link.dataset.audioTitle || data.trackName,
        link.dataset.audioArtist || data.artistName,
      ].filter(Boolean).join(' — ');
      const description = [
        data.collectionName,
        data.previewUrl ? 'Preview courtesy of iTunes.' : 'Preview unavailable.',
      ].filter(Boolean).join(' · ');

      if (title) setTitle(link, title);
      setExtract(link, description || 'Preview courtesy of iTunes.');
      setImage(link, data.artworkUrl100);

      if (data.previewUrl) link.dataset.audioSrc = data.previewUrl;
      if (data.trackViewUrl) link.href = data.trackViewUrl;

      return data.previewUrl || null;
    } catch {
      link.dataset.previewLoaded = 'false';
      setExtract(link, 'iTunes preview unavailable.');
      return null;
    }
  }

  async function loadPreview(link) {
    if (!(link instanceof HTMLElement)) return;
    if (link.hasAttribute('data-itunes-preview')) {
      await loadItunesPreview(link);
      return;
    }

    let page = link.dataset.wikiPage;
    if (!page || link.dataset.previewLoaded === 'true') return;

    link.dataset.previewLoaded = 'true';
    setExtract(link, link.dataset.wikiLoading || 'Loading Wikipedia preview...');

    try {
      let language = getWikipediaLanguage(link);
      let data;

      try {
        data = await getWikipediaSummary(language, page);
      } catch (error) {
        const fallbackPage = link.dataset.wikiFallbackPage;
        if (language === 'en' || !fallbackPage) throw error;

        language = 'en';
        page = fallbackPage;
        data = await getWikipediaSummary(language, page);
        link.dataset.wikiLanguage = language;
        link.dataset.wikiPage = page;
        link.href = getWikipediaArticleUrl(language, page);
      }

      const thumbnail = data?.originalimage?.source || data?.thumbnail?.source;
      const description = data?.description || data?.extract || link.dataset.wikiDetails || 'Open Wikipedia for more details.';

      if (data?.title) setTitle(link, data.title);
      setExtract(link, description);
      setImage(link, thumbnail);
    } catch {
      link.dataset.previewLoaded = 'false';
      setExtract(link, link.dataset.wikiUnavailable || 'Preview unavailable. Open Wikipedia for details.');
    }
  }

  document.addEventListener('pointerover', (event) => {
    const link = findPreviewLink(event.target);
    if (link) loadPreview(link);
  });

  document.addEventListener('focusin', (event) => {
    const link = findPreviewLink(event.target);
    if (link) loadPreview(link);
  });

  window.__shanLoadItunesPreview = loadItunesPreview;
})();
