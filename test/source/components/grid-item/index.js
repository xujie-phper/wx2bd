/**
 * 功能：表格项
 * 时间：2019-07-15
 * 作者：yhh
 */
/*eslint-disable*/
/*globals Page,swan,getApp,Component,getCurrentPages*/
Component({
    externalClasses: ['u-class'],

    relations: {
        '../grid/index': {
            type: 'parent'
        },
        '../grid-icon/index': {
            type: 'child'
        }
    },

    data: {
        width: '33.33%'
    }
});
