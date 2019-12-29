import { getParentNodes } from './_dom';
import { getActiveLinks, ON_NAVIGATE } from './_router';

export class Menu {
  private activeLinksHandler: (event: Event) => void;

  constructor(private menu: Element) {
    this.closeChilds(menu);
    menu.addEventListener('click', this.clickHandler.bind(this));
    this.openActiveLinks();
    this.activeLinksHandler = (event: Event) => this.openActiveLinks();
    this.init();
  }

  init() {
    window.addEventListener(ON_NAVIGATE.END, this.activeLinksHandler);
  }

  destroy() {
    window.removeEventListener(ON_NAVIGATE.END, this.activeLinksHandler);
  }

  openActiveLinks() {
    getActiveLinks(this.menu).forEach(activeLink => this.openParents(activeLink));
  }

  clickHandler(event: Event) {
    const header = event.target as Element;
    if (header && header.classList.contains('app-menu__header')) {
      this.toggleMenu(header);
    }
  }

  toggleMenu(header: Element) {
    const isOpen = !header.classList.contains('app-menu__header--closed');
    if (isOpen) {
      const menu = header.nextElementSibling;
      if (menu) this.closeChilds(menu);
    }
    header.classList.toggle('app-menu__header--closed');
  }

  closeChilds(menu: Element) {
    menu.querySelectorAll('.app-menu__header').forEach(
      header => header.classList.add('app-menu__header--closed')
    );
  }

  openParents(activeLink: Element) {
    getParentNodes(activeLink, this.menu).forEach((menu) => {
      if (menu.classList.contains('app-menu')) {
        const header = menu.previousElementSibling;
        if (header && header.classList.contains('app-menu__header')) {
          header.classList.remove('app-menu__header--closed');
        }
      }
    });
  }
}

export function bootstrapMenu(container: Element) {
  container.querySelectorAll('[app-menu]').forEach(menu => new Menu(menu));
}
