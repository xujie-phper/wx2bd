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
      getCookieForSystem().then(swan.request({
        url: 'https://test.com/onLogin',
        data: {
          code: res.code
        }
      }));
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