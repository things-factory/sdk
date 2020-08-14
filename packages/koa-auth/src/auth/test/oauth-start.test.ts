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
const site = 'sho-p1.my-things-factory.io'
const badSite = 'site1my-things-factory.io'
const uppercaseSite = 'SHO-P1.my-things-factory.io'
const redirectionURL = `/admin/oauth/authorize`

const baseConfig: OAuthStartOptions = {
  apiKey: 'myapikey',
  scopes: ['write_orders, write_products'],
  accessMode: 'offline',
  myThingsFactoryDomain: 'my-things-factory.io',
  secret: ''
}

describe('OAuthStart', () => {
  it('throws a 400 when no site query parameter is given', () => {
    const oAuthStart = createOAuthStart(baseConfig, callbackPath)
    const ctx = createMockContext({
      url: `https://${baseUrl}`,
      throw: jest.fn()
    })

    oAuthStart(ctx)

    expect(ctx.throw).toHaveBeenCalledWith(400, Error.SiteParamMissing)
  })

  it('throws a 400 when an invalid site query parameter is given', () => {
    const oAuthStart = createOAuthStart(baseConfig, callbackPath)
    const ctx = createMockContext({
      url: `https://${baseUrl}?${query({ badSite })}`,
      throw: jest.fn()
    })

    oAuthStart(ctx)

    expect(ctx.throw).toHaveBeenCalledWith(400, Error.SiteParamMissing)
  })

  it('clears the top-level cookie', () => {
    const oAuthStart = createOAuthStart(baseConfig, callbackPath)
    const ctx = createMockContext({
      url: `https://${baseUrl}?${query({ site })}`
    })

    ;(oAuthQueryString as any).mockReturnValue('abc=123')

    oAuthStart(ctx)

    expect(ctx.cookies.set).toHaveBeenCalledWith('thingsFactoryTopLevelOAuth', '', {})
  })

  it('redirects to redirectionURL with the returned query string', () => {
    const oAuthStart = createOAuthStart(baseConfig, callbackPath)
    const ctx = createMockContext({
      url: `https://${baseUrl}?${query({ site })}`
    })

    ;(oAuthQueryString as any).mockReturnValue('abc=123')

    oAuthStart(ctx)

    expect(oAuthQueryString).toHaveBeenCalledWith(ctx, baseConfig, callbackPath)
    expect(ctx.redirect).toHaveBeenCalledWith(`https://${site}${redirectionURL}?abc=123`)
  })

  it('accepts mixed-case site parameters', () => {
    const oAuthStart = createOAuthStart(baseConfig, callbackPath)
    const ctx = createMockContext({
      url: `https://${baseUrl}?${query({ site: uppercaseSite })}`
    })

    ;(oAuthQueryString as any).mockReturnValueOnce('')

    oAuthStart(ctx)

    expect(ctx.redirect).toHaveBeenCalledWith(`https://${uppercaseSite}${redirectionURL}?`)
  })
})
