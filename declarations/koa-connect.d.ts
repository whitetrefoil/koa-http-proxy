declare module 'koa-connect' {
  import type { HandleFunction } from 'connect'
  import type { RequestHandler } from 'express'
  import type { Middleware } from 'koa'

  function convert(connectHandler: HandleFunction|RequestHandler): Middleware

  export = convert
}
