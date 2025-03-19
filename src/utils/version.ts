import { NativeModules, Platform } from 'react-native';
import ZegoUIKitCorePlugin from '../components/internal/ZegoUIKitCorePlugin';
import { zloginfo } from './logger';
import { getPackageVersion } from './package_version';
import ZegoUIKitReport from './report';

export const logComponentsVersion = (extraInfo: Map<string, string>) => {
    var expressVersionPromise = require('zego-express-engine-reactnative').default.getVersion()
    var zimVersionPromise = ZegoUIKitCorePlugin.getZIMPlugin() ? ZegoUIKitCorePlugin.getZIMPlugin().default.getVersion() : ""
    var zpnsVersionPromise = ZegoUIKitCorePlugin.getZPNsPlugin() ? ZegoUIKitCorePlugin.getZPNsPlugin().default.getVersion() : ""
    var callkitVersionPromise = ZegoUIKitCorePlugin.getCallKitPlugin() ? "unknown" : ""
    var reportVersionPromise = ZegoUIKitReport.getVersion()

    Promise.all([expressVersionPromise, zimVersionPromise, zpnsVersionPromise, callkitVersionPromise, reportVersionPromise])
    .then(versions => {
      let versionTable = new Map<string, string>(Object.entries({
        'OS': `${Platform.OS} ${Platform.Version ?? ''}`,
        'RN': getRnVersion(),
        'Express': versions[0],
        'ZIM': versions[1],
        'ZPNs': versions[2],
        'CallKit': versions[3],
        'ZegoUIKit': getPackageVersion(),
        'Report': versions[4]
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

export const getRnVersion = () => {
  let rnVersion = Platform.constants?.reactNativeVersion || {}
  if (!rnVersion) {
    rnVersion = NativeModules.PlatformConstants?.reactNativeVersion || {}
  }

  let displayVersion = 'unknown'
  // @ts-ignore
  if (rnVersion.major !== undefined) { displayVersion = rnVersion.major }
  // @ts-ignore
  if (rnVersion.minor !== undefined) { displayVersion += `.${rnVersion.minor}` }
  // @ts-ignore
  if (rnVersion.patch !== undefined) { displayVersion += `.${rnVersion.patch}` }
  // @ts-ignore
  if (rnVersion.prerelease !== undefined && rnVersion.prerelease !== null) { displayVersion += `.${rnVersion.prerelease}` }

  return displayVersion
}