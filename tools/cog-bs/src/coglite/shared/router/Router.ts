import * as React from "react";

import { compile, PathFunction, pathToRegexp } from "./path-to-regexp";

export type IRouter = {
  handleRequest(req: IRequest, next?: IRequestHandler): Promise<any> | any;
  use?(pathOrRouter: string | IRouter | IRequestHandler, router?: IRouter | IRequestHandler): void;
};

export type IRouterManager = {
  use(pathOrRouter: string | IRouter | IRequestHandler, router?: IRouter | IRequestHandler): void;
};

export type IRequestHandler = {
  (req?: IRequest, next?: IRequestHandler): Promise<any> | any;
};

export type IRequest = {
  app?: any;
  basePath?: string;
  path?: string;
  params?: { [key: string]: any };
  [key: string]: any;
};
export type IPathTestResult = {
  match: boolean;
  params?: any;
};

export type IExactPathOptions = {
  allowTrailingSlash?: boolean;
};

export type IReactRouterOptions = {
  exportKey?: string;
  exact?: boolean;
  allowTrailingSlash?: boolean;
  requestPropKey?: string;
};

export type IPathTemplate = {
  text: string;
  paramCount: number;
  paramNames: string[];
  test(path: string): IPathTestResult;
  toPath(params: any): string;
};
export type IPathTemplateOptions = {
  sensitive?: boolean;
  strict?: boolean;
  end?: boolean;
  delimiter?: string;
};

export type IRequestContext = {
  request: IRequest;
  next: boolean;
  value?: any;
};


const notFoundHandler = (req: IRequest) => {
  return Promise.reject({ code: "NOT_FOUND", request: req, message: `Unable to find handler for ${req.path}` });
};

const uselessRouter: IRouter = {
  handleRequest(req: IRequest, next?: IRequestHandler) {
    return Promise.resolve(next ? next(req) : notFoundHandler(req));
  }
};

export const matches = (value: string, pattern: string): boolean => {
  const template = new PathTemplate(pattern);
  const mr = template.test(value);
  return mr.match;
};

export const exactPath = (handler: IRequestHandler, opts?: IExactPathOptions): IRequestHandler => (req, next) => {
  if (req.basePath === req.path || (opts && opts.allowTrailingSlash && req.path === `${req.basePath}/`)) {
    return handler(req, next);
  }
  next();
};

const DefaultReactRouterOptions = {
  exact: true,
  allowTrailingSlash: false,
  requestPropKey: "match"
};

export const reactRouter = (importer: () => Promise<any> | any, opts?: IReactRouterOptions) => {
  const mergedOpts = Object.assign({}, DefaultReactRouterOptions, opts);
  const handler = (request: IRequest) => {
    return Promise.resolve(importer()).then((m) => {
      const type = mergedOpts.exportKey ? m[mergedOpts.exportKey] : m.default;
      if (!type) {
        throw { code: "ILLEGAL_ARGUMENT", message: "Unable to resolve React Component export Type" };
      }
      const props = {};
      props[mergedOpts.requestPropKey] = request;
      return React.createElement(type, props);
    });
  };
  return mergedOpts.exact ? exactPath(handler, mergedOpts) : handler;
};


export const resolveReact = (component, opts?: IReactRouterOptions) => {
  const mergedOpts = Object.assign({}, DefaultReactRouterOptions, opts);
  const handler = (request: IRequest) => {
    return Promise.resolve(component).then((m) => {
      const props = {
        match: request
      };
      return React.createElement(m, props);
    });
  };
  return mergedOpts.exact ? exactPath(handler, mergedOpts) : handler;
};

export const reactView = (component, props = {}) => 
  Promise.resolve(component).then((m) => {
      return React.createElement(m, props);
  });

export const injectParametersInterceptor = (params: any, handler?: IRequestHandler): IRequestHandler => {
  return (req, next) => {
    const nextReq = Object.assign({}, req);
    nextReq.params = Object.assign({}, nextReq.params, params);
    if (handler) {
      return handler(nextReq, next);
    }
    return next(nextReq);
  };
};

export const injectQueryInterceptor = (query: any, handler?: IRequestHandler): IRequestHandler => {
  return (req, next) => {
    const nextReq = Object.assign({}, req);
    nextReq.query = Object.assign({}, nextReq.query, query);
    if (handler) {
      return handler(nextReq, next);
    }
    return next(nextReq);
  };
};

export class PathTemplate {
  private _text: string;
  private _keys: any[] = [];
  private _re: RegExp;
  private _pf: PathFunction;
  constructor(text: string, opts?: IPathTemplateOptions) {
    this._text = text;
    this._re = pathToRegexp(text, this._keys, opts);
  }
  get text() {
    return this._text;
  }
  get paramNames(): string[] {
    return this._keys.map((k) => k.name);
  }
  get paramCount() {
    return this._keys.length;
  }
  test(path: string): IPathTestResult {
    const r: IPathTestResult = {
      match: this._re.test(path)
    };
    if (r.match) {
      const params: any = {};
      const er = this._re.exec(path);
      this._keys.forEach((key, idx) => {
        params[key.name] = decodeURIComponent(er[idx + 1]);
      });
      r.params = params;
    }
    return r;
  }
  toPath(params: any): string {
    if (!this._pf) {
      this._pf = compile(this._text);
    }
    return this._pf(params);
  }
  toString() {
    return this._text;
  }
}

export class RequestHandlerRouter implements IRouter {
  private requestHandler: IRequestHandler;

  constructor(requestHandler: IRequestHandler) {
    this.requestHandler = requestHandler;
  }

  handleRequest(req: IRequest, next?: IRequestHandler) {
    return Promise.resolve(this.requestHandler(req, next));
  }
  toJSON() {
    return "handler function";
  }
}

