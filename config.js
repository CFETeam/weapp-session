module.exports = {
    appId: '',
    appSecret: '',

    redisConfig: {
        host: '127.0.0.1',
        port: '6379',
        password: '',
        db: 0,
        prefix: 'weapp-session:',
        detect_buffers: true,
        ttl: 7200,
    },

    ignoreSignature: false,
    ignore: () => false,
};