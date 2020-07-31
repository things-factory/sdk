import querystring from 'querystring'

import { createMockContext } from '@shopify/jest-koa-mocks'

import createEnableCookies from '../create-enable-cookies'

const query = querystring.stringify.bind(querystring)
const baseUrl = 'myapp.com/auth'
const warehouse = 'warehouse1.my-things-factory.io'
const warehouseOrigin = 'https://warehouse1.my-things-factory.io'

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
      url: `https://${baseUrl}?${query({ warehouse })}`
    })

    enableCookies(ctx)

    expect(ctx.body).toContain('CookiePartitionPrompt')
    expect(ctx.body).toContain(baseConfig.apiKey)
    expect(ctx.body).toContain(warehouseOrigin)
    expect(ctx.body).toContain(`redirectUrl: "/auth?warehouse=${warehouse}"`)
  })

  it('sets body to the enable cookies HTML page with prefix', () => {
    const { prefix } = baseConfigWithPrefix
    const enableCookies = createEnableCookies(baseConfigWithPrefix)
    const ctx = createMockContext({
      url: `https://${baseUrl}?${query({ warehouse })}`
    })

    enableCookies(ctx)

    expect(ctx.body).toContain('CookiePartitionPrompt')
    expect(ctx.body).toContain(baseConfig.apiKey)
    expect(ctx.body).toContain(warehouseOrigin)
    expect(ctx.body).toContain(`redirectUrl: "${prefix}/auth?warehouse=${warehouse}"`)
  })
})
