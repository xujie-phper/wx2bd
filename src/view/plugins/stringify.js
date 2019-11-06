/**
 * 视图ast序列化插件
 *
 * @file 视图ast序列化插件
 */

'use strict';

const viewConfig = require('../../../config/wx2bd/view');
const FAKE_ROOT = require('../util').fakeRoot;

const SINGLE_QUOTE = '\'';
const DOUBLE_QUOTE = '"';

// 把标签名、属性片段join起来
const join = (...args) => args.filter(arg => !!arg).join(' ');

module.exports = function stringify(options = {}) {
    this.Compiler = compiler;

    function compiler(tree, file) {
        if (!tree) {
            return '';
        }
        else if (Array.isArray(tree)) {
            return tree
                .map(node => compiler(node, file))
                .join('');
        }

        const {type, children, data} = tree;
        switch (type) {
            case 'tag': {
                // 跳过虚假的根节点
                if (tree.name === FAKE_ROOT) {
                    return compiler(children, file);
                }
                const content = children
                    .map(node => compiler(node, file))
                    .join('');
                return nodeToString(tree, content, file);
            }
            case 'text':
                return data;
            case 'comment':
                return `<!--${data}-->`;
        }
    }
};

/**
 * 生成tag节点的字符串
 *
 * @param {Object} node tag节点
 * @param {string} content 子元素字符串
 * @param {VFile} file 文件描述
 * @return {string}
 */
function nodeToString(node, content, file) {
    const {name, attribs, singleQuoteAttribs = {}, selfclose} = node;
    const stringAttribs = attribsToString(attribs, singleQuoteAttribs, file);
    return selfclose
        ? `<${join(name, stringAttribs)} />`
        : `<${join(name, stringAttribs)}>${content}</${name}>`;
}

/**
 * 生成tag节点属性的字符串
 *
 * @param {Object} attribs tag节点属性集合
 * @param {Object} singleQuoteAttribs tag节点使用单引号的属性集合
 * @param {VFile} file 文件描述
 * @return {string}
 */
function attribsToString(attribs, singleQuoteAttribs, file) {
    if (!attribs) {
        return '';
    }

    return Object.keys(attribs)
        .map(
            key => {
                let value = attribs[key];
                if (value === '') {
                    if (viewConfig.boolAttr.includes(key)) {
                        return `${key}="false"`;
                    }
                    return key;
                }
                const quote = singleQuoteAttribs[key] ? SINGLE_QUOTE : DOUBLE_QUOTE;
                if (quote === DOUBLE_QUOTE && value.indexOf('\\"') >= 0) {
                    value = value.replace(/\\"/g, '\'');
                    file.message('Danger \\" in attribute value');
                }
                if (key !== '') {
                    return `${key}=${quote}${value}${quote}`;
                } else {
                    return `${key}`;
                }
            }
        )
        .join(' ');
}
