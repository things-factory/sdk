import compose from 'koa-compose'

import { loginAgainIfDifferentWarehouse } from './login-again-if-different-warehouse'
import { verifyToken } from './verify-token'
import { Options, Routes } from './types'

export default function verifyRequest(givenOptions: Options = {}) {
  const routes: Routes = {
    authRoute: '/auth',
    fallbackRoute: '/auth',
    ...givenOptions
  }

  return compose([loginAgainIfDifferentWarehouse(routes), verifyToken(routes)])
}
