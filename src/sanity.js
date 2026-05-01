import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: 'bd6a1e7e',
  dataset: 'production',
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: '2023-05-03', // use current date (YYYY-MM-DD) to target the latest API version
});

// Helper function to build image URLs from Sanity image assets
import imageUrlBuilder from '@sanity/image-url';
const builder = imageUrlBuilder(client);

export function urlFor(source) {
  return builder.image(source);
}
