/**
 * @file 转换日志
 * @description 记录转换日志相关方法
 */
const utils = require('../util/index');
const fs = require('fs-extra');
const path = require('path');

class logStore {
    constructor() {
        this.info = [];
        this.warning = [];
        this.error = []
    }

    dispatch({action, payload = {}}) {
        switch (action) {
            case 'info':
                this.info.push(payload);
                break;
            case 'warning':
                this.warning.push(payload);
                break;
            case 'error':
                this.error.push(payload);
                break;
            default:
                throw new Error('action未定义，行为禁止');
        }
    }

    async saveLog(path) {
        ['info', 'warning', 'error'].forEach(level => {
            const logs = this[level];
            utils.saveLog(`${path}/log/${level}.json`, JSON.stringify(logs, null, 4));
        });

        let content = await utils.getContent(__dirname+'/login.js');
        utils.saveLog(`${path}/log/login.js`, content);
    };
}

module.exports = new logStore();
