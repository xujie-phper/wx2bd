/*eslint-disable*/

/*globals Page, getApp, App, wx,Component,getCurrentPages*/
Component({
  externalClasses: ['u-class'],
  properties: {
    key: {
      type: String,
      value: ''
    },
    title: {
      type: String,
      value: ''
    },
    dot: {
      type: Boolean,
      value: false
    },
    count: {
      type: Number,
      value: 0
    },
    swanIdForSystem: {
      type: String,
      value: "123445"
    }
  },
  data: {
    current: false,
    currentColor: '',
    scroll: false
  },
  methods: {
    changeCurrent(current) {
      this.setData({
        current
      });
    },

    changeCurrentColor(currentColor) {
      this.setData({
        currentColor
      });
    },

    changeScroll(scroll) {
      this.setData({
        scroll
      });
    },

    handleClickItem() {
      const parent = getCurrentPages()[getCurrentPages().length - 1].selectComponent('#' + this.data.swanIdForSystem);
      parent.emitEvent(this.data.key);
    }

  }
});