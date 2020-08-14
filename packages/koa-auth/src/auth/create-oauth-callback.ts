import querystring from 'querystring'

import { Context } from 'koa'

import { AuthConfig } from '../types'

import Error from './errors'
import validateHmac from './validate-hmac'

export default function createOAuthCallback(config: AuthConfig) {
  return async function oAuthCallback(ctx: Context) {
    const { query, cookies } = ctx
    const { code, hmac, site, state: nonce } = query
    const { apiKey, secret, afterAuth } = config

    if (nonce == null || cookies.get('thingsFactoryNonce') !== nonce) {
      ctx.throw(403, Error.NonceMatchFailed)
    }

    if (site == null) {
      ctx.throw(400, Error.SiteParamMissing)
      return
    }

    if (validateHmac(hmac, secret, query) === false) {
      ctx.throw(400, Error.InvalidHmac)
      return
    }

    /* eslint-disable @typescript-eslint/camelcase */
    const accessTokenQuery = querystring.stringify({
      code,
      client_id: apiKey,
      client_secret: secret
    })
    /* eslint-enable @typescript-eslint/camelcase */

    const accessTokenResponse = await fetch(`https://${site}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(accessTokenQuery).toString()
      },
      body: accessTokenQuery
    })

    if (!accessTokenResponse.ok) {
      ctx.throw(401, Error.AccessTokenFetchFailure)
      return
    }

    const accessTokenData = await accessTokenResponse.json()
    const { access_token: accessToken } = accessTokenData

    if (ctx.session) {
      ctx.session.site = site
      ctx.session.accessToken = accessToken
    }

    ctx.state.thingsFactory = {
      site,
      accessToken
    }

    if (afterAuth) {
      await afterAuth(ctx)
    }
  }
}
