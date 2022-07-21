const config = require('./config')
const http_proxy = config.http_proxy || process.env.HTTP_PROXY
module.exports = http_proxy && new HttpsProxyAgent(http_proxy)