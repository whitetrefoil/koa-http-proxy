import { createProxyMiddleware as proxy, Filter, Options, RequestHandler } from 'http-proxy-middleware';
// tslint:disable-next-line:no-implicit-dependencies
import type { Middleware }                                                 from 'koa';
import c2k                                                                 from 'koa-connect';

export const createProxyMiddleware = (context: Filter|Options, options?: Options): Middleware =>
  c2k(proxy(context, options));

// tslint:disable-next-line:no-implicit-dependencies
export type { Middleware }     from 'koa';
// tslint:disable-next-line:no-implicit-dependencies
export type { RequestHandler } from 'http-proxy-middleware';

export default createProxyMiddleware;
