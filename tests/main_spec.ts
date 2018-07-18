import * as Chai from 'chai'
import { proxyMiddlewareFactory } from '../src/main'

Chai.should()

describe('Basic', () => {
  it('should work', () => {
    const middleware = proxyMiddlewareFactory([], {})
    middleware.should.be.a('function')
    middleware.length.should.equal(2)
  })
})
