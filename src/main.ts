import { defer, Deferred }                                      from '@whitetrefoil/deferred';
import log                                                      from 'fancy-log';
import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http';
import HttpProxyServer, { ServerOptions }                       from 'http-proxy';
// tslint:disable-next-line:no-implicit-dependencies
import { Middleware }                                           from 'koa';


interface IProxyResponse {
  code: number;
  headers: IncomingHttpHeaders;
  body: Buffer;
}


const requestMap: WeakMap<IncomingMessage, Deferred<IProxyResponse>> = new WeakMap();


async function onProxyRes(proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse) {
  const deferred = requestMap.get(req);
  if (deferred == null) {
    return;
  }

  const bodyBuf: Buffer[] = [];
  proxyRes.on('data', chunk => {
    bodyBuf.push(chunk);
  });
  proxyRes.on('end', async() => {
    const code = proxyRes.statusCode ?? 404;
    const headers = {
      ...proxyRes.headers,
      'x-koa-http-proxy': '1',
    };
    deferred.resolve({ code, headers, body: Buffer.concat(bodyBuf) });
  });
}

function onError(error: Error, req: IncomingMessage, res: ServerResponse) {
  const deferred = requestMap.get(req);
  if (deferred == null) { return; }

  deferred.reject(error);
}


export function proxyMiddlewareFactory(prefixes: string[], options: ServerOptions): Middleware {

  log.info('Initializing koa-http-proxy for these url:\n', prefixes);
  log.info('Initializing node-http-proxy for option:\n', options);

  const proxyServer = HttpProxyServer.createProxyServer(options);
  proxyServer.on('proxyRes', onProxyRes);
  proxyServer.on('error', onError);

  return async(ctx, next) => {
    const url = ctx.url;
    let isMatch = false;

    for (const prefix of prefixes) {
      if (url.indexOf(prefix) === 0) {
        isMatch = true;
        break;
      }
    }

    if (!isMatch) {
      await next();
      return;
    }

    const deferred = defer<IProxyResponse>();
    const res = new ServerResponse(ctx.req);
    requestMap.set(ctx.req, deferred);
    proxyServer.web(ctx.req, res);

    try {
      const proxyRes = await deferred.promise;

      ctx.status = proxyRes.code;

      // About the HPE_UNEXPECTED_CONTENT_LENGTH, see:
      // https://github.com/request/request/issues/2091#issuecomment-197217024
      // https://github.com/request/request/issues/2091#issuecomment-355013503
      const headers = proxyRes.headers;
      if (proxyRes.headers['transfer-encoding'] === 'chunked') {
        delete headers['transfer-encoding'];
      } else if (proxyRes.headers['transfer-encoding'] == null
                 && proxyRes.headers['content-encoding'] === 'chunked'
      ) {
        delete headers['content-encoding'];
      }
      Object.keys(headers).forEach(key => {
        const val = headers[key];
        if (val == null) { return; }
        ctx.set(key, val);
      });
      ctx.body = proxyRes.body;
      return next();
    } catch (e) {
      log.error(e.message);
      throw e;
    }
  };
}

export default proxyMiddlewareFactory;
