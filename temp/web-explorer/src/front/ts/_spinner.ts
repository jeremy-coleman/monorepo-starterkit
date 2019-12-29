import { createNode } from './_dom';
import { ON_NAVIGATE } from './_router';

export class Spinner {
  spinner = createNode(
    '<div class="app-spinner"><i class="app-spinner__content fas fa-3x fa-spinner fa-pulse"></i></div>'
  ) as HTMLDivElement;

  pendingShow: any;
  pendingHide: any;

  constructor(
    private element: HTMLElement,
    private transition = { delay: 1000, duration: 400 }
  ) {
    this.spinner.style.transition = `opacity ${this.transition.duration}ms ease`;
  }

  show() {
    if (this.pendingHide) {
      this.cancelHide();
    }
    if (!this.pendingShow) {
      this.scheduleShow();
    }
  }

  hide() {
    if (this.pendingShow) {
      this.cancelShow();
    }
    if (!this.pendingHide) {
      this.scheduleHide();
    }
  }

  private addSpinner() {
    this.element.appendChild(this.spinner);
  }

  private removeSpinner() {
    if (this.spinner.parentNode === this.element) {
      this.element.removeChild(this.spinner);
    }
  }

  private scheduleShow() {
    this.addSpinner();
    this.pendingShow = setTimeout(() => {
      this.pendingShow = null;
      this.spinner.classList.add('app-spinner--show');
    }, this.transition.delay);
  }

  private cancelShow() {
    clearTimeout(this.pendingShow);
    this.pendingShow = null;
    this.removeSpinner();
  }

  private scheduleHide() {
    this.spinner.classList.remove('app-spinner--show');
    this.pendingHide = setTimeout(() => {
      this.pendingHide = null;
      this.removeSpinner();
    }, this.transition.duration);
  }

  private cancelHide() {
    clearTimeout(this.pendingHide);
    this.pendingHide = null;
  }
}

export function bootstrapSpinner() {
  const spinner = new Spinner(document.querySelector('[app-spinner]') as HTMLElement);

  window.addEventListener(ON_NAVIGATE.START, () => {
    spinner.show();
  });

  window.addEventListener(ON_NAVIGATE.END, () => {
    spinner.hide();
  });
}
