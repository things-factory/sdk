import { Context } from 'koa'

import { NextFunction } from '../types'

import { Routes } from './types'
import { clearSession, redirectToAuth } from './utilities'

export function loginAgainIfDifferentSite(routes: Routes) {
  return async function loginAgainIfDifferentSiteMiddleware(ctx: Context, next: NextFunction) {
    const { query, session } = ctx

    if (session && query.site && session.site !== query.site) {
      clearSession(ctx)
      redirectToAuth(routes, ctx)
      return
    }

    await next()
  }
}
