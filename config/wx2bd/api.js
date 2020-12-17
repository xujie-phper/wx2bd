/**
 * @file wxml convert wx2bd
 */
const tips = '是个二级API，目前swan还不支持，so sad(ノへ￣、)，需要棒棒的你手动兼容下它和它返回值的api哦 ╮（﹀_﹀）╭ ';
/**
 *  action--操作-可选值:tip(提示)、mapping(函数替换)、delete(函数删除)
 *  logLevel--日志级别可选值:info、warning、error
 *  message--日志消息
 *  mapping--替换后的函数名
 */
const defaultConf = {
    action: 'tip',
    logLevel: 'warning',
    mapping: '',
    message: ''
};
const defaultDeleteConf = {
    action: 'delete',
    logLevel: 'error',
    message: '没有相对应的函数'
};
module.exports = {
    ctx: {
        wx: 'swan'
    },
    wx: {
        startRecord: defaultDeleteConf,
        stopRecord: defaultDeleteConf,
        playVoice: defaultDeleteConf,
        pauseVoice: defaultDeleteConf,
        stopVoice: defaultDeleteConf,
        getBackgroundAudioPlayerState: defaultDeleteConf,
        playBackgroundAudio: defaultDeleteConf,
        pauseBackgroundAudio: defaultDeleteConf,
        seekBackgroundAudio: defaultDeleteConf,
        stopBackgroundAudio: defaultDeleteConf,
        onBackgroundAudioPlay: defaultDeleteConf,
        onBackgroundAudioPause: defaultDeleteConf,
        onBackgroundAudioStop: defaultDeleteConf,
        createAudioContext: {
            ...defaultConf,
            message: tips
        },
        createLivePusherContext: {
            ...defaultConf,
            message: tips
        },
        openBluetoothAdapter: defaultDeleteConf,
        closeBluetoothAdapter: defaultDeleteConf,
        getBluetoothAdapterState: defaultDeleteConf,
        onBluetoothAdapterStateChange: defaultDeleteConf,
        startBluetoothDevicesDiscovery: defaultDeleteConf,
        stopBluetoothDevicesDiscovery: defaultDeleteConf,
        getBluetoothDevices: defaultDeleteConf,
        getConnectedBluetoothDevices: defaultDeleteConf,
        onBluetoothDeviceFound: defaultDeleteConf,
        createBLEConnection: defaultDeleteConf,
        closeBLEConnection: defaultDeleteConf,
        getBLEDeviceServices: defaultDeleteConf,
        getBLEDeviceCharacteristics: defaultDeleteConf,
        readBLECharacteristicValue: defaultDeleteConf,
        writeBLECharacteristicValue: defaultDeleteConf,
        notifyBLECharacteristicValueChange: defaultDeleteConf,
        onBLEConnectionStateChange: defaultDeleteConf,
        startBeaconDiscovery: defaultDeleteConf,
        stopBeaconDiscovery: defaultDeleteConf,
        getBeacons: defaultDeleteConf,
        onBeaconUpdate: defaultDeleteConf,
        onBeaconServiceChange: defaultDeleteConf,
        getHCEState: defaultDeleteConf,
        startHCE: defaultDeleteConf,
        stopHCE: defaultDeleteConf,
        onHCEMessage: defaultDeleteConf,
        sendHCEMessage: defaultDeleteConf,
        startWifi: defaultDeleteConf,
        stopWifi: defaultDeleteConf,
        connectWifi: defaultDeleteConf,
        getWifiList: defaultDeleteConf,
        onGetWifiList: defaultDeleteConf,
        setWifiList: defaultDeleteConf,
        onWifiConnected: defaultDeleteConf,
        getConnectedWifi: defaultDeleteConf,
        setTopBarText: defaultDeleteConf,
        createContext: {
            ...defaultConf,
            message: '被废弃的函数，建议使用createCanvasContext替代'
        },
        drawCanvas: {
            ...defaultConf,
            message: '被废弃的函数，建议使用createCanvasContext替代'
        },
        showShareMenu: defaultDeleteConf,
        hideShareMenu: defaultDeleteConf,
        updateShareMenu: defaultDeleteConf,
        getShareInfo: defaultDeleteConf,
        addCard: defaultDeleteConf,
        openCard: defaultDeleteConf,
        getWeRunData: defaultDeleteConf,
        navigateToMiniProgram: {
            action: 'mapping',
            logLevel: 'info',
            mapping: 'navigateToSmartProgram',
            message: '方法被替换为navigateToSmartProgram'
        },
        navigateBackMiniProgram: {
            action: 'mapping',
            logLevel: 'info',
            mapping: 'navigateBackSmartProgram',
            message: '方法被替换为navigateBackSmartProgram'
        },
        checkIsSupportSoterAuthentication: defaultDeleteConf,
        startSoterAuthentication: defaultDeleteConf,
        checkIsSoterEnrolledInDevice: defaultDeleteConf,
        faceVerifyForPay: defaultDeleteConf,
        requestPayment: {
            action: 'tip',
            logLevel: 'error',
            message: '存在diff的函数，百度小程序中需使用requestPolymerPayment替代 \n      相关文档：https://smartprogram.baidu.com/docs/develop/api/open_payment/'
        },
        login: {
            ...defaultConf,
            message: '微信登录接口code换取openid和session_key 在百度小程序中为code换取access_token \n      相关文档：https://smartapp.baidu.com/docs/develop/api/open_log/#Session-Key/'
        }
    }
};
