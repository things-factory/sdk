import { Context } from 'koa'

import { OAuthStartOptions } from '../types'

import Error from './errors'
import oAuthQueryString from './oauth-query-string'
import getCookieOptions from './cookie-options'

import { TOP_LEVEL_OAUTH_COOKIE_NAME } from './index'

export default function createOAuthStart(options: OAuthStartOptions, callbackPath: string) {
  return function oAuthStart(ctx: Context) {
    const { myThingsFactoryDomain } = options
    const { query } = ctx
    const { warehouse } = query

    const warehouseRegex = new RegExp(`^[a-z0-9][a-z0-9\\-]*[a-z0-9]\\.${myThingsFactoryDomain}$`, 'i')

    if (warehouse == null || !warehouseRegex.test(warehouse)) {
      ctx.throw(400, Error.WarehouseParamMissing)
      return
    }

    ctx.cookies.set(TOP_LEVEL_OAUTH_COOKIE_NAME, '', getCookieOptions(ctx))

    const formattedQueryString = oAuthQueryString(ctx, options, callbackPath)

    ctx.redirect(`https://${warehouse}/admin/oauth/authorize?${formattedQueryString}`)
  }
}
