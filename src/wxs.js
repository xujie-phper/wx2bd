const glob = require('glob');
const parser = require("@babel/parser");
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const utils = require('./util/index');
const chalk = require('chalk');
const path = require('path');
const t = require('babel-types');
const logStore = require('./store/log');
const contextStore = require('./store/context');

exports.transformWxs = function* transformApi(context) {
    // 过滤js文件
    const files = yield new Promise(resolve => {
        let filePath = context.dist;
        // 添加支持单一文件入口逻辑
        if (utils.isDirectory(filePath)) {
            filePath = filePath + '/**/*.filter.js';
        }
        const extname = path.extname(filePath);
        if (extname === '.js') {
            glob(filePath, {ignore: '**/node_modules/**/*.js'}, function (err, res) {
                resolve(err ? [] : res);
            });
        } else {
            resolve([]);
        }
    });
    const api = require('../config/' + context.type + '/api');
    const prefix = context.type === 'wxmp2swan' ? 'wx' : '';
    // 用于转换context
    const transformedCtx = api.ctx;
    let content;
    // 遍历文件进行转换
    for (let i = 0; i < files.length; i++) {
        content = yield utils.getContent(files[i]);
        const code = transformApiContent(content, api, prefix, transformedCtx, files[i]);
        yield utils.saveFile(files[i], code);
    }
    console.log(chalk.cyan('🎉    Successfully wxs'));
};

function transformWxsContent(content, api, prefix, transformedCtx, file) {
    const result = parser.parse(content, {
        sourceType: 'module',
        plugins: []
    });

    traverse(result, {
        //TODO 替换WXS逻辑
    });

    const generateResult = generate(result, {});
    return generateResult.code;
}
