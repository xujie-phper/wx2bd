/**
 * @file swan convert wx
 */
const tips = '是个二级API，目前wx还不支持，so sad(ノへ￣、)，需要棒棒的你手动兼容下它和它返回值的api哦 ╮（﹀_﹀）╭ ';
/**
 *  action--操作-可选值:tip(提示)、mapping(函数替换)、delete(函数删除)
 *  logLevel--日志级别可选值:info、warning、error
 *  message--日志消息
 *  mapping--替换后的函数名
 */
const defaultConf = {
    action: 'tip',
    logLevel: 'warning',
    mapping: '',
    message: ''
};
const defaultDeleteConf = {
    action: 'delete',
    logLevel: 'error',
    message: '没有相对应的函数'
};
module.exports = {
    ctx: {
        swan: 'wx'
    },
    wx: {
        navigateToSmartProgram: {
            action: 'mapping',
            logLevel: 'info',
            mapping: 'navigateToMiniProgram',
            message: '方法被替换为navigateToMiniProgram'
        },
        navigateBackSmartProgram: {
            action: 'mapping',
            logLevel: 'info',
            mapping: 'navigateBackMiniProgram',
            message: '方法被替换为navigateBackMiniProgram'
        },
        requestPolymerPayment: {
            action: 'tip',
            logLevel: 'error',
            message: '存在diff的函数，微信小程序中需使用requestPayment替代 \n      相关文档：https://pay.weixin.qq.com/wiki/doc/api/wxa/wxa_api.php?chapter=7_3&index=1'
        },
        login: {
            ...defaultConf,
            message: '百度小程序中为code换取access_token，微信登录接口code换取openid和session_key \n      相关文档：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html'
        }
    }
};
