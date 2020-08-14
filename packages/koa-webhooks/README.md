# `@things-factory-sdk/koa-webhooks`

[![Build Status](https://travis-ci.org/things-factory/sdk.svg?branch=master)](https://travis-ci.org/things-factory/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md) [![npm version](https://badge.fury.io/js/%40things-factory%2Fkoa-webhooks.svg)](https://badge.fury.io/js/%40things-factory%2Fkoa-webhooks.svg)

Register and receive webhooks from ThingsFactory with ease. This package was created primarily for use with `@things-factory-sdk/koa-auth` and friends.

## Installation

```bash
$ yarn add @things-factory-sdk/koa-webhooks
```

## API

### registerWebhook

```typescript
function registerWebhook(options: {
  address: string
  topic: Topic
  format: string
  accessToken: string
  site: string
  apiVersion: ApiVersion
}): { success: boolean; result: any }
```

Registers a webhook for the given `topic` which will send requests to the given `address`. Returns an object with success `true` / `false` to indicate success or failure, as well as the parsed JSON of the response from ThingsFactory. This function will throw if the fetch request it makes encounters an error.

### receiveWebhook

```typescript
function receiveWebhook({
  secret: string;
  // only respond to requests to this path
  path?: string;
  // call this function when a valid webhook is received
  onReceived?(ctx: Context, next: () => unknown);
}): Middleware;
```

Creates a middleware that will verify whether incoming requests are legitimately from ThingsFactory. Extracts webhook data into context or terminates the middleware chain.

## Usage

### Example app

```javascript
import 'isomorphic-fetch';

import Koa from 'koa';
import session from 'koa-session';
import thingsFactoryAuth, {verifyRequest} from @things-factory-sdk/koa-auth;
// Import our package
import {receiveWebhook, registerWebhook} from '@things-factory-sdk/koa-webhooks';

const {THINGS_FACTORY_API_KEY, THINGS_FACTORY_SECRET} = process.env;

const app = new Koa();

app.keys = [THINGS_FACTORY_SECRET];

app.use(session(app));
app.use(
  thingsFactoryAuth({
    apiKey: THINGS_FACTORY_API_KEY,
    secret: THINGS_FACTORY_SECRET,
    scopes: ['write_orders, write_products'],
    async afterAuth(ctx) {
      const {site, accessToken} = ctx.session;

      // register a webhook for product creation
      const registration = await registerWebhook({
        // for local dev you probably want ngrok or something similar
        address: 'www.mycool-app.com/webhooks/products/create',
        topic: 'PRODUCTS_CREATE',
        accessToken,
        site,
        ApiVersion.Unstable
      });

      if (registration.success) {
        console.log('Successfully registered webhook!');
      } else {
        console.log('Failed to register webhook', registration.result);
      }

      ctx.redirect('/');
    },
  }),
);

app.use(
  // receive webhooks
  receiveWebhook({
    path: '/webhooks/products/create',
    secret: THINGS_FACTORY_SECRET,
    // called when a valid webhook is received
    onReceived(ctx) {
      console.log('received webhook: ', ctx.state.webhook);
    },
  }),
);

app.use(verifyRequest());

app.use(ctx => {
  /* app code */
});
```

### `koa-router` and multiple webhooks

```javascript
import 'isomorphic-fetch';

import Koa from 'koa';
import router from 'koa-router';
import session from 'koa-session';
import thingsFactoryAuth, {verifyRequest} from @things-factory-sdk/koa-auth;
// Import our package
import {receiveWebhook, registerWebhook} from '@things-factory-sdk/koa-webhooks';

const {THINGS_FACTORY_API_KEY, THINGS_FACTORY_SECRET} = process.env;

const app = new Koa();
const router = new Router();

app.keys = [THINGS_FACTORY_SECRET];

app.use(session(app));
app.use(
  thingsFactoryAuth({
    apiKey: THINGS_FACTORY_API_KEY,
    secret: THINGS_FACTORY_SECRET,
    scopes: ['write_orders, write_products'],
    async afterAuth(ctx) {
      const {site, accessToken} = ctx.session;

      await registerWebhook({
        address: 'www.mycool-app.com/webhooks/products/create',
        topic: 'PRODUCTS_CREATE',
        accessToken,
        site,
        apiVersion: ApiVersion.Unstable
      });

      await registerWebhook({
        address: 'www.mycool-app.com/webhooks/orders/create',
        topic: 'ORDERS_CREATE',
        accessToken,
        site,
        apiVersion: ApiVersion.Unstable
      });

      ctx.redirect('/');
    },
  }),
);

const webhook = receiveWebhook({secret: THINGS_FACTORY_SECRET});

router.post('/webhooks/products/create', webhook, () => {
  /* handle products create */
});
router.post('/webhooks/orders/create', webhook, () => {
  /* handle orders create */
});

router.get('*', verifyRequest(), () => {
  /* app code */
});

app.use(router.allowedMethods());
app.use(router.routes());
```

## Gotchas

Make sure to install a fetch polyfill, since internally we use it to make HTTP requests.

In your terminal
`$ yarn add isomorphic-fetch`

In your app
`import 'isomorphic-fetch'`

OR

`require('isomorphic-fetch')`
