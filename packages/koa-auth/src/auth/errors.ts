enum Error {
  SiteParamMissing = 'Expected a valid site query parameter',
  InvalidHmac = 'HMAC validation failed',
  AccessTokenFetchFailure = 'Could not fetch access token',
  NonceMatchFailed = 'Request origin could not be verified'
}

export default Error
