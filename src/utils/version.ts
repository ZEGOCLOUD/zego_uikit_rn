import { Platform } from 'react-native';
// @ts-ignore
import {version as ReactNativeVersion} from 'react-native/Libraries/Core/ReactNativeVersion';

import ZegoUIKitCorePlugin from '../components/internal/ZegoUIKitCorePlugin';
import { zloginfo } from './logger';
import { getPackageVersion } from './package_version';
import ZegoUIKitReport from './report';

export const logComponentsVersion = (extraInfo: Map<string, string>) => {
    var expressVersionPromise = require('zego-express-engine-reactnative').default.getVersion()
    var zimVersionPromise = ZegoUIKitCorePlugin.getZIMPlugin() ? ZegoUIKitCorePlugin.getZIMPlugin().default.getVersion() : _getCustomVersionPromise("Not installed");
    var zpnsVersionPromise = ZegoUIKitCorePlugin.getZPNsPlugin() ? ZegoUIKitCorePlugin.getZPNsPlugin().default.getVersion() : _getCustomVersionPromise("Not installed");
    var callkitVersionPromise = _getCustomVersionPromise('Not necessary')
    if (Platform.OS === 'ios') {
      callkitVersionPromise = ZegoUIKitCorePlugin.getCallKitPlugin() ? _getCustomVersionPromise("Unknown version") : _getCustomVersionPromise("Not installed");
    }
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
  const displayVersion =
  [
    ReactNativeVersion.major,
    ReactNativeVersion.minor,
    ReactNativeVersion.patch,
  ].join('.') +
  (ReactNativeVersion.prerelease != null
    ? '-' + ReactNativeVersion.prerelease
    : '');

  return displayVersion
}

const _getCustomVersionPromise = (verDesc: string) => {
  return new Promise<string>((resolve) => {resolve(verDesc);})
}