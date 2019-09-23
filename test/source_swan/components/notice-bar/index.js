const VALID_MODE = ['closeable'];
const FONT_COLOR = '#f60';
const BG_COLOR = '#fff7cc';
Component({
  externalClasses: ['u-class'],
  properties: {
    closable: {
      type: Boolean,
      value: false
    },
    icon: {
      type: String,
      value: ''
    },
    loop: {
      type: Boolean,
      value: false
    },
    // 背景颜色
    backgroundcolor: {
      type: String,
      value: '#ecf5ff'
    },
    // 字体及图标颜色
    color: {
      type: String,
      value: '#06A7FF'
    },
    // 滚动速度
    speed: {
      type: Number,
      value: 1000
    },
    swanIdForSystem: {
      type: String,
      value: "123445"
    }
  },
  data: {
    show: true,
    wrapWidth: 0,
    width: 0,
    duration: 0,
    animation: null,
    timer: null
  },

  detached() {
    this.destroyTimer();
  },

  ready() {
    if (this.data.loop) {
      this.initAnimation();
    }
  },

  methods: {
    initAnimation() {
      swan.createSelectorQuery().in(this).select('.u-noticebar-content-wrap').boundingClientRect(wrapRect => {
        swan.createSelectorQuery().in(this).select('.u-noticebar-content').boundingClientRect(rect => {
          const duration = rect.width / 40 * this.data.speed;
          const animation = swan.createAnimation({
            duration: duration,
            timingFunction: "linear"
          });
          console.log(animation, 'animation--------');
          this.setData({
            wrapWidth: wrapRect.width,
            width: rect.width,
            duration: duration,
            animation: animation
          }, () => {
            this.startAnimation();
          });
        }).exec();
      }).exec();
    },

    startAnimation() {
      //reset
      if (this.data.animation.duration !== 0) {
        this.data.animation.duration = 0;
        const resetAnimation = this.data.animation.translateX(this.data.wrapWidth).step();
        this.setData({
          animationData: resetAnimation.export()
        });
      }

      this.data.animation.duration = this.data.duration;
      const animationData = this.data.animation.translateX(-this.data.width).step();
      setTimeout(() => {
        this.setData({
          animationData: animationData.export()
        });
      }, 100);
      const timer = setTimeout(() => {
        this.startAnimation();
      }, this.data.duration);
      this.setData({
        timer
      });
    },

    destroyTimer() {
      if (this.data.timer) {
        clearTimeout(this.data.timer);
      }
    },

    handleClose() {
      this.destroyTimer();
      this.setData({
        show: false,
        timer: null
      });
    }

  }
});