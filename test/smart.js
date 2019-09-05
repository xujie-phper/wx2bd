/*eslint-disable*/
/*globals Page,swan,getApp,Component,getCurrentPages*/
let sendLog = require('../../utils/sendLog');

Page({
    data: {
        name: 'swan',
        isTop: false,
        pageIsLoading: true,
        tipsLeft: 0,
        prevScrollTop: 0,
        prevScrollLeft: 0,
        isScrolling: false,
        scrollDistance: 0,
        scrollTimer: '',
        appId: '',
        showBottomLine: false,
        showIndicatorDots: false,
        deleteTipsState: {},
        banners: [{
            activityId: '10086',
            imageUrl: 'https://issuecdn.baidupcs.com/issue/netdisk/ts_ad/help/1565948582.png',
            linkUrl: 'https://pan.baidu.com/union/smartProgram'
        }],
        showDeleteTip: false,
        recentList: [],
        recommendList: [],
        scrollLeft: '0',
        switchDuration: 500,
        autoPlayInterval: 5000,
        switchAutoPlayStatus: true,
        switchIndicateStatus: false
    },
    onLoad: function () {
        this.handleBannerData();
    },
    onShow: function () {
        // Do something when page show.
        let recentList = getApp().globalData.recentList;
        if (recentList) {
            this.setData('recentList', recentList.slice(0, 7));
        }
        let bduss = new Promise((resolve, reject) => {
            swan.getBDUSS({
                success: function (res) {
                    getApp().globalData.bduss = res.bduss;
                    resolve(res.bduss);
                },
                fail: function (err) {
                    console.log('错误码：' + err.errCode);
                    console.log('错误信息：' + err.errMsg);
                    reject(err);
                }
            });
        });
        let sToken = new Promise((resolve, reject) => {
            swan.getStoken({
                tpl: 'netdisk',
                success: function (res) {
                    getApp().globalData.sToken = res.stoken;
                    resolve(res.stoken);
                },
                fail: function (err) {
                    console.log('错误码：' + err.errCode);
                    console.log('错误信息：' + err.errMsg);
                    reject(err);
                }
            });
        });
        Promise.all([bduss, sToken]).then(([bduss, sToken]) => {
            //获取最近列表
            let isAndroid = getApp().globalData.clientType === 'Android';
            let clientType = isAndroid ? 'android' : 'iphone';
            let param = {channel: clientType, clienttype: 1, version: getApp().globalData.version};
            let recentUrl = "https://pan.baidu.com/rest/2.0/xpan/smartprogram?method=recentlist";
            let self = this;
            swan.request({
                url: recentUrl, // 仅为示例，并非真实的接口地址
                method: 'GET',
                dataType: 'json',
                data: param,
                header: {
                    'content-type': 'application/json',
                    'cookie': `BDUSS=${bduss};STOKEN=${sToken}`
                },
                success: function (res) {
                    if (res.data.errno === 0) {
                        self.setData({'pageIsLoading': false, 'recentList': res.data.list.slice(0, 7)});
                        getApp().globalData.recentList = res.data.list;
                    }
                },
                fail: function (err) {
                    console.log('错误码：' + err.errCode);
                    console.log('错误信息：' + err.errMsg);
                }
            });
            //获取推荐列表
            let recommendUrl = 'https://pan.baidu.com/rest/2.0/xpan/smartprogram?method=recommendlist';
            swan.request({
                url: recommendUrl, // 仅为示例，并非真实的接口地址
                method: 'GET',
                dataType: 'json',
                data: param,
                header: {
                    'content-type': 'application/json',
                    'cookie': `BDUSS=${bduss};STOKEN=${sToken}`
                },
                success: function (res) {
                    if (res.data.errno === 0) {
                        self.setData({'recommendList': res.data.list, 'pageIsLoading': false});
                    }
                },
                fail: function (err) {
                    console.log('错误码：' + err.errCode);
                    console.log('错误信息：' + err.errMsg);
                }
            });
        }).catch((err) => {
            throw new Error(err);
        });
    },
    onPageScroll(scrollTop) {
        this.setData('showBottomLine', true);
        let query = swan.createSelectorQuery().in(this);
        let self = this;
        let isScrollUp = this.data.prevScrollTop < scrollTop.scrollTop;
        this.data.prevScrollTop = scrollTop.scrollTop;

        query.select('#recommend-item0').boundingClientRect(function (res) {
            // 这个组件内 #recommend 节点的上边界坐标
            if (isScrollUp && res.top <= 80) {
                self.setData('isTop', true);
            } else if (!isScrollUp && res.top >= 0) {
                self.setData('isTop', false);
            }

        }).exec();
    },
    onShareAppMessage() {
        return {
            // title: '百度网盘小程序广场',
            // content: '世界很复杂，网盘更懂你',
            // path: '/pages/index/index',
        };
    },
    showRecentList(e) {
        let type = e.currentTarget.dataset.type;
        let value = type === 'more' ? type : 'recent';
        sendLog({type: `smartProgram-center-${value}`});
        swan.navigateTo({
            url: '/pages/recent/recent'
        });
    },
    calcScrollLeft(e) {
        this.data.isScrollLeft = this.data.prevScrollLeft > e.detail.scrollLeft;
        this.data.prevScrollLeft = e.detail.scrollLeft;
        this.setData('scrollDistance', e.detail.scrollLeft);
    },

    showDeleteTip(e) {
        let index = e.currentTarget.dataset.level;
        let appId = e.currentTarget.dataset.appId;

        this.setData('deleteTipsState', {[index]: true});
        this.setData('appId', appId);
    },
    navigateToSmartProgram(e) {
        let list = e.currentTarget.dataset.list;
        let type = e.currentTarget.dataset.type;
        let value = type === 'recommend' ? type : 'recent';
        sendLog({type: `smartProgram-center-${value}`, value: list.appkey});

        let appKey = list.appkey;
        let isAndroid = getApp().globalData.clientType === 'Android';
        let clientType = isAndroid ? 'android' : 'iphone';
        let query = `&channel=${clientType}&clienttype=1&version=${getApp().globalData.version}`;
        let self = this;

        //上报到最近
        let reportUrl = 'https://pan.baidu.com/rest/2.0/xpan/smartprogram?method=report' + query;
        swan.request({
            url: reportUrl, // 仅为示例，并非真实的接口地址
            method: 'POST',
            dataType: 'json',
            data: {
                appkey: appKey
            },
            header: {
                'content-type': 'application/json',
                'cookie': `BDUSS=${getApp().globalData.bduss};STOKEN=${getApp().globalData.sToken}`
            },
            success: function (res) {
                if (list.name === '金山文档') {
                    swan.netdisk.pageTransition({action: 'wps'}, () => {
                    }).then(res => {
                    });
                    return;
                }
                swan.navigateToSmartProgram({
                    appKey, // 要打开的小程序 App Key
                    from: '1341009700000000',
                    path: JSON.parse(list.jump_info).square || '',
                    extraData: {
                        foo: ''
                    },
                    success: function (res) {

                    },
                    fail: function (err) {
                        console.log('navigateToSmartProgram fail', err);
                    }
                });
            },
            fail: function (err) {
                console.log('错误码：' + err.errCode);
                console.log('错误信息：' + err.errMsg);
            }
        });
    },
    resetPageState() {
        this.setData('deleteTipsState', {});
    },
    deleteRecore() {
        sendLog({type: 'smartProgram-center-delete'});
        let isAndroid = getApp().globalData.clientType === 'Android';
        let clientType = isAndroid ? 'android' : 'iphone';
        let query = `&channel=${clientType}&clienttype=1&version=${getApp().globalData.version}`;
        let url = 'https://pan.baidu.com/rest/2.0/xpan/smartprogram?method=delrecent' + query;
        let self = this;
        swan.request({
            url, // 仅为示例，并非真实的接口地址
            method: 'POST',
            dataType: 'json',
            data: {
                appid: this.data.appId,
            },
            header: {
                'content-type': 'application/json',
                'cookie': `BDUSS=${getApp().globalData.bduss};STOKEN=${getApp().globalData.sToken}`
            },
            success: function (res) {
                if (res.data.errno === 0) {
                    let appId = self.data.appId;
                    let recentList = getApp().globalData.recentList.filter((item) => {
                        return item.appid !== appId
                    });
                    getApp().globalData.recentList = recentList;
                    self.setData({'recentList': recentList.slice(0, 7)});
                }
            },
            fail: function (err) {
                console.log('错误码：' + err.errCode);
                console.log('错误信息：' + err.errMsg);
            }
        });
    },
    onClickBanner(e) {
        let banner = e.currentTarget.dataset.banner;
        sendLog({type: `smartProgram-center-banner`, value: banner.activityId});
        if (/http/.test(banner.linkUrl)) {
            let params = {action: 'richMedia', link_url: banner.linkUrl};

            swan.netdisk.pageTransition(params, () => {
            }).then(res => {
            })
        } else {
            let swanPath = banner.linkUrl.slice(banner.linkUrl.indexOf('swan/') + 5);
            let index = swanPath.indexOf('/');
            let appKey = swanPath.slice(0, index);
            let path = swanPath.slice(index) || '';
            swan.navigateToSmartProgram({
                appKey, // 要打开的小程序 App Key
                from: '1341009700000000',
                path, // 打开的页面路径，如果为空则打开首页
                extraData: {
                    foo: ''
                },
                success: function (res) {
                    console.log('navigateToSmartProgram success', res);
                },
                fail: function (err) {
                    console.log('navigateToSmartProgram fail', err);
                }
            });
        }
    },
    handleBannerData() {
        let testCallback = (args) => {
            console.log(JSON.parse(args).data[6], 'JSON.parse(args).data[6]');
            if (JSON.parse(args).data[6].length === 0) {
                return;
            }
            let banners = JSON.parse(args).data[6].map((item => {
                return {
                    activityId: item.activityid,
                    imageUrl: item.activity_message.image_url,
                    linkUrl: item.popup_content_url
                }
            }));
            this.setData({banners, switchIndicateStatus: true});
        }

        swan.netdisk.operation({showPosition: [6, 9]}, testCallback)
            .then(res => {
            });
    }
});
