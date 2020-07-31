# `@things-factory-sdk/koa-auth`

[![Build Status](https://travis-ci.org/things-factory/sdk.svg?branch=master)](https://travis-ci.org/things-factory/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md) [![npm version](https://badge.fury.io/js/%40things-factory-sdk%2Fkoa-auth.svg)](https://badge.fury.io/js/%40things-factory-sdk%2Fkoa-auth)

Features you might know from the express module like the webhook middleware and proxy will be presented as their [own packages instead](https://github.com/things-factory/sdk/blob/master/packages/koa-things-factory-graphql-proxy/README.md).

## Installation

```bash
$ yarn add @things-factory-sdk/koa-auth
```

## Usage

This package exposes `thingsFactoryAuth` by default, and `verifyRequest` as a named export.

```js
import thingsFactoryAuth, { verifyRequest } from '@things-factory-sdk/koa-auth'
```

### thingsFactoryAuth

Returns an authentication middleware taking up (by default) the routes `/auth` and `/auth/callback`.

```js
app.use(
  thingsFactoryAuth({
    // if specified, mounts the routes off of the given path
    // eg. /things-factory/auth, /things-factory/auth/callback
    // defaults to ''
    prefix: '/things-factory',
    // your things-factory app api key
    apiKey: THINGS_FACTORY_API_KEY,
    // your things-factory app secret
    secret: THINGS_FACTORY_SECRET,
    // scopes to request on the merchants store
    scopes: ['write_orders, write_products'],
    // set access mode, default is 'online'
    accessMode: 'offline',
    // callback for when auth is completed
    afterAuth(ctx) {
      const { warehouse, accessToken } = ctx.session

      console.log('We did it!', accessToken)

      ctx.redirect('/')
    }
  })
)
```

#### `/auth`

This route starts the oauth process. It expects a `?warehouse` parameter and will error out if one is not present. To install it in a warehouse just go to `/auth?warehouse=myWarehouseSubdomain`.

### `/auth/callback`

You should never have to manually go here. This route is purely for things-factory to send data back during the oauth process.

### verifyRequest

Returns a middleware to verify requests before letting them further in the chain.

```javascript
app.use(
  verifyRequest({
    // path to redirect to if verification fails
    // defaults to '/auth'
    authRoute: '/foo/auth',
    // path to redirect to if verification fails and there is no warehouse on the query
    // defaults to '/auth'
    fallbackRoute: '/install'
  })
)
```

### Example app

```javascript
import 'isomorphic-fetch'

import Koa from 'koa'
import session from 'koa-session'
import thingsFactoryAuth, { verifyRequest } from '@things-factory-sdk/koa-auth'

const { THINGS_FACTORY_API_KEY, THINGS_FACTORY_SECRET } = process.env

const app = new Koa()
app.keys = [THINGS_FACTORY_SECRET]

app
  // sets up secure session data on each request
  .use(session({ secure: true, sameSite: 'none' }, app))

  // sets up things-factory auth
  .use(
    thingsFactoryAuth({
      apiKey: THINGS_FACTORY_API_KEY,
      secret: THINGS_FACTORY_SECRET,
      scopes: ['write_orders, write_products'],
      afterAuth(ctx) {
        const { warehouse, accessToken } = ctx.session

        console.log('We did it!', accessToken)

        ctx.redirect('/')
      }
    })
  )

  // everything after this point will require authentication
  .use(verifyRequest())

  // application code
  .use(ctx => {
    ctx.body = '🎉'
  })
```

## Gotchas

### Fetch

This app uses `fetch` to make requests against things-factory, and expects you to have it polyfilled. The example app code above includes a call to import it.

### Session

Though you can use `thingsFactoryAuth` without a session middleware configured, `verifyRequest` expects you to have one. If you don't want to use one and have some other solution to persist your credentials, you'll need to build your own verifiction function.
