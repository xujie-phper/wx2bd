const glob = require('glob');
const utils = require('./util/index');
const chalk = require('chalk');
const path = require('path');
const {WX2BD} = require('./store/const');

exports.transformCssContent = function transformCssContent(content) {
    // 无请求头的css静态资源url添加https请求头
    content = utils.transformCssStaticUrl(content);
    return content.replace(/\.wxss/ig, '.css');
};

exports.transformCss = async function transformCss(form) {
    const files = await new Promise(resolve => {
        let filePath = form.dist;
        const ext = (form.type === WX2BD ? 'css' : 'wxss');
        // 添加支持单一文件入口逻辑
        if (utils.isDirectory(filePath)) {
            filePath = filePath + '/**/*.' + ext;
        }
        const extname = path.extname(filePath);
        if (extname === '.' + ext) {
            glob(filePath, function (err, files) {
                resolve(err ? [] : files);
            });
        } else {
            resolve([]);
        }
    });
    let content;
    for (let i = 0; i < files.length; i++) {
        content = await utils.getContent(files[i]);
        content = exports.transformCssContent(content);
        await utils.saveFile(files[i], content);
    }
    console.log(chalk.cyan('🎉    Successfully wxss'));
};
