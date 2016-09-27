const url = require('url');
const promisify = require('es6-promisify');
const co = require('co');
const config = require('../config');
const send = promisify(require('request').get, { multiArgs: true });

module.exports = {
    apiUrl: 'https://api.weixin.qq.com/sns/jscode2session',

    exchange: co.wrap(function *(jscode) {
        try {
            const requestUrl = this._buildUrl(jscode);
            const [response, body] = yield send({ 'url': requestUrl, 'json': true });

            // body: { session_key, expires_in, openid }
            if ('session_key' in body) {
                return { sessionKey: body.session_key, openId: body.openid };
            }

            let error = new Error('jscode failed to exchange session_key');
            error.detail = body;
            throw error;

        } catch (error) {
            throw error;
        }
    }),

    _buildUrl(jscode) {
        return `${this.apiUrl}${url.format({
            query: {
                'appid': config.appId,
                'secret': config.appSecret,
                'js_code': jscode,
                'grant_type': 'authorization_code',
            },
        })}`;
    },
};