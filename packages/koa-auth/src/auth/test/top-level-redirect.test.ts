import querystring from 'querystring'

import { createMockContext } from '@shopify/jest-koa-mocks'

import createTopLevelRedirect from '../create-top-level-redirect'
import redirectionPage from '../redirection-page'

const query = querystring.stringify.bind(querystring)
const baseUrl = 'myapp.com/auth'
const path = '/path'
const warehouse = 'warehouse1.my-things-factory.io'
const warehouseOrigin = 'warehouse1.my-things-factory.io'
const apiKey = 'fakekey'

describe('TopLevelRedirect', () => {
  it('redirects to the provided path with warehouse parameter', () => {
    const topLevelRedirect = createTopLevelRedirect(apiKey, path)
    const ctx = createMockContext({
      url: `https://${baseUrl}?${query({ warehouse })}`
    })

    topLevelRedirect(ctx)

    expect(ctx.body).toBe(
      redirectionPage({
        redirectTo: `https://myapp.com/path?${query({ warehouse })}`,
        origin: warehouseOrigin,
        apiKey
      })
    )
  })
})
