#!/usr/bin/env node

const inquirer = require('inquirer');
const program = require('commander');
const chalk = require('chalk');
const path = require('path');
const figlet = require('figlet');
const checkVersion = require('../src/util/checkVersion.js');
const package = require(path.resolve(__dirname, '../package.json'));
const homedir = require('os').homedir();
const execSync = require('child_process').execSync;
const wxmp2swan = require('../index');
const argv = require('minimist')(process.argv.slice(2));
const installConfig = require('../src/config/installConfig');
const nowPath = process.cwd();
const {WX2BD} = require('../src/store/const');

program
    .version(package.version)
    .usage('[options]')
    .option('-c, --clean', '清除缓存')
    .on('--help', printHelp)
    .parse(process.argv);

switch (true) {
    case program.clean:
        cleanCache();
        break;
    default:
        break;
}
if (argv._.length < 1) {
    console.log(`
     ${chalk.redBright('Please specify the entry directory or file:')}

     ${chalk.cyan('swan')} ${chalk.green('<entry-directory>')}
     or:
     ${chalk.cyan('swan')} ${chalk.green('<entry-directory>')} ${chalk.green('<output-directory>')}

    Run ${chalk.cyan('swan --help')} to see all options.
    `);

    // console.log(chalk.redBright(
    //     `🚀     params error: wx2swan 微信小程序目录（swan目录）
    //                 如: swan ./test/demo ./test/swanDemo
    //                 或者: swan ./test/demo`));
    process.exit(1);
}

checkVersion()
    .then(() => {
        console.log(chalk.green(figlet.textSync("SWAN  CLI")));

        inquirer.prompt(installConfig)
            .then(configTpl => {
                let type = configTpl.appType || WX2BD;
                const fromPath = path.resolve(argv._[0]);
                const toPath = argv._[1] ? path.resolve(argv._[1]) : null;
                const logPath = argv._[2] ? path.resolve(argv._[2]) : null;

                wxmp2swan({type, src: fromPath, dist: toPath, log: logPath}, function (err, logs) {
                    if (err) {
                        console.log('err: ', err);
                    }
                });
            })
    })
    .catch(err => {
        console.log(err);
    });

function printHelp() {
    console.log('');
    console.log('  Examples:');
    console.log('');
    console.log('    交互式创建项目：');
    console.log('    swan <entry-directory> <output-directory>');
    console.log('');
    console.log('');
}

function cleanCache() {
    execSync(`rm -rf ${homedir}/.wx2swan`);
    process.exit(1);
}
