/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://melihtakyaci.com',
  generateRobotsTxt: false, // robots.txt'yi kendimiz yazdık
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  // The archived site under /old is served with noindex. Listing it here would
  // ask crawlers to fetch a page that then tells them to go away.
  exclude: ['/old', '/old/*'],
};