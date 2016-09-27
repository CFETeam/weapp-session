微信小程序会话管理中间件
======================

微信的网络请求接口 `wx.request()` 没有携带 Cookies，这让传统基于 Cookies 实现的会话管理不再适用。为了让处理微信小程序的服务能够识别会话，我们推出了 `weapp-session`。

`weapp-session` 使用自定义 Header 来传递微信小程序内用户信息，在服务内可以直接获取用户在微信的身份。

会话层使用 `Redis` 作为缓存管理，具有高效可靠的特点。

> 广告：推荐使用[腾讯云 Redis 服务](https://www.qcloud.com/product/crs.html)

## 安装

```
npm install weapp-session
```

## 使用

```js
const express = require('express');
const weappSession = require('weapp-session');

const app = express();

app.use(weappSession({
    appId: '',      // 微信小程序 APP ID
    appSecret: '',  // 微信小程序 APP Secret

    // REDIS 配置
    // @see https://www.npmjs.com/package/redis#options-object-properties
    redisConfig: {
        host: '',
        port: '',
        password: ''
    },

    // （可选）指定在哪些情况下不使用 weapp-session 处理
    ignore(req, res) {
        return /^\/static\//.test(req.url);
    }
}));

app.use((req, res) => {
    res.json({
        // 在 req 里可以直接取到微信用户信息
        wxUserInfo: req.$wxUserInfo
    });
});

// 其它业务代码
// ...

app.listen(3000);

```

## 客户端

在微信小程序内需要使用[客户端](https://github.com/CFETeam/weapp-session-client)配合，方能和服务器建立会话管理。

## LICENSE

[MIT](LICENSE)