import { NativeModules, Platform } from 'react-native';
import { zloginfo } from './logger';

const { ReportRNModule } = NativeModules;

const ZegoUIKitReport = {
    getVersion: () => {
        if (Platform.OS === 'ios') {
            return;
        }
      
        return ReportRNModule.getVersion()
    },

    create: (appID: number, appSign: string, commonParams: {}) => {
        if (Platform.OS === 'ios') {
            return;
        }
      
        zloginfo('[ZegoUIKitReport][create]')
        ReportRNModule.create(appID.toString(), appSign, commonParams)
    },

    updateCommonParams: (params: {}) => {
        if (Platform.OS === 'ios') {
            return;
        }
      
        zloginfo('[ZegoUIKitReport][updateCommonParams]')
        ReportRNModule.updateCommonParams(params)
    },

    reportEvent: (event: string, params: {}) => {
        if (Platform.OS === 'ios') {
            return;
        }

        zloginfo(`[ZegoUIKitReport][reportEvent] ${event}`)
        ReportRNModule.reportEvent(event, params)
    },
}

export default ZegoUIKitReport;
