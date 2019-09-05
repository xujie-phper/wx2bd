const glob = require('glob');
const parser = require("@babel/parser");
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const utils = require('./util/index');
const chalk = require('chalk');
const t = require('babel-types');
const logStore = require('./store/log');
const contextStore = require('./store/context');
const componentConf = require('../config/wxmp2swan/component');
const path = require('path');
let typeValue = '';     //记录relations中的type类型
const propertiesString = 'xujie-xXksjUhmbvhaks';    //临时字面量

exports.transformApiContent = function transformViewContent(content, api, prefix, transformedCtx, file) {
    const result = parser.parse(content, {
        sourceType: 'module',
        plugins: []
    });
    // 处理自定义组件log
    traverse(result, {
        CallExpression(callPath) {
            if (!(callPath.node.callee.name === 'Component')) {
                return;
            }
            callPath.traverse({
                ObjectExpression(path) {
                    // if (!file.includes('grid')) {
                    //     return;
                    // }

                    if (!(path.parentPath.node.type === 'CallExpression' && path.parentPath.node.callee.name === 'Component')) {
                        return;
                    }

                    let hasProperties = false;
                    path.node.properties.find(e => {
                        if (e.key && e.key.name === 'properties') {
                            hasProperties = true;
                            let hasFound = e.value.properties.find(prop=>{
                                return prop.key.name === 'swanId'
                            });
                            if(hasFound){
                                return;
                            }

                            e.value.properties.push(t.objectProperty(t.identifier('swanId'), t.objectExpression([t.objectProperty(t.identifier('type'),t.identifier('String')),t.objectProperty(t.identifier('value'),t.stringLiteral('123445'))]), false, false, null))
                            e.value = t.objectExpression(e.value.properties);
                        }
                    });
                    if (hasProperties) {
                        return;
                    }

                    path.node.properties.splice(2, 0, t.objectProperty(t.identifier('properties'), t.stringLiteral(propertiesString), false, false, null));
                    path.replaceWith(t.objectExpression(path.node.properties));

                    path.traverse({
                        StringLiteral(strPath) {
                            if (strPath.node.value === propertiesString) {
                                let code = `{length: {type: Number,value: 2},swanId:{type: String,value: '123456'}}`;
                                strPath.replaceWithSourceString(code);
                            }
                        },
                        VariableDeclarator(varPath) {
                            //TODO 变量名不为width呢
                            if (varPath.node.id.name === 'width') {
                                let code = `width = 100 / this.data.length`;
                                varPath.replaceWithSourceString(code);
                            }
                        }
                    })
                }
            })
        },
        MemberExpression(path) {
            componentLog(path, file);
            if (path.node.property.type === "Identifier" && path.node.property.name === 'transition') {
                //TODO 特殊情况兼容性
                path.replaceWithSourceString('this.data.animation');
            }
        },
        ObjectProperty(path) {
            componentLog(path, file);
            let linkedBody = '';
            if (path.node.type === 'ObjectProperty' && path.node.key.name === 'relations') {
                //获取到relations属性中type的value
                //获取到relations属性中linked函数
                path.traverse({
                    ObjectMethod(path) {
                        if (path.node.key.name === 'linked') {
                            linkedBody = path.node.body;
                        }
                    },
                    ObjectProperty(path) {
                        if (path.node.key.name === 'type') {
                            typeValue = path.node.value.value;
                        }
                    }
                });
                if (!linkedBody) {
                    path.remove();
                    return;
                } else {
                    path.replaceWith(t.objectMethod('method', t.identifier('attached'), [], linkedBody, false));
                }

                contextStore.dispatch({
                    action:'relationsFilePath',
                    payload:{
                        file:file.replace(/\.js$/,'.swan')
                    }
                })
            }
            let selectMethod = '';
            if (path.node.type === 'ObjectProperty' && path.node.key.name === 'methods') {
                //去掉getRelationNodes调用的参数
                path.traverse({
                    MemberExpression(memberPath) {
                        if (memberPath.node.property.type === "NumericLiteral" && memberPath.node.property.value >= 0) {
                            let node = memberPath.node;
                            if (node.object.type === 'CallExpression' &&
                                node.object.callee.type === 'MemberExpression' && node.object.callee.property.name === 'getRelationNodes') {
                                memberPath.replaceWith(t.callExpression(memberPath.node.object.callee, memberPath.node.object.arguments));
                            }
                        }
                    }
                });
                //替换getRelationNodes逻辑
                path.traverse({
                    CallExpression(callPath) {
                        if (callPath.node.arguments[0] && callPath.node.arguments[0].type === "StringLiteral") {
                            callPath.traverse({
                                MemberExpression(path) {
                                    if (path.node.property.name === "getRelationNodes") {
                                        //TODO xujie
                                        //这里可能有问题，依赖太强
                                        let relationsValue = callPath.node.arguments[0].value || '';
                                        let index = relationsValue.lastIndexOf('./');
                                        let lastIndex = relationsValue.lastIndexOf('/');
                                        let component = relationsValue.substring(index + 2, lastIndex);

                                        // TODO 添加组件库前缀
                                        component = 'u-' + component;
                                        // component = 'this.data.swanId';
                                        if (String(typeValue) === 'parent') {
                                            selectMethod = `selectComponent('#'+this.data.swanId)`;
                                        }
                                        if (String(typeValue) === 'child') {
                                            selectMethod = `selectAllComponents('.'+this.data.swanId)`;
                                        }

                                        let action = String(typeValue) === 'parent' ? 'relationComponentsParent' : 'relationComponentsChild';
                                        contextStore.dispatch({
                                            action,
                                            payload: component
                                        });

                                        let relationReplaceCode = `getCurrentPages()[getCurrentPages().length - 1].${selectMethod}`;
                                        path.parentPath.replaceWithSourceString(relationReplaceCode);
                                    }
                                }
                            });
                        }
                    },
                });
            }
        },
        ObjectMethod(path) {
            componentLog(path, file);
        },
        StringLiteral(path) {
            componentLog(path, file);
        }
    });
    // 转换api接口
    traverse(result, {
        MemberExpression(path) {
            const ctx = path.node.object.name;
            handleApiConfigTransform({ctx, path, api, prefix, transformedCtx, file});
        },
        Identifier(path) {
            if (path.node.name === 'relations') {
                //...
            }
        }
    });

    // 转换剩余的是标识符的wx字段
    traverse(result, {
        enter(path) {
            transformWx(path, file, prefix, transformedCtx);
        },
    });

    const generateResult = generate(result, {});
    return generateResult.code;
};

