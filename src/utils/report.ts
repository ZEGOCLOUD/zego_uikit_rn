import { NativeModules } from 'react-native';
import { zloginfo } from './logger';
import { getPackageVersion } from './package_version';
import { getRnVersion } from './version';

const { ReportRNModule } = NativeModules;

const ZegoUIKitReport = {
    getVersion: () => {
        return ReportRNModule.getVersion()
    },

    create: (appID: number, appSign: string, commonParams: {}) => {
        // @ts-ignore
        commonParams.platform = 'rn'
        // @ts-ignore
        commonParams.platform_version = getRnVersion()
        // @ts-ignore
        commonParams.uikit_version = getPackageVersion()

        zloginfo(`[ZegoUIKitReport][create] appID: ${appID}, commonParams: ${JSON.stringify(commonParams)}`)
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
