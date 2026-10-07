const projectDialogOpeners = new WeakMap();
const projectDetailCache = new Map();
const galleryControllers = new WeakMap();

function setupProjectGallery(root) {
  const gallery = root.querySelector('[data-project-gallery]');

  if (!(gallery instanceof HTMLElement)) {
    return null;
  }

  const existingController = galleryControllers.get(gallery);
  if (existingController) {
    return existingController;
  }

  const slides = Array.from(gallery.querySelectorAll('[data-project-gallery-slide]'))
    .filter((slide) => slide instanceof HTMLElement);

  if (slides.length === 0) {
    return null;
  }

  const previousButton = gallery.querySelector('[data-project-gallery-prev]');
  const nextButton = gallery.querySelector('[data-project-gallery-next]');
  const counter = gallery.querySelector('[data-project-gallery-counter]');
  const dots = Array.from(gallery.querySelectorAll('[data-project-gallery-dot]'))
    .filter((dot) => dot instanceof HTMLButtonElement);
  let currentIndex = 0;

  const showSlide = (nextIndex) => {
    currentIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      slide.hidden = index !== currentIndex;
    });

    dots.forEach((dot, index) => {
      dot.setAttribute('aria-current', index === currentIndex ? 'true' : 'false');
    });

    if (counter instanceof HTMLElement) {
      counter.textContent = `${currentIndex + 1} / ${slides.length}`;
    }
  };

  root.querySelectorAll('[data-project-gallery-show]').forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;

    button.addEventListener('click', () => {
      const requestedIndex = Number(button.dataset.projectGalleryShow);
      if (!Number.isInteger(requestedIndex)) return;

      showSlide(requestedIndex);
      gallery.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  });

  if (previousButton instanceof HTMLButtonElement) {
    previousButton.addEventListener('click', () => showSlide(currentIndex - 1));
  }

  if (nextButton instanceof HTMLButtonElement) {
    nextButton.addEventListener('click', () => showSlide(currentIndex + 1));
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const requestedIndex = Number(dot.dataset.projectGalleryDot);
      if (Number.isInteger(requestedIndex)) {
        showSlide(requestedIndex);
      }
    });
  });

  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showSlide(currentIndex - 1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showSlide(currentIndex + 1);
    }
  });

  const controller = { showSlide };
  galleryControllers.set(gallery, controller);
  showSlide(0);
  return controller;
}

async function loadProjectDetail(href) {
  const url = new URL(href, window.location.href);
  url.hash = '';
  const cacheKey = url.toString();

  if (projectDetailCache.has(cacheKey)) {
    return projectDetailCache.get(cacheKey);
  }

  const request = fetch(cacheKey, {
    headers: {
      'X-Shan-Project-Detail': 'dialog',
    },
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Project detail request failed: ${response.status}`);
    }

    const html = await response.text();
    const documentFragment = new DOMParser().parseFromString(html, 'text/html');
    const detailFragment = documentFragment.querySelector('[data-project-detail-fragment]');

    if (!(detailFragment instanceof HTMLElement)) {
      throw new Error('Project detail fragment was not found.');
    }

    return {
      html: detailFragment.innerHTML,
      dialogClasses: detailFragment.dataset.projectDialogClasses || '',
    };
  }).catch((error) => {
    projectDetailCache.delete(cacheKey);
    throw error;
  });

  projectDetailCache.set(cacheKey, request);
  return request;
}

function setupStandaloneProjectDetails() {
  document.querySelectorAll('[data-project-detail-fragment]').forEach((fragment) => {
    if (fragment instanceof HTMLElement) {
      setupProjectGallery(fragment);
    }
  });
}

function setupProjectDialog() {
  const dialog = document.querySelector('[data-project-detail-dialog]');
  if (!(dialog instanceof HTMLDialogElement)) return;

  const contentHost = dialog.querySelector('[data-project-dialog-content]');
  if (!(contentHost instanceof HTMLElement)) return;

  if (dialog.dataset.projectDialogBound !== 'true') {
    dialog.dataset.projectDialogBound = 'true';

    const closeButton = dialog.querySelector('[data-project-dialog-close]');
    if (closeButton instanceof HTMLButtonElement) {
      closeButton.addEventListener('click', () => dialog.close());
    }

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        dialog.close();
      }
    });

    dialog.addEventListener('close', () => {
      projectDialogOpeners.get(dialog)?.focus();
    });
  }

  document.querySelectorAll('[data-project-detail-link]').forEach((link) => {
    if (!(link instanceof HTMLAnchorElement) || link.dataset.projectDetailBound === 'true') {
      return;
    }

    link.dataset.projectDetailBound = 'true';

    link.addEventListener('click', async (event) => {
      if (
        event.defaultPrevented
        || event.button !== 0
        || event.metaKey
        || event.ctrlKey
        || event.shiftKey
        || event.altKey
      ) {
        return;
      }

      event.preventDefault();
      link.setAttribute('aria-busy', 'true');

      try {
        const detail = await loadProjectDetail(link.href);
        contentHost.innerHTML = detail.html;

        dialog.className = [
          'project-detail-dialog',
          detail.dialogClasses,
        ].filter(Boolean).join(' ');

        const gallery = setupProjectGallery(dialog);
        const requestedIndex = Number(link.dataset.projectGalleryStart ?? 0);
        if (gallery && Number.isInteger(requestedIndex)) {
          gallery.showSlide(requestedIndex);
        }

        projectDialogOpeners.set(dialog, link);

        if (!dialog.open) {
          dialog.showModal();
        }
      } catch (error) {
        console.error(error);
        window.location.assign(link.href);
      } finally {
        link.removeAttribute('aria-busy');
      }
    });
  });
}

function setupProjectDetails() {
  setupStandaloneProjectDetails();
  setupProjectDialog();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupProjectDetails, { once: true });
} else {
  setupProjectDetails();
}

document.addEventListener('astro:page-load', setupProjectDetails);
