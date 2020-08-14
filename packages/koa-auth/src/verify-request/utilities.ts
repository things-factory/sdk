import { Context } from 'koa'

import { Routes } from './types'

export function redirectToAuth({ fallbackRoute, authRoute }: Routes, ctx: Context) {
  const {
    query: { site }
  } = ctx

  const routeForRedirect = site == null ? fallbackRoute : `${authRoute}?site=${site}`

  ctx.redirect(routeForRedirect)
}

export function clearSession(ctx: Context) {
  delete ctx.session.site
  delete ctx.session.accessToken
}