export const createRouter = (router: IRouter | IRequestHandler): IRouter => {
  if (typeof router === "function") {
    return new RequestHandlerRouter(router as IRequestHandler);
  }
  return router ? (router as IRouter) : uselessRouter;
};

export class PathRouter implements IRouter {
  private _pathTemplate: PathTemplate;
  private _router: IRouter;
  constructor(path: string, router: IRouter | IRequestHandler) {
    this._pathTemplate = new PathTemplate(path, { end: false });
    this._router = createRouter(router);
  }
  handleRequest(req: IRequest, next: IRequestHandler = notFoundHandler) {
    const testPath = req.basePath ? req.path.substring(req.basePath.length) : req.path;
    const testResult = this._pathTemplate.test(testPath);
    if (testResult.match) {
      const handlerReq = Object.assign({}, req);
      handlerReq.params = Object.assign({}, req.params, testResult.params);
      const matchedPath = this._pathTemplate.toPath(handlerReq.params);
      handlerReq.basePath = req.basePath ? req.basePath + matchedPath : matchedPath;
      return this._router.handleRequest(handlerReq, next);
    }
    next();
  }
  toJSON() {
    return this._pathTemplate.text;
  }
}

export class Router implements IRouter {
  private _routers: IRouter[] = [];
  defaultHandler: IRequestHandler;

  public use(pathOrRouter: string | IRouter | IRequestHandler, router?: IRouter | IRequestHandler): void {
    let r: IRouter;
    if (typeof pathOrRouter === "string") {
      r = new PathRouter(pathOrRouter as string, router);
    } else {
      r = createRouter(pathOrRouter as IRouter | IRequestHandler);
    }
    this._routers.push(r);
  }

  private _processRouter(router: IRouter, context: IRequestContext, next: IRequestHandler): Promise<any> {
    return Promise.resolve(router.handleRequest(context.request, next)).then((value) => {
      if (!context.next) {
        context.value = value;
      }
    });
  }

  private _nextRouterHandler(router: IRouter, context: IRequestContext, next: IRequestHandler) {
    return () => {
      if (context.next) {
        context.next = false;
        return this._processRouter(router, context, next);
      }
      return Promise.resolve();
    };
  }

  public handleRequest(req: IRequest, next: IRequestHandler = notFoundHandler): Promise<any> {
    const fallThrough = (req) => {
      return this.defaultHandler ? this.defaultHandler(req, next) : next(req);
    };
    const context: IRequestContext = {
      request: req,
      next: false
    };
    const nextInternal = (request: IRequest) => {
      if (request) {
        context.request = request;
      }
      context.next = true;
    };
    let p: Promise<any>;
    this._routers.forEach((r) => {
      if (!p) {
        p = this._processRouter(r, context, nextInternal);
      } else {
        p = p.then(this._nextRouterHandler(r, context, nextInternal));
      }
    });
    if (!p) {
      p = Promise.resolve(fallThrough(context.request));
    } else {
      p = p.then(() => {
        if (context.next) {
          return Promise.resolve(fallThrough(context.request));
        }
        return context.value;
      });
    }
    return p;
  }

  toJSON() {
    return {
      routers: [].concat(this._routers)
    };
  }
}

export function encode(obj: object, pfx: string = "") {
  var k,
    i,
    tmp,
    str = "";

  for (k in obj) {
    if ((tmp = obj[k]) !== void 0) {
      if (Array.isArray(tmp)) {
        for (i = 0; i < tmp.length; i++) {
          str && (str += "&");
          str += encodeURIComponent(k) + "=" + encodeURIComponent(tmp[i]);
        }
      } else {
        str && (str += "&");
        str += encodeURIComponent(k) + "=" + encodeURIComponent(tmp);
      }
    }
  }

  return pfx + str;
}

function toValue(mix) {
  if (!mix) return "";
  var str = decodeURIComponent(mix);
  if (str === "false") return false;
  if (str === "true") return true;
  return +str * 0 === 0 ? +str : str;
}

export function decode<T extends object = {}>(str: string) {
  var tmp;
  var k;
  var out: Partial<T> = {};
  var arr = str.split("&");

  while ((tmp = arr.shift())) {
    tmp = tmp.split("=");
    k = tmp.shift();
    if (out[k] !== void 0) {
      out[k] = [].concat(out[k], toValue(tmp.shift()));
    } else {
      out[k] = toValue(tmp.shift());
    }
  }

  return out;
}

export { decode as parseQuerystring };
export { encode as stringify };

//https://github.com/mightyiam/pick-path/blob/master/src/index.ts

export interface Routes<Value> {
  [pattern: string]: Routes<Value> | Value;
}

export interface Match<Value> {
  pattern: string | null;
  value: Value | null;
  params: string[];
}

const hasTrailingSlash = (path: string): boolean => path.length > 1 && path.slice(-1) === "/";
const sansTrailingSlash = (path: string): string => (hasTrailingSlash(path) ? path.slice(0, -1) : path);

export const pickPath = <Value>(path: string, routes: Routes<Value>, parentPattern = ""): Match<Value> => {
  const patterns = Object.keys(routes);
  for (const pattern of patterns) {
    const value = routes[pattern];
    const fullPattern = parentPattern + sansTrailingSlash(pattern);

    if (hasTrailingSlash(pattern)) {
      const possibleMatch = pickPath(path, value as Routes<Value>, fullPattern);
      if (possibleMatch.pattern) {
        return possibleMatch;
      }
    }

    const re = pathToRegexp(pattern === "/" ? parentPattern : fullPattern);
    const params = re.exec(path);

    if (params) {
      return {
        pattern: fullPattern,
        value: value as Value,
        params: params.slice(1)
      };
    }
  }

  return {
    pattern: null,
    value: null,
    params: []
  };
};
