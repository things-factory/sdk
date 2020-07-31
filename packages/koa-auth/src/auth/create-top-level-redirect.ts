import querystring from 'querystring'

import { Context } from 'koa'

import redirectionPage from './redirection-page'

export default function createTopLevelRedirect(apiKey: string, path: string) {
  return function topLevelRedirect(ctx: Context) {
    const { host, query } = ctx
    const { warehouse } = query

    const params = { warehouse }
    const queryString = querystring.stringify(params)

    ctx.body = redirectionPage({
      origin: warehouse,
      redirectTo: `https://${host}${path}?${queryString}`,
      apiKey
    })
  }
}
