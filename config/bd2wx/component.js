/**
 * @file 自定义组件配置
 * @description 自定义组件不支持的方法
 */
module.exports = {
    // 设置内置behaviors映射关系
    behaviors: {
        'wx://form-field': {
            mapping: 'wx2bd://form-field'
        },
        'wx://component-export': {
            mapping: 'wx2bd://component-export'
        }
    }
};
