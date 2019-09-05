const request = require('request-promise');
const chalk = require('chalk');
const packageConfig = require('../../package.json');
const ora = require('ora');

module.exports = function () {

    const spinner = ora(chalk.gray('正在检查版本...')).start();

    return request({
        url: 'http://gitlab.baidu.com/wangpanfe/wx2swan/raw/master/package.json',
        timeout: 2000
    }).then((result) => {
        spinner.stop();
        let latestVersion = JSON.parse(result).version;
        let localVersion = packageConfig.version;

        if (localVersion !== latestVersion) {

            console.log(chalk.gray('  wx2swan新版本可用.'));
            console.log(chalk.gray('  最新版本: ' + latestVersion));
            console.log(chalk.gray('  本地版本: ' + localVersion));
            console.log('  重新安装获得新特性   ')
        }
    })
        .catch(err => {
            console.log(err);
            spinner.stop();
        })
};
