import { createMockContext } from '@shopify/jest-koa-mocks'
import { fetch } from '@shopify/jest-dom-mocks'
import { StatusCode } from '@shopify/network'

import verifyRequest from '../verify-request'
import { TEST_COOKIE_NAME, TOP_LEVEL_OAUTH_COOKIE_NAME } from '../../index'

const TEST_SITE = 'testsite.my-things-factory.com'

describe('verifyRequest', () => {
  afterEach(fetch.restore)

  describe('when there is an accessToken and site in session', () => {
    it('calls next', async () => {
      const verifyRequestMiddleware = verifyRequest()
      const ctx = createMockContext({
        url: appUrl(TEST_SITE),
        session: { accessToken: 'test', site: TEST_SITE }
      })
      const next = jest.fn()

      fetch.mock(metaFieldsUrl(TEST_SITE), StatusCode.Ok)
      await verifyRequestMiddleware(ctx, next)

      expect(next).toHaveBeenCalled()
    })

    it('calls next when there is no site in the query', async () => {
      const verifyRequestMiddleware = verifyRequest()
      const ctx = createMockContext({
        url: appUrl(),
        session: { accessToken: 'test', site: TEST_SITE }
      })
      const next = jest.fn()

      fetch.mock(metaFieldsUrl(TEST_SITE), StatusCode.Ok)
      await verifyRequestMiddleware(ctx, next)

      expect(next).toHaveBeenCalled()
    })

    it('clears the top level oauth cookie', () => {
      const verifyRequestMiddleware = verifyRequest()
      const ctx = createMockContext({
        url: appUrl(TEST_SITE),
        session: { site: TEST_SITE, accessToken: 'test' }
      })
      const next = jest.fn()

      verifyRequestMiddleware(ctx, next)

      expect(ctx.cookies.set).toHaveBeenCalledWith(TOP_LEVEL_OAUTH_COOKIE_NAME)
    })

    it('redirects to the given authRoute if the token is invalid', async () => {
      const authRoute = '/my-auth-route'

      const verifyRequestMiddleware = verifyRequest({ authRoute })
      const next = jest.fn()
      const ctx = createMockContext({
        url: appUrl(TEST_SITE),
        redirect: jest.fn(),
        session: { accessToken: 'test', site: TEST_SITE }
      })

      fetch.mock(metaFieldsUrl(TEST_SITE), StatusCode.Unauthorized)
      await verifyRequestMiddleware(ctx, next)

      expect(ctx.redirect).toHaveBeenCalledWith(`${authRoute}?site=${TEST_SITE}`)
    })

    it('redirects to the given authRoute if the site in session does not match the one in the query param', async () => {
      const authRoute = '/my-auth-route'

      const verifyRequestMiddleware = verifyRequest({ authRoute })
      const next = jest.fn()
      const ctx = createMockContext({
        url: appUrl(TEST_SITE),
        redirect: jest.fn(),
        session: { accessToken: 'test', site: 'some-other-site.com' }
      })

      fetch.mock(metaFieldsUrl(TEST_SITE), StatusCode.Ok)
      await verifyRequestMiddleware(ctx, next)

      expect(ctx.redirect).toHaveBeenCalledWith(`${authRoute}?site=${TEST_SITE}`)
    })
  })

  describe('when there is no session', () => {
    it('sets the test cookie', () => {
      const verifyRequestMiddleware = verifyRequest()
      const ctx = createMockContext({})
      const next = jest.fn()

      verifyRequestMiddleware(ctx, next)

      expect(ctx.cookies.set).toHaveBeenCalledWith(TEST_COOKIE_NAME, '1')
    })

    it('redirects to /auth if site is present on query', () => {
      const site = 'mysite.com'

      const verifyRequestMiddleware = verifyRequest()
      const next = jest.fn()
      const ctx = createMockContext({
        url: appUrl(site),
        redirect: jest.fn()
      })

      verifyRequestMiddleware(ctx, next)

      expect(ctx.redirect).toHaveBeenCalledWith(`/auth?site=${site}`)
    })

    it('redirects to /auth if site is not present on query', () => {
      const verifyRequestMiddleware = verifyRequest()
      const next = jest.fn()
      const ctx = createMockContext({
        url: appUrl(),
        redirect: jest.fn()
      })

      verifyRequestMiddleware(ctx, next)

      expect(ctx.redirect).toHaveBeenCalledWith(`/auth`)
    })

    it('redirects to the given authRoute if site is present on query', () => {
      const site = 'mysite.com'
      const authRoute = '/my-auth-route'

      const verifyRequestMiddleware = verifyRequest({ authRoute })
      const next = jest.fn()
      const ctx = createMockContext({
        url: appUrl(site),
        redirect: jest.fn()
      })

      verifyRequestMiddleware(ctx, next)

      expect(ctx.redirect).toHaveBeenCalledWith(`${authRoute}?site=${site}`)
    })

    it('redirects to the given fallbackRoute if site is not present on query', () => {
      const fallbackRoute = '/somewhere-on-the-app'
      const verifyRequestMiddleware = verifyRequest({ fallbackRoute })

      const next = jest.fn()
      const ctx = createMockContext({
        redirect: jest.fn()
      })

      verifyRequestMiddleware(ctx, next)

      expect(ctx.redirect).toHaveBeenCalledWith(fallbackRoute)
    })
  })
})

function metaFieldsUrl(site: string) {
  return `https://${site}/admin/oauth/profile.json`
}

function appUrl(site?: string) {
  return site == null ? '/foo' : `/foo?site=${site}`
}
