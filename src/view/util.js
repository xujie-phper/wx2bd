'use strict';

const {Parser, DomHandler} = require('stricter-htmlparser2');

// 虚拟根节点名称
module.exports.fakeRoot = Symbol('fake-root');

// 获取parser和handler
module.exports.getHtmlParser = function (options) {
    options = options || {
        xmlMode: false,
        lowerCaseAttributeNames: false,
        recognizeSelfClosing: true,
        lowerCaseTags: false
    };
    const handler = new DomHandler();
    const htmlParser = new Parser(handler, options);
    return {htmlParser, handler};
};
