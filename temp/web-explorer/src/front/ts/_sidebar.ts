import { FRONT_PAGES_FOLDER } from '../../config';
import { getAction, insertHtml } from './_dom';
import { fetchContent } from './_fetch';
import { bootstrapMenu } from './_menu';
import { updateActiveLinks } from './_router';

export function bootstrapSidebar({ hidden = false }) {
  const element = document.querySelector('.app-grid__wrap');
  if (element && hidden) element.classList.add('app-grid__wrap--sidebar-hidden');
  const sidebar = document.querySelector('[app-sidebar]');
  if (sidebar) {
    fetchContent(`./${FRONT_PAGES_FOLDER}/sidebar.html`).then((html) => {
      insertHtml(html, sidebar);
      bootstrapMenu(sidebar);
      updateActiveLinks();
    });
  }
}

export function toggleSidebar() {
  const element = document.querySelector('.app-grid__wrap');
  if (element) element.classList.toggle('app-grid__wrap--sidebar-hidden');
}

export function bootstrapToggleSidebar() {
  const toggle = document.querySelector('[app-sidebar-toggle]');
  if (toggle) getAction('view_sidebar', toggle, toggleSidebar);
}
