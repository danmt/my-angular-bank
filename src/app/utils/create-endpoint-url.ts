export function createEndpointUrl(shyftApiKey: string) {
  const url = new URL('https://rpc.shyft.to');

  url.searchParams.set('api_key', shyftApiKey);

  return url.toString();
}
