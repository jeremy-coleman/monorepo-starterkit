import { bootstrapPlayground } from './_playground';
import { bootstrapRouter, initRouter } from './_router';
import { bootstrapSidebar, bootstrapToggleSidebar } from './_sidebar';
import { bootstrapSpinner } from './_spinner';
import { bootstrapServiceWorker } from './_service-worker';
import { bootstrapToolbox } from './_toolbox';

// Global variable defined by `Webpack.DefinePlugin` in `webpack-front.config.ts`.
declare const PRODUCTION: boolean;

// To fully unregister the service worker, you need first to be in development mode (`PRODUCTION = false`).
// But if a service worker is already activated, you also need to change the `cacheVersion` number in
// `./src/front/service-worker.js`.
//
// Finally, to enable the service worker in development mode,
// comment temporarily the argument `PRODUCTION`.
bootstrapServiceWorker(PRODUCTION);

window.addEventListener('DOMContentLoaded', () => {
  // Init the router at the begining to let the next modules use
  // `getActiveLinks` which  requires `baseUrl` to be defined.
  initRouter();
  bootstrapSidebar({ hidden: true });
  bootstrapToggleSidebar();
  bootstrapSpinner();
  bootstrapToolbox();
  bootstrapPlayground();

  // Bootstrap the router at the end to let the previous
  // modules react to the first `ON_NAVIGATE` event.
  bootstrapRouter();
});

/*

Naming convention
-----------------

bootstrapFoo
  A function that modifies the DOM or binds events on it.
  The function is exported by the module.

fooHandler
  A function that is executed as an event callback.
  Usually the function is not exported by the module.

ON_FOO
  Custom event name.
  The variable is exported by the module.

*/
