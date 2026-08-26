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
