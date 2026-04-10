import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Zenn OS',
    short_name: 'Zenn OS',
    description: 'The secure internal operating system for Zenn Studios.',
    start_url: '/login',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#b6332e',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
