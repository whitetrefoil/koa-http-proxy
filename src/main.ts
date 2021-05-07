import type { Filter, Options } from 'http-proxy-middleware'
import { createProxyMiddleware as proxy } from 'http-proxy-middleware'
import type { Middleware } from 'koa'
import c2k from 'koa-connect'

export const createProxyMiddleware = (context: Filter|Options, options?: Options): Middleware =>
  c2k(proxy(context, options))

export type { Middleware } from 'koa'
export type { RequestHandler } from 'http-proxy-middleware'
