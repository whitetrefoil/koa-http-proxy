// tslint:disable:no-implicit-dependencies
import { defer, Deferred } from '@whitetrefoil/deferred'
import { IncomingMessage, ServerResponse } from 'http'
import Server, { ServerOptions } from 'http-proxy'
import { Middleware } from 'koa'


let proxyServer: Server

const requestMap: WeakMap<IncomingMessage, Deferred<IncomingMessage>> = new WeakMap()


function onProxyRes(proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse) {
  const deferred = requestMap.get(req)
  if (deferred == null) {
    return
  }

  deferred.resolve(proxyRes)
}

function onError(error: Error, req: IncomingMessage, res: ServerResponse) {
  const deferred = requestMap.get(req)
  if (deferred == null) {
    return
  }

  deferred.reject(error)
}


export function proxyMiddlewareFactory(prefixes: string[], options: ServerOptions): Middleware {
  if (proxyServer == null) {
    proxyServer = new Server(options)
    proxyServer.on('proxyRes', onProxyRes)
    proxyServer.on('error', onError)
  }

  return async(ctx, next) => {
    const url = ctx.url

    for (const prefix of prefixes) {
      if (url.indexOf(prefix) !== 0) { continue }
      const deferred = defer<IncomingMessage>()
      requestMap.set(ctx.req, deferred)
      proxyServer.web(ctx.req, ctx.res)
      await deferred.promise
        .then((proxyRes) => {
          let body = ''
          proxyRes.on('data', (chunk) => {
            body += chunk
          })
          proxyRes.on('end', async() => {
            ctx.status = proxyRes.statusCode || 404
            ctx.set(proxyRes.headers as any)
            ctx.body = body
            await next()
          })
        })
      break
    }
  }
}
