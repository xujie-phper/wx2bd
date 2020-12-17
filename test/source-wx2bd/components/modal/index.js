/**
 * 功能：弹窗组件
 * 时间：2019-07-15
 * 作者：yhh
 */

/*eslint-disable*/

/*globals Page,wx2bd,getApp,Component,getCurrentPages*/
Component({
  externalClasses: ['u-class', 'u-class-mask'],
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: ''
    },
    showOk: {
      type: Boolean,
      value: true
    },
    showCancel: {
      type: Boolean,
      value: true
    },
    okText: {
      type: String,
      value: '确定'
    },
    cancelText: {
      type: String,
      value: '取消'
    },
    // 按钮组，有此值时，不显示 ok 和 cancel 按钮
    actions: {
      type: Array,
      value: []
    },
    // horizontal || vertical
    actionMode: {
      type: String,
      value: 'horizontal'
    },
    swanIdForSystem: {
      type: String,
      value: "123445"
    }
  },
  methods: {
    handleClickItem({
      currentTarget = {}
    }) {
      const dataset = currentTarget.dataset || {};
      const {
        index
      } = dataset;
      this.triggerEvent('click', {
        index
      });
    },

    handleClickOk() {
      this.triggerEvent('ok');
    },

    handleClickCancel() {
      this.triggerEvent('cancel');
    }

  }
});