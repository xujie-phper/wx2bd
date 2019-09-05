'use strict';

const _ = require('lodash');
const glob = require('glob');
const path = require('path');
const chalk = require('chalk');
const unified = require('unified');
const DepGraph = require('dependency-graph').DepGraph;

const parse = require('./plugins/parse');
const stringify = require('./plugins/stringify');
const wxmlToSwan = require('./plugins/wxml-to-swan');
const utils = require('../util/index');
const getHtmlParser = require('./util').getHtmlParser;

let contextStore = require('../store/context.js');
/**
 * 转换一个视图文件
 *
 * @param {string} path 文件路径
 * @param {string} contents 文件内容
 * @param {Object} context 上下文
 * @return {Promise.<VFile>}
 */
module.exports.transformViewContent = function (path, contents, context) {
    return unified()
        .use(parse)
        .use(wxmlToSwan, {context})
        .use(stringify)
        .process(utils.toVFile(path, contents));
};

/**
 * 转换视图
 *
 * @param {Object} context 转换上下文
 */
module.exports.transformView = function* transformView(context) {
    const files = yield new Promise(resolve => {
        let filePath = context.dist;
        // 添加支持单一文件入口逻辑
        if (utils.isDirectory(filePath)) {
            filePath = filePath + '/**/*.swan';
        }
        const extname = path.extname(filePath);
        if (extname === '.swan') {
            glob(filePath, function (err, res) {
                resolve(err ? [] : res);
            });
        } else {
            resolve([]);
        }
    });

    contextStore.dispatch({
        action: 'swanToRenamedComponents',
        payload: buildSwanComponentDepdencies(files, context)
    });

    for (let i = 0; i < files.length; i++) {
        const content = yield utils.getContent(files[i]);
        const result = yield exports.transformViewContent(files[i], content, context);
        yield utils.saveFile(files[i], String(result));
    }
    console.log(chalk.cyan('🎉    Successfully wxml'));
};

/**
 * 构造视图到被修改名称的自定义组件的依赖树
 *
 * @param {Array.<string>} files 视图文件集合
 * @param {Object} context 转化工具上下文
 * @return {Object}
 */
function buildSwanComponentDepdencies(files, context) {
    const {htmlParser, handler} = getHtmlParser();
    const swanDependencyGraph = files.reduce(
        (graph, file) => {
            graph.addNode(file);
            htmlParser.end(utils.getContentSync(file));
            const tree = handler.dom;
            buildGraph(tree, graph, file);
            htmlParser.reset();
            return graph;
        },
        new DepGraph()
    );


    return Object
        .keys(contextStore.renamedComponents || {})
        // 有使用自定义组件、且有不合法自定义组件名称的swan文件，主要包括页面和自定义组件
        .map(key => key.replace(/\.json$/, '.swan'))
        .filter(file => swanDependencyGraph.hasNode(file))
        // 找出页面和自定义组件视图依赖的所有视图
        .map(
            file => ({
                file: file,
                deps: swanDependencyGraph.dependenciesOf(file)
            })
        )
        // 找出页面、自定义组件视图以及以上两者使用的视图文件使用的被改名的自定义组件map
        .reduce(
            (prev, {file, deps}) => {
                const jsonFileName = file.replace(/\.swan/, '.json');
                const renamedMap = contextStore.renamedComponents[jsonFileName] || {};
                deps.forEach(dep => (prev[dep] = prev[dep] ? {...prev[dep], ...renamedMap} : renamedMap));
                prev[file] = renamedMap;
                return prev;
            },
            {}
        );
}

/**
 * 构造一个视图文件节点的依赖图
 *
 * @param {Object} tree 视图树
 * @param {DepGraph} graph 视图文件依赖图
 * @param {string} from 视图文件节点
 */
function buildGraph(tree, graph, from) {
    if (!_.isArray(tree)) {
        const {type, name, attribs, children = []} = tree;
        if (type === 'tag' && (name === 'import' || name === 'include') && attribs.src) {
            let dep = path.resolve(path.dirname(from), attribs.src);
            dep = dep.replace(/\.wxml/, '.swan');
            dep = dep.endsWith('.swan') ? dep : `${dep}.swan`;
            graph.addNode(dep);
            graph.addDependency(from, dep);
        }
        buildGraph(children, graph, from);
        return;
    }
    tree.forEach(node => buildGraph(node, graph, from));
}
