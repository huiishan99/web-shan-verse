function setupProjectGallery(dialog) {
  const gallery = dialog.querySelector('[data-project-gallery]');

  if (!(gallery instanceof HTMLElement) || gallery.dataset.projectGalleryBound === 'true') {
    return;
  }

  const slides = Array.from(gallery.querySelectorAll('[data-project-gallery-slide]'))
    .filter((slide) => slide instanceof HTMLElement);

  if (slides.length < 2) {
    return;
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

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showSlide(currentIndex - 1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showSlide(currentIndex + 1);
    }
  });

  gallery.dataset.projectGalleryBound = 'true';
  showSlide(0);
}

function setupProjectDetails() {
  document.querySelectorAll('[data-project-dialog-open]').forEach((trigger) => {
    if (!(trigger instanceof HTMLButtonElement) || trigger.dataset.projectDialogBound === 'true') {
      return;
    }

    const dialogId = trigger.dataset.projectDialogOpen;
    const dialog = dialogId ? document.getElementById(dialogId) : null;

    if (!(dialog instanceof HTMLDialogElement)) {
      return;
    }

    setupProjectGallery(dialog);
    trigger.dataset.projectDialogBound = 'true';

    trigger.addEventListener('click', () => {
      if (!dialog.open) {
        dialog.showModal();
      }
    });

    const closeButton = dialog.querySelector('[data-project-dialog-close]');
    if (closeButton instanceof HTMLButtonElement) {
      closeButton.addEventListener('click', () => dialog.close());
    }

    if (dialog.dataset.projectDialogBound !== 'true') {
      dialog.dataset.projectDialogBound = 'true';
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) {
          dialog.close();
        }
      });
      dialog.addEventListener('close', () => trigger.focus());
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupProjectDetails, { once: true });
} else {
  setupProjectDetails();
}

document.addEventListener('astro:page-load', setupProjectDetails);
