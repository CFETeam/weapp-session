const co = require('co');
const redis = require('redis');
const promisify = require('es6-promisify');

module.exports = (redisConfig = {}, targetStore = {}) => {
    const client = redis.createClient(redisConfig);

    const get = promisify(client.get.bind(client));
    const set = promisify(client.set.bind(client));
    const setex = promisify(client.setex.bind(client));
    const del = promisify(client.del.bind(client));

    // authentication
    client.auth(redisConfig.password);

    return Object.assign(targetStore, {
        get: co.wrap(function *(key) {
            return JSON.parse(yield get(key));
        }),

        set: co.wrap(function *(key, val, lifetime = 0) {
            if (lifetime > 0) {
                yield setex(key, lifetime, JSON.stringify(val));
            } else {
                yield set(key, JSON.stringify(val));
            }
        }),

        del: co.wrap(function *(key) {
            yield del(key);
        }),
    });
};