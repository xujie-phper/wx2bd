/*eslint-disable*/

/*globals Page, getApp, App, wx,Component,getCurrentPages*/
Component({
  externalClasses: ['u-class'],

  attached() {
    console.log(target, 'linked');
    this.changeCurrent();
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
    },
    swanIdForSystem: {
      type: String,
      value: "123445"
    }
  },
  methods: {
    changeCurrent(val = this.data.current) {
      swan.test('123');
      let items = getCurrentPages()[getCurrentPages().length - 1].selectAllComponents('.' + this.data.swanIdForSystem);
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
      this.triggerEvent('change', {
        key
      });
    }

  }
});