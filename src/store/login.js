/**
 * @file 替换登录流程
 * @author xujie
 */

let bduss = new Promise((resolve, reject) => {
    swan.getBDUSS({
        success: function (res) {
            getApp().globalData.bduss = res.bduss;
            resolve(res.bduss);
        },
        fail: function (err) {
            console.log('错误码：' + err.errCode);
            console.log('错误信息：' + err.errMsg);
            reject(err);
        }
    });
});
let sToken = new Promise((resolve, reject) => {
    swan.getStoken({
        tpl: 'netdisk',
        success: function (res) {
            getApp().globalData.sToken = res.stoken;
            resolve(res.stoken);
        },
        fail: function (err) {
            console.log('错误码：' + err.errCode);
            console.log('错误信息：' + err.errMsg);
            reject(err);
        }
    });
});

function getCookie() {
    return new Promise((resolve, reject) => {
        if (getApp().globalData.bduss && getApp().globalData.sToken) {
            resolve(`BDUSS=${getApp().globalData.bduss};STOKEN=${getApp().globalData.sToken};`);
            return;
        }
        Promise.all([bduss, sToken]).then(([bduss, sToken]) => {
            resolve(`BDUSS=${bduss};STOKEN=${sToken};`);
        }).catch((err) => {
            reject(err);
        });
    });

}

module.exports = {
    getCookie: getCookie
};
