// tslint:disable:no-implicit-dependencies
import { defer, Deferred } from '@whitetrefoil/deferred'
import log from 'fancy-log'
import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http'
import Server, { ServerOptions } from 'http-proxy'
import { Middleware } from 'koa'


interface IProxyResponse {
  code: number
  headers: IncomingHttpHeaders
  body: any
}


const requestMap: WeakMap<IncomingMessage, Deferred<IProxyResponse>> = new WeakMap()


function onProxyRes(proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse) {
  const deferred = requestMap.get(req)
  if (deferred == null) {
    return
  }

  let body = ''
  proxyRes.on('data', (chunk) => {
    body += chunk
  })
  proxyRes.on('end', () => {
    const code    = proxyRes.statusCode || 404
    const headers = proxyRes.headers
    deferred.resolve({ code, headers, body })
  })
}

function onError(error: Error, req: IncomingMessage, res: ServerResponse) {
  const deferred = requestMap.get(req)
  if (deferred == null) { return }

  deferred.reject(error)
}


export function proxyMiddlewareFactory(prefixes: string[], options: ServerOptions): Middleware {

  log.info('Initializing koa-http-proxy for these url:\n', prefixes)
  log.info('Initializing node-http-proxy for option:\n', options)

  const proxyServer = new Server(options)
  proxyServer.on('proxyRes', onProxyRes)
  proxyServer.on('error', onError)

  return async(ctx, next) => {
    const url   = ctx.url
    let isMatch = false

    for (const prefix of prefixes) {
      if (url.indexOf(prefix) === 0) {
        isMatch = true
        break
      }
    }

    if (!isMatch) {
      await next()
      return
    }

    const deferred = defer<IProxyResponse>()
    requestMap.set(ctx.req, deferred)
    proxyServer.web(ctx.req, ctx.res)

    return deferred.promise
      .then((proxyRes) => {
        ctx.status = proxyRes.code
        ctx.set(proxyRes.headers as any)
        ctx.body = proxyRes.body
        return next()
      }, next)
  }
}

export default proxyMiddlewareFactory
