import { Context } from 'koa'

import { Routes } from './types'

export function redirectToAuth({ fallbackRoute, authRoute }: Routes, ctx: Context) {
  const {
    query: { warehouse }
  } = ctx

  const routeForRedirect = warehouse == null ? fallbackRoute : `${authRoute}?warehouse=${warehouse}`

  ctx.redirect(routeForRedirect)
}

export function clearSession(ctx: Context) {
  delete ctx.session.warehouse
  delete ctx.session.accessToken
}
