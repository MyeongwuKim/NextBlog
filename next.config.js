/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["imagedelivery.net"],
  },
  reactStrictMode: false,
  // async redirects(data) {

  //   return [
  //     {
  //       source: "/setting",
  //       destination: "/setting/profile",
  //       permanent: false,
  //     },
  //   ];
  // },
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
};

module.exports = nextConfig;
