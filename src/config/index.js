/**
 * @file transform json
 */

'use strict';

const _ = require('lodash');
const glob = require('glob');
const chalk = require('chalk');
const detectIntent = require('detect-indent');

const utils = require('../util/index');
const componentConf = require('../../config/wxmp2swan/component');
const logStore = require('../store/log');
const path = require('path');
let contextStore = require('../store/context.js');


/**
 * 转换一个JSON文件
 *
 * @param {string} path 文件路径
 * @param {string} contents 文件内容
 * @return {Promise.<VFile>}
 */
module.exports.transform = function (path, contents) {
    const vfile = utils.toVFile(path, contents);
    const indent = detectIntent(contents).indent || '  ';
    let json = {};
    try {
        json = JSON.parse(contents);
    }
    catch (err) {
        vfile.message('Invalid config file');
    }

    // 处理自定义组件log
    componentLog(json, path);

    let isComponentNameTransformed = false;
    const componentRenameMap = {};
    if (json.usingComponents) {
        // 为了保留原始的usingComponents中组件定义顺序
        const newUsingComponents = {};
        Object.keys(json.usingComponents).forEach(
            name => {
                if (/[A-Z_]/.test(name)) {
                    isComponentNameTransformed = true;

                    const newName = _.kebabCase(name);
                    componentRenameMap[name] = newName;
                    newUsingComponents[newName] = json.usingComponents[name];
                }
                else {
                    newUsingComponents[name] = json.usingComponents[name];
                }
            }
        );
        json.usingComponents = newUsingComponents;
    }

    if (isComponentNameTransformed) {
        vfile.data.isComponentNameTransformed = true;
        vfile.data.componentRenameMap = componentRenameMap;
        vfile.contents = JSON.stringify(json, null, indent);
    }
    return Promise.resolve(vfile);
};

/**
 * 转换配置
 *
 * @param {Object} context 转换上下文
 */
module.exports.transformConfig = function* transformConfig(context) {
    const files = yield new Promise(resolve => {
        let filePath = context.dist;
        // 添加支持单一文件入口逻辑
        if (utils.isDirectory(filePath)) {
            filePath = filePath + '/**/*.json';
        }
        const extname = path.extname(filePath);
        if (extname === '.json') {
            glob(filePath, function (err, res) {
                resolve(err ? [] : res);
            });
        } else {
            resolve([]);
        }
    });

    for (let i = 0; i < files.length; i++) {
        const content = yield utils.getContent(files[i]);
        const result = yield exports.transform(files[i], content);
        yield utils.saveFile(files[i], String(result));

        // 把重命名信息放到contextStore中
        const {isComponentNameTransformed, componentRenameMap} = result.data;
        if (isComponentNameTransformed) {
            let renamedComponents = contextStore.renamedComponents || {};
            contextStore.dispatch({
                action: 'renamedComponents',
                payload: {
                    ...(renamedComponents || {}),
                    [files[i]]: componentRenameMap
                }
            });
        }
    }
    console.log(chalk.cyan('🎉    Successfully config'));
};

/**
 * 自定义组件中不支持的属性打印error日志
 *
 * @param {string} json 自定义组件json配置
 * @param {string} path 文件路径
 */
function componentLog(json, path) {
    // 处理自定义组件json中不支持的属性
    Object.keys(componentConf.json).forEach(attr => {
        const confValue = componentConf.json[attr];
        if (confValue === null && json[attr]) {
            logStore.dispatch({
                action: 'error',
                payload: {
                    type: 'Compsonent json',
                    file: path,
                    message: `自定义组件---json[${attr}]: ${'不支持的属性'}`
                }
            })
        }
    });
}
