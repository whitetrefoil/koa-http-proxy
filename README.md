@whitetrefoil/koa-http-proxy
============================

**WARNING: THIS APPLICATION IS STILL DEVELOPING!!!**

Koa version of http-proxy-middleware.

Why This?
---------

The current awesome "[http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)"
is designed for connect / express. It will not call `next()` when the proxy responses.
This will cause problem if simply use "[koa-connect](https://github.com/vkurchatkin/koa-connect)"
to adapt it.

Usage
-----

```typescript
import proxyMiddlewareFactory from '@whitetrefoil/koa-http-proxy'

app.use(proxyMiddlewareFactory(['/api'], { ...options }))
```

The `options` here is the one of "[node-http-proxy](https://github.com/nodejitsu/node-http-proxy#options)".

Changelog
---------

### v0.1.1

* Fix a bug about response body.

### v0.1.0

* Initial release.
