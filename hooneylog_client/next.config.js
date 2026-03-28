/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  i18n: {
    locales: ['ko'],
    defaultLocale: 'ko',
  },
  images: {
    domains: ['cdn.sanity.io', 'res.cloudinary.com', 's3.us-west-2.amazonaws.com'],
  },
};

module.exports = nextConfig;
