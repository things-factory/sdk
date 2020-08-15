import { Method, Header } from '@shopify/network'

import { WebhookHeader, Topic } from './types'

export enum ApiVersion {
  July20 = '2020-04',
  Unstable = 'unstable',
  Unversioned = 'unversioned'
}

export interface Options {
  topic: Topic
  address: string
  site: string
  accessToken: string
  apiVersion: ApiVersion
}

export async function registerWebhook({ address, topic, accessToken, site, apiVersion }: Options) {
  const response = await fetch(`https://${site}/admin/api/${apiVersion}/graphql.json`, {
    method: Method.Post,
    body: buildQuery(topic, address),
    headers: {
      [WebhookHeader.AccessToken]: accessToken,
      [Header.ContentType]: 'application/graphql'
    }
  })

  const result = await response.json()

  if (
    result.data &&
    result.data.webhookSubscriptionCreate &&
    result.data.webhookSubscriptionCreate.webhookSubscription
  ) {
    return { success: true, result }
  } else {
    return { success: false, result }
  }
}

function buildQuery(topic: string, callbackUrl: string) {
  return `
    mutation webhookSubscriptionCreate {
      webhookSubscriptionCreate(topic: ${topic}, webhookSubscription: {callbackUrl: "${callbackUrl}"}) {
        userErrors {
          field
          message
        }
        webhookSubscription {
          id
        }
      }
    }
  `
}
