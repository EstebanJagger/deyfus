const COMMONS_API_URL = 'https://commons.wikimedia.org/w/api.php';
const USER_AGENT = 'DeyfusInventory/1.0 (https://github.com/EstebanJagger/deyfus)';

function plainText(value = '') {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function searchCommons(query) {
  const url = new URL(COMMONS_API_URL);
  url.searchParams.set('action', 'query');
  url.searchParams.set('generator', 'search');
  url.searchParams.set('gsrsearch', `filetype:bitmap ${query}`);
  url.searchParams.set('gsrnamespace', '6');
  url.searchParams.set('gsrlimit', '5');
  url.searchParams.set('prop', 'imageinfo');
  url.searchParams.set('iiprop', 'url|extmetadata');
  url.searchParams.set('iiurlwidth', '800');
  url.searchParams.set('format', 'json');
  url.searchParams.set('formatversion', '2');
  url.searchParams.set('maxlag', '5');

  const response = await fetch(url, {
    headers: {
      'Api-User-Agent': USER_AGENT,
      'User-Agent': USER_AGENT
    },
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(`Wikimedia Commons respondió con estado ${response.status}.`);
  }

  const result = await response.json();
  for (const page of result.query?.pages ?? []) {
    const info = page.imageinfo?.[0];
    const metadata = info?.extmetadata;
    const license = metadata?.LicenseShortName?.value;
    const licenseUrl = metadata?.LicenseUrl?.value;
    if (!info?.thumburl || !info.descriptionurl || !license || !licenseUrl) continue;

    return {
      imageUrl: info.thumburl,
      imageCredit: plainText(metadata.Artist?.value) || 'Contribuidor de Wikimedia Commons',
      imageSourceUrl: info.descriptionurl,
      imageLicense: plainText(license),
      imageLicenseUrl: licenseUrl
    };
  }

  return null;
}

export async function findProductImage(product) {
  const name = plainText(product.name);
  const brand = plainText(product.brand ?? '');
  const queries = [
    [brand, name, 'shoe'].filter(Boolean).join(' '),
    [brand, 'shoe'].filter(Boolean).join(' '),
    'sneakers shoes'
  ];

  for (const query of [...new Set(queries)]) {
    const image = await searchCommons(query);
    if (image) return image;
  }

  return null;
}
