'use strict';

const _ = require('lodash');
const path = require('path');
const regexgen = require('regexgen');
const tranformBindDataConifg = require('../../../tranform-bind-data-conifg');
const utils = require('../../util/index');
let contextStore = require('../../store/context');
let componentPrevName = '';
let componentUniqueFlag = Math.random() * 10 + '';
const SWAN_ID_FOR_SYSTEM = 'swanIdForSystem';
let prevParentNodeName = '';

module.exports = function wxmlToSwan(options = {}) {
    return function transformTree(tree, file) {
        if (_.isArray(tree)) {
            return tree.map(node => transformTree(node, file));
        }
        if (tree.type === 'tag') {
            const {name, attribs, children} = tree;

            if (name === 'import' || name === 'include') {
                tree = tranformImport(tree, file, options);
            }

            // template data属性的值需要包一层花括号
            if (name === 'template' && attribs.data) {
                tree = tranformTemplate(tree, file, options);
            }

            // input标签强制自闭合
            if (name === 'input') {
                tree = tranformInput(tree, file, options);
            }

            tree = tranformBindData(tree, file, options);

            tree = transformWXS(tree, file, options);

            tree = transformComponent(tree, file, options);

            tree.children = children.map(node => transformTree(node, file));

            tree = transformDirective(tree, file, options);

            // 无请求头的css静态资源url添加https请求头
            tree = transformStyle(tree, file, options);

            // 一定要在transform children和transformDirective之后
            const transformedAttribs = tree.attribs;
            if (transformedAttribs['s-for'] && transformedAttribs['s-if']) {
                tree = transformForIFDirective(tree, file, options);
            }
        }
        return tree;
    }
};

/**
 * 转换import和include标签
 *
 * @param {Object} node 节点对象
 * @param {VFile} file 虚拟文件
 * @param {Object} options 转换配置
 * @return {Object}
 */
function tranformImport(node, file, options) {
    const attribs = node.attribs;
    if (attribs && attribs.src) {
        let src = attribs.src.replace(/\.wxml$/i, '.swan');
        // src中没有扩展名的添加默认扩展名.swan
        if (!/\w+\.\w+$/.test(src)) {
            src = src + '.swan';
        }
        return {
            ...node,
            attribs: {
                ...attribs,
                src: src
            }
        };
    }
    return node;
}

/**
 * 转换WXS为filter
 *
 * @param {Object} node 节点对象
 * @param {VFile} file 虚拟文件
 * @param {Object} options 转换配置
 * @return {Object}
 */
function transformWXS(node, file, options) {
    if (node.name === 'wxs') {
        node.name = 'filter';
        if (node.attribs.src && node.attribs.src.indexOf('.wxs') > -1) {
            node.attribs.src = node.attribs.src.replace(/.wxs$/, '.filter.js');
        } else {
            //TODO Filter只能导出function函数,如果有变量，需要自行转换，记录日志
            let data = node.children[0] && node.children[0].data;
            if (typeof data === 'string' && data.indexOf('module.exports') > -1) {
                node.children[0].data = data.replace(/module.exports[\s]+=/, 'export default');
            }
        }
    }

    return node;
}

/**
 * 转换模板标签
 *
 * @param {Object} node 节点对象
 * @param {VFile} file 虚拟文件
 * @param {Object} options 转换配置
 * @return {Object}
 */
function tranformTemplate(node, file, options) {
    const attribs = node.attribs;

    if (!attribs) {
        return node;
    }
    let newAttribs = attribs;
    if (attribs.is) {
        const newName = _.kebabCase(attribs.is);
        newAttribs = {...attribs, is: newName};
    }

    if (attribs.data) {
        newAttribs = {...newAttribs, data: `{${attribs.data}}`};
    }

    return {
        ...node,
        attribs: {...newAttribs}
    };
}

/**
 * 转换input标签
 *
 * @param {Object} node 节点对象
 * @param {VFile} file 虚拟文件
 * @param {Object} options 转换配置
 * @return {Object}
 */
function tranformInput(node, file, options) {
    if (!node.selfclose) {
        file.message('remove input close tag');
        return {
            ...node,
            selfclose: true
        };
    }
    return node;
}

/**
 * 转换自定义组件
 *
 * @param {Object} node 节点对象
 * @param {VFile} file 虚拟文件
 * @param {Object} options 转换配置
 * @return {Object}
 */
function transformComponent(node, file, options) {
    const filePath = path.resolve(file.cwd, file.dirname, file.basename);
    const swanToRenamedComponents = contextStore.swanToRenamedComponents || {};
    const renamedComponentMap = swanToRenamedComponents[filePath];

    const relationComponentsParent = contextStore.relationComponentsParent;
    const relationComponentsChild = contextStore.relationComponentsChild;
    const attribs = node.attribs;
    let addNodeAttrib = {};
    let name = node.name;

    if (relationComponentsChild.includes(node.name)) {
        addNodeAttrib[SWAN_ID_FOR_SYSTEM] = componentUniqueFlag + '';
        addNodeAttrib.class = attribs.class ? attribs.class + ' ' + componentUniqueFlag : componentUniqueFlag;
    } else if (relationComponentsParent.includes(node.name)) {
        if (attribs.id) {
            //TODO 替换了原有的标签ID，输出一条warning日志
        }
        componentUniqueFlag = Math.random() * 10 + '';
        componentPrevName = node.name;

        addNodeAttrib[SWAN_ID_FOR_SYSTEM] = componentUniqueFlag + '';
        addNodeAttrib.id = componentUniqueFlag;
    }

    if (typeof name === 'string' && /u-grid/i.test(name)) {
        addNodeAttrib.length = '{{actions.length || 2}}';
    }

    if (renamedComponentMap && renamedComponentMap[node.name]) {
        // TODO: 添加warning日志
        name = renamedComponentMap[node.name];
    }

    return {
        ...node,
        name,
        attribs: {...addNodeAttrib, ...attribs}
    };
}

