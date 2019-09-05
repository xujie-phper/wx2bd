/*eslint-disable*/
// components/button/button.js
Component({
    externalClasses: ['u-class'],
    properties: {
        type: {
            type: String,
            value: ''
        },
        formType: {
            type: String,
            value: ''
        },
        size: {
            type: String,
            value: 'default'
        },
        inline: {
            type: Boolean,
            value: false
        },
        long: {
            type: Boolean,
            value: false
        },
        circle: {
            type: Boolean,
            value: false
        },
        disabled: {
            type: Boolean,
            value: false
        },
        loading: {
            type: Boolean,
            value: false
        },
        openType: String,
        appParameter: String,
        hoverStopPropagation: Boolean,
        hoverStartTime: {
            type: Number,
            value: 20
        },
        hoverStayTime: {
            type: Number,
            value: 70
        },
        sessionFrom: {
            type: String,
            value: ''
        },
        sendMessageTitle: String,
        sendMessagePath: String,
        sendMessageImg: String,
        showMessageCard: Boolean
    },
    methods: {
        handleTap() {
            if (this.disabled) {
                return false;
            }
            this.triggerEvent('click');
        },
        bindgetuserinfo({detail = {}} = {}) {
            this.triggerEvent('getuserinfo', detail);
        },
        bindcontact({detail = {}} = {}) {
            this.triggerEvent('contact', detail);
        },
        bindgetphonenumber({detail = {}} = {}) {
            this.triggerEvent('getphonenumber', detail);
        },
        binderror({detail = {}} = {}) {
            this.triggerEvent('error', detail);
        },
        bindopensetting({detail = {}} = {}) {
            this.triggerEvent('optnsetting', detail);
        },
        bindlaunchapp({detail = {}} = {}) {
            this.triggerEvent('launchapp', detail);
        }
    }
})
