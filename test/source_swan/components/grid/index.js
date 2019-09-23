/**
 * 功能：表格
 * 时间：2019-07-15
 * 作者：yhh
 */

/*eslint-disable*/

/*globals Page,swan,getApp,Component,getCurrentPages*/
Component({
  externalClasses: ['u-class'],

  attached() {
    this.setGridItemWidth();
  },

  properties: {
    length: {
      type: Number,
      value: 2
    },
    swanIdForSystem: {
      type: String,
      value: '123456'
    }
  },
  methods: {
    setGridItemWidth() {
      const nodes = getCurrentPages()[getCurrentPages().length - 1].selectAllComponents('.' + this.data.swanIdForSystem);
      const width = 100 / this.data.length;
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