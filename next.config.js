module.exports = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'vtbetgvmunjai7bh.public.blob.vercel-storage.com',
          port: '',
          pathname: '/*'
        },
        {
          protocol: 'https',
          hostname: 'blob.vercel-storage.com',
          port: '',
          pathname: '/*'
        }
      ],
    },
    async headers() {
      return [
        {
          source: '/api/upload',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: 'https://blob.vercel-storage.com',
            },
            {
              key: 'Access-Control-Allow-Methods',
              value: 'POST, OPTIONS',
            },
            {
              key: 'Access-Control-Allow-Headers',
              value: 'Content-Type, x-vercel-blob-token',
            },
          ],
        },
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: 'https://blob.vercel-storage.com',
            },
          ],
        },
      ];
    },
  }