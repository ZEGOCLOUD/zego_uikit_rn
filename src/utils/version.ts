import { getSystemName, getSystemVersion, getBrand, getModel } from 'react-native-device-info';
import ZegoUIKitCorePlugin from '../components/internal/ZegoUIKitCorePlugin';
import { zloginfo } from './logger';
import { packageVersion } from './package';

export const logComponentsVersion = (extraInfo: Map<string, string>) => {
    var expressVersionPromise = require('zego-express-engine-reactnative').default.getVersion()
    var zimVersionPromise = ZegoUIKitCorePlugin.getZIMPlugin().default.getVersion()
    var zpnsVersionPromise = ZegoUIKitCorePlugin.getZPNsPlugin() ? ZegoUIKitCorePlugin.getZPNsPlugin().default.getVersion() : ""
    var callkitVersionPromise = ZegoUIKitCorePlugin.getCallKitPlugin() ? "unknown" : ""

    Promise.all([expressVersionPromise, zimVersionPromise, zpnsVersionPromise, callkitVersionPromise])
    .then(versions => {
      let versionTable = new Map<string, string>(Object.entries({
        'Device': `${getBrand()} ${getModel()}`,
        'OS': `${getSystemName()} ${getSystemVersion()}`,
        'Express': versions[0],
        'ZIM': versions[1],
        'ZPNs': versions[2],
        'CallKit': versions[3],
        'ZegoUIKit': packageVersion()
      }));
      extraInfo.forEach((version, component) => {
        versionTable.set(component, version);
      });

      zloginfo('Components version: ')
      versionTable.forEach((version, component) => {
        zloginfo(`  ${component} => ${version}`);
      });
    })
};
