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
const {WX2BD} = require('./store/const');

exports.transformWxs = async function transformApi(context) {
    // 过滤js文件
    const files = await new Promise(resolve => {
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
    const prefix = context.type === WX2BD ? 'wx' : '';
    // 用于转换context
    const transformedCtx = api.ctx;
    let content;
    // 遍历文件进行转换
    for (let i = 0; i < files.length; i++) {
        content = await utils.getContent(files[i]);
        // const code = transformApiContent(content, api, prefix, transformedCtx, files[i]);
        const code = content.replace(/module.exports[\s]+=/, 'export default');
        await utils.saveFile(files[i], code);
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
