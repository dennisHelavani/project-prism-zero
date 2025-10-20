/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://www.hardhatai.co', // <— set your canonical domain
    generateRobotsTxt: true,
    changefreq: 'weekly',
    priority: 0.7,
    exclude: ['/api/*'], // optional
  };
  