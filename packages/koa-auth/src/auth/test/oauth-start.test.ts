import querystring from 'querystring'

import { createMockContext } from '@shopify/jest-koa-mocks'

import createOAuthStart from '../create-oauth-start'
import Error from '../errors'
import { OAuthStartOptions } from '../../types'
import oAuthQueryString from '../oauth-query-string'

jest.mock('../oauth-query-string', () => ({
  default: jest.fn(),
  __esModule: true
}))

const query = querystring.stringify.bind(querystring)
const baseUrl = 'myapp.com/auth'
const callbackPath = '/callback'
const warehouse = 'sho-p1.my-things-factory.io'
const badWarehouse = 'warehouse1my-things-factory.io'
const uppercaseWarehouse = 'SHO-P1.my-things-factory.io'
const redirectionURL = `/admin/oauth/authorize`

const baseConfig: OAuthStartOptions = {
  apiKey: 'myapikey',
  scopes: ['write_orders, write_products'],
  accessMode: 'offline',
  myThingsFactoryDomain: 'my-things-factory.io',
  secret: ''
}

describe('OAuthStart', () => {
  it('throws a 400 when no warehouse query parameter is given', () => {
    const oAuthStart = createOAuthStart(baseConfig, callbackPath)
    const ctx = createMockContext({
      url: `https://${baseUrl}`,
      throw: jest.fn()
    })

    oAuthStart(ctx)

    expect(ctx.throw).toHaveBeenCalledWith(400, Error.WarehouseParamMissing)
  })

  it('throws a 400 when an invalid warehouse query parameter is given', () => {
    const oAuthStart = createOAuthStart(baseConfig, callbackPath)
    const ctx = createMockContext({
      url: `https://${baseUrl}?${query({ badWarehouse })}`,
      throw: jest.fn()
    })

    oAuthStart(ctx)

    expect(ctx.throw).toHaveBeenCalledWith(400, Error.WarehouseParamMissing)
  })

  it('clears the top-level cookie', () => {
    const oAuthStart = createOAuthStart(baseConfig, callbackPath)
    const ctx = createMockContext({
      url: `https://${baseUrl}?${query({ warehouse })}`
    })

    ;(oAuthQueryString as any).mockReturnValue('abc=123')

    oAuthStart(ctx)

    expect(ctx.cookies.set).toHaveBeenCalledWith('thingsFactoryTopLevelOAuth', '', {})
  })

  it('redirects to redirectionURL with the returned query string', () => {
    const oAuthStart = createOAuthStart(baseConfig, callbackPath)
    const ctx = createMockContext({
      url: `https://${baseUrl}?${query({ warehouse })}`
    })

    ;(oAuthQueryString as any).mockReturnValue('abc=123')

    oAuthStart(ctx)

    expect(oAuthQueryString).toHaveBeenCalledWith(ctx, baseConfig, callbackPath)
    expect(ctx.redirect).toHaveBeenCalledWith(`https://${warehouse}${redirectionURL}?abc=123`)
  })

  it('accepts mixed-case warehouse parameters', () => {
    const oAuthStart = createOAuthStart(baseConfig, callbackPath)
    const ctx = createMockContext({
      url: `https://${baseUrl}?${query({ warehouse: uppercaseWarehouse })}`
    })

    ;(oAuthQueryString as any).mockReturnValueOnce('')

    oAuthStart(ctx)

    expect(ctx.redirect).toHaveBeenCalledWith(`https://${uppercaseWarehouse}${redirectionURL}?`)
  })
})
