import { getCookieForSystem } from "log/login.js";
swan.navigateTo({
  url: '../logs/logs'
}); // test api exist check in logical expression

if (swan.checkIsSupportSoterAuthentication != null && true) {
  console.log(true);
} // test wx as function arg


Object.create(swan, {});
console.log(1, swan); // test UnaryExpression

if (!swan.checkIsSupportSoterAuthentication) {
  console.log(true);
}

if (typeof swan.checkIsSupportSoterAuthentication !== 'function') {
  console.log(true);
}

const swan = {};

for (const key in swan) {
  console.log(`wx${key}:`, swan[key]);
}

while (swan) {
  console.log(`wx${key}:`, swan[key]);
}

swan.login({
  success(res) {
    if (res.code) {
      //发起网络请求
      swan.request({
        url: 'https://test.com/onLogin',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          "Cookie": `BDUSS=${getApp().globalData.bduss};STOKEN=${getApp().globalData.sToken};`
        },
        data: {
          code: res.code
        }
      });
    } else {
      console.log('登录失败！' + res.errMsg);
    }
  }

});
swan.aaa = 111;
swan['bbb'] = 222;
swan[ccc] = 333;
let data = swan.getExtConfigSync();
data = swan.getExtConfigSync().ext;
data = aaa[bbb].getExtConfigSync();
data = swan.getExtConfigSync().extConfig;
swan['test'].call(swan, {
  url: 'test'
});
swan.test(swan.testFn, swan);
swan.navigateToSmartProgram();
import { bdWxLogin } from '@baidu/table/index';
let a = {
  getuserinfo({
    info,
    res
  }) {
    swan.login({
      success() {
        swan.getUserInfo({
          success() {
            getCookieForSystem().then(() => {
              {
                if (info.detail) {
                  app.globalData.userWxInfo = info.detail.userInfo;
                  app.globalData.hasWxAuthor = true;
                  swan.setStorageSync('userWxInfo', info.detail.userInfo);
                  console.log('111: ', app.globalData);
                  swan.relaunch({
                    url: this.data.url || DEFAULT_URL
                  });
                }
              }
            });
          }

        });
      }

    });
  }

};
Component({
  behaviors: ["swan://form-field", "swan://component-export"],
  properties: {
    length: {
      type: Number,
      value: 2
    },
    swanIdForSystem: {
      type: String,
      value: '123456'
    }
  }
});
Component({
  "componentGenerics": {
    "selectable": {
      "default": "path/to/default/component"
    }
  },
  properties: {
    length: {
      type: Number,
      value: 2
    },
    swanIdForSystem: {
      type: String,
      value: '123456'
    }
  }
});