/**
 * 功能：表格
 * 时间：2019-07-15
 * 作者：yhh
 */
/*eslint-disable*/
/*globals Page,wx2bd,getApp,Component,getCurrentPages*/
Component({
    externalClasses: ['u-class'],

    relations: {
        '../grid-item/index': {
            type: 'child',
            linked() {
                this.setGridItemWidth();
            },
            linkChanged() {
                this.setGridItemWidth();
            },
            unlinked() {
                this.setGridItemWidth();
            }
        }
    },

    methods: {
        setGridItemWidth() {
            const nodes = this.getRelationNodes('../grid-item/index');
            const width = 100 / nodes.length;

            nodes.forEach(item => {
                item.setData({
                    'width': width + '%'
                });
            });
        }
    },

    ready() {
        this.setGridItemWidth();
    }
});
