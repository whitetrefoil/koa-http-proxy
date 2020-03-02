import log                                from 'fancy-log';
import HttpProxyServer, { ServerOptions } from 'http-proxy';
// tslint:disable-next-line:no-implicit-dependencies
import { Middleware }                     from 'koa';


export function proxyMiddlewareFactory(prefixes: string[], options: ServerOptions): Middleware {

  log.info('Initializing koa-http-proxy for these url:\n', prefixes);
  log.info('Initializing node-http-proxy for option:\n', options);

  const proxyServer = HttpProxyServer.createProxyServer(options);

  return async(ctx, next) => {
    const url   = ctx.url;
    let isMatch = false;

    for (const prefix of prefixes) {
      if (url.indexOf(prefix) === 0) {
        isMatch = true;
        break;
      }
    }

    if (!isMatch) {
      return;
    }

    proxyServer.web(ctx.req, ctx.res);
  };
}

export default proxyMiddlewareFactory;
