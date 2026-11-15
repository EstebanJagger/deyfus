const PEXELS_SEARCH_URL = 'https://api.pexels.com/v1/search';

export async function findProductImage(product) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    throw new Error('PEXELS_API_KEY no está configurada en el servidor.');
  }

  const terms = [product.brand, product.name, 'shoes'].filter(Boolean).join(' ');
  const url = new URL(PEXELS_SEARCH_URL);
  url.searchParams.set('query', terms);
  url.searchParams.set('per_page', '1');
  url.searchParams.set('orientation', 'square');

  const response = await fetch(url, {
    headers: { Authorization: apiKey },
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(`Pexels respondió con estado ${response.status}.`);
  }

  const result = await response.json();
  const photo = result.photos?.[0];
  if (!photo?.src?.large || !photo?.url || !photo?.photographer) return null;

  return {
    imageUrl: photo.src.large,
    imageCredit: photo.photographer,
    imageSourceUrl: photo.url
  };
}
