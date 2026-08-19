(() => {
  if (window.__shanCliReady) return;
  window.__shanCliReady = true;

  const localizedRoutes = new Set(['/', '/about', '/projects', '/timeline', '/blog']);
  const locales = ['en', 'zh', 'ja'];
  const DEFAULT_LABELS = {
    navigationHeading: 'navigation',
    signalsHeading: 'signals',
    linksHeading: 'outside links',
    languageHeading: 'language',
    utilityHeading: 'utility',
    homeCommand: 'return to the landing page',
    aboutCommand: 'open the about page',
    projectsCommand: 'browse project work',
    timelineCommand: 'view the personal timeline',
    blogCommand: 'open blog posts',
    archiveHeading: 'archive',
    latestCommand: 'show the latest blog posts',
    randomCommand: 'surface a random blog post',
    searchCommand: 'search posts, projects, and timeline',
    statusCommand: 'show the current site signal',
    musicCommand: 'toggle the background music',
    githubCommand: 'open GitHub',
    contactCommand: 'open LinkedIn',
    langCommand: 'switch site language',
    clearCommand: 'clear this terminal',
    helpCommand: 'show this command list',
    shortcuts: 'shortcuts: click shan>, press Ctrl/Cmd + K, or press ` to open. Esc closes.',
    openingHome: 'opening home...',
    openingAbout: 'opening about...',
    openingProjects: 'opening projects...',
    openingTimeline: 'opening timeline...',
    openingBlog: 'opening blog...',
    latestHeading: 'latest posts:',
    randomHeading: 'random signal:',
    searchHeading: 'search results:',
    noSearchQuery: 'type a keyword after search.',
    noSearchResults: 'no matching signal found.',
    indexUnavailable: 'CLI index unavailable.',
    typePost: 'post',
    typeProject: 'project',
    typeTimeline: 'timeline',
    currentSignal: 'current signal:',
    online: 'online',
    siteStatsHint: 'site stats live in the footer.',
    openingGithub: 'opening GitHub...',
    openingContact: 'opening LinkedIn...',
    musicToggled: 'music toggled.',
    musicUnavailable: 'music control unavailable.',
    availableLanguages: 'available languages: en, zh, ja',
    switchingLanguage: 'switching language:',
    unknownCommand: 'unknown command:',
    tryHelp: 'try help.',
    cleared: 'cleared.',
  };
  const LOCALIZED_FALLBACK_LABELS = {
    zh: {
      archiveHeading: '档案',
      latestCommand: '显示最新博客文章',
      randomCommand: '随机浮现一篇博客',
      searchCommand: '搜索文章、项目和时间线',
      latestHeading: '最新文章：',
      randomHeading: '随机信号：',
      searchHeading: '搜索结果：',
      noSearchQuery: '请在 search 后面输入关键词。',
      noSearchResults: '没有找到匹配的信号。',
      indexUnavailable: 'CLI 索引暂时不可用。',
      typePost: '文章',
      typeProject: '项目',
      typeTimeline: '时间线',
    },
    ja: {
      archiveHeading: 'アーカイブ',
      latestCommand: '最新のブログ記事を表示',
      randomCommand: 'ランダムにブログ記事を表示',
      searchCommand: '記事、プロジェクト、タイムラインを検索',
      latestHeading: '最新記事:',
      randomHeading: 'ランダムシグナル:',
      searchHeading: '検索結果:',
      noSearchQuery: 'search の後にキーワードを入力してください。',
      noSearchResults: '一致するシグナルが見つかりませんでした。',
      indexUnavailable: 'CLI インデックスを利用できません。',
      typePost: '記事',
      typeProject: 'プロジェクト',
      typeTimeline: 'タイムライン',
    },
  };

  function getCli() {
    return document.querySelector('[data-shan-cli]');
  }

  function isTypingTarget(target) {
    return target instanceof HTMLElement && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
  }

  function normalizePath(pathname) {
    const cleanPath = pathname.replace(/\/+$/, '') || '/';
    const segments = cleanPath.split('/').filter(Boolean);
    return locales.includes(segments[0])
      ? `/${segments.slice(1).join('/')}`.replace(/\/+$/, '') || '/'
      : cleanPath;
  }

  function localizeCurrentPath(locale) {
    const basePath = normalizePath(window.location.pathname);

    if (!localizedRoutes.has(basePath)) return locale === 'en' ? '/blog' : `/${locale}/blog`;
    if (locale === 'en') return basePath;
    return basePath === '/' ? `/${locale}` : `/${locale}${basePath}`;
  }

  function setupCli() {
    const root = getCli();
    if (!root || root.dataset.ready === 'true') return;

    const overlay = root.querySelector('[data-cli-overlay]');
    const trigger = root.querySelector('[data-cli-trigger]');
    const close = root.querySelector('[data-cli-close]');
    const form = root.querySelector('[data-cli-form]');
    const input = root.querySelector('[data-cli-input]');
    const output = root.querySelector('[data-cli-output]');

    if (
      !(overlay instanceof HTMLElement) ||
      !(trigger instanceof HTMLButtonElement) ||
      !(close instanceof HTMLButtonElement) ||
      !(form instanceof HTMLFormElement) ||
      !(input instanceof HTMLInputElement) ||
      !(output instanceof HTMLElement)
    ) return;

    root.dataset.ready = 'true';

    const paths = {
      home: root.dataset.homePath || '/',
      about: root.dataset.aboutPath || '/about',
      projects: root.dataset.projectsPath || '/projects',
      timeline: root.dataset.timelinePath || '/timeline',
      blog: root.dataset.blogPath || '/blog',
    };
    const lang = root.dataset.lang || 'en';
    const labels = {
      ...DEFAULT_LABELS,
      ...(LOCALIZED_FALLBACK_LABELS[lang] || {}),
      ...JSON.parse(root.dataset.cliLabels || '{}'),
    };
    let cliIndexPromise;

    function openCli(prefill = '') {
      root.classList.add('is-open');
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      if (prefill) input.value = prefill;
      window.setTimeout(() => input.focus(), 30);
    }

    function closeCli() {
      root.classList.remove('is-open');
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      input.blur();
    }

    function print(html) {
      const line = document.createElement('p');
      line.innerHTML = html;
      output.append(line);
      output.scrollTop = output.scrollHeight;
    }

    function printCommand(command) {
      print(`<span class="cli-muted">shan&gt;</span> ${escapeHtml(command)}`);
    }

    function printHelp() {
      [
        `<span class="cli-help-heading">${escapeHtml(labels.navigationHeading)}</span>`,
        `<span class="cli-command">home</span> - ${escapeHtml(labels.homeCommand)}`,
        `<span class="cli-command">about</span> - ${escapeHtml(labels.aboutCommand)}`,
        `<span class="cli-command">projects</span> - ${escapeHtml(labels.projectsCommand)}`,
        `<span class="cli-command">timeline</span> - ${escapeHtml(labels.timelineCommand)}`,
        `<span class="cli-command">blog</span> or <span class="cli-command">blog latest</span> - ${escapeHtml(labels.blogCommand)}`,
        `<span class="cli-help-heading">${escapeHtml(labels.archiveHeading)}</span>`,
        `<span class="cli-command">latest</span> - ${escapeHtml(labels.latestCommand)}`,
        `<span class="cli-command">random</span> - ${escapeHtml(labels.randomCommand)}`,
        `<span class="cli-command">search &lt;keyword&gt;</span> - ${escapeHtml(labels.searchCommand)}`,
        `<span class="cli-help-heading">${escapeHtml(labels.signalsHeading)}</span>`,
        `<span class="cli-command">status</span> - ${escapeHtml(labels.statusCommand)}`,
        `<span class="cli-command">music</span> or <span class="cli-command">music toggle</span> - ${escapeHtml(labels.musicCommand)}`,
        `<span class="cli-help-heading">${escapeHtml(labels.linksHeading)}</span>`,
        `<span class="cli-command">github</span> - ${escapeHtml(labels.githubCommand)}`,
        `<span class="cli-command">contact</span> - ${escapeHtml(labels.contactCommand)}`,
        `<span class="cli-help-heading">${escapeHtml(labels.languageHeading)}</span>`,
        `<span class="cli-command">lang en</span> / <span class="cli-command">lang zh</span> / <span class="cli-command">lang ja</span> - ${escapeHtml(labels.langCommand)}`,
        `<span class="cli-help-heading">${escapeHtml(labels.utilityHeading)}</span>`,
        `<span class="cli-command">clear</span> - ${escapeHtml(labels.clearCommand)}`,
        `<span class="cli-command">help</span> or <span class="cli-command">?</span> - ${escapeHtml(labels.helpCommand)}`,
        `<span class="cli-muted">${escapeHtml(labels.shortcuts)}</span>`,
      ].forEach(print);
    }

    function escapeHtml(value) {
      return value.replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      }[char]));
    }

    function navigateTo(path) {
      window.location.href = path;
    }

    function getCliIndexPath() {
      return root.dataset.cliIndexPath || '/cli-index.json';
    }

    async function loadCliIndex() {
      if (!cliIndexPromise) {
        cliIndexPromise = fetch(getCliIndexPath(), {
          headers: { Accept: 'application/json' },
        }).then((response) => {
          if (!response.ok) throw new Error(`CLI index request failed: ${response.status}`);
          return response.json();
        });
      }

      const payload = await cliIndexPromise;
      const entries = payload?.locales?.[lang] || payload?.locales?.en || [];
      return Array.isArray(entries) ? entries : [];
    }

    function getEntryTypeLabel(type) {
      const typeLabels = {
        post: labels.typePost,
        project: labels.typeProject,
        timeline: labels.typeTimeline,
      };

      return typeLabels[type] || type;
    }

    function truncateText(value, maxLength = 130) {
      if (!value || value.length <= maxLength) return value || '';
      return `${value.slice(0, maxLength).trim()}...`;
    }

    function normalizeForSearch(value) {
      return String(value || '').toLocaleLowerCase();
    }

    function getCommandArgument(displayCommand) {
      const trimmed = displayCommand.trim();
      const commandName = trimmed.split(/\s+/)[0] || '';
      return trimmed.slice(commandName.length).trim();
    }

    function getEntryDateValue(entry) {
      return entry.date ? Date.parse(`${entry.date}T00:00:00Z`) || 0 : 0;
    }

    function compareEntryDates(first, second) {
      return getEntryDateValue(second) - getEntryDateValue(first) || String(first.title).localeCompare(String(second.title));
    }

    function renderEntry(entry) {
      const tags = Array.isArray(entry.tags) ? entry.tags.slice(0, 2) : [];
      const meta = [
        getEntryTypeLabel(entry.type),
        entry.date,
        ...tags,
      ].filter(Boolean).join(' / ');
      const description = truncateText(entry.description);

      return [
        `<a class="cli-result-link" href="${escapeHtml(entry.url || '#')}">${escapeHtml(entry.title || '')}</a>`,
        meta ? `<span class="cli-result-meta">${escapeHtml(meta)}</span>` : '',
        description ? `<br><span class="cli-muted">${escapeHtml(description)}</span>` : '',
      ].join(' ');
    }

    function printEntries(entries) {
      entries.forEach((entry, index) => {
        print(`${index + 1}. ${renderEntry(entry)}`);
      });
    }

    function scoreEntry(entry, query) {
      const normalizedQuery = normalizeForSearch(query);
      const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
      const title = normalizeForSearch(entry.title);
      const description = normalizeForSearch(entry.description);
      const source = normalizeForSearch(entry.source);
      const tags = normalizeForSearch(Array.isArray(entry.tags) ? entry.tags.join(' ') : '');

      return tokens.reduce((score, token) => {
        let nextScore = score;
        if (title.includes(token)) nextScore += 6;
        if (tags.includes(token)) nextScore += 4;
        if (source.includes(token)) nextScore += 2;
        if (description.includes(token)) nextScore += 1;
        return nextScore;
      }, title.includes(normalizedQuery) ? 4 : 0);
    }

    function searchEntries(entries, query) {
      return entries
        .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
        .filter((result) => result.score > 0)
        .sort((first, second) => second.score - first.score || compareEntryDates(first.entry, second.entry))
        .map((result) => result.entry);
    }

    async function printLatestPosts() {
      const posts = (await loadCliIndex())
        .filter((entry) => entry.type === 'post')
        .sort(compareEntryDates)
        .slice(0, 5);

      if (posts.length === 0) {
        print(escapeHtml(labels.noSearchResults));
        return;
      }

      print(`<span class="cli-help-heading">${escapeHtml(labels.latestHeading)}</span>`);
      printEntries(posts);
    }

    async function printRandomPost() {
      const posts = (await loadCliIndex()).filter((entry) => entry.type === 'post');

      if (posts.length === 0) {
        print(escapeHtml(labels.noSearchResults));
        return;
      }

      const entry = posts[Math.floor(Math.random() * posts.length)];
      print(`<span class="cli-help-heading">${escapeHtml(labels.randomHeading)}</span>`);
      printEntries([entry]);
    }

    async function printSearchResults(displayCommand) {
      const query = getCommandArgument(displayCommand);
      if (!query) {
        print(escapeHtml(labels.noSearchQuery));
        return;
      }

      const results = searchEntries(await loadCliIndex(), query).slice(0, 5);
      if (results.length === 0) {
        print(escapeHtml(labels.noSearchResults));
        return;
      }

      print(`<span class="cli-help-heading">${escapeHtml(labels.searchHeading)}</span>`);
      printEntries(results);
    }

    const commandHandlers = [
      {
        matches: (command) => command === 'help' || command === '?',
        run: () => printHelp(),
      },
      {
        matches: (command) => command === 'clear',
        run: () => {
          output.innerHTML = `<p><span class="cli-muted">${escapeHtml(labels.cleared)}</span></p>`;
        },
      },
      {
        matches: (command) => command === 'home',
        run: () => {
          print(escapeHtml(labels.openingHome));
          navigateTo(paths.home);
        },
      },
      {
        matches: (command) => command === 'about',
        run: () => {
          print(escapeHtml(labels.openingAbout));
          navigateTo(paths.about);
        },
      },
      {
        matches: (command) => command === 'projects' || command === 'project',
        run: () => {
          print(escapeHtml(labels.openingProjects));
          navigateTo(paths.projects);
        },
      },
      {
        matches: (command) => command === 'timeline',
        run: () => {
          print(escapeHtml(labels.openingTimeline));
          navigateTo(paths.timeline);
        },
      },
      {
        matches: (command) => command === 'blog' || command === 'blog latest',
        run: () => {
          print(escapeHtml(labels.openingBlog));
          navigateTo(paths.blog);
        },
      },
      {
        matches: (command) => command === 'latest',
        run: () => printLatestPosts(),
      },
      {
        matches: (command) => command === 'random' || command === 'random post',
        run: () => printRandomPost(),
      },
      {
        matches: (command) => command === 'search' || command.startsWith('search ') || command === 's' || command.startsWith('s '),
        run: (_command, displayCommand) => printSearchResults(displayCommand),
      },
      {
        matches: (command) => command === 'status',
        run: () => {
          print(`${escapeHtml(labels.currentSignal)} <span class="cli-accent">${escapeHtml(labels.online)}</span>. ${escapeHtml(labels.siteStatsHint)}`);
        },
      },
      {
        matches: (command) => command === 'github',
        run: () => {
          print(escapeHtml(labels.openingGithub));
          window.open('https://github.com/huiishan99', '_blank', 'noopener');
        },
      },
      {
        matches: (command) => command === 'contact',
        run: () => {
          print(escapeHtml(labels.openingContact));
          window.open('https://linkedin.com/in/laihuishan/', '_blank', 'noopener');
        },
      },
      {
        matches: (command) => command === 'music' || command === 'music toggle',
        run: () => {
          const toggle = document.querySelector('[data-music-toggle]');
          if (toggle instanceof HTMLButtonElement) {
            toggle.click();
            print(escapeHtml(labels.musicToggled));
          } else {
            print(escapeHtml(labels.musicUnavailable));
          }
        },
      },
      {
        matches: (command) => command.startsWith('lang '),
        run: (command) => {
          const locale = command.split(/\s+/)[1];
          if (!locales.includes(locale)) {
            print(escapeHtml(labels.availableLanguages));
            return;
          }
          print(`${escapeHtml(labels.switchingLanguage)} <span class="cli-accent">${escapeHtml(locale)}</span>`);
          navigateTo(localizeCurrentPath(locale));
        },
      },
    ];

    function runCommand(rawCommand) {
      const displayCommand = rawCommand.trim();
      const command = displayCommand.toLowerCase();
      if (!command) return;

      printCommand(displayCommand);

      const handler = commandHandlers.find((item) => item.matches(command));
      if (handler) {
        Promise.resolve(handler.run(command, displayCommand)).catch(() => {
          print(escapeHtml(labels.indexUnavailable));
        });
        return;
      }

      print(`${escapeHtml(labels.unknownCommand)} <span class="cli-accent">${escapeHtml(displayCommand)}</span>. ${escapeHtml(labels.tryHelp)}`);
    }

    trigger.addEventListener('click', () => openCli());
    close.addEventListener('click', closeCli);

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeCli();
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const command = input.value;
      input.value = '';
      runCommand(command);
    });

    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;

      event.preventDefault();
      const command = input.value;
      input.value = '';
      runCommand(command);
    });
  }

  document.addEventListener('keydown', (event) => {
    const root = getCli();
    if (!root || isTypingTarget(event.target)) return;

    const overlay = root.querySelector('[data-cli-overlay]');
    if (!(overlay instanceof HTMLElement)) return;

    const wantsOpen = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
    const wantsTilde = event.key === '`' || event.key === '~';

    if (wantsOpen || wantsTilde) {
      event.preventDefault();
      const input = root.querySelector('[data-cli-input]');
      root.classList.add('is-open');
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      window.setTimeout(() => {
        if (input instanceof HTMLInputElement) input.focus();
      }, 30);
    }

    if (event.key === 'Escape' && overlay.classList.contains('is-open')) {
      root.classList.remove('is-open');
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
    }
  });

  setupCli();
  document.addEventListener('astro:page-load', setupCli);
})();
