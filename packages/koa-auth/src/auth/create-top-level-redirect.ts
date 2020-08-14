import querystring from 'querystring'

import { Context } from 'koa'

import redirectionPage from './redirection-page'

export default function createTopLevelRedirect(apiKey: string, path: string) {
  return function topLevelRedirect(ctx: Context) {
    const { host, query } = ctx
    const { site } = query

    const params = { site }
    const queryString = querystring.stringify(params)

    ctx.body = redirectionPage({
      origin: site,
      redirectTo: `https://${host}${path}?${queryString}`,
      apiKey
    })
  }
}
