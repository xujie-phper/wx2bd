/**
 * @file wxml convert swan
 */

const path = require('path');
const co = require('co');
const chalk = require('chalk');
const json = require('./src/config/index');
const api = require('./src/api');
const wxs = require('./src/wxs');
const view = require('./src/view/index');
const css = require('./src/css');
const utils = require('./src/util/index');
const logStore = require('./src/store/log');

module.exports = async function wxmp2swan(pathObj, cb) {
    // 指定转换目录
    pathObj.dist = pathObj.dist || getDefaultDist(pathObj.src);
    let defultLog = pathObj.dist || pathObj.src;
    // dist为文件路径时默认日志目录为此文件目录
    if (!utils.isDirectory(defultLog)) {
        defultLog = path.dirname(defultLog);
    }
    pathObj.log = pathObj.log || defultLog;
    if (pathObj.type === 'u-design') {
        pathObj.isDesgin = true;
    }
    //TODO 目前只支持微信转百度
    const context = {
        ...pathObj,
        logs: [],
        // 可以放一些全局共享的数据
        data: {}
    };

    try{
        console.log(chalk.green('🎉    Transforming  ...'));
        await utils.copyProject(pathObj.src, pathObj.dist, pathObj.type);
        await json.transformConfig(context);
        await api.transformApi(context,pathObj.log);
        await wxs.transformWxs(context);
        await view.transformView(context);
        await css.transformCss(context);
        await utils.createWx2swaninfo(pathObj.dist);

        logStore.saveLog(pathObj.log);
        cb && cb(null);
        console.log(chalk.green('🎉    Ok, check transform log in ')
            + chalk.blue.underline.bold('log.json')
        );
    }catch(e){
        cb && cb(e);
        console.log(chalk.red('🚀    run error: ', e));
    }
};

function getDefaultDist(dist) {
    let res = '';
    if (utils.isDirectory(dist)) {
        res = path.join(path.dirname(dist), path.basename(dist) + '-swan');
    } else {
        res = path.join(path.dirname(dist) + '-swan', path.basename(dist));
    }
    return res;
}
