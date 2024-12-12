import { NativeModules, Platform } from 'react-native';
import { zloginfo } from './logger';

const { ReportRNModule } = NativeModules;

const ZegoUIKitReport = {
    getVersion: () => {
        return ReportRNModule.getVersion()
    },

    create: (appID: number, appSign: string, commonParams: {}) => {
        zloginfo(`[ZegoUIKitReport][create] appID: ${appID}`)
        ReportRNModule.create(appID.toString(), appSign, commonParams)
    },

    updateCommonParams: (params: {}) => {
        zloginfo('[ZegoUIKitReport][updateCommonParams]')
        ReportRNModule.updateCommonParams(params)
    },

    reportEvent: (event: string, params: {}) => {
        zloginfo(`[ZegoUIKitReport][reportEvent] ${event}`)
        ReportRNModule.reportEvent(event, params)
    },
}

export default ZegoUIKitReport;
