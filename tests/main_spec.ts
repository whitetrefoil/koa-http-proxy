import { createProxyMiddleware } from '~/main.js'

describe('Basic', () => {
  it('should work', () => {
    const middleware = createProxyMiddleware([], {})
    expect(typeof middleware).toBe('function')
    expect(middleware.length).toBe(2)
  })
})
