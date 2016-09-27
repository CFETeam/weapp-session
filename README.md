微信小程序会话管理中间件
======================

微信的网络请求接口 `wx.request()` 没有携带 Cookies，这让传统基于 Cookies 实现的会话管理不再适用。为了让处理微信小程序的服务能够识别会话，我们推出了 [weapp-session](https://github.com/CFETeam/weapp-session)。

[weapp-session](https://github.com/CFETeam/weapp-session) 使用自定义 Header 来传递微信小程序内用户信息，在服务内可以直接获取用户在微信的身份。

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

## 实现

会话层的实现和传统 Cookie 的实现方式类似，都是在 Header 上使用特殊的字段跟踪。一个请求的完整流程如下：

![请求生命周期](assets/request-lifecycle.png)

1. 客户端（微信小程序）发起请求 `request`
2. [weapp-session-client](https://github.com/CFETeam/weapp-session-client) 包装 `request`
    * 首次请求
        - 调用 `wx.login()` 和 `wx.getUserInfo()` 接口获得 `code`、`rawData` 和 `signature`
        - `requset` 的头部带上 `code`、`rawData` 和 `signature`
        - 保存 `code` 供下次调用
    * 非首次请求
        - `request` 的头部带上保存的 `code`
3. 服务器收到请求 `request`，中间件从头部提取 `code`、`rawData` 和 `signature` 字段
    * 如果 `code` 为空，跳到第 `4` 步
    * 如果 `code` 不为空，且 `rawData` 不为空，需要进行签名校验
        + 使用 `code`，`appid`、`app_secret` 请求微信接口获得 `session_key` 和 `openid`
            - 如果接口失败，响应 `ERR_SESSION_KEY_EXCHANGE_FAILED`
        + 使用签名算法通过 `rawData` 和 `session_key` 计算签名 `signature2`
        + 对比 `signature` 和 `signature2`
            - 签名一致，解析 `rawData` 为 `wxUserInfo`
                * 把 `openid` 写入到 `wxUserInfo`
                * 把 `(code, wxUserInfo)` 缓存到 Redis
                * 把 `wxUserInfo` 存放在 `request.$wxUserInfo` 里
                * 跳到第 `4` 步
            - 签名不一致，响应 `ERR_UNTRUSTED_RAW_DATA`
    * 如果 `code` 不为空，但 `rawData` 为空，从 Redis 根据 `code` 查询缓存的用户信息
        - 找到用户信息，存放在 `request.$wxUserInfo` 字段里，跳到第 `4` 步
        - 没找到用户信息（可能是过期），响应 `ERR_SESSION_EXPIRED`
4. `request` 被业务处理，可以使用 `request.$wxUserInfo` 来获取用户信息（`request.$wxUserInfo` 可能为空，业务需要自行处理）

## LICENSE

[MIT](LICENSE)