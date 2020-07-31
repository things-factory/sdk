import { createMockContext } from '@shopify/jest-koa-mocks'
import { fetch } from '@shopify/jest-dom-mocks'
import { StatusCode } from '@shopify/network'

import verifyRequest from '../verify-request'
import { TEST_COOKIE_NAME, TOP_LEVEL_OAUTH_COOKIE_NAME } from '../../index'

const TEST_WAREHOUSE = 'testwarehouse.my-things-factory.com'

describe('verifyRequest', () => {
  afterEach(fetch.restore)

  describe('when there is an accessToken and warehouse in session', () => {
    it('calls next', async () => {
      const verifyRequestMiddleware = verifyRequest()
      const ctx = createMockContext({
        url: appUrl(TEST_WAREHOUSE),
        session: { accessToken: 'test', warehouse: TEST_WAREHOUSE }
      })
      const next = jest.fn()

      fetch.mock(metaFieldsUrl(TEST_WAREHOUSE), StatusCode.Ok)
      await verifyRequestMiddleware(ctx, next)

      expect(next).toHaveBeenCalled()
    })

    it('calls next when there is no warehouse in the query', async () => {
      const verifyRequestMiddleware = verifyRequest()
      const ctx = createMockContext({
        url: appUrl(),
        session: { accessToken: 'test', warehouse: TEST_WAREHOUSE }
      })
      const next = jest.fn()

      fetch.mock(metaFieldsUrl(TEST_WAREHOUSE), StatusCode.Ok)
      await verifyRequestMiddleware(ctx, next)

      expect(next).toHaveBeenCalled()
    })

    it('clears the top level oauth cookie', () => {
      const verifyRequestMiddleware = verifyRequest()
      const ctx = createMockContext({
        url: appUrl(TEST_WAREHOUSE),
        session: { warehouse: TEST_WAREHOUSE, accessToken: 'test' }
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
        url: appUrl(TEST_WAREHOUSE),
        redirect: jest.fn(),
        session: { accessToken: 'test', warehouse: TEST_WAREHOUSE }
      })

      fetch.mock(metaFieldsUrl(TEST_WAREHOUSE), StatusCode.Unauthorized)
      await verifyRequestMiddleware(ctx, next)

      expect(ctx.redirect).toHaveBeenCalledWith(`${authRoute}?warehouse=${TEST_WAREHOUSE}`)
    })

    it('redirects to the given authRoute if the warehouse in session does not match the one in the query param', async () => {
      const authRoute = '/my-auth-route'

      const verifyRequestMiddleware = verifyRequest({ authRoute })
      const next = jest.fn()
      const ctx = createMockContext({
        url: appUrl(TEST_WAREHOUSE),
        redirect: jest.fn(),
        session: { accessToken: 'test', warehouse: 'some-other-warehouse.com' }
      })

      fetch.mock(metaFieldsUrl(TEST_WAREHOUSE), StatusCode.Ok)
      await verifyRequestMiddleware(ctx, next)

      expect(ctx.redirect).toHaveBeenCalledWith(`${authRoute}?warehouse=${TEST_WAREHOUSE}`)
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

    it('redirects to /auth if warehouse is present on query', () => {
      const warehouse = 'mywarehouse.com'

      const verifyRequestMiddleware = verifyRequest()
      const next = jest.fn()
      const ctx = createMockContext({
        url: appUrl(warehouse),
        redirect: jest.fn()
      })

      verifyRequestMiddleware(ctx, next)

      expect(ctx.redirect).toHaveBeenCalledWith(`/auth?warehouse=${warehouse}`)
    })

    it('redirects to /auth if warehouse is not present on query', () => {
      const verifyRequestMiddleware = verifyRequest()
      const next = jest.fn()
      const ctx = createMockContext({
        url: appUrl(),
        redirect: jest.fn()
      })

      verifyRequestMiddleware(ctx, next)

      expect(ctx.redirect).toHaveBeenCalledWith(`/auth`)
    })

    it('redirects to the given authRoute if warehouse is present on query', () => {
      const warehouse = 'mywarehouse.com'
      const authRoute = '/my-auth-route'

      const verifyRequestMiddleware = verifyRequest({ authRoute })
      const next = jest.fn()
      const ctx = createMockContext({
        url: appUrl(warehouse),
        redirect: jest.fn()
      })

      verifyRequestMiddleware(ctx, next)

      expect(ctx.redirect).toHaveBeenCalledWith(`${authRoute}?warehouse=${warehouse}`)
    })

    it('redirects to the given fallbackRoute if warehouse is not present on query', () => {
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

function metaFieldsUrl(warehouse: string) {
  return `https://${warehouse}/admin/metafields.json`
}

function appUrl(warehouse?: string) {
  return warehouse == null ? '/foo' : `/foo?warehouse=${warehouse}`
}
