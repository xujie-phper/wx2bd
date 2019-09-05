/*eslint-disable*/
/*globals Page, getApp, App, wx,Component,getCurrentPages*/
Component({
    externalClasses: ['u-class'],

    relations: {
        '../tab/index': {
            type: 'child',
            linked(target) {
                console.log(target, 'linked')
                this.changeCurrent();
            },
            linkChanged(target) {
                console.log(target, 'linkChanged')
                this.changeCurrent();
            },
            unlinked(target) {
                console.log(target, 'unlinked')
                this.changeCurrent();
            }
        }
    },

    properties: {
        current: {
            type: String,
            value: '',
            observer: 'changeCurrent'
        },
        color: {
            type: String,
            value: ''
        },
        scroll: {
            type: Boolean,
            value: false
        },
        fixed: {
            type: Boolean,
            value: false
        }
    },

    methods: {
        changeCurrent(val = this.data.current) {
            wx.test('123');
            let items = this.getRelationNodes('../tab/index');
            const len = items.length;

            if (len > 0) {
                items.forEach(item => {
                    item.changeScroll(this.data.scroll);
                    item.changeCurrent(item.data.key === val);
                    item.changeCurrentColor(this.data.color);
                });
            }
        },
        emitEvent(key) {
            this.triggerEvent('change', {key});
        }
    }
});
