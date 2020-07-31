import { Context } from 'koa'

import { NextFunction } from '../types'

import { Routes } from './types'
import { clearSession, redirectToAuth } from './utilities'

export function loginAgainIfDifferentWarehouse(routes: Routes) {
  return async function loginAgainIfDifferentWarehouseMiddleware(ctx: Context, next: NextFunction) {
    const { query, session } = ctx

    if (session && query.warehouse && session.warehouse !== query.warehouse) {
      clearSession(ctx)
      redirectToAuth(routes, ctx)
      return
    }

    await next()
  }
}
