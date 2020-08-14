import compose from 'koa-compose'

import { loginAgainIfDifferentSite } from './login-again-if-different-site'
import { verifyToken } from './verify-token'
import { Options, Routes } from './types'

export default function verifyRequest(givenOptions: Options = {}) {
  const routes: Routes = {
    authRoute: '/auth',
    fallbackRoute: '/auth',
    ...givenOptions
  }

  return compose([loginAgainIfDifferentSite(routes), verifyToken(routes)])
}
