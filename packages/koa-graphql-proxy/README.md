# `@things-factory-sdk/koa-graphql-proxy`

[![Build Status](https://travis-ci.org/things-factory/sdk.svg?branch=master)](https://travis-ci.org/things-factory/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md) [![npm version](https://badge.fury.io/js/%40things-factory%2Fkoa-graphql-proxy.svg)](https://badge.fury.io/js/%4things-factory%2Fkoa-graphql-proxy)

A wrapper around `koa-better-http-proxy` which allows easy proxying of GraphQL requests from an embedded ThingsFactory app.

## Installation

```bash
$ yarn add @things-factory-sdk/koa-graphql-proxy
```

## Usage

The module exports a proxy middleware as its default export. It expects that you have other middleware set up (such as [koa-auth](https://github.com/things-factory/sdk/tree/master/packages/koa-auth)) to authenticate requests with ThingsFactory, and have session data stored on `ctx.session`.

### Basic

Attaching the middleware will proxy any requests sent to `/graphql` on your app to the current logged-in warehouse found in session.

```javascript
// server/index.js
import koa from 'koa'
import session from 'koa-session'
import createThingsFactoryAuth from @things-factory-sdk/koa-auth
import proxy, { ApiVersion } from '@things-factory-sdk/koa-graphql-proxy'

const app = koa()

app.use(session())

app.use(
  createThingsFactoryAuth({
    /* your config here */
  })
)

app.use(proxy({ version: ApiVersion.Unstable }))
```

This allows client-side scripts to query a logged-in merchant's warehouse without needing to know the user's access token.

```javascript
fetch('/graphql', { credentials: 'include', body: mySerializedGraphQL })
```

### Custom path

If you have your own `/graphql` route and don't want to clobber it, you can use a library like (`koa-mount`)[https://github.com/koajs/mount] to namespace the middleware.

```javascript
// server/index
import mount from 'koa-mount';

//....

app.use(mount('/things-factory', proxy({version: ApiVersion.Unstable}));
```

```javascript
// client/some-component.js
fetch('/things-factory/graphql', { credentials: 'include', body: mySerializedGraphQL })
```
