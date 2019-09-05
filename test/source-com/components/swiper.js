// union-design-wechat/swipe-out/index.js
Component({
  externalClasses: ['u-class'],
  properties: {
    actions: {
      value: [],
      type: Array,
      observer: '_updateMoveSize'
    },
    closable: {
      type: Boolean,
      value: true
    },
    toggle: {
      type: Boolean,
      value: false,
      observer: '_resetPosition'
    },
    operateWidth: {
      type: Number,
      value: 160
    },
    swanId: {
      type: String
    }
  },
  options: {
    // 在组件定义时的选项中启用多slot支持
    multipleSlots: true
  },
  data: {
    start: {
      pageX: 0,
      pageY: 0
    },
    position: {
      pageX: 0,
      pageY: 0
    },
    limitSpace: 0 // 能够往左滑动的距离(px)

  },

  attached() {
    this._updateMoveSize();
  },

  methods: {
    _updateMoveSize() {
      let {
        actions,
        operateWidth
      } = this.data;
      let limitSpace = 0;

      if (actions.length) {
        actions.forEach(item => {
          limitSpace += item.width;
        });
      } else {
        limitSpace = operateWidth;
      }

      this.setData({
        limitSpace
      });
    },

    catchHandler() {},

    // 此方法是阻止菜单点击事件冒泡到 touchstart,touchmove,touchend
    handleButtonTap(e) {
      if (this.data.closable) {
        this._resetPosition();
      }

      this.triggerEvent('click', {
        index: e.currentTarget.dataset.index
      });
    },

    handleCustomTap() {
      if (this.data.closable) {
        this._resetPosition();
      }
    },

    _resetPosition() {
      this.setData({
        position: {
          pageX: 0,
          pageY: 0
        }
      });
    },

    handleTouchStart(e) {
      let touches = e.touches ? e.touches[0] : {};
      let start = this.data.start;

      if (touches) {
        for (let i in start) {
          start[i] = touches[i];
        }
      }
    },

    handleTouchMove(e) {
      let touches = e.touches ? e.touches[0] : {};
      let start = this.data.start;

      if (touches) {
        const direction = this.setSwiperDirection(start.pageX, touches.pageX, start.pageY, touches.pageY);

        if (direction === 'left') {
          this.swiper(touches);
        }
      }
    },

    handleTouchEnd(e) {
      let touches = e.changedTouches ? e.changedTouches[0] : {};
      let {
        start,
        limitSpace
      } = this.data;

      if (touches) {
        const direction = this.setSwiperDirection(start.pageX, touches.pageX, start.pageY, touches.pageY);
        let position = {
          pageX: touches.pageX - start.pageX,
          pageY: touches.pageY - start.pageY
        };

        if (Math.abs(position.pageX) >= 40 && direction === 'left') {
          position.pageX = -limitSpace;
        } else {
          position.pageX = 0;
        }

        this.setData({
          position
        });
      }
    },

    isExpand() {
      let {
        position,
        limitSpace
      } = this.data;

      if (Math.abs(position.pageX) > limitSpace) {
        return true;
      }

      return false;
    },

    setSwiperDirection(x1, x2, y1, y2) {
      return Math.abs(y1 - y2) ? x1 - x2 > 0 ? 'left' : 'right' : y1 - y2 > 0 ? 'up' : 'down';
    },

    swiper(touches) {
      let {
        start,
        limitSpace
      } = this.data;
      let position = {
        pageX: touches.pageX - start.pageX,
        pageY: touches.pageY - start.pageY
      };

      if (limitSpace < Math.abs(position.pageX)) {
        // 当超过左移的最大距离则固定宽度
        position.pageX = -limitSpace;
      }

      this.setData({
        position
      });
    }

  }
});