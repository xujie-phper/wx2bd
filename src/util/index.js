/**
 * @file wxml convert swan
 */

const fs = require('fs-extra');
const recursiveCopy = require('recursive-copy');
const mkdirp = require('mkdirp');
const path = require('path');
const vfile = require('vfile');

const swanFileSuffix = 'swan';
const cssFileSuffix = 'css';
const jsFileSuffix = 'js';
const configFileSuffix = 'json';


/**
 * 拷贝项目
 *
 * @param {string} fromPath 目标目录路径
 * @param {string} toPath 生成目录路径
 * @return {Promise}
 */
exports.copyProject = function (fromPath, toPath) {
    // 支持转换入口为单一文件
    if (isDirectory(fromPath)) {
        return copyDirectory(fromPath, toPath);
    } else {
        return copyFile(fromPath, toPath);
    }
};


/**
 * 拷贝目录
 *
 * @param {string} fromPath 目标目录路径
 * @param {string} toPath 生成目录路径
 * @return {Promise}
 */
function copyDirectory(fromPath, toPath) {
    const lists = fs.readdirSync(fromPath).filter(function (item) {
        return !/(node_modules|DS_store)/i.test(item);
    });
    const options = {
        overwrite: true,
        expand: true,
        dot: true,
        rename(filePath) {
            return renameFileExt(filePath);
        }
    };
    const arr = [];
    for (let i = 0; i < lists.length; i++) {
        arr.push(
            recursiveCopy(
                path.join(fromPath, lists[i]),
                path.join(toPath, lists[i].replace(/wxml$/, swanFileSuffix).replace(/wxss$/, cssFileSuffix)),
                options
            )
        );
    }
    return Promise.all(arr);
}

/**
 * 拷贝单文件
 *
 * @param {string} fromPath 目标文件路径
 * @param {string} toPath 生成文件路径
 * @return {Promise}
 */
function copyFile(fromPath, toPath) {
    // 拷贝文件时toPath支持文件与目录两种形式
    let fromfileName = path.basename(fromPath);
    if (isDirectory(toPath)) {
        // toPath为目录时补上文件名为fromPath中处理扩展名后的文件名
        fromfileName = renameFileExt(fromfileName);
        toPath = path.join(toPath, fromfileName);
    }
    return fs.copy(fromPath, toPath);
}

/**
 * 重命名文件扩展名
 *
 * @param {string} filePath 文件路径
 * @return {string} 处理后路径
 */
function renameFileExt(filePath) {
    if (/wxml/.test(filePath)) {
        return filePath.replace(/wxml$/, swanFileSuffix);
    }
    else if (/wxss/.test(filePath)) {
        return filePath.replace(/wxss$/, cssFileSuffix);
    }
    else {
        return filePath;
    }
}

/**
 * 判断路径是否为目录
 *
 * @param {string} entryPath 路径
 * @return {boolean}
 */
function isDirectory(entryPath) {
    return !path.extname(entryPath);
}
exports.isDirectory = isDirectory;

// get content
exports.getContent = function (filepath) {
    return new Promise(function (resolve) {
        fs.readFile(filepath, function (err, con) {
            resolve(con.toString());
        });
    });
};

// get content sync
exports.getContentSync = function (filepath) {
    return fs.readFileSync(filepath).toString();
};

// write content
exports.saveFile = function (path, con) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, con, error => {
            if (error) {
                reject(error);
            }
            else {
                resolve(true);
            }
        });
    });
};

// write content
exports.saveLog = function (ContentPath, con) {
    return new Promise((resolve, reject) => {
        mkdirp(path.dirname(ContentPath), err => {
            if (err) {
                reject(err);
            }
            else {
                fs.writeFileSync(ContentPath, con);
            }
        });
    });
};

// object to json string
exports.object2String = function (obj) {
    const cache = [];
    return JSON.stringify(obj, function (key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    }, 2);
};

/**
 * 创建虚拟文件，并添加关联文件
 *
 * @param {string} filePath 文件路径
 * @param {string} contents 文件内容
 * @return {VFile}
 */
exports.toVFile = function (filePath, contents) {
    const file = vfile({path: filePath, contents: contents});
    const related = {
        style: cssFileSuffix,
        view: swanFileSuffix,
        js: jsFileSuffix,
        config: configFileSuffix
    };
    const {cwd, dirname, stem, extname} = file;
    file.data.relatedFiles = Object
        .keys(related)
        .reduce(
            (prev, type) => {
                const ext = `.${related[type]}`;
                if (ext !== extname) {
                    const filePath = path.resolve(cwd, dirname, stem + ext);
                    fs.existsSync(filePath) && (prev[type] = filePath);
                }
                return prev;
            },
            {}
        );
    return file;
};

/**
 * 判断是否对象
 *
 * @param {Object} val 参数
 * @return {boolean} 是否对象
 */
module.exports.isObject = function isObject(val) {
    return val != null && typeof val === 'object' && Array.isArray(val) === false;
};

/**
 * 无请求头的css静态资源url添加https请求头
 *
 * @param {string} content 文件内容
 * @return {string} 处理后文件内容
 */
exports.transformCssStaticUrl = function transformCssStaticUrl(content) {
    content = content.replace(/url\((.*)\)/g, function ($1, $2) {
        if (!$2) {
            return $1;
        }
        const res = $2.replace(/^(['"\s^]?)(\/\/.*)/, function ($1, $2, $3) {
            const resUrl = `${$2}https:${$3}`;
            return resUrl;
        });
        return `url(${res})`;
    });
    return content;
};

/**
 * 创建.wx2swaninfo文件
 *
 * @param {string} toPath 生成文件路径
 * @return {Promise}
 */
exports.createWx2swaninfo = function (toPath) {
    let dirPath = toPath;
    if (!isDirectory(toPath)) {
        dirPath = path.dirname(toPath);
    }
    const pkg = require('../../package.json');
    const filePath = dirPath + '/.wx2swaninfo';
    const con = `{
    "toolName": "wx2swan",
    "toolCliVersion": "${pkg.version}",
    "createTime": ${new Date().getTime()}
}`;
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, con, error => {
            if (error) {
                reject(error);
            }
            else {
                resolve(true);
            }
        });
    });
};
