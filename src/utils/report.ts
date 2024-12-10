import { NativeModules, Platform } from 'react-native';
import { zloginfo } from './logger';

const { ReportRNModule } = NativeModules;

const UIKitReport = {
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
      
        zloginfo('[PrebuiltCallReport][create]')
        ReportRNModule.create(appID.toString(), appSign, commonParams)
    },

    reportEvent: (event: string, params: {}) => {
        if (Platform.OS === 'ios') {
            return;
        }

        zloginfo(`[UIKitReport][reportEvent] ${event}`)
        ReportRNModule.reportEvent(event, params)
    },
}

export default UIKitReport;
