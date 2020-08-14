import proxy from 'koa-better-http-proxy'
import { Context } from 'koa'

export const PROXY_BASE_PATH = '/graphql'
export const GRAPHQL_PATH_PREFIX = '/admin/api'

export enum ApiVersion {
  July19 = '2019-07',
  October19 = '2019-10',
  January20 = '2020-01',
  April20 = '2020-04',
  July20 = '2020-07',
  Unstable = 'unstable',
  Unversioned = 'unversioned'
}

interface DefaultProxyOptions {
  version: ApiVersion
}

interface PrivateSiteOption extends DefaultProxyOptions {
  password: string
  site: string
}

type ProxyOptions = PrivateSiteOption | DefaultProxyOptions

export default function thingsFactoryGraphQLProxy(proxyOptions: ProxyOptions) {
  return async function thingsFactoryGraphQLProxyMiddleware(ctx: Context, next: () => Promise<any>) {
    const { session = {} } = ctx

    const site = 'site' in proxyOptions ? proxyOptions.site : session.site
    const accessToken = 'password' in proxyOptions ? proxyOptions.password : session.accessToken
    const version = proxyOptions.version

    if (ctx.path !== PROXY_BASE_PATH || ctx.method !== 'POST') {
      await next()
      return
    }

    if (accessToken == null || site == null) {
      ctx.throw(403, 'Unauthorized')
      return
    }

    await proxy(site, {
      https: true,
      parseReqBody: false,
      // Setting request header here, not response. That's why we don't use ctx.set()
      // proxy middleware will grab this request header
      headers: {
        'Content-Type': 'application/json',
        'X-ThingsFactory-Access-Token': accessToken
      },
      proxyReqPathResolver() {
        return `${GRAPHQL_PATH_PREFIX}/${version}/graphql.json`
      }
    })(
      ctx,

      /*
        We want this middleware to terminate, not fall through to the next in the chain,
        but sadly it doesn't support not passing a `next` function. To get around this we
        just pass our own dummy `next` that resolves immediately.
      */
      noop
    )
  }
}

async function noop() {}
