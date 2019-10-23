/*eslint-disable*/

/*globals Page, getApp, App, wx,Component,getCurrentPages*/
Component({
  externalClasses: ['u-class'],
  options: {
    multipleSlots: true
  },
  properties: {
    // button || number || pointer
    mode: {
      type: String,
      value: 'button'
    },
    current: {
      type: Number,
      value: 1
    },
    total: {
      type: Number,
      value: 0
    },
    // 是否隐藏数值
    simple: {
      type: Boolean,
      value: false
    },
    swanIdForSystem: {
      type: String,
      value: "123445"
    }
  },
  methods: {
    handleChange(type) {
      this.triggerEvent('change', {
        type: type
      });
    },

    handlePrev() {
      if (this.properties.current > 1) {
        this.handleChange('prev');
      }
    },

    handleNext() {
      if (this.properties.current < this.properties.total) {
        this.handleChange('next');
      }
    }

  }
});