exports.transformApi = function* transformApi(context) {
    // 过滤js文件
    const files = yield new Promise(resolve => {
        let filePath = context.dist;
        // 添加支持单一文件入口逻辑
        if (utils.isDirectory(filePath)) {
            filePath = filePath + '/**/*.js';
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
        const code = exports.transformApiContent(content, api, prefix, transformedCtx, files[i]);
        yield utils.saveFile(files[i], code);
    }
    console.log(chalk.cyan('🎉    Successfully js'));
};

/**
 * 转换剩余的是标识符的wx字段
 * 如：for in, while中的wx
 *
 * @param {Object} path traverse路径
 * @param {string} file 文件路径
 * @param {string} prefix 要转换的字段名称
 * @param {Object} transformedCtx 转换后的字段集合
 */
function transformWx(path, file, prefix, transformedCtx) {
    if (t.isIdentifier(path.node, {name: prefix})) {
        const node = path.node;
        path.replaceWithSourceString(transformedCtx[prefix]);

        logStore.dispatch({
            action: 'info',
            payload: {
                type: 'transform function call arg name',
                file: file,
                row: node.loc.start.line,
                column: node.loc.start.column,
                before: prefix,
                after: transformedCtx[prefix],
                message: '只转换了上下文, wx ==> swan'
            }
        });
    }
}

/**
 * 获取对象方法调用成员表达式中的方法名称
 *
 * @param {Object} node traverse节点
 */
function getNodeMethodName(node) {
    const stringLiteralMethod = node.property.value;
    const identifierMethod = node.property.name;
    const methodName = node.property.type === 'StringLiteral' ? stringLiteralMethod : identifierMethod;
    return methodName;
}

/**
 * 获取转换后的对象方法调用成员表达式字符串
 *
 * @param {Object} node traverse节点
 * @param {string} ObjectName 要转换的对象名称
 * @param {string} methodName 要转换的方法名称
 * @return {string} 转换后的方法调用字符串
 */
function getMemberExpressionReplaceCode(node, ObjectName, methodName) {
    let afterCode = '';
    const isStringLiteral = node.property.type === 'StringLiteral';
    /**
     * 对象取值使用[]时computed为true
     * 对象取值使用.时computed为false
     */
    const nodeComputed = node.computed;
    // xxx['yyy'] -> ObjectName['methodName']
    if (isStringLiteral && nodeComputed) {
        afterCode = `${ObjectName}['${methodName}']`;
        // xxx[yyy] -> ObjectName[methodName]
    } else if (nodeComputed) {
        afterCode = `${ObjectName}[${methodName}]`;
        // xxx.yyy -> ObjectName.methodName
    } else {
        afterCode = `${ObjectName}.${methodName}`;
    }
    return afterCode;
}

/**
 * 自定义组件中不支持的属性打印error日志
 *
 * @param {Object} path traverse路径
 * @param {string} file 文件路径
 */
function componentLog(path, file) {
    const node = path.node;
    const sourceCode = generate(path.node).code;
    Object.keys(componentConf).forEach(key => {
        switch (key) {
            case 'behaviors':
                handleBehaviors();
                break;
            case 'this':
                handleThis();
                break;
            case 'Component':
                handleComponent();
                break;
        }
    });

    // 处理自定义组件behaviors中的属性
    function handleBehaviors() {
        Object.keys(componentConf.behaviors).forEach(attr => {
            const confValue = componentConf.behaviors[attr] || {};
            const mappingValue = confValue.mapping;
            if (mappingValue && t.isStringLiteral(path.node) && node.value === attr) {
                // const parent = path.parentPath.parentPath;
                const behaviorsParent = path.findParent(path => {
                    return path.isObjectProperty() && path.node.key.name === 'behaviors';
                });
                if (behaviorsParent) {
                    node.value = mappingValue;
                    const afterCode = generate(path.node).code;
                    logStore.dispatch({
                        action: 'info',
                        payload: {
                            type: 'Component behaviors',
                            file: file,
                            row: node.loc.start.line,
                            column: node.loc.start.column,
                            before: sourceCode,
                            after: afterCode,
                            message: `自定义组件---behaviors[${attr}]: 被替换为behaviors[${mappingValue}]`
                        }
                    });
                }
            }
        });
    }

    // 处理自定义组件this上挂载的不支持方法
    function handleThis() {
        if (t.isThisExpression(path.node.object)) {
            Object.keys(componentConf.this).forEach(method => {
                const confValue = componentConf.this[method];
                const componentParent = path.findParent(path => {
                    return path.isCallExpression() && path.node.callee.name === 'Component';
                });
                if (componentParent && confValue === null && t.isIdentifier(path.node.property, {name: method})) {
                    logStore.dispatch({
                        action: 'error',
                        payload: {
                            type: 'Component this api',
                            file: file,
                            row: node.loc.start.line,
                            column: node.loc.start.column,
                            before: sourceCode,
                            after: sourceCode,
                            message: `自定义组件---this.${method}: ${'没有相对应的方法'}`
                        }
                    });
                }
                if (t.isIdentifier(path.node.property, {name: method})
                    && utils.isObject(confValue) && confValue.notAllowParents) {

                    const notAllowParents = confValue.notAllowParents;
                    notAllowParents.forEach(notAllowParent => {
                        const parent = path.findParent(path => {
                            return (path.isObjectProperty() || path.isObjectMethod())
                                && path.node.key.name === notAllowParent;
                        });
                        if (!parent) {
                            return;
                        }
                        logStore.dispatch({
                            action: 'error',
                            payload: {
                                type: 'Component this api',
                                file: file,
                                row: node.loc.start.line,
                                column: node.loc.start.column,
                                before: sourceCode,
                                after: sourceCode,
                                message: `自定义组件---this.${method}: 不支持在${notAllowParent}中调用`
                            }
                        });
                    });
                }
            });
        }
    }

    // 处理不支持的自定义组件方法
    function handleComponent() {
        Object.keys(componentConf.Component).forEach(method => {
            const confValue = componentConf.Component[method];
            if (confValue === null && t.isIdentifier(path.node.key, {name: method})) {
                const parent = path.parentPath.parentPath.node;
                if ((parent.type === 'CallExpression' && parent.callee.name === 'Component')
                    || (parent.type === 'ObjectProperty' && parent.key.name === 'lifetimes')) {
                    logStore.dispatch({
                        action: 'error',
                        payload: {
                            type: 'Component api',
                            file: file,
                            row: node.loc.start.line,
                            column: node.loc.start.column,
                            before: sourceCode,
                            after: sourceCode,
                            message: `自定义组件---${method}: ${'没有相对应的方法'}`
                        }
                    });
                }
            }
        });
    }
}

/**
 * 根据Api转换配置进行处理
 *
 * @param {string} ctx 当前函数命名空间
 * @param {Object} path traverse路径
 * @param {Object} api Api转换配置
 * @param {string} prefix 要转换的函数命名空间
 * @param {string} transformedCtx Api转换配置中指定的转换后的函数命名空间
 * @param {string} file 要转换函数所在的源文件路径
 */
function handleApiConfigTransform({ctx, path, api, prefix, transformedCtx, file}) {
    const method = getNodeMethodName(path.node);
    if (!(ctx === prefix && method && api[ctx] && api[ctx][method])) {
        return;
    }
    const action = api[ctx][method].action;
    switch (action) {
        case 'tip':
            handleTip({ctx, path, api, transformedCtx, method, file});
            break;
        case 'mapping':
            handleMapping({ctx, path, api, transformedCtx, method, file});
            break;
        case 'delete':
            handleDelete({ctx, path, api, transformedCtx, method, file});
            break;
    }

    function handleTip({ctx, path, api, transformedCtx, method, file}) {
        const node = path.node;
        const sourceCode = generate(path.node).code;
        const afterCode = transformedCtx[ctx] + '.' + method;
        // 二级api，只处理context，给tips提示，让开发者去手动兼容
        path.replaceWithSourceString(afterCode);
        // 增加transform logs
        logStore.dispatch({
            action: api[ctx][method].logLevel,
            payload: {
                type: 'show tips',
                file: file,
                row: node.loc.start.line,
                column: node.loc.start.column,
                before: sourceCode,
                after: afterCode,
                message: ctx + '.' + method + ' --- ' + api[ctx][method].message
            }
        });
    }

    function handleMapping({ctx, path, api, transformedCtx, method, file}) {
        const node = path.node;
        const sourceCode = generate(path.node).code;
        // 需要转换
        const mappingName = api[ctx][method].mapping ? api[ctx][method].mapping : method;
        // 只要替换ctx和函数名即可
        const afterCode = transformedCtx[ctx] + '.' + mappingName;
        path.replaceWithSourceString(afterCode);

        // 增加transform logs
        logStore.dispatch({
            action: api[ctx][method].logLevel,
            payload: {
                type: 'transform context && method',
                file: file,
                row: node.loc.start.line,
                column: node.loc.start.column,
                before: sourceCode,
                after: afterCode,
                message: ctx + '.' + method + ' --- ' + api[ctx][method].message
            }
        });
    }

    function handleDelete({ctx, path, api, transformedCtx, method, file}) {
        const node = path.node;
        let sourceCode = generate(path.node).code;
        let afterCode = '';
        let logType = 'delete api';
        // 处理逻辑父节点是逻辑运算时的场景
        // wx.xxxx && true
        if (t.isLogicalExpression(path.parent)) {
            logType = 'replace with binary expression';
            path.node.object.name = transformedCtx[ctx];
            path.replaceWith(t.binaryExpression('!=', path.node, t.nullLiteral()));
            afterCode = generate(path.node).code;
        }
        // 处理 !wx.unSupported API
        else if (t.isUnaryExpression(path.parent)) {
            logType = 'transform context';
            path.node.object.name = transformedCtx[ctx];
            afterCode = generate(path.node).code;
        }
        else if (path.parentPath) {
            sourceCode = generate(path.parentPath.node).code;
            // 避免移除父节点导致转码异常退出问题。
            try {
                path.parentPath.remove();
            }
            catch (err) {
                // @TODO: 优化日志
                logType = 'transform failed';
                afterCode = sourceCode;
            }
        }

        const methodConfig = api[ctx][method] || {};
        // 增加transform logs
        logStore.dispatch({
            action: api[ctx][method].logLevel,
            payload: {
                type: logType,
                file: file,
                row: node.loc.start.line,
                column: node.loc.start.column,
                before: sourceCode,
                after: afterCode,
                message: ctx + '.' + method + `:${methodConfig.message}`
            }
        });
    }
}
