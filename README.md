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

Warning
-------

Do not use any middleware like "bodyparser" before the proxy, otherwise requests with body (e.g. a POST) may hang.
See [the issue in node-http-proxy](https://github.com/nodejitsu/node-http-proxy/issues/180) for more details.

Usage
-----

```typescript
import proxyMiddlewareFactory from '@whitetrefoil/koa-http-proxy'

app.use(proxyMiddlewareFactory(['/api'], { ...options }))
```

The `options` here is the one of "[node-http-proxy](https://github.com/nodejitsu/node-http-proxy#options)".

Changelog
---------

### v0.2.0

* Upgrade TypeScript to stable.

### v0.2.0-beta.1

* Upgrade dependencies.

### v0.1.5

* Fix "@whitetrefoil/deferred" used as dependency but required as devDependency.

### v0.1.4

* Print error message when proxy request failed.

### v0.1.3

* Add some logs to help debugging.

### v0.1.2

* Use dedicated server for each factory call.

### v0.1.1

* Fix a bug about response body.

### v0.1.0

* Initial release.