/**
 * 转换标签上的directive
 *
 * @param {Object} node 节点对象
 * @param {VFile} file 虚拟文件
 * @param {Object} options 转换配置
 * @return {Object}
 */
function transformDirective(node, file, options) {
    const {attribs, singleQuoteAttribs = {}} = node;
    if (!attribs) {
        return node;
    }
    const newAttribs = Object
        .keys(attribs)
        .reduce(
            (newAttribs, key) => {
                // 删除空wx:前缀
                let newKey = key.replace(/^wx:$/, '').replace(/^wx[:\-]/, 's-');
                // newKey = key === 'wx:for-items' ? 's-for' : newKey;
                const value = attribs[key];
                let newValue = value;
                // 去除花括号
                if (['wx:for', 'wx:if', 'wx:elif', 'wx:for-items'].includes(key)) {
                    newValue = dropBrackets(value);
                }
                // 合并wx:for wx:for-items wx:for-item wx:for-index
                if (key === 'wx:for' || key === 'wx:for-items') {
                    const item = attribs['wx:for-item'] || 'item';
                    const index = attribs['wx:for-index'] || 'index';
                    if (typeof value === "number") {
                        newValue = [];
                        for (let i = 0; i < value; i++) {
                            newValue.push(i + 1);
                        }
                    }
                    newValue = `${item}, ${index} in ${newValue}`;
                }

                // 丢弃这俩
                if (['wx:for-index', 'wx:for-item'].includes(key)) {
                    return newAttribs;
                }

                newAttribs[newKey] = newValue;
                return newAttribs;
            },
            {}
        );
    return {
        ...node,
        attribs: newAttribs,
        singleQuoteAttribs: Object
            .keys(singleQuoteAttribs)
            .reduce(
                (prev, key) => {
                    const newKey = key.replace(/^wx:/, 's-');
                    return {
                        ...prev,
                        [newKey]: singleQuoteAttribs[key]
                    };
                },
                {}
            )
    };
}

/**
 * 丢掉属性值两侧的花括号
 *
 * @param {string} value 属性值
 * @return {string}
 */
function dropBrackets(value = '') {
    const trimed = value.trim();
    if (/^{{.*}}$/.test(trimed)) {
        return trimed.slice(2, -2);
    }
    return value;
}

/**
 * 判断是否{{}}数据绑定
 *
 * @param {string} value 属性值
 * @return {boolean}
 */
function hasBrackets(value = '') {
    const trimed = value.trim();
    return /^{{.*}}$/.test(trimed);
}

/**
 * 转换标签上的for if directive
 *
 * @param {Object} node 节点对象
 * @param {VFile} file 虚拟文件
 * @param {Object} options 转换配置
 * @return {Object}
 */
function transformForIFDirective(node, file, options) {
    const {attribs, children} = node;
    const ifValue = attribs['s-if'];
    const forValue = attribs['s-for'];
    const [forItemName, forIndexName] = forValue.slice(0, forValue.indexOf(' in ')).split(',');

    const forItemNameRegex = getVariableRegex(forItemName);
    const forIndexNameRegex = getVariableRegex(forIndexName);

    const shouldBeAfterFor = forItemNameRegex.test(ifValue) || forIndexNameRegex.test(ifValue);
    if (shouldBeAfterFor) {
        const blockNode = {
            type: 'tag',
            name: 'block',
            attribs: {
                's-if': ifValue
            },
            children: children,
            parent: node
        };
        delete node.attribs['s-if'];
        node.children = [blockNode];
        blockNode.children = blockNode.children.map(item => ({
            ...item,
            parent: blockNode
        }));
    }
    return node;
}

/**
 * 生成匹配变量名的正则表达式
 *
 * @param {string} variable 变量名
 * @return {RegExp}
 */
function getVariableRegex(variable) {
    if (variable[0] === '$') {
        const regex = regexgen([variable.slice(1)]);
        return new RegExp(`\\$${regex.toString().slice(1, -1)}\\b`);
    }
    const regex = regexgen([variable]);
    const res = new RegExp(`\\b${regex.toString().slice(1, -1)}\\b`);
    return res;
}

/**
 * 转换数据绑定为双向绑定语法
 *
 * @param {Object} node 节点对象
 * @param {VFile} file 虚拟文件
 * @param {Object} options 转换配置
 * @return {Object}
 */
function tranformBindData(node, file, options) {
    const tranformBindDataList = tranformBindDataConifg[node.name];
    if (!tranformBindDataList) {
        return node;
    }
    const attribs = node.attribs;
    tranformBindDataList.forEach(attr => {
        if (attribs && attribs[attr]) {
            if (hasBrackets(attribs[attr])) {
                node.attribs[attr] = `{=${dropBrackets(attribs[attr])}=}`;
            } else {
                node.attribs[attr] = `${attribs[attr]}`;
            }
        }
    });
    return node;
}

/**
 * 转换style
 * 无请求头的css静态资源url添加https请求头
 *
 * @param {Object} node 节点对象
 * @param {VFile} file 虚拟文件
 * @param {Object} options 转换配置
 * @return {Object}
 */
function transformStyle(node, file, options) {
    const attribs = node.attribs;
    if (attribs.style) {
        attribs.style = utils.transformCssStaticUrl(attribs.style);
    }
    return node;
}
