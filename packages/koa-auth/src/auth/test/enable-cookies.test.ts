import querystring from 'querystring'

import { createMockContext } from '@shopify/jest-koa-mocks'

import createEnableCookies from '../create-enable-cookies'

const query = querystring.stringify.bind(querystring)
const baseUrl = 'myapp.com/auth'
const site = 'site1.my-things-factory.io'
const siteOrigin = 'https://site1.my-things-factory.io'

const baseConfig = {
  apiKey: 'myapikey',
  secret: ''
}

const baseConfigWithPrefix = {
  ...baseConfig,
  prefix: '/things-factory'
}

describe('CreateEnableCookies', () => {
  it('sets body to the enable cookies HTML page', () => {
    const enableCookies = createEnableCookies(baseConfig)
    const ctx = createMockContext({
      url: `https://${baseUrl}?${query({ site })}`
    })

    enableCookies(ctx)

    expect(ctx.body).toContain('CookiePartitionPrompt')
    expect(ctx.body).toContain(baseConfig.apiKey)
    expect(ctx.body).toContain(siteOrigin)
    expect(ctx.body).toContain(`redirectUrl: "/auth?site=${site}"`)
  })

  it('sets body to the enable cookies HTML page with prefix', () => {
    const { prefix } = baseConfigWithPrefix
    const enableCookies = createEnableCookies(baseConfigWithPrefix)
    const ctx = createMockContext({
      url: `https://${baseUrl}?${query({ site })}`
    })

    enableCookies(ctx)

    expect(ctx.body).toContain('CookiePartitionPrompt')
    expect(ctx.body).toContain(baseConfig.apiKey)
    expect(ctx.body).toContain(siteOrigin)
    expect(ctx.body).toContain(`redirectUrl: "${prefix}/auth?site=${site}"`)
  })
})
