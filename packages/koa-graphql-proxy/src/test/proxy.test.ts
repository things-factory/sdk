import { createMockContext } from '@shopify/jest-koa-mocks'

import koaThingsFactoryGraphQLProxy, { ApiVersion, PROXY_BASE_PATH, GRAPHQL_PATH_PREFIX } from '../graphql-proxy'

jest.mock('koa-better-http-proxy', () => {
  return jest.fn(() => jest.fn())
})

const proxyFactory = jest.requireMock('koa-better-http-proxy')

describe('koa-graphql-proxy', () => {
  beforeEach(() => {
    proxyFactory.mockClear()
  })

  it('throws when no session is provided', async () => {
    const koaThingsFactoryGraphQLProxyMiddleware = koaThingsFactoryGraphQLProxy({
      version: ApiVersion.Unstable
    })
    const ctx = createMockContext({
      url: PROXY_BASE_PATH,
      method: 'POST',
      throw: jest.fn()
    })

    await koaThingsFactoryGraphQLProxyMiddleware(ctx, jest.fn())

    expect(ctx.throw).toHaveBeenCalledWith(403, 'Unauthorized')
  })

  it('throws when no accessToken is on session', async () => {
    const koaThingsFactoryGraphQLProxyMiddleware = koaThingsFactoryGraphQLProxy({
      version: ApiVersion.Unstable
    })

    const ctx = createMockContext({
      url: PROXY_BASE_PATH,
      method: 'POST',
      throw: jest.fn(),
      session: { site: 'site1.myoperato.com' }
    })

    await koaThingsFactoryGraphQLProxyMiddleware(ctx, jest.fn())

    expect(ctx.throw).toHaveBeenCalledWith(403, 'Unauthorized')
  })

  it('throws when no site is on session', async () => {
    const koaThingsFactoryGraphQLProxyMiddleware = koaThingsFactoryGraphQLProxy({
      version: ApiVersion.Unstable
    })
    const ctx = createMockContext({
      url: PROXY_BASE_PATH,
      method: 'POST',
      throw: jest.fn(),
      session: { accessToken: 'sdfasdf' }
    })

    await koaThingsFactoryGraphQLProxyMiddleware(ctx, jest.fn())

    expect(ctx.throw).toHaveBeenCalledWith(403, 'Unauthorized')
  })

  it('bails and calls next if method is not POST', async () => {
    const koaThingsFactoryGraphQLProxyMiddleware = koaThingsFactoryGraphQLProxy({
      version: ApiVersion.Unstable
    })
    const ctx = createMockContext({
      url: '/graphql',
      method: 'GET',
      throw: jest.fn(),
      session: { accessToken: 'sdfasdf', site: 'foobarbaz' }
    })
    const nextSpy = jest.fn()

    await koaThingsFactoryGraphQLProxyMiddleware(ctx, nextSpy)

    expect(nextSpy).toHaveBeenCalled()
    expect(proxyFactory).not.toHaveBeenCalled()
  })

  it('bails and calls next if path does not start with the base url', async () => {
    const koaThingsFactoryGraphQLProxyMiddleware = koaThingsFactoryGraphQLProxy({
      version: ApiVersion.Unstable
    })
    const ctx = createMockContext({
      url: '/not/graphql',
      throw: jest.fn(),
      session: { accessToken: 'sdfasdf', site: 'foobarbaz' }
    })
    const nextSpy = jest.fn()

    await koaThingsFactoryGraphQLProxyMiddleware(ctx, nextSpy)

    expect(nextSpy).toHaveBeenCalled()
    expect(proxyFactory).not.toHaveBeenCalled()
  })

  it('bails and calls next if path does not start with the base url and no session', async () => {
    const koaThingsFactoryGraphQLProxyMiddleware = koaThingsFactoryGraphQLProxy({
      version: ApiVersion.Unstable
    })
    const ctx = createMockContext({
      url: '/not/graphql',
      throw: jest.fn()
    })
    const nextSpy = jest.fn()

    await koaThingsFactoryGraphQLProxyMiddleware(ctx, nextSpy)

    expect(nextSpy).toHaveBeenCalled()
    expect(proxyFactory).not.toHaveBeenCalled()
  })

  it('does not bail or throw when request is for the graphql api', async () => {
    const koaThingsFactoryGraphQLProxyMiddleware = koaThingsFactoryGraphQLProxy({
      version: ApiVersion.Unstable
    })
    const ctx = createMockContext({
      url: PROXY_BASE_PATH,
      method: 'POST',
      throw: jest.fn(),
      session: { accessToken: 'sdfasdf', site: 'foobarbaz' }
    })
    const nextSpy = jest.fn()

    await koaThingsFactoryGraphQLProxyMiddleware(ctx, nextSpy)

    expect(nextSpy).not.toHaveBeenCalled()
    expect(ctx.throw).not.toHaveBeenCalledWith(403, 'Unauthorized')
  })

  it('configures a custom koa-better-http-proxy', async () => {
    const koaThingsFactoryGraphQLProxyMiddleware = koaThingsFactoryGraphQLProxy({
      version: ApiVersion.Unstable
    })
    const accessToken = 'asdfasdf'
    const site = 'i-sell-things.myoperato.com'

    const ctx = createMockContext({
      url: PROXY_BASE_PATH,
      method: 'POST',
      throw: jest.fn(),
      session: { accessToken, site }
    })

    await koaThingsFactoryGraphQLProxyMiddleware(ctx, jest.fn())

    const [host, config] = proxyFactory.mock.calls[0]
    expect(host).toBe(site)

    expect(config).toMatchObject({
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': accessToken
      },
      https: true,
      parseReqBody: false
    })
  })

  it('configures a custom koa-better-http-proxy with private app credentials from the options', async () => {
    const password = 'sdfghsdghsh'
    const site = 'i-sell-things.myoperato.com'
    const koaThingsFactoryGraphQLProxyMiddleware = koaThingsFactoryGraphQLProxy({
      version: ApiVersion.Unstable,
      password,
      site
    })

    const ctx = createMockContext({
      url: PROXY_BASE_PATH,
      method: 'POST',
      throw: jest.fn()
    })

    await koaThingsFactoryGraphQLProxyMiddleware(ctx, jest.fn())

    const [host, config] = proxyFactory.mock.calls[0]
    expect(host).toBe(site)

    expect(config).toMatchObject({
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': password
      },
      https: true,
      parseReqBody: false
    })
  })

  it('passes a proxyReqPathResolver that returns full site url with the API version', async () => {
    const version = ApiVersion.Unstable
    const koaThingsFactoryGraphQLProxyMiddleware = koaThingsFactoryGraphQLProxy({
      version
    })
    const site = 'some-site.myoperato.com'

    const ctx = createMockContext({
      url: PROXY_BASE_PATH,
      method: 'POST',
      throw: jest.fn(),
      session: { accessToken: 'sdfasdf', site }
    })

    await koaThingsFactoryGraphQLProxyMiddleware(ctx, jest.fn())

    const { proxyReqPathResolver } = proxyFactory.mock.calls[0][1]
    expect(proxyReqPathResolver(ctx)).toBe(`${GRAPHQL_PATH_PREFIX}/${version}/graphql.json`)
  })

  it('terminates middleware chain when proxying (does not call next)', async () => {
    const koaThingsFactoryGraphQLProxyMiddleware = koaThingsFactoryGraphQLProxy({
      version: ApiVersion.Unstable
    })
    const site = 'some-site.myoperato.com'

    const ctx = createMockContext({
      url: PROXY_BASE_PATH,
      method: 'POST',
      throw: jest.fn(),
      session: { accessToken: 'sdfasdf', site }
    })
    const nextSpy = jest.fn()

    await koaThingsFactoryGraphQLProxyMiddleware(ctx, nextSpy)
    expect(nextSpy).not.toHaveBeenCalled()
  })
})
