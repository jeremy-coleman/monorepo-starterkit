import { FRONT_PAGES_FOLDER } from '../../config';
import { resolveUrl } from './_dom';

const noInternetAccess =
`<p class="app-content__error">
  <br>
  <i class="fas fa-3x fa-exclamation"></i>
  <br>
  <br>
  No internet access
</p>`;

export function fetchContent404() {
  return fetch(resolveUrl(`/${FRONT_PAGES_FOLDER}/error404.html`)).then(response => response.text());
}

export function fetchContent(url: string) {
  return fetch(url)
    .then((response) => {
      if (response.status !== 200) {
        return fetchContent404().then(html => html.replace('{{url}}', url));
      }
      return response.text();
    })
    .catch(() => noInternetAccess);
}
