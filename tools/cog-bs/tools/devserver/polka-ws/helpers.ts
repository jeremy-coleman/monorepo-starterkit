



export function addTrailingSlash(string) {
  let suffixed = string;
  if (suffixed.charAt(suffixed.length - 1) !== '/') {
    suffixed = `${suffixed}/`;
  }
  return suffixed;
}

export function websocketUrl(url) {
  if (url.indexOf('?') !== -1) {
    const [baseUrl, query] = url.split('?');

    return `${addTrailingSlash(baseUrl)}.websocket?${query}`;
  }
  return `${addTrailingSlash(url)}.websocket`;
}

export function wrapMiddleware(middleware) {
  return (req, res, next) => {
    if (req.ws !== null && req.ws !== undefined) {
      req.wsHandled = true;
      try {
        /* Unpack the `.ws` property and call the actual handler. */
        middleware(req.ws, req, next);
      } catch (err) {
        /* If an error is thrown, let's send that on to any error handling */
        next(err);
      }
    } else {
      /* This wasn't a WebSocket request, so skip this middleware. */
      next();
    }
  };
}

export function addWsMethod(target) {
  /* This prevents conflict with other things setting `.ws`. */
  if (target.ws === null || target.ws === undefined) {
    target.ws = function addWsRoute(route, ...middlewares) {
      const wrappedMiddlewares = middlewares.map(wrapMiddleware);

      /* We append `/.websocket` to the route path here. Why? To prevent conflicts when
       * a non-WebSocket request is made to the same GET route - after all, we are only
       * interested in handling WebSocket requests.
       *
       * Whereas the original `express-ws` prefixed this path segment, we suffix it -
       * this makes it possible to let requests propagate through Routers like normal,
       * which allows us to specify WebSocket routes on Routers as well \o/! */
      const wsRoute = websocketUrl(route);

      /* Here we configure our new GET route. It will never get called by a client
       * directly, it's just to let our request propagate internally, so that we can
       * leave the regular middleware execution and error handling to Express. */
      this.get(...[wsRoute].concat(wrappedMiddlewares as any));

      /** Return `this` to allow for chaining */
      return this;
    };
  }
}
